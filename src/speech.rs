use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::sync::mpsc::{Receiver, Sender};
use std::time::Duration;
use std::thread;
use tungstenite::{accept, Message};
use windows::{
    core::Result as WinResult,
    Devices::Enumeration::DeviceInformation,
    Media::Devices::MediaDevice,
    Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED},
};

const HTTP_PORT: u16 = 18888;
const WS_PORT:   u16 = 19999;

const HTML_TEMPLATE: &str = r#"<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body><script>
(function connect() {
    var ws = new WebSocket('ws://127.0.0.1:__WS_PORT__');
    ws.onopen = function() { start(ws); };
    ws.onclose = ws.onerror = function() { setTimeout(connect, 1500); };
})();
function start(ws) {
    var r = new webkitSpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = '__LANG__';
    r.onresult = function(e) {
        var res = e.results[e.resultIndex];
        if (ws.readyState !== 1) return;
        ws.send(JSON.stringify({type: res.isFinal ? 'final' : 'interim', text: res[0].transcript}));
    };
    r.onerror = function(e) {
        if (ws.readyState === 1) ws.send(JSON.stringify({type: 'error', text: e.error}));
    };
    r.onend = function() {
        if (ws.readyState === 1) setTimeout(function() { r.start(); }, 200);
    };
    r.start();
    ws.send(JSON.stringify({type: 'ready', text: 'ok'}));
}
</script></body></html>"#;

pub enum Command {
    Start(String, Option<String>), // (lang_tag, audio_device_id)
    Stop,
}

pub enum SpeechEvent {
    Languages(Vec<(String, String)>),
    AudioInputs(Vec<(String, String)>),
    Hypothesis(String),
    Final(String),
    Started,
    Stopped,
    State(SpeechRecognizerState),
    Error(String),
}

#[derive(Clone, Copy, PartialEq)]
pub enum SpeechRecognizerState {
    Idle,
    Capturing,
    SpeechDetected,
}

pub fn run_thread(rx: Receiver<Command>, _self_tx: Sender<Command>, tx: Sender<SpeechEvent>) {
    unsafe { let _ = CoInitializeEx(None, COINIT_MULTITHREADED); }

    tx.send(SpeechEvent::Languages(available_languages())).ok();
    match available_audio_inputs() {
        Ok(inputs) => { tx.send(SpeechEvent::AudioInputs(inputs)).ok(); }
        Err(_) => {}
    }

    // HTML の内容（Start のたびに言語が書き換わる）
    let html_state: Arc<Mutex<String>> = Arc::new(Mutex::new(String::new()));

    // 認識中に転送先となる Sender（Stop 時は None に戻す）
    let active_tx: Arc<Mutex<Option<Sender<SpeechEvent>>>> = Arc::new(Mutex::new(None));

    // HTTP サーバー（プログラム終了まで常駐）
    {
        let hs = html_state.clone();
        thread::spawn(move || http_server(hs));
    }

    // WebSocket サーバー（プログラム終了まで常駐）
    {
        let at = active_tx.clone();
        thread::spawn(move || ws_server(at));
    }

    let mut chrome: Option<std::process::Child> = None;
    let mut saved_audio: Option<String> = None;

    while let Ok(cmd) = rx.recv() {
        match cmd {
            Command::Start(lang_tag, audio_device_id) => {
                // 先に転送を止めてから旧 Chrome を kill（"aborted" エラーが届かないようにする）
                *active_tx.lock().unwrap() = None;
                if let Some(mut c) = chrome.take() {
                    c.kill().ok();
                    c.wait().ok();
                }
                // 前回変更したデフォルトデバイスを復元
                if let Some(ref orig) = saved_audio.take() {
                    crate::audio_device::set_default_capture_endpoint_id(orig);
                }

                // デフォルトキャプチャデバイスを切り替え
                saved_audio = switch_audio_device(audio_device_id.as_deref());

                // HTML を新しい言語で更新
                *html_state.lock().unwrap() = make_html(&lang_tag);

                // WebSocket → SpeechEvent 転送を有効化
                *active_tx.lock().unwrap() = Some(tx.clone());

                thread::sleep(Duration::from_millis(200));

                match launch_chrome() {
                    Ok(proc) => {
                        eprintln!("[speech] Chrome started for {lang_tag}");
                        chrome = Some(proc);
                        tx.send(SpeechEvent::Started).ok();
                    }
                    Err(e) => {
                        *active_tx.lock().unwrap() = None;
                        tx.send(SpeechEvent::Error(e)).ok();
                    }
                }
            }
            Command::Stop => {
                if let Some(mut c) = chrome.take() {
                    c.kill().ok();
                    c.wait().ok();
                }
                if let Some(ref orig) = saved_audio.take() {
                    crate::audio_device::set_default_capture_endpoint_id(orig);
                }
                *active_tx.lock().unwrap() = None;
                tx.send(SpeechEvent::Stopped).ok();
                tx.send(SpeechEvent::State(SpeechRecognizerState::Idle)).ok();
            }
        }
    }

    // プロセス終了時クリーンアップ
    if let Some(mut c) = chrome.take() { c.kill().ok(); }
    if let Some(ref orig) = saved_audio.take() {
        crate::audio_device::set_default_capture_endpoint_id(orig);
    }
}

fn make_html(lang: &str) -> String {
    HTML_TEMPLATE
        .replace("__WS_PORT__", &WS_PORT.to_string())
        .replace("__LANG__", lang)
}

fn http_server(html_state: Arc<Mutex<String>>) {
    let listener = match TcpListener::bind(("127.0.0.1", HTTP_PORT)) {
        Ok(l) => l,
        Err(e) => { eprintln!("[http] bind failed: {e}"); return; }
    };
    for stream in listener.incoming() {
        let mut s = match stream { Ok(s) => s, Err(_) => continue };
        let html = html_state.lock().unwrap().clone();
        let mut buf = [0u8; 2048];
        s.read(&mut buf).ok();
        let req = String::from_utf8_lossy(&buf);
        if req.contains("favicon") {
            s.write_all(b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n").ok();
        } else {
            let _ = write!(s,
                "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                html.len()
            );
            s.write_all(html.as_bytes()).ok();
        }
    }
}

fn ws_server(active_tx: Arc<Mutex<Option<Sender<SpeechEvent>>>>) {
    let listener = match TcpListener::bind(("127.0.0.1", WS_PORT)) {
        Ok(l) => l,
        Err(e) => { eprintln!("[ws] bind failed: {e}"); return; }
    };
    for stream in listener.incoming() {
        let stream = match stream { Ok(s) => s, Err(_) => continue };
        let at = active_tx.clone();
        thread::spawn(move || {
            let mut ws = match accept(stream) { Ok(w) => w, Err(_) => return };
            loop {
                match ws.read() {
                    Ok(Message::Text(t)) => {
                        if let Some(sender) = at.lock().unwrap().as_ref() {
                            dispatch(sender, t.as_str());
                        }
                    }
                    Ok(Message::Close(_)) | Err(_) => break,
                    _ => {}
                }
            }
        });
    }
}

fn dispatch(tx: &Sender<SpeechEvent>, msg: &str) {
    let kind = extract_json_str(msg, "type").unwrap_or_default();
    let text = extract_json_str(msg, "text").unwrap_or_default();
    match kind.as_str() {
        "ready" => {
            tx.send(SpeechEvent::State(SpeechRecognizerState::Capturing)).ok();
        }
        "interim" => {
            tx.send(SpeechEvent::Hypothesis(text)).ok();
            tx.send(SpeechEvent::State(SpeechRecognizerState::SpeechDetected)).ok();
        }
        "final" => {
            tx.send(SpeechEvent::Final(text)).ok();
            tx.send(SpeechEvent::State(SpeechRecognizerState::Capturing)).ok();
        }
        "error" => {
            // "aborted" と "no-speech" は JS が自動再起動するため無視する。
            // それ以外（"network", "not-allowed" 等）は致命的なので通知する。
            if text != "aborted" && text != "no-speech" {
                tx.send(SpeechEvent::Error(text)).ok();
            }
        }
        _ => {}
    }
}

fn launch_chrome() -> Result<std::process::Child, String> {
    let browser = find_browser()
        .ok_or_else(|| "Chrome/Edge/Vivaldi が見つかりません。Chromeをインストールしてください。".to_string())?;

    std::process::Command::new(&browser)
        .args([
            format!("--app=http://127.0.0.1:{HTTP_PORT}/"),
            "--headless=new".to_string(),
            "--use-fake-ui-for-media-stream".to_string(),
            "--disable-renderer-backgrounding".to_string(),
            "--disable-backgrounding-occluded-windows".to_string(),
            "--no-first-run".to_string(),
            "--no-default-browser-check".to_string(),
            "--disable-extensions".to_string(),
        ])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .map_err(|e| format!("Chrome 起動失敗: {e}"))
}

fn find_browser() -> Option<PathBuf> {
    let fixed = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ];
    for p in &fixed {
        let path = std::path::Path::new(p);
        if path.exists() { return Some(path.to_path_buf()); }
    }
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let v = PathBuf::from(local).join("Vivaldi").join("Application").join("vivaldi.exe");
        if v.exists() { return Some(v); }
    }
    None
}

fn switch_audio_device(audio_device_id: Option<&str>) -> Option<String> {
    let winrt_id = audio_device_id?;
    if winrt_id.is_empty() { return None; }
    let ep_id = crate::audio_device::winrt_id_to_endpoint_id(winrt_id)?;
    let saved = crate::audio_device::get_default_capture_endpoint_id();
    if crate::audio_device::set_default_capture_endpoint_id(&ep_id) {
        eprintln!("[speech] default capture → {ep_id}");
        saved
    } else {
        eprintln!("[speech] capture device switch failed");
        None
    }
}

fn available_languages() -> Vec<(String, String)> {
    vec![
        ("ja-JP".to_string(), "日本語".to_string()),
        ("en-US".to_string(), "English (US)".to_string()),
        ("en-GB".to_string(), "English (UK)".to_string()),
        ("zh-CN".to_string(), "中文 (简体)".to_string()),
        ("zh-TW".to_string(), "中文 (繁體)".to_string()),
        ("ko-KR".to_string(), "한국어".to_string()),
        ("fr-FR".to_string(), "Français".to_string()),
        ("de-DE".to_string(), "Deutsch".to_string()),
        ("es-ES".to_string(), "Español".to_string()),
    ]
}

fn available_audio_inputs() -> WinResult<Vec<(String, String)>> {
    let selector = MediaDevice::GetAudioCaptureSelector()?;
    let collection = DeviceInformation::FindAllAsyncAqsFilter(&selector)?.get()?;
    let count = collection.Size()?;
    let mut result = Vec::with_capacity(count as usize + 1);
    result.push((String::new(), "デフォルト".to_string()));
    for i in 0..count {
        let info = collection.GetAt(i)?;
        result.push((info.Id()?.to_string(), info.Name()?.to_string()));
    }
    Ok(result)
}

fn extract_json_str(json: &str, key: &str) -> Option<String> {
    let needle = format!("\"{}\":\"", key);
    let start = json.find(&needle)? + needle.len();
    let rest = &json[start..];
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}

#![allow(unsafe_op_in_unsafe_fn)]

mod audio_device;
mod config;
mod osc;
mod speech;
mod tts;
mod ui;

pub const VOICEVOX_DEFAULT_PATH: &str =
    r"C:\Program Files\VOICEVOX\vv-engine\run.exe";

fn launch_voicevox(path: &str) -> Option<std::process::Child> {
    let p = std::path::Path::new(path);
    if !p.exists() { return None; }
    eprintln!("[voicevox] starting: {}", path);
    std::process::Command::new(p)
        .args(["--host", "0.0.0.0", "--port", "50021"])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .ok()
}

fn main() {
    let cfg = config::load();
    let vv_path = cfg.voicevox_path.clone();

    let mut voicevox_proc = launch_voicevox(&vv_path);
    if voicevox_proc.is_some() {
        std::thread::sleep(std::time::Duration::from_millis(1500));
    }

    let (cmd_tx, cmd_rx) = std::sync::mpsc::channel();
    let (event_tx, event_rx) = std::sync::mpsc::channel();

    // Chrome プロセスを main と speech スレッドで共有（eframe 終了後に main から確実に kill）
    let chrome_holder: speech::ChromeHolder = std::sync::Arc::new(std::sync::Mutex::new(None));
    let chrome_for_speech = chrome_holder.clone();

    let cmd_tx_speech = cmd_tx.clone();
    std::thread::spawn(move || speech::run_thread(cmd_rx, cmd_tx_speech, event_tx, chrome_for_speech));

    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("音声入力")
            .with_inner_size([440.0, 560.0])
            .with_resizable(false)
            .with_always_on_top(),
        ..Default::default()
    };

    eframe::run_native(
        "音声入力",
        options,
        Box::new(|cc| Ok(Box::new(ui::App::new(cc, cmd_tx, event_rx, cfg)))),
    )
    .expect("eframe の起動に失敗しました");

    // eframe 終了後、Chrome が残っていれば確実に kill（on_exit で止まらなかった場合の保険）
    if let Some(mut chrome) = chrome_holder.lock().unwrap().take() {
        let pid = chrome.id();
        let _ = std::process::Command::new("taskkill")
            .args(["/F", "/T", "/PID", &pid.to_string()])
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status();
        chrome.kill().ok();
        chrome.wait().ok();
    }

    // アプリ終了後に VoiceVox エンジンを停止
    if let Some(mut proc) = voicevox_proc.take() {
        let pid = proc.id();
        let _ = std::process::Command::new("taskkill")
            .args(["/F", "/T", "/PID", &pid.to_string()])
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status();
        proc.kill().ok();
        proc.wait().ok();
    }
}
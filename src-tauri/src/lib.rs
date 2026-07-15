mod audio_device;
mod config;
mod ipc;
mod osc;
mod speech;
mod tts;

pub use config::SuffixConfig;

use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::Manager;

pub struct AppState {
    pub speech: Arc<Mutex<speech::SpeechState>>,
}

struct VvProc(Mutex<Option<std::process::Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(AppState {
            speech: Arc::new(Mutex::new(speech::SpeechState::default())),
        })
        .manage(VvProc(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::get_audio_devices,
            commands::get_state,
            commands::start_recognition,
            commands::stop_recognition,
            commands::on_speech_result,
            commands::confirm_text,
            commands::reset_chatbox,
            commands::load_tts_speakers,
            commands::update_settings,
            commands::load_config,
            commands::find_voicevox_path,
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            // 設定を読み込んで状態に適用
            let cfg = config::load_from_path(&config::config_path(&handle));
            {
                let state = handle.state::<AppState>();
                let mut s = state.speech.lock().unwrap();
                s.apply_config(&cfg);
            }

            // VOICEVOX と TTS スピーカー読み込みをバックグラウンドで実行
            let h2 = handle.clone();
            let vv_path = cfg.voicevox_path.clone();
            std::thread::spawn(move || {
                // VOICEVOX 起動
                if let Some(proc) = launch_voicevox(&vv_path) {
                    let vv = h2.state::<VvProc>();
                    *vv.0.lock().unwrap() = Some(proc);
                    std::thread::sleep(Duration::from_millis(1500));
                }
                // スピーカー一覧取得
                let speakers = tts::fetch_speakers();
                if !speakers.is_empty() {
                    let state = h2.state::<AppState>();
                    let mut s = state.speech.lock().unwrap();
                    if s.tts_speaker_sel == usize::MAX || s.tts_speaker_sel >= speakers.len() {
                        s.tts_speaker_sel = 0;
                    }
                    s.tts_speakers = speakers;
                    ipc::broadcast_state(&h2, &s);
                }
            });

            // IPC サーバー起動
            ipc::start_server(handle);
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            // VOICEVOX 停止
            let vv = app_handle.state::<VvProc>();
            if let Some(mut proc) = vv.0.lock().unwrap().take() {
                let pid = proc.id();
                let _ = std::process::Command::new("taskkill")
                    .args(["/F", "/T", "/PID", &pid.to_string()])
                    .stdout(std::process::Stdio::null())
                    .stderr(std::process::Stdio::null())
                    .status();
                proc.kill().ok();
                proc.wait().ok();
            }
            // オーディオデバイス復元 & 設定保存
            let state = app_handle.state::<AppState>();
            let mut s = state.speech.lock().unwrap();
            if let Some(orig) = s.saved_audio.take() {
                audio_device::set_default_capture_endpoint_id(&orig);
            }
            let cfg = s.to_config();
            config::save(&cfg, &config::config_path(app_handle));
        }
    });
}

fn launch_voicevox(path: &str) -> Option<std::process::Child> {
    let p = std::path::Path::new(path);
    if !p.exists() { return None; }
    std::process::Command::new(p)
        .args(["--host", "0.0.0.0", "--port", "50021"])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .ok()
}

mod commands {
    use super::*;
    use tauri::AppHandle;

    #[tauri::command]
    pub fn get_audio_devices() -> Vec<(String, String)> {
        audio_device::list_capture_devices().unwrap_or_default()
    }

    #[tauri::command]
    pub fn get_state(state: tauri::State<AppState>) -> speech::SpeechState {
        state.speech.lock().unwrap().clone()
    }

    #[tauri::command]
    pub fn start_recognition(
        device_id: Option<String>,
        state: tauri::State<AppState>,
        app: AppHandle,
    ) {
        let saved = speech::switch_audio_device(device_id.as_deref());
        let mut s = state.speech.lock().unwrap();
        s.saved_audio = saved;
        s.is_running = true;
        s.last_error = None;
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn stop_recognition(state: tauri::State<AppState>, app: AppHandle) {
        let mut s = state.speech.lock().unwrap();
        if let Some(orig) = s.saved_audio.take() {
            audio_device::set_default_capture_endpoint_id(&orig);
        }
        s.is_running = false;
        s.rec_state = speech::RecState::Idle;
        s.hypothesis.clear();
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn on_speech_result(
        r#type: String,
        text: String,
        state: tauri::State<AppState>,
        app: AppHandle,
    ) {
        let mut s = state.speech.lock().unwrap();
        match r#type.as_str() {
            "ready" => {
                s.rec_state = speech::RecState::Capturing;
            }
            "interim" => {
                s.hypothesis = text;
                s.rec_state = speech::RecState::SpeechDetected;
            }
            "final" => {
                s.hypothesis.clear();
                s.rec_state = speech::RecState::Capturing;
                if s.auto_mode {
                    let full_text = format!("{}。", text);
                    let built = s.build_send_text(full_text);
                    if s.chatbox_enabled {
                        osc::send_chatbox(&built);
                    }
                    s.vrc_text = built;
                    s.check_reset_threshold();
                    if s.tts_enabled && !text.is_empty() {
                        let devices = s.tts_devices_selected();
                        let style_id = s.effective_style_id();
                        let emotion = tts::EmotionParams::default();
                        if !devices.is_empty() {
                            ipc::broadcast_state(&app, &s);
                            drop(s);
                            tts::speak(&text, style_id, &devices, emotion);
                            return;
                        }
                    }
                } else {
                    let pending = s.pending.get_or_insert_with(String::new);
                    if !pending.is_empty() { pending.push(' '); }
                    pending.push_str(&text);
                }
            }
            "error" => {
                s.last_error = Some(text);
                s.is_running = false;
            }
            _ => {}
        }
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn confirm_text(
        text: String,
        suffix_idx: usize,
        state: tauri::State<AppState>,
        app: AppHandle,
    ) {
        let (tts_text, style_id, devices, emotion, tts_enabled) = {
            let mut s = state.speech.lock().unwrap();
            let suffix_cfg = s.suffix_configs.get(suffix_idx).cloned()
                .unwrap_or_else(config::SuffixConfig::default);
            let new_part = format!("{}{}", text, suffix_cfg.suffix);
            let full = s.build_send_text(new_part);
            if s.chatbox_enabled {
                osc::send_chatbox(&full);
            }
            s.vrc_text = full;
            s.pending = None;
            s.check_reset_threshold();
            let devices = s.tts_devices_selected();
            let style_id = s.effective_style_id();
            let emotion = suffix_cfg.emotion();
            let tts_enabled = s.tts_enabled;
            ipc::broadcast_state(&app, &s);
            (text, style_id, devices, emotion, tts_enabled)
        };
        if tts_enabled && !tts_text.is_empty() && !devices.is_empty() {
            tts::speak(&tts_text, style_id, &devices, emotion);
        }
    }

    #[tauri::command]
    pub fn reset_chatbox(state: tauri::State<AppState>, app: AppHandle) {
        let mut s = state.speech.lock().unwrap();
        osc::send_chatbox("");
        s.vrc_text.clear();
        s.vrc_will_reset = false;
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn load_tts_speakers(state: tauri::State<AppState>, app: AppHandle) {
        let speakers = tts::fetch_speakers();
        let mut s = state.speech.lock().unwrap();
        if !speakers.is_empty()
            && (s.tts_speaker_sel == usize::MAX || s.tts_speaker_sel >= speakers.len())
        {
            s.tts_speaker_sel = 0;
        }
        s.tts_speakers = speakers;
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn update_settings(
        cfg: config::AppConfig,
        state: tauri::State<AppState>,
        app: AppHandle,
    ) {
        let mut s = state.speech.lock().unwrap();
        s.apply_config(&cfg);
        config::save(&cfg, &config::config_path(&app));
        ipc::broadcast_state(&app, &s);
    }

    #[tauri::command]
    pub fn load_config(app: AppHandle) -> config::AppConfig {
        config::load_from_path(&config::config_path(&app))
    }

    #[tauri::command]
    pub fn find_voicevox_path() -> String {
        config::find_voicevox_path()
    }
}

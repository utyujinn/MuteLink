use serde::{Deserialize, Serialize};
use crate::ui::SuffixConfig;

const CONFIG_FILE: &str = "sttv_settings.json";

fn config_path() -> std::path::PathBuf {
    let mut p = std::env::current_exe().unwrap_or_default();
    p.pop();
    p.push(CONFIG_FILE);
    p
}

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    pub voicevox_path:      String,
    pub concat_mode:        bool,
    pub concat_limit:       usize,
    pub auto_mode:          bool,
    pub tts_enabled:        bool,
    pub chatbox_enabled:    bool,
    pub tts_speaker_sel:    usize,
    pub tts_style_sel:      usize,
    pub tts_device_indices: Vec<bool>,
    pub suffix_configs:     Option<Vec<SuffixConfig>>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            voicevox_path:      crate::VOICEVOX_DEFAULT_PATH.to_string(),
            concat_mode:        false,
            concat_limit:       50,
            auto_mode:          false,
            tts_enabled:        true,
            chatbox_enabled:    true,
            // usize::MAX = 未設定（App::new で小夜を自動選択）
            tts_speaker_sel:    usize::MAX,
            tts_style_sel:      0,
            // 空 vec = 未設定（App::new で CABLE Input を自動選択）
            tts_device_indices: vec![],
            suffix_configs:     None,
        }
    }
}

/// よくあるインストール先から run.exe を探し、見つかったパスを返す。見つからなければ空文字。
pub fn find_voicevox_path() -> String {
    let mut candidates = vec![
        crate::VOICEVOX_DEFAULT_PATH.to_string(),
    ];
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        candidates.push(format!(r"{}\Programs\VOICEVOX\vv-engine\run.exe", local));
        candidates.push(format!(r"{}\VOICEVOX\vv-engine\run.exe", local));
    }
    if let Ok(appdata) = std::env::var("APPDATA") {
        candidates.push(format!(r"{}\VOICEVOX\vv-engine\run.exe", appdata));
    }
    for path in candidates {
        if std::path::Path::new(&path).exists() {
            return path;
        }
    }
    String::new()
}

pub fn load() -> AppConfig {
    if let Ok(text) = std::fs::read_to_string(config_path()) {
        if let Ok(cfg) = serde_json::from_str::<AppConfig>(&text) {
            return cfg;
        }
    }
    let mut cfg = AppConfig::default();
    // 旧形式 sttv_config.txt があればパスだけ引き継ぐ
    let mut old_path = std::env::current_exe().unwrap_or_default();
    old_path.pop();
    old_path.push("sttv_config.txt");
    if let Ok(s) = std::fs::read_to_string(&old_path) {
        let trimmed = s.trim().to_string();
        if !trimmed.is_empty() {
            cfg.voicevox_path = trimmed;
            return cfg;
        }
    }
    // 自動検出
    cfg.voicevox_path = find_voicevox_path();
    cfg
}

pub fn save(cfg: &AppConfig) {
    if let Ok(json) = serde_json::to_string_pretty(cfg) {
        std::fs::write(config_path(), json).ok();
    }
}

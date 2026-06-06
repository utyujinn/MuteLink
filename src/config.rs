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
            concat_mode:        true,
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

pub fn load() -> AppConfig {
    if let Ok(text) = std::fs::read_to_string(config_path()) {
        if let Ok(cfg) = serde_json::from_str::<AppConfig>(&text) {
            return cfg;
        }
    }
    // 旧形式 sttv_config.txt があれば VoiceVox パスだけ引き継ぐ
    let mut cfg = AppConfig::default();
    let mut old_path = std::env::current_exe().unwrap_or_default();
    old_path.pop();
    old_path.push("sttv_config.txt");
    if let Ok(s) = std::fs::read_to_string(old_path) {
        let trimmed = s.trim().to_string();
        if !trimmed.is_empty() { cfg.voicevox_path = trimmed; }
    }
    cfg
}

pub fn save(cfg: &AppConfig) {
    if let Ok(json) = serde_json::to_string_pretty(cfg) {
        std::fs::write(config_path(), json).ok();
    }
}

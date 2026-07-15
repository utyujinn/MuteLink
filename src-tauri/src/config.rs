use serde::{Deserialize, Serialize};
use tauri::Manager;

const CONFIG_FILE: &str = "mutelink_settings.json";

pub fn config_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path().app_config_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
        .join(CONFIG_FILE)
}


#[derive(Clone, Serialize, Deserialize)]
pub struct SuffixConfig {
    pub label:      String,
    pub suffix:     String,
    pub speed:      f64,
    pub pitch:      f64,
    pub intonation: f64,
    pub volume:     f64,
}

impl SuffixConfig {
    pub fn emotion(&self) -> crate::tts::EmotionParams {
        crate::tts::EmotionParams {
            speed: self.speed,
            pitch: self.pitch,
            intonation: self.intonation,
            volume: self.volume,
        }
    }
}

impl Default for SuffixConfig {
    fn default() -> Self {
        Self {
            label: "。".into(), suffix: "。".into(),
            speed: 1.0, pitch: 0.0, intonation: 1.0, volume: 1.0,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
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
            voicevox_path:      find_voicevox_path(),
            concat_mode:        false,
            concat_limit:       50,
            auto_mode:          false,
            tts_enabled:        true,
            chatbox_enabled:    true,
            tts_speaker_sel:    usize::MAX,
            tts_style_sel:      0,
            tts_device_indices: vec![],
            suffix_configs:     None,
        }
    }
}

pub fn find_voicevox_path() -> String {
    let mut candidates = vec![
        r"C:\Program Files\VOICEVOX\vv-engine\run.exe".to_string(),
    ];
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        candidates.push(format!(r"{}\Programs\VOICEVOX\vv-engine\run.exe", local));
        candidates.push(format!(r"{}\VOICEVOX\vv-engine\run.exe", local));
    }
    if let Ok(appdata) = std::env::var("APPDATA") {
        candidates.push(format!(r"{}\VOICEVOX\vv-engine\run.exe", appdata));
    }
    for path in candidates {
        if std::path::Path::new(&path).exists() { return path; }
    }
    String::new()
}

pub fn load_from_path(path: &std::path::Path) -> AppConfig {
    if let Ok(text) = std::fs::read_to_string(path) {
        if let Ok(cfg) = serde_json::from_str::<AppConfig>(&text) {
            return cfg;
        }
    }
    AppConfig::default()
}

pub fn save(cfg: &AppConfig, path: &std::path::Path) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).ok();
    }
    if let Ok(json) = serde_json::to_string_pretty(cfg) {
        std::fs::write(path, json).ok();
    }
}

pub fn default_suffix_configs() -> Vec<SuffixConfig> {
    vec![
        SuffixConfig { label: "。".into(),   suffix: "。".into(),   speed: 1.0,  pitch:  0.0,   intonation: 1.0, volume: 1.0  },
        SuffixConfig { label: "！".into(),   suffix: "！".into(),   speed: 1.2,  pitch:  0.05,  intonation: 1.5, volume: 1.1  },
        SuffixConfig { label: "？".into(),   suffix: "？".into(),   speed: 0.95, pitch:  0.05,  intonation: 1.3, volume: 1.0  },
        SuffixConfig { label: "qwq".into(),  suffix: "qwq".into(),  speed: 0.85, pitch: -0.05,  intonation: 0.8, volume: 0.9  },
        SuffixConfig { label: "xwx".into(),  suffix: "xwx".into(),  speed: 0.9,  pitch: -0.03,  intonation: 0.9, volume: 0.9  },
        SuffixConfig { label: "owo".into(),  suffix: "owo".into(),  speed: 1.1,  pitch:  0.07,  intonation: 1.4, volume: 1.0  },
        SuffixConfig { label: "..o○".into(), suffix: "..o○".into(), speed: 0.85, pitch:  0.02,  intonation: 0.7, volume: 0.8  },
        SuffixConfig { label: "..//".into(), suffix: "..//".into(), speed: 1.0,  pitch:  0.03,  intonation: 1.1, volume: 0.85 },
        SuffixConfig { label: "><".into(),   suffix: "><".into(),   speed: 1.1,  pitch:  0.05,  intonation: 1.2, volume: 0.9  },
        SuffixConfig { label: "www".into(),  suffix: "www".into(),  speed: 1.15, pitch:  0.05,  intonation: 1.5, volume: 1.1  },
        SuffixConfig { label: "zzz".into(),  suffix: "zzz".into(),  speed: 0.75, pitch: -0.07,  intonation: 0.5, volume: 0.7  },
        SuffixConfig { label: "~".into(),    suffix: "~".into(),    speed: 0.9,  pitch:  0.03,  intonation: 1.2, volume: 1.0  },
    ]
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SuffixConfig {
    pub label:      String,
    pub suffix:     String,
    pub speed:      f64,
    pub pitch:      f64,
    pub intonation: f64,
    pub volume:     f64,
}

impl SuffixConfig {
    pub fn new(label: &str, suffix: &str, speed: f64, pitch: f64, intonation: f64, volume: f64) -> Self {
        Self { label: label.into(), suffix: suffix.into(), speed, pitch, intonation, volume }
    }

    pub fn emotion(&self) -> crate::tts::EmotionParams {
        crate::tts::EmotionParams {
            speed: self.speed,
            pitch: self.pitch,
            intonation: self.intonation,
            volume: self.volume,
        }
    }
}

pub fn default_suffix_configs() -> Vec<SuffixConfig> {
    vec![
        SuffixConfig::new("。",   "。",   1.0,   0.0,   1.0,  1.0 ),
        SuffixConfig::new("！",   "！",   1.2,   0.05,  1.5,  1.1 ),
        SuffixConfig::new("？",   "？",   0.95,  0.05,  1.3,  1.0 ),
        SuffixConfig::new("qwq",  "qwq",  0.85, -0.05,  0.8,  0.9 ),
        SuffixConfig::new("xwx",  "xwx",  0.9,  -0.03,  0.9,  0.9 ),
        SuffixConfig::new("owo",  "owo",  1.1,   0.07,  1.4,  1.0 ),
        SuffixConfig::new("..o○", "..o○", 0.85,  0.02,  0.7,  0.8 ),
        SuffixConfig::new("..//", "..//", 1.0,   0.03,  1.1,  0.85),
        SuffixConfig::new("><",   "><",   1.1,   0.05,  1.2,  0.9 ),
        SuffixConfig::new("www",  "www",  1.15,  0.05,  1.5,  1.1 ),
        SuffixConfig::new("zzz",  "zzz",  0.75, -0.07,  0.5,  0.7 ),
        SuffixConfig::new("~",    "~",    0.9,   0.03,  1.2,  1.0 ),
    ]
}

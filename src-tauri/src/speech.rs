use serde::Serialize;
use crate::config::{AppConfig, SuffixConfig, default_suffix_configs};
use crate::tts;

#[derive(Clone, Copy, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum RecState { Idle, Capturing, SpeechDetected }

#[derive(Clone, Serialize)]
pub struct SpeechState {
    pub is_running:         bool,
    pub rec_state:          RecState,
    pub hypothesis:         String,
    pub pending:            Option<String>,
    pub vrc_text:           String,
    pub vrc_will_reset:     bool,
    pub auto_mode:          bool,
    pub concat_mode:        bool,
    pub concat_limit:       usize,
    pub chatbox_enabled:    bool,
    pub tts_enabled:        bool,
    pub tts_speaker_sel:    usize,
    pub tts_style_sel:      usize,
    pub tts_speakers:       Vec<tts::VoiceSpeaker>,
    pub tts_devices:        Vec<String>,
    pub tts_device_indices: Vec<bool>,
    pub suffix_configs:     Vec<SuffixConfig>,
    pub voicevox_path:      String,
    pub last_error:         Option<String>,
    #[serde(skip)]
    pub saved_audio:        Option<String>,
}

impl Default for SpeechState {
    fn default() -> Self {
        let tts_devices = tts::list_devices().unwrap_or_default();
        let n = 16.max(tts_devices.len());
        let mut tts_device_indices = vec![false; n];
        let cable_idx = tts::find_cable_input_index();
        if cable_idx < n { tts_device_indices[cable_idx] = true; }
        Self {
            is_running:         false,
            rec_state:          RecState::Idle,
            hypothesis:         String::new(),
            pending:            None,
            vrc_text:           String::new(),
            vrc_will_reset:     false,
            auto_mode:          false,
            concat_mode:        false,
            concat_limit:       50,
            chatbox_enabled:    true,
            tts_enabled:        true,
            tts_speaker_sel:    usize::MAX,
            tts_style_sel:      0,
            tts_speakers:       Vec::new(),
            tts_devices,
            tts_device_indices,
            suffix_configs:     default_suffix_configs(),
            voicevox_path:      crate::config::find_voicevox_path(),
            last_error:         None,
            saved_audio:        None,
        }
    }
}

impl SpeechState {
    pub fn apply_config(&mut self, cfg: &AppConfig) {
        self.auto_mode        = cfg.auto_mode;
        self.concat_mode      = cfg.concat_mode;
        self.concat_limit     = cfg.concat_limit;
        self.tts_enabled      = cfg.tts_enabled;
        self.chatbox_enabled  = cfg.chatbox_enabled;
        self.tts_speaker_sel  = cfg.tts_speaker_sel;
        self.tts_style_sel    = cfg.tts_style_sel;
        self.voicevox_path    = cfg.voicevox_path.clone();
        let n = self.tts_device_indices.len();
        for (i, &v) in cfg.tts_device_indices.iter().enumerate() {
            if i < n { self.tts_device_indices[i] = v; }
        }
        if let Some(ref cfgs) = cfg.suffix_configs {
            self.suffix_configs = cfgs.clone();
        }
    }

    pub fn to_config(&self) -> AppConfig {
        AppConfig {
            voicevox_path:      self.voicevox_path.clone(),
            concat_mode:        self.concat_mode,
            concat_limit:       self.concat_limit,
            auto_mode:          self.auto_mode,
            tts_enabled:        self.tts_enabled,
            chatbox_enabled:    self.chatbox_enabled,
            tts_speaker_sel:    self.tts_speaker_sel,
            tts_style_sel:      self.tts_style_sel,
            tts_device_indices: self.tts_device_indices.clone(),
            suffix_configs:     Some(self.suffix_configs.clone()),
        }
    }

    pub fn effective_style_id(&self) -> i32 {
        if let Some(spk) = self.tts_speakers.get(self.tts_speaker_sel) {
            if let Some(st) = spk.styles.get(self.tts_style_sel) {
                return st.id;
            }
        }
        46
    }

    pub fn tts_devices_selected(&self) -> Vec<usize> {
        self.tts_device_indices.iter()
            .enumerate()
            .filter_map(|(i, &s)| if s { Some(i) } else { None })
            .collect()
    }

    pub fn build_send_text(&mut self, new_part: String) -> String {
        if self.concat_mode && !self.vrc_text.is_empty() && !self.vrc_will_reset {
            format!("{}{}", self.vrc_text, new_part)
        } else {
            self.vrc_will_reset = false;
            new_part
        }
    }

    pub fn check_reset_threshold(&mut self) {
        self.vrc_will_reset = self.concat_mode
            && self.vrc_text.chars().count() >= self.concat_limit;
    }
}

pub fn switch_audio_device(device_id: Option<&str>) -> Option<String> {
    let id = device_id?;
    if id.is_empty() { return None; }
    crate::audio_device::switch_capture_device(id)
}

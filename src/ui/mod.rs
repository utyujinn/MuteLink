mod setup;
mod suffix;
mod render;

pub use suffix::SuffixConfig;

use std::sync::mpsc::{Receiver, Sender};
use crate::speech::{Command, SpeechEvent, SpeechRecognizerState};
use setup::setup_fonts;
use suffix::default_suffix_configs;

pub struct App {
    pub(crate) cmd_tx: Sender<Command>,
    pub(crate) event_rx: Receiver<SpeechEvent>,
    pub(crate) languages: Vec<(String, String)>,
    pub(crate) selected_lang_idx: usize,
    pub(crate) audio_devices: Vec<(String, String)>,
    pub(crate) selected_audio_idx: usize,
    pub(crate) is_running: bool,
    pub(crate) rec_state: Option<SpeechRecognizerState>,
    pub(crate) auto_mode: bool,
    pub(crate) concat_mode: bool,
    pub(crate) concat_limit: usize,
    pub(crate) vrc_will_reset: bool,
    pub(crate) tts_enabled: bool,
    pub(crate) tts_speaker_idx: usize,
    pub(crate) tts_speakers: Vec<crate::tts::VoiceSpeaker>,
    pub(crate) tts_speaker_sel: usize,
    pub(crate) tts_style_sel: usize,
    pub(crate) tts_device_indices: Vec<bool>,
    pub(crate) tts_devices: Vec<String>,
    pub(crate) pending: Option<String>,
    pub(crate) vrc_text: String,
    pub(crate) hypothesis: String,
    pub(crate) error: Option<String>,
    pub(crate) voicevox_path: String,
    pub(crate) suffix_configs: Vec<SuffixConfig>,
    pub(crate) show_suffix_editor: bool,
    pub(crate) chatbox_enabled: bool,
}

impl App {
    pub fn new(
        cc: &eframe::CreationContext,
        cmd_tx: Sender<Command>,
        event_rx: Receiver<SpeechEvent>,
        cfg: crate::config::AppConfig,
    ) -> Self {
        setup_fonts(&cc.egui_ctx);

        let tts_devices = crate::tts::list_devices().unwrap_or_default();
        let tts_device_indices = {
            let saved = cfg.tts_device_indices;
            let mut indices = vec![false; 16.max(tts_devices.len())];
            if saved.is_empty() {
                // 初回起動: CABLE Input (VB-Audio) を自動選択
                let cable_idx = crate::tts::find_cable_input_index();
                if cable_idx < indices.len() { indices[cable_idx] = true; }
            } else {
                for (i, &v) in saved.iter().enumerate() {
                    if i < indices.len() { indices[i] = v; }
                }
            }
            indices
        };

        let suffix_configs = cfg.suffix_configs.unwrap_or_else(default_suffix_configs);

        let tts_speakers = crate::tts::fetch_speakers();

        // usize::MAX = 未設定（初回起動）→ 小夜（style ID 46）を自動選択
        let is_auto_speaker = cfg.tts_speaker_sel >= tts_speakers.len();
        let tts_speaker_sel = if !is_auto_speaker {
            cfg.tts_speaker_sel
        } else if let Some(idx) = tts_speakers.iter().position(|spk| spk.styles.iter().any(|st| st.id == 46)) {
            idx
        } else {
            0
        };
        let tts_style_sel = if is_auto_speaker {
            // 小夜のスタイル一覧内で ID 46 の位置を探す
            tts_speakers.get(tts_speaker_sel)
                .and_then(|spk| spk.styles.iter().position(|st| st.id == 46))
                .unwrap_or(0)
        } else {
            tts_speakers.get(tts_speaker_sel)
                .map(|spk| cfg.tts_style_sel.min(spk.styles.len().saturating_sub(1)))
                .unwrap_or(0)
        };

        Self {
            cmd_tx,
            event_rx,
            languages: Vec::new(),
            selected_lang_idx: 0,
            audio_devices: Vec::new(),
            selected_audio_idx: 0,
            is_running: false,
            rec_state: None,
            auto_mode:       cfg.auto_mode,
            concat_mode:     cfg.concat_mode,
            concat_limit:    cfg.concat_limit,
            vrc_will_reset:  false,
            tts_enabled:     cfg.tts_enabled,
            tts_speaker_idx: 46,
            tts_speakers,
            tts_speaker_sel,
            tts_style_sel,
            tts_devices,
            tts_device_indices,
            pending: None,
            vrc_text: String::new(),
            hypothesis: String::new(),
            error: None,
            voicevox_path:   cfg.voicevox_path,
            suffix_configs,
            show_suffix_editor: false,
            chatbox_enabled: cfg.chatbox_enabled,
        }
    }

    pub(crate) fn effective_style_id(&self) -> i32 {
        if let Some(speaker) = self.tts_speakers.get(self.tts_speaker_sel) {
            if let Some(style) = speaker.styles.get(self.tts_style_sel) {
                return style.id;
            }
        }
        self.tts_speaker_idx as i32
    }

    pub(crate) fn tts_devices_selected(&self) -> Vec<usize> {
        self.tts_device_indices.iter()
            .enumerate()
            .filter_map(|(i, &s)| if s { Some(i) } else { None })
            .collect()
    }

    pub(crate) fn confirm(&mut self, cfg_idx: usize) {
        let cfg = self.suffix_configs[cfg_idx].clone();
        if let Some(text) = self.pending.take() {
            let new_part = format!("{}{}", text, cfg.suffix);
            let full = self.build_send_text(new_part.clone());
            if self.chatbox_enabled { crate::osc::send_chatbox(&full); }
            self.vrc_text = full;
            if self.tts_enabled && !text.is_empty() {
                let devices = self.tts_devices_selected();
                if !devices.is_empty() {
                    crate::tts::speak(&text, self.effective_style_id(), &devices, cfg.emotion());
                }
            }
            self.check_reset_threshold();
        }
    }

    pub(crate) fn build_send_text(&mut self, new_part: String) -> String {
        if self.concat_mode && !self.vrc_text.is_empty() && !self.vrc_will_reset {
            format!("{}{}", self.vrc_text, new_part)
        } else {
            self.vrc_will_reset = false;
            new_part
        }
    }

    pub(crate) fn check_reset_threshold(&mut self) {
        self.vrc_will_reset = self.concat_mode
            && self.vrc_text.chars().count() >= self.concat_limit;
    }
}

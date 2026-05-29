use std::sync::mpsc::{Receiver, Sender};
use crate::speech::{Command, SpeechEvent, SpeechRecognizerState};

fn save_voicevox_path_file(path: &str) {
    use std::io::Write as _;
    let mut p = std::env::current_exe().unwrap_or_default();
    p.pop();
    p.push("sttv_config.txt");
    if let Ok(mut f) = std::fs::File::create(p) {
        f.write_all(path.as_bytes()).ok();
    }
}

fn setup_fonts(ctx: &egui::Context) {
    let mut fonts = egui::FontDefinitions::default();

    let ja_candidates = [
        r"C:\Windows\Fonts\YuGothR.ttf",
        r"C:\Windows\Fonts\YuGothM.ttf",
        r"C:\Windows\Fonts\meiryo.ttc",
        r"C:\Windows\Fonts\msgothic.ttc",
    ];
    if let Some(data) = ja_candidates.iter().find_map(|p| std::fs::read(p).ok()) {
        fonts.font_data.insert("japanese".into(), egui::FontData::from_owned(data));
        fonts.families.entry(egui::FontFamily::Proportional).or_default().insert(0, "japanese".into());
        fonts.families.entry(egui::FontFamily::Monospace).or_default().push("japanese".into());
    }

    for path in &[
        r"C:\Windows\Fonts\seguisym.ttf",
        r"C:\Windows\Fonts\seguiemj.ttf",
        r"C:\Windows\Fonts\euphemia.ttf",
    ] {
        if let Ok(data) = std::fs::read(path) {
            let name = path.split('\\').last().unwrap_or("sym").to_string();
            fonts.font_data.insert(name.clone(), egui::FontData::from_owned(data));
            fonts.families.entry(egui::FontFamily::Proportional).or_default().push(name);
        }
    }

    ctx.set_fonts(fonts);
}

pub struct App {
    cmd_tx: Sender<Command>,
    event_rx: Receiver<SpeechEvent>,
    languages: Vec<(String, String)>,
    selected_lang_idx: usize,
    audio_devices: Vec<(String, String)>,
    selected_audio_idx: usize,
    is_running: bool,
    rec_state: Option<SpeechRecognizerState>,
    auto_mode: bool,
    concat_mode: bool,
    concat_limit: usize,
    vrc_will_reset: bool,
    tts_enabled: bool,
    tts_speaker_idx: usize,       // fallback: 数値指定
    tts_speakers: Vec<crate::tts::VoiceSpeaker>,
    tts_speaker_sel: usize,       // キャラクター選択
    tts_style_sel: usize,         // スタイル（感情）選択
    tts_device_indices: Vec<bool>,
    tts_devices: Vec<String>,
    pending: Option<String>,
    vrc_text: String,
    hypothesis: String,
    error: Option<String>,
    voicevox_path: String,
    suffix_configs: Vec<SuffixConfig>,
    show_suffix_editor: bool,
}

impl App {
    pub fn new(
        cc: &eframe::CreationContext,
        cmd_tx: Sender<Command>,
        event_rx: Receiver<SpeechEvent>,
        voicevox_path: String,
    ) -> Self {
        setup_fonts(&cc.egui_ctx);
        let mut app = Self {
            cmd_tx,
            event_rx,
            languages: Vec::new(),
            selected_lang_idx: 0,
            audio_devices: Vec::new(),
            selected_audio_idx: 0,
            is_running: false,
            rec_state: None,
            auto_mode: false,
            concat_mode: true,
            concat_limit: 50,
            vrc_will_reset: false,
            tts_enabled: true,
            tts_speaker_idx: 46,
            tts_speakers: crate::tts::fetch_speakers(),
            tts_speaker_sel: 0, // 後で補正
            tts_style_sel: 0,
            tts_devices: crate::tts::list_devices().unwrap_or_default(),
            tts_device_indices: {
                let mut indices = vec![false; 16]; // 最大16デバイス対応
                let cable_idx = crate::tts::find_cable_input_index();
                if cable_idx < indices.len() {
                    indices[cable_idx] = true;
                }
                indices
            },
            pending: None,
            vrc_text: String::new(),
            hypothesis: String::new(),
            error: None,
            voicevox_path,
            suffix_configs: default_suffix_configs(),
            show_suffix_editor: false,
        };
        // 小夜/SAYO (style ID 46) をデフォルト選択
        if let Some(idx) = app.tts_speakers.iter().position(|spk| {
            spk.styles.iter().any(|st| st.id == 46)
        }) {
            app.tts_speaker_sel = idx;
        }
        app
    }

    fn effective_style_id(&self) -> i32 {
        if let Some(speaker) = self.tts_speakers.get(self.tts_speaker_sel) {
            if let Some(style) = speaker.styles.get(self.tts_style_sel) {
                return style.id;
            }
        }
        self.tts_speaker_idx as i32
    }

    fn tts_devices_selected(&self) -> Vec<usize> {
        self.tts_device_indices.iter()
            .enumerate()
            .filter_map(|(i, &s)| if s { Some(i) } else { None })
            .collect()
    }

    fn confirm(&mut self, cfg_idx: usize) {
        let cfg = self.suffix_configs[cfg_idx].clone();
        if let Some(text) = self.pending.take() {
            let new_part = format!("{}{}", text, cfg.suffix);
            let full = self.build_send_text(new_part.clone());
            crate::osc::send_chatbox(&full);
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

    /// 結合モードと vrc_will_reset フラグに従って送信テキストを組み立てる
    fn build_send_text(&mut self, new_part: String) -> String {
        if self.concat_mode && !self.vrc_text.is_empty() && !self.vrc_will_reset {
            format!("{}{}", self.vrc_text, new_part)
        } else {
            self.vrc_will_reset = false;
            new_part
        }
    }

    /// 送信後、次回リセットが必要かどうかを判定してフラグを更新する
    fn check_reset_threshold(&mut self) {
        self.vrc_will_reset = self.concat_mode
            && self.vrc_text.chars().count() >= self.concat_limit;
    }
}

#[derive(Clone)]
pub struct SuffixConfig {
    pub label:  String,
    pub suffix: String,
    pub speed:      f64,
    pub pitch:      f64,
    pub intonation: f64,
    pub volume:     f64,
}

impl SuffixConfig {
    fn new(label: &str, suffix: &str, speed: f64, pitch: f64, intonation: f64, volume: f64) -> Self {
        Self { label: label.into(), suffix: suffix.into(), speed, pitch, intonation, volume }
    }
    fn emotion(&self) -> crate::tts::EmotionParams {
        crate::tts::EmotionParams { speed: self.speed, pitch: self.pitch,
            intonation: self.intonation, volume: self.volume }
    }
}

fn default_suffix_configs() -> Vec<SuffixConfig> {
    vec![
        SuffixConfig::new("。",    "。",    1.0,   0.0,   1.0,  1.0 ),
        SuffixConfig::new("！",    "！",    1.2,   0.05,  1.5,  1.1 ),
        SuffixConfig::new("？",    "？",    0.95,  0.05,  1.3,  1.0 ),
        SuffixConfig::new("qwq",   "qwq",   0.85, -0.05,  0.8,  0.9 ),
        SuffixConfig::new("xwx",   "xwx",   0.9,  -0.03,  0.9,  0.9 ),
        SuffixConfig::new("owo",   "owo",   1.1,   0.07,  1.4,  1.0 ),
        SuffixConfig::new("..o○",  "..o○",  0.85,  0.02,  0.7,  0.8 ),
        SuffixConfig::new("..//",  "..//",  1.0,   0.03,  1.1,  0.85),
        SuffixConfig::new("><",    "><",    1.1,   0.05,  1.2,  0.9 ),
        SuffixConfig::new("www",   "www",   1.15,  0.05,  1.5,  1.1 ),
        SuffixConfig::new("zzz",   "zzz",   0.75, -0.07,  0.5,  0.7 ),
        SuffixConfig::new("~",     "~",     0.9,   0.03,  1.2,  1.0 ),
    ]
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // ── メニューバー ──
        egui::TopBottomPanel::top("menu_bar").show(ctx, |ui| {
            egui::menu::bar(ui, |ui| {
                ui.menu_button("設定", |ui| {
                    ui.checkbox(&mut self.concat_mode, "結合モード（送信を前のテキストに追記）");
                    if self.concat_mode {
                        ui.separator();
                        ui.horizontal(|ui| {
                            ui.label("リセット文字数：");
                            ui.add(egui::DragValue::new(&mut self.concat_limit)
                                .range(10..=144)
                                .speed(1.0));
                        });
                    }
                    ui.separator();
                    ui.checkbox(&mut self.tts_enabled, "TTS（送信時に自動読み上げ）");
                    if self.tts_enabled {
                        ui.separator();

                        // スピーカー・スタイル（感情）選択
                        if self.tts_speakers.is_empty() {
                            ui.horizontal(|ui| {
                                ui.label("スピーカー ID（手動）：");
                                ui.add(egui::DragValue::new(&mut self.tts_speaker_idx)
                                    .range(0..=200).speed(1.0));
                            });
                            if ui.button("スピーカー読み込み").clicked() {
                                self.tts_speakers = crate::tts::fetch_speakers();
                                self.tts_speaker_sel = 0;
                                self.tts_style_sel = 0;
                            }
                        } else {
                            // キャラクター選択
                            ui.label("キャラクター：");
                            let spk_name = self.tts_speakers
                                .get(self.tts_speaker_sel)
                                .map(|s| s.name.as_str())
                                .unwrap_or("");
                            egui::ComboBox::from_id_salt("tts_speaker")
                                .selected_text(spk_name)
                                .show_ui(ui, |ui| {
                                    for (i, spk) in self.tts_speakers.iter().enumerate() {
                                        if ui.selectable_label(self.tts_speaker_sel == i, &spk.name).clicked() {
                                            self.tts_speaker_sel = i;
                                            self.tts_style_sel = 0;
                                        }
                                    }
                                });

                            // スタイル（感情）選択
                            if let Some(spk) = self.tts_speakers.get(self.tts_speaker_sel) {
                                if !spk.styles.is_empty() {
                                    ui.label("スタイル（感情）：");
                                    let style_name = spk.styles
                                        .get(self.tts_style_sel)
                                        .map(|s| s.name.as_str())
                                        .unwrap_or("");
                                    egui::ComboBox::from_id_salt("tts_style")
                                        .selected_text(style_name)
                                        .show_ui(ui, |ui| {
                                            for (i, st) in spk.styles.iter().enumerate() {
                                                let label = format!("{} (ID:{})", st.name, st.id);
                                                if ui.selectable_label(self.tts_style_sel == i, &label).clicked() {
                                                    self.tts_style_sel = i;
                                                }
                                            }
                                        });
                                }
                            }
                            if ui.small_button("再読み込み").clicked() {
                                self.tts_speakers = crate::tts::fetch_speakers();
                                self.tts_speaker_sel = 0;
                                self.tts_style_sel = 0;
                            }
                        }

                        ui.separator();
                        ui.label("出力デバイス（複数選択可）：");
                        if !self.tts_devices.is_empty() {
                            ui.vertical(|ui| {
                                for (i, name) in self.tts_devices.iter().enumerate() {
                                    if i < self.tts_device_indices.len() {
                                        ui.checkbox(&mut self.tts_device_indices[i], name);
                                    }
                                }
                            });
                        } else {
                            ui.label("デバイスが見つかりません");
                        }
                    }
                    ui.separator();
                    ui.label("VoiceVox エンジンパス：");
                    let path_resp = ui.add(
                        egui::TextEdit::singleline(&mut self.voicevox_path)
                            .desired_width(360.0)
                    );
                    if path_resp.lost_focus() {
                        save_voicevox_path_file(&self.voicevox_path);
                    }
                });
                if ui.menu_button("語尾", |_ui| {}).response.clicked() {
                    self.show_suffix_editor = !self.show_suffix_editor;
                }
                ui.menu_button("アプリ", |ui| {
                    if ui.button("終了").clicked() {
                        ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                    }
                });
            });
        });

        // Drain speech events
        while let Ok(event) = self.event_rx.try_recv() {
            match event {
                SpeechEvent::Languages(langs) => {
                    if let Some(idx) = langs.iter().position(|(tag, _)| tag.starts_with("ja")) {
                        self.selected_lang_idx = idx;
                    }
                    self.languages = langs;
                }
                SpeechEvent::AudioInputs(devs) => { self.audio_devices = devs; }
                SpeechEvent::Hypothesis(text) => {
                    self.error = None;
                    self.hypothesis = text;
                }
                SpeechEvent::Final(text) => {
                    self.error = None;
                    self.hypothesis.clear();
                    if self.auto_mode {
                        let text_with_period = format!("{}。", text);
                        let full = self.build_send_text(text_with_period.clone());
                        crate::osc::send_chatbox(&full);
                        self.vrc_text = full;
                        if self.tts_enabled && !text.is_empty() {
                            let devices = self.tts_devices_selected();
                            if !devices.is_empty() {
                                crate::tts::speak(&text, self.effective_style_id(), &devices,
                                    crate::tts::EmotionParams::default());
                            }
                        }
                        self.check_reset_threshold();
                    } else {
                        let pending = self.pending.get_or_insert_with(String::new);
                        if !pending.is_empty() { pending.push(' '); }
                        pending.push_str(&text);
                    }
                }
                SpeechEvent::Started => {
                    self.is_running = true;
                    self.error = None;
                }
                SpeechEvent::Stopped => {
                    self.is_running = false;
                    self.rec_state = None;
                    self.hypothesis.clear();
                }
                SpeechEvent::State(s) => { self.rec_state = Some(s); }
                SpeechEvent::Error(e) => {
                    self.error = Some(e);
                    self.is_running = false;
                }
            }
        }

        ctx.request_repaint_after(std::time::Duration::from_millis(50));

        // 言語/デバイス変更検出のため、パネル描画前にキャプチャ
        let prev_lang_idx  = self.selected_lang_idx;
        let prev_audio_idx = self.selected_audio_idx;

        let mut confirm_idx: Option<usize> = None;
        let mut do_clear      = false;
        let mut do_start_stop = false;
        let mut do_toggle_auto = false;
        let mut do_reset      = false;

        let has_pending  = self.pending.is_some();
        let is_running   = self.is_running;
        let auto_mode    = self.auto_mode;
        let btn_h = 44.0;
        let pending_h = 84.0; // 4行 × 17px + padding 16px
        let vrc_h    = 100.0; // 4行 × 17px + header 16px + padding 24px

        // ── Central panel: 上から順に全て配置 ──
        egui::CentralPanel::default().show(ctx, |ui| {
            // 1. Language + Microphone selectors （一番上）
            ui.horizontal(|ui| {
                ui.label("言語：");
                if self.languages.is_empty() {
                    ui.label("読み込み中...");
                } else {
                    let selected_name = self.languages
                        .get(self.selected_lang_idx)
                        .map(|(_, n)| n.as_str())
                        .unwrap_or("");
                    egui::ComboBox::from_id_salt("lang_select")
                        .selected_text(selected_name)
                        .show_ui(ui, |ui| {
                            for (i, (_, name)) in self.languages.iter().enumerate() {
                                ui.selectable_value(&mut self.selected_lang_idx, i, name);
                            }
                        });
                }

                ui.separator();
                ui.label("マイク：");
                if self.audio_devices.is_empty() {
                    ui.label("読み込み中...");
                } else {
                    let selected_mic = self.audio_devices
                        .get(self.selected_audio_idx)
                        .map(|(_, n)| n.as_str())
                        .unwrap_or("");
                    egui::ComboBox::from_id_salt("audio_select")
                        .selected_text(selected_mic)
                        .show_ui(ui, |ui| {
                            for (i, (_, name)) in self.audio_devices.iter().enumerate() {
                                ui.selectable_value(&mut self.selected_audio_idx, i, name);
                            }
                        });
                }
            });

            ui.separator();

            // 2. Status indicator + error（同じ行に並べる）
            ui.horizontal(|ui| {
                let (dot_color, state_label) = match self.rec_state {
                    Some(SpeechRecognizerState::Capturing)      => (egui::Color32::from_rgb(80, 200, 80), "聴取中"),
                    Some(SpeechRecognizerState::SpeechDetected) => (egui::Color32::from_rgb(255, 200, 0), "発話中"),
                    _                                           => (egui::Color32::DARK_GRAY,              ""),
                };
                let (dot_rect, _) = ui.allocate_exact_size(egui::vec2(10.0, 10.0), egui::Sense::hover());
                ui.painter().circle_filled(dot_rect.center(), 5.0, dot_color);
                ui.label(state_label);
                if let Some(err) = &self.error {
                    ui.add_space(6.0);
                    ui.colored_label(egui::Color32::from_rgb(255, 100, 100), format!("エラー: {}", err));
                }
            });

            ui.separator();

            // ── hypothesis + セパレータを隙間ゼロの隔離空間に包む ──
            ui.with_layout(egui::Layout::top_down(egui::Align::LEFT), |ui| {
                ui.spacing_mut().item_spacing.y = 0.0;

                // 3. Hypothesis display
                let hyp_h = 63.0;
                let avail_w = ui.available_width();
                let (hyp_rect, _) = ui.allocate_exact_size(
                    egui::vec2(avail_w, hyp_h),
                    egui::Sense::hover(),
                );
                ui.painter().rect_filled(hyp_rect, 4.0, egui::Color32::from_rgb(20, 20, 35));

                let hyp_inner = hyp_rect.shrink2(egui::vec2(6.0, 3.0));
                ui.allocate_new_ui(egui::UiBuilder::new().max_rect(hyp_inner), |ui| {
                    egui::ScrollArea::vertical()
                        .id_salt("hypothesis_scroll")
                        .auto_shrink([false, false])
                        .stick_to_bottom(true)
                        .show(ui, |ui| {
                            ui.spacing_mut().item_spacing.y = 2.0;
                            ui.set_min_width(hyp_inner.width());
                            if !self.hypothesis.is_empty() {
                                ui.colored_label(
                                    egui::Color32::from_rgb(100, 150, 220),
                                    &self.hypothesis
                                );
                            }
                        });
                });

                ui.separator();
            });

            // 4. Pending text area — wrapping, scrollable
            let avail_w = ui.available_width();
            let inner_h = pending_h - 8.0;
            let (rect, _) = ui.allocate_exact_size(
                egui::vec2(avail_w, inner_h),
                egui::Sense::hover(),
            );
            // ホバー判定・クリック判定を raw input で取得（ScrollArea の消費を迂回）
            let pending_hovered = ctx.input(|i| {
                i.pointer.hover_pos().map_or(false, |p| rect.contains(p))
            });
            let pending_clicked = ctx.input(|i| {
                i.pointer.primary_clicked() &&
                i.pointer.interact_pos().map_or(false, |p| rect.contains(p))
            });
            let bg = if pending_hovered {
                egui::Color32::from_rgb(120, 50, 50)
            } else{
                egui::Color32::from_rgb(20, 60, 20)
            };
            ui.painter().rect_filled(rect, 6.0, bg);
            let text_rect = rect.shrink2(egui::vec2(8.0, 4.0));
            ui.allocate_new_ui(egui::UiBuilder::new().max_rect(text_rect), |ui| {
                egui::ScrollArea::vertical()
                    .id_salt("pending_scroll")
                    .auto_shrink([false, false])
                    .stick_to_bottom(true)
                    .show(ui, |ui| {
                        ui.spacing_mut().item_spacing.y = 2.0;
                        ui.set_min_width(text_rect.width());
                        if let Some(ref text) = self.pending {
                            ui.add(egui::Label::new(
                                egui::RichText::new(text.as_str())
                                    .color(egui::Color32::from_rgb(80, 255, 80))
                                    .size(15.0),
                            ).selectable(false));
                        }
                    });
            });

            // クリックでpending クリア
            if pending_clicked && has_pending {
                do_clear = true;
            }

            ui.add_space(2.0);

            // 5. VRC チャットボックス表示エリア
            ui.add_space(2.0);
                let avail_w2 = ui.available_width();
                let inner_vrc_h = vrc_h - 8.0;
                let header_h = 16.0;
                let (vrc_rect, _) = ui.allocate_exact_size(
                    egui::vec2(avail_w2, inner_vrc_h),
                    egui::Sense::hover(),
                );
                // ホバー・クリック判定を raw input で取得（ScrollArea の消費を迂回）
                let vrc_hovered = ctx.input(|i| {
                    i.pointer.hover_pos().map_or(false, |p| vrc_rect.contains(p))
                });
                let vrc_clicked = ctx.input(|i| {
                    i.pointer.primary_clicked() &&
                    i.pointer.interact_pos().map_or(false, |p| vrc_rect.contains(p))
                });
                // ホバー時は常に赤みを帯びた色（will_reset 状態に関わらず統一）
                let vrc_bg = if vrc_hovered {
                    egui::Color32::from_rgb(120, 50, 50)
                } else if self.vrc_will_reset {
                    egui::Color32::from_rgb(55, 28, 8)
                } else {
                    egui::Color32::from_rgb(30, 20, 50)
                };
                ui.painter().rect_filled(vrc_rect, 6.0, vrc_bg);

                let vrc_inner = vrc_rect.shrink2(egui::vec2(8.0, 4.0));

                // ヘッダー行：「VRC ›」ラベル ＋ 文字数カウンター
                let vrc_count = self.vrc_text.chars().count();
                let vrc_count_color = if vrc_count >= 144 {
                    egui::Color32::from_rgb(255, 80, 80)
                } else if self.vrc_will_reset {
                    egui::Color32::from_rgb(255, 160, 60)
                } else if vrc_count >= self.concat_limit {
                    egui::Color32::from_rgb(255, 200, 80)
                } else {
                    egui::Color32::from_gray(160)
                };
                let label_color = if self.vrc_will_reset {
                    egui::Color32::from_rgb(255, 160, 60)
                } else {
                    egui::Color32::from_rgb(160, 100, 255)
                };
                ui.painter().text(
                    vrc_inner.left_top(),
                    egui::Align2::LEFT_TOP,
                    "VRC ›",
                    egui::FontId::proportional(11.0),
                    label_color,
                );
                ui.painter().text(
                    vrc_inner.right_top(),
                    egui::Align2::RIGHT_TOP,
                    format!("{}/144", vrc_count),
                    egui::FontId::proportional(11.0),
                    vrc_count_color,
                );

                // テキスト表示（ヘッダーの下）
                let content_rect = egui::Rect::from_min_size(
                    vrc_inner.min + egui::vec2(0.0, header_h),
                    egui::vec2(vrc_inner.width(), vrc_inner.height() - header_h),
                );
                let text_color = if self.vrc_will_reset {
                    egui::Color32::from_rgb(255, 180, 80)
                } else {
                    egui::Color32::from_rgb(210, 170, 255)
                };
            ui.allocate_new_ui(egui::UiBuilder::new().max_rect(content_rect), |ui| {
                egui::ScrollArea::vertical()
                    .id_salt("vrc_scroll")
                    .auto_shrink([false, false])
                    .stick_to_bottom(true)
                    .show(ui, |ui| {
                        ui.spacing_mut().item_spacing.y = 2.0;
                        ui.set_min_width(content_rect.width());
                        if !self.vrc_text.is_empty() {
                            ui.add(egui::Label::new(
                                egui::RichText::new(&self.vrc_text)
                                    .color(text_color)
                                    .size(15.0),
                            ).selectable(false));
                        }
                    });
            });

                // VRC エリアクリックでリセット
                if vrc_clicked && !self.vrc_text.is_empty() {
                    do_reset = true;
                }

                ui.add_space(6.0);

                let gap = 4.0;
                let btn_w = (ui.available_width() - 2.0 * gap) / 3.0;
                let btn_size = egui::vec2(btn_w, btn_h);

                let mk_text = |s: &str| {
                    egui::RichText::new(s).color(egui::Color32::WHITE).size(14.0)
                };

                egui::Grid::new("confirm_grid")
                    .num_columns(3)
                    .spacing([gap, gap])
                    .show(ui, |ui| {
                        // Rows 1-4: confirm buttons (enabled only when pending exists)
                        let labels: Vec<String> = self.suffix_configs.iter().map(|c| c.label.clone()).collect();
                        for (i, label) in labels.iter().enumerate() {
                            let clicked = ui.add_enabled_ui(has_pending, |ui| {
                                ui.add_sized(
                                    btn_size,
                                    egui::Button::new(mk_text(label))
                                        .fill(egui::Color32::from_rgb(60, 140, 180)),
                                ).clicked()
                            }).inner;
                            if clicked {
                                confirm_idx = Some(i);
                            }
                            if (i + 1) % 3 == 0 {
                                ui.end_row();
                            }
                        }

                        // Row 3: control buttons (3 columns only)
                        // Col 1: 開始/停止
                        let (start_label, start_fill) = if is_running {
                            ("停止", egui::Color32::from_rgb(90, 35, 35))
                        } else {
                            ("開始", egui::Color32::from_rgb(30, 80, 30))
                        };
                        if ui.add_sized(btn_size,
                            egui::Button::new(mk_text(start_label)).fill(start_fill)
                        ).clicked() {
                            do_start_stop = true;
                        }

                        // Col 2: Auto（ON/OFF 切り替え）
                        let auto_fill = if auto_mode {
                            egui::Color32::from_rgb(40, 70, 120)
                        } else {
                            egui::Color32::from_gray(60)
                        };
                        if ui.add_sized(btn_size,
                            egui::Button::new(mk_text("Auto")).fill(auto_fill)
                        ).clicked() {
                            do_toggle_auto = true;
                        }

                        // Col 3: TTS（ON/OFF 切り替え、Auto と完全に同じ色）
                        let tts_fill = if self.tts_enabled {
                            egui::Color32::from_rgb(40, 70, 120)
                        } else {
                            egui::Color32::from_gray(60)
                        };
                        if ui.add_sized(btn_size,
                            egui::Button::new(mk_text("TTS")).fill(tts_fill)
                        ).clicked() {
                            self.tts_enabled = !self.tts_enabled;
                        }

                        ui.end_row();
                    });
            });

        // Apply actions after panel closes
        if let Some(idx) = confirm_idx {
            self.confirm(idx);
        }
        if do_clear       { self.pending = None; }
        if do_start_stop  {
            if self.is_running {
                self.cmd_tx.send(Command::Stop).ok();
            } else if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
                let audio_id = self.audio_devices.get(self.selected_audio_idx)
                    .and_then(|(id, _)| if id.is_empty() { None } else { Some(id.clone()) });
                self.cmd_tx.send(Command::Start(tag.clone(), audio_id)).ok();
            }
        }
        if do_toggle_auto { self.auto_mode = !self.auto_mode; }
        if do_reset {
            crate::osc::send_chatbox("");
            self.vrc_text.clear();
            self.vrc_will_reset = false;
        }

        // ── 語尾編集ウィンドウ ──
        if self.show_suffix_editor {
            egui::Window::new("語尾 設定")
                .open(&mut self.show_suffix_editor)
                .resizable(true)
                .min_width(500.0)
                .show(ctx, |ui| {
                    egui::ScrollArea::vertical().show(ui, |ui| {
                        egui::Grid::new("suffix_edit_grid")
                            .num_columns(7)
                            .spacing([6.0, 4.0])
                            .striped(true)
                            .show(ui, |ui| {
                                // ヘッダー
                                ui.label(egui::RichText::new("ラベル").strong());
                                ui.label(egui::RichText::new("語尾テキスト").strong());
                                ui.label(egui::RichText::new("速さ").strong());
                                ui.label(egui::RichText::new("ピッチ").strong());
                                ui.label(egui::RichText::new("抑揚").strong());
                                ui.label(egui::RichText::new("音量").strong());
                                ui.label(egui::RichText::new("リセット").strong());
                                ui.end_row();

                                let defaults = default_suffix_configs();
                                for (i, cfg) in self.suffix_configs.iter_mut().enumerate() {
                                    ui.add(egui::TextEdit::singleline(&mut cfg.label).desired_width(50.0));
                                    ui.add(egui::TextEdit::singleline(&mut cfg.suffix).desired_width(70.0));
                                    ui.add(egui::DragValue::new(&mut cfg.speed)
                                        .range(0.5f64..=2.0).speed(0.01).fixed_decimals(2));
                                    ui.add(egui::DragValue::new(&mut cfg.pitch)
                                        .range(-0.15f64..=0.15).speed(0.005).fixed_decimals(3));
                                    ui.add(egui::DragValue::new(&mut cfg.intonation)
                                        .range(0.0f64..=2.0).speed(0.01).fixed_decimals(2));
                                    ui.add(egui::DragValue::new(&mut cfg.volume)
                                        .range(0.0f64..=2.0).speed(0.01).fixed_decimals(2));
                                    if ui.small_button("↺").clicked() {
                                        if let Some(d) = defaults.get(i) {
                                            *cfg = d.clone();
                                        }
                                    }
                                    ui.end_row();
                                }
                            });
                    });
                });
        }

        // 言語/デバイス変更で認識を再起動
        let sel_changed = self.selected_lang_idx != prev_lang_idx
            || self.selected_audio_idx != prev_audio_idx;
        if self.is_running && sel_changed {
            if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
                let audio_id = self.audio_devices.get(self.selected_audio_idx)
                    .and_then(|(id, _)| if id.is_empty() { None } else { Some(id.clone()) });
                self.cmd_tx.send(Command::Start(tag.clone(), audio_id)).ok();
            }
        }
    }

    fn on_exit(&mut self, _gl: Option<&eframe::glow::Context>) {
        // ウィンドウ閉じる前に Chrome を停止（taskkill /F /T が走る）
        self.cmd_tx.send(Command::Stop).ok();
        std::thread::sleep(std::time::Duration::from_millis(400));
    }
}

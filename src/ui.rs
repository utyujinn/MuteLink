use std::sync::mpsc::{Receiver, Sender};
use crate::speech::{Command, SpeechEvent, SpeechRecognizerState};
use crate::input;

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
    pending: Option<String>,
    last_external_hwnd: isize,
    our_hwnd: isize,
    hypothesis: String,
    error: Option<String>,
}

impl App {
    pub fn new(
        cc: &eframe::CreationContext,
        cmd_tx: Sender<Command>,
        event_rx: Receiver<SpeechEvent>,
    ) -> Self {
        setup_fonts(&cc.egui_ctx);
        Self {
            cmd_tx,
            event_rx,
            languages: Vec::new(),
            selected_lang_idx: 0,
            audio_devices: Vec::new(),
            selected_audio_idx: 0,
            is_running: false,
            rec_state: None,
            auto_mode: false,
            pending: None,
            last_external_hwnd: 0,
            our_hwnd: 0,
            hypothesis: String::new(),
            error: None,
        }
    }

    fn confirm(&mut self, suffix: &str) {
        if let Some(text) = self.pending.take() {
            let full = format!("{}{}", text, suffix);
            input::send_text_to(self.last_external_hwnd, full);
        }
    }
}

// Rows 1-2: confirm buttons (8 cells = 2 rows × 4)
// Some((label, Some(suffix))) = confirm with suffix
// Some((label, None))         = not used here (Clear is in row 3)
const BUTTONS: [(&str, &str); 8] = [
    (".",    "."),
    ("！",   "！"),
    ("？",   "？"),
    ("><",   "><"),

    ("qwq",  "qwq"),
    ("xwx",  "xwx"),
    ("..o○",  "..o○"),
    ("..//", "..//"),
];

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Capture our own HWND once (used to restore focus after reset_external)
        if self.our_hwnd == 0 && input::foreground_is_ours() {
            self.our_hwnd = input::get_foreground_hwnd();
        }

        // Track last focused external window
        let fg = input::get_foreground_hwnd();
        if !input::foreground_is_ours() && fg != 0 {
            self.last_external_hwnd = fg;
        }

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
                SpeechEvent::Hypothesis(text) => { self.hypothesis = text; }
                SpeechEvent::Final(text) => {
                    self.hypothesis.clear();
                    if self.auto_mode {
                        input::send_text_to(self.last_external_hwnd, text);
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

        // ── Bottom panel ──
        let btn_h = 44.0;
        let pending_h = 150.0; // enough for ~6 wrapped lines
        let grid_h = 3.0 * btn_h + 2.0 * 4.0;
        let panel_h = pending_h + 6.0 + grid_h + 8.0;

        let mut confirm_suffix: Option<String> = None;
        let mut do_clear      = false;
        let mut do_start_stop = false;
        let mut do_toggle_auto = false;
        let mut do_reset      = false;

        let has_pending  = self.pending.is_some();
        let is_running   = self.is_running;
        let auto_mode    = self.auto_mode;

        egui::TopBottomPanel::bottom("confirm_panel")
            .exact_height(panel_h)
            .show(ctx, |ui| {
                ui.add_space(4.0);

                // Pending text area — wrapping, scrollable
                let avail_w = ui.available_width();
                let inner_h = pending_h - 8.0;
                let (rect, _) = ui.allocate_exact_size(
                    egui::vec2(avail_w, inner_h),
                    egui::Sense::hover(),
                );
                let bg = if has_pending {
                    egui::Color32::from_rgb(20, 60, 20)
                } else {
                    egui::Color32::from_gray(28)
                };
                ui.painter().rect_filled(rect, 6.0, bg);
                // Child UI inside the rect for wrapping + scrolling
                let text_rect = rect.shrink2(egui::vec2(8.0, 4.0));
                ui.allocate_new_ui(egui::UiBuilder::new().max_rect(text_rect), |ui| {
                    egui::ScrollArea::vertical()
                        .id_salt("pending_scroll")
                        .auto_shrink([false, false])
                        .stick_to_bottom(true)
                        .show(ui, |ui| {
                            ui.set_min_width(text_rect.width());
                            if let Some(ref text) = self.pending {
                                ui.label(
                                    egui::RichText::new(text.as_str())
                                        .color(egui::Color32::from_rgb(80, 255, 80))
                                        .size(15.0),
                                );
                            }
                        });
                });

                let count = self.pending.as_ref().map(|t| t.chars().count()).unwrap_or(0);
                let count_color = if count >= 144 {
                    egui::Color32::from_rgb(255, 80, 80)
                } else if count >= 120 {
                    egui::Color32::from_rgb(255, 200, 80)
                } else {
                    egui::Color32::from_gray(160)
                };
                ui.painter().text(
                    rect.right_bottom() - egui::vec2(6.0, 4.0),
                    egui::Align2::RIGHT_BOTTOM,
                    format!("{}/144", count),
                    egui::FontId::proportional(11.0),
                    count_color,
                );

                ui.add_space(6.0);

                let gap = 4.0;
                let btn_w = (ui.available_width() - 3.0 * gap) / 4.0;
                let btn_size = egui::vec2(btn_w, btn_h);

                let mk_text = |s: &str| {
                    egui::RichText::new(s).color(egui::Color32::WHITE).size(14.0)
                };

                egui::Grid::new("confirm_grid")
                    .num_columns(4)
                    .spacing([gap, gap])
                    .show(ui, |ui| {
                        // Rows 1-2: confirm buttons (enabled only when pending exists)
                        for (i, (label, suffix)) in BUTTONS.iter().enumerate() {
                            let clicked = ui.add_enabled_ui(has_pending, |ui| {
                                ui.add_sized(
                                    btn_size,
                                    egui::Button::new(mk_text(label))
                                        .fill(egui::Color32::from_gray(60)),
                                ).clicked()
                            }).inner;
                            if clicked {
                                confirm_suffix = Some(suffix.to_string());
                            }
                            if (i + 1) % 4 == 0 {
                                ui.end_row();
                            }
                        }

                        // Row 3: control buttons
                        // 開始/停止
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

                        // Auto
                        let auto_fill = if auto_mode {
                            egui::Color32::from_rgb(30, 60, 110)
                        } else {
                            egui::Color32::from_gray(60)
                        };
                        if ui.add_sized(btn_size,
                            egui::Button::new(mk_text("Auto")).fill(auto_fill)
                        ).clicked() {
                            do_toggle_auto = true;
                        }

                        // Reset
                        if ui.add_sized(btn_size,
                            egui::Button::new(mk_text("Reset"))
                                .fill(egui::Color32::from_gray(60))
                        ).clicked() {
                            do_reset = true;
                        }

                        // Clear (disabled when no pending)
                        if ui.add_enabled_ui(has_pending, |ui| {
                            ui.add_sized(btn_size,
                                egui::Button::new(mk_text("Clear"))
                                    .fill(egui::Color32::from_rgb(90, 35, 35))
                            ).clicked()
                        }).inner {
                            do_clear = true;
                        }

                        ui.end_row();
                    });
            });

        // Apply actions after panel closes
        if let Some(suffix) = confirm_suffix {
            self.confirm(&suffix);
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
        if do_reset       { input::reset_external(self.last_external_hwnd, self.our_hwnd); }

        let prev_lang_idx  = self.selected_lang_idx;
        let prev_audio_idx = self.selected_audio_idx;

        // ── Central panel ──
        egui::CentralPanel::default().show(ctx, |ui| {
            // Language + microphone selectors
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

            ui.add_space(4.0);

            // Status indicator
            ui.horizontal(|ui| {
                let (dot_color, state_label) = match self.rec_state {
                    Some(SpeechRecognizerState::Capturing)      => (egui::Color32::from_rgb(80, 200, 80), "聴取中"),
                    Some(SpeechRecognizerState::SpeechDetected) => (egui::Color32::from_rgb(255, 200, 0), "発話中"),
                    _                                           => (egui::Color32::DARK_GRAY,              ""),
                };
                let (rect, _) = ui.allocate_exact_size(egui::vec2(10.0, 10.0), egui::Sense::hover());
                ui.painter().circle_filled(rect.center(), 5.0, dot_color);
                ui.label(state_label);
            });

            ui.separator();

            if let Some(err) = &self.error {
                ui.colored_label(egui::Color32::RED, format!("エラー: {}", err));
                ui.separator();
            }

            if !self.hypothesis.is_empty() {
                ui.colored_label(egui::Color32::from_rgb(100, 150, 220), &self.hypothesis);
            }
        });

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
}

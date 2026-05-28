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

    // Symbol/emoji fallback for special kaomoji characters
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
    is_running: bool,
    rec_state: Option<SpeechRecognizerState>,
    current_lang_tag: Option<String>,
    auto_mode: bool,
    pending: Option<String>,
    last_external_hwnd: isize,
    hypothesis: String,
    history: Vec<String>,
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
            is_running: false,
            rec_state: None,
            current_lang_tag: None,
            auto_mode: false,
            pending: None,
            last_external_hwnd: 0,
            hypothesis: String::new(),
            history: Vec::new(),
            error: None,
        }
    }

    fn confirm(&mut self, suffix: &str) {
        if let Some(text) = self.pending.take() {
            let full = format!("{}{}", text, suffix);
            input::send_text_to(self.last_external_hwnd, full.clone());
            self.history.push(full);
        }
    }
}

// Button grid: 4 columns × 3 rows = 12 cells
// None = empty cell, Some((label, None)) = Clear, Some((label, Some(suffix))) = confirm
const BUTTONS: [Option<(&str, Option<&str>)>; 12] = [
    Some((".",            Some("."))),
    Some(("！",           Some("！"))),
    Some(("？",           Some("？"))),
    Some(("><",           Some(""))),

    Some(("qwq",          Some("qwq"))),
    Some(("xwx",          Some("xwx"))),
    Some(("( ᐢ. ̫ .ᐢ )", Some("( ᐢ. ̫ .ᐢ )"))),
    Some(("^⸝⸝⋟ˬ⋞⸝⸝^",  Some("^⸝⸝⋟ˬ⋞⸝⸝^"))),

    Some((".o○",          Some(".o○"))),
    None,
    None,
    Some(("Clear",        None)),
];

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Track last focused external window
        let fg = input::get_foreground_hwnd();
        if !input::foreground_is_ours() && fg != 0 {
            self.last_external_hwnd = fg;
        }

        // Drain speech events
        while let Ok(event) = self.event_rx.try_recv() {
            match event {
                SpeechEvent::Languages(langs) => {
                    // Auto-select Japanese if available
                    if let Some(idx) = langs.iter().position(|(tag, _)| tag.starts_with("ja")) {
                        self.selected_lang_idx = idx;
                    }
                    self.languages = langs;
                }
                SpeechEvent::Hypothesis(text) => { self.hypothesis = text; }
                SpeechEvent::Final(text) => {
                    self.hypothesis.clear();
                    if self.auto_mode {
                        input::send_text_to(self.last_external_hwnd, text.clone());
                        self.history.push(text);
                    } else {
                        let pending = self.pending.get_or_insert_with(String::new);
                        if !pending.is_empty() { pending.push(' '); }
                        pending.push_str(&text);
                    }
                }
                SpeechEvent::Started => {
                    self.is_running = true;
                    self.error = None;
                    self.current_lang_tag = self.languages
                        .get(self.selected_lang_idx)
                        .map(|(t, _)| t.clone());
                }
                SpeechEvent::Stopped => {
                    self.is_running = false;
                    self.rec_state = None;
                    self.hypothesis.clear();
                }
                SpeechEvent::SessionEnded => {
                    self.rec_state = None;
                    // Preserve in-progress hypothesis as pending rather than discarding
                    if !self.auto_mode && !self.hypothesis.is_empty() {
                        let h = std::mem::take(&mut self.hypothesis);
                        let p = self.pending.get_or_insert_with(String::new);
                        if !p.is_empty() { p.push(' '); }
                        p.push_str(&h);
                    } else {
                        self.hypothesis.clear();
                    }
                }
                SpeechEvent::State(s) => { self.rec_state = Some(s); }
                SpeechEvent::Error(e) => {
                    self.error = Some(e);
                    self.is_running = false;
                }
            }
        }

        ctx.request_repaint_after(std::time::Duration::from_millis(50));

        // ── Bottom panel (fixed height: pending text + 4×3 button grid) ──
        let btn_h = 44.0;
        let pending_h = 52.0;
        let grid_h = 3.0 * btn_h + 2.0 * 4.0; // 3 rows + 2 gaps
        let panel_h = pending_h + 6.0 + grid_h + 8.0;

        let mut confirm_suffix: Option<String> = None;
        let mut do_clear = false;
        let has_pending = self.pending.is_some();

        egui::TopBottomPanel::bottom("confirm_panel")
            .exact_height(panel_h)
            .show(ctx, |ui| {
                ui.add_space(4.0);

                // Pending text area — always reserves pending_h pixels
                let avail_w = ui.available_width();
                let (rect, _) = ui.allocate_exact_size(
                    egui::vec2(avail_w, pending_h - 8.0),
                    egui::Sense::hover(),
                );
                let bg = if has_pending {
                    egui::Color32::from_rgb(20, 60, 20)
                } else {
                    egui::Color32::from_gray(28)
                };
                ui.painter().rect_filled(rect, 6.0, bg);
                if let Some(ref text) = self.pending {
                    ui.painter().text(
                        rect.left_center() + egui::vec2(8.0, 0.0),
                        egui::Align2::LEFT_CENTER,
                        text.as_str(),
                        egui::FontId::proportional(15.0),
                        egui::Color32::from_rgb(80, 255, 80),
                    );
                }

                ui.add_space(6.0);

                // 4×3 button grid
                let gap = 4.0;
                let btn_w = (ui.available_width() - 3.0 * gap) / 4.0;
                let btn_size = egui::vec2(btn_w, btn_h);

                egui::Grid::new("confirm_grid")
                    .num_columns(4)
                    .spacing([gap, gap])
                    .show(ui, |ui| {
                        for (i, entry) in BUTTONS.iter().enumerate() {
                            match entry {
                                None => {
                                    // Empty cell — invisible, same size as button
                                    ui.add_sized(btn_size, egui::Label::new(""));
                                }
                                Some((label, action)) => {
                                    let fill = if action.is_none() {
                                        egui::Color32::from_rgb(90, 35, 35) // red tint for Clear
                                    } else {
                                        egui::Color32::from_gray(60)
                                    };
                                    let text = egui::RichText::new(*label)
                                        .color(egui::Color32::WHITE)
                                        .size(14.0);
                                    let clicked = ui.add_enabled_ui(has_pending, |ui| {
                                        ui.add_sized(
                                            btn_size,
                                            egui::Button::new(text).fill(fill),
                                        )
                                        .clicked()
                                    })
                                    .inner;
                                    if clicked {
                                        match action {
                                            Some(s) => confirm_suffix = Some(s.to_string()),
                                            None    => do_clear = true,
                                        }
                                    }
                                }
                            }
                            if (i + 1) % 4 == 0 {
                                ui.end_row();
                            }
                        }
                    });
            });

        // Apply button actions (after panel closes to avoid borrow conflict)
        if let Some(suffix) = confirm_suffix {
            self.confirm(&suffix);
        } else if do_clear {
            self.pending = None;
        }

        // ── Central panel ──
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("音声入力");
            ui.separator();

            // Language selector
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
            });

            ui.add_space(4.0);

            // Controls row
            ui.horizontal(|ui| {
                let btn_label = if self.is_running { "停止" } else { "開始" };
                if ui.button(btn_label).clicked() {
                    if self.is_running {
                        self.cmd_tx.send(Command::Stop).ok();
                    } else if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
                        self.cmd_tx.send(Command::Start(tag.clone())).ok();
                    }
                }

                let (dot_color, state_label) = match self.rec_state {
                    Some(SpeechRecognizerState::Capturing)      => (egui::Color32::from_rgb(80, 200, 80),   "聴取中"),
                    Some(SpeechRecognizerState::SoundStarted)   => (egui::Color32::from_rgb(80, 200, 80),   "音声検出"),
                    Some(SpeechRecognizerState::SpeechDetected) => (egui::Color32::from_rgb(255, 200, 0),   "発話中"),
                    Some(SpeechRecognizerState::SoundEnded)     => (egui::Color32::from_rgb(255, 200, 0),   "処理待ち"),
                    Some(SpeechRecognizerState::Processing)     => (egui::Color32::from_rgb(100, 150, 255), "認識中"),
                    Some(SpeechRecognizerState::Paused)         => (egui::Color32::GRAY,                    "一時停止"),
                    _                                           => (egui::Color32::DARK_GRAY,               ""),
                };
                let (rect, _) = ui.allocate_exact_size(egui::vec2(10.0, 10.0), egui::Sense::hover());
                ui.painter().circle_filled(rect.center(), 5.0, dot_color);
                if !state_label.is_empty() {
                    ui.label(state_label);
                }

                ui.checkbox(&mut self.auto_mode, "Auto");

                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    if ui.button("Reset").clicked() {
                        input::reset_external(self.last_external_hwnd);
                    }
                });
            });

            ui.separator();

            if let Some(err) = &self.error {
                ui.colored_label(egui::Color32::RED, format!("エラー: {}", err));
                ui.separator();
            }

            if !self.hypothesis.is_empty() {
                ui.colored_label(egui::Color32::from_rgb(100, 150, 220), &self.hypothesis);
                ui.add_space(2.0);
            }

            ui.separator();

            ui.label("認識履歴：");
            egui::ScrollArea::vertical()
                .auto_shrink([false, false])
                .stick_to_bottom(true)
                .show(ui, |ui| {
                    for text in &self.history {
                        ui.label(text);
                    }
                });
        });
    }
}

use std::sync::mpsc::{Receiver, Sender};
use crate::speech::{Command, SpeechEvent, SpeechRecognizerState};
use crate::input;

fn setup_fonts(ctx: &egui::Context) {
    let candidates = [
        r"C:\Windows\Fonts\YuGothR.ttf",
        r"C:\Windows\Fonts\YuGothM.ttf",
        r"C:\Windows\Fonts\meiryo.ttc",
        r"C:\Windows\Fonts\msgothic.ttc",
    ];
    let font_data = candidates.iter().find_map(|path| std::fs::read(path).ok());
    if let Some(data) = font_data {
        let mut fonts = egui::FontDefinitions::default();
        fonts.font_data.insert("japanese".into(), egui::FontData::from_owned(data));
        fonts.families.entry(egui::FontFamily::Proportional).or_default().insert(0, "japanese".into());
        fonts.families.entry(egui::FontFamily::Monospace).or_default().push("japanese".into());
        ctx.set_fonts(fonts);
    }
}

pub struct App {
    cmd_tx: Sender<Command>,
    event_rx: Receiver<SpeechEvent>,
    languages: Vec<(String, String)>,
    selected_lang_idx: usize,
    is_running: bool,
    rec_state: Option<SpeechRecognizerState>,
    current_lang_tag: Option<String>,
    punct: bool,
    auto_input: bool,
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
            punct: true,
            auto_input: false,
            hypothesis: String::new(),
            history: Vec::new(),
            error: None,
        }
    }
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        while let Ok(event) = self.event_rx.try_recv() {
            match event {
                SpeechEvent::Languages(langs) => {
                    self.languages = langs;
                }
                SpeechEvent::Hypothesis(text) => {
                    self.hypothesis = text;
                }
                SpeechEvent::Final(text) => {
                    self.hypothesis.clear();
                    if self.auto_input && !input::foreground_is_ours() {
                        input::send_text(&text);
                    }
                    self.history.push(text);
                }
                SpeechEvent::Started => {
                    self.is_running = true;
                    self.error = None;
                    self.current_lang_tag = self.languages
                        .get(self.selected_lang_idx)
                        .map(|(tag, _)| tag.clone());
                }
                SpeechEvent::Stopped => {
                    self.is_running = false;
                    self.rec_state = None;
                    self.hypothesis.clear();
                }
                SpeechEvent::SessionEnded => {
                    self.rec_state = None;
                    self.hypothesis.clear();
                    if self.is_running {
                        if let Some(tag) = &self.current_lang_tag {
                            self.cmd_tx.send(Command::Start {
                                lang: tag.clone(),
                                punct: self.punct,
                            }).ok();
                        }
                    }
                }
                SpeechEvent::State(s) => {
                    self.rec_state = Some(s);
                }
                SpeechEvent::Error(e) => {
                    self.error = Some(e);
                    self.is_running = false;
                }
            }
        }

        ctx.request_repaint_after(std::time::Duration::from_millis(50));

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("音声入力");
            ui.separator();

            ui.horizontal(|ui| {
                ui.label("言語：");
                if self.languages.is_empty() {
                    ui.label("読み込み中...");
                } else {
                    let selected_name = self.languages
                        .get(self.selected_lang_idx)
                        .map(|(_, name)| name.as_str())
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

            ui.horizontal(|ui| {
                let btn_label = if self.is_running { "停止" } else { "開始" };
                if ui.button(btn_label).clicked() {
                    if self.is_running {
                        self.cmd_tx.send(Command::Stop).ok();
                    } else if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
                        self.cmd_tx.send(Command::Start {
                            lang: tag.clone(),
                            punct: self.punct,
                        }).ok();
                    }
                }
                ui.checkbox(&mut self.punct, "句読点");

                let (dot_color, state_label) = match self.rec_state {
                    Some(SpeechRecognizerState::Capturing)     => (egui::Color32::from_rgb(80, 200, 80),  "聴取中"),
                    Some(SpeechRecognizerState::SoundStarted)  => (egui::Color32::from_rgb(80, 200, 80),  "音声検出"),
                    Some(SpeechRecognizerState::SpeechDetected)=> (egui::Color32::from_rgb(255, 200, 0),  "発話中"),
                    Some(SpeechRecognizerState::SoundEnded)    => (egui::Color32::from_rgb(255, 200, 0),  "処理待ち"),
                    Some(SpeechRecognizerState::Processing)    => (egui::Color32::from_rgb(100, 150, 255), "認識中"),
                    Some(SpeechRecognizerState::Paused)        => (egui::Color32::GRAY,                   "一時停止"),
                    Some(SpeechRecognizerState::Idle) | None   => (egui::Color32::DARK_GRAY,              ""),
                    Some(SpeechRecognizerState::Unknown)       => (egui::Color32::DARK_GRAY,              ""),
                };
                let (rect, _) = ui.allocate_exact_size(egui::vec2(10.0, 10.0), egui::Sense::hover());
                ui.painter().circle_filled(rect.center(), 5.0, dot_color);
                if !state_label.is_empty() {
                    ui.label(state_label);
                }

                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    ui.checkbox(&mut self.auto_input, "他アプリへ入力");
                });
            });

            ui.separator();

            if let Some(err) = &self.error {
                ui.colored_label(egui::Color32::RED, format!("エラー: {}", err));
                ui.separator();
            }

            if !self.hypothesis.is_empty() {
                ui.colored_label(egui::Color32::from_rgb(100, 150, 220), &self.hypothesis);
                ui.add_space(4.0);
            }

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

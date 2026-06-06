use super::App;
use super::setup::truncate_str;
use super::suffix::default_suffix_configs;
use crate::speech::{Command, SpeechEvent, SpeechRecognizerState};

fn line_col(text: &str, char_idx: usize) -> (usize, usize) {
    let mut line = 0usize;
    let mut col  = 0usize;
    for (i, ch) in text.chars().enumerate() {
        if i >= char_idx { break; }
        if ch == '\n' { line += 1; col = 0; } else { col += 1; }
    }
    (line, col)
}

fn cursor_up(text: &str, char_idx: usize) -> usize {
    let lines: Vec<&str> = text.split('\n').collect();
    let (line, col) = line_col(text, char_idx);
    if line == 0 { return 0; }
    let prefix: usize = lines[..line - 1].iter().map(|l| l.chars().count() + 1).sum();
    prefix + col.min(lines[line - 1].chars().count())
}

fn cursor_down(text: &str, char_idx: usize) -> usize {
    let lines: Vec<&str> = text.split('\n').collect();
    let (line, col) = line_col(text, char_idx);
    if line + 1 >= lines.len() { return text.chars().count(); }
    let prefix: usize = lines[..line + 1].iter().map(|l| l.chars().count() + 1).sum();
    prefix + col.min(lines[line + 1].chars().count())
}

struct PanelActions {
    confirm_idx:    Option<usize>,
    do_clear:       bool,
    do_start_stop:  bool,
    do_toggle_auto: bool,
    do_reset:       bool,
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        self.show_menu_bar(ctx);
        self.drain_events();
        ctx.request_repaint_after(std::time::Duration::from_millis(50));

        let prev_lang_idx  = self.selected_lang_idx;
        let prev_audio_idx = self.selected_audio_idx;

        let actions = self.show_central_panel(ctx);
        self.apply_actions(ctx, actions);
        self.show_suffix_editor_window(ctx);
        self.restart_if_device_changed(prev_lang_idx, prev_audio_idx);
    }

    fn on_exit(&mut self, _gl: Option<&eframe::glow::Context>) {
        self.cmd_tx.send(Command::Stop).ok();
        crate::config::save(&crate::config::AppConfig {
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
        });
        std::thread::sleep(std::time::Duration::from_millis(400));
    }
}

impl App {
    fn show_menu_bar(&mut self, ctx: &egui::Context) {
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
                        self.show_tts_settings(ui);
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
                    ui.add(
                        egui::TextEdit::singleline(&mut self.voicevox_path)
                            .desired_width(360.0)
                    );
                });
                if ui.menu_button("語尾", |_ui| {}).response.clicked() {
                    self.show_suffix_editor = !self.show_suffix_editor;
                }
                ui.menu_button("アプリ", |ui| {
                    if ui.button("設定をリセット").clicked() {
                        self.reset_settings();
                        ui.close_menu();
                    }
                    ui.separator();
                    if ui.button("終了").clicked() {
                        ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                    }
                });
            });
        });
    }

    fn show_tts_settings(&mut self, ui: &mut egui::Ui) {
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
    }

    fn drain_events(&mut self) {
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
                        let full = self.build_send_text(text_with_period);
                        if self.chatbox_enabled { crate::osc::send_chatbox(&full); }
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
    }

    fn show_central_panel(&mut self, ctx: &egui::Context) -> PanelActions {
        let has_pending = self.pending.as_ref().map_or(false, |t| !t.is_empty());
        let is_running  = self.is_running;
        let auto_mode   = self.auto_mode;
        const BTN_H:     f32 = 44.0;
        const PENDING_H: f32 = 100.0;
        const VRC_H:     f32 = 100.0;

        let mut actions = PanelActions {
            confirm_idx: None,
            do_clear: false,
            do_start_stop: false,
            do_toggle_auto: false,
            do_reset: false,
        };

        egui::CentralPanel::default().show(ctx, |ui| {
            // 言語 + マイク選択
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
                        .width(150.0)
                        .selected_text(truncate_str(selected_mic, 16))
                        .show_ui(ui, |ui| {
                            for (i, (_, name)) in self.audio_devices.iter().enumerate() {
                                ui.selectable_value(&mut self.selected_audio_idx, i, name);
                            }
                        });
                }
            });

            ui.separator();

            // ステータス + エラー
            ui.horizontal(|ui| {
                let (dot_color, state_label) = match self.rec_state {
                    Some(SpeechRecognizerState::Capturing)      => (egui::Color32::from_rgb(80, 200, 80), "聴取中"),
                    Some(SpeechRecognizerState::SpeechDetected) => (egui::Color32::from_rgb(255, 200, 0), "発話中"),
                    _                                           => (egui::Color32::DARK_GRAY, ""),
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

            // Hypothesis 表示
            ui.with_layout(egui::Layout::top_down(egui::Align::LEFT), |ui| {
                ui.spacing_mut().item_spacing.y = 0.0;
                let hyp_h = 63.0;
                let avail_w = ui.available_width();
                let (hyp_rect, _) = ui.allocate_exact_size(egui::vec2(avail_w, hyp_h), egui::Sense::hover());
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
                                ui.colored_label(egui::Color32::from_rgb(100, 150, 220), &self.hypothesis);
                            }
                        });
                });
                ui.separator();
            });

            // Pending テキストエリア
            let avail_w = ui.available_width();
            let (rect, _) = ui.allocate_exact_size(
                egui::vec2(avail_w, PENDING_H - 8.0),
                egui::Sense::hover(),
            );
            let pending_hovered = ctx.input(|i| i.pointer.hover_pos().map_or(false, |p| rect.contains(p)));
            let pending_clicked = ctx.input(|i| {
                i.pointer.primary_clicked() && i.pointer.interact_pos().map_or(false, |p| rect.contains(p))
            });
            ui.painter().rect_filled(
                rect, 6.0,
                if pending_hovered { egui::Color32::from_rgb(120, 50, 50) }
                else               { egui::Color32::from_rgb(20, 60, 20) },
            );
            ui.painter().text(
                rect.right_top() + egui::vec2(-6.0, 4.0),
                egui::Align2::RIGHT_TOP,
                "Ctrl+Enter で送信",
                egui::FontId::proportional(10.0),
                egui::Color32::from_rgba_unmultiplied(80, 200, 80, 140),
            );

            // 前フレームの TextEdit ID でフォーカス判定し、TextEdit が処理する前にキーを消費
            let prev_te_id: Option<egui::Id> = ctx.data(|d| d.get_temp(egui::Id::new("pending_te_id")));
            let pre_focused = prev_te_id.map_or(false, |id| ctx.memory(|m| m.focused() == Some(id)));

            let (dl, dr, du, dd) = if pre_focused {
                ctx.input_mut(|i| (
                    i.consume_key(egui::Modifiers::CTRL, egui::Key::H),
                    i.consume_key(egui::Modifiers::CTRL, egui::Key::L),
                    i.consume_key(egui::Modifiers::CTRL, egui::Key::K),
                    i.consume_key(egui::Modifiers::CTRL, egui::Key::J),
                ))
            } else { (false, false, false, false) };

            // IME 確定直後の Enter を除去（余分な改行を防ぐ）
            if pre_focused {
                let ime_commit = ctx.input(|i| {
                    i.events.iter().any(|e| matches!(e, egui::Event::Ime(egui::ImeEvent::Commit(_))))
                });
                if ime_commit {
                    ctx.input_mut(|i| { i.consume_key(egui::Modifiers::NONE, egui::Key::Enter); });
                }
            }

            let mut te_id: Option<egui::Id> = None;
            {
                if self.pending.is_none() { self.pending = Some(String::new()); }
                let text_for_edit = self.pending.as_mut().unwrap();
                let text_rect = rect.shrink2(egui::vec2(6.0, 4.0));
                let text_content_rect = egui::Rect::from_min_size(
                    text_rect.min + egui::vec2(0.0, 15.0),
                    egui::vec2(text_rect.width(), text_rect.height() - 15.0),
                );
                ui.allocate_new_ui(egui::UiBuilder::new().max_rect(text_content_rect), |ui| {
                    ui.set_clip_rect(text_content_rect.intersect(ui.clip_rect()));
                    let te_resp = egui::ScrollArea::vertical()
                        .id_salt("pending_scroll")
                        .auto_shrink([false, false])
                        .stick_to_bottom(true)
                        .show(ui, |ui| {
                            ui.add(
                                egui::TextEdit::multiline(text_for_edit)
                                    .frame(false)
                                    .desired_rows(1)
                                    .desired_width(text_content_rect.width())
                                    .font(egui::FontId::proportional(15.0))
                                    .text_color(egui::Color32::from_rgb(80, 255, 80)),
                            )
                        })
                        .inner;
                    if !te_resp.has_focus() && ctx.memory(|m| m.focused().is_none()) {
                        te_resp.request_focus();
                    }
                    te_id = Some(te_resp.id);
                });
            }

            // ID を次フレーム向けに保存
            if let Some(id) = te_id {
                ctx.data_mut(|d| d.insert_temp(egui::Id::new("pending_te_id"), id));
            }

            if self.pending.as_ref().map_or(false, |t| t.is_empty()) {
                self.pending = None;
            }

            // カーソル移動を適用（前フレームで消費済みのキー）
            if dl || dr || du || dd {
                if let Some(id) = te_id.or(prev_te_id) {
                    let text_snap = self.pending.as_deref().unwrap_or("").to_string();
                    if let Some(mut state) = egui::text_edit::TextEditState::load(ctx, id) {
                        if let Some(range) = state.cursor.char_range() {
                            let idx = range.primary.index;
                            let new_idx = if dl      { idx.saturating_sub(1) }
                                else if dr { (idx + 1).min(text_snap.chars().count()) }
                                else if du { cursor_up(&text_snap, idx) }
                                else       { cursor_down(&text_snap, idx) };
                            let c = egui::text::CCursor::new(new_idx);
                            state.cursor.set_char_range(Some(egui::text::CCursorRange::one(c)));
                            state.store(ctx, id);
                        }
                    }
                }
            }

            if pending_clicked && has_pending { actions.do_clear = true; }
            if ctx.input(|i| i.key_pressed(egui::Key::Enter) && i.modifiers.ctrl) && has_pending {
                actions.confirm_idx = Some(0);
            }

            ui.add_space(4.0);

            // VRC チャットボックス表示
            let avail_w2 = ui.available_width();
            let (vrc_rect, _) = ui.allocate_exact_size(
                egui::vec2(avail_w2, VRC_H - 8.0),
                egui::Sense::hover(),
            );
            let vrc_hovered = ctx.input(|i| i.pointer.hover_pos().map_or(false, |p| vrc_rect.contains(p)));
            let vrc_clicked = ctx.input(|i| {
                i.pointer.primary_clicked() && i.pointer.interact_pos().map_or(false, |p| vrc_rect.contains(p))
            });
            let vrc_bg = if vrc_hovered       { egui::Color32::from_rgb(120, 50, 50) }
                         else if self.vrc_will_reset { egui::Color32::from_rgb(55, 28, 8) }
                         else                 { egui::Color32::from_rgb(30, 20, 50) };
            ui.painter().rect_filled(vrc_rect, 6.0, vrc_bg);

            let vrc_inner = vrc_rect.shrink2(egui::vec2(8.0, 4.0));
            let vrc_count = self.vrc_text.chars().count();
            let header_h  = 16.0;

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
            ui.painter().text(vrc_inner.left_top(),  egui::Align2::LEFT_TOP,  "VRC ›",
                egui::FontId::proportional(11.0), label_color);
            ui.painter().text(vrc_inner.right_top(), egui::Align2::RIGHT_TOP, format!("{}/144", vrc_count),
                egui::FontId::proportional(11.0), vrc_count_color);

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
                                egui::RichText::new(&self.vrc_text).color(text_color).size(15.0),
                            ).selectable(false));
                        }
                    });
            });
            if vrc_clicked && !self.vrc_text.is_empty() { actions.do_reset = true; }

            ui.add_space(6.0);

            // コントロールボタン群（4列）
            let gap = 4.0;
            let btn_w = (ui.available_width() - 3.0 * gap) / 4.0;
            let btn_size = egui::vec2(btn_w, BTN_H);
            let mk_text = |s: &str| egui::RichText::new(s).color(egui::Color32::WHITE).size(14.0);

            egui::Grid::new("confirm_grid")
                .num_columns(4)
                .spacing([gap, gap])
                .show(ui, |ui| {
                    let labels: Vec<String> = self.suffix_configs.iter().map(|c| c.label.clone()).collect();
                    for (i, label) in labels.iter().enumerate() {
                        let clicked = ui.add_enabled_ui(has_pending, |ui| {
                            ui.add_sized(btn_size,
                                egui::Button::new(mk_text(label))
                                    .fill(egui::Color32::from_rgb(60, 140, 180)),
                            ).clicked()
                        }).inner;
                        if clicked { actions.confirm_idx = Some(i); }
                        if (i + 1) % 4 == 0 { ui.end_row(); }
                    }

                    let (start_label, start_fill) = if is_running {
                        ("停止", egui::Color32::from_rgb(90, 35, 35))
                    } else {
                        ("開始", egui::Color32::from_rgb(30, 80, 30))
                    };
                    if ui.add_sized(btn_size, egui::Button::new(mk_text(start_label)).fill(start_fill)).clicked() {
                        actions.do_start_stop = true;
                    }
                    let auto_fill = if auto_mode { egui::Color32::from_rgb(40, 70, 120) }
                                    else         { egui::Color32::from_gray(60) };
                    if ui.add_sized(btn_size, egui::Button::new(mk_text("Auto")).fill(auto_fill)).clicked() {
                        actions.do_toggle_auto = true;
                    }
                    let chatbox_fill = if self.chatbox_enabled { egui::Color32::from_rgb(40, 70, 120) }
                                       else                    { egui::Color32::from_gray(60) };
                    if ui.add_sized(btn_size, egui::Button::new(mk_text("Chatbox")).fill(chatbox_fill)).clicked() {
                        self.chatbox_enabled = !self.chatbox_enabled;
                    }
                    let tts_fill = if self.tts_enabled { egui::Color32::from_rgb(40, 70, 120) }
                                   else                { egui::Color32::from_gray(60) };
                    if ui.add_sized(btn_size, egui::Button::new(mk_text("TTS")).fill(tts_fill)).clicked() {
                        self.tts_enabled = !self.tts_enabled;
                    }
                    ui.end_row();
                });
        });

        actions
    }

    fn apply_actions(&mut self, _ctx: &egui::Context, actions: PanelActions) {
        if let Some(idx) = actions.confirm_idx { self.confirm(idx); }
        if actions.do_clear       { self.pending = None; }
        if actions.do_toggle_auto { self.auto_mode = !self.auto_mode; }
        if actions.do_reset {
            if self.chatbox_enabled { crate::osc::send_chatbox(""); }
            self.vrc_text.clear();
            self.vrc_will_reset = false;
        }
        if actions.do_start_stop {
            if self.is_running {
                self.cmd_tx.send(Command::Stop).ok();
            } else if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
                let audio_id = self.audio_devices.get(self.selected_audio_idx)
                    .and_then(|(id, _)| if id.is_empty() { None } else { Some(id.clone()) });
                self.cmd_tx.send(Command::Start(tag.clone(), audio_id)).ok();
            }
        }
    }

    fn show_suffix_editor_window(&mut self, ctx: &egui::Context) {
        if !self.show_suffix_editor { return; }
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
                                    if let Some(d) = defaults.get(i) { *cfg = d.clone(); }
                                }
                                ui.end_row();
                            }
                        });
                });
            });
    }

    fn reset_settings(&mut self) {
        let cfg = crate::config::AppConfig::default();
        self.concat_mode    = cfg.concat_mode;
        self.concat_limit   = cfg.concat_limit;
        self.auto_mode      = cfg.auto_mode;
        self.tts_enabled    = cfg.tts_enabled;
        self.chatbox_enabled = cfg.chatbox_enabled;
        self.suffix_configs = default_suffix_configs();

        // CABLE Input (VB-Audio) を自動選択
        let n = 16.max(self.tts_devices.len());
        self.tts_device_indices = vec![false; n];
        let cable_idx = crate::tts::find_cable_input_index();
        if cable_idx < n { self.tts_device_indices[cable_idx] = true; }

        // 小夜 (style ID 46) を自動選択
        if let Some(spk_idx) = self.tts_speakers.iter()
            .position(|spk| spk.styles.iter().any(|st| st.id == 46))
        {
            self.tts_speaker_sel = spk_idx;
            self.tts_style_sel = self.tts_speakers[spk_idx].styles.iter()
                .position(|st| st.id == 46)
                .unwrap_or(0);
        } else {
            self.tts_speaker_sel = 0;
            self.tts_style_sel   = 0;
        }
    }

    fn restart_if_device_changed(&mut self, prev_lang_idx: usize, prev_audio_idx: usize) {
        if !self.is_running { return; }
        if self.selected_lang_idx == prev_lang_idx && self.selected_audio_idx == prev_audio_idx { return; }
        if let Some((tag, _)) = self.languages.get(self.selected_lang_idx) {
            let audio_id = self.audio_devices.get(self.selected_audio_idx)
                .and_then(|(id, _)| if id.is_empty() { None } else { Some(id.clone()) });
            self.cmd_tx.send(Command::Start(tag.clone(), audio_id)).ok();
        }
    }
}

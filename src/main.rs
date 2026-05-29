#![allow(unsafe_op_in_unsafe_fn)]

mod audio_device;
mod input;
mod speech;
mod ui;

fn main() {
    let (cmd_tx, cmd_rx) = std::sync::mpsc::channel();
    let (event_tx, event_rx) = std::sync::mpsc::channel();

    let cmd_tx_speech = cmd_tx.clone();
    std::thread::spawn(move || speech::run_thread(cmd_rx, cmd_tx_speech, event_tx));

    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("音声入力")
            .with_inner_size([440.0, 480.0])
            .with_always_on_top(),
        ..Default::default()
    };

    eframe::run_native(
        "音声入力",
        options,
        Box::new(|cc| Ok(Box::new(ui::App::new(cc, cmd_tx, event_rx)))),
    )
    .expect("eframe の起動に失敗しました");
}

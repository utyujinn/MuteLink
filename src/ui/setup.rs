pub fn truncate_str(s: &str, max_chars: usize) -> String {
    if s.chars().count() > max_chars {
        let t: String = s.chars().take(max_chars.saturating_sub(1)).collect();
        format!("{}…", t)
    } else {
        s.to_string()
    }
}


pub fn setup_fonts(ctx: &egui::Context) {
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

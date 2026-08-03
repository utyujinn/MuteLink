// Renders the VR confirm/discard HUD (see lib.rs's update_overlay command) as
// a plain RGBA8 buffer that gets pushed straight to SteamVR via
// IVROverlay::SetOverlayRaw — no GPU texture pipeline needed, just a manual
// software rasterizer for a rounded box, some text, and a progress bar.

use std::sync::OnceLock;

use fontdue::Font;

pub const CANVAS_WIDTH: usize = 560;
pub const CANVAS_HEIGHT: usize = 200;

const CORNER_RADIUS: f32 = 24.0;
const BOX_ALPHA: f32 = 210.0 / 255.0;
const BAR_HEIGHT: f32 = 10.0;
const BAR_MARGIN: f32 = 28.0;
const BASE_FONT_SIZE: f32 = 40.0;
const MIN_FONT_SIZE: f32 = 18.0;
const SEND_COLOR: [u8; 3] = [40, 200, 90];
const DISCARD_COLOR: [u8; 3] = [220, 60, 60];

pub struct OverlayProgress {
    pub is_send: bool,
    pub fraction: f32,
}

// Meiryo ships on every Japanese-locale Windows install and has full
// hiragana/katakana/kanji coverage; Yu Gothic is the fallback for an
// English-locale Windows without the Japanese language pack. Loaded once and
// reused — parsing a ~9MB .ttc on every overlay update would be far too slow
// for a value that's redrawn ~20 times/sec while a hold is in progress.
fn font() -> Option<&'static Font> {
    static FONT: OnceLock<Option<Font>> = OnceLock::new();
    FONT.get_or_init(|| {
        for path in [r"C:\Windows\Fonts\meiryo.ttc", r"C:\Windows\Fonts\YuGothR.ttc"] {
            if let Ok(bytes) = std::fs::read(path) {
                if let Ok(font) = Font::from_bytes(bytes.as_slice(), fontdue::FontSettings::default()) {
                    return Some(font);
                }
            }
        }
        None
    })
    .as_ref()
}

/// Standard "over" alpha compositing of one `color` pixel (coverage as alpha)
/// onto whatever's already in `buf` at `idx`.
fn blend(buf: &mut [u8], idx: usize, color: [u8; 3], alpha: f32) {
    let alpha = alpha.clamp(0.0, 1.0);
    if alpha <= 0.0 {
        return;
    }
    let dst_a = buf[idx + 3] as f32 / 255.0;
    let out_a = alpha + dst_a * (1.0 - alpha);
    if out_a <= 0.0001 {
        buf[idx + 3] = 0;
        return;
    }
    for c in 0..3 {
        let src = color[c] as f32 / 255.0;
        let dst = buf[idx + c] as f32 / 255.0;
        let out = (src * alpha + dst * dst_a * (1.0 - alpha)) / out_a;
        buf[idx + c] = (out * 255.0).round().clamp(0.0, 255.0) as u8;
    }
    buf[idx + 3] = (out_a * 255.0).round().clamp(0.0, 255.0) as u8;
}

/// Signed-distance-esque coverage (1 = fully inside, 0 = fully outside, with
/// a ~1px antialiased edge) for a centered `w`x`h` rounded rect.
fn rounded_rect_coverage(px: f32, py: f32, w: f32, h: f32, r: f32) -> f32 {
    let qx = (px - w * 0.5).abs() - (w * 0.5 - r);
    let qy = (py - h * 0.5).abs() - (h * 0.5 - r);
    let dist = qx.max(qy).min(0.0) + qx.max(0.0).hypot(qy.max(0.0)) - r;
    (0.5 - dist).clamp(0.0, 1.0)
}

fn draw_box(buf: &mut [u8]) {
    let (w, h) = (CANVAS_WIDTH as f32, CANVAS_HEIGHT as f32);
    for y in 0..CANVAS_HEIGHT {
        for x in 0..CANVAS_WIDTH {
            let coverage = rounded_rect_coverage(x as f32 + 0.5, y as f32 + 0.5, w, h, CORNER_RADIUS);
            if coverage <= 0.0 {
                continue;
            }
            let idx = (y * CANVAS_WIDTH + x) * 4;
            blend(buf, idx, [0, 0, 0], coverage * BOX_ALPHA);
        }
    }
}

fn layout_width(font: &Font, text: &str, size: f32) -> f32 {
    text.chars().map(|c| font.metrics(c, size).advance_width).sum()
}

fn draw_text_centered(buf: &mut [u8], font: &Font, text: &str) {
    if text.is_empty() {
        return;
    }

    let max_width = CANVAS_WIDTH as f32 - 48.0;
    let mut size = BASE_FONT_SIZE;
    while layout_width(font, text, size) > max_width && size > MIN_FONT_SIZE {
        size -= 1.0;
    }

    let width = layout_width(font, text, size);
    let baseline_y = CANVAS_HEIGHT as f32 * 0.42;
    let mut pen_x = (CANVAS_WIDTH as f32 - width) / 2.0;

    for ch in text.chars() {
        let (metrics, bitmap) = font.rasterize(ch, size);
        let glyph_x0 = pen_x + metrics.xmin as f32;
        let glyph_y0 = baseline_y - metrics.ymin as f32 - metrics.height as f32;

        for gy in 0..metrics.height {
            for gx in 0..metrics.width {
                let coverage = bitmap[gy * metrics.width + gx] as f32 / 255.0;
                if coverage <= 0.0 {
                    continue;
                }
                let px = (glyph_x0 + gx as f32).round();
                let py = (glyph_y0 + gy as f32).round();
                if px < 0.0 || py < 0.0 || px >= CANVAS_WIDTH as f32 || py >= CANVAS_HEIGHT as f32 {
                    continue;
                }
                let idx = (py as usize * CANVAS_WIDTH + px as usize) * 4;
                blend(buf, idx, [255, 255, 255], coverage);
            }
        }

        pen_x += metrics.advance_width;
    }
}

fn draw_progress_bar(buf: &mut [u8], progress: &OverlayProgress) {
    let fraction = progress.fraction.clamp(0.0, 1.0);
    if fraction <= 0.0 {
        return;
    }
    let color = if progress.is_send { SEND_COLOR } else { DISCARD_COLOR };

    let bar_max_w = CANVAS_WIDTH as f32 - BAR_MARGIN * 2.0;
    let x0 = BAR_MARGIN;
    let x1 = BAR_MARGIN + bar_max_w * fraction;
    let y0 = CANVAS_HEIGHT as f32 - BAR_MARGIN - BAR_HEIGHT;
    let y1 = y0 + BAR_HEIGHT;

    for y in (y0.floor() as usize)..(y1.ceil() as usize).min(CANVAS_HEIGHT) {
        for x in (x0.floor() as usize)..(x1.ceil() as usize).min(CANVAS_WIDTH) {
            let idx = (y * CANVAS_WIDTH + x) * 4;
            blend(buf, idx, color, 1.0);
        }
    }
}

/// Renders the whole HUD (rounded box + centered text + optional progress
/// bar) into a fresh RGBA8 buffer, tightly packed, top-to-bottom rows — the
/// exact layout `IVROverlay::SetOverlayRaw` expects.
pub fn render(text: &str, progress: Option<&OverlayProgress>) -> Vec<u8> {
    let mut buf = vec![0u8; CANVAS_WIDTH * CANVAS_HEIGHT * 4];

    draw_box(&mut buf);
    if let Some(font) = font() {
        draw_text_centered(&mut buf, font, text);
    }
    if let Some(progress) = progress {
        draw_progress_bar(&mut buf, progress);
    }

    buf
}

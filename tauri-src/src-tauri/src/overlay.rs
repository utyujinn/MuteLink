// Renders the VR confirm/discard HUD (see lib.rs's update_overlay command) as
// a plain RGBA8 buffer that gets pushed straight to SteamVR via
// IVROverlay::SetOverlayTexture — no GPU text/shape pipeline needed, just a
// manual software rasterizer for a rounded box, wrapped text, an optional
// "this ending will be appended" preview line, and a progress bar.
//
// The language-switch tag ("EN"/"JP"/"CN") is a *separate* SteamVR overlay
// (see lib.rs's Hud.lang_tag and update_lang_tag) positioned in world space
// relative to this box, rather than extra content baked into this same
// texture — that way the box's own size/position never has to change to
// make room for it.

use std::sync::OnceLock;

use fontdue::Font;

pub const CANVAS_WIDTH: usize = 560;
pub const CANVAS_HEIGHT: usize = 300;

const CORNER_RADIUS: f32 = 24.0;
const BOX_ALPHA: f32 = 210.0 / 255.0;
const BAR_HEIGHT: f32 = 10.0;
const BAR_MARGIN: f32 = 24.0;
const SEND_COLOR: [u8; 3] = [40, 200, 90];
const DISCARD_COLOR: [u8; 3] = [220, 60, 60];

// Main text block: wraps across multiple lines and shrinks to fit within
// this fixed region, instead of the single auto-shrunk line it used to be —
// long Final text was getting cut off entirely at the box's edges.
const TEXT_TOP: f32 = 18.0;
const TEXT_REGION_HEIGHT: f32 = 190.0;
const MAX_TEXT_LINES: usize = 4;
const BASE_FONT_SIZE: f32 = 34.0;
const MIN_FONT_SIZE: f32 = 16.0;
const LINE_HEIGHT_FACTOR: f32 = 1.25;

// The ending-preview line sits at a fixed baseline below the text region
// regardless of how many lines the main text actually used, so the layout
// doesn't jump around depending on content.
const ENDING_PREVIEW_BASELINE: f32 = TEXT_TOP + TEXT_REGION_HEIGHT + 30.0;
const ENDING_PREVIEW_FONT_SIZE: f32 = 22.0;

// The separate language-tag overlay's own texture. Sized generously for a
// large, bold, 2-character label ("EN"/"JP"/"CN") — see lib.rs for how its
// world-space transform is derived from this and the box's own transform.
pub const LANG_TAG_CANVAS_WIDTH: usize = 220;
pub const LANG_TAG_CANVAS_HEIGHT: usize = 130;
const LANG_TAG_FONT_SIZE: f32 = 96.0;
const LANG_TAG_PADDING: f32 = 8.0;
const LANG_TAG_ALPHA: f32 = 0.05;

// Pop-in/settle/fade-out timeline, driven by `elapsed_secs` since the tag
// started showing (see lib.rs's update_lang_tag). Font size ramps up to
// LANG_TAG_POP_SCALE over LANG_TAG_POP_UP_SECS, holds there, eases back to
// 1x over the same span, then sits fully opaque until LANG_TAG_FADE_START_SECS,
// after which alpha ramps linearly down to 0 by LANG_TAG_FADE_END_SECS.
const LANG_TAG_POP_UP_SECS: f32 = 0.1;
const LANG_TAG_POP_HOLD_SECS: f32 = 0.1;
const LANG_TAG_POP_DOWN_SECS: f32 = 0.1;
const LANG_TAG_POP_SCALE: f32 = 1.2;
const LANG_TAG_FADE_START_SECS: f32 = 2.5;
const LANG_TAG_FADE_END_SECS: f32 = 3.5;

/// Font-size multiplier at `elapsed` seconds into the tag's display.
fn lang_tag_pop_scale(elapsed: f32) -> f32 {
    let hold_start = LANG_TAG_POP_UP_SECS;
    let down_start = hold_start + LANG_TAG_POP_HOLD_SECS;
    let down_end = down_start + LANG_TAG_POP_DOWN_SECS;
    if elapsed < hold_start {
        1.0 + (LANG_TAG_POP_SCALE - 1.0) * (elapsed / LANG_TAG_POP_UP_SECS)
    } else if elapsed < down_start {
        LANG_TAG_POP_SCALE
    } else if elapsed < down_end {
        let t = (elapsed - down_start) / LANG_TAG_POP_DOWN_SECS;
        LANG_TAG_POP_SCALE - (LANG_TAG_POP_SCALE - 1.0) * t
    } else {
        1.0
    }
}

/// Alpha multiplier (on top of LANG_TAG_ALPHA) at `elapsed` seconds in.
fn lang_tag_fade_alpha(elapsed: f32) -> f32 {
    if elapsed < LANG_TAG_FADE_START_SECS {
        1.0
    } else {
        let t = (elapsed - LANG_TAG_FADE_START_SECS) / (LANG_TAG_FADE_END_SECS - LANG_TAG_FADE_START_SECS);
        (1.0 - t).clamp(0.0, 1.0)
    }
}

pub struct OverlayProgress {
    pub is_send: bool,
    pub fraction: f32,
}

// Meiryo ships on every Japanese-locale Windows install and has full
// hiragana/katakana/kanji coverage; Yu Gothic is the fallback for an
// English-locale Windows without the Japanese language pack. Loaded once and
// reused — parsing a ~9MB .ttc on every overlay update would be far too slow
// for a value that's redrawn many times/sec while a hold is in progress.
fn font() -> Option<&'static Font> {
    static FONT: OnceLock<Option<Font>> = OnceLock::new();
    FONT.get_or_init(|| load_font(&[r"C:\Windows\Fonts\meiryo.ttc", r"C:\Windows\Fonts\YuGothR.ttc"])).as_ref()
}

// Bold weight, used only for the language tag (it's meant to read as a
// short, punchy label, not body text).
fn bold_font() -> Option<&'static Font> {
    static FONT: OnceLock<Option<Font>> = OnceLock::new();
    FONT.get_or_init(|| load_font(&[r"C:\Windows\Fonts\meiryob.ttc", r"C:\Windows\Fonts\YuGothB.ttc"])).as_ref()
}

fn load_font(paths: &[&str]) -> Option<Font> {
    for path in paths {
        if let Ok(bytes) = std::fs::read(path) {
            if let Ok(font) = Font::from_bytes(bytes.as_slice(), fontdue::FontSettings::default()) {
                return Some(font);
            }
        }
    }
    None
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

/// Greedily wraps `text` to `max_width` at `size`, one line per overflow —
/// character-based (not word-based) since Japanese doesn't wrap on spaces.
fn wrap_lines(font: &Font, text: &str, size: f32, max_width: f32) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    let mut current_width = 0.0;
    for ch in text.chars() {
        let advance = font.metrics(ch, size).advance_width;
        if current_width + advance > max_width && !current.is_empty() {
            lines.push(std::mem::take(&mut current));
            current_width = 0.0;
        }
        current.push(ch);
        current_width += advance;
    }
    lines.push(current);
    lines
}

fn draw_line_centered(buf: &mut [u8], font: &Font, line: &str, size: f32, baseline_y: f32, color: [u8; 3]) {
    let width = layout_width(font, line, size);
    let mut pen_x = (CANVAS_WIDTH as f32 - width) / 2.0;

    for ch in line.chars() {
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
                blend(buf, idx, color, coverage);
            }
        }

        pen_x += metrics.advance_width;
    }
}

/// Wraps `text` into up to MAX_TEXT_LINES lines, shrinking the font first
/// (same as the old single-line auto-shrink) and truncating with "…" only
/// as a last resort if it still doesn't fit at MIN_FONT_SIZE. Lines are
/// vertically centered within the fixed text region.
fn draw_text_block(buf: &mut [u8], font: &Font, text: &str) {
    if text.is_empty() {
        return;
    }

    let max_width = CANVAS_WIDTH as f32 - 48.0;
    let mut size = BASE_FONT_SIZE;
    let mut lines = wrap_lines(font, text, size, max_width);
    while size > MIN_FONT_SIZE
        && (lines.len() > MAX_TEXT_LINES || lines.len() as f32 * size * LINE_HEIGHT_FACTOR > TEXT_REGION_HEIGHT)
    {
        size -= 1.0;
        lines = wrap_lines(font, text, size, max_width);
    }
    if lines.len() > MAX_TEXT_LINES {
        lines.truncate(MAX_TEXT_LINES);
        if let Some(last) = lines.last_mut() {
            last.push('…');
        }
    }

    let line_height = size * LINE_HEIGHT_FACTOR;
    let total_height = lines.len() as f32 * line_height;
    let start_y = TEXT_TOP + ((TEXT_REGION_HEIGHT - total_height) / 2.0).max(0.0);

    for (i, line) in lines.iter().enumerate() {
        let baseline_y = start_y + (i as f32 + 0.8) * line_height;
        draw_line_centered(buf, font, line, size, baseline_y, [255, 255, 255]);
    }
}

fn draw_ending_preview(buf: &mut [u8], font: &Font, ending: &str) {
    let label = format!("+ {ending}");
    draw_line_centered(buf, font, &label, ENDING_PREVIEW_FONT_SIZE, ENDING_PREVIEW_BASELINE, SEND_COLOR);
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

/// Renders the whole HUD (rounded box + wrapped text + optional ending
/// preview + optional progress bar) into a fresh RGBA8 buffer, tightly
/// packed, top-to-bottom rows — the exact layout SetOverlayTexture's
/// underlying D3D11 texture expects.
pub fn render(text: &str, ending_preview: Option<&str>, progress: Option<&OverlayProgress>) -> Vec<u8> {
    let mut buf = vec![0u8; CANVAS_WIDTH * CANVAS_HEIGHT * 4];

    draw_box(&mut buf);
    if let Some(font) = font() {
        draw_text_block(&mut buf, font, text);
        if let Some(ending) = ending_preview {
            draw_ending_preview(&mut buf, font, ending);
        }
    }
    if let Some(progress) = progress {
        draw_progress_bar(&mut buf, progress);
    }

    buf
}

/// Renders just the language tag ("EN"/"JP"/"CN"), bold, white, translucent.
/// Positioned so its bottom-center point — at the *unscaled* font size —
/// lands at its own texture's (0, 0)-relative resting spot (see lib.rs for
/// how that spot is placed in world space); the pop animation then
/// grows/shrinks around that fixed point instead of the top-left corner, so
/// it settles back into exactly the resting position once the scale
/// returns to 1x. `elapsed_secs` (time since the tag started showing)
/// drives the pop-in/settle/fade-out animation — see the LANG_TAG_POP_*/
/// LANG_TAG_FADE_* constants and lang_tag_pop_scale/lang_tag_fade_alpha.
pub fn render_lang_tag(label: &str, elapsed_secs: f32) -> Vec<u8> {
    let mut buf = vec![0u8; LANG_TAG_CANVAS_WIDTH * LANG_TAG_CANVAS_HEIGHT * 4];
    let Some(font) = bold_font().or_else(font) else {
        return buf;
    };

    let size = LANG_TAG_FONT_SIZE * lang_tag_pop_scale(elapsed_secs);
    let alpha = LANG_TAG_ALPHA * lang_tag_fade_alpha(elapsed_secs);

    let anchor_x = LANG_TAG_PADDING + layout_width(font, label, LANG_TAG_FONT_SIZE) / 2.0;
    let anchor_y = LANG_TAG_PADDING + LANG_TAG_FONT_SIZE * 0.8;
    let baseline_y = anchor_y;
    let mut pen_x = anchor_x - layout_width(font, label, size) / 2.0;

    for ch in label.chars() {
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
                if px < 0.0 || py < 0.0 || px >= LANG_TAG_CANVAS_WIDTH as f32 || py >= LANG_TAG_CANVAS_HEIGHT as f32 {
                    continue;
                }
                let idx = (py as usize * LANG_TAG_CANVAS_WIDTH + px as usize) * 4;
                blend(&mut buf, idx, [255, 255, 255], coverage * alpha);
            }
        }

        pen_x += metrics.advance_width;
    }

    buf
}

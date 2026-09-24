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

use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};

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
// long Final text was getting cut off entirely at the box's edges. Final
// (already confirmed, pending send) and interim (still being recognized)
// text are drawn as one continuous, wrapped run — final in yellow-green,
// interim trailing after it in white — see draw_text_block/draw_line_mixed.
const TEXT_TOP: f32 = 18.0;
const TEXT_REGION_HEIGHT: f32 = 190.0;
const MAX_TEXT_LINES: usize = 4;
const BASE_FONT_SIZE: f32 = 34.0;
const MIN_FONT_SIZE: f32 = 16.0;
const LINE_HEIGHT_FACTOR: f32 = 1.25;
const FINAL_TEXT_COLOR: [u8; 3] = [190, 255, 90];
const INTERIM_TEXT_COLOR: [u8; 3] = [255, 255, 255];

// The ending-preview line sits at a fixed baseline below the text region
// regardless of how many lines the main text actually used, so the layout
// doesn't jump around depending on content.
const ENDING_PREVIEW_BASELINE: f32 = TEXT_TOP + TEXT_REGION_HEIGHT + 30.0;
const ENDING_PREVIEW_FONT_SIZE: f32 = 22.0;

// The separate language-tag overlay's own texture. Sized generously for a
// large, bold, label up to 3 characters ("EN"/"JP"/"CN"/"OFF") — see lib.rs
// for how its world-space transform is derived from this and the box's own
// transform. LANG_TAG_MARGIN reserves extra canvas space beyond the text's
// own resting (1x) footprint purely so the pop-in animation — which grows
// the text up to LANG_TAG_POP_SCALE around a fixed anchor point — has room
// to breathe without clipping against the canvas edges; lib.rs's
// lang_tag_placement compensates for it so the text's own resting position
// in world space is unaffected by this margin existing.
pub const LANG_TAG_MARGIN: usize = 28;
pub const LANG_TAG_CANVAS_WIDTH: usize = 220 + LANG_TAG_MARGIN * 2;
pub const LANG_TAG_CANVAS_HEIGHT: usize = 130 + LANG_TAG_MARGIN;
const LANG_TAG_FONT_SIZE: f32 = 96.0;
const LANG_TAG_PADDING: f32 = 8.0;
const LANG_TAG_ALPHA: f32 = 0.2;

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

/// Glyph bitmaps are a pure function of (font, char, size), but fontdue
/// recomputes one from the vector outline on every `rasterize()` call —
/// with update_overlay/update_keyboard_overlay uploading unconditionally
/// every render tick (~8ms — see their own comments on why an "only when
/// content changed" version of that made input lag, since reverted),
/// every button's every character was getting fully re-rasterized from
/// scratch that often. Cached here instead, keyed by the font's own
/// pointer identity (only ever two distinct `Font`s exist — see font()/
/// bold_font(), both behind a `OnceLock` so the same instance is reused
/// for a value's whole lifetime — a full `Font` isn't `Hash`/`Eq`, so this
/// sidesteps needing that) and the size's bit pattern (float equality is
/// otherwise iffy, but every caller here always passes one of a small,
/// fixed set of size constants, so bit-identical repeats are the norm).
fn rasterize_cached(font: &Font, ch: char, size: f32) -> (fontdue::Metrics, Arc<Vec<u8>>) {
    static CACHE: OnceLock<Mutex<HashMap<(usize, char, u32), (fontdue::Metrics, Arc<Vec<u8>>)>>> = OnceLock::new();
    let cache = CACHE.get_or_init(|| Mutex::new(HashMap::new()));
    let key = (font as *const Font as usize, ch, size.to_bits());
    let mut cache = cache.lock().unwrap();
    if let Some(entry) = cache.get(&key) {
        return entry.clone();
    }
    let (metrics, bitmap) = font.rasterize(ch, size);
    let entry = (metrics, Arc::new(bitmap));
    cache.insert(key, entry.clone());
    entry
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
    // Every pixel away from the four corner arcs (the vast majority of any
    // key/panel) lands here — same result as the general formula below
    // (hypot(0, 0) == 0), just without the hypot, which dominated the
    // keyboard's per-frame raster cost.
    if qx <= 0.0 && qy <= 0.0 {
        return (0.5 - (qx.max(qy) - r)).clamp(0.0, 1.0);
    }
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
        let (metrics, bitmap) = rasterize_cached(font, ch, size);
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

/// Like draw_line_centered, but colors each character FINAL_TEXT_COLOR or
/// INTERIM_TEXT_COLOR depending on whether its position in the *combined*
/// final+interim text (`global_index` = this line's starting offset into
/// that combined text) falls before or after `final_char_count`, the
/// boundary between the two.
fn draw_line_mixed(buf: &mut [u8], font: &Font, line: &str, size: f32, baseline_y: f32, global_index: usize, final_char_count: usize) {
    let width = layout_width(font, line, size);
    let mut pen_x = (CANVAS_WIDTH as f32 - width) / 2.0;

    for (i, ch) in line.chars().enumerate() {
        let color = if global_index + i < final_char_count { FINAL_TEXT_COLOR } else { INTERIM_TEXT_COLOR };
        let (metrics, bitmap) = rasterize_cached(font, ch, size);
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

/// Wraps `final_text` + `interim_text` (joined with a space when both are
/// non-empty, matching how consecutive Final results are joined in main.js)
/// into up to MAX_TEXT_LINES lines, shrinking the font first (same as the
/// old single-line auto-shrink) and truncating with "…" only as a last
/// resort if it still doesn't fit at MIN_FONT_SIZE. Lines are vertically
/// centered within the fixed text region; each character is colored
/// FINAL_TEXT_COLOR or INTERIM_TEXT_COLOR by draw_line_mixed depending on
/// which side of the final/interim boundary it falls on.
// `cursor` (a char index into `final_text` — the VR keyboard, the only
// thing that ever sets this, never touches interim_text) draws a blinking-
// less bar at that position instead — see TASK.md #23: this is what
// replaced the VR keyboard's own now-removed text/cursor preview (see
// render_keyboard below), so the box the user already had for pending text
// is the one place a cursor shows, rather than duplicating it.
fn draw_text_block(
    buf: &mut [u8],
    font: &Font,
    final_text: &str,
    interim_text: &str,
    cursor: Option<usize>,
    highlight_range: Option<(usize, usize)>,
) {
    // cursor.is_some() (VR keyboard open, nothing typed yet) still needs a
    // (lone, centered) cursor bar drawn — wrap_lines("") yields one empty
    // line, so the loop below handles this fine without special-casing it
    // further than just not bailing out here.
    if final_text.is_empty() && interim_text.is_empty() && cursor.is_none() {
        return;
    }

    let separator = if !final_text.is_empty() && !interim_text.is_empty() { " " } else { "" };
    let combined = format!("{final_text}{separator}{interim_text}");
    let final_char_count = final_text.chars().count() + separator.chars().count();

    let max_width = CANVAS_WIDTH as f32 - 48.0;
    let mut size = BASE_FONT_SIZE;
    let mut lines = wrap_lines(font, &combined, size, max_width);
    while size > MIN_FONT_SIZE
        && (lines.len() > MAX_TEXT_LINES || lines.len() as f32 * size * LINE_HEIGHT_FACTOR > TEXT_REGION_HEIGHT)
    {
        size -= 1.0;
        lines = wrap_lines(font, &combined, size, max_width);
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

    let mut global_index = 0usize;
    for (i, line) in lines.iter().enumerate() {
        let baseline_y = start_y + (i as f32 + 0.8) * line_height;
        let line_len = line.chars().count();
        // Drawn *before* the text itself (a background band the glyphs sit
        // on top of) — currently used to mark the hiragana run 変換 (henkan)
        // is about to act on / just converted, since otherwise there's no
        // way to tell where that boundary is (see handleHenkanPress in
        // main.js). Clipped to this line's own [global_index, +line_len)
        // span since the range can cross a wrap boundary.
        if let Some((hs, he)) = highlight_range {
            if he > hs && hs < global_index + line_len && he > global_index {
                let local_start = hs.saturating_sub(global_index).min(line_len);
                let local_end = he.saturating_sub(global_index).min(line_len);
                if local_end > local_start {
                    let x0 = line_char_x(font, line, size, local_start);
                    let x1 = line_char_x(font, line, size, local_end);
                    draw_rect(buf, CANVAS_WIDTH, x0, baseline_y - size * 0.85, (x1 - x0).max(1.0), size * 1.05, 0.0, HIGHLIGHT_COLOR, HIGHLIGHT_ALPHA);
                }
            }
        }
        draw_line_mixed(buf, font, line, size, baseline_y, global_index, final_char_count);
        if let Some(c) = cursor {
            if c >= global_index && c <= global_index + line_len && (c < global_index + line_len || i == lines.len() - 1) {
                let x = line_char_x(font, line, size, c - global_index);
                draw_rect(buf, CANVAS_WIDTH, x, baseline_y - size * 0.85, 2.0, size * 1.05, 0.0, CURSOR_COLOR, 1.0);
            }
        }
        global_index += line_len;
    }
}

/// Pen-x (within a *centered* line, same layout draw_line_centered/
/// draw_line_mixed use) that character `local_index` starts at — walks the
/// same advance-width accumulation those do, just stopping early instead of
/// drawing. `local_index == line.chars().count()` (one past the last
/// character) is valid and returns the position just after the last glyph.
fn line_char_x(font: &Font, line: &str, size: f32, local_index: usize) -> f32 {
    let width = layout_width(font, line, size);
    let mut pen_x = (CANVAS_WIDTH as f32 - width) / 2.0;
    for (i, ch) in line.chars().enumerate() {
        if i == local_index {
            return pen_x;
        }
        pen_x += font.metrics(ch, size).advance_width;
    }
    pen_x
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

/// Renders the whole HUD (rounded box + wrapped final/interim text + optional
/// ending preview + optional progress bar) into a fresh RGBA8 buffer, tightly
/// packed, top-to-bottom rows — the exact layout SetOverlayTexture's
/// underlying D3D11 texture expects. Always fully opaque content — the
/// fade-in/fade-out is applied compositor-side via SetOverlayAlpha instead
/// (see lib.rs's update_overlay for why), so an unchanged box never has to
/// be re-rasterized just because its fade level moved.
pub fn render(
    final_text: &str,
    interim_text: &str,
    ending_preview: Option<&str>,
    progress: Option<&OverlayProgress>,
    cursor: Option<usize>,
    highlight_range: Option<(usize, usize)>,
) -> Vec<u8> {
    // The box itself never changes, but its per-pixel coverage+blend pass
    // was redone on every render — cached once and copied instead.
    static BOX: OnceLock<Vec<u8>> = OnceLock::new();
    let mut buf = BOX
        .get_or_init(|| {
            let mut buf = vec![0u8; CANVAS_WIDTH * CANVAS_HEIGHT * 4];
            draw_box(&mut buf);
            buf
        })
        .clone();

    if let Some(font) = font() {
        draw_text_block(&mut buf, font, final_text, interim_text, cursor, highlight_range);
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

    // Offset by LANG_TAG_MARGIN so the text's own top-left (not the
    // canvas's) is what conceptually sits at (0, 0) — lib.rs adds the same
    // margin back when computing the overlay's world transform, so this
    // margin only ever affects clipping room, never the resting position.
    let margin = LANG_TAG_MARGIN as f32;
    let anchor_x = margin + LANG_TAG_PADDING + layout_width(font, label, LANG_TAG_FONT_SIZE) / 2.0;
    let anchor_y = margin + LANG_TAG_PADDING + LANG_TAG_FONT_SIZE * 0.8;
    let baseline_y = anchor_y;
    let mut pen_x = anchor_x - layout_width(font, label, size) / 2.0;

    for ch in label.chars() {
        let (metrics, bitmap) = rasterize_cached(font, ch, size);
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

// --- VR flick-input keyboard (TASK.md #23) ---
//
// Deliberately a "dumb" renderer with no layout/keymap logic of its own:
// main.js owns the entire key grid (positions, labels, flick mapping) as
// plain data and sends it here each frame via update_keyboard_overlay
// (lib.rs) — the alternative (duplicating the layout in both Rust and JS)
// is a standing invitation for the two to quietly disagree about where a
// button actually is. Ray casting/hit-testing against this same layout
// happens on the JS side too, for the same reason.

// 823, not 640 — see main.js's VR_KB_CANVAS_HEIGHT for the derivation
// (the panel needed a *different* shrink percentage for width vs. height,
// which — since an OpenVR overlay's world height always just follows its
// texture's own pixel aspect ratio, there's no separate "set height" call
// — meant changing this pixel height rather than lib.rs's
// KEYBOARD_WORLD_WIDTH alone). Must stay in sync with main.js's own copy
// of this constant, same as KEYBOARD_CANVAS_WIDTH always has.
pub const KEYBOARD_CANVAS_WIDTH: usize = 900;
pub const KEYBOARD_CANVAS_HEIGHT: usize = 823;
const KEYBOARD_BG_ALPHA: f32 = 0.88;
const KEYBOARD_BG_COLOR: [u8; 3] = [12, 12, 18];
const KEY_COLOR: [u8; 3] = [40, 44, 56];
const KEY_HIGHLIGHT_COLOR: [u8; 3] = [70, 120, 210];
// The henkan candidate list's currently-active entry (see KeyButton's own
// `selected` field) — deliberately a different hue from KEY_HIGHLIGHT_COLOR
// (pointer hover) so the two states stay visually distinguishable when a
// candidate button happens to also be under the pointer.
const SELECTED_COLOR: [u8; 3] = [190, 130, 40];
const KEY_LABEL_COLOR: [u8; 3] = [235, 235, 235];
const KEY_RADIUS: f32 = 12.0;
const KEY_LABEL_SIZE: f32 = 30.0;
// Also used by draw_text_block's cursor bar in the (separate) confirm/
// discard box canvas above — not keyboard-specific despite living in this
// section, just declared here alongside the keyboard's own cursor-adjacent
// constants.
const CURSOR_COLOR: [u8; 3] = [255, 210, 90];
// Background band behind the hiragana run 変換 (henkan) is about to
// convert / just converted — see draw_text_block's own comment.
const HIGHLIGHT_COLOR: [u8; 3] = [90, 160, 255];
const HIGHLIGHT_ALPHA: f32 = 0.35;

/// One button in the keyboard grid, positioned/labeled entirely by the
/// caller (see this section's own top comment) — `x`/`y`/`w`/`h` are pixel
/// coordinates within KEYBOARD_CANVAS_WIDTH x KEYBOARD_CANVAS_HEIGHT.
// PartialEq: render_keyboard's frame memo compares a tick's buttons against
// the last frame's (CPU raster only — the GPU upload still runs every tick).
#[derive(PartialEq)]
pub struct KeyButton {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
    pub label: String,
    // The pointer ray is currently over this button (computed server-side
    // each call, see lib.rs's update_keyboard_overlay — not the same thing
    // as `engaged` below, which main.js controls directly).
    pub highlighted: bool,
    // main.js wants this button drawn as the currently-active choice
    // (the henkan candidate list's selected entry) — a plain caller-set
    // flag, independent of pointer hover.
    pub selected: bool,
    // Some only while this kana key's trigger is held (mid-flick) — see
    // draw_flick_cross. Cell positions/labels come from main.js
    // (vrKeyboardFlickCells/resolveFlickChar), per this section's own "dumb
    // renderer" comment.
    pub flick: Option<FlickCross>,
}

/// One cell of a held key's flick cross, in keyboard-canvas pixels.
#[derive(serde::Deserialize, PartialEq)]
pub struct FlickCell {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
    pub label: String,
    // The direction releasing right now would commit.
    pub selected: bool,
}

/// A direction is None when flicking that way gives nothing distinct from
/// the center (e.g. the 、 key's down).
#[derive(serde::Deserialize, PartialEq)]
pub struct FlickCross {
    pub center: FlickCell,
    pub up: Option<FlickCell>,
    pub left: Option<FlickCell>,
    pub right: Option<FlickCell>,
    pub down: Option<FlickCell>,
}

/// Fills an arbitrary `rw`x`rh` rounded rect at (`rx`,`ry`) within a buffer
/// of `canvas_width` (height inferred from the buffer's own length) — like
/// draw_box above, but not pinned to the module-level CANVAS_WIDTH/HEIGHT,
/// so the keyboard's own differently-sized canvas (and any sub-rect within
/// it, i.e. each key) can use it too.
fn draw_rect(buf: &mut [u8], canvas_width: usize, rx: f32, ry: f32, rw: f32, rh: f32, radius: f32, color: [u8; 3], alpha: f32) {
    let canvas_height = buf.len() / canvas_width / 4;
    let x0 = rx.floor().max(0.0) as usize;
    let y0 = ry.floor().max(0.0) as usize;
    let x1 = ((rx + rw).ceil() as usize).min(canvas_width);
    let y1 = ((ry + rh).ceil() as usize).min(canvas_height);
    // Fully covered pixels all blend at the same alpha, and almost always
    // over the same uniform background (a key's interior over the plain
    // panel), so the last one's result is remembered and reused whenever
    // the destination pixel matches — byte-identical to calling blend()
    // again, without its per-channel float math, which dominated a full
    // keyboard redraw (~20ms/frame in a release build before this).
    let mut last_full: Option<([u8; 4], [u8; 4])> = None;
    for y in y0..y1 {
        for x in x0..x1 {
            let coverage = rounded_rect_coverage(x as f32 + 0.5 - rx, y as f32 + 0.5 - ry, rw, rh, radius);
            if coverage <= 0.0 {
                continue;
            }
            let idx = (y * canvas_width + x) * 4;
            if coverage < 1.0 {
                blend(buf, idx, color, coverage * alpha);
                continue;
            }
            // A fully opaque, fully covered pixel just replaces what's
            // there — exactly what blend() would compute (out_a = 1,
            // out = src). The flick cross (every layer alpha 1.0, redrawn
            // every frame while a key is held) is almost entirely these.
            if alpha >= 1.0 {
                buf[idx..idx + 3].copy_from_slice(&color);
                buf[idx + 3] = 255;
                continue;
            }
            let dst: [u8; 4] = buf[idx..idx + 4].try_into().unwrap();
            match last_full {
                Some((prev_dst, out)) if prev_dst == dst => buf[idx..idx + 4].copy_from_slice(&out),
                _ => {
                    blend(buf, idx, color, alpha);
                    last_full = Some((dst, buf[idx..idx + 4].try_into().unwrap()));
                }
            }
        }
    }
}

// Floor for draw_label_centered's auto-shrink — small enough to still fit a
// fairly long template phrase across a couple of lines within one key,
// without shrinking to the point of being unreadable.
const KEY_LABEL_MIN_SIZE: f32 = 14.0;
const KEY_LABEL_PADDING: f32 = 10.0; // each side, kept clear of the key's own rounded corners

/// Draws `text` centered in a `box_w`x`box_h` area centered on (`cx`,`cy`)
/// — like draw_line_centered above, but centered on an arbitrary point/box
/// instead of always horizontally centered across the whole (differently
/// sized) canvas, since each key's label needs to center on that one key.
/// Starts at `base_size` and, same idea as draw_text_block's own shrink+
/// wrap loop for the confirm/discard box, shrinks (down to
/// KEY_LABEL_MIN_SIZE) and wraps to multiple lines as needed to fit —
/// kana/digit/mode labels are always short enough to need neither and just
/// draw at `base_size` on one line as before, but a template phrase (see
/// main.js's "template" mode) can be much longer than fits a single key at
/// full size. No "…" truncation.
fn draw_label_centered(buf: &mut [u8], canvas_width: usize, font: &Font, text: &str, cx: f32, cy: f32, box_w: f32, box_h: f32, base_size: f32, color: [u8; 3]) {
    let canvas_height = buf.len() / canvas_width / 4;
    let max_w = (box_w - KEY_LABEL_PADDING * 2.0).max(1.0);
    let max_h = (box_h - KEY_LABEL_PADDING).max(1.0);

    let mut size = base_size;
    let mut lines = wrap_lines(font, text, size, max_w);
    while size > KEY_LABEL_MIN_SIZE && lines.len() as f32 * size * LINE_HEIGHT_FACTOR > max_h {
        size -= 1.0;
        lines = wrap_lines(font, text, size, max_w);
    }

    let line_height = size * LINE_HEIGHT_FACTOR;
    let start_y = cy - lines.len() as f32 * line_height / 2.0;

    for (i, line) in lines.iter().enumerate() {
        let baseline_y = start_y + (i as f32 + 0.8) * line_height;
        let width = layout_width(font, line, size);
        let mut pen_x = cx - width / 2.0;
        for ch in line.chars() {
            let (metrics, bitmap) = rasterize_cached(font, ch, size);
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
                    if px < 0.0 || py < 0.0 || px >= canvas_width as f32 || py >= canvas_height as f32 {
                        continue;
                    }
                    let idx = (py as usize * canvas_width + px as usize) * 4;
                    blend(buf, idx, color, coverage);
                }
            }
            pen_x += metrics.advance_width;
        }
    }
}

/// Renders the whole keyboard canvas: background panel and every key in
/// `buttons` (see this section's own top comment for why the layout itself
/// is entirely caller-provided). No text/cursor preview of its own — that
/// lives in the existing confirm/discard box instead (see draw_text_block's
/// `cursor` param), so there's exactly one place showing pending text
/// rather than two that could show it differently for a tick.
///
/// Always fully opaque content — fading is compositor-side (SetOverlayAlpha,
/// see lib.rs's update_keyboard_overlay), same as render()'s box.
///
/// Memoized at two levels, because redrawing every key from scratch every
/// tick measured ~15-20ms/frame in a release build and ~70-100ms in a debug
/// (`tauri dev`) build — far over the ~8ms render tick, which is what made
/// the keyboard (and, through the shared OpenVR mutex, every other overlay
/// command and hotkey_state too) feel heavy and its fade visibly step:
/// - `cache.frame`: the last finished frame and the exact `buttons` it was
///   drawn from. Most ticks (pointer resting on one key, or a flick held
///   without changing direction) match it exactly and draw nothing at all.
/// - `cache.base`: every key in its *resting* state (no pointer hover, no
///   flick cross). That only changes when the layout itself does (mode
///   switch, 変換 candidates, a label change); otherwise a new frame only
///   redraws the hovered key(s) and any flick cross on top of it — a few
///   thousand pixels instead of the whole canvas.
///
/// This is purely a CPU-side memo of a deterministic function of `buttons`:
/// the result is (up to the note in the hover loop below) the same pixels a
/// full redraw would produce, and lib.rs still uploads it to the GPU every
/// tick regardless — so it does *not* reintroduce the "skip the upload when
/// nothing changed" design that caused the one-input-behind bug.
pub fn render_keyboard(cache: &mut KeyboardCache, buttons: Vec<KeyButton>) -> &[u8] {
    let panel = keyboard_panel();
    let Some(font) = font() else {
        return panel;
    };

    if cache.frame.as_ref().is_some_and(|(prev, _)| *prev != buttons) {
        cache.frame = None;
    }
    if cache.frame.is_none() {
        let pixels = compose_keyboard_frame(&mut cache.base, panel, font, &buttons);
        cache.frame = Some((buttons, pixels));
    }
    &cache.frame.as_ref().expect("filled just above").1
}

fn compose_keyboard_frame(base_cache: &mut Option<(Vec<BaseKey>, Vec<u8>)>, panel: &[u8], font: &Font, buttons: &[KeyButton]) -> Vec<u8> {
    let keys: Vec<BaseKey> = buttons
        .iter()
        .map(|b| BaseKey { x: b.x, y: b.y, w: b.w, h: b.h, label: b.label.clone(), selected: b.selected })
        .collect();
    if base_cache.as_ref().is_some_and(|(prev, _)| *prev != keys) {
        *base_cache = None;
    }
    let (_, base) = base_cache.get_or_insert_with(|| {
        let mut pixels = panel.to_vec();
        for btn in buttons {
            let color = if btn.selected { SELECTED_COLOR } else { KEY_COLOR };
            draw_key(&mut pixels, font, btn, color);
        }
        (keys, pixels)
    });
    let mut buf = base.clone();

    // `selected` wins over hover (same precedence as always), so a selected
    // key's base-layer look is already final.
    for btn in buttons.iter().filter(|b| b.highlighted && !b.selected) {
        // Put the bare panel back under this key before redrawing it —
        // drawing the highlight color straight over the resting key would
        // blend with it (keys are 0.95 alpha) and come out slightly off.
        // Exact because keys never overlap (computeVrKeyboardLayout keeps a
        // >=10px gap between every pair), so this rect only ever contains
        // this one key's own pixels. (A template label so long it overflows
        // its key vertically even at KEY_LABEL_MIN_SIZE would leave its
        // spill-over outside the rect drawn twice while hovered — same
        // overflow that was already there, just a hair brighter.)
        let x0 = btn.x.floor().max(0.0) as usize;
        let y0 = btn.y.floor().max(0.0) as usize;
        let x1 = ((btn.x + btn.w).ceil() as usize).min(KEYBOARD_CANVAS_WIDTH);
        let y1 = ((btn.y + btn.h).ceil() as usize).min(KEYBOARD_CANVAS_HEIGHT);
        for y in y0..y1 {
            let row = (y * KEYBOARD_CANVAS_WIDTH + x0) * 4..(y * KEYBOARD_CANVAS_WIDTH + x1) * 4;
            buf[row.clone()].copy_from_slice(&panel[row]);
        }
        draw_key(&mut buf, font, btn, KEY_HIGHLIGHT_COLOR);
    }
    // After every key, not inside the loop: the cross covers neighboring
    // keys, and any drawn later would paint over it.
    for cross in buttons.iter().filter_map(|b| b.flick.as_ref()) {
        draw_flick_cross(&mut buf, font, cross);
    }

    buf
}

/// render_keyboard's memos (see its own comment) — owned by the caller
/// (lib.rs's Hud) so they live exactly as long as the keyboard overlay they
/// belong to.
#[derive(Default)]
pub struct KeyboardCache {
    base: Option<(Vec<BaseKey>, Vec<u8>)>,
    frame: Option<(Vec<KeyButton>, Vec<u8>)>,
}

/// Everything about a key that affects its resting-state (base layer) look.
#[derive(PartialEq)]
struct BaseKey {
    x: f32,
    y: f32,
    w: f32,
    h: f32,
    label: String,
    selected: bool,
}

// Same as render()'s box: the full-canvas panel (the single largest
// per-pixel pass here, ~740k px) is static, so it's computed once.
fn keyboard_panel() -> &'static Vec<u8> {
    static PANEL: OnceLock<Vec<u8>> = OnceLock::new();
    PANEL.get_or_init(|| {
        let mut buf = vec![0u8; KEYBOARD_CANVAS_WIDTH * KEYBOARD_CANVAS_HEIGHT * 4];
        draw_rect(
            &mut buf,
            KEYBOARD_CANVAS_WIDTH,
            0.0,
            0.0,
            KEYBOARD_CANVAS_WIDTH as f32,
            KEYBOARD_CANVAS_HEIGHT as f32,
            CORNER_RADIUS,
            KEYBOARD_BG_COLOR,
            KEYBOARD_BG_ALPHA,
        );
        buf
    })
}

fn draw_key(buf: &mut [u8], font: &Font, btn: &KeyButton, color: [u8; 3]) {
    draw_rect(buf, KEYBOARD_CANVAS_WIDTH, btn.x, btn.y, btn.w, btn.h, KEY_RADIUS, color, 0.95);
    draw_label_centered(buf, KEYBOARD_CANVAS_WIDTH, font, &btn.label, btn.x + btn.w / 2.0, btn.y + btn.h / 2.0, btn.w, btn.h, KEY_LABEL_SIZE, KEY_LABEL_COLOR);
}

// Phone flick-keyboard style (iOS/Gboard's press-and-hold guide): the
// flick characters are drawn *on top of the neighboring keys* in each
// direction, so the held key and its 4 neighbors read as one solid plus-
// shaped block — no connector lines or floating bubbles (two earlier
// versions tried those; the user rejected both). The gaps between the
// center and each arm are filled in ("bridges") so it stays a single
// connected shape rather than 5 loose tiles. Whichever cell releasing now
// would commit is lit in the accent color, like the finger-under petal on a
// phone. Fully opaque so the covered keys' own labels don't bleed through.
const FLICK_OUTLINE_COLOR: [u8; 3] = [6, 6, 10];
const FLICK_OUTLINE_WIDTH: f32 = 4.0;
// Seams between cells: each cell is filled inset by this over a darker base,
// so adjacent cells (e.g. an edge key's in-key petal, see main.js's
// vrKeyboardFlickCells) still read as separate targets.
const FLICK_BASE_COLOR: [u8; 3] = [48, 54, 70];
const FLICK_CELL_INSET: f32 = 3.0;
const FLICK_CELL_COLOR: [u8; 3] = [92, 100, 124];
const FLICK_SELECTED_COLOR: [u8; 3] = [60, 140, 255];
const FLICK_LABEL_SIZE: f32 = 42.0;

type Rect = (f32, f32, f32, f32);

fn cell_rect(c: &FlickCell) -> Rect {
    (c.x, c.y, c.w, c.h)
}

// Fills the gap between the center and an arm, spanning only where the two
// overlap on the other axis. Zero/negative gaps (arm touches the center)
// produce nothing.
fn flick_bridge(center: Rect, arm: Rect) -> Option<Rect> {
    let (cx, cy, cw, ch) = center;
    let (ax, ay, aw, ah) = arm;
    let (x0, x1) = (cx.max(ax), (cx + cw).min(ax + aw));
    let (y0, y1) = (cy.max(ay), (cy + ch).min(ay + ah));
    let rect = if ay + ah <= cy {
        (x0, ay + ah, x1 - x0, cy - (ay + ah))
    } else if ay >= cy + ch {
        (x0, cy + ch, x1 - x0, ay - (cy + ch))
    } else if ax + aw <= cx {
        (ax + aw, y0, cx - (ax + aw), y1 - y0)
    } else {
        (cx + cw, y0, ax - (cx + cw), y1 - y0)
    };
    (rect.2 > 0.0 && rect.3 > 0.0).then_some(rect)
}

fn draw_flick_cross(buf: &mut [u8], font: &Font, cross: &FlickCross) {
    let cells: Vec<&FlickCell> = [Some(&cross.center), cross.up.as_ref(), cross.left.as_ref(), cross.right.as_ref(), cross.down.as_ref()]
        .into_iter()
        .flatten()
        .collect();
    let center = cell_rect(&cross.center);
    let bridges: Vec<Rect> = cells[1..].iter().filter_map(|c| flick_bridge(center, cell_rect(c))).collect();
    let shapes: Vec<(Rect, f32)> = cells.iter().map(|c| (cell_rect(c), KEY_RADIUS)).chain(bridges.iter().map(|&r| (r, 0.0))).collect();

    let o = FLICK_OUTLINE_WIDTH;
    for &((x, y, w, h), r) in &shapes {
        let r = if r > 0.0 { r + o } else { 0.0 };
        draw_rect(buf, KEYBOARD_CANVAS_WIDTH, x - o, y - o, w + o * 2.0, h + o * 2.0, r, FLICK_OUTLINE_COLOR, 1.0);
    }
    for &((x, y, w, h), r) in &shapes {
        draw_rect(buf, KEYBOARD_CANVAS_WIDTH, x, y, w, h, r, FLICK_BASE_COLOR, 1.0);
    }
    let i = FLICK_CELL_INSET;
    for c in &cells {
        let color = if c.selected { FLICK_SELECTED_COLOR } else { FLICK_CELL_COLOR };
        draw_rect(buf, KEYBOARD_CANVAS_WIDTH, c.x + i, c.y + i, c.w - i * 2.0, c.h - i * 2.0, KEY_RADIUS - i, color, 1.0);
        draw_label_centered(buf, KEYBOARD_CANVAS_WIDTH, font, &c.label, c.x + c.w / 2.0, c.y + c.h / 2.0, c.w, c.h, FLICK_LABEL_SIZE, KEY_LABEL_COLOR);
    }
}

// A visual laser beam, attached (via set_transform_tracked_device_relative
// in lib.rs) to whichever controller last pulled its trigger — SteamVR
// tracks it automatically from there, no per-frame transform math needed on
// this end. Just a thin, fixed-content strip; only its overlay
// visibility/transform ever changes, so it's only uploaded for the first
// few frames after each show (see lib.rs's PointerSet::uploads_left).
pub const POINTER_CANVAS_WIDTH: usize = 8;
pub const POINTER_CANVAS_HEIGHT: usize = 8;

pub fn render_pointer_dot() -> Vec<u8> {
    let mut buf = vec![0u8; POINTER_CANVAS_WIDTH * POINTER_CANVAS_HEIGHT * 4];
    for px in buf.chunks_exact_mut(4) {
        px[0] = 255;
        px[1] = 210;
        px[2] = 90;
        px[3] = 230;
    }
    buf
}

// The beam that visually connects the controller to the dot above. A very
// wide/short texture so that, once stretched across a POINTER_BEAM_LENGTH-
// wide overlay (see lib.rs), it reads as a thin line rather than a bar —
// the actual thinness comes entirely from this aspect ratio, not from any
// alpha shaping. Same color as the dot for visual continuity; alpha ramps
// from dim to bright across the strip so the beam reads as "coming from the
// hand" rather than a flat bar (which edge is the hand vs. the tip depends
// on OpenVR's own U-axis convention for overlay textures, which hasn't been
// empirically confirmed against a headset — worst case the ramp direction
// is reversed, which doesn't change the beam's core intent of showing where
// the beam that connects the controller to the dot is).
pub const POINTER_BEAM_CANVAS_WIDTH: usize = 600;
// An overlay's height in world space follows its texture's own aspect
// ratio (there's no separate "set height" call) times whatever set_width
// is currently scaling the length axis to (see lib.rs's dynamic
// `distance`) — so this ratio, not an absolute pixel count, is what
// actually controls the beam's visible thickness. 2px/600px = 1/3 of the
// original 2px/200px (1%) — still read as too thick at 1% even after
// POINTER_MAX_DISTANCE capped the length (see its own comment) and stopped
// the beam from ever covering the whole screen; it'll read a bit thicker
// at longer distances and thinner at shorter ones, since a fixed texture
// can't track thickness independently of length.
pub const POINTER_BEAM_CANVAS_HEIGHT: usize = 2;

pub fn render_pointer_beam() -> Vec<u8> {
    let mut buf = vec![0u8; POINTER_BEAM_CANVAS_WIDTH * POINTER_BEAM_CANVAS_HEIGHT * 4];
    for y in 0..POINTER_BEAM_CANVAS_HEIGHT {
        for x in 0..POINTER_BEAM_CANVAS_WIDTH {
            let t = x as f32 / (POINTER_BEAM_CANVAS_WIDTH - 1) as f32;
            let alpha = (60.0 + t * 160.0) as u8;
            let idx = (y * POINTER_BEAM_CANVAS_WIDTH + x) * 4;
            buf[idx] = 255;
            buf[idx + 1] = 210;
            buf[idx + 2] = 90;
            buf[idx + 3] = alpha;
        }
    }
    buf
}

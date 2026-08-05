mod overlay;
mod overlay_gpu;

use std::fs;
use std::net::UdpSocket;
use std::path::Path;
use std::sync::Mutex;

use rosc::{OscMessage, OscPacket, OscType};
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use voicevox_core::blocking::{Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile};
use voicevox_core::{StyleId, VoiceModelMeta};

// This whole app-local directory was populated once via `voicevox_core/download.exe`
// (see README/chat history) — it's not fetched at runtime.
// 小夜/SAYO, ノーマル style (id 46) is the one character bundled with the app,
// always loaded at startup. Additional characters are downloaded on demand
// from the General settings screen (see character_catalog/download_character/load_character);
// which style_id to actually speak with is chosen on the frontend and passed
// into synthesize() per call.
const VOICEVOX_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/voicevox_core");

const VRCHAT_OSC_ADDR: &str = "127.0.0.1:9000";

struct VoicevoxState(Mutex<Synthesizer<OpenJtalk>>);

fn init_synthesizer() -> anyhow::Result<Synthesizer<OpenJtalk>> {
    let ort = Onnxruntime::load_once()
        .filename(format!("{VOICEVOX_DIR}/onnxruntime/lib/voicevox_onnxruntime.dll"))
        .perform()?;
    let ojt = OpenJtalk::new(format!("{VOICEVOX_DIR}/dict/open_jtalk_dic_utf_8-1.11"))?;
    let synth = Synthesizer::builder(ort).text_analyzer(ojt).build()?;

    let model = VoiceModelFile::open(format!("{VOICEVOX_DIR}/models/vvms/15.vvm"))?;
    synth.load_voice_model(&model)?;

    // Re-load any characters downloaded via the General settings screen in a
    // previous session (15.vvm is already loaded above, skip it here).
    if let Ok(dir) = fs::read_dir(format!("{VOICEVOX_DIR}/models/vvms")) {
        for entry in dir.flatten() {
            let path = entry.path();
            if path.file_name().and_then(|n| n.to_str()) == Some("15.vvm") {
                continue;
            }
            if path.extension().and_then(|e| e.to_str()) != Some("vvm") {
                continue;
            }
            if let Ok(model) = VoiceModelFile::open(&path) {
                let _ = synth.load_voice_model(&model);
            }
        }
    }

    Ok(synth)
}

#[tauri::command]
fn synthesize(
    text: String,
    style_id: u32,
    speed_scale: Option<f32>,
    pitch_scale: Option<f32>,
    intonation_scale: Option<f32>,
    volume_scale: Option<f32>,
    state: State<VoicevoxState>,
) -> Result<Vec<u8>, String> {
    let synth = state.0.lock().map_err(|e| e.to_string())?;
    let style_id = StyleId(style_id);

    let mut query = synth.create_audio_query(&text, style_id).map_err(|e| e.to_string())?;
    if let Some(v) = speed_scale {
        query.speed_scale = v;
    }
    if let Some(v) = pitch_scale {
        query.pitch_scale = v;
    }
    if let Some(v) = intonation_scale {
        query.intonation_scale = v;
    }
    if let Some(v) = volume_scale {
        query.volume_scale = v;
    }

    synth.synthesis(&query, style_id).perform().map_err(|e| e.to_string())
}

#[derive(Serialize, Clone)]
struct CatalogStyle {
    id: u32,
    name: String,
}

#[derive(Serialize, Clone)]
struct CatalogCharacter {
    name: String,
    styles: Vec<CatalogStyle>,
}

#[derive(Serialize, Clone)]
struct CatalogEntry {
    #[serde(rename = "vvmFile")]
    vvm_file: String,
    downloaded: bool,
    characters: Vec<CatalogCharacter>,
}

// Only filenames of the shape "<digits>.vvm" are ever handed to this from the
// frontend (they come from our own catalog, never free-typed), but validate
// before it touches a path or a Command invocation regardless.
fn valid_vvm_filename(name: &str) -> bool {
    name.strip_suffix(".vvm").is_some_and(|n| !n.is_empty() && n.chars().all(|c| c.is_ascii_digit()))
}

// Parses the talk-model table VOICEVOX itself ships in models/README.txt
// (the same file the "keep it in sync" README table for humans), grouping
// rows by VVM file so the frontend can offer "add this character" as one
// download per VVM — some VVMs bundle more than one character.
fn parse_character_catalog() -> Vec<CatalogEntry> {
    let readme = fs::read_to_string(format!("{VOICEVOX_DIR}/models/README.txt")).unwrap_or_default();
    let talk_section = readme.split("## トーク").nth(1).and_then(|s| s.split("## ソング").next()).unwrap_or("");

    let mut entries: Vec<CatalogEntry> = Vec::new();
    for line in talk_section.lines() {
        let line = line.trim();
        if !line.starts_with('|') || line.starts_with("|---") {
            continue;
        }
        let cols: Vec<&str> = line.trim_matches('|').split('|').map(str::trim).collect();
        let [vvm_file, character, style_name, style_id] = cols[..] else { continue };
        if vvm_file == "VVMファイル名" {
            continue;
        }
        let Ok(style_id) = style_id.parse::<u32>() else { continue };
        if !valid_vvm_filename(vvm_file) {
            continue;
        }

        let entry_idx = match entries.iter().position(|e: &CatalogEntry| e.vvm_file == vvm_file) {
            Some(i) => i,
            None => {
                let downloaded = Path::new(&format!("{VOICEVOX_DIR}/models/vvms/{vvm_file}")).exists();
                entries.push(CatalogEntry {
                    vvm_file: vvm_file.to_string(),
                    downloaded,
                    characters: Vec::new(),
                });
                entries.len() - 1
            }
        };
        let entry = &mut entries[entry_idx];
        let character_idx = match entry.characters.iter().position(|c| c.name == character) {
            Some(i) => i,
            None => {
                entry.characters.push(CatalogCharacter { name: character.to_string(), styles: Vec::new() });
                entry.characters.len() - 1
            }
        };
        entry.characters[character_idx].styles.push(CatalogStyle { id: style_id, name: style_name.to_string() });
    }
    entries
}

#[tauri::command]
fn character_catalog() -> Vec<CatalogEntry> {
    parse_character_catalog()
}

// download.exe's `models` target pages through the license text and prompts
// for a y/n/r confirmation on stdin — that only works from a real terminal,
// so shelling out to it from a GUI button click fails instantly (no TTY to
// answer the prompt). VOICEVOX publishes VVM files as plain GitHub release
// assets under predictable names, so fetch the file directly instead via
// GitHub's "latest release" convenience URL (redirects to the actual asset,
// no API call or auth needed). Downloading here implies the same "VOICEVOX
// 音声モデル利用規約" (credit requirement) that download.exe's prompt covers.
const VVM_RELEASE_BASE_URL: &str = "https://github.com/VOICEVOX/voicevox_vvm/releases/latest/download";

#[tauri::command]
async fn download_character(vvm_file: String) -> Result<(), String> {
    if !valid_vvm_filename(&vvm_file) {
        return Err("invalid vvm file name".to_string());
    }
    let url = format!("{VVM_RELEASE_BASE_URL}/{vvm_file}");
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("download failed: HTTP {}", response.status()));
    }
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    fs::write(format!("{VOICEVOX_DIR}/models/vvms/{vvm_file}"), &bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_character(vvm_file: String, state: State<VoicevoxState>) -> Result<VoiceModelMeta, String> {
    if !valid_vvm_filename(&vvm_file) {
        return Err("invalid vvm file name".to_string());
    }
    let synth = state.0.lock().map_err(|e| e.to_string())?;
    let model = VoiceModelFile::open(format!("{VOICEVOX_DIR}/models/vvms/{vvm_file}")).map_err(|e| e.to_string())?;
    synth.load_voice_model(&model).map_err(|e| e.to_string())?;
    Ok(synth.metas())
}

// VRChat listens for OSC on 127.0.0.1:9000. /chatbox/input takes
// (message, bSend, bSFX): bSend=true submits immediately instead of opening
// the keyboard; bSFX=true plays the notification sound.
#[tauri::command]
fn send_chatbox(text: String) -> Result<(), String> {
    let packet = OscPacket::Message(OscMessage {
        addr: "/chatbox/input".to_string(),
        args: vec![OscType::String(text), OscType::Bool(true), OscType::Bool(true)],
    });
    let bytes = rosc::encoder::encode(&packet).map_err(|e| e.to_string())?;
    let socket = UdpSocket::bind("0.0.0.0:0").map_err(|e| e.to_string())?;
    socket.send_to(&bytes, VRCHAT_OSC_ADDR).map_err(|e| e.to_string())?;
    Ok(())
}

// The pieces needed to keep the confirm/discard HUD alive: the safe
// `openvr` overlay handle for show/hide/positioning, plus our own D3D11
// texture pair for pushing pixels via SetOverlayTexture (see overlay_gpu.rs
// for why — SetOverlayRaw can't be called at hotkey-poll frequency).
// `lang_tag_*` is a second, independent overlay for the "EN"/"JP"/"CN"
// language-switch indicator (see lang_tag_placement) — kept fully separate
// from the box so the box's own size/position never has to change to make
// room for it.
struct Hud {
    overlay: openvr::Overlay,
    handle: openvr::overlay::OverlayHandle,
    gpu: overlay_gpu::GpuOverlay,
    lang_tag_handle: openvr::overlay::OverlayHandle,
    lang_tag_gpu: overlay_gpu::GpuOverlay,
}

// Keeps OpenVR alive (dropping Context shuts it down) and the System handle
// used to poll controller state. None if SteamVR wasn't reachable at init —
// this is a best-effort feature, not something the app should fail over.
// `hud` is a further best-effort layer on top: if overlay/D3D11 setup fails,
// hotkeys should keep working without it rather than the whole VR connection
// going down — but unlike the outer Option, this keeps the actual error
// message around (surfaced through update_overlay's Err) instead of quietly
// discarding it, since "nothing shows and nothing explains why" isn't
// diagnosable from the frontend.
struct VrHandles {
    // Never read again after init, but dropping it shuts OpenVR down — kept
    // alive purely for that side effect.
    #[allow(dead_code)]
    context: openvr::Context,
    system: openvr::System,
    hud: Result<Hud, String>,
}

struct OpenVrState(Mutex<Option<VrHandles>>);

fn init_openvr() -> Option<VrHandles> {
    // SAFETY: called once at startup before any other OpenVR call, per the
    // openvr crate's safety contract for `init`.
    let context = unsafe { openvr::init(openvr::ApplicationType::Background) }.ok()?;
    let system = context.system().ok()?;
    let hud = init_hud_overlay(&context);
    if let Err(e) = &hud {
        eprintln!("[overlay] HUD init failed: {e}");
    }
    Some(VrHandles { context, system, hud })
}

// Fixed ~1m in front of and slightly below the headset, so the box reads
// like a HUD that always stays in view without covering the whole scene.
// The language tag overlay (see lang_tag_placement) is derived from these
// same two values, so the box itself never needs to change to make room
// for it.
const HUD_WORLD_WIDTH: f32 = 0.5;
const METERS_PER_PIXEL: f32 = HUD_WORLD_WIDTH / overlay::CANVAS_WIDTH as f32;
// How much further from the headset (more negative Z) both overlays sit
// than the box's original -1.0m resting depth — the tag inherits this Z
// straight from HUD_TRANSFORM (see lang_tag_placement), so bumping it here
// moves both together. Plain meters, hand-tuned — nudge directly to taste.
const HUD_DEPTH_PUSH: f32 = 0.12;
const HUD_TRANSFORM: [[f32; 4]; 3] =
    [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, -0.15], [0.0, 0.0, 1.0, -1.0 - HUD_DEPTH_PUSH]];

fn init_hud_overlay(context: &openvr::Context) -> Result<Hud, String> {
    let mut overlay = context.overlay().map_err(|e| format!("overlay interface unavailable: {e:?}"))?;

    let handle = overlay
        .create_overlay("mutelink.hud", "Mutelink HUD")
        .map_err(|e| format!("create_overlay failed: {e:?}"))?;
    overlay.set_width(handle, HUD_WORLD_WIDTH).map_err(|e| format!("set_width failed: {e:?}"))?;
    let transform = openvr::pose::Matrix3x4(HUD_TRANSFORM);
    overlay
        .set_transform_tracked_device_relative(handle, openvr::tracked_device_index::HMD, &transform)
        .map_err(|e| format!("set_transform failed: {e:?}"))?;
    let gpu = overlay_gpu::GpuOverlay::new(overlay::CANVAS_WIDTH, overlay::CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed: {e}"))?;

    let lang_tag_handle = overlay
        .create_overlay("mutelink.hud.langtag", "Mutelink Language Tag")
        .map_err(|e| format!("create_overlay (lang tag) failed: {e:?}"))?;
    let (lang_tag_width, lang_tag_transform) = lang_tag_placement();
    overlay
        .set_width(lang_tag_handle, lang_tag_width)
        .map_err(|e| format!("set_width (lang tag) failed: {e:?}"))?;
    overlay
        .set_transform_tracked_device_relative(lang_tag_handle, openvr::tracked_device_index::HMD, &lang_tag_transform)
        .map_err(|e| format!("set_transform (lang tag) failed: {e:?}"))?;
    let lang_tag_gpu = overlay_gpu::GpuOverlay::new(overlay::LANG_TAG_CANVAS_WIDTH, overlay::LANG_TAG_CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed (lang tag): {e}"))?;

    Ok(Hud { overlay, handle, gpu, lang_tag_handle, lang_tag_gpu })
}

// Tag's top-left corner, as a flat offset (plain meters) from the box's own
// bottom-left corner — hand-tuned, nudge these two numbers directly rather
// than reasoning through box-percentage or font-size math.
const TAG_OFFSET_X: f32 = -0.15; // negative = left of the box's left edge
const TAG_OFFSET_Y: f32 = -0.06; // negative = below the box's bottom edge

// Computes the language tag overlay's world width and HMD-relative
// transform so that the *text's* own top-left corner (canvas pixel
// (LANG_TAG_MARGIN, LANG_TAG_MARGIN), not the canvas's own (0, 0) — see
// overlay.rs's render_lang_tag) lands at the box's own (unchanged)
// bottom-left corner plus TAG_OFFSET_X/Y. OpenVR overlays are centered on
// their transform, so this works backward from that target corner to the
// canvas's own top-left, and from there to the tag's center point.
fn lang_tag_placement() -> (f32, openvr::pose::Matrix3x4) {
    let box_world_height = HUD_WORLD_WIDTH * (overlay::CANVAS_HEIGHT as f32 / overlay::CANVAS_WIDTH as f32);
    let box_left = HUD_TRANSFORM[0][3] - HUD_WORLD_WIDTH / 2.0;
    let box_bottom = HUD_TRANSFORM[1][3] - box_world_height / 2.0;

    let text_top_left_x = box_left + TAG_OFFSET_X;
    let text_top_left_y = box_bottom + TAG_OFFSET_Y;

    // LANG_TAG_MARGIN exists purely so the pop-in animation has room to grow
    // without clipping (see overlay.rs) — canvas (0, 0) sits that far up and
    // to the left of where the text itself actually starts, so back that out
    // to find the canvas's own top-left corner in world space.
    let margin_world = overlay::LANG_TAG_MARGIN as f32 * METERS_PER_PIXEL;
    let canvas_top_left_x = text_top_left_x - margin_world;
    let canvas_top_left_y = text_top_left_y + margin_world;

    let tag_world_width = overlay::LANG_TAG_CANVAS_WIDTH as f32 * METERS_PER_PIXEL;
    let tag_world_height = overlay::LANG_TAG_CANVAS_HEIGHT as f32 * METERS_PER_PIXEL;

    let tag_center_x = canvas_top_left_x + tag_world_width / 2.0;
    let tag_center_y = canvas_top_left_y - tag_world_height / 2.0;

    let transform = openvr::pose::Matrix3x4([
        [1.0, 0.0, 0.0, tag_center_x],
        [0.0, 1.0, 0.0, tag_center_y],
        [0.0, 0.0, 1.0, HUD_TRANSFORM[2][3]],
    ]);
    (tag_world_width, transform)
}

// Takes a precomputed bitmask (1 << button_id) rather than the button id
// itself, since `openvr::sys` (and thus the id's type) isn't publicly exported.
fn controller_button_pressed(system: &openvr::System, role: openvr::TrackedControllerRole, mask: u64) -> bool {
    let Some(index) = system.tracked_device_index_for_controller_role(role) else {
        return false;
    };
    let Some(state) = system.controller_state(index) else {
        return false;
    };
    state.button_pressed & mask != 0
}

#[derive(Serialize)]
struct HandState {
    grip: bool,
    trigger: bool,
    stick: bool,
    // Legacy input's generic "A" button — the lower face button on each
    // controller (X on Quest's left controller, A on the right).
    a: bool,
}

#[derive(Serialize)]
struct HotkeyState {
    available: bool,
    right: HandState,
    left: HandState,
}

fn read_hand_state(system: &openvr::System, role: openvr::TrackedControllerRole) -> HandState {
    HandState {
        grip: controller_button_pressed(system, role, 1u64 << (openvr::button_id::GRIP as u64)),
        trigger: controller_button_pressed(system, role, 1u64 << (openvr::button_id::STEAM_VR_TRIGGER as u64)),
        stick: controller_button_pressed(system, role, 1u64 << (openvr::button_id::STEAM_VR_TOUCHPAD as u64)),
        a: controller_button_pressed(system, role, 1u64 << (openvr::button_id::A as u64)),
    }
}

// Polled from the frontend on a timer; the hold-to-confirm / discard logic
// and the left/right priority resolution both live there (same pattern as
// the existing silence timers), this just reports the raw current button
// state for both controllers. `stick` (thumbstick click) reads
// SteamVR_Touchpad — legacy input reports a joystick click there regardless
// of whether the physical control is a trackpad or a stick, which is the
// usual (if confusing) OpenVR mapping.
#[tauri::command]
fn hotkey_state(state: State<OpenVrState>) -> HotkeyState {
    let guard = state.0.lock().unwrap();
    let empty = || HandState { grip: false, trigger: false, stick: false, a: false };
    let Some(handles) = guard.as_ref() else {
        return HotkeyState { available: false, right: empty(), left: empty() };
    };
    let system = &handles.system;
    HotkeyState {
        available: true,
        right: read_hand_state(system, openvr::TrackedControllerRole::RightHand),
        left: read_hand_state(system, openvr::TrackedControllerRole::LeftHand),
    }
}

#[derive(Deserialize)]
struct OverlayProgressArg {
    #[serde(rename = "isSend")]
    is_send: bool,
    fraction: f32,
}

// Polled from the frontend at the same cadence as hotkey_state (see
// setupHotkeys() in main.js), which already tracks how long the current
// combo has been held / how long it's been idle since Final appeared —
// exactly the numbers the progress bar needs, so no timing state is
// duplicated here. `final_text`/`interim_text` both empty hides the HUD.
// `fade_alpha` (0-1) is computed frontend-side from how long the box has
// been showing/hiding — see setupHotkeys()'s BOX_FADE_IN_MS/BOX_FADE_OUT_MS —
// and drives overlay::render's fade-in/fade-out.
#[tauri::command]
fn update_overlay(
    final_text: String,
    interim_text: String,
    ending_preview: Option<String>,
    progress: Option<OverlayProgressArg>,
    fade_alpha: f32,
    state: State<OpenVrState>,
) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(()); // no headset connected — nothing to draw to
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;

    if final_text.is_empty() && interim_text.is_empty() {
        hud.overlay.set_visibility(hud.handle, false).map_err(|e| format!("{e:?}"))?;
        return Ok(());
    }

    let progress = progress.map(|p| overlay::OverlayProgress { is_send: p.is_send, fraction: p.fraction });
    let pixels = overlay::render(&final_text, &interim_text, ending_preview.as_deref(), progress.as_ref(), fade_alpha);
    hud.gpu.update(hud.handle.0, &pixels)?;
    hud.overlay.set_visibility(hud.handle, true).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// A separate, independent overlay (see Hud.lang_tag_* / lang_tag_placement)
// so the language-switch indicator can show up on its own — e.g. right
// after a VRChat mute-sync language cycle when there's no pending Final and
// so no confirm/discard box to show it alongside.
#[tauri::command]
fn update_lang_tag(label: Option<String>, elapsed_secs: f32, state: State<OpenVrState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(());
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;

    let Some(label) = label else {
        hud.overlay.set_visibility(hud.lang_tag_handle, false).map_err(|e| format!("{e:?}"))?;
        return Ok(());
    };

    let pixels = overlay::render_lang_tag(&label, elapsed_secs);
    hud.lang_tag_gpu.update(hud.lang_tag_handle.0, &pixels)?;
    hud.overlay.set_visibility(hud.lang_tag_handle, true).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// Lets the frontend retry OpenVR after the user starts SteamVR post-launch,
// without having to restart the whole app.
#[tauri::command]
fn reconnect_vr(state: State<OpenVrState>) -> bool {
    let mut guard = state.0.lock().unwrap();
    *guard = init_openvr();
    guard.is_some()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let synth = init_synthesizer().expect("failed to initialize VOICEVOX synthesizer");
            app.manage(VoicevoxState(Mutex::new(synth)));
            app.manage(OpenVrState(Mutex::new(init_openvr())));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            synthesize,
            send_chatbox,
            hotkey_state,
            reconnect_vr,
            update_overlay,
            update_lang_tag,
            character_catalog,
            download_character,
            load_character
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

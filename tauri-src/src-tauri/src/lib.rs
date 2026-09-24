mod audio_device;
mod ime;
mod overlay;
mod overlay_gpu;
// pub, not just mod: examples/gain_test.rs (cargo run --example) reaches
// sense_voice::create_recognizer_for_testing() through this to exercise the
// exact same model-loading/decoding path the app ships, without going
// through the Tauri command layer.
pub mod sense_voice;
mod vad;

use std::fs;
use std::net::UdpSocket;
use std::path::{Path, PathBuf};
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
//
// In a release build this must resolve next to the installed executable, not
// the dev machine's build path — `bundle.resources` in tauri.conf.json copies
// `voicevox_core/` alongside the exe (see resource_dir() being exe-relative
// on Windows), so an installed-elsewhere copy of the app can still find it.
// Debug builds keep reading straight from the source tree since `tauri dev`
// doesn't run the resource-copy step.
fn voicevox_dir() -> PathBuf {
    if cfg!(debug_assertions) {
        return PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/voicevox_core"));
    }
    std::env::current_exe()
        .expect("failed to get current exe path")
        .parent()
        .expect("exe path has no parent directory")
        .join("voicevox_core")
}

const VRCHAT_OSC_ADDR: &str = "127.0.0.1:9000";

struct VoicevoxState(Mutex<Synthesizer<OpenJtalk>>);

fn init_synthesizer() -> anyhow::Result<Synthesizer<OpenJtalk>> {
    let dir = voicevox_dir();
    let ort = Onnxruntime::load_once()
        .filename(format!("{}/onnxruntime/lib/voicevox_onnxruntime.dll", dir.display()))
        .perform()?;
    let ojt = OpenJtalk::new(format!("{}/dict/open_jtalk_dic_utf_8-1.11", dir.display()))?;
    let synth = Synthesizer::builder(ort).text_analyzer(ojt).build()?;

    let model = VoiceModelFile::open(format!("{}/models/vvms/15.vvm", dir.display()))?;
    synth.load_voice_model(&model)?;

    // Re-load any characters downloaded via the General settings screen in a
    // previous session (15.vvm is already loaded above, skip it here).
    if let Ok(dir) = fs::read_dir(format!("{}/models/vvms", dir.display())) {
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
    let readme = fs::read_to_string(format!("{}/models/README.txt", voicevox_dir().display())).unwrap_or_default();
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
                let downloaded =
                    Path::new(&format!("{}/models/vvms/{vvm_file}", voicevox_dir().display())).exists();
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

    fs::write(format!("{}/models/vvms/{vvm_file}", voicevox_dir().display()), &bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_character(vvm_file: String, state: State<VoicevoxState>) -> Result<VoiceModelMeta, String> {
    if !valid_vvm_filename(&vvm_file) {
        return Err("invalid vvm file name".to_string());
    }
    let synth = state.0.lock().map_err(|e| e.to_string())?;
    let model = VoiceModelFile::open(format!("{}/models/vvms/{vvm_file}", voicevox_dir().display()))
        .map_err(|e| e.to_string())?;
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
    // VR flick-input keyboard (TASK.md #23) — a third, independent overlay
    // (same reasoning as lang_tag_* above: its own show/hide and content
    // shouldn't ever have to touch the confirm/discard box's).
    keyboard_handle: openvr::overlay::OverlayHandle,
    keyboard_gpu: overlay_gpu::GpuOverlay,
    // Which transform the compositor is currently rendering the keyboard
    // panel with — see KeyboardPlacement. The single source of truth every
    // ray-cast (hit-testing, pointer/beam length) derives the panel's world
    // pose from, via keyboard_world_transform, so what's hit-tested always
    // matches what's actually drawn.
    keyboard_placement: KeyboardPlacement,
    // Whether update_keyboard_overlay last ran with visible=true (including
    // through its fade-out) — the confirm/discard box only follows the
    // keyboard while it's actually on screen; see sync_box_to_keyboard.
    keyboard_shown: bool,
    // The transform currently applied to the confirm/discard box (`handle`)
    // — see BoxBinding / sync_box_to_keyboard.
    box_binding: BoxBinding,
    // CPU-side raster memos for the box and keyboard — see update_overlay's
    // own comment. These only ever skip *rasterizing* identical content
    // again; the GPU upload still happens every tick regardless.
    box_raster: Option<(BoxRasterInputs, Vec<u8>)>,
    keyboard_cache: overlay::KeyboardCache,
    // One laser pointer per hand, indexed by POINTER_HANDS — both show at
    // once so either hand's aim is visible before its trigger is pulled
    // (which hand's trigger actually types is main.js's
    // vrKeyboardActiveHand, a separate concern).
    pointers: [PointerSet; 2],
}

// How the keyboard overlay's transform is currently set on the compositor
// side. main.js owns the *setting* ("centered"/"fixed", see its
// loadVrKeyboardPositionMode) and passes it on every update_keyboard_overlay
// call; this tracks what's actually been pushed to SteamVR, which lags the
// setting by design (e.g. Fixed is only entered once an HMD pose was
// available to anchor from — see apply_keyboard_placement).
#[derive(Clone, Copy)]
enum KeyboardPlacement {
    // HMD-relative (KEYBOARD_TRANSFORM via set_transform_tracked_device_relative)
    // — SteamVR re-derives the world pose from the live HMD pose every frame,
    // so the panel follows the head. The "centered" setting, and also the
    // state init_hud_overlay leaves it in.
    Centered,
    // Absolute (Standing-universe) world transform, set via
    // set_transform_absolute — stays put in the room regardless of head motion.
    Fixed([[f32; 4]; 3]),
    // Being dragged by a controller's grip: tracked-device-relative to that
    // controller, with `relative` = inverse(controller pose at grab start) *
    // panel pose at grab start (see begin_keyboard_grab). Parenting to the
    // controller on the compositor side, rather than pushing a fresh absolute
    // transform from here every tick, is what makes the drag feel rigid:
    // SteamVR then moves it with its own per-frame (predicted) controller
    // pose, same as the HMD-relative case, instead of at our IPC poll rate
    // with our own (unpredicted) pose samples — which would visibly stutter/
    // lag behind the hand. `last_world` is the most recently computed world
    // pose (controller pose * relative), kept only as a fallback for
    // end_keyboard_grab if the controller's tracking is lost right at release.
    Grabbed {
        role: openvr::TrackedControllerRole,
        relative: [[f32; 4]; 3],
        last_world: [[f32; 4]; 3],
    },
}

// One hand's dot + beam overlays.
struct PointerSet {
    // A small fixed dot, positioned controller-relative (see
    // update_pointer_overlays) so SteamVR's own tracking keeps it aligned
    // with the hand, with no per-frame ray math on this end — just a
    // translation offset along that controller's own -Z.
    // Its content is static (render_pointer_dot() never changes) but gets
    // re-uploaded for the first few visible frames after each show — see
    // uploads_left and update_pointer_overlays' own comment for why a
    // single upload at init time isn't enough.
    dot_handle: openvr::overlay::OverlayHandle,
    dot_gpu: overlay_gpu::GpuOverlay,
    // The laser line reaching from the controller out to dot_handle's
    // dot — a separate overlay (rather than trying to draw both in one
    // texture) since it needs its own rotated transform (see
    // pointer_beam_transform) while the dot stays unrotated. Shown/hidden
    // and re-aimed in lockstep with dot_handle in update_pointer_overlays.
    beam_handle: openvr::overlay::OverlayHandle,
    beam_gpu: overlay_gpu::GpuOverlay,
    // A second copy of the beam, always kept 90 degrees rolled from the
    // first around their shared length axis (see pointer_beam_transform2) —
    // a single flat quad can only ever face the headset well from *one*
    // roll angle around its own length axis (billboard_basis picks the
    // best one each frame), and since this beam's length axis roughly
    // matches the user's own gaze direction (they look where they point),
    // the worst case — looking almost straight down the beam — is common
    // here, not rare, and that's exactly where a single billboarded quad
    // goes edge-on and reads as near-zero width. Two quads 90 degrees
    // apart guarantee whichever is closer to face-on is never more than
    // 45 degrees off, i.e. never thinner than ~71% of the true width, from
    // any viewing angle. (SteamVR's overlay system only draws flat
    // textured quads — there's no true cylindrical/3D-mesh primitive to
    // reach for instead; this "cross-billboard" is the standard trick
    // sprite-based renderers use for the same reason.)
    beam2_handle: openvr::overlay::OverlayHandle,
    beam2_gpu: overlay_gpu::GpuOverlay,
    // How many more visible frames should (re)upload the dot/beam
    // textures; reset to POINTER_UPLOAD_FRAMES whenever this set is hidden.
    // Per hand, since each hand shows/hides on its own (controller off,
    // tracking lost). See update_pointer_overlays.
    uploads_left: u32,
}

// Index order of Hud::pointers.
const POINTER_HANDS: [openvr::TrackedControllerRole; 2] =
    [openvr::TrackedControllerRole::RightHand, openvr::TrackedControllerRole::LeftHand];

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
// Y: -0.15 originally, then +0.15 (too far below eye level), -0.08 (still
// too high), -0.03 (a bit more), -0.15 (another 4cm down) — net back to the
// original -0.15, across successive rounds of in-headset feedback. The lang
// tag moves with it automatically since lang_tag_placement derives its own
// position from this transform.
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

    let keyboard_handle = overlay
        .create_overlay("mutelink.keyboard", "Mutelink Keyboard")
        .map_err(|e| format!("create_overlay (keyboard) failed: {e:?}"))?;
    overlay.set_width(keyboard_handle, KEYBOARD_WORLD_WIDTH).map_err(|e| format!("set_width (keyboard) failed: {e:?}"))?;
    let keyboard_transform = openvr::pose::Matrix3x4(KEYBOARD_TRANSFORM);
    overlay
        .set_transform_tracked_device_relative(keyboard_handle, openvr::tracked_device_index::HMD, &keyboard_transform)
        .map_err(|e| format!("set_transform (keyboard) failed: {e:?}"))?;
    let keyboard_gpu = overlay_gpu::GpuOverlay::new(overlay::KEYBOARD_CANVAS_WIDTH, overlay::KEYBOARD_CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed (keyboard): {e}"))?;

    // Explicit "\0": the openvr crate passes these &strs straight through as
    // C strings without terminating them, and unlike the one-off literals
    // above, these differ only by a suffix.
    let pointers = [
        init_pointer_set(
            &mut overlay,
            ["mutelink.pointer.right\0", "mutelink.pointer.right.beam\0", "mutelink.pointer.right.beam2\0"],
            "right",
        )?,
        init_pointer_set(
            &mut overlay,
            ["mutelink.pointer.left\0", "mutelink.pointer.left.beam\0", "mutelink.pointer.left.beam2\0"],
            "left",
        )?,
    ];

    Ok(Hud {
        overlay,
        handle,
        gpu,
        lang_tag_handle,
        lang_tag_gpu,
        keyboard_handle,
        keyboard_gpu,
        // Matches the set_transform_tracked_device_relative call above.
        keyboard_placement: KeyboardPlacement::Centered,
        keyboard_shown: false,
        // Matches the box's own HUD_TRANSFORM call above.
        box_binding: BoxBinding::Hmd,
        box_raster: None,
        keyboard_cache: overlay::KeyboardCache::default(),
        pointers,
    })
}

// `keys` = [dot, beam, beam2] overlay keys (see init_hud_overlay for the
// "\0"); `hand` only labels names/errors.
fn init_pointer_set(overlay: &mut openvr::Overlay, keys: [&str; 3], hand: &str) -> Result<PointerSet, String> {
    // Starts hidden and with an identity (HMD-relative) transform — actual
    // per-hand transform gets set on demand by update_pointer_overlays.
    // Unlike the HUD/keyboard, this used to upload its texture only here,
    // once, while still hidden — SetOverlayTexture appears to hand the
    // compositor whatever's in the shared D3D11 texture *at the moment it's
    // called* (see overlay_gpu.rs's update()), and CreateTexture2D leaves a
    // texture zeroed until the very first CopyResource lands — so a single
    // startup-time upload raced the compositor's own readiness and, in
    // practice, never visibly appeared. update_pointer_overlays now
    // re-uploads during the first few visible frames after each show
    // instead (see PointerSet::uploads_left).
    let dot_handle = overlay
        .create_overlay(keys[0], &format!("Mutelink Pointer ({hand})\0"))
        .map_err(|e| format!("create_overlay (pointer {hand}) failed: {e:?}"))?;
    overlay.set_width(dot_handle, POINTER_WORLD_WIDTH).map_err(|e| format!("set_width (pointer {hand}) failed: {e:?}"))?;
    // Drawn on top of the keyboard panel regardless of relative distance —
    // overlays at the same sort order are painted back-to-front by distance
    // from the HMD (see beam_handle's own comment), which would otherwise
    // let the panel win whenever the pointer ends up farther from the HMD
    // than the panel's own center, even while sitting in front of the
    // panel's actual surface.
    overlay.set_sort_order(dot_handle, 2).map_err(|e| format!("set_sort_order (pointer {hand}) failed: {e:?}"))?;
    let dot_gpu = overlay_gpu::GpuOverlay::new(overlay::POINTER_CANVAS_WIDTH, overlay::POINTER_CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed (pointer {hand}): {e}"))?;

    // Same "starts hidden, transform set on demand" treatment as the dot
    // above — see update_pointer_overlays, which moves both together.
    let beam_handle = overlay
        .create_overlay(keys[1], &format!("Mutelink Pointer Beam ({hand})\0"))
        .map_err(|e| format!("create_overlay (pointer beam {hand}) failed: {e:?}"))?;
    // Real width gets set per-frame by update_pointer_overlays (the beam's
    // length is dynamic — see pointer_distance) — this initial value only
    // matters for the brief window before the first call, while it's hidden.
    overlay
        .set_width(beam_handle, POINTER_FALLBACK_DISTANCE)
        .map_err(|e| format!("set_width (pointer beam {hand}) failed: {e:?}"))?;
    overlay.set_sort_order(beam_handle, 1).map_err(|e| format!("set_sort_order (pointer beam {hand}) failed: {e:?}"))?;
    let beam_gpu = overlay_gpu::GpuOverlay::new(overlay::POINTER_BEAM_CANVAS_WIDTH, overlay::POINTER_BEAM_CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed (pointer beam {hand}): {e}"))?;

    // Second cross-billboard plane — see PointerSet::beam2_handle's own comment.
    let beam2_handle = overlay
        .create_overlay(keys[2], &format!("Mutelink Pointer Beam 2 ({hand})\0"))
        .map_err(|e| format!("create_overlay (pointer beam 2 {hand}) failed: {e:?}"))?;
    overlay
        .set_width(beam2_handle, POINTER_FALLBACK_DISTANCE)
        .map_err(|e| format!("set_width (pointer beam 2 {hand}) failed: {e:?}"))?;
    overlay.set_sort_order(beam2_handle, 1).map_err(|e| format!("set_sort_order (pointer beam 2 {hand}) failed: {e:?}"))?;
    let beam2_gpu = overlay_gpu::GpuOverlay::new(overlay::POINTER_BEAM_CANVAS_WIDTH, overlay::POINTER_BEAM_CANVAS_HEIGHT)
        .map_err(|e| format!("D3D11/GPU overlay init failed (pointer beam 2 {hand}): {e}"))?;

    Ok(PointerSet {
        dot_handle,
        dot_gpu,
        beam_handle,
        beam_gpu,
        beam2_handle,
        beam2_gpu,
        uploads_left: POINTER_UPLOAD_FRAMES,
    })
}

// HMD-relative placement, same as HUD_TRANSFORM but with an added
// backward-reclining tilt (rotation around local X) — the panel sits fairly
// low in the view (see the Y offset below), and viewed dead-on at that
// height it reads as leaning away; tilting so its *bottom* edge comes
// toward the viewer (like a reclined music stand/drafting table) makes it
// easier to read while looking down at it. keyboard_world_transform derives
// the panel's actual world-space normal/right/up from this transform's own
// rotation (composed with the HMD's) for the hit-test, so the hit-test and
// the visual tilt always agree — see ray_cast_keyboard_plane's own comment.
// The "fixed" position mode (see KeyboardPlacement) anchors from this same
// composition, so it opens exactly where the centered mode would. Sits below the
// confirm/discard box (hand-tuned Y so the two don't overlap — the keyboard
// has no text preview of its own, see overlay.rs's render_keyboard, so that
// box is what shows pending text + cursor while typing).
//
// Rotation is a plain rotate-around-X by -25 degrees (sin/cos precomputed,
// trig isn't available in stable const contexts); not yet empirically
// verified against a real headset — if the tilt reads backward (top comes
// toward the viewer instead of the bottom), the fix is to negate the two
// off-diagonal ±sin entries below.
// 0.56 (was 0.8) — a ~30% width cut; see overlay.rs's KEYBOARD_CANVAS_HEIGHT
// for the matching ~10% *height* cut, done separately since width/height
// need different percentages here. Then ×1289/900 ≈ 0.8020 when
// KEYBOARD_CANVAS_WIDTH grew from 900 to 1289 (a 2x2 cursor-control block
// added to the grid's right, in its own visually separate box — see that
// constant's own comment): scaling world width by the same ratio the
// canvas grew by keeps every existing pixel's physical size unchanged
// (ray_cast_keyboard's px/py math is already written in terms of this
// ratio, so it stays correct too) and, since KEYBOARD_CANVAS_HEIGHT didn't
// change, leaves the panel's world *height* untouched — the widening only
// extends it sideways.
const KEYBOARD_WORLD_WIDTH: f32 = 0.8020;
const KEYBOARD_TILT_SIN: f32 = -0.42262; // sin(-25 deg)
const KEYBOARD_TILT_COS: f32 = 0.90631; // cos(-25 deg)
// Widening KEYBOARD_CANVAS_WIDTH asymmetrically (all the new width goes to
// the right, for the cursor block — see that constant's own comment) also
// shifts the *texture's own center* right relative to the original
// 5-column grid, which sits at the same pixel position (0..900) it always
// has: since an OpenVR overlay is centered on its transform, that alone
// would drag the whole existing grid visibly left in the world — exactly
// the "keyboard moved" regression this shift fixes, reported after the
// canvas was first widened without it.
//
// KEYBOARD_RECENTER_X compensates by moving the transform itself right by
// half the added width, converted to world meters at the *new* pixel
// density: (1289-900)/2 * (0.56/900) ≈ 0.1210 (the 900 here is the 0.56
// pre-widen width/canvas pair — the ratio simplifies so KEYBOARD_WORLD_WIDTH's
// own post-widen value doesn't need to appear in this formula). With this
// applied, the original grid's pixels land at exactly the same world
// position as before the widening — not just its center, every pixel,
// since both the scale (pixel density) and this translation are uniform.
const KEYBOARD_RECENTER_X: f32 = 0.1210;
// -0.62: -0.62 originally, then +0.15, -0.08, -0.03, -0.04 (net back to the
// original -0.62, same net change as HUD_TRANSFORM's own — see its comment)
// after successive in-headset feedback, keeping the same clearance below
// the confirm/discard box above it throughout.
const KEYBOARD_TRANSFORM: [[f32; 4]; 3] = [
    [1.0, 0.0, 0.0, KEYBOARD_RECENTER_X],
    [0.0, KEYBOARD_TILT_COS, -KEYBOARD_TILT_SIN, -0.62],
    [0.0, KEYBOARD_TILT_SIN, KEYBOARD_TILT_COS, -1.0],
];

// A small fixed-size dot — see PointerSet::dot_handle's own comment for why
// its position (not size) is what actually conveys aim direction. An
// earlier size (4cm) was picked to compensate for what turned out to be a
// separate bug (the dot wasn't rendering at all — see update_pointer_overlays's
// own comment on the stale-texture race) rather than an actual visibility
// problem, and read as too large once that bug was fixed; 1.5cm still read
// as too large once the "covers the whole screen" beam bug was also fixed
// (see POINTER_MAX_DISTANCE) — down to 1/3 of that.
const POINTER_WORLD_WIDTH: f32 = 0.005;

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

fn mat_translation(m: &[[f32; 4]; 3]) -> [f32; 3] {
    [m[0][3], m[1][3], m[2][3]]
}

// Column `col` (0=local X/right, 1=local Y/up, 2=local Z) of the rotation
// part of a row-major 3x4 device-to-absolute-tracking-style matrix, i.e.
// that local basis vector expressed in the matrix's own target space.
fn mat_basis_col(m: &[[f32; 4]; 3], col: usize) -> [f32; 3] {
    [m[0][col], m[1][col], m[2][col]]
}

fn vec_add(a: [f32; 3], b: [f32; 3]) -> [f32; 3] {
    [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
fn vec_sub(a: [f32; 3], b: [f32; 3]) -> [f32; 3] {
    [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
fn vec_scale(a: [f32; 3], s: f32) -> [f32; 3] {
    [a[0] * s, a[1] * s, a[2] * s]
}
fn vec_dot(a: [f32; 3], b: [f32; 3]) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
fn vec_cross(a: [f32; 3], b: [f32; 3]) -> [f32; 3] {
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}
fn vec_normalize(v: [f32; 3]) -> Option<[f32; 3]> {
    let len = vec_dot(v, v).sqrt();
    if len < 1e-6 {
        None
    } else {
        Some(vec_scale(v, 1.0 / len))
    }
}

// Applies just the rotation part of `m` to direction `v` (no translation) —
// for turning a *local* direction (e.g. "forward") into world space.
fn mat_rotate_vec(m: &[[f32; 4]; 3], v: [f32; 3]) -> [f32; 3] {
    [
        m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
        m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
        m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
    ]
}

// The inverse (transpose, since m's rotation part is orthonormal) of
// mat_rotate_vec — turns a *world*-space direction into m's own local
// space. Needed for the pointer/beam's billboard orientation (see
// billboard_basis): to make a controller-relative overlay face the
// headset, we need to know where the headset is in the *controller's*
// local frame, not the other way around.
fn mat_rotate_vec_inverse(m: &[[f32; 4]; 3], v: [f32; 3]) -> [f32; 3] {
    [
        m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2],
        m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2],
        m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2],
    ]
}

// Assembles a 3x4 transform from its three basis vectors (local X/Y/Z, each
// already expressed in the target space) and translation — the inverse of
// mat_basis_col/mat_translation: each basis vector is a *column* of the
// rotation part (see mat_basis_col's own comment for the convention), so row
// `i` is every vector's i-th component side by side.
fn mat_from_basis(x: [f32; 3], y: [f32; 3], z: [f32; 3], t: [f32; 3]) -> [[f32; 4]; 3] {
    [[x[0], y[0], z[0], t[0]], [x[1], y[1], z[1], t[1]], [x[2], y[2], z[2], t[2]]]
}

// a * b for two 3x4 affine transforms: "b's local frame, placed inside a's"
// — e.g. mat_compose(hmd_pose, &KEYBOARD_TRANSFORM) is the panel's world
// pose exactly as SteamVR itself derives it for an HMD-relative overlay.
// Built column-by-column (each of b's basis vectors, and its translation as
// a point, carried through a) rather than as a general 4x4 product, since
// that's the only shape of multiply this file needs.
fn mat_compose(a: &[[f32; 4]; 3], b: &[[f32; 4]; 3]) -> [[f32; 4]; 3] {
    mat_from_basis(
        mat_rotate_vec(a, mat_basis_col(b, 0)),
        mat_rotate_vec(a, mat_basis_col(b, 1)),
        mat_rotate_vec(a, mat_basis_col(b, 2)),
        vec_add(mat_translation(a), mat_rotate_vec(a, mat_translation(b))),
    )
}

// inverse(a) * b — b re-expressed in a's own local frame (e.g. the panel's
// pose *relative to* a controller, for a grab — see begin_keyboard_grab).
// Only valid for a *rigid* `a` (orthonormal rotation, no scale), where
// inverse(a) = [R^T | -R^T * t_a]: its rotation part is exactly
// mat_rotate_vec_inverse, and its translation applied to b's origin gives
// R^T * t_b - R^T * t_a = R^T * (t_b - t_a). Round trip:
// mat_compose(a, mat_inverse_compose(a, b)) == b, since R * R^T = I.
fn mat_inverse_compose(a: &[[f32; 4]; 3], b: &[[f32; 4]; 3]) -> [[f32; 4]; 3] {
    mat_from_basis(
        mat_rotate_vec_inverse(a, mat_basis_col(b, 0)),
        mat_rotate_vec_inverse(a, mat_basis_col(b, 1)),
        mat_rotate_vec_inverse(a, mat_basis_col(b, 2)),
        mat_rotate_vec_inverse(a, vec_sub(mat_translation(b), mat_translation(a))),
    )
}

// The controller's raw local -Z ("look down -Z" convention) points
// noticeably higher than where a hand actually aims when held comfortably
// — a common adjustment for VR laser pointers. Tilting the aim ray down by
// this much (rotating -Z toward -Y, i.e. toward the floor, around the
// controller's own local X) is applied identically to the invisible
// hit-test ray (ray_cast_keyboard_plane) and the visible pointer/beam, so
// what's drawn always matches what's actually being aimed at. Precomputed
// sin/cos of 40 degrees (trig isn't available in stable const contexts) —
// started at 20, then +15 (35), +2 (37), +3 (40) across successive rounds
// of in-headset testing that still read as pointing too high.
const AIM_TILT_SIN: f32 = 0.64279;
const AIM_TILT_COS: f32 = 0.76604;

fn controller_aim_direction() -> [f32; 3] {
    [0.0, -AIM_TILT_SIN, -AIM_TILT_COS]
}

// A fixed local (controller-relative) offset applied to the aim ray's
// *origin* — a separate lever from controller_aim_direction's angle tilt,
// for nudging where the beam visually starts from without changing the
// angle it points at. Negative Y = down, same convention
// KEYBOARD_TRANSFORM's own Y offset uses. Applied everywhere the ray
// origin is used: ray_cast_keyboard_plane's hit-test, and the dot/beam's
// own transforms (pointer_dot_transform/pointer_beam_transform) — those
// apply it directly since they're already expressed in controller-local
// space (SteamVR composes the controller's live rotation on top via
// set_transform_tracked_device_relative), while the hand-rolled world-space
// ray-cast math needs it explicitly rotated into world space first (see
// its own use of mat_rotate_vec), same as the aim direction itself.
const AIM_ORIGIN_OFFSET: [f32; 3] = [0.0, -0.06, 0.0];

// Where (if anywhere) a controller's forward ray hits the keyboard
// overlay's plane, as pixel coordinates within its own canvas plus the hit
// distance in meters along the ray (used by update_pointer_overlays to size
// the pointer/beam so they terminate right at the panel's surface instead
// of at a fixed distance that may land behind it — see that function's own
// comment) — `None` if the ray points away from the plane (or is ~parallel
// to it).
//
// `panel` is the panel's world-space pose *as currently rendered* — always
// from keyboard_world_transform, never re-derived here, since depending on
// KeyboardPlacement it's either HMD-relative (the HMD's pose composed with
// KEYBOARD_TRANSFORM, whose own basis columns carry its tilt — so the panel's
// orientation is not simply the HMD's), a stored fixed transform, or
// controller-relative mid-grab. Its basis columns are the panel's
// right/up/normal and its translation the panel's center.
//
// Not empirically verified against a real headset yet (see TASK.md #23) —
// if the hit point ends up mirrored/offset, the likely culprits are the
// local-X/Y basis vectors' sign (kbd_right/kbd_up below) or the aim
// direction's sign (controller_aim_direction).
// The actual ray-plane math, split out from ray_cast_keyboard below so
// pointer_distance (see update_pointer_overlays) can get the hit distance
// even when the ray lands outside the panel's own bounds — that case still
// means "we know how far out the plane is," just not "which button," and
// the pointer/beam should keep tracking the plane's depth right up to (and
// past) its edges rather than snapping back to a fallback distance the
// moment the aim drifts off the panel.
fn ray_cast_keyboard_plane(panel: &[[f32; 4]; 3], controller_pose: &[[f32; 4]; 3]) -> Option<(f32, f32, f32)> {
    let kbd_pos = mat_translation(panel);
    let kbd_right = mat_basis_col(panel, 0);
    let kbd_up = mat_basis_col(panel, 1);
    let normal = mat_basis_col(panel, 2);

    let ray_origin = vec_add(mat_translation(controller_pose), mat_rotate_vec(controller_pose, AIM_ORIGIN_OFFSET));
    let Some(ray_dir) = vec_normalize(mat_rotate_vec(controller_pose, controller_aim_direction())) else {
        return None;
    };

    let denom = vec_dot(ray_dir, normal);
    if denom.abs() < 1e-6 {
        return None; // ray parallel to the keyboard plane
    }
    let t = vec_dot(vec_sub(kbd_pos, ray_origin), normal) / denom;
    if t <= 0.0 {
        return None; // plane is behind the controller
    }
    let hit = vec_add(ray_origin, vec_scale(ray_dir, t));

    let rel = vec_sub(hit, kbd_pos);
    let local_x = vec_dot(rel, kbd_right); // meters, 0 = overlay center
    let local_y = vec_dot(rel, kbd_up);
    Some((local_x, local_y, t))
}

fn ray_cast_keyboard(panel: &[[f32; 4]; 3], controller_pose: &[[f32; 4]; 3]) -> Option<(f32, f32, f32)> {
    let (local_x, local_y, t) = ray_cast_keyboard_plane(panel, controller_pose)?;

    let kbd_world_height = KEYBOARD_WORLD_WIDTH * (overlay::KEYBOARD_CANVAS_HEIGHT as f32 / overlay::KEYBOARD_CANVAS_WIDTH as f32);
    let px = (local_x + KEYBOARD_WORLD_WIDTH / 2.0) / KEYBOARD_WORLD_WIDTH * overlay::KEYBOARD_CANVAS_WIDTH as f32;
    // World +Y is up; canvas +Y is down — flip.
    let py = (kbd_world_height / 2.0 - local_y) / kbd_world_height * overlay::KEYBOARD_CANVAS_HEIGHT as f32;

    if px < 0.0 || py < 0.0 || px >= overlay::KEYBOARD_CANVAS_WIDTH as f32 || py >= overlay::KEYBOARD_CANVAS_HEIGHT as f32 {
        return None; // hit the plane, but outside the actual panel's bounds
    }
    Some((px, py, t))
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
    // Analog thumbstick/trackpad position, axis 0 (SteamVR's legacy input
    // reports the primary stick/pad there regardless of which physical
    // control it actually is — same convention as `stick` above). Both in
    // [-1, 1]. Needed for the VR keyboard's flick-input gesture detection
    // (see TASK.md #23) — the boolean `stick` alone only tells us it's
    // pressed, not which direction it's been pushed/dragged.
    #[serde(rename = "stickX")]
    stick_x: f32,
    #[serde(rename = "stickY")]
    stick_y: f32,
    // Controller pose in absolute (standing) tracking space — a 3x4
    // row-major transform, same shape openvr::pose::Matrix3x4 and the
    // overlay transforms elsewhere in this file use. None if the device
    // isn't currently tracked (dropped controller, out of range, ...).
    // Needed for the VR keyboard's laser-pointer ray casting (see TASK.md
    // #23) — not used anywhere yet.
    pose: Option<[[f32; 4]; 3]>,
}

#[derive(Serialize)]
struct HotkeyState {
    available: bool,
    right: HandState,
    left: HandState,
}

fn read_hand_state(system: &openvr::System, role: openvr::TrackedControllerRole) -> HandState {
    let grip = controller_button_pressed(system, role, 1u64 << (openvr::button_id::GRIP as u64));
    let trigger = controller_button_pressed(system, role, 1u64 << (openvr::button_id::STEAM_VR_TRIGGER as u64));
    let stick = controller_button_pressed(system, role, 1u64 << (openvr::button_id::STEAM_VR_TOUCHPAD as u64));
    let a = controller_button_pressed(system, role, 1u64 << (openvr::button_id::A as u64));

    let (stick_x, stick_y, pose) = match system.tracked_device_index_for_controller_role(role) {
        Some(index) => match system.controller_state_with_pose(openvr::TrackingUniverseOrigin::Standing, index) {
            Some((state, device_pose)) => {
                let axis = state.axis[primary_stick_axis(system, index, &state)];
                let pose = device_pose.pose_is_valid().then(|| *device_pose.device_to_absolute_tracking());
                (axis.x, axis.y, pose)
            }
            None => (0.0, 0.0, None),
        },
        None => (0.0, 0.0, None),
    };

    HandState { grip, trigger, stick, a, stick_x, stick_y, pose }
}

// Which of the 5 legacy axes carries the thumbstick. Axis 0 is only the
// stick on some controllers (Touch); others put a trackpad there and the
// stick elsewhere (Index: trackpad on 0, thumbstick on 3), and hard-coding
// 0 was the leading suspect for flick input never leaving center while
// every *button* (including the stick click) worked. The device reports
// each axis's type, so pick among the 2D ones (joystick/trackpad) — the
// most-deflected one, so either control can flick on a controller that has
// both. Trigger-type axes are never candidates: a held trigger reads x≈1,
// which would otherwise look like a constant "flick right".
fn primary_stick_axis(system: &openvr::System, index: openvr::TrackedDeviceIndex, state: &openvr::ControllerState) -> usize {
    const AXIS_TYPE_PROPS: [openvr::TrackedDeviceProperty; 5] = [
        openvr::property::Axis0Type_Int32,
        openvr::property::Axis1Type_Int32,
        openvr::property::Axis2Type_Int32,
        openvr::property::Axis3Type_Int32,
        openvr::property::Axis4Type_Int32,
    ];
    let is_2d = |i: usize| {
        let ty = system.int32_tracked_device_property(index, AXIS_TYPE_PROPS[i]).unwrap_or(0);
        ty == openvr_sys::EVRControllerAxisType_k_eControllerAxis_Joystick as i32
            || ty == openvr_sys::EVRControllerAxisType_k_eControllerAxis_TrackPad as i32
    };
    let magnitude = |i: usize| state.axis[i].x.hypot(state.axis[i].y);
    (0..5)
        .filter(|&i| is_2d(i))
        .max_by(|&a, &b| magnitude(a).total_cmp(&magnitude(b)))
        .unwrap_or(0) // device reports no axis types at all — the legacy convention
}

// Polled from the frontend on a timer; the hold-to-confirm / discard logic
// and the left/right priority resolution both live there (same pattern as
// the existing silence timers), this just reports the raw current button
// state for both controllers. `stick` (thumbstick click) reads
// SteamVR_Touchpad — legacy input reports a joystick click there regardless
// of whether the physical control is a trackpad or a stick, which is the
// usual (if confusing) OpenVR mapping.
//
// This is `async fn`, not plain `fn`, even though the body itself never
// `.await`s anything: Tauri dispatches sync commands inline on the main
// WebView2/UI thread, while async commands get spawned onto Tauri's own
// Tokio runtime instead. This polls at 20Hz for the app's entire lifetime
// (see HOTKEY_POLL_MS in main.js) — run inline, that's 20 extra round-trips
// per second competing with the main thread's Win32 message pump, which on
// Windows is also how async commands' own responses get delivered back to
// JS (tao posts a message to the main loop and waits for it to be pumped).
// A long-running unrelated async command (e.g. loading the SenseVoice
// model) could see its response queued indefinitely behind that pressure.
// Moving this one off the main thread avoids contributing to it.
#[tauri::command]
async fn hotkey_state(state: State<'_, OpenVrState>) -> Result<HotkeyState, ()> {
    let guard = state.0.lock().unwrap();
    let empty = || HandState { grip: false, trigger: false, stick: false, a: false, stick_x: 0.0, stick_y: 0.0, pose: None };
    let Some(handles) = guard.as_ref() else {
        return Ok(HotkeyState { available: false, right: empty(), left: empty() });
    };
    let system = &handles.system;
    Ok(HotkeyState {
        available: true,
        right: read_hand_state(system, openvr::TrackedControllerRole::RightHand),
        left: read_hand_state(system, openvr::TrackedControllerRole::LeftHand),
    })
}

#[derive(Deserialize)]
struct OverlayProgressArg {
    #[serde(rename = "isSend")]
    is_send: bool,
    fraction: f32,
}

// Mirrors OverlayProgressArg's shape/naming for the same reason: "may or
// may not be active, and if active has two coupled fields" — stage is 0
// (never sent as Some at 0, see main.js's doubleClickDisplayFor), 1 (first
// click registered, one dot lit) or 2 (second just fired, both lit);
// is_send is false only when the double-click in progress is assigned to
// HOTKEY_CANCEL_ACTION, same green/red convention as progress's own.
#[derive(Deserialize)]
struct DoubleClickArg {
    stage: u8,
    #[serde(rename = "isSend")]
    is_send: bool,
}

// Polled from the frontend at the same cadence as hotkey_state (see
// setupHotkeys() in main.js), which already tracks how long the current
// combo has been held / how long it's been idle since Final appeared —
// exactly the numbers the progress bar needs, so no timing state is
// duplicated here. `final_text`/`interim_text` both empty hides the HUD.
// `fade_alpha` (0-1) is computed frontend-side from how long the box has
// been showing/hiding — see setupHotkeys()'s BOX_FADE_IN_MS/BOX_FADE_OUT_MS —
// and is applied compositor-side via SetOverlayAlpha (set_opacity), not
// baked into the texture's pixels — see the body below for why.
//
// `async fn`, not plain `fn`, for the same reason hotkey_state's own comment
// gives: a plain `fn` command runs inline on the main WebView2/UI thread.
// This was first made async while GpuOverlay::update() briefly blocked on a
// GPU fence (since reverted to a plain non-blocking Flush() — see that
// function's own comment), and with a plain `fn` that wait stalled the
// *whole* main thread, including delivering other in-flight commands'
// responses (tao posts responses through the same message pump). Even
// without the fence, each call still does a CPU raster + a multi-MB texture
// write, so it stays async — none of that belongs on the UI thread. Same
// for update_keyboard_overlay / update_pointer_overlays, which share the
// same GpuOverlay::update() path.
#[tauri::command]
async fn update_overlay(
    final_text: String,
    interim_text: String,
    ending_preview: Option<String>,
    progress: Option<OverlayProgressArg>,
    // The double-click two-circle indicator — see DoubleClickArg's own
    // comment. main.js already keeps this and `progress` from both being
    // Some at once for the same hand (see its own holdDisplay comment), so
    // there's no priority to resolve here, just draw whichever is present.
    double_click: Option<DoubleClickArg>,
    fade_alpha: f32,
    // Char index into final_text — only ever Some while the VR keyboard is
    // open AND the blink cycle (see main.js's CURSOR_BLINK_MS) currently
    // has it visible; None on alternating windows even while actively
    // editing, for a standard blinking-caret look. Drawn as a bar in
    // draw_text_block — that keyboard has no text/cursor preview of its
    // own; this box is the one place pending text (and now its cursor) shows.
    cursor: Option<usize>,
    // Whether the VR keyboard is actively editing this text right now —
    // unlike `cursor` above, NOT blink-affected, so the box's own
    // visibility (see the empty-check below) doesn't flicker on/off every
    // time the blink cycles the cursor off while there's otherwise no text
    // yet (a real bug this session: reusing cursor.is_none() for both
    // "should a cursor bar be drawn" and "should the whole box even show"
    // meant blinking the cursor off also hid the entire box).
    editing: bool,
    // [start, end) char range into final_text currently targeted by 変換
    // (henkan) — see main.js's vrKeyboardConversionStart. Drawn as a
    // background band in draw_text_block so it's visible *which* run of
    // text henkan is about to act on / just replaced, since that wasn't
    // shown anywhere before.
    highlight_start: Option<usize>,
    highlight_end: Option<usize>,
    state: State<'_, OpenVrState>,
) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(()); // no headset connected — nothing to draw to
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;

    // `editing` (the VR keyboard is open) keeps the box showing even with
    // nothing typed yet, so there's still a cursor to see — see main.js's
    // own comment on why this condition needs it too.
    if final_text.is_empty() && interim_text.is_empty() && !editing {
        hud.overlay.set_visibility(hud.handle, false).map_err(|e| format!("{e:?}"))?;
        return Ok(());
    }

    // *Uploads* unconditionally, every call (this command runs every render
    // tick, ~125Hz, whenever the box has anything to show) — an earlier
    // version skipped the upload when the content hadn't changed since the
    // last call (see git history for BoxFrame/Hud::last_box), which made
    // freshly-typed text consistently show up one input behind: SteamVR's
    // compositor appears to sample the shared D3D11 texture whenever it
    // feels like, and a GPU-side fence to force-wait for each copy to land
    // before SetOverlayTexture (tried next) didn't fully fix it either.
    // Uploading every tick regardless is what actually worked — it keeps
    // the compositor's snapshot fresh by redundancy (any one stale sample
    // gets overwritten within ~8ms by the next tick's upload). Keep it that
    // way; revisit "only upload on change" only with a way to verify it in
    // a headset, not just cargo check.
    //
    // *Rasterizing* is a different matter: overlay::render is a pure
    // function of exactly these inputs, so re-running it on identical inputs
    // can only ever reproduce the same bytes — memoizing it (box_raster)
    // changes nothing about what gets uploaded, only how much CPU it costs
    // to produce. That cost mattered: every overlay command (and
    // hotkey_state) shares the one OpenVrState mutex, so raster time here
    // directly delays every other tick-driven call, including the one that
    // reads the controller buttons.
    //
    // The fade is kept *out* of the memo key by applying it compositor-side
    // (set_opacity = SetOverlayAlpha, equivalent to the old per-pixel alpha
    // multiply) instead of baking it into the pixels. Before, every fade
    // frame was a full re-raster, so the fade could only advance as fast as
    // ticks could complete; now a fade frame costs one cheap property set,
    // and it can't be held back by the texture pipeline at all.
    let inputs = BoxRasterInputs {
        final_text,
        interim_text,
        ending_preview,
        progress: progress.map(|p| (p.is_send, p.fraction)),
        double_click: double_click.map(|d| (d.stage, d.is_send)),
        cursor,
        highlight_range: highlight_start.zip(highlight_end),
    };
    if hud.box_raster.as_ref().is_some_and(|(prev, _)| *prev != inputs) {
        hud.box_raster = None;
    }
    let (_, pixels) = hud.box_raster.get_or_insert_with(|| {
        let progress = inputs.progress.map(|(is_send, fraction)| overlay::OverlayProgress { is_send, fraction });
        let pixels = overlay::render(
            &inputs.final_text,
            &inputs.interim_text,
            inputs.ending_preview.as_deref(),
            progress.as_ref(),
            inputs.double_click,
            inputs.cursor,
            inputs.highlight_range,
        );
        (inputs, pixels)
    });
    hud.gpu.update(hud.handle.0, pixels)?;
    hud.overlay.set_opacity(hud.handle, fade_alpha.clamp(0.0, 1.0)).map_err(|e| format!("{e:?}"))?;
    hud.overlay.set_visibility(hud.handle, true).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// Everything overlay::render's output depends on — see update_overlay's
// box_raster memo.
#[derive(PartialEq)]
struct BoxRasterInputs {
    final_text: String,
    interim_text: String,
    ending_preview: Option<String>,
    progress: Option<(bool, f32)>,
    double_click: Option<(u8, bool)>,
    cursor: Option<usize>,
    highlight_range: Option<(usize, usize)>,
}

fn hmd_absolute_pose(system: &openvr::System) -> Option<[[f32; 4]; 3]> {
    let poses = system.device_to_absolute_tracking_pose(openvr::TrackingUniverseOrigin::Standing, 0.0);
    let pose = &poses[openvr::tracked_device_index::HMD.0 as usize];
    pose.pose_is_valid().then(|| *pose.device_to_absolute_tracking())
}

fn controller_absolute_pose(system: &openvr::System, role: openvr::TrackedControllerRole) -> Option<[[f32; 4]; 3]> {
    let index = system.tracked_device_index_for_controller_role(role)?;
    let (_, pose) = system.controller_state_with_pose(openvr::TrackingUniverseOrigin::Standing, index)?;
    pose.pose_is_valid().then(|| *pose.device_to_absolute_tracking())
}

// The cursor-control column's own background box (see overlay.rs's
// CURSOR_BOX_* and update_keyboard_overlay below) — drawn as a visually
// separate rectangle from the main panel so the 2x2 cursor-move buttons
// read as their own distinct control, not part of the kana grid. Derived
// from fixed pixel constants in main.js's computeVrKeyboardLayout (never
// from anything that changes at runtime), so despite being sent every
// call like `buttons`, it only actually ever needs to be drawn once — see
// overlay::keyboard_panel.
#[derive(Deserialize)]
struct RectArg {
    x: f32,
    y: f32,
    w: f32,
    h: f32,
}

// rename_all: Tauri's own JS-camelCase -> Rust-snake_case conversion only
// covers a command's *top-level* argument names, not fields nested inside
// them (like this struct, reached via update_keyboard_overlay's `buttons`
// argument) — those go through plain serde against the JSON exactly as
// main.js sent it. Without this, `flick_hint` silently never matched the
// incoming `flickHint` key and always deserialized to None (the bug behind
// flick hints not appearing at all).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct KeyButtonArg {
    x: f32,
    y: f32,
    w: f32,
    h: f32,
    label: String,
    // main.js-controlled flags/fields — see overlay::KeyButton's own fields
    // for what each means; #[serde(default)] since most callers only care
    // about the pointer-hover highlight computed server-side below and
    // shouldn't have to pass these explicitly.
    #[serde(default)]
    selected: bool,
    #[serde(default)]
    toggled_on: bool,
    #[serde(default)]
    flick: Option<overlay::FlickCross>,
    // A small, dim, corner-drawn hint of what flicking up on this key gives
    // (e.g. "!" hints "`") — see overlay::KeyButton's own comment for why
    // this exists as a permanent label rather than only showing while
    // actually flicking.
    #[serde(default)]
    flick_hint: Option<String>,
}

#[derive(Serialize)]
struct HandHit {
    #[serde(rename = "highlightedIndex")]
    highlighted_index: Option<usize>,
    // Raw canvas-pixel hit point, reported even between/outside buttons —
    // flicking works by aiming at a held key's neighboring flick cells (see
    // main.js's latchVrKeyboardFlickFromPointer), which a discrete button
    // index can't express.
    #[serde(rename = "hitX")]
    hit_x: Option<f32>,
    #[serde(rename = "hitY")]
    hit_y: Option<f32>,
}

impl HandHit {
    fn none() -> Self {
        Self { highlighted_index: None, hit_x: None, hit_y: None }
    }
}

#[derive(Serialize)]
struct UpdateKeyboardResult {
    right: HandHit,
    left: HandHit,
}

impl UpdateKeyboardResult {
    fn none() -> Self {
        Self { right: HandHit::none(), left: HandHit::none() }
    }
}

// One hand's ray-cast against `buttons` — split out so update_keyboard_overlay
// can run it for both hands every call (see that function's own comment for
// why: computing only one hand's hit-test, whichever was "active", let a
// trigger press on the *other* hand engage a stale highlight left over from
// before it became active, since that hand's own hover hadn't been
// ray-cast at all until the *next* tick).
fn hand_hit(system: &openvr::System, panel: Option<[[f32; 4]; 3]>, role: openvr::TrackedControllerRole, buttons: &[KeyButtonArg]) -> HandHit {
    let hit = (|| {
        let panel = panel?;
        let controller_pose = controller_absolute_pose(system, role)?;
        let (px, py, _t) = ray_cast_keyboard(&panel, &controller_pose)?;
        Some((px, py))
    })();
    let highlighted_index =
        hit.and_then(|(px, py)| buttons.iter().position(|b| px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h));
    HandHit { highlighted_index, hit_x: hit.map(|(x, _)| x), hit_y: hit.map(|(_, y)| y) }
}

// VR flick-input keyboard (TASK.md #23) — see overlay.rs's own top comment
// for this section: `buttons` is the entire key layout, computed frontend-
// side and re-sent every call (this is a "dumb" renderer). Ray-casts *both*
// hands against it every call (see hand_hit) and reports back which button
// (if any) each is over, so the frontend can mark either one highlighted on
// the *next* call — one tick of lag, imperceptible at the polling rate this
// is called from — and, more importantly, so each hand's own trigger press
// always engages whatever *that* hand is hovering, never the other hand's
// last-known target (see main.js's own per-hand engage state).
//
// `async fn` — see update_overlay's own comment for why (keeps the raster +
// texture upload off the main WebView2/UI thread).
#[tauri::command]
async fn update_keyboard_overlay(
    visible: bool,
    buttons: Vec<KeyButtonArg>,
    // Same fade-in/out treatment as update_overlay's own — main.js keeps
    // sending `visible: true` at a ramping alpha through a fade-out instead
    // of cutting straight to hidden (see its own BOX_FADE_*-style constants
    // for the keyboard).
    fade_alpha: f32,
    // See RectArg's own comment.
    cursor_box: RectArg,
    // main.js's position-mode setting ("fixed" vs "centered" — see
    // KeyboardPlacement / apply_keyboard_placement). Sent every call rather
    // than via a separate "set mode" command so a settings change applies
    // on the very next tick, even with the keyboard already open.
    fixed_position: bool,
    // True only on the first tick of a fresh open (main.js's own
    // hidden -> visible edge) — tells fixed mode to re-anchor in front of
    // the head. Can't be derived here from `visible` alone: through a
    // fade-out main.js keeps sending visible=true, so a close-then-reopen
    // inside that window never shows up as a visibility change on this end.
    reanchor: bool,
    state: State<'_, OpenVrState>,
) -> Result<UpdateKeyboardResult, String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(UpdateKeyboardResult::none());
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;

    if !visible {
        hud.overlay.set_visibility(hud.keyboard_handle, false).map_err(|e| format!("{e:?}"))?;
        hud.keyboard_shown = false;
        sync_box_to_keyboard(hud, &handles.system)?;
        return Ok(UpdateKeyboardResult::none());
    }

    let hmd_pose = hmd_absolute_pose(&handles.system);
    // Before anything else this tick: the placement decides the transform
    // the hit-tests below must agree with, and on a reanchor it must land
    // before set_visibility(true) further down, so a fixed-mode reopen never
    // flashes a frame at the previous session's spot.
    apply_keyboard_placement(hud, hmd_pose, fixed_position, reanchor)?;
    hud.keyboard_shown = true;
    sync_box_to_keyboard(hud, &handles.system)?;
    let panel = keyboard_world_transform(&hud.keyboard_placement, &handles.system, hmd_pose);
    if let (KeyboardPlacement::Grabbed { last_world, .. }, Some(p)) = (&mut hud.keyboard_placement, panel) {
        *last_world = p;
    }
    let right = hand_hit(&handles.system, panel, openvr::TrackedControllerRole::RightHand, &buttons);
    let left = hand_hit(&handles.system, panel, openvr::TrackedControllerRole::LeftHand, &buttons);

    let render_buttons: Vec<overlay::KeyButton> = buttons
        .into_iter()
        .enumerate()
        .map(|(i, b)| overlay::KeyButton {
            x: b.x,
            y: b.y,
            w: b.w,
            h: b.h,
            label: b.label,
            // Either hand hovering lights the key — the two hands' own
            // *engaged* state (which one actually gets typed on release)
            // stays fully separate, tracked per hand in main.js.
            highlighted: Some(i) == right.highlighted_index || Some(i) == left.highlighted_index,
            selected: b.selected,
            toggled_on: b.toggled_on,
            flick: b.flick,
            flick_hint: b.flick_hint,
        })
        .collect();

    // Uploads unconditionally every call — see update_overlay's own comment
    // for why a "skip the upload if unchanged since last call" version of
    // this (once tried here too, comparing render_buttons/fade_alpha
    // against a stored Hud::last_keyboard) made typed/flicked input
    // consistently lag one input behind instead. The ray-casts above also
    // have to run every call regardless (main.js's flick latching needs a
    // fresh hit point each tick).
    //
    // The raster itself is memoized (keyboard_cache: an unchanged frame is
    // reused as-is, and a changed one only redraws hover/flick over a cached
    // resting-key layer) — see render_keyboard's own comment; a full redraw
    // every tick measured well over the tick budget. Fade is
    // compositor-side, same as update_overlay's.
    let cursor_box = (cursor_box.x, cursor_box.y, cursor_box.w, cursor_box.h);
    let pixels = overlay::render_keyboard(&mut hud.keyboard_cache, render_buttons, cursor_box);
    hud.keyboard_gpu.update(hud.keyboard_handle.0, pixels)?;
    hud.overlay.set_opacity(hud.keyboard_handle, fade_alpha.clamp(0.0, 1.0)).map_err(|e| format!("{e:?}"))?;
    hud.overlay.set_visibility(hud.keyboard_handle, true).map_err(|e| format!("{e:?}"))?;

    Ok(UpdateKeyboardResult { right, left })
}

// The keyboard panel's world-space (Standing-universe) pose as the
// compositor is currently rendering it — every ray-cast against the panel
// goes through this, so hit-testing and the pointer/beam length can never
// disagree with what's on screen whichever mode is active. None only in the
// Centered case with no HMD pose this tick (nothing to derive it from).
fn keyboard_world_transform(
    placement: &KeyboardPlacement,
    system: &openvr::System,
    hmd_pose: Option<[[f32; 4]; 3]>,
) -> Option<[[f32; 4]; 3]> {
    match placement {
        // Same composition SteamVR applies to an HMD-relative overlay.
        KeyboardPlacement::Centered => hmd_pose.map(|h| mat_compose(&h, &KEYBOARD_TRANSFORM)),
        KeyboardPlacement::Fixed(p) => Some(*p),
        // Mirrors the controller-relative transform begin_keyboard_grab set:
        // world = controller * relative. Falls back to the last computed pose
        // while that controller's tracking is momentarily lost.
        KeyboardPlacement::Grabbed { role, relative, last_world } => {
            Some(controller_absolute_pose(system, *role).map_or(*last_world, |c| mat_compose(&c, relative)))
        }
    }
}

fn set_keyboard_centered(hud: &mut Hud) -> Result<(), String> {
    hud.overlay
        .set_transform_tracked_device_relative(
            hud.keyboard_handle,
            openvr::tracked_device_index::HMD,
            &openvr::pose::Matrix3x4(KEYBOARD_TRANSFORM),
        )
        .map_err(|e| format!("{e:?}"))?;
    hud.keyboard_placement = KeyboardPlacement::Centered;
    Ok(())
}

fn set_keyboard_fixed(hud: &mut Hud, panel: [[f32; 4]; 3]) -> Result<(), String> {
    hud.overlay
        .set_transform_absolute(hud.keyboard_handle, openvr::TrackingUniverseOrigin::Standing, &openvr::pose::Matrix3x4(panel))
        .map_err(|e| format!("{e:?}"))?;
    hud.keyboard_placement = KeyboardPlacement::Fixed(panel);
    Ok(())
}

// Brings the compositor-side transform in line with main.js's position-mode
// setting. Only ever pushes a transform on a *change* — Centered and Fixed
// both need nothing per-tick (SteamVR tracks the HMD for the former; the
// latter is supposed to stay still), same "set once" spirit as the original
// init-time-only HMD-relative transform.
//
// A setting change applies immediately, even with the keyboard open: to
// "fixed" it anchors right where the centered panel currently is (the same
// mat_compose SteamVR itself uses — no visible jump, it just stops
// following the head); to "centered" it snaps back in front of the head
// (also dropping any in-progress grab — its later end_keyboard_grab is then
// a no-op). Deferring to the next open was the alternative, but would leave
// the settings screen not matching what's on screen in between.
fn apply_keyboard_placement(hud: &mut Hud, hmd_pose: Option<[[f32; 4]; 3]>, fixed_position: bool, reanchor: bool) -> Result<(), String> {
    let is_centered = matches!(hud.keyboard_placement, KeyboardPlacement::Centered);
    if !fixed_position {
        return if is_centered { Ok(()) } else { set_keyboard_centered(hud) };
    }
    // Re-anchored on every fresh open (not persisted across closes) — the
    // point of the mode is "stays where it was shown", and each open is a
    // new "shown"; a spot picked minutes ago in a different part of the room
    // could easily be behind the user now. Centered here also means "fixed
    // mode was just switched on" or "no HMD pose last time we tried".
    if !reanchor && !is_centered {
        return Ok(());
    }
    match hmd_pose {
        Some(h) => set_keyboard_fixed(hud, mat_compose(&h, &KEYBOARD_TRANSFORM)),
        // Nothing to anchor from this tick (HMD tracking momentarily lost).
        // Fall back to HMD-relative instead of leaving the previous
        // session's fixed spot in place — being Centered also makes the
        // check above retry the anchor on the very next tick.
        None if is_centered => Ok(()),
        None => set_keyboard_centered(hud),
    }
}

fn controller_role_for_hand(hand: &str) -> openvr::TrackedControllerRole {
    if hand == "left" { openvr::TrackedControllerRole::LeftHand } else { openvr::TrackedControllerRole::RightHand }
}

// Grip-grab (fixed position mode only) — main.js's processKeyboardGrab owns
// the press/release edges and the "one hand at a time" rule; this just does
// the geometry. Returns whether a grab actually started: only while the
// panel is anchored (Fixed — which also rejects a second hand while one is
// already Grabbed) and only if *this* hand's aim ray currently lands on the
// panel's own rectangle (ray_cast_keyboard, same test as button hovering —
// any spot on the panel, not necessarily a key), so a grip squeezed while
// pointing elsewhere stays a plain grip for the hotkey system.
//
// The grab records the panel's pose relative to the controller,
// relative = inverse(C0) * P0, and re-parents the overlay to the controller
// with exactly that transform. SteamVR then renders it at C * relative for
// the controller's live pose C, i.e. at P0 at the instant of grabbing (no
// jump: C0 * inverse(C0) * P0 = P0) and afterwards moving and rotating
// rigidly with the hand, held at the same spot on the panel it was grabbed by.
//
// `async fn` — see trigger_hand_haptic's own comment (this shares the same
// mutex as the render-tick commands; waiting on it shouldn't happen on the
// main thread).
#[tauri::command]
async fn begin_keyboard_grab(hand: String, state: State<'_, OpenVrState>) -> Result<bool, String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(false);
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;
    let KeyboardPlacement::Fixed(panel) = hud.keyboard_placement else {
        return Ok(false);
    };
    let role = controller_role_for_hand(&hand);
    let Some(index) = handles.system.tracked_device_index_for_controller_role(role) else {
        return Ok(false);
    };
    let Some(controller_pose) = controller_absolute_pose(&handles.system, role) else {
        return Ok(false);
    };
    if ray_cast_keyboard(&panel, &controller_pose).is_none() {
        return Ok(false);
    }
    let relative = mat_inverse_compose(&controller_pose, &panel);
    hud.overlay
        .set_transform_tracked_device_relative(hud.keyboard_handle, index, &openvr::pose::Matrix3x4(relative))
        .map_err(|e| format!("{e:?}"))?;
    hud.keyboard_placement = KeyboardPlacement::Grabbed { role, relative, last_world: panel };
    // Re-parent the box in the same call, not on the next render tick, so
    // there's never a frame where the panel is already riding the controller
    // while the box is still pinned to the room.
    sync_box_to_keyboard(hud, &handles.system)?;
    // Same short tick as a key press (see trigger_hand_haptic) — confirms the
    // grab took, since a grip squeezed just off the panel's edge silently
    // doesn't grab.
    handles.system.trigger_haptic_pulse(index, 0, 2000);
    Ok(true)
}

// Grip released (or the keyboard closed mid-grab): bakes the panel's
// current world pose, controller * relative, back into a plain absolute
// transform, so it stays exactly where it was let go and any later
// re-grab starts from there. A no-op unless a grab is actually active
// (e.g. switching to centered mid-grab already ended it — see
// apply_keyboard_placement).
//
// This pose is our own unpredicted sample, while the compositor was drawing
// the controller-relative overlay with its predicted controller pose — a
// hand still moving fast at the instant of release could see a few mm of
// settle. Accepted: at release the hand is normally near-still.
#[tauri::command]
async fn end_keyboard_grab(state: State<'_, OpenVrState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else {
        return Ok(());
    };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;
    let KeyboardPlacement::Grabbed { role, relative, last_world } = hud.keyboard_placement else {
        return Ok(());
    };
    let panel = controller_absolute_pose(&handles.system, role).map_or(last_world, |c| mat_compose(&c, &relative));
    set_keyboard_fixed(hud, panel)?;
    // Same-call reason as begin_keyboard_grab's: bake the box down together
    // with the panel, from the very same `panel` pose.
    sync_box_to_keyboard(hud, &handles.system)
}

// Which transform the confirm/discard box (Hud::handle) is currently bound
// with — tracked so sync_box_to_keyboard only calls into SteamVR on an
// actual change (the same "set once, let the compositor track it" approach
// the keyboard itself uses), and so returning to Hmd always explicitly
// re-applies HUD_TRANSFORM instead of leaving a stale absolute/controller
// binding behind.
#[derive(Clone, Copy, PartialEq)]
enum BoxBinding {
    // HUD_TRANSFORM, HMD-relative — the box's original, and still default,
    // placement.
    Hmd,
    // Absolute Standing-universe transform (keyboard is Fixed).
    Absolute([[f32; 4]; 3]),
    // Relative to this controller (keyboard is Grabbed by it).
    Device(openvr::TrackedDeviceIndex, [[f32; 4]; 3]),
}

// The box's pose in the keyboard panel's own local frame, as implied by
// the two HMD-relative constants: inverse(KEYBOARD_TRANSFORM) * HUD_TRANSFORM.
// Composing it onto any keyboard pose K_world gives the box's pose that
// keeps today's (centered-mode) box/keyboard offset. With a centered panel,
// K_world = hmd * KEYBOARD_TRANSFORM, so K_world * this = hmd * K * K^-1 *
// HUD_TRANSFORM = hmd * HUD_TRANSFORM — exactly the box's own HMD-relative
// placement. That's why following the keyboard is only switched on for
// Fixed/Grabbed: in Centered it'd compute the identical pose anyway, just
// with extra work. Recomputed on use (a few multiplies) rather than cached —
// it only runs on a binding change.
fn box_relative_to_keyboard() -> [[f32; 4]; 3] {
    mat_inverse_compose(&KEYBOARD_TRANSFORM, &HUD_TRANSFORM)
}

// Keeps the box at its usual offset from the keyboard panel whenever the
// panel isn't head-locked, mirroring the panel's own binding type rather
// than chasing its pose per tick: an absolute transform while it's Fixed,
// and the same controller as the panel while it's Grabbed (for the same
// smoothness reason the panel is re-parented — see KeyboardPlacement::Grabbed;
// controller * (relative * box_rel) = panel * box_rel, so the two stay
// locked together at the compositor's own frame rate).
//
// Only while the keyboard is on screen: once it's fully hidden the box goes
// back to HMD-relative, since the box also shows voice-recognized text with
// no keyboard at all, and a fixed room-space spot left over from the last
// keyboard session could be anywhere (behind the user, another room).
// "On screen" includes the keyboard's fade-out (update_keyboard_overlay
// still gets visible=true then), so if text is still pending when the
// keyboard is closed, the box stays by the keyboard for that ~0.5s fade and
// then snaps back in front of the head.
fn sync_box_to_keyboard(hud: &mut Hud, system: &openvr::System) -> Result<(), String> {
    let desired = match hud.keyboard_placement {
        _ if !hud.keyboard_shown => BoxBinding::Hmd,
        KeyboardPlacement::Centered => BoxBinding::Hmd,
        KeyboardPlacement::Fixed(panel) => BoxBinding::Absolute(mat_compose(&panel, &box_relative_to_keyboard())),
        KeyboardPlacement::Grabbed { role, relative, .. } => match system.tracked_device_index_for_controller_role(role) {
            Some(index) => BoxBinding::Device(index, mat_compose(&relative, &box_relative_to_keyboard())),
            // Controller dropped out mid-grab — leave the box as it is;
            // update_keyboard_overlay retries every render tick.
            None => return Ok(()),
        },
    };
    if desired == hud.box_binding {
        return Ok(());
    }
    match desired {
        BoxBinding::Hmd => hud.overlay.set_transform_tracked_device_relative(
            hud.handle,
            openvr::tracked_device_index::HMD,
            &openvr::pose::Matrix3x4(HUD_TRANSFORM),
        ),
        BoxBinding::Absolute(m) => {
            hud.overlay.set_transform_absolute(hud.handle, openvr::TrackingUniverseOrigin::Standing, &openvr::pose::Matrix3x4(m))
        }
        BoxBinding::Device(index, m) => hud.overlay.set_transform_tracked_device_relative(hud.handle, index, &openvr::pose::Matrix3x4(m)),
    }
    .map_err(|e| format!("{e:?}"))?;
    hud.box_binding = desired;
    Ok(())
}

// Both the dot and the beam sit at a *dynamic* distance out along the
// controller's own local -Z (see pointer_distance) rather than a fixed
// offset — a fixed offset was the actual bug behind "pointer/beam not
// showing" reports: SteamVR overlays are real 3D quads that occlude each
// other by depth, and the keyboard panel is a large, mostly-opaque overlay
// of its own sitting ~1m out. Whenever the fixed offset happened to place
// the dot/beam at or beyond the panel's own depth (which is exactly what
// happens when actually aiming at the keyboard — the entire point of
// having a pointer at all), the panel simply drew in front of them,
// hiding both completely. Deriving the distance from the same ray-plane
// hit distance ray_cast_keyboard already computes (see
// ray_cast_keyboard_plane) keeps the pointer/beam ending right at the
// panel's surface no matter where on (or off) it the controller is aimed.
//
// The plane hit distance must be capped (POINTER_MAX_DISTANCE): the beam's
// visible *thickness* is locked to its length by the beam texture's fixed
// aspect ratio (see overlay.rs's POINTER_BEAM_CANVAS_HEIGHT — OpenVR has no
// separate "set height"), and ray_cast_keyboard_plane intersects the panel's
// *infinite* plane, which (in the centered position mode) is HMD-relative
// and so tilts with the head. Aiming
// anywhere close to parallel to that plane (e.g. pointing roughly forward
// while looking down, or aiming up toward the HUD box) gives a grazing hit
// tens or hundreds of meters out — and a 50m beam is also 50cm thick,
// starting right at the hand, which is what read as "the beam covers the
// whole screen depending on viewing angle and distance". The cap is picked
// just above the farthest point of the panel itself from any comfortable
// controller position (~1.0-1.15m to its far top corner), so hits *on* the
// panel are never shortened, and only off-panel grazing hits get clamped —
// which is harmless: a clamped beam ends before reaching the plane, so it
// can't end up hidden behind the panel either.
//
// POINTER_FALLBACK_DISTANCE (no plane hit at all: ray parallel to or
// pointing away from the plane) is deliberately the same value, so the
// beam's length stays continuous as the aim sweeps through "parallel"
// (t -> infinity, clamped to MAX) into "pointing away" (fallback) instead of
// snapping from long to short at that boundary.
const POINTER_MAX_DISTANCE: f32 = 1.3;
const POINTER_FALLBACK_DISTANCE: f32 = POINTER_MAX_DISTANCE;
const POINTER_MIN_DISTANCE: f32 = 0.1;
// No margin pulling the dot back toward the hand along the ray (there used
// to be one, POINTER_SURFACE_MARGIN = 0.03): with the eye well above the
// hand, a dot short of the true hit point projects onto the panel visibly
// lower than where the ray actually lands, which read as the hit-test
// itself being offset (you'd have to aim clearly above a key's real top
// edge to see the dot reach it, and the dot would still be on a key once
// the ray had already left its bottom edge). The dot/beam don't need a
// margin to stay visibly in front of the panel — they're already drawn on
// top of it via a higher OpenVR sort order (see set_sort_order below), not
// by sitting physically closer to the eye.

// A unit vector perpendicular to `axis` (unit length), as close to `hint`
// as possible (Gram-Schmidt). `fallback_hint` is used instead when `hint`
// is (nearly) parallel to `axis`. Both the billboard normal and its
// degenerate-case fallback must go through this: the previous fallback used
// a raw [0, 1, 0] as the normal, which is *not* perpendicular to the aim
// direction (that has a -Y component from AIM_TILT), so the resulting
// transform had non-orthogonal, non-unit basis columns — a sheared/scaled
// quad rather than a correctly oriented one.
fn perpendicular_unit(axis: [f32; 3], hint: [f32; 3], fallback_hint: [f32; 3]) -> [f32; 3] {
    let project_out = |v: [f32; 3]| vec_sub(v, vec_scale(axis, vec_dot(v, axis)));
    // 1e-3 (relative to unit-length hints) rather than vec_normalize's own
    // 1e-6: below this, the perpendicular component is pure noise and its
    // direction would spin around wildly with sub-millimeter head motion.
    let perp = project_out(hint);
    if vec_dot(perp, perp).sqrt() > 1e-3 {
        return vec_normalize(perp).expect("length already checked above");
    }
    vec_normalize(project_out(fallback_hint)).expect("fallback_hint must not be parallel to axis")
}

// Controller-local +Y — the fallback facing direction for the beam/dot when
// there's no usable headset direction. Never parallel to
// controller_aim_direction() (that's tilted only 37 degrees from -Z toward
// -Y), so perpendicular_unit's fallback path is always well-defined.
const CONTROLLER_LOCAL_UP: [f32; 3] = [0.0, 1.0, 0.0];

// A billboard-style basis for a controller-relative overlay that extends
// along `aim_dir_local` (in the controller's own local frame) while facing
// the headset as squarely as possible around that axis. A *fixed* rotation
// (tried first) only faces the eye well from one particular relative
// viewing angle — from others, the same physical width reads as thinner or
// fatter (a flat quad viewed edge-on has ~zero visible width; viewed
// face-on has its full width), which is exactly the "looks fatter at some
// angles" behavior reported for both the dot and the beam with a fixed
// orientation. Recomputing the quad's normal from the *current* headset
// position instead removes that: it's still not a full screen-facing
// billboard (the length axis stays pinned to the aim ray — that's what
// makes it read as "pointing at" something), but it removes the one
// remaining free rotational degree of freedom that was picked arbitrarily
// before.
fn billboard_basis(hmd_pose: &[[f32; 4]; 3], controller_pose: &[[f32; 4]; 3], aim_dir_local: [f32; 3]) -> ([f32; 3], [f32; 3]) {
    let origin_world = vec_add(mat_translation(controller_pose), mat_rotate_vec(controller_pose, AIM_ORIGIN_OFFSET));
    let to_eye_world = vec_sub(mat_translation(hmd_pose), origin_world);
    let to_eye_local = vec_normalize(mat_rotate_vec_inverse(controller_pose, to_eye_world)).unwrap_or(CONTROLLER_LOCAL_UP);

    // Gram-Schmidt: the part of to_eye_local perpendicular to the aim axis
    // becomes the quad's normal. Falls back to (the perpendicular part of)
    // controller "up" in the degenerate case of looking almost exactly down
    // the beam itself.
    basis_from_normal(aim_dir_local, perpendicular_unit(aim_dir_local, to_eye_local, CONTROLLER_LOCAL_UP))
}

// Completes (normal, up) from a unit normal already perpendicular to the
// unit aim axis. The overlay transform's columns are (aim, up, normal) for
// local (X, Y, Z); aim x up = aim x (normal x aim) = normal, so this is a
// right-handed orthonormal basis with no scale/shear.
fn basis_from_normal(aim_dir_local: [f32; 3], normal: [f32; 3]) -> ([f32; 3], [f32; 3]) {
    (normal, vec_cross(normal, aim_dir_local))
}

// Positioned `distance` out along the aim ray; oriented via billboard_basis
// (normal/up) so it faces the headset regardless of arm angle.
fn pointer_dot_transform(aim_dir: [f32; 3], normal: [f32; 3], up: [f32; 3], distance: f32) -> [[f32; 4]; 3] {
    let t = vec_add(AIM_ORIGIN_OFFSET, vec_scale(aim_dir, distance));
    [[aim_dir[0], up[0], normal[0], t[0]], [aim_dir[1], up[1], normal[1], t[1]], [aim_dir[2], up[2], normal[2], t[2]]]
}

// The laser line from the controller to the dot above. Same billboard
// basis as the dot for the width/normal axes; the length axis (what
// set_width scales) is the aim ray itself, so `length` must match whatever
// set_width was just called with (see update_pointer_overlays). A point at
// local_x = -length/2 lands at the controller (0 along the aim ray) and
// local_x = +length/2 lands at `length` out along it, so translating by
// +length/2 along the aim direction centers the overlay between the two.
fn pointer_beam_transform(aim_dir: [f32; 3], normal: [f32; 3], up: [f32; 3], length: f32) -> [[f32; 4]; 3] {
    let t = vec_add(AIM_ORIGIN_OFFSET, vec_scale(aim_dir, length / 2.0));
    [[aim_dir[0], up[0], normal[0], t[0]], [aim_dir[1], up[1], normal[1], t[1]], [aim_dir[2], up[2], normal[2], t[2]]]
}

// The init-time-only upload that never showed (see init_hud_overlay) was
// done while hidden, and it was never pinned down whether the cause was
// that or the copy racing the compositor — so re-upload for a few frames
// once visibility is actually on (the first visible call still uploads
// *before* set_visibility, same as the failing case), then stop: the
// content is fixed, so every frame after that was pure overhead (3 texture
// copies + Flush + SetOverlayTexture per render tick).
const POINTER_UPLOAD_FRAMES: u32 = 5;

fn hide_pointer_set(overlay: &mut openvr::Overlay, set: &mut PointerSet) -> Result<(), String> {
    set.uploads_left = POINTER_UPLOAD_FRAMES;
    overlay.set_visibility(set.dot_handle, false).map_err(|e| format!("{e:?}"))?;
    overlay.set_visibility(set.beam_handle, false).map_err(|e| format!("{e:?}"))?;
    overlay.set_visibility(set.beam2_handle, false).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// Both hands in one IPC call rather than one per hand — it's a render-tick
// command, and each hand is independent anyway (either can be off/untracked
// while the other still shows). Visibility is per-hand (right_visible/
// left_visible), not a single shared flag — main.js only asks for a hand's
// laser once that hand's own aim is actually landing within the keyboard
// panel's bounds (one tick of lag, from the previous update_keyboard_overlay
// call's hitX/hitY — see main.js's own comment), not just "the keyboard is
// open", so pointing off into the room doesn't leave a laser hanging in
// space toward nothing.
//
// `async fn` — see update_overlay's own comment for why (keeps the raster +
// texture upload off the main WebView2/UI thread).
#[tauri::command]
async fn update_pointer_overlays(right_visible: bool, left_visible: bool, state: State<'_, OpenVrState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_mut() else { return Ok(()) };
    let hud = handles.hud.as_mut().map_err(|e| e.clone())?;
    let hmd_pose = hmd_absolute_pose(&handles.system);
    // Read-only here — update_keyboard_overlay (same render tick) is what
    // moves keyboard_placement along; this just follows whatever it
    // currently is, so the beam ends where the panel is actually drawn.
    let panel = keyboard_world_transform(&hud.keyboard_placement, &handles.system, hmd_pose);
    for ((set, role), visible) in hud.pointers.iter_mut().zip(POINTER_HANDS).zip([right_visible, left_visible]) {
        update_pointer_set(&mut hud.overlay, set, &handles.system, role, visible, hmd_pose, panel)?;
    }
    Ok(())
}

fn update_pointer_set(
    overlay: &mut openvr::Overlay,
    set: &mut PointerSet,
    system: &openvr::System,
    role: openvr::TrackedControllerRole,
    visible: bool,
    hmd_pose: Option<[[f32; 4]; 3]>,
    panel: Option<[[f32; 4]; 3]>,
) -> Result<(), String> {
    if !visible {
        return hide_pointer_set(overlay, set);
    }
    let Some(index) = system.tracked_device_index_for_controller_role(role) else {
        return hide_pointer_set(overlay, set);
    };
    let Some(controller_pose) = controller_absolute_pose(system, role) else {
        return hide_pointer_set(overlay, set);
    };

    let aim_dir = controller_aim_direction();
    let distance = panel
        .and_then(|p| ray_cast_keyboard_plane(&p, &controller_pose))
        .map_or(POINTER_FALLBACK_DISTANCE, |(_, _, t)| t.clamp(POINTER_MIN_DISTANCE, POINTER_MAX_DISTANCE));
    // Falls back to a fixed "up"-facing orientation (the pre-billboard
    // default) on the rare case the HMD pose is briefly unavailable, rather
    // than showing nothing at all.
    let (normal, up) = match hmd_pose {
        Some(h) => billboard_basis(&h, &controller_pose, aim_dir),
        None => basis_from_normal(aim_dir, perpendicular_unit(aim_dir, CONTROLLER_LOCAL_UP, CONTROLLER_LOCAL_UP)),
    };

    // Uploaded after each show rather than once at init — SetOverlayTexture
    // appears to hand the compositor whatever's in the shared D3D11 texture
    // at the moment it's called, and a texture created via CreateTexture2D
    // starts out zeroed (fully transparent) until the first CopyResource
    // actually lands; a single startup-time upload while still hidden raced
    // that, and in practice the compositor kept sampling the zeroed texture
    // forever. See POINTER_UPLOAD_FRAMES for why it's a few frames, not all.
    let upload = set.uploads_left > 0;
    if upload {
        set.uploads_left -= 1;
        set.dot_gpu.update(set.dot_handle.0, &overlay::render_pointer_dot())?;
    }
    let transform = openvr::pose::Matrix3x4(pointer_dot_transform(aim_dir, normal, up, distance));
    overlay.set_transform_tracked_device_relative(set.dot_handle, index, &transform).map_err(|e| format!("{e:?}"))?;
    overlay.set_visibility(set.dot_handle, true).map_err(|e| format!("{e:?}"))?;

    if upload {
        set.beam_gpu.update(set.beam_handle.0, &overlay::render_pointer_beam())?;
    }
    overlay.set_width(set.beam_handle, distance).map_err(|e| format!("{e:?}"))?;
    let beam_transform = openvr::pose::Matrix3x4(pointer_beam_transform(aim_dir, normal, up, distance));
    overlay.set_transform_tracked_device_relative(set.beam_handle, index, &beam_transform).map_err(|e| format!("{e:?}"))?;
    overlay.set_visibility(set.beam_handle, true).map_err(|e| format!("{e:?}"))?;

    // Second plane, rolled 90 degrees around the shared aim axis from the
    // first (normal2 = up, up2 = -normal — still right-handed: see
    // PointerSet::beam2_handle's own comment for why this exists).
    let normal2 = up;
    let up2 = vec_scale(normal, -1.0);
    if upload {
        set.beam2_gpu.update(set.beam2_handle.0, &overlay::render_pointer_beam())?;
    }
    overlay.set_width(set.beam2_handle, distance).map_err(|e| format!("{e:?}"))?;
    let beam2_transform = openvr::pose::Matrix3x4(pointer_beam_transform(aim_dir, normal2, up2, distance));
    overlay.set_transform_tracked_device_relative(set.beam2_handle, index, &beam2_transform).map_err(|e| format!("{e:?}"))?;
    overlay.set_visibility(set.beam2_handle, true).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// A separate, independent overlay (see Hud.lang_tag_* / lang_tag_placement)
// so the language-switch indicator can show up on its own — e.g. right
// after a VRChat mute-sync language cycle when there's no pending Final and
// so no confirm/discard box to show it alongside.
//
// `async fn` — see update_overlay's own comment for why (keeps the raster +
// texture upload off the main WebView2/UI thread) — this one animates continuously while
// shown (see lang_tag_pop_scale/lang_tag_fade_alpha), so it's called just
// as often as the others.
#[tauri::command]
async fn update_lang_tag(label: Option<String>, elapsed_secs: f32, state: State<'_, OpenVrState>) -> Result<(), String> {
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

// Short controller vibration so pressing a VR keyboard key feels like it
// actually registered (there was previously no tactile confirmation at
// all — only the visual highlight).
//
// `async fn`, not plain `fn` — TriggerHapticPulse itself is instant, but
// this fires from processVrKeyboardTrigger on every engage, right as
// update_keyboard_overlay (also touching OpenVrState's mutex) is often
// mid-flight doing its own raster + GPU upload *while holding that same
// mutex*. A plain `fn` here would block waiting for `state.0.lock()` on the
// main WebView2/UI thread — the same head-of-line blocking update_overlay's
// own comment describes for the old GPU-fence wait, just with a different
// cause. Being `async fn` moves that wait off the main thread instead.
#[tauri::command]
async fn trigger_hand_haptic(hand: String, state: State<'_, OpenVrState>) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let Some(handles) = guard.as_ref() else {
        return Ok(());
    };
    let role = if hand == "left" { openvr::TrackedControllerRole::LeftHand } else { openvr::TrackedControllerRole::RightHand };
    if let Some(index) = handles.system.tracked_device_index_for_controller_role(role) {
        // Axis 0, 2ms: short enough to read as a discrete tick rather than
        // a buzz, well under OpenVR's ~4000us rejection ceiling per the
        // openvr crate's own trigger_haptic_pulse doc comment.
        handles.system.trigger_haptic_pulse(index, 0, 2000);
    }
    Ok(())
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
            app.manage(sense_voice::SenseVoiceState::new());
            app.manage(sense_voice::DownloadCancelState::new());
            app.manage(vad::VadState::new());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            synthesize,
            send_chatbox,
            hotkey_state,
            reconnect_vr,
            trigger_hand_haptic,
            update_overlay,
            update_lang_tag,
            update_keyboard_overlay,
            update_pointer_overlays,
            begin_keyboard_grab,
            end_keyboard_grab,
            character_catalog,
            download_character,
            load_character,
            audio_device::list_input_devices,
            audio_device::set_default_input_device,
            sense_voice::stt_model_downloaded,
            sense_voice::download_stt_model,
            sense_voice::cancel_stt_model_download,
            sense_voice::delete_stt_model,
            sense_voice::load_stt_model,
            sense_voice::stt_transcribe,
            vad::vad_process_chunk,
            vad::vad_reset,
            ime::convert_kana_to_kanji
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::fs;
use std::net::UdpSocket;
use std::path::Path;
use std::sync::Mutex;

use rosc::{OscMessage, OscPacket, OscType};
use serde::Serialize;
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

// Keeps OpenVR alive (dropping Context shuts it down) and the System handle
// used to poll controller state. None if SteamVR wasn't reachable at init —
// this is a best-effort feature, not something the app should fail over.
struct OpenVrState(Mutex<Option<(openvr::Context, openvr::System)>>);

fn init_openvr() -> Option<(openvr::Context, openvr::System)> {
    // SAFETY: called once at startup before any other OpenVR call, per the
    // openvr crate's safety contract for `init`.
    let context = unsafe { openvr::init(openvr::ApplicationType::Background) }.ok()?;
    let system = context.system().ok()?;
    Some((context, system))
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
struct HotkeyState {
    available: bool,
    grip: bool,
    trigger: bool,
}

// Polled from the frontend on a timer; the hold-to-confirm / abandon-timeout
// logic lives there (same pattern as the existing silence timers), this just
// reports the raw current button state for the right-hand controller only.
#[tauri::command]
fn hotkey_state(state: State<OpenVrState>) -> HotkeyState {
    let guard = state.0.lock().unwrap();
    let Some((_, system)) = guard.as_ref() else {
        return HotkeyState { available: false, grip: false, trigger: false };
    };
    let role = openvr::TrackedControllerRole::RightHand;
    HotkeyState {
        available: true,
        grip: controller_button_pressed(system, role, 1u64 << (openvr::button_id::GRIP as u64)),
        trigger: controller_button_pressed(system, role, 1u64 << (openvr::button_id::STEAM_VR_TRIGGER as u64)),
    }
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
            character_catalog,
            download_character,
            load_character
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

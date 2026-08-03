use std::net::UdpSocket;
use std::sync::Mutex;

use rosc::{OscMessage, OscPacket, OscType};
use tauri::{Manager, State};
use voicevox_core::blocking::{Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile};
use voicevox_core::StyleId;

// This whole app-local directory was populated once via `voicevox_core/download.exe`
// (see README/chat history) — it's not fetched at runtime.
const VOICEVOX_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/voicevox_core");
// 小夜/SAYO, ノーマル style (confirmed against the VOICEVOX/voicevox_vvm model table).
const SAYO_NORMAL_STYLE_ID: StyleId = StyleId(46);

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

    Ok(synth)
}

#[tauri::command]
fn synthesize(
    text: String,
    speed_scale: Option<f32>,
    pitch_scale: Option<f32>,
    intonation_scale: Option<f32>,
    volume_scale: Option<f32>,
    state: State<VoicevoxState>,
) -> Result<Vec<u8>, String> {
    let synth = state.0.lock().map_err(|e| e.to_string())?;

    let mut query = synth
        .create_audio_query(&text, SAYO_NORMAL_STYLE_ID)
        .map_err(|e| e.to_string())?;
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

    synth
        .synthesis(&query, SAYO_NORMAL_STYLE_ID)
        .perform()
        .map_err(|e| e.to_string())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let synth = init_synthesizer().expect("failed to initialize VOICEVOX synthesizer");
            app.manage(VoicevoxState(Mutex::new(synth)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![synthesize, send_chatbox])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

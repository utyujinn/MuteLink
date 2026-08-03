use std::sync::Mutex;

use tauri::{Manager, State};
use voicevox_core::blocking::{Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile};
use voicevox_core::StyleId;

// This whole app-local directory was populated once via `voicevox_core/download.exe`
// (see README/chat history) — it's not fetched at runtime.
const VOICEVOX_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/voicevox_core");
// 小夜/SAYO, ノーマル style (confirmed against the VOICEVOX/voicevox_vvm model table).
const SAYO_NORMAL_STYLE_ID: StyleId = StyleId(46);

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
fn synthesize(text: String, state: State<VoicevoxState>) -> Result<Vec<u8>, String> {
    let synth = state.0.lock().map_err(|e| e.to_string())?;
    synth
        .tts(&text, SAYO_NORMAL_STYLE_ID)
        .perform()
        .map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![synthesize])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

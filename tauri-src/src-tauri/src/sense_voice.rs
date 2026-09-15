// Local, offline STT (via the `sherpa-onnx` crate) — the alternative to the
// Web Speech API path (see setupSttEngineSettings()/sttEngine in main.js).
// Several models are offered (see MODELS below), from different sherpa-onnx
// model families (SenseVoice, Whisper, Zipformer-transducer, NeMo CTC); the
// user picks one in Settings and only that one is ever downloaded. None of
// them ship in the installer at all — each is tens of MB to ~1GB, downloaded
// on demand the same way additional VOICEVOX characters are (see download_character in
// lib.rs), not baked in via bundle.resources. The sherpa-onnx *runtime*
// (onnxruntime.dll/sherpa-onnx-c-api.dll/sherpa-onnx-cxx-api.dll) is
// different — those DO ship with the installer (see bundle.resources in
// tauri.conf.json), because Cargo.toml deliberately links `sherpa-onnx`
// with the "shared" feature instead of the default "static" one: the
// prebuilt static libs are built with Windows' static CRT (/MT), which
// collides (LNK2005, duplicate CRT symbols) with the rest of this crate's
// dependency graph linking the dynamic CRT (/MD) the normal Rust way.
//
// Unlike the Web Speech API, none of these are streaming recognizers: each
// transcribes one already-complete utterance at a time (see
// OfflineRecognizer below — "Offline" is sherpa-onnx's own term for
// whole-utterance, non-streaming models). The frontend is what decides where
// one utterance ends (a short silence-timeout VAD, see SENSE_VOICE_SILENCE_MS
// in main.js), buffers raw samples for it, and sends the whole thing over in
// one stt_transcribe call — there's no equivalent of SpeechRecognition's
// live interim results for any of these.

use std::collections::HashMap;
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use futures_util::StreamExt;
use serde::Serialize;
use sherpa_onnx::{
    OfflineNemoEncDecCtcModelConfig, OfflineRecognizer, OfflineRecognizerConfig, OfflineSenseVoiceModelConfig, OfflineTransducerModelConfig,
    OfflineWhisperModelConfig,
};
use tauri::{Emitter, Manager};

struct RemoteFile {
    url: &'static str,
    // Saved under this name locally — deliberately NOT always the same as
    // the last path segment of `url` (e.g. Whisper's repos prefix every
    // filename with the model size, "turbo-encoder.int8.onnx"); since each
    // model already gets its own directory (see model_dir()), there's no
    // need to keep that prefix locally too.
    filename: &'static str,
    // Hardcoded from a one-off `curl -sIL` HEAD request against each URL
    // rather than queried at runtime — used only for the download button's
    // "about N MB" label and the progress bar's percentage before the first
    // response headers come back.
    size: u64,
}

enum ModelFiles {
    SenseVoice { model: RemoteFile, tokens: RemoteFile },
    Whisper { encoder: RemoteFile, decoder: RemoteFile, tokens: RemoteFile },
    // Zipformer-transducer models (e.g. ReazonSpeech) — a different sherpa-onnx
    // model family from SenseVoice/Whisper, with its own three-file (encoder/
    // decoder/joiner) layout and no per-model `language` concept at all (see
    // load_recognizer() and cache_key_language() below).
    Transducer { encoder: RemoteFile, decoder: RemoteFile, joiner: RemoteFile, tokens: RemoteFile },
    // NeMo CTC models (e.g. the NVIDIA Parakeet TDT-CTC Japanese export) —
    // single model file like SenseVoice, but (like Transducer above) no
    // `language` concept to set.
    NemoCtc { model: RemoteFile, tokens: RemoteFile },
}

impl ModelFiles {
    fn all(&self) -> Vec<&RemoteFile> {
        match self {
            ModelFiles::SenseVoice { model, tokens } => vec![model, tokens],
            ModelFiles::Whisper { encoder, decoder, tokens } => vec![encoder, decoder, tokens],
            ModelFiles::Transducer { encoder, decoder, joiner, tokens } => vec![encoder, decoder, joiner, tokens],
            ModelFiles::NemoCtc { model, tokens } => vec![model, tokens],
        }
    }
}

struct ModelDef {
    id: &'static str,
    files: ModelFiles,
}

impl ModelDef {
    fn total_bytes(&self) -> u64 {
        self.files.all().iter().map(|f| f.size).sum()
    }
}

// Display names/descriptions deliberately aren't here — those are UI text
// and belong in main.js's I18N dict (see sttModelOption* keys), translated
// per UI language, not hardcoded to Japanese/English in Rust.
const MODELS: &[ModelDef] = &[
    ModelDef {
        id: "sense-voice-int8",
        files: ModelFiles::SenseVoice {
            model: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/model.int8.onnx",
                filename: "model.onnx",
                size: 239_233_841,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/tokens.txt",
                filename: "tokens.txt",
                size: 315_894,
            },
        },
    },
    ModelDef {
        id: "sense-voice-fp32",
        files: ModelFiles::SenseVoice {
            model: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/model.onnx",
                filename: "model.onnx",
                size: 937_617_178,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/tokens.txt",
                filename: "tokens.txt",
                size: 315_894,
            },
        },
    },
    ModelDef {
        id: "whisper-turbo",
        files: ModelFiles::Whisper {
            encoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-turbo/resolve/main/turbo-encoder.int8.onnx",
                filename: "encoder.onnx",
                size: 674_716_297,
            },
            decoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-turbo/resolve/main/turbo-decoder.int8.onnx",
                filename: "decoder.onnx",
                size: 361_080_764,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-turbo/resolve/main/turbo-tokens.txt",
                filename: "tokens.txt",
                size: 816_730,
            },
        },
    },
    ModelDef {
        id: "whisper-medium",
        files: ModelFiles::Whisper {
            encoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-medium/resolve/main/medium-encoder.int8.onnx",
                filename: "encoder.onnx",
                size: 374_196_283,
            },
            decoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-medium/resolve/main/medium-decoder.int8.onnx",
                filename: "decoder.onnx",
                size: 571_059_257,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-whisper-medium/resolve/main/medium-tokens.txt",
                filename: "tokens.txt",
                size: 816_730,
            },
        },
    },
    // ReazonSpeech-k2-v2 (ja-en variant) — a Zipformer-transducer model
    // trained on 35,000 hours of Japanese TV broadcast audio (Reazon Human
    // Interaction Lab, Apache 2.0), with this specific export additionally
    // tuned for Japanese/English code-switching (see its own test_ja_en.wav
    // in the source repo). Picked over SenseVoice/Whisper specifically for
    // vocabulary coverage of English loanwords used mid-Japanese-sentence
    // ("VR", "AI", ...) that SenseVoice's language-pinned modes drop
    // entirely (see TASK.md #18) — at 159M params / ~73MB int8 total, it's
    // also far smaller and faster than any of the other options here.
    // Japanese/English only, unlike SenseVoice/Whisper's broader zh/ko
    // coverage — reflected in the option label in main.js.
    ModelDef {
        id: "reazonspeech-ja-en",
        files: ModelFiles::Transducer {
            encoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/reazonspeech-k2-v2-ja-en/resolve/main/encoder-epoch-35-avg-1.int8.onnx",
                filename: "encoder.onnx",
                size: 70_876_409,
            },
            decoder: RemoteFile {
                url: "https://huggingface.co/csukuangfj/reazonspeech-k2-v2-ja-en/resolve/main/decoder-epoch-35-avg-1.int8.onnx",
                filename: "decoder.onnx",
                size: 1_308_690,
            },
            joiner: RemoteFile {
                url: "https://huggingface.co/csukuangfj/reazonspeech-k2-v2-ja-en/resolve/main/joiner-epoch-35-avg-1.int8.onnx",
                filename: "joiner.onnx",
                size: 1_033_417,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/reazonspeech-k2-v2-ja-en/resolve/main/tokens.txt",
                filename: "tokens.txt",
                size: 26_631,
            },
        },
    },
    // NVIDIA NeMo Parakeet TDT-CTC, 0.6B params, Japanese — trained on the
    // same 35,000-hour ReazonSpeech corpus as the transducer model above,
    // but a much larger architecture (0.6B vs 159M params). Offered as the
    // "highest accuracy, don't care as much about size/speed" alternative:
    // ~4x reazonspeech-ja-en's total size and correspondingly slower to run,
    // in exchange for whatever accuracy the bigger model buys on vocabulary
    // reazonspeech-ja-en still gets wrong (casual/internet-slang
    // expressions like "ねむねむにゃんこ", per TASK.md #18's follow-up).
    ModelDef {
        id: "parakeet-ja",
        files: ModelFiles::NemoCtc {
            model: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt_ctc-0.6b-ja-35000-int8/resolve/main/model.int8.onnx",
                filename: "model.onnx",
                size: 655_542_604,
            },
            tokens: RemoteFile {
                url: "https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt_ctc-0.6b-ja-35000-int8/resolve/main/tokens.txt",
                filename: "tokens.txt",
                size: 28_557,
            },
        },
    },
];

fn find_model(id: &str) -> Result<&'static ModelDef, String> {
    MODELS.iter().find(|m| m.id == id).ok_or_else(|| format!("unknown STT model id: {id}"))
}

// Same exe-relative-in-release / CARGO_MANIFEST_DIR-in-debug pattern as
// voicevox_dir() in lib.rs, except this directory is never populated by the
// installer — download_stt_model() is the only thing that ever writes to
// it. Kept as "sense_voice" (not renamed to something more generic) so the
// existing /sense_voice/ .gitignore entry (which also covers this
// directory's model-id subfolders) doesn't need to change.
fn stt_models_dir() -> PathBuf {
    if cfg!(debug_assertions) {
        return PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/sense_voice"));
    }
    std::env::current_exe()
        .expect("failed to get current exe path")
        .parent()
        .expect("exe path has no parent directory")
        .join("sense_voice")
}

// Each model gets its own subdirectory — needed since more than one model
// can be downloaded over time (switching models doesn't delete the
// previous one) and, for Whisper, "tokens.txt" is a generic filename that
// would otherwise collide between models with different vocabularies.
fn model_dir(id: &str) -> PathBuf {
    stt_models_dir().join(id)
}

#[tauri::command]
pub fn stt_model_downloaded(model_id: String) -> bool {
    let Ok(def) = find_model(&model_id) else { return false };
    let dir = model_dir(def.id);
    def.files.all().iter().all(|f| dir.join(f.filename).exists())
}

// A plain sync fn, not async: deleting a handful of files (at most ~1GB
// total, but that's just an unlink, not a read) is effectively instant, the
// same reasoning as stt_model_downloaded()'s stat calls above.
#[tauri::command]
pub fn delete_stt_model(model_id: String, app: tauri::AppHandle) -> Result<(), String> {
    let def = find_model(&model_id)?;
    let dir = model_dir(def.id);
    if dir.is_dir() {
        std::fs::remove_dir_all(&dir).map_err(|e| e.to_string())?;
    }

    // If this exact model is the one currently loaded in memory, drop it —
    // its backing files are gone, so leaving the in-memory recognizer in
    // place would let it keep working until the next model/language switch
    // tries to reload from the now-missing path and fails confusingly,
    // instead of just reporting "not downloaded" like stt_model_downloaded()
    // would from that point on.
    let state = app.state::<SenseVoiceState>();
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if guard.as_ref().is_some_and(|loaded| loaded.model_id == model_id) {
        *guard = None;
    }
    Ok(())
}

#[derive(Clone, Serialize)]
struct DownloadProgress {
    #[serde(rename = "modelId")]
    model_id: String,
    file: &'static str, // which file of the model is currently downloading
    #[serde(rename = "bytesDownloaded")]
    bytes_downloaded: u64,
    #[serde(rename = "totalBytes")]
    total_bytes: u64, // the whole model's total, not just the current file's
    // How much of `totalBytes` earlier files in this model already
    // accounted for — added to `bytes_downloaded` on the frontend to get a
    // whole-model progress percentage instead of it resetting to 0% (and
    // briefly going backwards) at the start of every file.
    #[serde(rename = "bytesBefore")]
    bytes_before: u64,
}

// Tracks the cancel flag for whichever model is currently downloading, keyed
// by model_id (in practice at most one at a time — the download button and
// model dropdown are disabled for the duration in main.js — but keying by
// id costs nothing and avoids a global "is anything downloading" bool that
// would be wrong if that assumption ever changes). Entries are removed once
// their download finishes, fails, or is cancelled, so this never grows
// unbounded.
pub struct DownloadCancelState(Mutex<HashMap<String, Arc<AtomicBool>>>);

impl DownloadCancelState {
    pub fn new() -> Self {
        Self(Mutex::new(HashMap::new()))
    }
}

impl Default for DownloadCancelState {
    fn default() -> Self {
        Self::new()
    }
}

// Sets the cancel flag for `model_id`'s in-flight download, if there is
// one — download_stt_model() below polls it once per chunk. Returns false
// (a no-op, not an error) if nothing is currently downloading for that id,
// since the frontend's Cancel button and the download finishing on its own
// can race harmlessly.
#[tauri::command]
pub fn cancel_stt_model_download(model_id: String, state: tauri::State<DownloadCancelState>) -> bool {
    let guard = state.0.lock().unwrap();
    let Some(flag) = guard.get(&model_id) else { return false };
    flag.store(true, Ordering::Relaxed);
    true
}

// Streams instead of buffering each (up to ~700MB) file in one
// `.bytes().await` — without visible progress, a multi-minute download on an
// unremarkable connection is indistinguishable from a hang, so this emits a
// `stt-model-download-progress` event (see setupSttEngineSettings() in
// main.js) after every chunk.
#[tauri::command]
pub async fn download_stt_model(model_id: String, app: tauri::AppHandle) -> Result<(), String> {
    let def = find_model(&model_id)?;
    let dir = model_dir(def.id);

    // A previous run may have already finished this fully — don't discard
    // and re-fetch hundreds of MB on every click of the button, especially
    // while debugging (each redundant attempt burns another couple of
    // minutes before even reaching the part that's actually being tested).
    if def.files.all().iter().all(|f| dir.join(f.filename).exists()) {
        return Ok(());
    }

    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Bounds only the connect+headers phase — the per-chunk timeout below
    // is what guards the (much longer) body-streaming phase, since a single
    // overall request timeout here would either be too short for a
    // legitimately slow-but-working transfer or too long to catch a stall
    // promptly.
    let client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let cancel_flag = Arc::new(AtomicBool::new(false));
    {
        let cancel_state = app.state::<DownloadCancelState>();
        cancel_state.0.lock().unwrap().insert(model_id.clone(), cancel_flag.clone());
    }
    // Runs on every exit path (success, error, or cancellation) via the
    // `result` binding below — a bare `return` inside the loop wouldn't hit
    // an early "remove the entry" call placed before it, and duplicating
    // that cleanup at every return site would be easy to miss one of.
    let result = download_stt_model_inner(def, &dir, &model_id, &app, &client, &cancel_flag).await;
    app.state::<DownloadCancelState>().0.lock().unwrap().remove(&model_id);
    result
}

async fn download_stt_model_inner(
    def: &ModelDef,
    dir: &std::path::Path,
    model_id: &str,
    app: &tauri::AppHandle,
    client: &reqwest::Client,
    cancel_flag: &AtomicBool,
) -> Result<(), String> {
    let total_bytes = def.total_bytes();
    let mut bytes_before = 0u64;
    for file in def.files.all() {
        let path = dir.join(file.filename);
        let response = client.get(file.url).send().await.map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            return Err(format!("download failed: HTTP {} ({})", response.status(), file.url));
        }

        let mut out = std::fs::File::create(&path).map_err(|e| e.to_string())?;
        let mut bytes_downloaded = 0u64;
        let mut chunks = response.bytes_stream();
        loop {
            if cancel_flag.load(Ordering::Relaxed) {
                // Whatever's on disk for this model is now an arbitrary
                // partial mix of files — not worth trying to salvage, so
                // just clear it out. A later download attempt starts fresh
                // rather than seeing a half-written file and (incorrectly,
                // since the "already fully downloaded" check above looks at
                // every file existing, not their sizes) treating it as done.
                let _ = std::fs::remove_dir_all(dir);
                return Err("cancelled".to_string());
            }
            // Per-chunk, not one deadline for the whole download: reqwest's
            // own Client::timeout() bounds the initial send/headers, not
            // however long manually consuming a `.bytes_stream()` takes —
            // in practice that let a stall on the very last chunk (stream
            // never yielding its final `None`) hang forever with the
            // Settings button stuck reading "ダウンロード中... 100%" and no
            // error ever surfacing, since nothing was actually enforcing a
            // limit on that wait. 30s of silence between chunks on top of
            // an otherwise-flowing multi-hundred-MB download is already far
            // more forgiving than legitimate use needs.
            let next = match tokio::time::timeout(Duration::from_secs(30), chunks.next()).await {
                Ok(next) => next,
                Err(_) => return Err(format!("download stalled (no data for 30s) while fetching {}", file.url)),
            };
            let Some(chunk) = next else { break };
            let chunk = chunk.map_err(|e| e.to_string())?;
            out.write_all(&chunk).map_err(|e| e.to_string())?;
            bytes_downloaded += chunk.len() as u64;
            let _ = app.emit(
                "stt-model-download-progress",
                DownloadProgress {
                    model_id: model_id.to_string(),
                    file: file.filename,
                    bytes_downloaded,
                    total_bytes,
                    bytes_before,
                },
            );
        }
        bytes_before += bytes_downloaded;
    }
    Ok(())
}

// The loaded recognizer plus which model/language it was built for —
// both are baked in at construction time (not a per-utterance decode
// parameter), so switching either means rebuilding this from scratch.
// Tracking what's currently loaded is what lets load_stt_model()/
// stt_transcribe() below tell "already loaded, nothing to do" apart from
// "loaded for a different model or language, needs a rebuild".
struct Loaded {
    recognizer: OfflineRecognizer,
    model_id: String,
    language: String,
}

pub struct SenseVoiceState(Mutex<Option<Loaded>>);

impl SenseVoiceState {
    pub fn new() -> Self {
        Self(Mutex::new(None))
    }
}

impl Default for SenseVoiceState {
    fn default() -> Self {
        Self::new()
    }
}

// `language` is either "auto" or a short code ("ja", "en", "zh", "ko") —
// see SENSE_VOICE_LANG_CODES in main.js for the mapping from this app's own
// BCP-47 stt-lang selection; both SenseVoice and Whisper accept the same
// short codes. Pinning a specific language (instead of "auto") skips the
// model's own language-ID step, which is both faster and avoids the
// occasional misdetection auto mode is prone to on short utterances.
fn load_recognizer(def: &ModelDef, language: &str) -> Result<OfflineRecognizer, String> {
    let dir = model_dir(def.id);
    let mut config = OfflineRecognizerConfig::default();
    match &def.files {
        ModelFiles::SenseVoice { model, tokens } => {
            config.model_config.sense_voice = OfflineSenseVoiceModelConfig {
                model: Some(dir.join(model.filename).to_string_lossy().into_owned()),
                language: Some(language.to_string()),
                use_itn: true,
            };
            config.model_config.tokens = Some(dir.join(tokens.filename).to_string_lossy().into_owned());
        }
        ModelFiles::Whisper { encoder, decoder, tokens } => {
            config.model_config.whisper = OfflineWhisperModelConfig {
                encoder: Some(dir.join(encoder.filename).to_string_lossy().into_owned()),
                decoder: Some(dir.join(decoder.filename).to_string_lossy().into_owned()),
                language: Some(language.to_string()),
                task: Some("transcribe".to_string()),
                ..Default::default()
            };
            config.model_config.tokens = Some(dir.join(tokens.filename).to_string_lossy().into_owned());
        }
        ModelFiles::Transducer { encoder, decoder, joiner, tokens } => {
            // No `language` field here — OfflineTransducerModelConfig has
            // none to set (see cache_key_language() below for why the
            // parameter above is otherwise unused in this branch).
            config.model_config.transducer = OfflineTransducerModelConfig {
                encoder: Some(dir.join(encoder.filename).to_string_lossy().into_owned()),
                decoder: Some(dir.join(decoder.filename).to_string_lossy().into_owned()),
                joiner: Some(dir.join(joiner.filename).to_string_lossy().into_owned()),
            };
            config.model_config.tokens = Some(dir.join(tokens.filename).to_string_lossy().into_owned());
        }
        ModelFiles::NemoCtc { model, tokens } => {
            // No `language` field here either — OfflineNemoEncDecCtcModelConfig
            // is just `{ model }` (see cache_key_language() below).
            config.model_config.nemo_ctc = OfflineNemoEncDecCtcModelConfig {
                model: Some(dir.join(model.filename).to_string_lossy().into_owned()),
            };
            config.model_config.tokens = Some(dir.join(tokens.filename).to_string_lossy().into_owned());
        }
    }
    OfflineRecognizer::create(&config).ok_or_else(|| "OfflineRecognizer::create returned None".to_string())
}

// Transducer models (see ModelFiles::Transducer above) have no per-model
// `language` concept at all — load_recognizer() never reads `language` for
// them. Normalizing it here to a fixed value (rather than the frontend's
// actual stt-lang selection) before it's used as part of the "is what's
// currently loaded still valid" cache key means switching the UI's
// recognition language doesn't spuriously reload an already-loaded
// transducer model that was never going to behave differently anyway.
fn cache_key_language(def: &ModelDef, language: &str) -> String {
    match &def.files {
        ModelFiles::Transducer { .. } | ModelFiles::NemoCtc { .. } => String::new(),
        _ => language.to_string(),
    }
}

// Called both when Settings first switches the STT engine to local and
// whenever the selected model or the stt-lang selection changes while it's
// active (see startGoogleStt() in main.js — every language switch tears
// down and restarts the recognition session, which is what re-invokes
// this), so the model is already loaded/rebuilt for the right
// model+language by the time the first utterance finishes instead of
// stalling on it. A no-op if both already match what's loaded.
//
// Loading it is a slow, CPU-bound, synchronous call (OfflineRecognizer::create
// below) — running that directly in an `async fn` command blocks whatever
// thread Tauri's IPC dispatch happens to run it on, which reads as the whole
// app freezing (WebView2 stops responding to anything, not just this one
// button) until it finishes. spawn_blocking moves it onto a thread dedicated
// to blocking work instead. Takes AppHandle rather than State so the closure
// can be `'static` (State borrows and can't move into a spawned thread).
#[tauri::command]
pub async fn load_stt_model(model_id: String, language: String, app: tauri::AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let def = find_model(&model_id)?;
        let language = cache_key_language(def, &language);
        let state = app.state::<SenseVoiceState>();
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        let stale = guard.as_ref().is_none_or(|loaded| loaded.model_id != model_id || loaded.language != language);
        if stale {
            *guard = Some(Loaded { recognizer: load_recognizer(def, &language)?, model_id, language });
        }
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

// `samples` is one whole already-VAD-segmented utterance (mono, [-1, 1]
// range) — see the buffering in startVoiceMonitor()'s onaudioprocess.
//
// Also spawn_blocking'd, same reasoning as load_stt_model() above:
// decode() itself is fast relative to the audio's own length, but the
// lazy-load / mismatch-rebuild fallback below — reached if a transcribe
// request arrives before Settings' own load_stt_model() call finished, or
// the model/language changed since — is exactly as slow as that call, so
// this needs the same treatment.
#[tauri::command]
pub async fn stt_transcribe(
    samples: Vec<f32>,
    sample_rate: i32,
    model_id: String,
    language: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let def = find_model(&model_id)?;
        let language = cache_key_language(def, &language);
        let state = app.state::<SenseVoiceState>();
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        let stale = guard.as_ref().is_none_or(|loaded| loaded.model_id != model_id || loaded.language != language);
        if stale {
            *guard = Some(Loaded { recognizer: load_recognizer(def, &language)?, model_id, language });
        }
        let recognizer = &guard.as_ref().expect("just set above if it was None").recognizer;

        let stream = recognizer.create_stream();
        stream.accept_waveform(sample_rate, &samples);
        recognizer.decode(&stream);

        Ok(stream.get_result().map(|r| r.text).unwrap_or_default())
    })
    .await
    .map_err(|e| e.to_string())?
}


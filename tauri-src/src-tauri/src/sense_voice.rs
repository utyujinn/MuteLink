// Local, offline STT (via the `sherpa-onnx` crate) — the alternative to the
// Web Speech API path (see setupSttEngineSettings()/sttEngine in main.js).
// Several models are offered (see MODELS below), from different sherpa-onnx
// model families (SenseVoice, Whisper); the user picks one in Settings and
// only that one is ever downloaded. None of them ship in the installer at
// all — each is several hundred MB to ~1GB, downloaded on demand the same
// way additional VOICEVOX characters are (see download_character in
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

use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Duration;

use futures_util::StreamExt;
use serde::Serialize;
use sherpa_onnx::{OfflineRecognizer, OfflineRecognizerConfig, OfflineSenseVoiceModelConfig, OfflineWhisperModelConfig};
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
}

impl ModelFiles {
    fn all(&self) -> Vec<&RemoteFile> {
        match self {
            ModelFiles::SenseVoice { model, tokens } => vec![model, tokens],
            ModelFiles::Whisper { encoder, decoder, tokens } => vec![encoder, decoder, tokens],
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
                    model_id: model_id.clone(),
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
    }
    OfflineRecognizer::create(&config).ok_or_else(|| "OfflineRecognizer::create returned None".to_string())
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

// Voice activity detection for the local STT path (SenseVoice/Whisper/Parakeet
// — see sense_voice.rs). Replaces the old plain RMS-threshold "is this
// loud enough to be a voice" check that used to live entirely in main.js
// (still used there for the general "listening" status indicator, just not
// for deciding where an utterance starts/ends anymore — see
// startVoiceMonitor()'s onaudioprocess). A trained VAD tells actual speech
// apart from breath/airflow noise and room noise far better than a bare
// amplitude threshold does (see TASK.md #20 — RMS alone was prone to
// misfiring on breath noise, e.g. lying down close to the mic).
//
// Uses Silero VAD via the `sherpa-onnx` crate (already a dependency for
// sense_voice.rs) — no new heavy dependency. The model
// (vad/silero_vad.onnx, ~630KB) is small enough to commit directly and ship
// via bundle.resources, unlike the STT models which are downloaded on
// demand.
//
// The Web Speech API path is untouched — it has its own built-in endpoint
// detection and never reaches this module.

use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use sherpa_onnx::{SileroVadModelConfig, VadModelConfig, VoiceActivityDetector};

// Silero VAD's own native rate — accept_waveform() has no sample_rate
// parameter (unlike OfflineStream's), so unlike sense_voice.rs's recognizers
// it does no resampling of its own; callers must already be at this rate
// (see resample_to_16k below).
const VAD_SAMPLE_RATE: i32 = 16000;

// Same exe-relative-in-release / CARGO_MANIFEST_DIR-in-debug pattern as
// voicevox_dir() in lib.rs — this one's committed straight into the repo
// (see tauri-src/src-tauri/vad/), not downloaded, since it's tiny.
fn vad_model_path() -> PathBuf {
    let dir = if cfg!(debug_assertions) {
        PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/vad"))
    } else {
        std::env::current_exe()
            .expect("failed to get current exe path")
            .parent()
            .expect("exe path has no parent directory")
            .join("vad")
    };
    dir.join("silero_vad.onnx")
}

pub struct VadState(Mutex<Option<VoiceActivityDetector>>);

impl VadState {
    pub fn new() -> Self {
        Self(Mutex::new(None))
    }
}

impl Default for VadState {
    fn default() -> Self {
        Self::new()
    }
}

fn create_vad() -> Result<VoiceActivityDetector, String> {
    let config = VadModelConfig {
        silero_vad: SileroVadModelConfig {
            model: Some(vad_model_path().to_string_lossy().into_owned()),
            // Silero's own recommended default — how confident the model
            // needs to be (0.0-1.0) before a frame counts as speech.
            threshold: 0.5,
            // How long a pause has to last before a segment is considered
            // over — mirrors the old SENSE_VOICE_SILENCE_MS (700ms) in
            // main.js, now enforced by the model itself instead of a plain
            // wall-clock timer.
            min_silence_duration: 0.7,
            // Rejects blips shorter than this (clicks, a single cough)
            // rather than kicking off a whole transcribe() call for them.
            min_speech_duration: 0.1,
            // Silero v5's expected window size at 16kHz (per sherpa-onnx's
            // own examples) — an internal processing chunk size, unrelated
            // to the 4096-sample chunks main.js's ScriptProcessor hands in.
            window_size: 512,
            // A generous cap so a long sentence never gets force-cut
            // mid-utterance; effectively unused in practice.
            max_speech_duration: 20.0,
        },
        ten_vad: Default::default(),
        sample_rate: VAD_SAMPLE_RATE,
        num_threads: 1,
        provider: None,
        debug: false,
    };
    VoiceActivityDetector::create(&config, 30.0).ok_or_else(|| "VoiceActivityDetector::create returned None".to_string())
}

// Linear interpolation — good enough for VAD purposes (it only needs to
// tell speech apart from silence/noise, not preserve fine spectral detail
// the way feeding a mis-resampled signal into an STT model would matter).
// The browser's AudioContext sample rate varies by device/OS default (see
// monitorCtx in main.js, never pinned to a fixed rate), so this has to
// handle an arbitrary input rate, not just a fixed one.
fn resample_to_16k(samples: &[f32], input_rate: i32) -> Vec<f32> {
    if input_rate == VAD_SAMPLE_RATE || samples.is_empty() {
        return samples.to_vec();
    }
    let ratio = VAD_SAMPLE_RATE as f64 / input_rate as f64;
    let out_len = ((samples.len() as f64) * ratio).round() as usize;
    let mut out = Vec::with_capacity(out_len);
    for i in 0..out_len {
        let src_pos = i as f64 / ratio;
        let idx = src_pos.floor() as usize;
        let frac = (src_pos - idx as f64) as f32;
        let a = samples[idx.min(samples.len() - 1)];
        let b = samples[(idx + 1).min(samples.len() - 1)];
        out.push(a + (b - a) * frac);
    }
    out
}

#[derive(Serialize)]
pub struct VadChunkResult {
    // Whether the detector considers itself mid-speech right now — lets the
    // frontend rebuild the "utterance in progress" state it used to track
    // itself via senseVoiceUtteranceActive, now that segmentation itself
    // lives here (see runSenseVoiceInterim's periodic-preview trigger in
    // main.js, which still needs to know this).
    #[serde(rename = "inSpeech")]
    in_speech: bool,
    // Usually 0 or 1 completed segments per call, but draining the whole
    // queue here (not just front()) means a slow frontend that falls behind
    // for a moment still gets every segment on its next poll instead of
    // silently losing one Silero already flushed.
    segments: Vec<Vec<f32>>,
}

// Called once per audio chunk from startVoiceMonitor()'s onaudioprocess
// while the local STT engine is armed (see main.js) — feeds raw samples
// into the VAD and drains whatever complete utterances it has produced so
// far. The lazy-create-on-first-call here mirrors stt_transcribe's own
// lazy-load fallback in sense_voice.rs.
#[tauri::command]
pub fn vad_process_chunk(samples: Vec<f32>, sample_rate: i32, state: tauri::State<VadState>) -> Result<VadChunkResult, String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if guard.is_none() {
        *guard = Some(create_vad()?);
    }
    let vad = guard.as_ref().expect("just set above if it was None");

    let resampled = resample_to_16k(&samples, sample_rate);
    vad.accept_waveform(&resampled);

    let mut segments = Vec::new();
    while let Some(seg) = vad.front() {
        segments.push(seg.samples().to_vec());
        vad.pop();
    }

    Ok(VadChunkResult { in_speech: vad.detected(), segments })
}

// Called when the mic monitor stops/(re)starts (see stopGoogleStt() in
// main.js) so a fresh session doesn't inherit stale internal state (a
// half-open speech segment, buffered silence) from whatever was happening
// right before the previous stop.
#[tauri::command]
pub fn vad_reset(state: tauri::State<VadState>) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(vad) = guard.as_ref() {
        vad.reset();
    }
    Ok(())
}

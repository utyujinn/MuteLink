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

use std::collections::VecDeque;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use sherpa_onnx::{SileroVadModelConfig, VadModelConfig, VoiceActivityDetector};

// Silero VAD's own native rate — accept_waveform() has no sample_rate
// parameter (unlike OfflineStream's), so unlike sense_voice.rs's recognizers
// it does no resampling of its own; callers must already be at this rate
// (see resample_to_16k below).
const VAD_SAMPLE_RATE: i32 = 16000;

// How much *additional* lead-in to prepend to a segment, beyond what
// sherpa-onnx's own detector already backdates its start by (~164ms at this
// module's own settings — see VadInner's own comment). The pre-VAD RMS
// approach this module replaced buffered 3 * ~4096-sample chunks (~260-
// 280ms depending on the browser's own AudioContext rate) and *still*
// clipped word onsets roughly a third of the time in testing, so matching
// that alone isn't enough headroom — this is chosen to comfortably exceed
// it once added on top of sherpa's own margin. Cheap to be generous with:
// a bit of extra leading silence costs far less than a clipped first
// syllable.
const EXTRA_PRE_ROLL_SAMPLES: usize = VAD_SAMPLE_RATE as usize * 250 / 1000;
// How much resampled (16kHz) history to keep around for the above — only
// needs to comfortably exceed EXTRA_PRE_ROLL_SAMPLES plus the handful of
// extra samples accept_waveform's own internal window-stepping can add
// before a popped segment's start() is finally known (bounded by one
// onaudioprocess chunk's worth, well under 100ms) — not the whole
// utterance, since this is anchored to seg.start() (see
// VadInner::extra_pre_roll_for), not replayed from scratch per segment.
const PRE_ROLL_RING_SAMPLES: usize = VAD_SAMPLE_RATE as usize * 600 / 1000;

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

// Bundles the detector with a *precisely-anchored* pre-roll snapshot,
// recovering what Silero clips off a segment's own start (the same "first
// word missing" symptom TASK.md #13 originally fixed for the Web Speech
// path — there, SpeechRecognition.start()'s own latency ate the first
// syllable; here it's Silero itself needing several consecutive
// above-threshold frames before it's confident speech has started).
//
// sherpa-onnx's own VoiceActivityDetector already backdates a segment's
// start by 2*window_size + min_speech_duration_samples (≈164ms at this
// module's settings) from the instant detection triggers — see
// voice-activity-detector.cc's AcceptWaveform in the sherpa-onnx C++
// sources: `start_ = max(buffer_.Tail() - 2*WindowSize() -
// MinSpeechDurationSamples(), buffer_.Head())`, and that exact value is
// what SpeechSegment::start() reports back.
//
// Two earlier versions of this struct got this wrong in opposite ways:
// - v1 captured its own ~300ms pre-roll snapshot with no awareness of
//   sherpa's own backdated start at all, so the two lookback windows
//   overlapped and the shared ~164ms got transcribed twice in a row at the
//   start of every utterance ("音声がかぶってる").
// - v2 fixed the overlap by anchoring to SpeechSegment::start(), but read
//   the extra pre-roll from a small *live* ring at *pop* time — by which
//   point (after the whole utterance plus min_silence_duration of trailing
//   silence) that ring had long since evicted the audio near the segment's
//   own start for anything but a very short utterance, so it silently
//   contributed nothing for a normal sentence.
//
// This version keeps both fixes at once: the snapshot is captured once, at
// the instant detection first triggers (was_detected: false -> true) —
// *frozen* from then on, so however long the utterance itself later runs is
// irrelevant — and extra_pre_roll_for below still trims it against the
// segment's own eventual start() once known, so it can never overlap
// seg.samples() regardless of how the two lookback amounts compare.
#[derive(Default)]
struct VadInner {
    vad: Option<VoiceActivityDetector>,
    // Cumulative count of resampled (16kHz) samples ever fed to
    // accept_waveform, in the exact same units as SpeechSegment::start() —
    // confirmed against sherpa-onnx's own source: both are absolute sample
    // indices since the VoiceActivityDetector was created (or last reset),
    // and Reset() zeroes both (see vad_reset).
    total_samples: u64,
    // Ring of the most recent PRE_ROLL_RING_SAMPLES resampled samples,
    // continuously updated every call — read from (snapshotted into
    // captured_pre_roll below) only at the false->true edge, never
    // afterward, so its own limited size only ever needs to comfortably
    // cover EXTRA_PRE_ROLL_SAMPLES plus the handful of samples
    // accept_waveform's own internal window-stepping can add before that
    // edge is detected (bounded by one onaudioprocess chunk's worth, well
    // under 100ms) — not the whole utterance.
    pre_roll: VecDeque<f32>,
    // detected()'s value as of the previous call — edge-detects the
    // false->true transition so the snapshot below is captured exactly once
    // per utterance (right as it starts), not re-captured on every
    // subsequent still-speaking chunk.
    was_detected: bool,
    // (total_samples, ring contents) captured at the instant the
    // in-progress utterance was first detected — frozen until whichever
    // segment is popped off the queue next takes it (assumes at most one
    // utterance is ever in flight at a time, true for this app's
    // single-speaker use), regardless of how long that takes.
    captured_pre_roll: Option<(u64, Vec<f32>)>,
}

impl VadInner {
    // Up to EXTRA_PRE_ROLL_SAMPLES of resampled audio strictly before
    // `seg_start` (a just-popped segment's own SpeechSegment::start()),
    // sliced from the frozen snapshot captured when that segment's
    // utterance first triggered — never overlapping seg.samples() itself,
    // which already begins exactly at seg_start. Returns fewer samples
    // (down to none) if the snapshot doesn't reach back far enough, e.g.
    // right after vad_reset(), or if there simply isn't one (multiple
    // segments popped in one call — see its own comment).
    fn extra_pre_roll_for(&mut self, seg_start: u64) -> Vec<f32> {
        let Some((end, snapshot)) = self.captured_pre_roll.take() else {
            return Vec::new();
        };
        let ring_start = end.saturating_sub(snapshot.len() as u64);
        let want_start = seg_start.saturating_sub(EXTRA_PRE_ROLL_SAMPLES as u64).max(ring_start);
        let want_end = seg_start.min(end);
        if want_end <= want_start {
            return Vec::new();
        }
        let from = (want_start - ring_start) as usize;
        let to = (want_end - ring_start) as usize;
        snapshot[from..to].to_vec()
    }
}

pub struct VadState(Mutex<VadInner>);

impl VadState {
    pub fn new() -> Self {
        Self(Mutex::new(VadInner::default()))
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
            // How confident the model needs to be (0.0-1.0) before a frame
            // counts as speech. Lower than Silero's own recommended default
            // of 0.5 (see git history) — at 0.5, the model's own confidence
            // dips below threshold too easily on soft/breathy portions of
            // real speech (a trailing devoiced vowel on です/ます-type
            // Japanese sentence endings especially), not just on actual
            // silence, which was showing up as three related symptoms all
            // at once: clipped onsets even with generous pre-roll (the
            // model itself was slow to confirm a soft attack in the first
            // place), clipped word endings (a soft tail read as "speech
            // over" before it actually was), and utterances getting split
            // into multiple Finals at a mid-sentence breath/pause that
            // shouldn't have counted as real silence. A lower bar makes the
            // model keep calling borderline-but-real speech "speech" for
            // longer, at the cost of being more prone to the breath/room-
            // noise misfires TASK.md #20 introduced Silero VAD to fix in
            // the first place — revisit upward again if those come back.
            threshold: 0.35,
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
    let mut inner = state.0.lock().map_err(|e| e.to_string())?;
    if inner.vad.is_none() {
        inner.vad = Some(create_vad()?);
    }

    let resampled = resample_to_16k(&samples, sample_rate);

    // Snapshot *before* this chunk is fed to the VAD below, so a capture
    // triggered by this same chunk's own accept_waveform call still reflects
    // "everything up to but not including it" — the ring the model hadn't
    // processed yet at the instant it decided speech had started.
    let was_detected = inner.was_detected;
    inner.total_samples += resampled.len() as u64;
    inner.pre_roll.extend(resampled.iter().copied());
    while inner.pre_roll.len() > PRE_ROLL_RING_SAMPLES {
        inner.pre_roll.pop_front();
    }

    inner.vad.as_ref().expect("just set above if it was None").accept_waveform(&resampled);

    let now_detected = inner.vad.as_ref().unwrap().detected();
    if now_detected && !was_detected {
        inner.captured_pre_roll = Some((inner.total_samples, inner.pre_roll.iter().copied().collect()));
    }
    inner.was_detected = now_detected;

    let mut segments = Vec::new();
    while let Some(seg) = inner.vad.as_ref().unwrap().front() {
        // seg.samples() already includes sherpa-onnx's own backdated lead-in
        // (see VadInner's own comment) — extra_pre_roll_for only ever adds
        // audio strictly before that, so this can't reintroduce the old
        // duplicate-audio bug regardless of how the two amounts compare.
        let mut out = inner.extra_pre_roll_for(seg.start().max(0) as u64);
        out.extend(seg.samples());
        segments.push(out);
        inner.vad.as_ref().unwrap().pop();
    }

    Ok(VadChunkResult { in_speech: now_detected, segments })
}

// Called when the mic monitor stops/(re)starts (see stopGoogleStt() in
// main.js) so a fresh session doesn't inherit stale internal state (a
// half-open speech segment, buffered silence, a pre-roll snapshot from
// whatever utterance was last heard) from whatever was happening right
// before the previous stop.
#[tauri::command]
pub fn vad_reset(state: tauri::State<VadState>) -> Result<(), String> {
    let mut inner = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(vad) = inner.vad.as_ref() {
        vad.reset();
    }
    inner.total_samples = 0;
    inner.pre_roll.clear();
    inner.was_detected = false;
    inner.captured_pre_roll = None;
    Ok(())
}

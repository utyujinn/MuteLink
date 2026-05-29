use std::io::{Cursor, Read};
use cpal::traits::{DeviceTrait, HostTrait};

const VOICEVOX_URL: &str = "http://127.0.0.1:50021";

/// 利用可能な出力デバイスのリストを返す
pub fn list_devices() -> Option<Vec<String>> {
    let host = cpal::default_host();
    let devices: Vec<String> = host
        .output_devices()
        .ok()?
        .filter_map(|dev| dev.name().ok())
        .collect();
    if devices.is_empty() { None } else { Some(devices) }
}

/// VoiceVox で日本語テキストを合成し、指定デバイスで再生する（バックグラウンド）
pub fn speak(text: &str, speaker_id: i32, device_idx: usize) {
    let text = text.to_string();
    std::thread::spawn(move || {
        if let Err(e) = tts_blocking(&text, speaker_id, device_idx) {
            eprintln!("[tts] error: {e}");
        }
    });
}

fn tts_blocking(text: &str, speaker_id: i32, device_idx: usize) -> Result<(), String> {
    // ── audio_query 取得 ──
    let query_url = format!(
        "{}/audio_query?text={}&speaker={}",
        VOICEVOX_URL,
        urlencoding::encode(text),
        speaker_id
    );
    let query_body = ureq::post(&query_url)
        .call()
        .map_err(|e| format!("audio_query request failed: {e}"))?
        .into_string()
        .map_err(|e| format!("read audio_query body failed: {e}"))?;
    let audio_query: serde_json::Value = serde_json::from_str(&query_body)
        .map_err(|e| format!("audio_query json parse: {e}"))?;

    // ── synthesis 実行 ──
    let synth_url = format!("{}/synthesis?speaker={}", VOICEVOX_URL, speaker_id);
    let audio_query_str = audio_query.to_string();
    let synth_resp = ureq::post(&synth_url)
        .set("Content-Type", "application/json")
        .send_string(&audio_query_str)
        .map_err(|e| format!("synthesis request failed: {e}"))?;

    let mut wav_bytes = Vec::new();
    synth_resp
        .into_reader()
        .read_to_end(&mut wav_bytes)
        .map_err(|e| format!("read wav failed: {e}"))?;

    // ── 指定デバイスで再生 ──
    let host = cpal::default_host();
    let device = host
        .output_devices()
        .ok()
        .and_then(|mut devs| devs.nth(device_idx))
        .ok_or_else(|| "specified output device not found".to_string())?;

    let (stream, stream_handle) = rodio::OutputStream::try_from_device(&device)
        .map_err(|e| format!("output stream failed: {e}"))?;
    let cursor = Cursor::new(wav_bytes);
    let source = rodio::Decoder::new(cursor)
        .map_err(|e| format!("decode failed: {e}"))?;

    let sink = rodio::Sink::try_new(&stream_handle)
        .map_err(|e| format!("sink creation failed: {e}"))?;
    sink.append(source);
    sink.sleep_until_end();
    std::mem::drop(stream);

    Ok(())
}

// Hiragana → kanji conversion (かな漢字変換) for the VR flick-input
// keyboard's 変換 button (see TASK.md #23). Flick input itself produces
// hiragana directly — this is specifically the *conversion* step (candidate
// list for e.g. "きょう" -> ["今日", "きょう", "教", "強", "凶"]).
//
// No local/offline engine was realistically embeddable here: Mozc's own
// IPC protocol (named pipes + Protocol Buffers, see its mozc_ipc design
// doc) is undocumented for third-party use and building it needs Bazel + a
// full C++ toolchain + Mozc's own data-compilation pipeline — a multi-day
// undertaking on its own, not something to fold into this app's build.
// libkkc/Anthy have no Windows story and no Rust bindings at all. So this
// calls Google's old, unofficial "transliterate" CGI endpoint instead —
// undocumented and deprecated since ~2011 (no SLA, could disappear or start
// rate-limiting without notice) but confirmed still live as of writing. If
// it ever breaks, this is the one place to swap in a different backend.

// One bunsetsu (phrase/clause) chunk of a conversion response — see
// convert_kana_to_kanji's own comment for the response shape this maps
// from. `original` is that chunk's own un-converted reading, kept as
// candidates[0]'s natural fallback (main.js prepends it into its own
// candidate list, see handleHenkanPress).
#[derive(serde::Serialize)]
pub struct ImeSegment {
    original: String,
    candidates: Vec<String>,
}

#[tauri::command]
pub async fn convert_kana_to_kanji(text: String) -> Result<Vec<ImeSegment>, String> {
    if text.is_empty() {
        return Ok(Vec::new());
    }

    let client = reqwest::Client::new();
    let response = client
        .get("https://www.google.com/transliterate")
        .query(&[("langpair", "ja-Hira|ja"), ("text", text.as_str())])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("transliterate request failed: HTTP {}", response.status()));
    }

    // Response shape: [["ここでは", ["ここでは","個々では","此処では"]],
    // ["きものを", [...]], ["ぬぐ", [...]]] — the endpoint auto-segments a
    // plain (comma-free) hiragana run into bunsetsu (phrase) chunks on its
    // own; commas in the *request* text only let the caller override where
    // those boundaries fall, they aren't required to get segmentation at
    // all. An earlier version of this only kept the first entry, silently
    // discarding the rest of a multi-clause conversion (and any hiragana
    // belonging to it) — main.js now walks every segment and lets each be
    // cycled/re-converted independently (see its own
    // vrKeyboardConversionSegments), matching how a real IME lets you
    // adjust one clause without disturbing the others.
    let entries: Vec<(String, Vec<String>)> = response.json().await.map_err(|e| e.to_string())?;
    Ok(entries.into_iter().map(|(original, candidates)| ImeSegment { original, candidates }).collect())
}

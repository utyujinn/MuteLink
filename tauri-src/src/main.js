const GOOGLE_RETRY_MS = 3000;
const SILENCE_TIMEOUT_MS = 5000;
const VOICE_RMS_THRESHOLD = 0.01;

let recognition;
let armed = false; // Start/Stop button state; survives pause/resume cycles
let recognizing = false; // true while a recognition session is supposed to be running
let googleHadError = false;
let googleRetryTimer;
let googleBtn;
let googleStatusEl;
let sttLangSelect;
let chatboxToggle;
let sendModeSelect;
let interimTextEl;
let finalTextEl;
let sentTextEl;
let manualSendRow;
let manualSendBtn;
let manualClearBtn;
let pendingFinalText = "";
let logEl;

async function sendChatbox(text) {
  try {
    await window.__TAURI__.core.invoke("send_chatbox", { text });
    log(`[chatbox] sent: ${text}`);
  } catch (err) {
    log(`[chatbox] error: ${err}`);
  }
}

// The one place that actually delivers a confirmed piece of text — called
// either immediately (Auto mode / picking an ending) or from the manual send
// button (手動 mode, no ending). `params` carries a specific ending's VOICEVOX
// scales; omitted entirely when there's no ending involved, so VOICEVOX just
// uses its own defaults.
function dispatchText(text, params) {
  sentTextEl.textContent = text;
  if (chatboxToggle.checked) sendChatbox(text);
  // VOICEVOX only synthesizes Japanese (OpenJTalk fails to parse other scripts).
  if (sttLangSelect.value === "ja-JP") {
    speak(text, params);
  } else {
    log("[voicevox] skipped: recognition language is not Japanese");
  }
}

// SpeechRecognition owns mic capture internally and doesn't expose audio
// levels, so silence/voice is measured by a second, independent mic stream
// that only ever computes RMS locally — nothing from it is sent anywhere.
// It stays alive across pause/resume so speech can restart recognition
// automatically; only the Stop button tears it down.
let monitorStream;
let monitorCtx;
let monitorSource;
let monitorProcessor;
let lastVoiceAt = 0;
let silenceCheckTimer;

function log(line) {
  const p = document.createElement("p");
  p.textContent = line;
  logEl.prepend(p);
}

function rms(float32) {
  let sum = 0;
  for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
  return Math.sqrt(sum / float32.length);
}

async function startVoiceMonitor() {
  monitorStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  monitorCtx = new AudioContext();
  monitorSource = monitorCtx.createMediaStreamSource(monitorStream);
  monitorProcessor = monitorCtx.createScriptProcessor(4096, 1, 1);

  monitorProcessor.onaudioprocess = (event) => {
    if (rms(event.inputBuffer.getChannelData(0)) < VOICE_RMS_THRESHOLD) return;
    lastVoiceAt = Date.now();
    if (armed && !recognizing) resumeRecognition();
  };

  monitorSource.connect(monitorProcessor);
  monitorProcessor.connect(monitorCtx.destination);

  lastVoiceAt = Date.now();
  silenceCheckTimer = setInterval(() => {
    if (recognizing && Date.now() - lastVoiceAt >= SILENCE_TIMEOUT_MS) pauseRecognition();
  }, 1000);
}

async function stopVoiceMonitor() {
  clearInterval(silenceCheckTimer);
  if (monitorProcessor) monitorProcessor.disconnect();
  if (monitorSource) monitorSource.disconnect();
  if (monitorStream) monitorStream.getTracks().forEach((t) => t.stop());
  if (monitorCtx) await monitorCtx.close();
  monitorStream = monitorCtx = monitorSource = monitorProcessor = undefined;
}

// Tauri's webview is WebView2 (Edge/Chromium engine), so this actually talks
// to Microsoft's speech backend, not Google's, even though the API shape
// (webkitSpeechRecognition) is the one Chrome popularized.
function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SpeechRecognition();
  r.lang = sttLangSelect.value;
  r.continuous = true;
  r.interimResults = true;

  r.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;

    if (!result.isFinal) {
      interimTextEl.textContent = text;
      log(`[google:partial] text=${text}`);
      return;
    }

    log(`[google:final] text=${text}`);
    interimTextEl.textContent = "";

    if (sendModeSelect.value === "manual") {
      // A new Final can arrive before the pending one is sent — append
      // rather than overwrite so nothing said in the meantime is lost.
      pendingFinalText = pendingFinalText ? `${pendingFinalText} ${text}` : text;
      finalTextEl.textContent = pendingFinalText;
      manualSendRow.hidden = false;
    } else {
      dispatchText(text);
      finalTextEl.textContent = "";
    }
  };
  r.onstart = () => {
    googleHadError = false;
    googleStatusEl.textContent = "listening";
  };
  r.onerror = (event) => {
    googleHadError = true;
  };
  r.onend = () => {
    // Only reconnect if we're still supposed to be actively recognizing.
    // pauseRecognition()/stopGoogleStt() clear `recognizing` before calling
    // stop(), so their own end events land here as a no-op.
    if (!armed || !recognizing) return;
    try {
      googleStatusEl.textContent = googleHadError ? "disconnected, retrying..." : "reconnecting...";
      r.start();
    } catch {
      scheduleGoogleRetry();
    }
  };

  return r;
}

function resumeRecognition() {
  if (recognizing) return;
  recognizing = true;
  googleHadError = false;
  googleStatusEl.textContent = "connecting...";
  try {
    recognition.start();
  } catch {
    // The previous session's stop() may not have finished tearing down yet.
    recognizing = false;
    setTimeout(() => {
      if (armed && !recognizing) resumeRecognition();
    }, 250);
  }
}

function pauseRecognition() {
  if (!recognizing) return;
  recognizing = false;
  clearTimeout(googleRetryTimer);
  recognition.stop();
  googleStatusEl.textContent = "waiting for voice...";
}

function scheduleGoogleRetry() {
  clearTimeout(googleRetryTimer);
  googleRetryTimer = setTimeout(() => {
    if (!armed || !recognizing) return;
    try {
      recognition.start();
    } catch {
      scheduleGoogleRetry();
    }
  }, GOOGLE_RETRY_MS);
}

async function startGoogleStt() {
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    googleStatusEl.textContent = "error: SpeechRecognition not supported";
    return;
  }

  try {
    await startVoiceMonitor();
  } catch (err) {
    googleStatusEl.textContent = `error: ${err.message}`;
    return;
  }

  recognition = createRecognition();
  armed = true;
  googleBtn.textContent = "Google STT Stop";
  sttLangSelect.disabled = true;
  resumeRecognition();
}

function stopGoogleStt() {
  armed = false;
  recognizing = false;
  googleHadError = false;
  clearTimeout(googleRetryTimer);
  if (recognition) recognition.stop();
  stopVoiceMonitor();
  googleStatusEl.textContent = "idle";
  googleBtn.textContent = "Google STT Start";
  sttLangSelect.disabled = false;
}

let voicevoxInput;
let voicevoxBtn;
let voicevoxStatusEl;
let voicevoxOutputsSelect;

// enumerateDevices() only returns real labels/ids once a media permission has
// been granted on this page, so probe getUserMedia first (audio-only, we
// immediately stop the track — we just need the permission side effect).
async function populateOutputDevices() {
  try {
    const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
    probe.getTracks().forEach((t) => t.stop());
  } catch (err) {
    log(`[voicevox] mic permission probe failed, device labels may be blank: ${err}`);
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const outputs = devices.filter((d) => d.kind === "audiooutput");

  voicevoxOutputsSelect.innerHTML = "";
  for (const d of outputs) {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = d.label || d.deviceId;
    opt.selected = d.label.includes("CABLE Input");
    voicevoxOutputsSelect.appendChild(opt);
  }
}

async function speak(text, params = {}) {
  text = (text ?? voicevoxInput.value).trim();
  if (!text) return;
  voicevoxInput.value = text;

  voicevoxStatusEl.textContent = "synthesizing...";
  try {
    const bytes = await window.__TAURI__.core.invoke("synthesize", {
      text,
      speedScale: params.speedScale,
      pitchScale: params.pitchScale,
      intonationScale: params.intonationScale,
      volumeScale: params.volumeScale,
    });
    const blob = new Blob([new Uint8Array(bytes)], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const sinkIds = Array.from(voicevoxOutputsSelect.selectedOptions).map((o) => o.value);
    const targets = sinkIds.length > 0 ? sinkIds : [""]; // no selection = default device

    let remaining = targets.length;
    const players = targets.map((sinkId) => {
      const audio = new Audio(url);
      audio.onended = () => {
        remaining -= 1;
        if (remaining === 0) {
          URL.revokeObjectURL(url);
          voicevoxStatusEl.textContent = "idle";
        }
      };
      return { audio, sinkId };
    });

    for (const { audio, sinkId } of players) {
      if (sinkId && audio.setSinkId) await audio.setSinkId(sinkId);
    }
    await Promise.all(players.map(({ audio }) => audio.play()));

    voicevoxStatusEl.textContent = `playing (${targets.length} output${targets.length > 1 ? "s" : ""})`;
  } catch (err) {
    voicevoxStatusEl.textContent = `error: ${err}`;
  }
}

function setupTitlebar() {
  const appWindow = window.__TAURI__.window.getCurrentWindow();

  document.querySelector("#titlebar-minimize").addEventListener("click", () => appWindow.minimize());
  document.querySelector("#titlebar-maximize").addEventListener("click", () => appWindow.toggleMaximize());
  document.querySelector("#titlebar-close").addEventListener("click", () => appWindow.close());
}

function setupSettingsDialog() {
  const dialog = document.querySelector("#settings-dialog");
  document.querySelector("#settings-btn").addEventListener("click", () => dialog.showModal());
  document.querySelector("#settings-close-btn").addEventListener("click", () => dialog.close());
}

const ENDINGS_STORAGE_KEY = "mutelink.endings";
const DEFAULT_ENDING_PARAMS = { speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1 };
const DEFAULT_ENDINGS = [
  "..o0",
  "xwx",
  "~",
  "www",
  "…",
  "！",
  "？",
  "(笑)",
  "❤",
  "😳",
  "><",
  "(´・ω・`)",
].map((text) => ({ text, ...DEFAULT_ENDING_PARAMS }));

function loadEndings() {
  try {
    const raw = JSON.parse(localStorage.getItem(ENDINGS_STORAGE_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length > 0 && raw.every((e) => typeof e?.text === "string")) {
      return raw;
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_ENDINGS;
}

function saveEndings(endings) {
  localStorage.setItem(ENDINGS_STORAGE_KEY, JSON.stringify(endings));
}

function renderEndingButtons(container, endings, onPick) {
  container.innerHTML = "";
  for (const ending of endings) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ending.text;
    btn.addEventListener("click", () => onPick(ending));
    container.appendChild(btn);
  }
}

// Picking a favorite appends it to whatever's pending in the Final block and
// sends immediately, using that ending's own VOICEVOX parameters. A trailing
// 。/. on the pending text is dropped first since the ending replaces it.
function setupEndings() {
  const endingButtons = document.querySelector("#ending-buttons");
  const endingNewInput = document.querySelector("#ending-new");
  const endingAddBtn = document.querySelector("#ending-add-btn");
  const speedInput = document.querySelector("#ending-speed");
  const pitchInput = document.querySelector("#ending-pitch");
  const intonationInput = document.querySelector("#ending-intonation");
  const volumeInput = document.querySelector("#ending-volume");
  const speedVal = document.querySelector("#ending-speed-val");
  const pitchVal = document.querySelector("#ending-pitch-val");
  const intonationVal = document.querySelector("#ending-intonation-val");
  const volumeVal = document.querySelector("#ending-volume-val");

  for (const [input, out] of [
    [speedInput, speedVal],
    [pitchInput, pitchVal],
    [intonationInput, intonationVal],
    [volumeInput, volumeVal],
  ]) {
    input.addEventListener("input", () => {
      out.textContent = Number(input.value).toFixed(2);
    });
  }

  function applyEnding(ending) {
    const base = pendingFinalText.replace(/[。.]$/, "");
    const text = base ? `${base}${ending.text}` : ending.text;
    dispatchText(text, {
      speedScale: ending.speedScale,
      pitchScale: ending.pitchScale,
      intonationScale: ending.intonationScale,
      volumeScale: ending.volumeScale,
    });
    pendingFinalText = "";
    finalTextEl.textContent = "";
    manualSendRow.hidden = true;
  }

  let endings = loadEndings();
  saveEndings(endings); // persist defaults on first run
  renderEndingButtons(endingButtons, endings, applyEnding);

  endingAddBtn.addEventListener("click", () => {
    const text = endingNewInput.value.trim();
    if (!text) return;
    endings.push({
      text,
      speedScale: Number(speedInput.value),
      pitchScale: Number(pitchInput.value),
      intonationScale: Number(intonationInput.value),
      volumeScale: Number(volumeInput.value),
    });
    saveEndings(endings);
    renderEndingButtons(endingButtons, endings, applyEnding);
    endingNewInput.value = "";
    for (const [input, out] of [
      [speedInput, speedVal],
      [pitchInput, pitchVal],
      [intonationInput, intonationVal],
      [volumeInput, volumeVal],
    ]) {
      input.value = DEFAULT_ENDING_PARAMS[input.id.replace("ending-", "") + "Scale"];
      out.textContent = Number(input.value).toFixed(2);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  logEl = document.querySelector("#log");
  googleBtn = document.querySelector("#google-btn");
  sttLangSelect = document.querySelector("#stt-lang");
  chatboxToggle = document.querySelector("#chatbox-toggle");
  googleStatusEl = document.querySelector("#google-status");
  sendModeSelect = document.querySelector("#send-mode");
  interimTextEl = document.querySelector("#interim-text");
  finalTextEl = document.querySelector("#final-text");
  sentTextEl = document.querySelector("#sent-text");
  manualSendRow = document.querySelector("#manual-send-row");
  manualSendBtn = document.querySelector("#manual-send-btn");
  manualClearBtn = document.querySelector("#manual-clear-btn");
  voicevoxInput = document.querySelector("#voicevox-text");
  voicevoxBtn = document.querySelector("#voicevox-btn");
  voicevoxStatusEl = document.querySelector("#voicevox-status");
  voicevoxOutputsSelect = document.querySelector("#voicevox-outputs");
  populateOutputDevices();

  setupTitlebar();
  setupSettingsDialog();
  setupEndings();

  googleBtn.addEventListener("click", () => {
    if (armed) {
      stopGoogleStt();
    } else {
      startGoogleStt();
    }
  });

  manualSendBtn.addEventListener("click", () => {
    if (!pendingFinalText) return;
    dispatchText(pendingFinalText);
    pendingFinalText = "";
    finalTextEl.textContent = "";
    manualSendRow.hidden = true;
  });

  manualClearBtn.addEventListener("click", () => {
    pendingFinalText = "";
    finalTextEl.textContent = "";
    manualSendRow.hidden = true;
  });

  voicevoxBtn.addEventListener("click", () => speak());
});

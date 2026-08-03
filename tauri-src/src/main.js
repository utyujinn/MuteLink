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
let logEl;

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
  r.lang = "ja-JP";
  r.continuous = true;
  r.interimResults = true;

  r.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const kind = result.isFinal ? "final" : "partial";
    const text = result[0].transcript;
    log(`[google:${kind}] text=${text}`);
    if (result.isFinal) speak(text);
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

async function speak(text) {
  text = (text ?? voicevoxInput.value).trim();
  if (!text) return;
  voicevoxInput.value = text;

  voicevoxStatusEl.textContent = "synthesizing...";
  try {
    const bytes = await window.__TAURI__.core.invoke("synthesize", { text });
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

window.addEventListener("DOMContentLoaded", () => {
  logEl = document.querySelector("#log");
  googleBtn = document.querySelector("#google-btn");
  googleStatusEl = document.querySelector("#google-status");
  voicevoxInput = document.querySelector("#voicevox-text");
  voicevoxBtn = document.querySelector("#voicevox-btn");
  voicevoxStatusEl = document.querySelector("#voicevox-status");
  voicevoxOutputsSelect = document.querySelector("#voicevox-outputs");
  populateOutputDevices();

  setupTitlebar();
  setupSettingsDialog();

  googleBtn.addEventListener("click", () => {
    if (armed) {
      stopGoogleStt();
    } else {
      startGoogleStt();
    }
  });

  voicevoxBtn.addEventListener("click", () => speak());
});

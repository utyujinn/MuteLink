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
let statusDotEl;
let chatboxEnabled = false;
let ttsEnabled = true;
let sendMode = "auto"; // "auto" | "manual", mirrors the old <select id="send-mode">
let interimTextEl;
let finalTextEl;
let sentTextEl;
let pendingFinalText = "";
let logEl;

// The STT language is a radio group now (image.png), not a <select>; these
// two helpers stand in for `.value`/`.disabled` on the old element.
function getSttLang() {
  return document.querySelector('input[name="stt-lang"]:checked').value;
}

function setSttLangDisabled(disabled) {
  for (const radio of document.querySelectorAll('input[name="stt-lang"]')) {
    radio.disabled = disabled;
  }
}

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
// button (手動 mode, no ending). `outputText` is what goes to the chatbox and
// the 送信済み block; `spokenText` is what VOICEVOX actually reads (the plain
// Final sentence, even when an ending was attached to the output). `params`
// carries a specific ending's VOICEVOX scales; omitted when there's no ending.
function dispatchText(outputText, spokenText, params) {
  sentTextEl.textContent = outputText;
  if (chatboxEnabled) sendChatbox(outputText);
  if (!ttsEnabled) return;
  // VOICEVOX only synthesizes Japanese (OpenJTalk fails to parse other scripts).
  if (getSttLang() === "ja-JP") {
    speak(spokenText, params);
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
  const deviceSettings = loadDeviceSettings();
  const audioConstraints =
    !deviceSettings.micAuto && deviceSettings.micDeviceId
      ? { deviceId: { exact: deviceSettings.micDeviceId } }
      : true;
  monitorStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
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
  r.lang = getSttLang();
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

    if (sendMode === "manual") {
      // A new Final can arrive before the pending one is sent — append
      // rather than overwrite so nothing said in the meantime is lost.
      pendingFinalText = pendingFinalText ? `${pendingFinalText} ${text}` : text;
      finalTextEl.textContent = pendingFinalText;
      // The content just changed, so restart any in-progress hold instead
      // of letting it fire against stale timing.
      resetHotkeyHold();
    } else {
      dispatchText(text, text);
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
  googleBtn.textContent = "停止";
  googleBtn.classList.add("listening");
  statusDotEl.classList.add("active");
  setSttLangDisabled(true);
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
  googleBtn.textContent = "開始";
  googleBtn.classList.remove("listening");
  statusDotEl.classList.remove("active");
  setSttLangDisabled(false);
}

let voicevoxInput;
let voicevoxBtn;
let voicevoxStatusEl;
let voicevoxOutputsSelect;

const DEVICE_SETTINGS_KEY = "mutelink.deviceSettings";

function loadDeviceSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(DEVICE_SETTINGS_KEY) ?? "null");
    if (raw && typeof raw === "object") return raw;
  } catch {
    // fall through to defaults
  }
  return { micAuto: true, micDeviceId: "", speakerAuto: true, speakerDeviceIds: [] };
}

function saveDeviceSettings(settings) {
  localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(settings));
}

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
  const settings = loadDeviceSettings();

  voicevoxOutputsSelect.innerHTML = "";
  for (const d of outputs) {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = d.label || d.deviceId;
    opt.selected = settings.speakerAuto
      ? d.label.includes("CABLE Input")
      : settings.speakerDeviceIds.includes(d.deviceId);
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
      styleId: getSelectedStyleId(),
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

function buildDeviceLabel(text) {
  const span = document.createElement("span");
  span.className = "device-label";
  span.textContent = text;
  return span;
}

// Mic selection feeds startVoiceMonitor()'s getUserMedia constraint directly.
// Speaker selection mirrors (and writes back to) the main screen's
// #voicevox-outputs <select multiple> so there's one source of truth.
async function setupDevicePanel() {
  const micList = document.querySelector("#mic-device-list");
  const speakerList = document.querySelector("#speaker-device-list");
  const micAutoToggle = document.querySelector("#mic-auto-toggle");
  const speakerAutoToggle = document.querySelector("#speaker-auto-toggle");

  const settings = loadDeviceSettings();
  micAutoToggle.checked = settings.micAuto;
  speakerAutoToggle.checked = settings.speakerAuto;
  micList.classList.toggle("disabled", settings.micAuto);
  speakerList.classList.toggle("disabled", settings.speakerAuto);

  micAutoToggle.addEventListener("change", () => {
    const s = loadDeviceSettings();
    s.micAuto = micAutoToggle.checked;
    saveDeviceSettings(s);
    micList.classList.toggle("disabled", s.micAuto);
  });

  speakerAutoToggle.addEventListener("change", () => {
    const s = loadDeviceSettings();
    s.speakerAuto = speakerAutoToggle.checked;
    saveDeviceSettings(s);
    speakerList.classList.toggle("disabled", s.speakerAuto);
    if (s.speakerAuto) populateOutputDevices(); // re-apply the CABLE-Input heuristic
  });

  try {
    const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
    probe.getTracks().forEach((t) => t.stop());
  } catch {
    // labels may come back blank; selection by id still works
  }
  const devices = await navigator.mediaDevices.enumerateDevices();

  micList.innerHTML = "";
  for (const d of devices.filter((d) => d.kind === "audioinput")) {
    const row = document.createElement("label");
    row.className = "device-row";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "mic-device";
    radio.value = d.deviceId;
    radio.checked = d.deviceId === settings.micDeviceId;
    radio.addEventListener("change", () => {
      const s = loadDeviceSettings();
      s.micDeviceId = d.deviceId;
      saveDeviceSettings(s);
    });
    row.append(radio, buildDeviceLabel(d.label || d.deviceId));
    micList.appendChild(row);
  }

  speakerList.innerHTML = "";
  for (const d of devices.filter((d) => d.kind === "audiooutput")) {
    const row = document.createElement("label");
    row.className = "device-row";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = d.deviceId;
    const mainOption = Array.from(voicevoxOutputsSelect.options).find((o) => o.value === d.deviceId);
    checkbox.checked = mainOption ? mainOption.selected : false;
    checkbox.addEventListener("change", () => {
      if (mainOption) mainOption.selected = checkbox.checked;
      const s = loadDeviceSettings();
      const ids = new Set(s.speakerDeviceIds);
      if (checkbox.checked) ids.add(d.deviceId);
      else ids.delete(d.deviceId);
      s.speakerDeviceIds = [...ids];
      saveDeviceSettings(s);
    });
    row.append(checkbox, buildDeviceLabel(d.label || d.deviceId));
    speakerList.appendChild(row);
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
  // Dialog has no padding of its own, so any click that lands directly on
  // the <dialog> box (rather than a child) is a click on the backdrop area.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  setupSettingsNav();
  setupGeneralPanel();
  setupCharacterPanel();
  setupAppearancePanel();
  setupDevicePanel();
}

const APPEARANCE_STORAGE_KEY = "mutelink.appearance";

function loadAppearance() {
  try {
    const raw = JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? "null");
    if (raw && typeof raw === "object") return raw;
  } catch {
    // fall through to defaults
  }
  return { uiScale: 1, fontScale: 1, fontFamily: "", theme: "system" };
}

function saveAppearance(appearance) {
  localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
}

function applyAppearance(appearance) {
  document.documentElement.style.zoom = appearance.uiScale;
  document.documentElement.style.fontSize = `${16 * appearance.fontScale}px`;
  document.documentElement.style.fontFamily = appearance.fontFamily || "";
  if (appearance.theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", appearance.theme);
  }
}

// Must match .slider-wrap's width and the thumb width in styles.css. The
// native thumb can't overflow past the track ends, so its center only
// travels trackWidth - thumbWidth, not the full width — ticks/labels are
// positioned in pixels using that same math so they land under the thumb
// instead of drifting from it at both ends. (Measuring the real layout with
// getBoundingClientRect isn't reliable here since this runs while the
// <dialog> — and everything in it — is still closed/unlaid-out.)
const SLIDER_TRACK_WIDTH = 180;
const SLIDER_THUMB_WIDTH = 16;

// Draws a tick line under every discrete step of a range input, with a
// percentage label under every `labelEvery`-th one, instead of a single
// numeric readout next to the slider.
function buildSliderTicks(input, container, labelEvery = 2) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step);
  const steps = Math.round((max - min) / step) + 1;
  const usableWidth = SLIDER_TRACK_WIDTH - SLIDER_THUMB_WIDTH;

  container.innerHTML = "";
  for (let i = 0; i < steps; i++) {
    const value = min + step * i;
    const fraction = i / (steps - 1);
    const leftPx = SLIDER_THUMB_WIDTH / 2 + fraction * usableWidth;

    const tick = document.createElement("div");
    tick.className = "slider-tick";
    tick.style.left = `${leftPx}px`;
    container.appendChild(tick);

    if (i % labelEvery === 0) {
      const label = document.createElement("div");
      label.className = "slider-tick-label";
      label.style.left = `${leftPx}px`;
      label.textContent = `${Math.round(value * 100)}%`;
      container.appendChild(label);
    }
  }
}

function setupAppearancePanel() {
  const appearance = loadAppearance();
  applyAppearance(appearance);

  const uiScaleInput = document.querySelector("#ui-scale-input");
  const fontScaleInput = document.querySelector("#font-scale-input");
  const fontFamilySelect = document.querySelector("#font-family-select");

  buildSliderTicks(uiScaleInput, document.querySelector("#ui-scale-ticks"));
  buildSliderTicks(fontScaleInput, document.querySelector("#font-scale-ticks"));

  uiScaleInput.value = appearance.uiScale;
  fontScaleInput.value = appearance.fontScale;
  fontFamilySelect.value = appearance.fontFamily;
  const themeRadio = document.querySelector(`input[name="theme"][value="${appearance.theme}"]`);
  if (themeRadio) themeRadio.checked = true;

  uiScaleInput.addEventListener("input", () => {
    appearance.uiScale = Number(uiScaleInput.value);
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  fontScaleInput.addEventListener("input", () => {
    appearance.fontScale = Number(fontScaleInput.value);
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  fontFamilySelect.addEventListener("change", () => {
    appearance.fontFamily = fontFamilySelect.value;
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  for (const radio of document.querySelectorAll('input[name="theme"]')) {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      appearance.theme = radio.value;
      applyAppearance(appearance);
      saveAppearance(appearance);
    });
  }
}

function setupSettingsNav() {
  const buttons = document.querySelectorAll(".settings-nav-btn");
  const panels = document.querySelectorAll(".settings-panel");

  function showPanel(name) {
    for (const btn of buttons) btn.classList.toggle("active", btn.dataset.panel === name);
    for (const panel of panels) panel.hidden = panel.dataset.panel !== name;
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => showPanel(btn.dataset.panel));
  }
  showPanel("general");
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

// Populated by setupEndings(); read by setupHotkeys() too, since hotkeys
// trigger the exact same "pick this favorite" action as clicking its button.
let endings = [];

// Applying a favorite appends it to whatever's pending in the Final block and
// sends immediately, using that ending's own VOICEVOX parameters. A trailing
// 。/. on the pending text is dropped first since the ending replaces it in
// the chatbox output — but VOICEVOX still reads the plain Final sentence,
// the ending is not spoken.
function applyEnding(ending) {
  const spokenText = pendingFinalText;
  const base = spokenText.replace(/[。.]$/, "");
  const outputText = base ? `${base}${ending.text}` : ending.text;
  dispatchText(outputText, spokenText, {
    speedScale: ending.speedScale,
    pitchScale: ending.pitchScale,
    intonationScale: ending.intonationScale,
    volumeScale: ending.volumeScale,
  });
  pendingFinalText = "";
  finalTextEl.textContent = "";
}

function setupEndings() {
  const endingButtons = document.querySelector("#ending-buttons");

  endings = loadEndings();
  saveEndings(endings); // persist defaults on first run
  renderEndingButtons(endingButtons, endings, applyEnding);
  renderHotkeyAssignmentOptions();
}

const ENDING_PARAM_DEFS = [
  { key: "speedScale", label: "話速", min: 0.5, max: 2, step: 0.01 },
  { key: "pitchScale", label: "音高", min: -0.15, max: 0.15, step: 0.01 },
  { key: "intonationScale", label: "抑揚", min: 0, max: 2, step: 0.01 },
  { key: "volumeScale", label: "音量", min: 0, max: 2, step: 0.01 },
];

function formatEndingSummary(ending) {
  return ENDING_PARAM_DEFS.map((def) => `${def.label}${Number(ending[def.key]).toFixed(2)}`).join(" / ");
}

// Rebuilt from the shared `endings` array whenever it changes (param edits
// here, or a new favorite added from the main screen), so the two views of
// the same data never drift apart.
function renderGeneralEndingsList() {
  const list = document.querySelector("#ending-settings-list");
  list.innerHTML = "";

  for (const ending of endings) {
    const row = document.createElement("div");
    row.className = "ending-settings-row";

    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "ending-settings-summary";

    const textSpan = document.createElement("span");
    textSpan.className = "ending-settings-text";
    textSpan.textContent = ending.text;

    const valuesSpan = document.createElement("span");
    valuesSpan.className = "ending-settings-values";
    valuesSpan.textContent = formatEndingSummary(ending);

    const chevron = document.createElement("span");
    chevron.className = "ending-settings-chevron";
    chevron.textContent = "▾";

    summary.append(textSpan, valuesSpan, chevron);

    const detail = document.createElement("div");
    detail.className = "ending-settings-detail";
    detail.hidden = true;

    for (const def of ENDING_PARAM_DEFS) {
      const paramRow = document.createElement("div");
      paramRow.className = "ending-param-row";

      const label = document.createElement("span");
      label.className = "ending-param-label";
      label.textContent = def.label;

      const input = document.createElement("input");
      input.type = "range";
      input.min = def.min;
      input.max = def.max;
      input.step = def.step;
      input.value = ending[def.key];

      const val = document.createElement("input");
      val.type = "number";
      val.className = "ending-param-val";
      val.min = def.min;
      val.max = def.max;
      val.step = def.step;
      val.value = Number(ending[def.key]).toFixed(2);

      input.addEventListener("input", () => {
        ending[def.key] = Number(input.value);
        val.value = ending[def.key].toFixed(2);
        valuesSpan.textContent = formatEndingSummary(ending);
        saveEndings(endings);
      });

      val.addEventListener("change", () => {
        let v = Number(val.value);
        if (Number.isNaN(v)) v = ending[def.key];
        v = Math.min(def.max, Math.max(def.min, v));
        ending[def.key] = v;
        val.value = v.toFixed(2);
        input.value = v;
        valuesSpan.textContent = formatEndingSummary(ending);
        saveEndings(endings);
      });

      paramRow.append(label, input, val);
      detail.appendChild(paramRow);
    }

    summary.addEventListener("click", () => {
      const willOpen = detail.hidden;
      detail.hidden = !willOpen;
      row.classList.toggle("open", willOpen);
    });

    row.append(summary, detail);
    list.appendChild(row);
  }
}

// In-app replacement for window.confirm(), styled to match the settings
// dialog (native browser confirm() looks out of place next to it).
function showConfirmDialog(message) {
  const dialog = document.querySelector("#confirm-dialog");
  const okBtn = document.querySelector("#confirm-dialog-ok");
  const cancelBtn = document.querySelector("#confirm-dialog-cancel");
  document.querySelector("#confirm-dialog-message").textContent = message;

  return new Promise((resolve) => {
    const finish = (result) => {
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      dialog.removeEventListener("click", onBackdrop);
      dialog.removeEventListener("cancel", onCancelEvent);
      dialog.close();
      resolve(result);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onCancelEvent = (event) => {
      event.preventDefault();
      finish(false);
    };
    const onBackdrop = (event) => {
      if (event.target === dialog) finish(false);
    };

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancelEvent);
    dialog.addEventListener("click", onBackdrop);
    dialog.showModal();
  });
}

const SELECTED_STYLE_KEY = "mutelink.selectedStyleId";
const DEFAULT_STYLE_ID = 46; // 小夜/SAYO ノーマル, the character bundled with the app

function loadSelectedStyleId() {
  const raw = localStorage.getItem(SELECTED_STYLE_KEY);
  const id = raw !== null ? Number(raw) : DEFAULT_STYLE_ID;
  return Number.isFinite(id) ? id : DEFAULT_STYLE_ID;
}

function saveSelectedStyleId(id) {
  localStorage.setItem(SELECTED_STYLE_KEY, String(id));
}

// Read by speak() on every synthesis call, so switching the character in
// General settings takes effect immediately without needing a restart.
function getSelectedStyleId() {
  return loadSelectedStyleId();
}

function findStyleLabel(catalog, styleId) {
  for (const entry of catalog) {
    for (const character of entry.characters) {
      const style = character.styles.find((s) => s.id === styleId);
      if (style) return `${character.name}(${style.name})`;
    }
  }
  return null;
}

// Characters are downloaded per-VVM-file on demand (some VVMs bundle more
// than one character) via the Rust-side download_character/load_character
// commands, which shell out to the same download.exe used for the initial
// SAYO model. The catalog itself is parsed server-side from the VVM/style
// table VOICEVOX ships in models/README.txt, so it stays in sync with
// whatever's actually downloadable without us hand-maintaining a list here.
async function setupCharacterPanel() {
  const listEl = document.querySelector("#character-catalog-list");
  const labelEl = document.querySelector("#current-character-label");

  let catalog;
  try {
    catalog = await window.__TAURI__.core.invoke("character_catalog");
  } catch (err) {
    listEl.textContent = `読み込みに失敗しました: ${err}`;
    return;
  }

  function updateLabel() {
    const label = findStyleLabel(catalog, loadSelectedStyleId());
    labelEl.textContent = label ? `現在の音声: ${label}` : "現在の音声: 未設定";
  }

  // One VVM file can bundle several characters (they're downloaded and
  // loaded together, there's no way to fetch just one), but the list is
  // still one row per *character* — each gets its own add button, and
  // adding any of them refreshes every row that shares the same VVM.
  const refreshersByEntry = new Map();

  listEl.innerHTML = "";
  for (const entry of catalog) {
    refreshersByEntry.set(entry, []);

    for (const character of entry.characters) {
      const row = document.createElement("div");
      row.className = "ending-settings-row";

      const summary = document.createElement("button");
      summary.type = "button";
      summary.className = "ending-settings-summary";

      const textSpan = document.createElement("span");
      textSpan.className = "ending-settings-text";
      textSpan.textContent = character.name;

      const valuesSpan = document.createElement("span");
      valuesSpan.className = "ending-settings-values";

      const chevron = document.createElement("span");
      chevron.className = "ending-settings-chevron";
      chevron.textContent = "▾";

      summary.append(textSpan, valuesSpan, chevron);

      const detail = document.createElement("div");
      detail.className = "ending-settings-detail";
      detail.hidden = true;

      function renderDetail() {
        valuesSpan.textContent = entry.downloaded ? "追加済み" : "未追加";
        detail.innerHTML = "";

        if (entry.downloaded) {
          const styleList = document.createElement("div");
          styleList.className = "character-style-list";
          for (const style of character.styles) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "character-style-btn";
            btn.textContent = style.name;
            btn.classList.toggle("active", style.id === loadSelectedStyleId());
            btn.addEventListener("click", () => {
              saveSelectedStyleId(style.id);
              updateLabel();
              for (const b of styleList.querySelectorAll(".character-style-btn")) b.classList.remove("active");
              btn.classList.add("active");
            });
            styleList.appendChild(btn);
          }
          detail.appendChild(styleList);
        } else {
          const addRow = document.createElement("div");
          addRow.className = "character-add-row";

          const hint = document.createElement("span");
          hint.className = "character-add-hint";
          const siblings = entry.characters.filter((c) => c !== character).map((c) => c.name);
          hint.textContent =
            siblings.length > 0
              ? `追加すると同じ音声データに含まれる次のキャラも一緒に追加されます: ${siblings.join("、")}`
              : "このキャラクターはまだ追加されていません。";

          const addBtn = document.createElement("button");
          addBtn.type = "button";
          addBtn.textContent = "追加";
          addBtn.addEventListener("click", async () => {
            addBtn.disabled = true;
            addBtn.textContent = "ダウンロード中...";
            try {
              await window.__TAURI__.core.invoke("download_character", { vvmFile: entry.vvmFile });
              await window.__TAURI__.core.invoke("load_character", { vvmFile: entry.vvmFile });
              entry.downloaded = true;
              for (const refresh of refreshersByEntry.get(entry)) refresh();
            } catch (err) {
              addBtn.disabled = false;
              addBtn.textContent = "追加";
              log(`[character] download failed: ${err}`);
            }
          });

          addRow.append(hint, addBtn);
          detail.appendChild(addRow);
        }
      }

      renderDetail();
      refreshersByEntry.get(entry).push(renderDetail);

      summary.addEventListener("click", () => {
        const willOpen = detail.hidden;
        detail.hidden = !willOpen;
        row.classList.toggle("open", willOpen);
      });

      row.append(summary, detail);
      listEl.appendChild(row);
    }
  }

  updateLabel();
}

function setupGeneralPanel() {
  renderGeneralEndingsList();

  document.querySelector("#settings-reset-btn").addEventListener("click", async () => {
    const ok = await showConfirmDialog("設定を全てリセットします。よろしいですか？");
    if (!ok) return;
    localStorage.removeItem(ENDINGS_STORAGE_KEY);
    localStorage.removeItem(HOTKEY_ASSIGNMENTS_KEY);
    localStorage.removeItem(APPEARANCE_STORAGE_KEY);
    localStorage.removeItem(DEVICE_SETTINGS_KEY);
    location.reload();
  });
}

const HOTKEY_POLL_MS = 50;
const HOTKEY_ASSIGNMENTS_KEY = "mutelink.hotkeyAssignments";
const HOTKEY_SLOTS = ["both", "grip", "trigger", "none", "stick"];
// Sentinel assignment value meaning "discard the pending text", alongside
// the ending texts a slot can otherwise be assigned to.
const HOTKEY_CANCEL_ACTION = "__cancel__";

const HOTKEY_HOLD_DURATION_KEY = "mutelink.hotkeyHoldMs";
const DEFAULT_HOTKEY_HOLD_MS = 1000;

function loadHotkeyHoldMs() {
  const raw = Number(localStorage.getItem(HOTKEY_HOLD_DURATION_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_HOTKEY_HOLD_MS;
}

function saveHotkeyHoldMs(ms) {
  localStorage.setItem(HOTKEY_HOLD_DURATION_KEY, String(ms));
}

// Both hands act independently now (each can be bound to a different
// ending), but only one hand's hold can be shown on the overlay at once —
// this picks which one wins when both happen to be mid-hold simultaneously.
const HOTKEY_PRIORITY_HAND_KEY = "mutelink.hotkeyPriorityHand";

function loadHotkeyPriorityHand() {
  return localStorage.getItem(HOTKEY_PRIORITY_HAND_KEY) === "left" ? "left" : "right";
}

function saveHotkeyPriorityHand(hand) {
  localStorage.setItem(HOTKEY_PRIORITY_HAND_KEY, hand);
}

const HOTKEY_HANDS = ["right", "left"];

// Assignments are stored by ending text (not index) so they survive the
// favorites list being reordered or extended, and separately per hand so
// each hand can be bound to different endings. `stick` defaults to cancel
// on both hands (a deliberate press-in is a good "never mind" gesture); the
// other four default to the first four favorites so there's something to
// try out-of-the-box instead of every slot doing nothing until configured.
function defaultHotkeyHandAssignments() {
  return {
    both: DEFAULT_ENDINGS[0].text,
    grip: DEFAULT_ENDINGS[1].text,
    trigger: DEFAULT_ENDINGS[2].text,
    none: DEFAULT_ENDINGS[3].text,
    stick: HOTKEY_CANCEL_ACTION,
  };
}

function loadHotkeyAssignments() {
  const defaults = { right: defaultHotkeyHandAssignments(), left: defaultHotkeyHandAssignments() };
  try {
    const raw = JSON.parse(localStorage.getItem(HOTKEY_ASSIGNMENTS_KEY) ?? "null");
    if (raw && typeof raw === "object") {
      return {
        right: { ...defaults.right, ...raw.right },
        left: { ...defaults.left, ...raw.left },
      };
    }
  } catch {
    // fall through
  }
  return defaults;
}

function saveHotkeyAssignments(assignments) {
  localStorage.setItem(HOTKEY_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

function renderHotkeyAssignmentOptions() {
  const assignments = loadHotkeyAssignments();
  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      const select = document.querySelector(`#hotkey-${hand}-${slot}`);
      select.innerHTML = '<option value="">(未設定)</option><option value="__cancel__">送信取り消し</option>';
      for (const ending of endings) {
        const opt = document.createElement("option");
        opt.value = ending.text;
        opt.textContent = ending.text;
        select.appendChild(opt);
      }
      // Falls back to "(未設定)" automatically if the saved value no longer
      // matches any option (e.g. the assigned ending was since deleted).
      select.value = assignments[hand][slot];
    }
  }
}

// Which of the four grip/trigger-combo slots a hand is currently making.
// Excludes "stick" — that fires on press instead of after a hold (see
// setupHotkeys()), since a quick click is often shorter than the
// hold-debounce window below and was going unnoticed.
function gestureFor(hand) {
  if (hand.grip && hand.trigger) return "both";
  if (hand.grip) return "grip";
  if (hand.trigger) return "trigger";
  return "none";
}

function newHotkeyHoldState() {
  return {
    candidateSlot: null, // most recent raw gesture reading, not yet committed
    candidateSince: 0,
    activeSlot: null, // one of both/grip/trigger/none, once debounced
    activeSince: 0,
    activeAssignment: "", // assignments[hand][activeSlot], cached when it last changed
    firedForThisHold: false,
    stickWasPressed: false,
  };
}

// Hoisted to module scope (rather than local to setupHotkeys()) so that
// createRecognition()'s onresult handler can reset the hold timers whenever
// pendingFinalText changes — a fresh/appended Final means whatever hold was
// in progress should restart from 0 rather than firing based on stale
// timing. Each hand tracks its own independent state since they can now be
// bound to different actions.
let rightHotkeyHold = newHotkeyHoldState();
let leftHotkeyHold = newHotkeyHoldState();

// Called whenever the pending text changes (new Final, or one appended to
// an existing pending Final) so an in-progress hold restarts against the
// new content instead of firing on stale timing. Leaves stick-press edge
// tracking alone — that's about physical button transitions, not content.
function resetHotkeyHold() {
  rightHotkeyHold.activeSlot = null;
  rightHotkeyHold.candidateSlot = null;
  leftHotkeyHold.activeSlot = null;
  leftHotkeyHold.candidateSlot = null;
}

function fireHotkeyAssignment(assignment) {
  if (assignment === HOTKEY_CANCEL_ACTION) {
    pendingFinalText = "";
    finalTextEl.textContent = "";
  } else if (assignment) {
    const ending = endings.find((e) => e.text === assignment);
    if (ending) applyEnding(ending);
  }
}

const HOTKEY_DEBOUNCE_MS = 100; // absorb single-poll blips in the raw grip/trigger state

// Advances one hand's independent hold state machine by one tick: edge-fires
// the stick, then debounces/holds the grip+trigger gesture against that
// hand's own assignment table. Both hands run this every tick, so each can
// fire its own action independently of what the other hand is doing.
function processHandHotkey(hold, hand, handAssignments, now) {
  if (hand.stick && !hold.stickWasPressed) {
    fireHotkeyAssignment(handAssignments.stick);
  }
  hold.stickWasPressed = hand.stick;
  if (!pendingFinalText) return; // the stick fire above may have just cleared it

  const rawSlot = gestureFor(hand);
  if (rawSlot !== hold.candidateSlot) {
    hold.candidateSlot = rawSlot;
    hold.candidateSince = now;
  }
  const slot = now - hold.candidateSince >= HOTKEY_DEBOUNCE_MS ? hold.candidateSlot : hold.activeSlot;

  if (slot !== hold.activeSlot) {
    hold.activeSlot = slot;
    hold.activeSince = now;
    hold.firedForThisHold = false;
    hold.activeAssignment = handAssignments[slot] || "";
  }

  if (!hold.firedForThisHold && now - hold.activeSince >= hotkeyHoldMsCache) {
    hold.firedForThisHold = true;
    fireHotkeyAssignment(hold.activeAssignment);
    hold.activeSlot = null;
    hold.candidateSlot = null;
  }
}

// Set by setupHotkeys() and updated live from its slider/radios; read by
// processHandHotkey() above and the render loop below, both of which run
// outside setupHotkeys()'s own closure timing-wise but are defined inside
// it — module-level so the value assigned there is visible to itself.
let hotkeyHoldMsCache = DEFAULT_HOTKEY_HOLD_MS;
let hotkeyPriorityHandCache = "right";

function setupHotkeys() {
  const statusEl = document.querySelector("#hotkey-status");
  const reconnectBtn = document.querySelector("#hotkey-reconnect-btn");
  const holdInput = document.querySelector("#hotkey-hold-duration-input");
  const holdVal = document.querySelector("#hotkey-hold-duration-val");

  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      const select = document.querySelector(`#hotkey-${hand}-${slot}`);
      select.addEventListener("change", () => {
        const assignments = loadHotkeyAssignments();
        assignments[hand][slot] = select.value;
        saveHotkeyAssignments(assignments);
      });
    }
  }

  hotkeyHoldMsCache = loadHotkeyHoldMs();
  holdInput.value = hotkeyHoldMsCache / 1000;
  holdVal.textContent = `${(hotkeyHoldMsCache / 1000).toFixed(1)}秒`;
  holdInput.addEventListener("input", () => {
    hotkeyHoldMsCache = Math.round(Number(holdInput.value) * 1000);
    holdVal.textContent = `${Number(holdInput.value).toFixed(1)}秒`;
    saveHotkeyHoldMs(hotkeyHoldMsCache);
  });

  hotkeyPriorityHandCache = loadHotkeyPriorityHand();
  for (const radio of document.querySelectorAll('input[name="hotkey-priority-hand"]')) {
    radio.checked = radio.value === hotkeyPriorityHandCache;
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      hotkeyPriorityHandCache = radio.value;
      saveHotkeyPriorityHand(hotkeyPriorityHandCache);
    });
  }

  reconnectBtn.addEventListener("click", async () => {
    statusEl.textContent = "VR: 接続試行中...";
    const ok = await window.__TAURI__.core.invoke("reconnect_vr");
    statusEl.textContent = ok ? "VR: 接続済み" : "VR: 未接続";
  });

  let overlayShown = false; // avoids spamming hide calls every frame while idle
  let langTagShown = false; // same, for the separate language-tag overlay
  let tickInFlight = false; // setInterval doesn't wait for the previous async tick's IPC round-trip
  let vrAvailable = false; // updated by the poll below, read by the render loop
  let leftAWasPressed = false; // left controller's lower face button (X on Quest) — toggles STT start/stop

  setInterval(async () => {
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      let hotkeyState;
      try {
        hotkeyState = await window.__TAURI__.core.invoke("hotkey_state");
      } catch {
        return;
      }

      if (!hotkeyState.available) {
        statusEl.textContent = "VR: 未接続";
        vrAvailable = false;
        return;
      }
      statusEl.textContent = "VR: 接続済み";
      vrAvailable = true;

      // Left controller's lower face button (X on Quest) toggles
      // recognition start/stop, independent of whether a Final is pending —
      // unless VRChat mute sync is on, in which case VRC's own mic mute
      // state is the only thing allowed to start/stop recognition, so this
      // is disabled entirely to avoid the two fighting each other.
      if (hotkeyState.left.a && !leftAWasPressed && !loadVrcMuteSync()) {
        if (armed) stopGoogleStt();
        else startGoogleStt();
      }
      leftAWasPressed = hotkeyState.left.a;

      if (!pendingFinalText) {
        resetHotkeyHold();
        rightHotkeyHold.stickWasPressed = hotkeyState.right.stick;
        leftHotkeyHold.stickWasPressed = hotkeyState.left.stick;
        return;
      }

      const assignments = loadHotkeyAssignments();
      const now = Date.now();
      processHandHotkey(rightHotkeyHold, hotkeyState.right, assignments.right, now);
      // The right hand's processing above may have just fired (sent an
      // ending or discarded), clearing pendingFinalText — don't let the
      // left hand act on now-stale text in the same tick.
      if (pendingFinalText) processHandHotkey(leftHotkeyHold, hotkeyState.left, assignments.left, now);
    } finally {
      tickInFlight = false;
    }
  }, HOTKEY_POLL_MS);

  // Renders on its own fast timer instead of the much coarser hotkey-poll
  // cadence above, so the progress bar advances smoothly instead of visibly
  // stepping every 50ms. Only interpolates elapsed time against whatever
  // the poll loop above last computed for each hand — it never re-reads the
  // controller itself, so it stays cheap even at a high rate. Uses
  // setInterval rather than requestAnimationFrame because rAF is capped to
  // the desktop monitor's refresh rate (commonly 60Hz), which is slower
  // than the VR headset's — the HUD is seen in the headset, not on the
  // desktop window, so there's no reason to cap there.
  const OVERLAY_RENDER_MS = 8; // ~125Hz
  let renderInFlight = false;

  setInterval(() => {
    if (renderInFlight) return;
    renderInFlight = true;

    const now = Date.now();

    let boxPromise = null;
    if (vrAvailable && pendingFinalText) {
      overlayShown = true;
      // Both hands can be mid-hold at once with different actions; only one
      // can be shown, so the priority hand wins when both have something
      // assigned to their current gesture, falling back to whichever one
      // does if only one does. Green = this hold will send an ending (with
      // a preview of that ending shown below the main text), red = it'll
      // discard, no bar at all if neither hand's current gesture is
      // assigned to anything.
      const priorityHold = hotkeyPriorityHandCache === "left" ? leftHotkeyHold : rightHotkeyHold;
      const otherHold = hotkeyPriorityHandCache === "left" ? rightHotkeyHold : leftHotkeyHold;
      const display = priorityHold.activeAssignment ? priorityHold : otherHold.activeAssignment ? otherHold : null;
      let progress = null;
      let endingPreview = null;
      if (display && display.activeAssignment === HOTKEY_CANCEL_ACTION) {
        progress = { isSend: false, fraction: (now - display.activeSince) / hotkeyHoldMsCache };
      } else if (display) {
        progress = { isSend: true, fraction: (now - display.activeSince) / hotkeyHoldMsCache };
        endingPreview = display.activeAssignment;
      }
      boxPromise = window.__TAURI__.core.invoke("update_overlay", {
        text: pendingFinalText,
        endingPreview,
        progress,
      });
    } else if (overlayShown) {
      overlayShown = false;
      boxPromise = window.__TAURI__.core.invoke("update_overlay", {
        text: "",
        endingPreview: null,
        progress: null,
      });
    }

    // The language tag is a separate overlay positioned relative to the
    // box's own (unchanged) geometry — it flashes on its own schedule and
    // doesn't need the confirm/discard box to be showing.
    let tagPromise = null;
    const langTagActive = vrAvailable && now < langTagUntil;
    if (langTagActive) {
      langTagShown = true;
      tagPromise = window.__TAURI__.core.invoke("update_lang_tag", {
        label: langTagLabel,
        elapsedSecs: (now - langTagShownAt) / 1000,
      });
    } else if (langTagShown) {
      langTagShown = false;
      tagPromise = window.__TAURI__.core.invoke("update_lang_tag", { label: null, elapsedSecs: 0 });
    }

    if (!boxPromise && !tagPromise) {
      renderInFlight = false;
      return;
    }
    Promise.all([boxPromise, tagPromise].filter(Boolean))
      .catch((err) => log(`[overlay] ${err}`))
      .finally(() => {
        renderInFlight = false;
      });
  }, OVERLAY_RENDER_MS);
}

const VRC_MUTE_SYNC_KEY = "mutelink.vrcMuteSync";

function loadVrcMuteSync() {
  return localStorage.getItem(VRC_MUTE_SYNC_KEY) === "true";
}

function saveVrcMuteSync(enabled) {
  localStorage.setItem(VRC_MUTE_SYNC_KEY, String(enabled));
}

// While mute sync is on, VRChat's own mic mute state should be the only
// thing that starts/stops recognition — both the left controller's X button
// (see setupHotkeys()) and this on-screen button are locked out so they
// can't fight with it.
function applyVrcMuteSyncLock(enabled) {
  googleBtn.disabled = enabled;
  googleBtn.title = enabled ? "VRChatのマイク連動が有効なため無効化されています" : "";
}

// A quick mute→unmute (VRChat's own mic button, under this threshold) cycles
// the recognition language instead of just restarting recognition — a
// deliberate double-tap-style gesture, easy to do without touching the
// desktop window. A slower mute→unmute is treated as a normal toggle and
// leaves the language exactly as it was.
const VRC_MUTE_SYNC_CYCLE_THRESHOLD_MS = 2000;
const STT_LANG_ORDER = ["ja-JP", "en-US", "zh-CN"];
const VRC_MUTE_SYNC_LANGS_KEY = "mutelink.vrcMuteSyncLangs";

function loadVrcMuteSyncLangs() {
  try {
    const raw = JSON.parse(localStorage.getItem(VRC_MUTE_SYNC_LANGS_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length > 0) return raw.filter((lang) => STT_LANG_ORDER.includes(lang));
  } catch {
    // fall through
  }
  return [...STT_LANG_ORDER]; // default: cycle through all three
}

function saveVrcMuteSyncLangs(langs) {
  localStorage.setItem(VRC_MUTE_SYNC_LANGS_KEY, JSON.stringify(langs));
}

function setSttLang(lang) {
  const radio = document.querySelector(`input[name="stt-lang"][value="${lang}"]`);
  if (radio) radio.checked = true;
}

// Hoisted to module scope: set here, read by setupHotkeys()'s overlay
// render loop, which is defined in a different function but needs to know
// whether a language switch just happened to flash the "EN"/"JP"/"CN" tag
// in VR — even if there's no pending Final (and so no confirm/discard box)
// at the moment the switch occurs.
let langTagLabel = null;
let langTagShownAt = 0;
let langTagUntil = 0;
// Matches overlay.rs's render_lang_tag animation: pop-in/settle finishes by
// 0.3s, holds fully opaque until 2.5s, then fades out linearly through 3.5s.
const LANG_TAG_DISPLAY_MS = 3500;
const STT_LANG_TAG_LABELS = { "ja-JP": "JP", "en-US": "EN", "zh-CN": "CN" };

function flashLangTag(lang) {
  langTagLabel = STT_LANG_TAG_LABELS[lang] ?? null;
  langTagShownAt = Date.now();
  langTagUntil = langTagShownAt + LANG_TAG_DISPLAY_MS;
}

// Advances to the next language after the currently-selected one, among
// only the languages enabled in settings, wrapping back to the first. Falls
// back to the first enabled language if the current one isn't in the
// enabled set (e.g. it was unchecked in settings since it was picked).
function cycleSttLang() {
  const enabledOrder = STT_LANG_ORDER.filter((lang) => loadVrcMuteSyncLangs().includes(lang));
  if (enabledOrder.length === 0) return;
  const currentIndex = enabledOrder.indexOf(getSttLang());
  const next = enabledOrder[(currentIndex + 1) % enabledOrder.length];
  setSttLang(next);
  flashLangTag(next);
}

// The Rust side listens for VRChat's own OSC output (127.0.0.1:9001,
// separate from the port we send chatbox text to) and forwards
// /avatar/parameters/MuteSelf — a built-in parameter VRChat always sends,
// not something specific to any one avatar — as this event, regardless of
// whether the toggle below is on. Only react to it here so flipping the
// toggle doesn't need to restart any listener.
function setupVrcMuteSync() {
  const toggle = document.querySelector("#vrc-mute-sync-toggle");
  toggle.checked = loadVrcMuteSync();
  applyVrcMuteSyncLock(toggle.checked);
  // Rust doesn't bind VRChat's OSC output port (9001) at all unless this is
  // on — sync the listener's running state to whatever was last saved, and
  // again on every change, instead of it always running in the background.
  window.__TAURI__.core.invoke("set_vrc_mute_sync", { enabled: toggle.checked });
  toggle.addEventListener("change", () => {
    saveVrcMuteSync(toggle.checked);
    applyVrcMuteSyncLock(toggle.checked);
    window.__TAURI__.core.invoke("set_vrc_mute_sync", { enabled: toggle.checked });
  });

  const enabledLangs = loadVrcMuteSyncLangs();
  for (const checkbox of document.querySelectorAll('input[name="vrc-mute-sync-lang"]')) {
    checkbox.checked = enabledLangs.includes(checkbox.value);
    checkbox.addEventListener("change", () => {
      const langs = [...document.querySelectorAll('input[name="vrc-mute-sync-lang"]:checked')].map((c) => c.value);
      saveVrcMuteSyncLangs(langs);
    });
  }

  let lastMuteAt = 0;

  window.__TAURI__.event.listen("vrc-mute-changed", (event) => {
    if (!loadVrcMuteSync()) return;
    const muted = event.payload;
    const now = Date.now();

    if (muted) {
      lastMuteAt = now;
      if (armed) stopGoogleStt();
      return;
    }

    if (lastMuteAt && now - lastMuteAt < VRC_MUTE_SYNC_CYCLE_THRESHOLD_MS) {
      cycleSttLang();
    } else if (loadVrcMuteSyncLangs().length > 1) {
      // Nothing changed this time, but with more than one language enabled
      // for rotation, showing which one is currently active on every unmute
      // (not just when a cycle just switched it) avoids having to guess.
      flashLangTag(getSttLang());
    }
    if (!armed) startGoogleStt();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  logEl = document.querySelector("#log");
  googleBtn = document.querySelector("#google-btn");
  statusDotEl = document.querySelector("#status-dot");
  googleStatusEl = document.querySelector("#google-status");
  interimTextEl = document.querySelector("#interim-text");
  finalTextEl = document.querySelector("#final-text");
  sentTextEl = document.querySelector("#sent-text");
  voicevoxInput = document.querySelector("#voicevox-text");
  voicevoxBtn = document.querySelector("#voicevox-btn");
  voicevoxStatusEl = document.querySelector("#voicevox-status");
  voicevoxOutputsSelect = document.querySelector("#voicevox-outputs");
  // setupDevicePanel() below mirrors this select's option state, so it must
  // finish populating first.
  await populateOutputDevices();

  setupTitlebar();
  setupEndings();
  setupSettingsDialog();
  setupHotkeys();
  setupVrcMuteSync();

  googleBtn.addEventListener("click", () => {
    if (armed) {
      stopGoogleStt();
    } else {
      startGoogleStt();
    }
  });

  document.querySelector("#final-clear-btn").addEventListener("click", () => {
    pendingFinalText = "";
    finalTextEl.textContent = "";
  });

  document.querySelector("#sent-clear-btn").addEventListener("click", () => {
    sentTextEl.textContent = "";
  });

  voicevoxBtn.addEventListener("click", () => speak());

  const modeToggleBtn = document.querySelector("#mode-toggle-btn");
  modeToggleBtn.addEventListener("click", () => {
    sendMode = sendMode === "auto" ? "manual" : "auto";
    modeToggleBtn.classList.toggle("active", sendMode === "auto");
    modeToggleBtn.setAttribute("aria-pressed", String(sendMode === "auto"));
  });

  const chatboxToggleBtn = document.querySelector("#chatbox-toggle-btn");
  chatboxToggleBtn.addEventListener("click", () => {
    chatboxEnabled = !chatboxEnabled;
    chatboxToggleBtn.classList.toggle("active", chatboxEnabled);
    chatboxToggleBtn.setAttribute("aria-pressed", String(chatboxEnabled));
  });

  const ttsToggleBtn = document.querySelector("#tts-toggle-btn");
  ttsToggleBtn.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;
    ttsToggleBtn.classList.toggle("active", ttsEnabled);
    ttsToggleBtn.setAttribute("aria-pressed", String(ttsEnabled));
  });
});

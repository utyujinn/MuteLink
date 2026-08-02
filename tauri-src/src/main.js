const SAMPLE_RATE = 16000;

let audioCtx;
let mediaStream;
let sourceNode;
let processorNode;
let ws;
let running = false;

let urlInput;
let toggleBtn;
let statusEl;
let logEl;

function log(line) {
  const p = document.createElement("p");
  p.textContent = line;
  logEl.prepend(p);
}

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

async function start() {
  statusEl.textContent = "connecting...";
  ws = new WebSocket(urlInput.value);
  ws.binaryType = "arraybuffer";

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    log(`[${data.type}] text=${data.text ?? ""} emotion=${data.emotion ?? "-"} lang=${data.language ?? "-"} event=${data.event ?? "-"}`);
  };
  ws.onerror = () => {
    statusEl.textContent = "error";
  };
  ws.onclose = () => {
    statusEl.textContent = "closed";
  };

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
  sourceNode = audioCtx.createMediaStreamSource(mediaStream);
  processorNode = audioCtx.createScriptProcessor(4096, 1, 1);

  processorNode.onaudioprocess = (event) => {
    if (!running || ws.readyState !== WebSocket.OPEN) return;
    const pcm16 = floatTo16BitPCM(event.inputBuffer.getChannelData(0));
    ws.send(pcm16.buffer);
  };

  sourceNode.connect(processorNode);
  processorNode.connect(audioCtx.destination);

  running = true;
  statusEl.textContent = "recording";
  toggleBtn.textContent = "Stop";
}

async function stop() {
  running = false;
  statusEl.textContent = "stopping...";

  if (processorNode) processorNode.disconnect();
  if (sourceNode) sourceNode.disconnect();
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
  if (audioCtx) await audioCtx.close();

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "end" }));
    ws.close();
  }

  toggleBtn.textContent = "Start";
  statusEl.textContent = "idle";
}

window.addEventListener("DOMContentLoaded", () => {
  urlInput = document.querySelector("#ws-url");
  toggleBtn = document.querySelector("#toggle-btn");
  statusEl = document.querySelector("#status");
  logEl = document.querySelector("#log");

  toggleBtn.addEventListener("click", () => {
    if (running) {
      stop();
    } else {
      start().catch((err) => {
        statusEl.textContent = `error: ${err.message}`;
      });
    }
  });
});

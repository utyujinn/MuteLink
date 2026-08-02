import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from asr import FunASRNanoEngine, VadEngine, SAMPLE_RATE

app = FastAPI()

BYTES_PER_SAMPLE = 2
BYTES_PER_MS = SAMPLE_RATE * BYTES_PER_SAMPLE // 1000

_asr_engine: FunASRNanoEngine | None = None
_vad_engine: VadEngine | None = None


def get_asr_engine() -> FunASRNanoEngine:
    global _asr_engine
    if _asr_engine is None:
        _asr_engine = FunASRNanoEngine()
    return _asr_engine


def get_vad_engine() -> VadEngine:
    global _vad_engine
    if _vad_engine is None:
        _vad_engine = VadEngine()
    return _vad_engine


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.websocket("/ws/transcribe")
async def ws_transcribe(ws: WebSocket):
    await ws.accept()
    asr_engine = get_asr_engine()
    vad_engine = get_vad_engine()

    buffer = bytearray()
    buffer_start_ms = 0
    segment_start_ms: int | None = None
    vad_cache = vad_engine.new_cache()

    async def transcribe_and_send(pcm16_bytes: bytes):
        if not pcm16_bytes:
            return
        result = await asyncio.to_thread(asr_engine.transcribe, pcm16_bytes)
        await ws.send_json({"type": "final", **result})

    async def handle_segments(segments: list[list[int]]):
        nonlocal buffer, buffer_start_ms, segment_start_ms
        for start_ms, end_ms in segments:
            if start_ms != -1:
                segment_start_ms = start_ms
            if end_ms != -1:
                seg_from = segment_start_ms if segment_start_ms is not None else buffer_start_ms
                start_byte = max(int((seg_from - buffer_start_ms) * BYTES_PER_MS), 0)
                end_byte = max(int((end_ms - buffer_start_ms) * BYTES_PER_MS), start_byte)
                await transcribe_and_send(bytes(buffer[start_byte:end_byte]))
                buffer = buffer[end_byte:]
                buffer_start_ms = end_ms
                segment_start_ms = None

    try:
        while True:
            message = await ws.receive()
            if message["type"] == "websocket.disconnect":
                break

            data = message.get("bytes")
            if data is not None:
                buffer += data
                segments = await asyncio.to_thread(vad_engine.detect, data, vad_cache, False)
                await handle_segments(segments)
                continue

            text = message.get("text")
            if text is None:
                continue
            try:
                control = json.loads(text)
            except ValueError:
                continue
            if control.get("type") == "end":
                segments = await asyncio.to_thread(vad_engine.detect, b"", vad_cache, True)
                await handle_segments(segments)
                if buffer:
                    await transcribe_and_send(bytes(buffer))
                buffer = bytearray()
                buffer_start_ms = 0
                segment_start_ms = None
                vad_cache = vad_engine.new_cache()
    except WebSocketDisconnect:
        pass

import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from asr import SenseVoiceEngine, SAMPLE_RATE

app = FastAPI()

BYTES_PER_SAMPLE = 2
EMIT_INTERVAL_MS = 1000
EMIT_INTERVAL_BYTES = int(SAMPLE_RATE * BYTES_PER_SAMPLE * EMIT_INTERVAL_MS / 1000)

_engine: SenseVoiceEngine | None = None


def get_engine() -> SenseVoiceEngine:
    global _engine
    if _engine is None:
        _engine = SenseVoiceEngine()
    return _engine


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.websocket("/ws/transcribe")
async def ws_transcribe(ws: WebSocket):
    await ws.accept()
    engine = get_engine()
    buffer = bytearray()
    emitted_len = 0

    async def run(kind: str):
        nonlocal emitted_len
        result = await asyncio.to_thread(engine.transcribe, bytes(buffer))
        await ws.send_json({"type": kind, **result})
        emitted_len = len(buffer)

    try:
        while True:
            message = await ws.receive()
            if message["type"] == "websocket.disconnect":
                break

            data = message.get("bytes")
            if data is not None:
                buffer += data
                if len(buffer) - emitted_len >= EMIT_INTERVAL_BYTES:
                    await run("partial")
                continue

            text = message.get("text")
            if text is None:
                continue
            try:
                control = json.loads(text)
            except ValueError:
                continue
            if control.get("type") == "end":
                if buffer:
                    await run("final")
                buffer = bytearray()
                emitted_len = 0
    except WebSocketDisconnect:
        pass

import re

import numpy as np
import torch
from funasr import AutoModel

SAMPLE_RATE = 16000

_TAG_RE = re.compile(r"<\|([^|]+)\|>")
_EMOTIONS = {"HAPPY", "SAD", "ANGRY", "NEUTRAL", "FEARFUL", "DISGUSTED", "SURPRISED", "EMO_UNKNOWN"}
_LANGUAGES = {"zh", "en", "yue", "ja", "ko", "nospeech"}
_IGNORED_TAGS = {"withitn", "woitn"}


def parse_result(raw_text: str) -> dict:
    tags = _TAG_RE.findall(raw_text)
    clean_text = _TAG_RE.sub("", raw_text).strip()
    emotion = next((t for t in tags if t in _EMOTIONS), None)
    language = next((t for t in tags if t in _LANGUAGES), None)
    event = next((t for t in tags if t not in _EMOTIONS and t not in _LANGUAGES and t not in _IGNORED_TAGS), None)
    return {"text": clean_text, "emotion": emotion, "language": language, "event": event}


class FunASRNanoEngine:
    def __init__(self, device: str | None = None):
        device = device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = AutoModel(model="FunAudioLLM/Fun-ASR-Nano-2512", device=device)

    def transcribe(self, pcm16_bytes: bytes) -> dict:
        audio = np.frombuffer(pcm16_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        res = self.model.generate(input=torch.from_numpy(audio))
        raw_text = res[0]["text"] if res else ""
        return parse_result(raw_text)


class VadEngine:
    """Streaming speech-segment boundary detector (fsmn-vad).

    Each call reports segment boundaries as [start_ms, end_ms] pairs, timed
    relative to the first sample seen since the cache was created. -1 means
    "not yet known" (e.g. [start_ms, -1] = speech started, end not seen yet).
    """

    def __init__(self, device: str | None = None):
        device = device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = AutoModel(model="fsmn-vad", device=device, disable_pbar=True, disable_log=True)

    def new_cache(self) -> dict:
        return {}

    def detect(self, pcm16_bytes: bytes, cache: dict, is_final: bool) -> list[list[int]]:
        audio = np.frombuffer(pcm16_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        chunk_ms = max(int(len(audio) / SAMPLE_RATE * 1000), 1)
        res = self.model.generate(
            input=torch.from_numpy(audio),
            cache=cache,
            is_final=is_final,
            chunk_size=chunk_ms,
        )
        return res[0]["value"] if res else []

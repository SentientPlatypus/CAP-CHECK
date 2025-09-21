#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Class-based live multidevice streaming to AssemblyAI v3 with:
- Crosstalk gating (dominant mic only, with hysteresis)
- Debounced partials
- Single clean final per turn (wait briefly for formatted final)
- Per-speaker state (turn tracking)
- NDJSON output (or pretty printing)
- Optional JSONL logging
- Flask endpoint to fetch current transcript

Prereqs:
  pip install assemblyai sounddevice numpy flask
Auth:
  export ASSEMBLYAI_API_KEY="YOUR_ROTATED_KEY"
"""

import os
import sys
import time
import json
import queue
import signal
import threading
from typing import List, Optional, Dict, Any

import numpy as np
import sounddevice as sd
import assemblyai as aai
from flask import Flask, jsonify
from assemblyai.streaming.v3 import (
    BeginEvent,
    StreamingClient,
    StreamingClientOptions,
    StreamingError,
    StreamingEvents,
    StreamingParameters,
    TerminationEvent,
    TurnEvent,
)

# =========================
# CONFIG (tweak as needed)
# =========================

# Audio & streaming
SAMPLERATE = 16000
FRAMES_PER_BUFFER = 800      # ~50 ms @ 16 kHz (recommended)
FORMAT_TURNS = True          # punctuation/casing on final turns

# Output
PRINT_JSON = True            # NDJSON lines; else pretty
WRITE_JSONL = True           # Also append to a .jsonl file
JSONL_PATH = "debate_live.jsonl"

# Partials behavior
PRINT_PARTIALS = True
PARTIAL_MIN_INTERVAL_S = 0.50  # throttle partial prints per speaker
MIN_WORD_DELTA = 2             # partial must add >= N new words to print
# Final handling (avoid duplicate final then formatted-final)
PREFER_FORMATTED_FINAL = True
FORMATTED_WAIT_S = 0.60        # wait up to this for formatted final

# Crosstalk gate / VAD-ish params
DB_DELTA = 8.0                 # dB louder needed to "win"
VAD_SILENCE_DBFS = -45.0       # below this is (near) silence
HANGOVER_FRAMES = 4            # keep winner ~200 ms (4 * 50 ms)
ALLOW_OVERLAP = False          # set True to allow both in near-equal loudness

# Energy smoothing
EWMA_ALPHA = 0.2               # 0..1 (higher = more reactive)

LABELS = ["Speaker A", "Speaker B"]

# =========================
# CLASS
# =========================

class TurnState:
    def __init__(self, label: str):
        self.label = label
        self.turn_order: Optional[int] = None
        self.last_printed_text: str = ""     # for dedupe
        self.last_partial_emit: float = 0.0
        self.pending_final: Optional[Dict[str, Any]] = None
        self.pending_final_deadline: float = 0.0
        self.have_emitted_final_for_turn: bool = False


class LiveTranscriber:
    def __init__(self):
        # Runtime
        self.stop_event = threading.Event()
        self.io_lock = threading.Lock()

        # Queues: raw capture from callbacks; gated frames to send
        self.cap_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]
        self.send_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]

        # Gating state
        self.last_db = [-120.0, -120.0]
        self.active: Optional[int] = None
        self.hang = 0

        # Streaming clients and audio streams
        self.clients: List[Optional[StreamingClient]] = [None, None]
        self.streams: List[sd.InputStream] = []
        self.threads: List[threading.Thread] = []
        self.flusher_thread: Optional[threading.Thread] = None
        self.arbiter_thread: Optional[threading.Thread] = None

        # Per-speaker turn states
        self.turn_states = {lbl: TurnState(lbl) for lbl in LABELS}

        # Shared transcript buffer (what /api/transcribe returns)
        self.transcript: List[Dict[str, Any]] = []

        # Logging file init
        if WRITE_JSONL:
            with open(JSONL_PATH, "w", encoding="utf-8") as f:
                f.write("")

    # ========== Utilities ==========

    @staticmethod
    def rms_dbfs(int16_bytes: bytes) -> float:
        if not int16_bytes:
            return -120.0
        x = np.frombuffer(int16_bytes, dtype=np.int16).astype(np.float32)
        if x.size == 0:
            return -120.0
        rms = np.sqrt(np.mean(x * x)) + 1e-7
        return 20.0 * np.log10(rms / 32768.0)

    @staticmethod
    def count_new_words(prev: str, cur: str) -> int:
        p = prev.strip().split()
        c = cur.strip().split()
        return max(0, len(c) - len(p))

    def write_jsonl(self, obj: dict):
        if not WRITE_JSONL:
            return
        try:
            with self.io_lock:
                with open(JSONL_PATH, "a", encoding="utf-8") as f:
                    f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        except Exception:
            pass

    def emit_line(self, label: str, text: str, final: bool, formatted: bool, turn_order: int):
        payload = {
            "Speaker": label,
            "Text": text,
            "Final": final,
            "Formatted": formatted,
            "TurnOrder": turn_order,
            "Ts": time.time(),
        }
        with self.io_lock:
            # console
            if PRINT_JSON:
                print(json.dumps(payload, ensure_ascii=False))
            else:
                print(f"{label} [final={final} formatted={formatted} turn={turn_order}]: {text}")
            # transcript buffer + optional log
            self.transcript.append(payload)
        self.write_jsonl(payload)

    # ========== Client ==========

    def _make_client(self, label: str) -> StreamingClient:
        api_key = os.environ.get("ASSEMBLYAI_API_KEY")
        if not api_key:
            raise RuntimeError("Set ASSEMBLYAI_API_KEY environment variable.")
        aai.settings.api_key = api_key

        client = StreamingClient(
            StreamingClientOptions(
                api_key=api_key,
                api_host="streaming.assemblyai.com",
            )
        )

        def on_begin(_cli: StreamingClient, event: BeginEvent):
            with self.io_lock:
                print(f"[{label}] session started: {event.id}")

        def on_turn(_cli: StreamingClient, event: TurnEvent):
            transcript = event.transcript or ""
            final = bool(getattr(event, "end_of_turn", False))
            formatted = bool(getattr(event, "turn_is_formatted", False))
            turn_order = getattr(event, "turn_order", None)
            st = self.turn_states[label]

            # New turn?
            if st.turn_order is None or (turn_order is not None and turn_order != st.turn_order):
                # Flush pending unformatted final from previous turn if any
                if st.pending_final:
                    pf = st.pending_final
                    if pf["text"]:
                        self.emit_line(st.label, pf["text"], True, False, pf["turn_order"])
                # Reset for new turn
                st.turn_order = turn_order
                st.last_printed_text = ""
                st.last_partial_emit = 0.0
                st.pending_final = None
                st.pending_final_deadline = 0.0
                st.have_emitted_final_for_turn = False

            if transcript == "":
                return

            # Partials
            if not final:
                if not PRINT_PARTIALS:
                    return
                now = time.time()
                if (now - st.last_partial_emit) < PARTIAL_MIN_INTERVAL_S:
                    return
                if self.count_new_words(st.last_printed_text, transcript) < MIN_WORD_DELTA:
                    return
                self.emit_line(label, transcript, False, formatted, st.turn_order if st.turn_order is not None else -1)
                st.last_printed_text = transcript
                st.last_partial_emit = now
                return

            # Finals
            if PREFER_FORMATTED_FINAL:
                if formatted:
                    if not st.have_emitted_final_for_turn:
                        self.emit_line(label, transcript, True, True, st.turn_order if st.turn_order is not None else -1)
                        st.have_emitted_final_for_turn = True
                    st.pending_final = None
                    st.pending_final_deadline = 0.0
                else:
                    st.pending_final = {
                        "text": transcript,
                        "turn_order": st.turn_order if st.turn_order is not None else -1,
                    }
                    st.pending_final_deadline = time.time() + FORMATTED_WAIT_S
                return
            else:
                if not st.have_emitted_final_for_turn:
                    self.emit_line(label, transcript, True, formatted, st.turn_order if st.turn_order is not None else -1)
                    st.have_emitted_final_for_turn = True

        def on_term(_cli: StreamingClient, event: TerminationEvent):
            with self.io_lock:
                print(f"[{label}] terminated. {event.audio_duration_seconds:.2f}s processed.")

        def on_err(_cli: StreamingClient, error: StreamingError):
            with self.io_lock:
                print(f"[{label}] error: {error}", file=sys.stderr)
            self.stop_event.set()

        client.on(StreamingEvents.Begin, on_begin)
        client.on(StreamingEvents.Turn, on_turn)
        client.on(StreamingEvents.Termination, on_term)
        client.on(StreamingEvents.Error, on_err)

        client.connect(
            StreamingParameters(
                sample_rate=SAMPLERATE,
                format_turns=FORMAT_TURNS,
                # stabilize multi-speaker turn detection
                min_end_of_turn_silence_when_confident=560,  # ms
                max_turn_silence=1280,                       # ms
            )
        )
        return client

    # ========== Audio callbacks ==========

    def _make_callback(self, idx: int):
        def cb(indata, frames, time_info, status):
            if status:
                with self.io_lock:
                    print(status, file=sys.stderr)
            try:
                self.cap_q[idx].put(indata.copy().tobytes(), block=False)
            except queue.Full:
                pass
        return cb

    # ========== Crosstalk arbiter (gating) ==========

    def _arbiter(self):
        """Routes frames to the louder mic (with hysteresis)."""
        while not self.stop_event.is_set():
            chunks = [None, None]
            for i in (0, 1):
                try:
                    chunks[i] = self.cap_q[i].get(timeout=0.05)
                except queue.Empty:
                    chunks[i] = None

            if chunks[0] is None and chunks[1] is None:
                time.sleep(0.005)
                continue

            db = self.last_db[:]
            for i in (0, 1):
                if chunks[i] is not None:
                    d_new = self.rms_dbfs(chunks[i])
                    db[i] = EWMA_ALPHA * d_new + (1.0 - EWMA_ALPHA) * self.last_db[i]

            route = [False, False]

            if chunks[0] is not None and chunks[1] is None:
                if db[0] > VAD_SILENCE_DBFS:
                    if self.active in (None, 0) or self.hang <= 0 or (db[0] - self.last_db[1]) >= DB_DELTA:
                        self.active, self.hang = 0, HANGOVER_FRAMES
                    route[self.active == 0] = True

            elif chunks[1] is not None and chunks[0] is None:
                if db[1] > VAD_SILENCE_DBFS:
                    if self.active in (None, 1) or self.hang <= 0 or (db[1] - self.last_db[0]) >= DB_DELTA:
                        self.active, self.hang = 1, HANGOVER_FRAMES
                    route[self.active == 1] = True

            else:
                d0, d1 = db[0], db[1]
                diff = d0 - d1
                if max(d0, d1) <= VAD_SILENCE_DBFS:
                    route = [False, False]
                else:
                    if abs(diff) < 3.0 and ALLOW_OVERLAP:
                        route = [True, True]
                    elif diff >= DB_DELTA:
                        self.active, self.hang = 0, HANGOVER_FRAMES
                        route = [True, False]
                    elif diff <= -DB_DELTA:
                        self.active, self.hang = 1, HANGOVER_FRAMES
                        route = [False, True]
                    else:
                        if self.active is not None and db[self.active] > VAD_SILENCE_DBFS and self.hang > 0:
                            route[self.active] = True
                        else:
                            route = [diff >= 0.0, diff < 0.0]

            if self.hang > 0:
                self.hang -= 1

            self.last_db = db

            for i in (0, 1):
                if chunks[i] is not None and route[i]:
                    try:
                        self.send_q[i].put(chunks[i], block=False)
                    except queue.Full:
                        pass

    # ========== Streaming worker ==========

    def _streamer(self, client: StreamingClient, idx: int):
        def source():
            while not self.stop_event.is_set():
                try:
                    data = self.send_q[idx].get(timeout=0.2)
                    yield data
                except queue.Empty:
                    continue
        try:
            client.stream(source())
        finally:
            try:
                client.disconnect(terminate=True)
            except Exception:
                pass

    # ========== Final flusher (formatted wait) ==========

    def _flush_pending_finals_loop(self):
        """Flush unformatted finals if we didn't receive a formatted one in time."""
        while not self.stop_event.is_set():
            now = time.time()
            for st in self.turn_states.values():
                if st.pending_final and now >= st.pending_final_deadline:
                    pf = st.pending_final
                    if pf["text"]:
                        self.emit_line(st.label, pf["text"], True, False, pf["turn_order"])
                        st.have_emitted_final_for_turn = True
                    st.pending_final = None
                    st.pending_final_deadline = 0.0
            time.sleep(0.05)

    # ========== Public API ==========

    @staticmethod
    def auto_pick_two_input_devices() -> List[int]:
        """Pick first two devices with input channels. Raise if fewer than 2."""
        devices = sd.query_devices()
        candidates = [i for i, d in enumerate(devices) if d.get("max_input_channels", 0) > 0]
        if len(candidates) < 2:
            raise RuntimeError("Need at least two audio input devices.")
        return candidates[:2]

    def start(self, dev_ids: Optional[List[int]] = None):
        """Start audio capture, gating, streaming, and flusher threads."""
        if dev_ids is None:
            dev_ids = self.auto_pick_two_input_devices()

        # Create streaming clients
        self.clients = [self._make_client(LABELS[i]) for i in range(2)]

        # Start flusher thread
        self.flusher_thread = threading.Thread(target=self._flush_pending_finals_loop, daemon=True)
        self.flusher_thread.start()

        # Open input streams
        try:
            for i, dev in enumerate(dev_ids):
                s = sd.InputStream(
                    samplerate=SAMPLERATE,
                    device=dev,
                    channels=1,
                    dtype="int16",
                    blocksize=FRAMES_PER_BUFFER,
                    callback=self._make_callback(i),
                )
                s.start()
                self.streams.append(s)
        except Exception as e:
            print(f"Failed to start input streams: {e}")
            for s in self.streams:
                try:
                    s.stop(); s.close()
                except Exception:
                    pass
            raise

        # Start arbiter + streamer threads
        self.arbiter_thread = threading.Thread(target=self._arbiter, daemon=True)
        self.arbiter_thread.start()

        self.threads = [
            threading.Thread(target=self._streamer, args=(self.clients[i], i), daemon=True)
            for i in range(2)
        ]
        for t in self.threads:
            t.start()

        print("\nLive (gated) streaming… Press Ctrl+C to stop.\n")

    def stop(self):
        """Stop all workers and close streams."""
        self.stop_event.set()
        # Stop streams
        for s in self.streams:
            try:
                s.stop(); s.close()
            except Exception:
                pass
        # Join threads
        for t in self.threads:
            t.join(timeout=2)
        if self.arbiter_thread:
            self.arbiter_thread.join(timeout=2)
        if self.flusher_thread:
            self.flusher_thread.join(timeout=2)
        print("Stopped.")

    def get_transcript(self) -> List[Dict[str, Any]]:
        with self.io_lock:
            # return a shallow copy so callers can't mutate internal list
            return list(self.transcript)


# =========================
# FLASK APP
# =========================

app = Flask(__name__)
transcriber = LiveTranscriber()

@app.post("/api/transcribe")
def api_transcribe():
    # Returns all lines (partials + finals). If you want finals only, filter here.
    # Example to return finals only:
    # data = [d for d in transcriber.get_transcript() if d["Final"]]
    data = transcriber.get_transcript()
    return jsonify(data)


def _handle_sigint(sig, frame):
    print("\nStopping…")
    transcriber.stop()
    sys.exit(0)


if __name__ == "__main__":
    # Option 1: let it auto-pick two input devices
    dev_ids = None
    # Option 2: hardcode specific device IDs
    # dev_ids = [0, 2]

    # Start streaming stack, then run Flask
    transcriber.start(dev_ids=dev_ids)

    # Graceful Ctrl+C handling
    signal.signal(signal.SIGINT, _handle_sigint)

    # Run API server
    # Use threaded=True so the Flask request handler won't block streaming threads
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

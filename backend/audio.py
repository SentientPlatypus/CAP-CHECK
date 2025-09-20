#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Live multidevice streaming to AssemblyAI v3 with:
- Crosstalk gating (dominant mic only, with hysteresis)
- Debounced partials
- Single clean final per turn (waits briefly for formatted final)
- Per-speaker state (turn tracking)
- NDJSON output (or pretty printing)
- Optional JSONL logging

Prereqs:
  pip install assemblyai sounddevice numpy
Auth:
  export ASSEMBLYAI_API_KEY="YOUR_ROTATED_KEY"
"""

import os
import sys
import time
import json
import signal
import queue
import threading
import numpy as np
import sounddevice as sd
import assemblyai as aai
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
# CONFIG
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

API_KEY = "60515d2883e14404b02198487c9d2954"

# =========================
# GLOBALS
# =========================

stop_event = threading.Event()

# Capture queues (raw frames from callbacks), and gated queues (to send)
cap_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]
send_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]

labels = ["Speaker A", "Speaker B"]

# Gating state
last_db = [-120.0, -120.0]
active = None
hang = 0

# Per-speaker streaming client placeholders
clients = [None, None]

# Per-speaker turn state
class TurnState:
    def __init__(self, label):
        self.label = label
        self.turn_order = None
        self.last_printed_text = ""     # for dedupe
        self.last_partial_emit = 0.0
        self.pending_final = None       # hold until we see formatted or timeout
        self.pending_final_deadline = 0.0
        self.have_emitted_final_for_turn = False

turn_states = {
    "Speaker A": TurnState("Speaker A"),
    "Speaker B": TurnState("Speaker B"),
}

# I/O lock for consistent printing and logging
io_lock = threading.Lock()


# =========================
# Utilities
# =========================

def rms_dbfs(int16_bytes: bytes) -> float:
    if not int16_bytes:
        return -120.0
    x = np.frombuffer(int16_bytes, dtype=np.int16).astype(np.float32)
    if x.size == 0:
        return -120.0
    rms = np.sqrt(np.mean(x * x)) + 1e-7
    return 20.0 * np.log10(rms / 32768.0)

def count_new_words(prev: str, cur: str) -> int:
    p = prev.strip().split()
    c = cur.strip().split()
    # Count additional words at the end
    if len(c) <= len(p):
        return 0
    # naive suffix diff
    return len(c) - len(p)

def write_jsonl(obj: dict):
    if not WRITE_JSONL:
        return
    try:
        with io_lock:
            with open(JSONL_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(obj, ensure_ascii=False) + "\n")
    except Exception:
        pass

def emit_line(label: str, text: str, final: bool, formatted: bool, turn_order: int):
    payload = {
        "speaker": label,
        "text": text,
        "final": final,
        "turn_is_formatted": formatted,
        "turn_order": turn_order,
        "ts": time.time(),
    }
    with io_lock:
        if PRINT_JSON:
            print(json.dumps(payload, ensure_ascii=False))
        else:
            print(f"{label} [final={final} formatted={formatted} turn={turn_order}]: {text}")
    write_jsonl(payload)

def flush_pending_finals_loop():
    """Flush unformatted finals if we didn't receive a formatted one in time."""
    while not stop_event.is_set():
        now = time.time()
        for st in turn_states.values():
            if st.pending_final and now >= st.pending_final_deadline:
                # Emit the stored (unformatted) final
                pf = st.pending_final
                if pf["text"]:
                    emit_line(st.label, pf["text"], True, False, pf["turn_order"])
                    st.have_emitted_final_for_turn = True
                # Clear pending
                st.pending_final = None
                st.pending_final_deadline = 0.0
        time.sleep(0.05)


# =========================
# Device selection
# =========================

def pick_devices() -> list[int]:
    print("Available audio input devices:\n")
    devices = sd.query_devices()
    for i, d in enumerate(devices):
        if d["max_input_channels"] > 0:
            print(f"{i}: {d['name']} (max in: {d['max_input_channels']})")
    ids_text = input("\nEnter TWO device IDs (comma-separated), e.g. 0,2: ").strip()
    try:
        dev_ids = [int(x) for x in ids_text.split(",")]
        assert len(dev_ids) == 2
    except Exception:
        print("Please enter exactly two valid device IDs, e.g. 0,2")
        sys.exit(1)
    return dev_ids


# =========================
# Streaming client factory
# =========================

def make_client(label: str) -> StreamingClient:
    client = StreamingClient(
        StreamingClientOptions(
            api_key=API_KEY,                 # For client apps, prefer token=... (temp token)
            api_host="streaming.assemblyai.com",
        )
    )

    def on_begin(self: StreamingClient, event: BeginEvent):
        with io_lock:
            print(f"[{label}] session started: {event.id}")

    def on_turn(self: StreamingClient, event: TurnEvent):
        # Pull fields (SDK exposes as attributes)
        transcript = event.transcript or ""
        final = bool(getattr(event, "end_of_turn", False))
        formatted = bool(getattr(event, "turn_is_formatted", False))
        turn_order = getattr(event, "turn_order", None)

        st = turn_states[label]

        # New turn starts?
        if st.turn_order is None or (turn_order is not None and turn_order != st.turn_order):
            # Flush any pending unformatted final from prior turn
            if st.pending_final:
                pf = st.pending_final
                if pf["text"]:
                    emit_line(st.label, pf["text"], True, False, pf["turn_order"])
            # Reset state for new turn
            st.turn_order = turn_order
            st.last_printed_text = ""
            st.last_partial_emit = 0.0
            st.pending_final = None
            st.pending_final_deadline = 0.0
            st.have_emitted_final_for_turn = False

        # Ignore empty text
        if transcript == "":
            return

        # Partial updates (not final)
        if not final:
            if not PRINT_PARTIALS:
                return
            now = time.time()
            # Throttle + require enough “new words” to reduce spam
            if (now - st.last_partial_emit) < PARTIAL_MIN_INTERVAL_S:
                return
            if count_new_words(st.last_printed_text, transcript) < MIN_WORD_DELTA:
                return
            emit_line(label, transcript, False, formatted, st.turn_order if st.turn_order is not None else -1)
            st.last_printed_text = transcript
            st.last_partial_emit = now
            return

        # Final handling:
        # If we prefer formatted finals, we wait a short window for formatted version.
        if PREFER_FORMATTED_FINAL:
            if formatted:
                # If we already emitted an unformatted final for this turn (rare with waiting),
                # we can still emit the formatted if it brings value (punctuation/casing).
                if not st.have_emitted_final_for_turn:
                    emit_line(label, transcript, True, True, st.turn_order if st.turn_order is not None else -1)
                    st.have_emitted_final_for_turn = True
                # Clear any pending
                st.pending_final = None
                st.pending_final_deadline = 0.0
            else:
                # Store as pending; will be flushed if no formatted arrives in time
                st.pending_final = {
                    "text": transcript,
                    "turn_order": st.turn_order if st.turn_order is not None else -1,
                }
                st.pending_final_deadline = time.time() + FORMATTED_WAIT_S
            return
        else:
            # Emit immediately, regardless of formatted status
            if not st.have_emitted_final_for_turn:
                emit_line(label, transcript, True, formatted, st.turn_order if st.turn_order is not None else -1)
                st.have_emitted_final_for_turn = True

    def on_term(self: StreamingClient, event: TerminationEvent):
        with io_lock:
            print(f"[{label}] terminated. {event.audio_duration_seconds:.2f}s processed.")

    def on_err(self: StreamingClient, error: StreamingError):
        with io_lock:
            print(f"[{label}] error: {error}", file=sys.stderr)
        stop_event.set()

    client.on(StreamingEvents.Begin, on_begin)
    client.on(StreamingEvents.Turn, on_turn)
    client.on(StreamingEvents.Termination, on_term)
    client.on(StreamingEvents.Error, on_err)

    client.connect(
        StreamingParameters(
            sample_rate=SAMPLERATE,
            format_turns=FORMAT_TURNS,
            # Stabilize multi-speaker turn detection
            min_end_of_turn_silence_when_confident=560,  # ms
            max_turn_silence=1280,                       # ms
        )
    )
    return client


# =========================
# Audio callbacks
# =========================

def make_callback(idx: int):
    def cb(indata, frames, time_info, status):
        if status:
            with io_lock:
                print(status, file=sys.stderr)
        try:
            cap_q[idx].put(indata.copy().tobytes(), block=False)
        except queue.Full:
            pass
    return cb


# =========================
# Crosstalk arbiter (gating)
# =========================

def arbiter():
    """Routes frames to the louder mic (with hysteresis)."""
    global last_db, active, hang

    while not stop_event.is_set():
        chunks = [None, None]
        for i in (0, 1):
            try:
                chunks[i] = cap_q[i].get(timeout=0.05)
            except queue.Empty:
                chunks[i] = None

        if chunks[0] is None and chunks[1] is None:
            time.sleep(0.005)
            continue

        db = last_db[:]
        for i in (0, 1):
            if chunks[i] is not None:
                d_new = rms_dbfs(chunks[i])
                db[i] = EWMA_ALPHA * d_new + (1.0 - EWMA_ALPHA) * last_db[i]

        route = [False, False]

        if chunks[0] is not None and chunks[1] is None:
            if db[0] > VAD_SILENCE_DBFS:
                if active in (None, 0) or hang <= 0 or (db[0] - last_db[1]) >= DB_DELTA:
                    active, hang = 0, HANGOVER_FRAMES
                route[active == 0] = True

        elif chunks[1] is not None and chunks[0] is None:
            if db[1] > VAD_SILENCE_DBFS:
                if active in (None, 1) or hang <= 0 or (db[1] - last_db[0]) >= DB_DELTA:
                    active, hang = 1, HANGOVER_FRAMES
                route[active == 1] = True

        else:
            d0, d1 = db[0], db[1]
            diff = d0 - d1
            if max(d0, d1) <= VAD_SILENCE_DBFS:
                route = [False, False]
            else:
                if abs(diff) < 3.0 and ALLOW_OVERLAP:
                    route = [True, True]
                elif diff >= DB_DELTA:
                    active, hang = 0, HANGOVER_FRAMES
                    route = [True, False]
                elif diff <= -DB_DELTA:
                    active, hang = 1, HANGOVER_FRAMES
                    route = [False, True]
                else:
                    if active is not None and db[active] > VAD_SILENCE_DBFS and hang > 0:
                        route[active] = True
                    else:
                        route = [diff >= 0.0, diff < 0.0]

        if hang > 0:
            hang -= 1

        last_db = db

        for i in (0, 1):
            if chunks[i] is not None and route[i]:
                try:
                    send_q[i].put(chunks[i], block=False)
                except queue.Full:
                    pass


# =========================
# Streamer threads
# =========================

def streamer(client: StreamingClient, idx: int):
    def source():
        while not stop_event.is_set():
            try:
                data = send_q[idx].get(timeout=0.2)
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


# =========================
# Main
# =========================

def main():
    if not API_KEY:
        print("Set ASSEMBLYAI_API_KEY environment variable first.")
        sys.exit(1)
    aai.settings.api_key = API_KEY

    if WRITE_JSONL:
        # Create/clear file header
        with open(JSONL_PATH, "w", encoding="utf-8") as f:
            f.write("")

    dev_ids = pick_devices()

    # Create streaming clients
    global clients
    clients = [make_client(labels[i]) for i in range(2)]

    # Start the pending-final flusher
    flusher = threading.Thread(target=flush_pending_finals_loop, daemon=True)
    flusher.start()

    # Open input streams
    streams = []
    try:
        for i, dev in enumerate(dev_ids):
            s = sd.InputStream(
                samplerate=SAMPLERATE,
                device=dev,
                channels=1,
                dtype="int16",
                blocksize=FRAMES_PER_BUFFER,
                callback=make_callback(i),
            )
            s.start()
            streams.append(s)
    except Exception as e:
        print(f"Failed to start input streams: {e}")
        for s in streams:
            try:
                s.stop(); s.close()
            except Exception:
                pass
        sys.exit(1)

    # Start arbiter + streamer threads
    arb = threading.Thread(target=arbiter, daemon=True); arb.start()
    senders = [
        threading.Thread(target=streamer, args=(clients[i], i), daemon=True)
        for i in range(2)
    ]
    for t in senders: t.start()

    print("\nLive (gated) streaming… Press Ctrl+C to stop.\n")

    def handle_sigint(sig, frame):
        print("\nStopping…")
        stop_event.set()
    signal.signal(signal.SIGINT, handle_sigint)

    try:
        while not stop_event.is_set():
            time.sleep(0.1)
    finally:
        stop_event.set()
        # Stop streams
        for s in streams:
            try:
                s.stop(); s.close()
            except Exception:
                pass
        # Join threads
        for t in senders:
            t.join(timeout=2)
        print("Done.")


if __name__ == "__main__":
    main()

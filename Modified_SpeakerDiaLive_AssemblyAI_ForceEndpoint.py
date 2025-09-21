#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AssemblyAI Universal-Streaming (v3) – two-mic gated streaming with:
- Crosstalk gating (dominant mic only, with hysteresis)
- Clean speaker switch: FORCE server endpoint on mic switch to avoid prefix carry-over
- Debounced partials & single clean final per turn (formatted finals optional)
- Per-speaker state & robust prefix-trim safety net (if server keeps same turn)
- No proactive socket closes on transient errors (only on Ctrl+C)

Setup
-----
export ASSEMBLYAI_API_KEY="<YOUR_KEY>"

References
----------
• Force endpoint control message & streaming params (min/max silence, etc.)
  https://www.assemblyai.com/docs/api-reference/streaming-api/streaming-api
• Message sequence & Turn object semantics
  https://www.assemblyai.com/docs/speech-to-text/universal-streaming/message-sequence
"""
import os
import sys
import time
import json
import signal
import queue
import threading
from typing import Optional

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
SAMPLERATE = 16000
FRAMES_PER_BUFFER = 800  # ~50 ms @ 16 kHz (recommended)
FORMAT_TURNS = True

PRINT_JSON = True
WRITE_JSONL = False
JSONL_PATH = "debate_live.jsonl"

PRINT_PARTIALS = True
PARTIAL_MIN_INTERVAL_S = 0.50
MIN_WORD_DELTA = 2

PREFER_FORMATTED_FINAL = True
FORMATTED_WAIT_S = 0.60

DB_DELTA = 8.0
VAD_SILENCE_DBFS = -45.0
HANGOVER_FRAMES = 4
ALLOW_OVERLAP = False
EWMA_ALPHA = 0.2

# Endpointing knobs – tune for your room
END_OF_TURN_CONFIDENCE = 0.4    # default; can try 0.6–0.8 if over/under splitting
MIN_EOT_SILENCE_MS = 240        # try 160–400ms for snappier switches
MAX_TURN_SILENCE_MS = 1600      # upper bound before server forces end-of-turn

API_KEY = "60515d2883e14404b02198487c9d2954"

# =========================
# GLOBALS
# =========================
stop_event = threading.Event()
cap_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]
send_q = [queue.Queue(maxsize=50), queue.Queue(maxsize=50)]
labels = ["Speaker A", "Speaker B"]

last_db = [-120.0, -120.0]
active: Optional[int] = None
hang = 0
_last_forced_for_active: Optional[int] = None  # track last index we forced on

clients = [None, None]

class TurnState:
    def __init__(self, label: str):
        self.label = label
        self.turn_order: Optional[int] = None
        self.last_printed_text: str = ""
        self.last_partial_emit: float = 0.0
        self.pending_final: Optional[dict] = None
        self.pending_final_deadline: float = 0.0
        self.have_emitted_final_for_turn: bool = False
        # Prefix-trim safety (in case server keeps same turn)
        self._last_raw_transcript: str = ""
        self._max_raw_len_words: int = 0
        self._resume_cut_words: int = 0

turn_states = {
    "Speaker A": TurnState("Speaker A"),
    "Speaker B": TurnState("Speaker B"),
}

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
    p = prev.strip().split(); c = cur.strip().split()
    if len(c) <= len(p):
        return 0
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
            print(f"{payload['speaker']}: {payload['text']}")
        else:
            print(f"{label} [final={final} formatted={formatted} turn={turn_order}]: {text}")
        write_jsonl(payload)


def flush_pending_finals_loop():
    while not stop_event.is_set():
        now = time.time()
        for st in turn_states.values():
            if st.pending_final and now >= st.pending_final_deadline:
                pf = st.pending_final
                if pf.get("text"):
                    emit_line(st.label, pf["text"], True, False, pf["turn_order"])
                st.have_emitted_final_for_turn = True
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
        if d.get("max_input_channels", 0) > 0:
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
# Force endpoint helper (AssemblyAI Streaming API)
# =========================

def force_endpoint_safe(client: StreamingClient, label: str) -> bool:
    """Try to force an end-of-turn on the server.
    This uses whichever method the SDK exposes; if unavailable, no-op.
    """
    try:
        # Potential public helper (if exposed by the SDK)
        if hasattr(client, "force_endpoint") and callable(getattr(client, "force_endpoint")):
            client.force_endpoint()
            with io_lock:
                return True
        # Generic send method (SDK internals may expose)
        if hasattr(client, "send") and callable(getattr(client, "send")):
            client.send({"type": "ForceEndpoint"})
            with io_lock:
                return True
        # Low-level private escape hatch (avoid if possible)
        if hasattr(client, "_send") and callable(getattr(client, "_send")):
            client._send({"type": "ForceEndpoint"})  # type: ignore
            with io_lock:
                return True
    except Exception as e:
        with io_lock:
            return False

# =========================
# Streaming client factory
# =========================

def make_client(label: str) -> StreamingClient:
    client = StreamingClient(
        StreamingClientOptions(
            api_key=API_KEY,
            api_host="streaming.assemblyai.com",
        )
    )

    def on_begin(self: StreamingClient, event: BeginEvent):
        with io_lock:
            print(f"[{label}] session started: {event.id}")

    def on_turn(self: StreamingClient, event: TurnEvent):
        transcript = event.transcript or ""
        final = bool(getattr(event, "end_of_turn", False))
        formatted = bool(getattr(event, "turn_is_formatted", False))
        turn_order = getattr(event, "turn_order", None)

        st = turn_states[label]

        # Update raw tracking first
        st._last_raw_transcript = transcript
        raw_words = transcript.strip().split()
        raw_len = len(raw_words)
        st._max_raw_len_words = max(st._max_raw_len_words, raw_len)

        # Detect whether THIS event begins a NEW turn for this speaker
        new_turn_for_this = (
            st.turn_order is None
            or (turn_order is not None and turn_order != st.turn_order)
        )

        if new_turn_for_this:
            # Other speaker was interrupted by THIS speaker's new turn; make them trim on resume
            for other_label, other_st in turn_states.items():
                if other_label != label:
                    other_st._resume_cut_words = max(
                        getattr(other_st, "_resume_cut_words", 0),
                        getattr(other_st, "_max_raw_len_words", 0),
                    )
                    # Reset their emission strings state
                    other_st.turn_order = None
                    other_st.last_printed_text = ""
                    other_st.last_partial_emit = 0.0
                    other_st.pending_final = None
                    other_st.pending_final_deadline = 0.0
                    other_st.have_emitted_final_for_turn = False

            # Flush any pending unformatted final from THIS speaker's previous turn
            if st.pending_final:
                pf = st.pending_final
                if pf.get("text"):
                    emit_line(st.label, pf["text"], True, False, pf["turn_order"])

            # Reset THIS speaker for the new turn
            st.turn_order = turn_order
            st.last_printed_text = ""
            st.last_partial_emit = 0.0
            st.pending_final = None
            st.pending_final_deadline = 0.0
            st.have_emitted_final_for_turn = False
            st._max_raw_len_words = raw_len
            st._resume_cut_words = 0

        # Trim prefix if resuming in same server-side turn
        display_transcript = transcript
        cut = int(getattr(st, "_resume_cut_words", 0) or 0)
        if cut > 0:
            if raw_len >= cut:
                display_transcript = " ".join(raw_words[cut:])
            else:
                display_transcript = ""  # wait until API catches up

        if display_transcript == "":
            return

        # Partials
        if not final:
            if not PRINT_PARTIALS:
                return
            now = time.time()
            if (now - st.last_partial_emit) < PARTIAL_MIN_INTERVAL_S:
                return
            if count_new_words(st.last_printed_text, display_transcript) < MIN_WORD_DELTA:
                return
            emit_line(label, display_transcript, False, formatted, st.turn_order if st.turn_order is not None else -1)
            st.last_printed_text = display_transcript
            st.last_partial_emit = now
            return

        # Finals
        if PREFER_FORMATTED_FINAL:
            if formatted:
                if not st.have_emitted_final_for_turn:
                    emit_line(label, display_transcript, True, True, st.turn_order if st.turn_order is not None else -1)
                st.have_emitted_final_for_turn = True
                st.pending_final = None
                st.pending_final_deadline = 0.0
            else:
                st.pending_final = {
                    "text": display_transcript,
                    "turn_order": st.turn_order if st.turn_order is not None else -1,
                }
                st.pending_final_deadline = time.time() + FORMATTED_WAIT_S
            return
        else:
            if not st.have_emitted_final_for_turn:
                emit_line(label, display_transcript, True, formatted, st.turn_order if st.turn_order is not None else -1)
            st.have_emitted_final_for_turn = True

    def on_term(self: StreamingClient, event: TerminationEvent):
        with io_lock:
            print(f"[{label}] terminated. {event.audio_duration_seconds:.2f}s processed.")

    def on_err(self: StreamingClient, error: StreamingError):
        # Do NOT proactively close; just log (user request)
        with io_lock:
            print(f"[{label}] error: {error}", file=sys.stderr)

    client.on(StreamingEvents.Begin, on_begin)
    client.on(StreamingEvents.Turn, on_turn)
    client.on(StreamingEvents.Termination, on_term)
    client.on(StreamingEvents.Error, on_err)

    client.connect(
        StreamingParameters(
            sample_rate=SAMPLERATE,
            format_turns=FORMAT_TURNS,
            end_of_turn_confidence_threshold=END_OF_TURN_CONFIDENCE,
            min_end_of_turn_silence_when_confident=MIN_EOT_SILENCE_MS,
            max_turn_silence=MAX_TURN_SILENCE_MS,
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
    """Routes frames to the louder mic (with hysteresis), and forces a server
    end-of-turn when the active mic changes so the next speaker starts clean.
    """
    global last_db, active, hang, _last_forced_for_active
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
        switched = False

        if chunks[0] is not None and chunks[1] is None:
            if db[0] > VAD_SILENCE_DBFS:
                if active in (None, 0) or hang <= 0 or (db[0] - last_db[1]) >= DB_DELTA:
                    if active != 0:
                        switched = True
                    active, hang = 0, HANGOVER_FRAMES
                route[0] = True
        elif chunks[1] is not None and chunks[0] is None:
            if db[1] > VAD_SILENCE_DBFS:
                if active in (None, 1) or hang <= 0 or (db[1] - last_db[0]) >= DB_DELTA:
                    if active != 1:
                        switched = True
                    active, hang = 1, HANGOVER_FRAMES
                route[1] = True
        else:
            d0, d1 = db[0], db[1]
            diff = d0 - d1
            if max(d0, d1) <= VAD_SILENCE_DBFS:
                route = [False, False]
            else:
                if abs(diff) < 3.0 and ALLOW_OVERLAP:
                    route = [True, True]
                elif diff >= DB_DELTA:
                    if active != 0:
                        switched = True
                    active, hang = 0, HANGOVER_FRAMES
                    route = [True, False]
                elif diff <= -DB_DELTA:
                    if active != 1:
                        switched = True
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

        # If we switched which mic is active, force end-of-turn on server once
        if switched and active is not None:
            if _last_forced_for_active != active:
                # Best effort: force endpoint on BOTH clients to be safe
                try:
                    if clients[0]:
                        force_endpoint_safe(clients[0], labels[0])
                except Exception:
                    pass
                try:
                    if clients[1]:
                        force_endpoint_safe(clients[1], labels[1])
                except Exception:
                    pass
                _last_forced_for_active = active

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
        if stop_event.is_set():
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

    dev_ids = pick_devices()

    if WRITE_JSONL:
        with open(JSONL_PATH, "w", encoding="utf-8") as f:
            f.write("")

    global clients
    clients = [make_client(labels[i]) for i in range(2)]

    flusher = threading.Thread(target=flush_pending_finals_loop, daemon=True)
    flusher.start()

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
            s.start(); streams.append(s)
    except Exception as e:
        print(f"Failed to start input streams: {e}")
        for s in streams:
            try: s.stop(); s.close()
            except Exception: pass
        sys.exit(1)

    arb = threading.Thread(target=arbiter, daemon=True); arb.start()
    senders = [threading.Thread(target=streamer, args=(clients[i], i), daemon=True) for i in range(2)]
    for t in senders: t.start()

    print("\nLive (gated) streaming… Press Ctrl+C to stop.\n")

    def handle_sigint(sig, frame):
        print("\nStopping…"); stop_event.set()
    signal.signal(signal.SIGINT, handle_sigint)

    try:
        while not stop_event.is_set():
            time.sleep(0.1)
    finally:
        stop_event.set()
        for s in streams:
            try: s.stop(); s.close()
            except Exception: pass
        for t in senders:
            t.join(timeout=2)
        print("Done.")

if __name__ == "__main__":
    main()

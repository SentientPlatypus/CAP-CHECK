"""
CapCheck — Minimal Flask backend: Gemini fact-check API + Audio DB

Features kept tiny on purpose:
- SQLite models for AudioClip and FactCheck
- Upload or register audio clip metadata
- Simple POST /api/factcheck that you can later wire to Google Gemini
- No Socket.IO, no sessions, no serial, no auth — hackathon-minimal

Run:
  pip install flask flask-cors flask-sqlalchemy
  python app.py

ENV (optional):
  DATABASE_URL=sqlite:///capcheck.db
  UPLOAD_DIR=./uploads
"""
from __future__ import annotations
import os
import json
import time
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import serial
import cap_button 

# runing 
import threading
import subprocess
from transcriber import LiveTranscriber


# ---------------------------
# App / DB setup
# ---------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///capcheck.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 256 * 1024 * 1024  # 256 MB safety

UPLOAD_DIR = Path(os.environ.get('UPLOAD_DIR', './uploads'))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

db = SQLAlchemy(app)



# ---------------------------
# Health
# ---------------------------
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'ok': True})


# ------------------------------
# Global Variable GRANT SHIT

# Global variables to update the the frontend
class GlobalState(db.Model):
    __tablename__ = 'global_state'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON, default=dict)

DEFAULT_GLOBALS = {
    "personOneInput": "hhhh",
    "personTwoInput": "",
    "truthVerification": None,  # true | false | null
    "chatExplanation": (
        "This AI-powered fact-checking system analyzes statements in real-time. "
        "Switch between Person A and Person B to simulate conversations while the "
        "system verifies the truthfulness of each statement."
    ),
}

def _get_or_init_globals():
    row = GlobalState.query.get(1)
    if not row:
        row = GlobalState(id=1, data=DEFAULT_GLOBALS.copy())
        db.session.add(row)
        db.session.commit()
    return row

@app.get("/api/globals")
def api_get_globals():
    row = _get_or_init_globals()
    merged = {**DEFAULT_GLOBALS, **(row.data or {})}
    return jsonify(merged)

@app.post("/api/globals")
def api_put_globals():
    patch = request.get_json(force=True) or {}
    row = _get_or_init_globals()
    current = {**DEFAULT_GLOBALS, **(row.data or {})}
    current.update(patch)   # naive merge; add validation if you want
    row.data = current
    db.session.commit()
    return jsonify(current)

try:
    btn = cap_button.CapButton(port="COM10")  # Commented out for testing - no hardware needed
except:
    print("THE BUTTON cannot be defined, maybe Serial not working")
#---------------------------
# Arduino Endpoints - COMMENTED OUT FOR TESTING
#---------------------------
@app.get("/api/blinker/<int:player>/<int:command>")
def api_blinker(player: int, command: int):
    

    try:
        btn.send_command(player, command)
        return jsonify(ok=True, player=player, command=command)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.get("/api/start_transcribe")
def start_transcribe():
    # start a transcribe session
    dev_ids = None # autopick 2 devices
    my_session.start(dev_ids=dev_ids)
    return {"status": "started"}

@app.get("/api/end_transcribe")
def end_transcribe():
    my_session.stop()
    return 200


@app.get("/api/transcribe")
def api_transcribe():
    # TODO: SESSION NEEDS TO START BEFORE THIS IS RUN
    # Returns all lines (partials + finals). If you want finals only, filter here.
    # Example to return finals only:
    # data = [d for d in transcriber.get_transcript() if d["Final"]]
    data = my_session.get_transcript()[-20:]
    return jsonify(data)


# Launching frontend
def launch_frontend():
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    subprocess.run(["npm", "run", "dev"], cwd=frontend_dir)

if __name__ == '__main__':
    my_session = LiveTranscriber()
    with app.app_context():
        db.create_all()
    #threading.Thread(target=launch_frontend, daemon=True).start()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
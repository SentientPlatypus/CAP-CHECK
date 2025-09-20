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

# btn = cap_button.CapButton(port="COM10")  # Commented out for testing - no hardware needed

# ---------------------------
# Models
# ---------------------------
class AudioClip(db.Model):
    __tablename__ = 'audio_clips'
    id = db.Column(db.Integer, primary_key=True)
    speaker = db.Column(db.String(8), nullable=True)         # 'A' or 'B' (optional)
    path = db.Column(db.String(512), nullable=False)         # local filesystem path
    mime = db.Column(db.String(64), default='audio/wav')
    start_ts = db.Column(db.Float, nullable=True)
    end_ts = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.Float, default=time.time)

class FactCheck(db.Model):
    __tablename__ = 'factchecks'
    id = db.Column(db.Integer, primary_key=True)
    quote = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text, default='')                 # optional surrounding text
    verdict = db.Column(db.String(32), default='pending')    # pending|true|false|needs_context|mixed
    rationale = db.Column(db.Text, default='')
    sources_json = db.Column(db.Text, default='[]')          # list[str] or list[{title,url}]
    created_at = db.Column(db.Float, default=time.time)

# ---------------------------
# Health
# ---------------------------
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'ok': True})

# ---------------------------
# Launching frontend
# ---------------------------
def launch_frontend():
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    subprocess.run(["npm", "start"], cwd=frontend_dir)


# ---------------------------
# Audio endpoints
# ---------------------------
@app.route('/api/audio', methods=['POST'])
def upload_audio():
    """Two modes:
    1) multipart/form-data with a file field named 'file' (and optional speaker,start_ts,end_ts)
    2) JSON with {'path': '/abs/or/relative.wav', 'speaker': 'A', 'start_ts': ..., 'end_ts': ...}
    """
    if request.content_type and 'multipart/form-data' in request.content_type:
        if 'file' not in request.files:
            return jsonify({'error': 'missing file field'}), 400
        f = request.files['file']
        speaker = request.form.get('speaker')
        start_ts = float(request.form['start_ts']) if 'start_ts' in request.form else None
        end_ts = float(request.form['end_ts']) if 'end_ts' in request.form else None

        # Save
        filename = secure_filename(f.filename or f"clip_{int(time.time()*1000)}.wav")
        out_path = UPLOAD_DIR / filename
        f.save(out_path)
        clip = AudioClip(speaker=speaker, path=str(out_path), start_ts=start_ts, end_ts=end_ts, mime=f.mimetype or 'audio/wav')
        db.session.add(clip)
        db.session.commit()
        return jsonify({'id': clip.id, 'path': clip.path})

    # JSON mode (metadata-only)
    data = request.get_json(force=True, silent=True) or {}
    path = data.get('path')
    if not path:
        return jsonify({'error': 'provide file via multipart or a path in JSON'}), 400
    clip = AudioClip(
        speaker=data.get('speaker'),
        path=path,
        start_ts=data.get('start_ts'),
        end_ts=data.get('end_ts'),
        mime=data.get('mime', 'audio/wav')
    )
    db.session.add(clip)
    db.session.commit()
    return jsonify({'id': clip.id, 'path': clip.path})

@app.route('/api/audio', methods=['GET'])
def list_audio():
    limit = int(request.args.get('limit', 50))
    rows = (AudioClip.query.order_by(AudioClip.created_at.desc()).limit(limit).all())
    return jsonify([
        {
            'id': r.id,
            'speaker': r.speaker,
            'path': r.path,
            'mime': r.mime,
            'start_ts': r.start_ts,
            'end_ts': r.end_ts,
            'created_at': r.created_at,
        } for r in rows
    ])

# ---------------------------
# Fact-check endpoint (Gemini stub)
# ---------------------------
@app.route('/api/factcheck', methods=['POST'])
def factcheck():
    data = request.get_json(force=True)
    quote = (data.get('quote') or '').strip()
    context = (data.get('context') or '').strip()
    if not quote:
        return jsonify({'error': 'quote is required'}), 400

    # Persist initial record (pending)
    fc = FactCheck(quote=quote, context=context, verdict='pending')
    db.session.add(fc)
    db.session.commit()

    # Call Gemini (stubbed here)
    result = call_gemini_factcheck(quote, context)

    fc.verdict = result['verdict']
    fc.rationale = result['rationale']
    fc.sources_json = json.dumps(result.get('sources', []))
    db.session.commit()

    return jsonify({
        'id': fc.id,
        'quote': fc.quote,
        'verdict': fc.verdict,
        'rationale': fc.rationale,
        'sources': json.loads(fc.sources_json),
        'created_at': fc.created_at,
    })

# ---------------------------
# Gemini integration — replace with real API calls
# ---------------------------

def call_gemini_factcheck(quote: str, context: str):
    """Swap this stub with Google Gemini API + (optional) small web search stage.
    Keep outputs short and include 1–3 sources.
    """
    # Heuristic placeholder so your frontend has something to render
    verdict = 'true' if len(quote) % 2 == 0 else 'needs_context'
    return {
        'verdict': verdict,
        'rationale': 'Stub: integrate Gemini here to verify the claim and summarize why.',
        'sources': [
            {'title': 'Example Source', 'url': 'https://example.com'}
        ]
    }

# ---------------------------
# CLI
# ---------------------------
@app.cli.command('init-db')
def init_db_cmd():
    db.create_all()
    print('Database initialized.')


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


#---------------------------
# Arduino Endpoints - COMMENTED OUT FOR TESTING
#---------------------------
# @app.get("/api/blinker/<int:player>/<int:command>")
# def api_blinker(player: int, command: int):
#     try:
#         btn.send_command(player, command)
#         return jsonify(ok=True, player=player, command=command)
#     except Exception as e:
#         return jsonify(ok=False, error=str(e)), 500
    

# Launching frontend
def launch_frontend():
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    subprocess.run(["npm", "run", "dev"], cwd=frontend_dir)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    threading.Thread(target=launch_frontend, daemon=True).start()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
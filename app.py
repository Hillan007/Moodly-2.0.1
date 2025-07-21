#!/usr/bin/env python3
"""
Moodly Mental Health API Server - Production Version
A Flask API backend that serves both API and React frontend
"""

import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
import requests
import json

app = Flask(__name__, static_folder='dist', static_url_path='/')

# Railway-specific configuration
PORT = int(os.environ.get('PORT', 3000))
SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', secrets.token_hex(32))
app.config['SECRET_KEY'] = SECRET_KEY

# Configure CORS for Railway
CORS(app, origins=[
    "https://*.railway.app",
    "https://*.up.railway.app", 
    "http://localhost:3000",
    "http://localhost:5173"
])

# Health check endpoint for Railway
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200

# Database initialization
def init_db():
    """Initialize database with required tables"""
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mood_streak INTEGER DEFAULT 0,
        last_mood_date DATE
    )
    ''')
    
    # Mood entries table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mood INTEGER NOT NULL,
        energy INTEGER NOT NULL,
        anxiety INTEGER NOT NULL,
        sleep REAL NOT NULL,
        notes TEXT,
        activities TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Journal entries table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        mood INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Your existing routes go here...
# (Keep all your existing Flask routes)

# Serve React app
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print(f"🚀 Starting Moodly on port {PORT}")
    print(f"🌍 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'development')}")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=os.environ.get('RAILWAY_ENVIRONMENT') != 'production'
    )

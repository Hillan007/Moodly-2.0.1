#!/usr/bin/env python3
"""
Moodly Mental Health API Server - Production Version
A Flask API backend that serves both API and React frontend
"""

import os
from flask import Flask, send_from_directory, jsonify, render_template_string
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='dist', static_url_path='/')

# Railway configuration
PORT = int(os.environ.get('PORT', 8080))  # Railway uses 8080
SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'dcc11d2e93bbd856628b97b61f5029c98b7974a6fcb2fa97b3c21b5d91b6d7d5')
app.config['SECRET_KEY'] = SECRET_KEY

# Configure CORS for Railway
CORS(app, origins=[
    "https://*.railway.app",
    "https://*.up.railway.app",
    "http://localhost:3000",
    "http://localhost:5173"
])

# Health check for Railway
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'moodly-api',
        'version': '1.0.0',
        'static_folder_exists': os.path.exists('dist'),
        'static_files': os.listdir('dist') if os.path.exists('dist') else []
    }), 200

# Database initialization
def init_db():
    """Initialize SQLite database"""
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
        content TEXT,
        mood INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# Temporary index page if dist folder doesn't exist
TEMP_INDEX = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moodly - Loading</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f8ff; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .loading { color: #4a90e2; }
        .error { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 Moodly</h1>
        <div class="status">
            <h2 class="loading">Application is Starting...</h2>
            <p>The React frontend is being built. This may take a few minutes.</p>
            <p><strong>Backend Status:</strong> ✅ Running</p>
            <p><strong>Database:</strong> ✅ Initialized</p>
            <p><strong>API Health:</strong> <a href="/api/health">Check Here</a></p>
        </div>
    </div>
</body>
</html>
"""

# API Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    return jsonify({'message': 'Registration endpoint - implement your logic here'}), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({'message': 'Login endpoint - implement your logic here'}), 200

# Serve React app or temporary page
@app.route('/')
def serve_react_app():
    if os.path.exists('dist') and os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    else:
        return render_template_string(TEMP_INDEX)

@app.route('/<path:path>')
def serve_react_static(path):
    # Check if it's an API route
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # Try to serve static files
    if os.path.exists('dist') and os.path.exists(os.path.join('dist', path)):
        return send_from_directory('dist', path)
    else:
        # For SPA routing, serve index.html for non-API routes
        if os.path.exists('dist') and os.path.exists('dist/index.html'):
            return send_from_directory('dist', 'index.html')
        else:
            return render_template_string(TEMP_INDEX)

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    
    print(f"🚀 Starting Moodly on port {PORT}")
    print(f"📁 Static folder exists: {os.path.exists('dist')}")
    if os.path.exists('dist'):
        print(f"📄 Static files: {os.listdir('dist')}")
    print(f"🌍 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'development')}")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False
    )

web: python app.py
release: python -c "import sqlite3; conn = sqlite3.connect('moodly.db'); conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, mood_streak INTEGER DEFAULT 0, last_mood_date DATE)'); conn.commit(); conn.close()"

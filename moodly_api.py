#!/usr/bin/env python3
"""
Moodly Mental Health API Server
A clean Flask API backend for the React frontend
"""

import os
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta
from flask import Flask, request, session, jsonify
from flask_cors import CORS
from openai import OpenAI

# Initialize OpenAI
openai_api_key = os.environ.get('OPENAI_API_KEY')
openai_client = None
if openai_api_key:
    try:
        openai_client = OpenAI(api_key=openai_api_key)
        print("✅ OpenAI client initialized successfully!")
    except Exception as e:
        print(f"⚠️ OpenAI initialization failed: {e}")
        openai_client = None
else:
    print("⚠️ OpenAI API key not found - AI features will be disabled")

# Create Flask application instance
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'moodly-secret-key-change-in-production')

# Configure CORS to allow requests from React dev server
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3001", "http://localhost:8084", "http://localhost:3000", "http://localhost:5173"],
        "supports_credentials": True
    }
})

# Database configuration
DATABASE = 'moodly.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Mood entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mood_score INTEGER NOT NULL,
            energy_level INTEGER,
            anxiety_level INTEGER,
            sleep_quality INTEGER,
            notes TEXT,
            ai_insights TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Journal entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Goals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            priority TEXT DEFAULT 'medium',
            target_date DATE,
            is_completed BOOLEAN DEFAULT FALSE,
            progress INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

def hash_password(password):
    """Hash a password using SHA-256"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    try:
        salt, hash_value = password_hash.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == hash_value
    except ValueError:
        return False

def get_current_user():
    """Get the current logged-in user"""
    if 'user_id' not in session:
        return None
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE id = ?', (session['user_id'],)
    ).fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def get_fallback_insight(mood_data):
    """Generate intelligent fallback insights based on mood data patterns"""
    mood_score = mood_data.get('mood_score', 5)
    energy_level = mood_data.get('energy_level', 5)
    anxiety_level = mood_data.get('anxiety_level', 5)
    sleep_quality = mood_data.get('sleep_quality', 5)
    notes = mood_data.get('notes', '')
    
    # Analyze patterns and provide appropriate insights
    insights = []
    suggestions = []
    encouragement = []
    
    # Mood analysis
    if mood_score >= 8:
        insights.append("You're experiencing a positive mood today")
        encouragement.append("Keep nurturing this positive energy!")
    elif mood_score >= 6:
        insights.append("Your mood is in a stable, balanced range")
        suggestions.append("Consider what's working well for you and try to maintain these positive habits")
    elif mood_score >= 4:
        insights.append("Your mood seems a bit low today")
        suggestions.append("Try gentle activities like a short walk, listening to music, or connecting with a friend")
    else:
        insights.append("You're going through a challenging time")
        suggestions.append("Be gentle with yourself and consider reaching out for support if needed")
    
    # Energy analysis
    if energy_level <= 3:
        suggestions.append("Low energy detected - prioritize rest and gentle self-care activities")
    elif energy_level >= 8:
        insights.append("Your energy levels are high")
        
    # Anxiety analysis
    if anxiety_level >= 7:
        suggestions.append("High anxiety noted - try deep breathing exercises or mindfulness techniques")
    elif anxiety_level <= 3:
        insights.append("Your anxiety levels appear manageable today")
        
    # Sleep analysis
    if sleep_quality <= 3:
        suggestions.append("Poor sleep quality can impact mood - consider establishing a calming bedtime routine")
    elif sleep_quality >= 8:
        insights.append("Good sleep quality is supporting your overall well-being")
    
    # Notes analysis
    if notes and any(word in notes.lower() for word in ['stress', 'worried', 'anxious', 'overwhelmed']):
        suggestions.append("Consider breaking down overwhelming tasks into smaller, manageable steps")
    elif notes and any(word in notes.lower() for word in ['happy', 'good', 'great', 'excited', 'grateful']):
        encouragement.append("It's wonderful to see positive moments in your day!")
    
    # Default encouragement
    if not encouragement:
        encouragement = [
            "Remember that tracking your mood is a valuable step in understanding yourself better",
            "Every day is a new opportunity for growth and self-compassion",
            "You're taking positive steps by monitoring your mental health"
        ]
    
    # Combine insights
    result = ". ".join(insights[:2])
    if suggestions:
        result += ". " + suggestions[0]
    result += ". " + encouragement[0] + "."
    
    return result

def analyze_mood_with_ai(mood_data):
    """Analyze mood data using OpenAI GPT with intelligent fallbacks"""
    # Extract mood data for fallback use
    mood_score = mood_data.get('mood_score', 0)
    energy_level = mood_data.get('energy_level', 0)
    anxiety_level = mood_data.get('anxiety_level', 0)
    sleep_quality = mood_data.get('sleep_quality', 0)
    notes = mood_data.get('notes', '')
    
    # If OpenAI is not available, use fallback immediately
    if not openai_client:
        return get_fallback_insight(mood_data)
    
    try:
        prompt = f"""
        As a supportive mental health assistant, provide a brief, encouraging analysis of this mood data:
        
        Mood Score: {mood_score}/10
        Energy Level: {energy_level}/10
        Anxiety Level: {anxiety_level}/10
        Sleep Quality: {sleep_quality}/10
        Notes: {notes}
        
        Please provide:
        1. A gentle, supportive observation about their current state
        2. One practical suggestion for improvement
        3. A positive, encouraging message
        
        Keep response under 150 words and maintain a warm, professional tone.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a compassionate mental health assistant providing supportive insights."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI analysis error: {e}")
        # Use intelligent fallback instead of generic message
        return get_fallback_insight(mood_data)

# Initialize database
print("============================================================")
print(" MOODLY MENTAL HEALTH API")
print("============================================================")
print(" Initializing application...")
init_database()
print(" Database ready")

# API Routes
@app.route('/api/health')
def health_check():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'message': 'Moodly API is running',
        'version': '1.0.0',
        'ai_enabled': openai_client is not None
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email') 
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    conn = get_db_connection()
    
    # Check if user already exists
    existing_user = conn.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        (username, email)
    ).fetchone()
    
    if existing_user:
        conn.close()
        return jsonify({'error': 'Username or email already exists'}), 409
    
    # Create new user
    password_hash = hash_password(password)
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        (username, email, password_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Log in the user
    session['user_id'] = user_id
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user_id,
            'username': username,
            'email': email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        (username, username)
    ).fetchone()
    conn.close()
    
    if not user or not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session['user_id'] = user['id']
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'})

@app.route('/api/auth/me')
def get_user_info():
    """Get current user info"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    })

@app.route('/api/moods', methods=['GET', 'POST'])
def handle_moods():
    """Get or create mood entries"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        # Get mood entries for the user
        conn = get_db_connection()
        moods = conn.execute(
            'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            (user['id'],)
        ).fetchall()
        conn.close()
        
        return jsonify({
            'moods': [dict(mood) for mood in moods]
        })
    
    elif request.method == 'POST':
        # Create new mood entry
        data = request.get_json()
        mood_score = data.get('mood_score')
        energy_level = data.get('energy_level')
        anxiety_level = data.get('anxiety_level')
        sleep_quality = data.get('sleep_quality')
        notes = data.get('notes', '')
        
        if mood_score is None:
            return jsonify({'error': 'Mood score is required'}), 400
        
        # Generate AI insights
        ai_insights = analyze_mood_with_ai({
            'mood_score': mood_score,
            'energy_level': energy_level,
            'anxiety_level': anxiety_level,
            'sleep_quality': sleep_quality,
            'notes': notes
        })
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO mood_entries 
               (user_id, mood_score, energy_level, anxiety_level, sleep_quality, notes, ai_insights)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (user['id'], mood_score, energy_level, anxiety_level, sleep_quality, notes, ai_insights)
        )
        mood_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Mood entry created successfully',
            'mood': {
                'id': mood_id,
                'mood_score': mood_score,
                'energy_level': energy_level,
                'anxiety_level': anxiety_level,
                'sleep_quality': sleep_quality,
                'notes': notes,
                'ai_insights': ai_insights,
                'created_at': datetime.now().isoformat()
            }
        }), 201

@app.route('/api/journal', methods=['GET', 'POST'])
def handle_journal():
    """Get or create journal entries"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        conn = get_db_connection()
        entries = conn.execute(
            'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC',
            (user['id'],)
        ).fetchall()
        conn.close()
        
        return jsonify({
            'entries': [dict(entry) for entry in entries]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        tags = data.get('tags', '')
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO journal_entries (user_id, title, content, tags) VALUES (?, ?, ?, ?)',
            (user['id'], title, content, tags)
        )
        entry_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Journal entry created successfully',
            'entry': {
                'id': entry_id,
                'title': title,
                'content': content,
                'tags': tags,
                'created_at': datetime.now().isoformat()
            }
        }), 201

@app.route('/api/goals', methods=['GET', 'POST'])
def handle_goals():
    """Get or create goals"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        conn = get_db_connection()
        goals = conn.execute(
            'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
            (user['id'],)
        ).fetchall()
        conn.close()
        
        return jsonify({
            'goals': [dict(goal) for goal in goals]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        description = data.get('description', '')
        category = data.get('category', 'personal')
        priority = data.get('priority', 'medium')
        target_date = data.get('target_date')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO goals (user_id, title, description, category, priority, target_date)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (user['id'], title, description, category, priority, target_date)
        )
        goal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Goal created successfully',
            'goal': {
                'id': goal_id,
                'title': title,
                'description': description,
                'category': category,
                'priority': priority,
                'target_date': target_date,
                'progress': 0,
                'is_completed': False,
                'created_at': datetime.now().isoformat()
            }
        }), 201

@app.route('/api/analytics')
def get_analytics():
    """Get user analytics"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    conn = get_db_connection()
    
    # Get mood statistics
    mood_stats = conn.execute(
        '''SELECT 
           COUNT(*) as total_entries,
           AVG(mood_score) as avg_mood,
           AVG(energy_level) as avg_energy,
           AVG(anxiety_level) as avg_anxiety,
           AVG(sleep_quality) as avg_sleep
           FROM mood_entries WHERE user_id = ?''',
        (user['id'],)
    ).fetchone()
    
    # Get recent mood trends (last 30 days)
    thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
    recent_moods = conn.execute(
        'SELECT * FROM mood_entries WHERE user_id = ? AND created_at >= ? ORDER BY created_at',
        (user['id'], thirty_days_ago)
    ).fetchall()
    
    conn.close()
    
    return jsonify({
        'mood_stats': dict(mood_stats) if mood_stats else {},
        'recent_moods': [dict(mood) for mood in recent_moods],
        'total_journal_entries': len([]),  # Can be expanded
        'total_goals': len([])  # Can be expanded
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print(" Starting Flask development server...")
    print(f" Server will be available at: http://localhost:{port}")
    print(" Alternative URL: http://127.0.0.1:3001")
    print("============================================================")
    app.run(debug=False, host='0.0.0.0', port=port)

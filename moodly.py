# NUCLEAR PROTECTION - MUST BE FIRST LINE
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

print("☁️ Loading Cloudinary configuration from environment...")
print(f"✅ CLOUDINARY_CLOUD_NAME: {os.environ.get('CLOUDINARY_CLOUD_NAME', 'Not set')}")
print(f"✅ CLOUDINARY_API_KEY: {os.environ.get('CLOUDINARY_API_KEY', 'Not set')[:10]}...")

# FORCE SET ENVIRONMENT VARIABLES BEFORE ANY OTHER IMPORTS
print("☁️ FORCING CLOUDINARY ENVIRONMENT VARIABLES...")
# ✅ SECURE VERSION:
# Verify Cloudinary credentials are loaded from .env
cloudinary_cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
cloudinary_api_key = os.getenv('CLOUDINARY_API_KEY')
cloudinary_api_secret = os.getenv('CLOUDINARY_API_SECRET')

if not all([cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret]):
    print("⚠️ WARNING: Cloudinary credentials missing from .env file")
    print("Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file")
else:
    print("✅ Cloudinary credentials loaded from environment")  # Replace with your actual API secret
os.environ['FORCE_CLOUDINARY_ONLY'] = 'true'
os.environ['DISABLE_LOCAL_STORAGE'] = 'true'
os.environ['NUCLEAR_MODE'] = 'true'

# Verify they're set
print(f"✅ CLOUDINARY_CLOUD_NAME set: {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
print(f"✅ CLOUDINARY_API_KEY set: {os.environ.get('CLOUDINARY_API_KEY')[:10]}...")

# FORCE RELOAD CLOUDINARY STORAGE MODULE
print("🔄 FORCING CLOUDINARY STORAGE MODULE RELOAD...")
import importlib
if 'cloudinary_storage' in sys.modules:
    print("🔄 Reloading existing cloudinary_storage module...")
    importlib.reload(sys.modules['cloudinary_storage'])
else:
    print("📦 Loading cloudinary_storage module for first time...")

# Import Cloudinary storage
from cloudinary_storage import cloudinary_storage
print(f"🔍 Cloudinary storage after reload: {cloudinary_storage.is_enabled() if cloudinary_storage else 'None'}")

# NUCLEAR FILE SYSTEM PROTECTION
print("🚨 NUCLEAR FILE SYSTEM PROTECTION ACTIVE")
original_makedirs = os.makedirs
def nuclear_makedirs(path, *args, **kwargs):
    print(f"🚫 NUCLEAR: Blocked makedirs('{path}',)")
    return True

os.makedirs = nuclear_makedirs

# Continue with Flask imports
from flask import Flask, request, render_template, redirect, url_for, session, flash, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import sqlite3
import hashlib
import secrets
import json
import re
from werkzeug.security import generate_password_hash, check_password_hash
import openai
from pathlib import Path
from flask import send_from_directory

# Vercel compatibility
import os
import sys

# Detect Vercel environment
def is_vercel():
    return os.environ.get('VERCEL') == '1'

# Modify database path for Vercel
if is_vercel():
    # Use /tmp for SQLite database in serverless environment
    DATABASE_PATH = '/tmp/moodly.db'
    # Disable local file operations in serverless
    os.environ['DISABLE_LOCAL_STORAGE'] = 'true'
    os.environ['FORCE_CLOUDINARY_ONLY'] = 'true'
else:
    DATABASE_PATH = 'moodly.db'

# Initialize Flask app
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# File upload configuration for Cloudinary
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize upload directory (for temporary processing only)
UPLOAD_FOLDER = 'static/uploads/profiles'
try:
    Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
    print(f"✅ Created local upload directory: {UPLOAD_FOLDER}")
except Exception as e:
    print(f"⚠️ Could not create upload directory: {e}")

print(f"📂 LOCAL STORAGE: {UPLOAD_FOLDER}")
print(f"📂 FINAL upload folder: {UPLOAD_FOLDER}")

# Cloud storage initialization
print("☁️ INITIALIZING CLOUDINARY STORAGE...")
if cloudinary_storage and cloudinary_storage.is_enabled():
    print("✅ Cloudinary cloud storage active")
    STORAGE_TYPE = "Cloudinary"
    USE_CLOUD_STORAGE = True
else:
    print("⚠️ WARNING: Cloudinary not configured!")
    print("📋 Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment")
    STORAGE_TYPE = "DISABLED"
    USE_CLOUD_STORAGE = False

# Environment detection
def is_production():
    """Detect if running in production environment"""
    production_indicators = [
        os.environ.get('WEBSITE_SITE_NAME'),  # Azure App Service
        os.environ.get('DYNO'),               # Heroku
        os.environ.get('RAILWAY_ENVIRONMENT'), # Railway
        os.environ.get('VERCEL'),             # Vercel
        os.environ.get('NETLIFY'),            # Netlify
        os.environ.get('NODE_ENV') == 'production',
        os.environ.get('FLASK_ENV') == 'production'
    ]
    return any(production_indicators)

def is_serverless():
    """Detect if running in serverless environment"""
    serverless_indicators = [
        'LAMBDA_TASK_ROOT' in os.environ,    # AWS Lambda
        'FUNCTIONS_WORKER_RUNTIME' in os.environ,  # Azure Functions
        'VERCEL' in os.environ,              # Vercel
        'NETLIFY' in os.environ              # Netlify Functions
    ]
    return any(serverless_indicators)

# Print environment info
print(f"🔍 Environment: {'Production' if is_production() else 'Development'}")
print(f"📦 Storage: {STORAGE_TYPE}")
print(f"📁 Upload folder: {UPLOAD_FOLDER if not USE_CLOUD_STORAGE else 'Cloudinary Cloud'}")

# Initialize OpenAI
openai_api_key = os.environ.get('OPENAI_API_KEY')
if openai_api_key:
    openai.api_key = openai_api_key
    print("✅ OpenAI client initialized successfully!")
else:
    print("⚠️ OpenAI API key not found in environment variables")

# Storage configuration
print(f"📁 Using cloud storage: {USE_CLOUD_STORAGE}")
print(f"🚨 Production mode: {is_production()} | Serverless: {is_serverless()}")
print(f"✅ File uploads enabled: {USE_CLOUD_STORAGE}")
print(f"📦 Storage type: {'Cloudinary Cloud' if USE_CLOUD_STORAGE else 'Local/Temp'}")

# Database setup
# Add this to your database setup section in moodly_app.py
def update_database_schema():
    """Update database schema to add missing columns"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # Add bio column to users table if it doesn't exist
        cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT")
        print("Added bio column to users table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Bio column already exists")
        else:
            print(f"Error updating schema: {e}")
    
    conn.commit()
    conn.close()

# Call this function in your app initialization
update_database_schema()
def init_db():
    """Initialize the SQLite database with all required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Users table with profile picture support
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            profile_picture TEXT,
            cloudinary_id TEXT,
            bio TEXT,
            mood_streak INTEGER DEFAULT 0,
            last_mood_date DATE
        )
    ''')
    
    # Mood entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mood_score INTEGER NOT NULL,
            mood_description TEXT,
            entry_text TEXT,
            ai_insights TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tags TEXT,
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
            target_date DATE,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# File upload helpers for Cloudinary
def upload_profile_picture(file, user_id):
    """Upload profile picture to Cloudinary"""
    if not USE_CLOUD_STORAGE:
        return {'success': False, 'error': 'Cloud storage not available'}
    
    if file and allowed_file(file.filename):
        try:
            # Get file extension
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            
            # Upload to Cloudinary
            result = cloudinary_storage.upload_profile_picture(
                file_data=file,
                user_id=user_id,
                file_extension=file_extension
            )
            
            if result['success']:
                print(f"✅ Profile picture uploaded to Cloudinary: {result['public_url']}")
                return result
            else:
                print(f"❌ Cloudinary upload failed: {result['error']}")
                return result
                
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return {'success': False, 'error': str(e)}
    
    return {'success': False, 'error': 'Invalid file type'}

def get_profile_picture_url(user_id):
    """Get profile picture URL from Cloudinary"""
    if USE_CLOUD_STORAGE and cloudinary_storage:
        return cloudinary_storage.get_profile_picture_url(user_id)
    return None

def delete_profile_picture(user_id):
    """Delete profile picture from Cloudinary"""
    if USE_CLOUD_STORAGE and cloudinary_storage:
        return cloudinary_storage.delete_profile_picture(user_id)
    return {'success': False, 'error': 'Cloud storage not available'}

# Authentication helpers
def hash_password(password):
    """Hash password using werkzeug security"""
    return generate_password_hash(password)

def verify_password(password, password_hash):
    """Verify password against hash"""
    return check_password_hash(password_hash, password)

def get_current_user():
    """Get current user info from session"""
    if 'user_id' in session:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'created_at': user[4],
                'profile_picture': user[5],
                'cloudinary_id': user[6],
                'bio': user[7],
                'mood_streak': user[8],
                'last_mood_date': user[9]
            }
    return None

def get_mood_options():
    """Get standard mood options for templates"""
    return {
        'happy': {
            'emoji': '😊',
            'color': 'success',
            'title': 'Happy',
            'description': 'Feeling joyful and positive'
        },
        'sad': {
            'emoji': '😢',
            'color': 'info',
            'title': 'Sad',
            'description': 'Feeling down or melancholy'
        },
        'anxious': {
            'emoji': '😰',
            'color': 'warning',
            'title': 'Anxious',
            'description': 'Feeling worried or nervous'
        },
        'angry': {
            'emoji': '😠',
            'color': 'danger',
            'title': 'Angry',
            'description': 'Feeling frustrated or upset'
        },
        'stressed': {
            'emoji': '😵',
            'color': 'dark',
            'title': 'Stressed',
            'description': 'Feeling overwhelmed or pressured'
        },
        'calm': {
            'emoji': '😌',
            'color': 'primary',
            'title': 'Calm',
            'description': 'Feeling peaceful and relaxed'
        },
        'excited': {
            'emoji': '🤩',
            'color': 'warning',
            'title': 'Excited',
            'description': 'Feeling energetic and enthusiastic'
        },
        'confused': {
            'emoji': '😕',
            'color': 'secondary',
            'title': 'Confused',
            'description': 'Feeling uncertain or unclear'
        }
    }
def get_recent_moods(user_id):
    """Get recent mood entries for a user"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT mood_score, mood_description, entry_text, created_at
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    ''', (user_id,))
    recent_moods = cursor.fetchall()
    conn.close()
    
    # Format for template
    return [{
        'score': mood[0],
        'description': mood[1],
        'text': mood[2],
        'created_at': mood[3]
    } for mood in recent_moods]
# Mood analysis with OpenAI
def analyze_mood_with_ai(mood_text, mood_score):
    """Analyze mood entry using OpenAI GPT"""
    if not openai_api_key:
        return "AI analysis not available - OpenAI API key not configured."
    
    try:
        prompt = f"""
        Analyze this mood entry and provide supportive insights:
        
        Mood Score: {mood_score}/10
        Entry: {mood_text}
        
        Please provide:
        1. A brief, empathetic reflection on their mood
        2. One practical suggestion for improving their wellbeing
        3. A positive affirmation
        
        Keep the response under 150 words and maintain a supportive, professional tone.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a compassionate AI wellness assistant helping people understand their emotions and improve their mental health."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"❌ OpenAI analysis error: {e}")
        return f"AI analysis temporarily unavailable. Your mood entry has been saved successfully."

# Routes
# Add these routes before the "if __name__ == '__main__':" section

@app.route('/profile')
def profile():
    """User profile page"""
    user = get_current_user()
    if not user:
        flash('Please log in to view your profile', 'warning')
        return redirect(url_for('login'))
    
    return render_template('profile.html', user=user)

@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    """Edit user profile"""
    user = get_current_user()
    if not user:
        flash('Please log in to edit your profile', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        # Handle profile updates here
        username = request.form.get('username', user['username'])
        email = request.form.get('email', user['email'])
        
        # Update user in database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE users 
            SET username = ?, email = ? 
            WHERE id = ?
        ''', (username, email, user['id']))
        conn.commit()
        conn.close()
        
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    return render_template('edit_profile.html', user=user)

@app.route('/terms')
def terms():
    """Terms of service page"""
    return render_template('terms.html')



@app.route('/log_mood', methods=['GET', 'POST'])
def log_mood():
    """Log mood entry page"""
    user = get_current_user()
    if not user:
        flash('Please log in to log your mood', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        mood_score = request.form.get('mood_score')
        mood_description = request.form.get('mood_description')
        entry_text = request.form.get('entry_text')
        
        # Save mood entry to database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO mood_entries (user_id, mood_score, mood_description, entry_text, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        ''', (user['id'], mood_score, mood_description, entry_text))
        conn.commit()
        conn.close()
        
        flash('Mood logged successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    # Get mood from URL parameter if provided
    selected_mood = request.args.get('mood', 'neutral')
    moods = get_mood_options()
    
    return render_template('log_mood.html', user=user, moods=moods, selected_mood=selected_mood)

@app.route('/mood_entry', methods=['GET', 'POST'])
def mood_entry():
    """Alias for log_mood (alternative route name)"""
    return log_mood()

@app.route('/mood_analytics')
def mood_analytics():
    """Mood analytics page"""
    user = get_current_user()
    if not user:
        flash('Please log in to view mood analytics', 'warning')
        return redirect(url_for('login'))
    
    # Get mood data for charts
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT mood_score, COUNT(*) as count
        FROM mood_entries 
        WHERE user_id = ? 
        GROUP BY mood_score
    ''', (user['id'],))
    mood_data = cursor.fetchall()
    conn.close()
    
    return render_template('mood_analytics.html', user=user, mood_data=mood_data)



@app.route('/mood_tracker')
def mood_tracker():
    """Mood tracking analytics page"""
    user = get_current_user()
    if not user:
        flash('Please log in to view your mood tracker', 'warning')
        return redirect(url_for('login'))
    
    # Get mood data for charts
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT mood_score, mood_description, created_at
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 30
    ''', (user['id'],))
    mood_data = cursor.fetchall()
    conn.close()
    
    return render_template('mood_tracker.html', user=user, mood_data=mood_data)
@app.route('/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('privacy.html')
@app.route('/')
def index():
    """Home page"""
    user = get_current_user()
    moods = get_mood_options()
    return render_template('index.html', user=user, moods=moods)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Validate input
        if not username or not email or not password:
            flash('All fields are required', 'error')
            return render_template('register.html')
        
        # Check if user exists
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            flash('Username or email already exists', 'error')
            conn.close()
            return render_template('auth/signup.html')

        # Create user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Log user in
        session['user_id'] = user_id
        flash('Registration successful! Welcome to Moodly!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT id, password_hash FROM users WHERE username = ? OR email = ?', (username, username))
        user = cursor.fetchone()
        conn.close()
        
        if user and verify_password(password, user[1]):
            session['user_id'] = user[0]
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')

    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    """Dashboard page"""
    user = get_current_user()
    if not user:
        flash('You must be logged in to access the dashboard', 'warning')
        return redirect(url_for('login'))
    
    # Get mood options
    moods = get_mood_options()
    
    # Get recent mood entries
    recent_moods = get_recent_moods(user['id'])
    
    return render_template('dashboard.html', 
                         user=user, 
                         moods=moods, 
                         recent_moods=recent_moods)
    
    # Get recent mood entries using raw SQLite queries
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT mood_score, mood_description, entry_text, created_at
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    ''', (user['id'],))
    recent_moods = cursor.fetchall()
    conn.close()
   
    
    # Convert recent moods to a more usable format

    return render_template('dashboard.html', user=user, moods=moods, recent_moods=recent_moods)

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    """User profile management"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        # Handle profile update
        bio = request.form.get('bio', '')
        
        # Handle profile picture upload
        profile_picture_url = user.get('profile_picture')
        cloudinary_id = user.get('cloudinary_id')
        
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                # Delete old profile picture from Cloudinary
                if cloudinary_id:
                    delete_result = delete_profile_picture(user['id'])
                    print(f"🗑️ Delete old profile picture result: {delete_result}")
                
                # Upload new profile picture to Cloudinary
                upload_result = upload_profile_picture(file, user['id'])
                if upload_result['success']:
                    profile_picture_url = upload_result['public_url']
                    cloudinary_id = upload_result.get('cloudinary_id')
                    flash('Profile picture updated successfully!', 'success')
                else:
                    flash(f'Profile picture upload failed: {upload_result["error"]}', 'error')
        
        # Update database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE users 
            SET bio = ?, profile_picture = ?, cloudinary_id = ?
            WHERE id = ?
        ''', (bio, profile_picture_url, cloudinary_id, user['id']))
        conn.commit()
        conn.close()
        
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    # Get profile picture URL for display
    profile_picture_url = get_profile_picture_url(user['id'])
    user['profile_picture_url'] = profile_picture_url
    
    return render_template('profile.html', user=user)

@app.route('/mood', methods=['GET', 'POST'])
def mood_entry():
    """Mood entry form"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        mood_score = request.form['mood_score']
        mood_description = request.form['mood_description']
        entry_text = request.form['entry_text']
        tags = request.form.get('tags', '')
        
        # Get AI insights
        ai_insights = analyze_mood_with_ai(entry_text, mood_score)
        
        # Save mood entry
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO mood_entries (user_id, mood_score, mood_description, entry_text, tags, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user['id'], mood_score, mood_description, entry_text, tags, datetime.now()))
        
        # Reset streak
        cursor.execute('UPDATE users SET mood_streak = 1, last_mood_date = ? WHERE id = ?', 
                       (today, user['id']))
        
        else:
            # First mood entry
 Cursor.execute('UPDATE users SET mood_streak = 1, last_mood_date = ? WHERE id = ?',  # type: ignore
                         (today, user['id']))
        
        conn.commit()
        conn.close()
        
        flash('Mood entry saved successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('mood_entry.html', user=user)

@app.route('/goals', methods=['GET', 'POST'])
def goals():
    """Goals management"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        target_date = request.form['target_date']
        
        conn = sqlite3.connect('moodly.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO goals (user_id, title, description, target_date)
            VALUES (?, ?, ?, ?)
        ''', (user['id'], title, description, target_date))
        conn.commit()
        conn.close()
        
        flash('Goal added successfully!', 'success')
        return redirect(url_for('goals'))
    
    # Get all goals
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, title, description, target_date, completed, created_at
        FROM goals 
        WHERE user_id = ? 
        ORDER BY target_date ASC
    ''', (user['id'],))
    user_goals = cursor.fetchall()
    conn.close()
    
    return render_template('goals.html', user=user, goals=user_goals)

@app.route('/complete_goal/<int:goal_id>')
def complete_goal(goal_id):
    """Mark goal as completed"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE goals SET completed = TRUE WHERE id = ? AND user_id = ?', (goal_id, user['id']))
    conn.commit()
    conn.close()
    
    flash('Goal marked as completed! 🎉', 'success')
    return redirect(url_for('goals'))

@app.route('/analytics')
def analytics():
    """Mood analytics and insights"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    
    # Get mood data for charts
    cursor.execute('''
        SELECT mood_score, DATE(created_at) as date
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 30
    ''', (user['id'],))
    mood_data = cursor.fetchall()
    
    # Get mood statistics
    cursor.execute('''
        SELECT 
            AVG(mood_score) as avg_mood,
            MAX(mood_score) as max_mood,
            MIN(mood_score) as min_mood,
            COUNT(*) as total_entries
        FROM mood_entries 
        WHERE user_id = ?
    ''', (user['id'],))
    stats = cursor.fetchone()
    
    conn.close()
    
    return render_template('analytics.html', 
                         user=user, 
                         mood_data=mood_data, 
                         stats=stats)

@app.route('/api/storage-status')
def storage_status():
    """API endpoint to check storage status"""
    status = {
        'storage_type': STORAGE_TYPE,
        'cloud_enabled': USE_CLOUD_STORAGE,
        'upload_enabled': USE_CLOUD_STORAGE
    }
    
    if USE_CLOUD_STORAGE and cloudinary_storage:
        stats = cloudinary_storage.get_storage_stats()
        if stats:
            status['storage_stats'] = stats
    
    return jsonify(status)

@app.errorhandler(413)
def too_large(e):
    flash('File too large. Please choose a file smaller than 16MB.', 'error')
    return redirect(request.url)

@app.errorhandler(500)
def internal_error(error):
    flash('An internal error occurred. Please try again.', 'error')
    return redirect(url_for('dashboard'))

@app.route('/journal_templates')
def journal_templates():
    """Journal templates page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Sample journal templates for mood tracking
    templates = [
        {
            'id': 1,
            'title': 'Daily Reflection',
            'description': 'Reflect on your day and emotions',
            'icon': 'fas fa-sun',
            'prompts': [
                'How did I feel today overall?',
                'What was the highlight of my day?',
                'What challenged me today?',
                'What am I grateful for right now?',
                'How can I make tomorrow better?'
            ]
        },
        {
            'id': 2,
            'title': 'Mood Tracker',
            'description': 'Track your mood patterns and triggers',
            'icon': 'fas fa-heart',
            'prompts': [
                'Rate your overall mood (1-10)',
                'What influenced your mood today?',
                'What activities made you feel better?',
                'Any mood triggers to note?',
                'What patterns do I notice?'
            ]
        },
        {
            'id': 3,
            'title': 'Anxiety Check-in',
            'description': 'Process anxious thoughts and feelings',
            'icon': 'fas fa-brain',
            'prompts': [
                'What am I feeling anxious about?',
                'Are these worries realistic?',
                'What can I control vs. what can\'t I control?',
                'What would help me feel calmer?',
                'What coping strategies can I use?'
            ]
        },
        {
            'id': 4,
            'title': 'Gratitude Journal',
            'description': 'Focus on positive aspects of life',
            'icon': 'fas fa-star',
            'prompts': [
                'Three things I\'m grateful for today',
                'Someone who made my day better',
                'A small joy I experienced',
                'Something I accomplished',
                'A positive change I\'ve noticed'
            ]
        },
        {
            'id': 5,
            'title': 'Goal Progress',
            'description': 'Track progress toward your goals',
            'icon': 'fas fa-target',
            'prompts': [
                'What progress did I make today?',
                'What obstacles did I encounter?',
                'What will I do differently tomorrow?',
                'How do I feel about my progress?',
                'What support do I need?'
            ]
        },
        {
            'id': 6,
            'title': 'Stress Release',
            'description': 'Process and release stress',
            'icon': 'fas fa-leaf',
            'prompts': [
                'What is causing me stress right now?',
                'How is this stress affecting me?',
                'What can I do to reduce this stress?',
                'What relaxation techniques help me?',
                'How can I prevent this stress in the future?'
            ]
        }
    ]
    
    return render_template('journal_templates.html', user=user, templates=templates)

@app.route('/journal_template/<int:template_id>')
def use_journal_template(template_id):
    """Use a specific journal template for mood entry"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Template data for pre-filling the mood entry form
    template_data = {
        1: {'title': 'Daily Reflection', 'prompts': 'How did I feel today overall?\nWhat was the highlight of my day?\nWhat challenged me today?\nWhat am I grateful for right now?'},
        2: {'title': 'Mood Tracker', 'prompts': 'Rate your overall mood (1-10):\nWhat influenced your mood today?\nWhat activities made you feel better?\nAny mood triggers to note?'},
        3: {'title': 'Anxiety Check-in', 'prompts': 'What am I feeling anxious about?\nAre these worries realistic?\nWhat can I control vs. what can\'t I control?\nWhat would help me feel calmer?'},
        4: {'title': 'Gratitude Journal', 'prompts': 'Three things I\'m grateful for today:\n1.\n2.\n3.\n\nSomeone who made my day better:\nA small joy I experienced:'},
        5: {'title': 'Goal Progress', 'prompts': 'What progress did I make today?\nWhat obstacles did I encounter?\nWhat will I do differently tomorrow?\nHow do I feel about my progress?'},
        6: {'title': 'Stress Release', 'prompts': 'What is causing me stress right now?\nHow is this stress affecting me?\nWhat can I do to reduce this stress?\nWhat relaxation techniques help me?'}
    }
    
    template = template_data.get(template_id)
    if template:
        return render_template('mood_entry.html', user=user, template=template)
    else:
        flash('Template not found', 'error')
        return redirect(url_for('journal_templates'))

@app.route('/mood_tracker')
def mood_tracker():
    """Mood tracking dashboard with charts and analytics"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    
    # Get recent mood entries for the tracker
    cursor.execute('''
        SELECT mood_score, mood_description, DATE(created_at) as date, created_at
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 30
    ''', (user['id'],))
    recent_moods = cursor.fetchall()
    
    # Get mood statistics
    cursor.execute('''
        SELECT 
            AVG(CAST(mood_score AS FLOAT)) as avg_mood,
            MAX(mood_score) as max_mood,
            MIN(mood_score) as min_mood,
            COUNT(*) as total_entries
        FROM mood_entries 
        WHERE user_id = ?
    ''', (user['id'],))
    stats = cursor.fetchone()
    
    # Get mood trends for the last 7 days
    cursor.execute('''
        SELECT 
            DATE(created_at) as date,
            AVG(CAST(mood_score AS FLOAT)) as avg_score,
            COUNT(*) as entry_count
        FROM mood_entries 
        WHERE user_id = ? 
        AND created_at >= date('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    ''', (user['id'],))
    weekly_trends = cursor.fetchall()
    
    # Get mood distribution
    cursor.execute('''
        SELECT 
            mood_score,
            COUNT(*) as count
        FROM mood_entries 
        WHERE user_id = ?
        GROUP BY mood_score
        ORDER BY mood_score
    ''', (user['id'],))
    mood_distribution = cursor.fetchall()
    
    conn.close()
    
    return render_template('mood_tracker.html', 
                         user=user, 
                         recent_moods=recent_moods,
                         stats=stats,
                         weekly_trends=weekly_trends,
                         mood_distribution=mood_distribution)

@app.route('/wellness')
def wellness():
    """Wellness resources and tips"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Wellness resources
    wellness_tips = [
        {
            'category': 'Mindfulness',
            'icon': 'fas fa-leaf',
            'tips': [
                'Practice 5-minute daily meditation',
                'Try deep breathing exercises',
                'Focus on the present moment',
                'Use mindfulness apps for guidance'
            ]
        },
        {
            'category': 'Physical Health',
            'icon': 'fas fa-heartbeat',
            'tips': [
                'Get 7-9 hours of quality sleep',
                'Exercise for 30 minutes daily',
                'Eat nutritious, balanced meals',
                'Stay hydrated throughout the day'
            ]
        },
        {
            'category': 'Social Connection',
            'icon': 'fas fa-users',
            'tips': [
                'Reach out to friends and family',
                'Join community groups or clubs',
                'Practice active listening',
                'Express gratitude to others'
            ]
        },
        {
            'category': 'Stress Management',
            'icon': 'fas fa-spa',
            'tips': [
                'Identify your stress triggers',
                'Practice relaxation techniques',
                'Set healthy boundaries',
                'Take regular breaks from work'
            ]
        }
    ]
    
    return render_template('wellness.html', user=user, wellness_tips=wellness_tips)

@app.route('/insights')
def insights():
    """AI-powered insights page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # For now, redirect to analytics
    return redirect(url_for('analytics'))

@app.route('/settings')
def settings():
    """User settings page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # For now, redirect to profile
    return redirect(url_for('profile'))

@app.route('/resources')
def resources():
    """Mental health resources"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # For now, redirect to wellness
    return redirect(url_for('wellness'))

@app.route('/achievements')
def achievements_page():
    """User achievements and milestones page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    
    # Get user statistics for achievements
    cursor.execute('''
        SELECT 
            COUNT(*) as total_entries,
            AVG(CAST(mood_score AS FLOAT)) as avg_mood,
            MAX(mood_score) as best_mood,
            MIN(created_at) as first_entry
        FROM mood_entries 
        WHERE user_id = ?
    ''', (user['id'],))
    mood_stats = cursor.fetchone()
    
    # Get goals statistics
    cursor.execute('''
        SELECT 
            COUNT(*) as total_goals,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_goals
        FROM goals 
        WHERE user_id = ?
    ''', (user['id'],))
    goal_stats = cursor.fetchone()
    
    # Get current mood streak
    current_streak = user.get('mood_streak', 0)
    
    conn.close()
    
    # Calculate achievements
    achievements = []
    
    # Mood tracking achievements
    if mood_stats[0] >= 1:
        achievements.append({
            'title': 'First Step',
            'description': 'Logged your first mood entry',
            'icon': 'fas fa-baby',
            'earned': True,
            'date_earned': mood_stats[3] if mood_stats[3] else None
        })
    
    if mood_stats[0] >= 7:
        achievements.append({
            'title': 'Week Warrior',
            'description': 'Logged mood entries for 7 days',
            'icon': 'fas fa-calendar-week',
            'earned': True,
            'progress': mood_stats[0],
            'target': 7
        })
    
    if mood_stats[0] >= 30:
        achievements.append({
            'title': 'Monthly Master',
            'description': 'Logged mood entries for 30 days',
            'icon': 'fas fa-calendar-alt',
            'earned': True,
            'progress': mood_stats[0],
            'target': 30
        })
    
    if mood_stats[0] >= 100:
        achievements.append({
            'title': 'Century Club',
            'description': 'Logged 100 mood entries',
            'icon': 'fas fa-trophy',
            'earned': True,
            'progress': mood_stats[0],
            'target': 100
        })
    
    # Mood streak achievements
    if current_streak >= 3:
        achievements.append({
            'title': 'Streak Starter',
            'description': 'Maintained a 3-day mood tracking streak',
            'icon': 'fas fa-fire',
            'earned': True,
            'progress': current_streak,
            'target': 3
        })
    
    if current_streak >= 7:
        achievements.append({
            'title': 'Streak Master',
            'description': 'Maintained a 7-day mood tracking streak',
            'icon': 'fas fa-medal',
            'earned': True,
            'progress': current_streak,
            'target': 7
        })
    
    if current_streak >= 30:
        achievements.append({
            'title': 'Consistency Champion',
            'description': 'Maintained a 30-day mood tracking streak',
            'icon': 'fas fa-crown',
            'earned': True,
            'progress': current_streak,
            'target': 30
        })
    
    # Goal achievements
    if goal_stats[1] >= 1:
        achievements.append({
            'title': 'Goal Getter',
            'description': 'Completed your first goal',
            'icon': 'fas fa-target',
            'earned': True,
            'progress': goal_stats[1],
            'target': 1
        })
    
    if goal_stats[1] >= 5:
        achievements.append({
            'title': 'Achievement Unlocked',
            'description': 'Completed 5 goals',
            'icon': 'fas fa-star',
            'earned': True,
            'progress': goal_stats[1],
            'target': 5
        })
    
    # Mood quality achievements
    if mood_stats[1] and mood_stats[1] >= 8.0:
        achievements.append({
            'title': 'Positive Vibes',
            'description': 'Maintained an average mood of 8+',
            'icon': 'fas fa-smile',
            'earned': True,
            'progress': round(mood_stats[1], 1),
            'target': 8.0
        })
    
    # Add upcoming achievements (not yet earned)
    upcoming_achievements = []
    
    if mood_stats[0] < 7:
        upcoming_achievements.append({
            'title': 'Week Warrior',
            'description': 'Log mood entries for 7 days',
            'icon': 'fas fa-calendar-week',
            'earned': False,
            'progress': mood_stats[0],
            'target': 7
        })
    
    if mood_stats[0] < 30:
        upcoming_achievements.append({
            'title': 'Monthly Master',
            'description': 'Log mood entries for 30 days',
            'icon': 'fas fa-calendar-alt',
            'earned': False,
            'progress': mood_stats[0],
            'target': 30
        })
    
    if current_streak < 7:
        upcoming_achievements.append({
            'title': 'Streak Master',
            'description': 'Maintain a 7-day mood tracking streak',
            'icon': 'fas fa-medal',
            'earned': False,
            'progress': current_streak,
            'target': 7
        })
    
    if goal_stats[1] < 1:
        upcoming_achievements.append({
            'title': 'Goal Getter',
            'description': 'Complete your first goal',
            'icon': 'fas fa-target',
            'earned': False,
            'progress': goal_stats[1],
            'target': 1
        })
    
    return render_template('achievements.html', 
                         user=user, 
                         achievements=achievements,
                         upcoming_achievements=upcoming_achievements,
                         mood_stats=mood_stats,
                         goal_stats=goal_stats,
                         current_streak=current_streak)

@app.route('/wellness_hub')
def wellness_hub():
    """Comprehensive wellness hub with resources and tools"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Wellness categories with resources
    wellness_categories = [
        {
            'title': 'Mental Health Resources',
            'icon': 'fas fa-brain',
            'color': 'primary',
            'resources': [
                {
                    'title': 'Crisis Support',
                    'description': 'Immediate help when you need it most',
                    'links': [
                        {'text': 'National Suicide Prevention Lifeline', 'url': 'tel:988'},
                        {'text': 'Crisis Text Line', 'url': 'sms:741741'},
                        {'text': 'SAMHSA National Helpline', 'url': 'tel:1-800-662-4357'}
                    ]
                },
                {
                    'title': 'Professional Help',
                    'description': 'Find qualified mental health professionals',
                    'links': [
                        {'text': 'Psychology Today Therapist Finder', 'url': 'https://www.psychologytoday.com/us/therapists'},
                        {'text': 'BetterHelp Online Therapy', 'url': 'https://www.betterhelp.com'},
                        {'text': 'National Alliance on Mental Illness', 'url': 'https://www.nami.org'}
                    ]
                }
            ]
        },
        {
            'title': 'Mindfulness & Meditation',
            'icon': 'fas fa-leaf',
            'color': 'success',
            'resources': [
                {
                    'title': 'Guided Meditation Apps',
                    'description': 'Apps to help you build a meditation practice',
                    'links': [
                        {'text': 'Headspace', 'url': 'https://www.headspace.com'},
                        {'text': 'Calm', 'url': 'https://www.calm.com'},
                        {'text': 'Insight Timer', 'url': 'https://insighttimer.com'}
                    ]
                },
                {
                    'title': 'Breathing Exercises',
                    'description': 'Simple techniques for immediate calm',
                    'links': [
                        {'text': '4-7-8 Breathing Technique', 'url': '#breathing-478'},
                        {'text': 'Box Breathing Method', 'url': '#breathing-box'},
                        {'text': 'Progressive Muscle Relaxation', 'url': '#pmr'}
                    ]
                }
            ]
        },
        {
            'title': 'Physical Wellness',
            'icon': 'fas fa-heartbeat',
            'color': 'danger',
            'resources': [
                {
                    'title': 'Exercise & Movement',
                    'description': 'Physical activity for mental health',
                    'links': [
                        {'text': 'Yoga for Beginners', 'url': 'https://www.yoga.com/beginners'},
                        {'text': 'Free Workout Videos', 'url': 'https://www.fitnessblender.com'},
                        {'text': 'Walking for Mental Health', 'url': '#walking-tips'}
                    ]
                },
                {
                    'title': 'Sleep Hygiene',
                    'description': 'Improve your sleep quality',
                    'links': [
                        {'text': 'Sleep Foundation Tips', 'url': 'https://www.sleepfoundation.org'},
                        {'text': 'Sleep Tracking Apps', 'url': '#sleep-apps'},
                        {'text': 'Bedtime Routine Guide', 'url': '#bedtime-routine'}
                    ]
                }
            ]
        },
        {
            'title': 'Social Support',
            'icon': 'fas fa-users',
            'color': 'info',
            'resources': [
                {
                    'title': 'Support Groups',
                    'description': 'Connect with others who understand',
                    'links': [
                        {'text': 'Mental Health America Groups', 'url': 'https://www.mhanational.org'},
                        {'text': 'NAMI Support Groups', 'url': 'https://www.nami.org/Support-Education'},
                        {'text': 'Online Communities', 'url': '#online-support'}
                    ]
                },
                {
                    'title': 'Building Connections',
                    'description': 'Tips for strengthening relationships',
                    'links': [
                        {'text': 'Communication Skills', 'url': '#communication'},
                        {'text': 'Setting Boundaries', 'url': '#boundaries'},
                        {'text': 'Social Anxiety Help', 'url': '#social-anxiety'}
                    ]
                }
            ]
        }
    ]
    
    # Quick wellness tools
    wellness_tools = [
        {
            'title': 'Mood Check-In',
            'description': 'Quick assessment of your current state',
            'icon': 'fas fa-clipboard-check',
            'action': url_for('mood_entry'),
            'color': 'primary'
        },
        {
            'title': 'Journal Templates',
            'description': 'Guided prompts for reflection',
            'icon': 'fas fa-journal-whills',
            'action': url_for('journal_templates'),
            'color': 'success'
        },
        {
            'title': 'Goal Setting',
            'description': 'Set and track wellness goals',
            'icon': 'fas fa-target',
            'action': url_for('goals'),
            'color': 'warning'
        },
        {
            'title': 'Progress Analytics',
            'description': 'View your wellness journey',
            'icon': 'fas fa-chart-line',
            'action': url_for('analytics'),
            'color': 'info'
        }
    ]
    
    return render_template('wellness_hub.html', 
                         user=user, 
                         wellness_categories=wellness_categories,
                         wellness_tools=wellness_tools)

# Add these routes before "if __name__ == '__main__':"

@app.route('/grounding_exercise')
def grounding_exercise():
    """Grounding exercise for anxiety relief"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    return render_template('grounding_exercise.html', user=user)

@app.route('/api/mood_data')
def api_mood_data():
    """API endpoint for mood data (for charts)"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = sqlite3.connect('moodly.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DATE(created_at) as date, AVG(CAST(mood_score AS FLOAT)) as avg_score
        FROM mood_entries 
        WHERE user_id = ? 
        AND created_at >= date('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    ''', (user['id'],))
    data = cursor.fetchall()
    conn.close()
    
    return jsonify([{'date': row[0], 'score': round(row[1], 1)} for row in data])

@app.route('/health')
def health_check():
    """Health check endpoint for deployment"""
    return jsonify({
        'status': 'healthy',
        'app': 'Moodly',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# Add missing import for send_from_directory if not already imported
from flask import send_from_directory

@app.route('/static/uploads/profiles/<filename>')
def uploaded_file(filename):
    """Serve uploaded profile pictures"""
    return send_from_directory(os.path.join(app.instance_path, 'uploads', 'profiles'), filename)

# Add this route before the "if __name__ == '__main__':" section

@app.route('/breathing_exercise')
@app.route('/breathing_exercise/<mood_key>')
def breathing_exercise(mood_key=None):
    """Interactive breathing exercises based on mood"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Define breathing exercises based on mood
    exercises = {
        'stressed': {
            'name': '4-7-8 Calming Breath',
            'description': 'Perfect for reducing stress and anxiety',
            'instructions': [
                'Sit comfortably with your back straight',
                'Place the tip of your tongue against your upper teeth',
                'Exhale completely through your mouth',
                'Close your mouth and inhale through your nose for 4 counts',
                'Hold your breath for 7 counts',
                'Exhale through your mouth for 8 counts',
                'Repeat 3-4 times'
            ],
            'pattern': '4-7-8',
            'duration': 4,
            'color': 'danger',
            'icon': 'fas fa-leaf'
        },
        'anxious': {
            'name': 'Box Breathing',
            'description': 'Helps calm anxiety and racing thoughts',
            'instructions': [
                'Sit or lie down comfortably',
                'Breathe out slowly to empty your lungs',
                'Breathe in through your nose for 4 counts',
                'Hold your breath for 4 counts',
                'Breathe out through your mouth for 4 counts',
                'Hold empty for 4 counts',
                'Repeat for 5-10 cycles'
            ],
            'pattern': '4-4-4-4',
            'duration': 5,
            'color': 'warning',
            'icon': 'fas fa-square'
        },
        'energetic': {
            'name': 'Energizing Breath',
            'description': 'Helps channel high energy positively',
            'instructions': [
                'Stand with feet shoulder-width apart',
                'Take a deep breath in through your nose',
                'Hold for 2 counts',
                'Exhale forcefully through your mouth',
                'Pause for 1 count',
                'Repeat 8-10 times',
                'Focus on releasing excess energy'
            ],
            'pattern': '4-2-4-1',
            'duration': 3,
            'color': 'success',
            'icon': 'fas fa-bolt'
        },
        'sad': {
            'name': 'Heart-Opening Breath',
            'description': 'Gentle breathing to lift your spirits',
            'instructions': [
                'Sit with your chest open and shoulders relaxed',
                'Place one hand on your heart',
                'Breathe in slowly for 5 counts, expanding your chest',
                'Hold gently for 3 counts',
                'Exhale slowly for 7 counts',
                'Imagine breathing in warmth and light',
                'Repeat 6-8 times'
            ],
            'pattern': '5-3-7',
            'duration': 6,
            'color': 'info',
            'icon': 'fas fa-heart'
        },
        'angry': {
            'name': 'Cooling Breath',
            'description': 'Helps cool down anger and frustration',
            'instructions': [
                'Sit comfortably with your spine straight',
                'Curl your tongue or purse your lips',
                'Inhale slowly through your curled tongue for 6 counts',
                'Close your mouth and hold for 2 counts',
                'Exhale slowly through your nose for 8 counts',
                'Feel the cooling sensation',
                'Repeat 5-7 times'
            ],
            'pattern': '6-2-8',
            'duration': 5,
            'color': 'primary',
            'icon': 'fas fa-snowflake'
        },
        'default': {
            'name': 'Basic Mindful Breathing',
            'description': 'Simple breathing for everyday mindfulness',
            'instructions': [
                'Find a comfortable position',
                'Close your eyes or soften your gaze',
                'Breathe naturally through your nose',
                'Count each breath: in-1, out-2, in-3, out-4',
                'When you reach 10, start over at 1',
                'If your mind wanders, gently return to counting',
                'Continue for 5-10 minutes'
            ],
            'pattern': 'Natural',
            'duration': 10,
            'color': 'secondary',
            'icon': 'fas fa-lungs'
        }
    }
    
    # Select exercise based on mood_key or default
    selected_exercise = exercises.get(mood_key, exercises['default'])
    
    return render_template('breathing_exercise.html', 
                         user=user, 
                         exercise=selected_exercise,
                         mood_key=mood_key,
                         all_exercises=exercises)

@app.route('/meditation')
def meditation():
    """Guided meditation page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Meditation sessions
    meditations = [
        {
            'title': 'Body Scan Relaxation',
            'duration': '10 minutes',
            'description': 'Release tension from head to toe',
            'difficulty': 'Beginner',
            'icon': 'fas fa-user',
            'color': 'primary'
        },
        {
            'title': 'Mindful Breathing',
            'duration': '5 minutes',
            'description': 'Focus on your breath to center yourself',
            'difficulty': 'Beginner',
            'icon': 'fas fa-lungs',
            'color': 'success'
        },
        {
            'title': 'Loving Kindness',
            'duration': '15 minutes',
            'description': 'Send love and compassion to yourself and others',
            'difficulty': 'Intermediate',
            'icon': 'fas fa-heart',
            'color': 'danger'
        },
        {
            'title': 'Anxiety Relief',
            'duration': '8 minutes',
            'description': 'Calm your mind and ease worry',
            'difficulty': 'Beginner',
            'icon': 'fas fa-leaf',
            'color': 'info'
        }
    ]
    
    return render_template('meditation.html', user=user, meditations=meditations)

@app.route('/coping_strategies')
@app.route('/coping_strategies/<mood_key>')
def coping_strategies_page(mood_key=None):
    """Coping strategies based on mood"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Define coping strategies for different moods
    coping_strategies = {
        'anxious': {
            'mood_title': 'Anxiety Relief',
            'color': 'warning',
            'icon': 'fas fa-brain',
            'description': 'Strategies to help calm anxiety and worry',
            'strategies': [
                {
                    'title': '5-4-3-2-1 Grounding',
                    'description': 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
                    'icon': 'fas fa-eye',
                    'steps': [
                        'Look around and name 5 things you can see',
                        'Notice 4 things you can touch',
                        'Listen for 3 things you can hear',
                        'Identify 2 things you can smell',
                        'Think of 1 thing you can taste'
                    ]
                },
                {
                    'title': 'Progressive Muscle Relaxation',
                    'description': 'Tense and release muscle groups to reduce physical anxiety',
                    'icon': 'fas fa-user',
                    'steps': [
                        'Start with your toes - tense for 5 seconds, then relax',
                        'Move up to your calves, thighs, abdomen',
                        'Continue with hands, arms, shoulders',
                        'Finish with face and scalp muscles',
                        'Feel the contrast between tension and relaxation'
                    ]
                },
                {
                    'title': 'Anxiety Breathing',
                    'description': 'Slow, controlled breathing to calm the nervous system',
                    'icon': 'fas fa-lungs',
                    'action': url_for('breathing_exercise', mood_key='anxious'),
                    'steps': [
                        'Breathe in for 4 counts',
                        'Hold for 4 counts',
                        'Breathe out for 4 counts',
                        'Hold empty for 4 counts',
                        'Repeat 5-10 times'
                    ]
                }
            ]
        },
        'stressed': {
            'mood_title': 'Stress Management',
            'color': 'danger',
            'icon': 'fas fa-exclamation-triangle',
            'description': 'Techniques to reduce and manage stress',
            'strategies': [
                {
                    'title': 'Quick Stress Relief',
                    'description': 'Immediate techniques for stress reduction',
                    'icon': 'fas fa-clock',
                    'steps': [
                        'Take 5 deep breaths',
                        'Drop your shoulders and relax your jaw',
                        'Step outside or look out a window',
                        'Do 10 jumping jacks or stretch',
                        'Drink a glass of water slowly'
                    ]
                },
                {
                    'title': 'Time Management',
                    'description': 'Organize your tasks to reduce overwhelm',
                    'icon': 'fas fa-calendar',
                    'steps': [
                        'Write down all your tasks',
                        'Prioritize: urgent vs. important',
                        'Break large tasks into smaller steps',
                        'Set realistic deadlines',
                        'Take breaks between tasks'
                    ]
                },
                {
                    'title': 'Stress-Relief Breathing',
                    'description': '4-7-8 breathing for immediate calm',
                    'icon': 'fas fa-leaf',
                    'action': url_for('breathing_exercise', mood_key='stressed'),
                    'steps': [
                        'Exhale completely',
                        'Inhale through nose for 4 counts',
                        'Hold breath for 7 counts',
                        'Exhale through mouth for 8 counts'
                    ]
                }
            ]
        },
        'sad': {
            'mood_title': 'Mood Lifting',
            'color': 'info',
            'icon': 'fas fa-smile',
            'description': 'Techniques to lift your mood',
            'strategies': [
                {
                    'title': 'Grounding Exercise',
                    'description': 'Reconnect with the present moment',
                    'icon': 'fas fa-tree',
                    'action': url_for('grounding_exercise'),
                    'steps': [
                        'Count to 10 slowly',
                        'Take a step back from the situation',
                        'Splash cold water on your face',
                        'Go to a quiet space',
                        'Do some physical exercise'
                    ]
                },
                {
                    'title': 'Express Safely',
                    'description': 'Healthy ways to release anger',
                    'icon': 'fas fa-fist-raised',
                    'steps': [
                        'Write in a journal about your feelings',
                        'Talk to someone you trust',
                        'Do vigorous exercise (run, punch a pillow)',
                        'Scream in a private space or car',
                        'Practice assertive communication'
                    ]
                },
                {
                    'title': 'Cooling Breath',
                    'description': 'Breathing technique to cool anger',
                    'icon': 'fas fa-wind',
                    'action': url_for('breathing_exercise', mood_key='angry'),
                    'steps': [
                        'Curl your tongue or purse lips',
                        'Inhale slowly for 6 counts',
                        'Hold for 2 counts',
                        'Exhale through nose for 8 counts'
                    ]
                }
            ]
        },
        'overwhelmed': {
            'mood_title': 'Overwhelm Relief',
            'color': 'warning',
            'icon': 'fas fa-dizzy',
            'description': 'Strategies to manage feeling overwhelmed',
            'strategies': [
                {
                    'title': 'Brain Dump',
                    'description': 'Get everything out of your head',
                    'icon': 'fas fa-brain',
                    'steps': [
                        'Write down everything on your mind',
                        'Don\'t worry about organization',
                        'Include tasks, worries, thoughts',
                        'Look at the list objectively',
                        'Circle the most important items'
                    ]
                },
                {
                    'title': 'One Thing at a Time',
                    'description': 'Focus on single tasks',
                    'icon': 'fas fa-target',
                    'steps': [
                        'Choose one small task',
                        'Set a timer for 15 minutes',
                        'Focus only on that task',
                        'Take a 5-minute break',
                        'Celebrate completing it'
                    ]
                },
                {
                    'title': 'Calming Breath',
                    'description': 'Reset your nervous system',
                    'icon': 'fas fa-lungs',
                    'action': url_for('breathing_exercise', mood_key='default'),
                    'steps': [
                        'Find comfortable position',
                        'Close eyes or soften gaze',
                        'Breathe naturally',
                        'Count breaths 1 to 10',
                        'Start over when you reach 10'
                    ]
                }
            ]
        },
        'calm': {
            'mood_title': 'Maintaining Calm',
            'color': 'success',
            'icon': 'fas fa-leaf',
            'description': 'Strategies to maintain and deepen your calm state',
            'strategies': [
                {
                    'title': 'Mindful Awareness',
                    'description': 'Stay present and aware',
                    'icon': 'fas fa-eye',
                    'steps': [
                        'Notice your surroundings without judgment',
                        'Feel your feet on the ground',
                        'Observe your breath naturally',
                        'Appreciate this moment of calm',
                        'Set intention to carry this peace forward'
                    ]
                },
                {
                    'title': 'Gentle Movement',
                    'description': 'Maintain calm through movement',
                    'icon': 'fas fa-walking',
                    'steps': [
                        'Take a slow, mindful walk',
                        'Try gentle stretching',
                        'Practice yoga poses',
                        'Do tai chi movements',
                        'Move with intention and awareness'
                    ]
                },
                {
                    'title': 'Peaceful Breathing',
                    'description': 'Deepen your sense of calm',
                    'icon': 'fas fa-feather',
                    'action': url_for('breathing_exercise', mood_key='default'),
                    'steps': [
                        'Breathe naturally and slowly',
                        'Focus on the sensation of breathing',
                        'Let each exhale release tension',
                        'Allow calm to spread through your body',
                        'Rest in this peaceful state'
                    ]
                }
            ]
        }
    }
    
    # Get the selected strategies or default to calm
    selected_strategies = coping_strategies.get(mood_key, coping_strategies['calm'])
    
    return render_template('coping_strategies.html', 
                         user=user,
                         strategies=selected_strategies,
                         mood_key=mood_key,
                         all_moods=list(coping_strategies.keys()))

@app.route('/mood_analysis')
def mood_analysis():
    """Detailed mood analysis page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Redirect to analytics for now
    return redirect(url_for('analytics'))

@app.route('/journal')
def journal():
    """Journal entries page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Redirect to mood entry for now
    return redirect(url_for('mood_entry'))

@app.route('/support')
def support():
    """Support and help page"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Redirect to wellness hub for now
    return redirect(url_for('wellness_hub'))

@app.route('/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    """Terms of service page"""
    return render_template('terms.html')

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Production settings
    port = int(os.environ.get('PORT', 3000))
    debug_mode = not is_production()
    
    # Print startup summary
    print("\n" + "="*60)
    print("🎭 MOODLY APP - STARTUP COMPLETE")
    print("="*60)
    print(f"☁️ Storage: {STORAGE_TYPE}")
    print(f"📤 Uploads: {'Enabled (Cloudinary)' if USE_CLOUD_STORAGE else 'Disabled'}")
    print(f"🤖 AI Insights: {'Enabled' if openai_api_key else 'Disabled'}")
    print(f"🌍 Environment: {'Production' if is_production() else 'Development'}")
    print(f"🚀 Port: {port}")
    print("="*60)
    
    # Run the app
    app.run(
        debug=debug_mode,
        host='0.0.0.0',
        port=port
    )
# Moodly Mental Health App - Flask Application
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import sqlite3
import hashlib
import os
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application instance
app = Flask(__name__)

# Configuration
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Database path
DATABASE_PATH = 'moodly.db'

def init_db():
    """Initialize the SQLite database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                profile_picture TEXT,
                bio TEXT,
                mood_streak INTEGER DEFAULT 0,
                last_mood_date DATE
            )
        ''')
        
        # Create mood_entries table
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
        
        # Create goals table
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
        print(" Database initialized successfully")
        return True
        
    except Exception as e:
        print(f" Database initialization error: {e}")
        return False

def get_current_user():
    """Get the current logged-in user"""
    if 'user_id' not in session:
        return None
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data:
            return {
                'id': user_data[0],
                'username': user_data[1],
                'email': user_data[2],
                'password_hash': user_data[3],
                'created_at': user_data[4],
                'profile_picture': user_data[5],
                'bio': user_data[6],
                'mood_streak': user_data[7] if len(user_data) > 7 else 0,
                'last_mood_date': user_data[8] if len(user_data) > 8 else None
            }
    except Exception as e:
        print(f"Error getting current user: {e}")
    
    return None

def get_mood_options():
    """Get available mood options"""
    return {
        'happy': {'name': 'Happy', 'emoji': '', 'color': '#28a745'},
        'sad': {'name': 'Sad', 'emoji': '', 'color': '#6c757d'},
        'anxious': {'name': 'Anxious', 'emoji': '', 'color': '#ffc107'},
        'calm': {'name': 'Calm', 'emoji': '', 'color': '#17a2b8'},
        'excited': {'name': 'Excited', 'emoji': '', 'color': '#fd7e14'},
        'frustrated': {'name': 'Frustrated', 'emoji': '', 'color': '#dc3545'},
        'content': {'name': 'Content', 'emoji': '', 'color': '#20c997'},
        'overwhelmed': {'name': 'Overwhelmed', 'emoji': '', 'color': '#e83e8c'}
    }

def get_recent_moods(user_id, limit=5):
    """Get recent mood entries for a user"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT mood_score, mood_description, entry_text, created_at
            FROM mood_entries 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        moods = []
        for row in cursor.fetchall():
            moods.append({
                'score': row[0],
                'description': row[1],
                'entry_text': row[2],
                'created_at': row[3]
            })
        
        conn.close()
        return moods
    except Exception as e:
        print(f"Error getting recent moods: {e}")
        return []

# Routes
@app.route('/')
def index():
    """Home page"""
    user = get_current_user()
    if user:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard page"""
    user = get_current_user()
    if not user:
        flash('Please log in to access your dashboard', 'warning')
        return redirect(url_for('login'))
    
    # Get mood options and recent moods
    moods = get_mood_options()
    recent_moods = get_recent_moods(user['id'])
    
    return render_template('dashboard.html', 
                         user=user, 
                         moods=moods,
                         recent_moods=recent_moods)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        if not username or not password:
            flash('Please enter both username and password', 'error')
            return render_template('auth/login.html')
        
        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            # Check credentials
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE username = ? AND password_hash = ?', 
                          (username, password_hash))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                session['user_id'] = user[0]
                flash('Login successful! Welcome back!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid username or password', 'error')
                
        except Exception as e:
            flash('Login error occurred', 'error')
            print(f"Login error: {e}")
    
    return render_template('auth/login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Signup page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        if not username or not email or not password:
            flash('Please fill in all fields', 'error')
            return render_template('auth/signup.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long', 'error')
            return render_template('auth/signup.html')
        
        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            # Insert new user
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username, email, password_hash))
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Auto-login the user
            session['user_id'] = user_id
            flash('Account created successfully! Welcome to Moodly!', 'success')
            return redirect(url_for('dashboard'))
            
        except sqlite3.IntegrityError as e:
            if 'username' in str(e):
                flash('Username already exists. Please choose a different one.', 'error')
            elif 'email' in str(e):
                flash('Email already registered. Please use a different email.', 'error')
            else:
                flash('Registration error. Please try again.', 'error')
        except Exception as e:
            flash('Registration error occurred', 'error')
            print(f"Signup error: {e}")
    
    return render_template('auth/signup.html')
# Add these routes to your moodly_app.py before the "if __name__ == '__main__':" section

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/terms')
def terms():
    """Terms of service page"""
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('privacy.html')

@app.route('/mood_tracker')
def mood_tracker():
    """Mood tracker page"""
    user = get_current_user()
    if not user:
        flash('Please log in to access mood tracker', 'warning')
        return redirect(url_for('login'))
    
    # Get mood history for charts
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DATE(created_at) as date, mood_score, mood_description
        FROM mood_entries 
        WHERE user_id = ? 
        AND created_at >= date('now', '-30 days')
        ORDER BY created_at DESC
    ''', (user['id'],))
    mood_history = cursor.fetchall()
    conn.close()
    
    return render_template('mood_tracker.html', user=user, mood_history=mood_history)

@app.route('/breathing_exercise')
@app.route('/breathing_exercise/<mood_key>')
def breathing_exercise(mood_key=None):
    """Breathing exercise page"""
    user = get_current_user()
    if not user:
        flash('Please log in to access breathing exercises', 'warning')
        return redirect(url_for('login'))
    
    exercises = {
        'calm': {
            'name': 'Calm Breathing',
            'duration': '4-7-8 technique',
            'description': 'Perfect for relaxation and reducing stress'
        },
        'anxious': {
            'name': 'Anti-Anxiety Breathing',
            'duration': 'Box breathing (4-4-4-4)',
            'description': 'Helps manage anxiety and panic'
        },
        'energize': {
            'name': 'Energizing Breath',
            'duration': 'Quick rhythmic breathing',
            'description': 'Boost energy and focus'
        }
    }
    
    selected_exercise = exercises.get(mood_key, exercises['calm'])
    
    return render_template('breathing_exercise.html', 
                         user=user, 
                         exercise=selected_exercise,
                         exercises=exercises)

@app.route('/wellness_hub')
def wellness_hub():
    """Wellness hub with resources and tools"""
    user = get_current_user()
    if not user:
        flash('Please log in to access wellness hub', 'warning')
        return redirect(url_for('login'))
    
    return render_template('wellness_hub.html', user=user)

@app.route('/coping_strategies')
def coping_strategies():
    """Coping strategies and techniques"""
    user = get_current_user()
    if not user:
        flash('Please log in to access coping strategies', 'warning')
        return redirect(url_for('login'))
    
    strategies = {
        'anxiety': [
            'Deep breathing exercises',
            'Progressive muscle relaxation',
            'Grounding techniques (5-4-3-2-1)',
            'Mindfulness meditation'
        ],
        'depression': [
            'Regular exercise routine',
            'Journaling thoughts and feelings',
            'Social connection activities',
            'Setting small achievable goals'
        ],
        'stress': [
            'Time management techniques',
            'Boundary setting',
            'Regular breaks and rest',
            'Physical activity'
        ]
    }
    
    return render_template('coping_strategies.html', user=user, strategies=strategies)

@app.route('/achievements')
def achievements():
    """User achievements and milestones"""
    user = get_current_user()
    if not user:
        flash('Please log in to view achievements', 'warning')
        return redirect(url_for('login'))
    
    # Calculate achievements
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Total mood entries
    cursor.execute('SELECT COUNT(*) FROM mood_entries WHERE user_id = ?', (user['id'],))
    total_entries = cursor.fetchone()[0]
    
    # Days with mood entries
    cursor.execute('''
        SELECT COUNT(DISTINCT DATE(created_at)) 
        FROM mood_entries 
        WHERE user_id = ?
    ''', (user['id'],))
    active_days = cursor.fetchone()[0]
    
    # Current streak
    cursor.execute('''
        SELECT DATE(created_at) 
        FROM mood_entries 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (user['id'],))
    dates = [row[0] for row in cursor.fetchall()]
    
    conn.close()
    
    # Calculate streak
    current_streak = 0
    if dates:
        current_date = datetime.now().date()
        for i, date_str in enumerate(dates):
            entry_date = datetime.strptime(date_str.split()[0], '%Y-%m-%d').date()
            expected_date = current_date - timedelta(days=i)
            if entry_date == expected_date:
                current_streak += 1
            else:
                break
    
    achievements = {
        'total_entries': total_entries,
        'active_days': active_days,
        'current_streak': current_streak,
        'badges': []
    }
    
    # Award badges
    if total_entries >= 1:
        achievements['badges'].append({'name': 'First Step', 'icon': '🎯'})
    if total_entries >= 7:
        achievements['badges'].append({'name': 'Week Warrior', 'icon': '⭐'})
    if total_entries >= 30:
        achievements['badges'].append({'name': 'Monthly Master', 'icon': '🏆'})
    if current_streak >= 7:
        achievements['badges'].append({'name': 'Streak Champion', 'icon': '🔥'})
    
    return render_template('achievements.html', user=user, achievements=achievements)

@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    """Edit user profile"""
    user = get_current_user()
    if not user:
        flash('Please log in to edit your profile', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        bio = request.form.get('bio', '').strip()
        
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE users 
                SET bio = ? 
                WHERE id = ?
            ''', (bio, user['id']))
            conn.commit()
            conn.close()
            
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile'))
            
        except Exception as e:
            flash('Error updating profile', 'error')
            print(f"Profile update error: {e}")
    
    return render_template('edit_profile.html', user=user)

# Replace the journal_templates function in your moodly_app.py with this corrected version

@app.route('/journal_templates')
def journal_templates():
    """Journal templates for mood entries"""
    user = get_current_user()
    if not user:
        flash('Please log in to access journal templates', 'warning')
        return redirect(url_for('login'))
    
    templates_data = {
        'gratitude': {
            'title': 'Gratitude Journal',
            'description': 'Focus on positive aspects of your day',
            'color': 'success',
            'icon': 'fas fa-heart',
            'prompts': [
                'What are 3 things you\'re grateful for today?',
                'Who made a positive impact on your day?',
                'What small joy did you experience?',
                'What challenged you and how did you overcome it?',
                'What made you smile today?'
            ]
        },
        'reflection': {
            'title': 'Daily Reflection',
            'description': 'Reflect on your thoughts and emotions',
            'color': 'primary',
            'icon': 'fas fa-mirror',
            'prompts': [
                'How did you feel throughout the day?',
                'What emotions did you experience most?',
                'What challenged you today?',
                'What did you learn about yourself?',
                'What would you do differently tomorrow?'
            ]
        },
        'goals': {
            'title': 'Goal Setting',
            'description': 'Plan and track your personal goals',
            'color': 'warning',
            'icon': 'fas fa-target',
            'prompts': [
                'What do you want to achieve tomorrow?',
                'What steps will you take to reach your goals?',
                'How will you measure your success?',
                'What obstacles might you face?',
                'Who can support you in achieving this goal?'
            ]
        },
        'anxiety': {
            'title': 'Anxiety Check-in',
            'description': 'Process anxious thoughts and feelings',
            'color': 'info',
            'icon': 'fas fa-cloud-rain',
            'prompts': [
                'What is making you feel anxious right now?',
                'What physical sensations do you notice?',
                'What thoughts are going through your mind?',
                'What would you tell a friend in this situation?',
                'What is one small step you can take to feel better?'
            ]
        },
        'celebration': {
            'title': 'Celebration Journal',
            'description': 'Acknowledge your wins and achievements',
            'color': 'danger',
            'icon': 'fas fa-trophy',
            'prompts': [
                'What did you accomplish today, no matter how small?',
                'What are you proud of yourself for?',
                'What progress have you made recently?',
                'How have you grown as a person?',
                'What positive feedback have you received?'
            ]
        }
    }

    return render_template('journal_templates.html',
                         user=user, 
                         templates=templates_data)

@app.route('/journal_entry/<template_type>', methods=['GET', 'POST'])
def journal_entry(template_type):
    """Create a journal entry using a specific template"""
    user = get_current_user()
    if not user:
        flash('Please log in to create journal entries', 'warning')
        return redirect(url_for('login'))
    
    # Get template data
    templates_data = {
        'gratitude': {
            'title': 'Gratitude Journal',
            'color': 'success',
            'icon': 'fas fa-heart'
        },
        'reflection': {
            'title': 'Daily Reflection', 
            'color': 'primary',
            'icon': 'fas fa-mirror'
        },
        'goals': {
            'title': 'Goal Setting',
            'color': 'warning', 
            'icon': 'fas fa-target'
        },
        'anxiety': {
            'title': 'Anxiety Check-in',
            'color': 'info',
            'icon': 'fas fa-cloud-rain'
        },
        'celebration': {
            'title': 'Celebration Journal',
            'color': 'danger',
            'icon': 'fas fa-trophy'
        }
    }
    
    template_info = templates_data.get(template_type)
    if not template_info:
        flash('Invalid journal template', 'error')
        return redirect(url_for('journal_templates'))
    
    if request.method == 'POST':
        entry_text = request.form.get('entry_text', '').strip()
        mood_score = request.form.get('mood_score', 5)
        
        if not entry_text:
            flash('Please write something in your journal entry', 'error')
        else:
            try:
                # Save journal entry as mood entry
                conn = sqlite3.connect(DATABASE_PATH)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO mood_entries (user_id, mood_score, mood_description, entry_text, created_at)
                    VALUES (?, ?, ?, ?, datetime('now'))
                ''', (user['id'], mood_score, f"Journal: {template_info['title']}", entry_text))
                conn.commit()
                conn.close()
                
                flash(f'{template_info["title"]} entry saved successfully!', 'success')
                return redirect(url_for('dashboard'))
                
            except Exception as e:
                flash('Error saving journal entry', 'error')
                print(f"Journal entry error: {e}")
    
    return render_template('journal_entry.html', 
                         user=user, 
                         template_type=template_type,
                         template_info=template_info)
# Add these missing routes to fix the navigation links

@app.route('/analytics')
def analytics():
    """Analytics page for mood data"""
    user = get_current_user()
    if not user:
        flash('Please log in to view analytics', 'warning')
        return redirect(url_for('login'))
    
    # Get mood analytics data
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Get mood trends over last 30 days
    cursor.execute('''
        SELECT DATE(created_at) as date, AVG(mood_score) as avg_mood, COUNT(*) as entry_count
        FROM mood_entries 
        WHERE user_id = ? 
        AND created_at >= date('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    ''', (user['id'],))
    mood_trends = cursor.fetchall()
    
    # Get mood distribution
    cursor.execute('''
        SELECT mood_description, COUNT(*) as count
        FROM mood_entries 
        WHERE user_id = ? 
        AND mood_description IS NOT NULL
        GROUP BY mood_description
        ORDER BY count DESC
    ''', (user['id'],))
    mood_distribution = cursor.fetchall()
    
    # Get total stats
    cursor.execute('SELECT COUNT(*) FROM mood_entries WHERE user_id = ?', (user['id'],))
    total_entries = cursor.fetchone()[0]
    
    cursor.execute('SELECT AVG(mood_score) FROM mood_entries WHERE user_id = ?', (user['id'],))
    avg_mood = cursor.fetchone()[0] or 0
    
    conn.close()
    
    analytics_data = {
        'mood_trends': mood_trends,
        'mood_distribution': mood_distribution,
        'total_entries': total_entries,
        'avg_mood': round(avg_mood, 1) if avg_mood else 0
    }
    
    return render_template('analytics.html', user=user, analytics=analytics_data)

@app.route('/achievements_page')
def achievements_page():
    """Achievements page (alternative route name)"""
    return achievements()  # Redirect to existing achievements function

@app.route('/coping_strategies_page')
@app.route('/coping_strategies_page/<mood_key>')
def coping_strategies_page(mood_key=None):
    """Coping strategies page with optional mood filter"""
    user = get_current_user()
    if not user:
        flash('Please log in to access coping strategies', 'warning')
        return redirect(url_for('login'))
    
    all_strategies = {
        'anxiety': {
            'title': 'Anxiety Management',
            'color': 'warning',
            'icon': 'fas fa-cloud-rain',
            'strategies': [
                'Deep breathing exercises (4-7-8 technique)',
                'Progressive muscle relaxation',
                'Grounding techniques (5-4-3-2-1)',
                'Mindfulness meditation',
                'Challenge negative thoughts',
                'Create a worry journal',
                'Physical exercise or movement',
                'Listen to calming music'
            ]
        },
        'depression': {
            'title': 'Depression Support',
            'color': 'info',
            'icon': 'fas fa-heart',
            'strategies': [
                'Regular exercise routine',
                'Journaling thoughts and feelings',
                'Social connection activities',
                'Setting small achievable goals',
                'Maintain sleep schedule',
                'Practice self-compassion',
                'Engage in enjoyable activities',
                'Seek professional support'
            ]
        },
        'stress': {
            'title': 'Stress Management',
            'color': 'danger',
            'icon': 'fas fa-fire',
            'strategies': [
                'Time management techniques',
                'Boundary setting',
                'Regular breaks and rest',
                'Physical activity',
                'Prioritize tasks',
                'Practice saying no',
                'Use relaxation techniques',
                'Connect with support network'
            ]
        },
        'calm': {
            'title': 'Maintaining Calm',
            'color': 'success',
            'icon': 'fas fa-leaf',
            'strategies': [
                'Meditation practices',
                'Nature walks or outdoor time',
                'Reading or quiet activities',
                'Gentle stretching or yoga',
                'Aromatherapy or essential oils',
                'Listen to peaceful music',
                'Practice gratitude',
                'Warm bath or shower'
            ]
        }
    }
    
    if mood_key and mood_key in all_strategies:
        strategies = {mood_key: all_strategies[mood_key]}
    else:
        strategies = all_strategies
    
    return render_template('coping_strategies.html', 
                         user=user, 
                         strategies=strategies,
                         selected_mood=mood_key)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Alternative register route (redirects to signup)"""
    return redirect(url_for('signup'))

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    flash('Logged out successfully', 'success')
    return redirect(url_for('index'))

@app.route('/log_mood', methods=['GET', 'POST'])
def log_mood():
    """Log mood entry"""
    user = get_current_user()
    if not user:
        flash('Please log in to log your mood', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        mood_score = request.form.get('mood_score')
        mood_description = request.form.get('mood_description', '')
        entry_text = request.form.get('entry_text', '')
        
        if not mood_score:
            flash('Please select a mood score', 'error')
            return render_template('log_mood.html', user=user, moods=get_mood_options())
        
        try:
            # Save mood entry
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
            
        except Exception as e:
            flash('Error saving mood entry', 'error')
            print(f"Mood logging error: {e}")
    
    moods = get_mood_options()
    selected_mood = request.args.get('mood', 'neutral')
    
    return render_template('log_mood.html', user=user, moods=moods, selected_mood=selected_mood)

@app.route('/profile')
def profile():
    """User profile page"""
    user = get_current_user()
    if not user:
        flash('Please log in to view your profile', 'warning')
        return redirect(url_for('login'))
    
    return render_template('profile.html', user=user)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app': 'Moodly Mental Health App',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('errors/500.html'), 500

# Main execution
if __name__ == '__main__':
    print("\n" + "="*60)
    print(" MOODLY MENTAL HEALTH APP")
    print("="*60)
    print(" Initializing application...")
    
    # Initialize database
    if init_db():
        print(" Database ready")
    else:
        print(" Database initialization failed")
        exit(1)
    
    # Print startup info
    print(" Starting Flask development server...")
    print(" Server will be available at: http://localhost:5000")
    print(" Alternative URL: http://127.0.0.1:5000")
    print(" Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    try:
        # Run the Flask app
        app.run(
            debug=True,
            host='0.0.0.0', 
            port=5000,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n Server stopped by user")
    except Exception as e:
        print(f"\n Server error: {e}")

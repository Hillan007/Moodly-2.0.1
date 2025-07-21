from flask import Flask, request, jsonify
import sqlite3
import hashlib
import secrets
import os
from datetime import datetime, timedelta
import jwt

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('moodly.db')
    conn.row_factory = sqlite3.Row
    return conn

def handler(request):
    if request.method == 'POST':
        data = request.get_json()
        
        if request.path.endswith('/register'):
            # Registration logic
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if not username or not email or not password:
                return jsonify({'error': 'Missing required fields'}), 400
            
            conn = get_db_connection()
            
            # Check if user already exists
            existing_user = conn.execute(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                (username, email)
            ).fetchone()
            
            if existing_user:
                conn.close()
                return jsonify({'error': 'User already exists'}), 400
            
            # Hash password
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Create user
            cursor = conn.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'User created successfully',
                'user_id': user_id
            }), 201
            
        elif request.path.endswith('/login'):
            # Login logic
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return jsonify({'error': 'Missing credentials'}), 400
            
            conn = get_db_connection()
            user = conn.execute(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                (username, username)
            ).fetchone()
            conn.close()
            
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            if user['password_hash'] != password_hash:
                return jsonify({'error': 'Invalid credentials'}), 401
            
            # Create JWT token
            token = jwt.encode({
                'user_id': user['id'],
                'username': user['username'],
                'exp': datetime.utcnow() + timedelta(days=7)
            }, os.getenv('FLASK_SECRET_KEY', 'dev-secret'), algorithm='HS256')
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            }), 200
    
    return jsonify({'error': 'Method not allowed'}), 405
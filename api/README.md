# API (PHP) README

This folder contains a small PHP endpoint to register new users into the project's SQLite database (`moodly.db`).

Files added:
- `register.php` — POST endpoint that accepts JSON or form data and inserts a user into `moodly.db`.

Quick start (Windows PowerShell):

1. Open a PowerShell terminal in the project root (where `moodly.db` is located).

2. Start the PHP built-in server (serves the `api` directory):

```powershell
# from project root
cd api
php -S localhost:8000
```

3. Register a user with curl (PowerShell):

```powershell
# JSON POST
curl -Method POST -Uri http://localhost:8000/register.php -Body (ConvertTo-Json @{ username = 'alice'; email = 'alice@example.com'; password = 'secret123' }) -ContentType 'application/json'

# Form POST
curl -Method POST -Uri http://localhost:8000/register.php -Body @{ username = 'alice'; email = 'alice@example.com'; password = 'secret123' }
```

4. Open the SQLite database locally

You can open `moodly.db` with any SQLite GUI (DB Browser for SQLite, TablePlus, etc.) or with the command line `sqlite3` tool:

```powershell
# If sqlite3 is installed
sqlite3 ..\moodly.db
# Then inside sqlite3
.headers on
.mode column
SELECT * FROM users;
```

Notes and security
- Passwords are hashed using PHP's `password_hash()`.
- The endpoint ensures the `users` table exists and tries to be compatible with the existing Python schema.
- This is intended for local development/testing. For production, use HTTPS, input sanitation, rate-limiting, and CSRF/session protections.

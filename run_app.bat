@echo off
echo Starting Moodly Flask Application...
cd /d "d:\PLP Academy\Moodly_App"

echo Checking and installing dependencies...
"D:/PLP Academy/Moodly_App/.venv/Scripts/pip.exe" install --upgrade pip
"D:/PLP Academy/Moodly_App/.venv/Scripts/pip.exe" install -r requirements.txt

echo Setting UTF-8 encoding...
chcp 65001 > nul
set PYTHONIOENCODING=utf-8

echo Loading environment variables from .env file...
REM Environment variables will be loaded by python-dotenv in your app

echo Starting Moodly app...
"D:/PLP Academy/Moodly_App/.venv/Scripts/python.exe" moodly_app.py
pause

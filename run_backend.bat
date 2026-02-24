@echo off
echo Starting Moodly Backend...
cd backend
call ..\venv\Scripts\activate.bat
python moodly_api.py

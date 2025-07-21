@echo off
echo Starting build process...

echo Installing Node.js dependencies...
call npm ci

echo Building React frontend...
call npm run build

echo Installing Python dependencies...
call pip install -r requirements.txt

echo Build completed successfully!
echo Frontend built in ./dist directory
echo Python dependencies installed

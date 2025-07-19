@echo off
REM Test file for run_app.bat
echo Running tests for run_app.bat...

REM Test 1: Check if run_app.bat exists
if not exist "run_app.bat" (
    echo FAIL: run_app.bat not found
    goto :end
) else (
    echo PASS: run_app.bat exists
)

REM Test 2: Check if virtual environment directory exists
if not exist "D:\PLP Academy\Moodly_App\.venv\Scripts\python.exe" (
    echo FAIL: Virtual environment python.exe not found
    goto :end
) else (
    echo PASS: Virtual environment python.exe found
)

REM Test 3: Check if pip exists in virtual environment
if not exist "D:\PLP Academy\Moodly_App\.venv\Scripts\pip.exe" (
    echo FAIL: Virtual environment pip.exe not found
    goto :end
) else (
    echo PASS: Virtual environment pip.exe found
)

REM Test 4: Check if requirements.txt exists
if not exist "requirements.txt" (
    echo FAIL: requirements.txt not found
    goto :end
) else (
    echo PASS: requirements.txt found
)

REM Test 5: Check if main app file exists
if not exist "moodly_app.py" (
    echo FAIL: moodly_app.py not found
    goto :end
) else (
    echo PASS: moodly_app.py found
)

REM Test 6: Verify batch file contains required commands
findstr /C:"cd /d" run_app.bat >nul
if errorlevel 1 (
    echo FAIL: Directory change command not found
) else (
    echo PASS: Directory change command found
)

findstr /C:"pip.exe install" run_app.bat >nul
if errorlevel 1 (
    echo FAIL: Pip install command not found
) else (
    echo PASS: Pip install command found
)

findstr /C:"python.exe moodly_app.py" run_app.bat >nul
if errorlevel 1 (
    echo FAIL: Python app start command not found
) else (
    echo PASS: Python app start command found
)

echo.
echo All tests completed!

:end
pause
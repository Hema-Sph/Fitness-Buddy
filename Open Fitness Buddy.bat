@echo off
echo.
echo  ====================================================
echo   Fitness Buddy - Starting...
echo  ====================================================
echo.

cd /d "%~dp0"

REM Detect Python
where py >nul 2>&1
IF %ERRORLEVEL% EQU 0 ( SET PYTHON=py & GOTO install )
where python >nul 2>&1
IF %ERRORLEVEL% EQU 0 ( SET PYTHON=python & GOTO install )

echo [ERROR] Python not found. Please install from https://www.python.org
pause
exit /b 1

:install
echo [INFO] Checking dependencies...
%PYTHON% -m pip install flask requests python-dotenv -q --disable-pip-version-check

echo.
echo  Server starting at http://localhost:3000
echo  Opening browser in 3 seconds...
echo  (Keep this window open while using the app)
echo.

REM Open browser after 3 second delay in background
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Start Flask server
%PYTHON% app.py

pause

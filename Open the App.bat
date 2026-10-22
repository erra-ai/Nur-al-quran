@echo off
rem One-click launcher for the Nur al-Quran app.
rem Double-click this instead of app.html: it quietly starts the little
rem local web server (only if one is not already running) and opens the app.
cd /d "%~dp0"
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 goto OPEN
start "" /min "python -m http.server 8000"
timeout /t 2 /nobreak >nul
:OPEN
start "" http://localhost:8000/app.html
exit /b

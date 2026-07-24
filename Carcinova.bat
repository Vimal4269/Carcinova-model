@echo off
title Carcinova - Starting...

echo Starting Carcinova AI...

:: Start backend
start /min "" cmd /c "cd /d "%~dp0backend" && venv\Scripts\python.exe app.py"

:: Start mobile frontend  
start /min "" cmd /c "cd /d "%~dp0mobile-frontend" && npm run dev -- --host"

:: Start Vite
start /min "" cmd /c "cd /d "%~dp0frontend" && npm run dev"

:: Wait for Vite to be ready
echo Waiting for servers to start...
timeout /t 6 /nobreak > nul

:: Open in default browser
start "" "http://localhost:5174"

exit

@echo off
echo Stopping all Carcinova background services...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
echo Services stopped successfully.
pause

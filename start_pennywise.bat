@echo off
title Pennywise App Launcher
echo ========================================================
echo   LAUNCHING PENNYWISE PERSONAL FINANCE PLATFORM
echo   Make Every Rupee Count.
echo ========================================================
start "Pennywise Backend API" cmd /k "cd /d %~dp0\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul
start "Pennywise Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo Application is online!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause


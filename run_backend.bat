@echo off
title Pennywise Backend API (Port 8000)
cd /d "%~dp0\backend"
echo ========================================================
echo   PENNYWISE FINTECH BACKEND API
echo   Make Every Rupee Count.
echo   Starting server at http://127.0.0.1:8000 ...
echo ========================================================
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause


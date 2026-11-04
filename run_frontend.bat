@echo off
title Pennywise Frontend Client (Port 5173)
cd /d "%~dp0\frontend"
echo ========================================================
echo   PENNYWISE FRONTEND APPLICATION
echo   Make Every Rupee Count.
echo   Starting Vite server at http://localhost:5173 ...
echo ========================================================
npm run dev
pause


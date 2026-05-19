@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════
echo   OkulGiriş Sistemi Başlatılıyor...
echo ════════════════════════════════════════
echo.

cd backend
node server.js
pause

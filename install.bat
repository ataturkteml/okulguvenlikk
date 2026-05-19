@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════
echo   OkulGiriş — Kurulum Scripti (Windows)
echo ════════════════════════════════════════
echo.

:: Node.js kontrol
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadı!
    echo Lütfen https://nodejs.org adresinden Node.js 18+ indirin.
    pause
    exit /b 1
)

echo [OK] Node.js bulundu:
node --version

echo.
echo [1/2] Backend bağımlılıkları yükleniyor...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [HATA] npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/2] Kurulum tamamlandı!
echo.
echo ────────────────────────────────────────
echo   Uygulamayı başlatmak için:
echo   start.bat dosyasını çalıştırın
echo ────────────────────────────────────────
echo.
pause

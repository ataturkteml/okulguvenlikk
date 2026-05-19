#!/bin/bash
set -e

echo ""
echo "════════════════════════════════════════"
echo "  OkulGiriş — Kurulum (Linux/Mac)"
echo "════════════════════════════════════════"
echo ""

# Node.js kontrol
if ! command -v node &> /dev/null; then
    echo "[HATA] Node.js bulunamadı!"
    echo "https://nodejs.org adresinden Node.js 18+ yükleyin."
    exit 1
fi

echo "[OK] Node.js: $(node --version)"
echo ""

echo "[1/2] Backend bağımlılıkları yükleniyor..."
cd backend
npm install

echo ""
echo "[2/2] Kurulum tamamlandı!"
echo ""
echo "────────────────────────────────────────"
echo "  Başlatmak için: ./start.sh"
echo "────────────────────────────────────────"

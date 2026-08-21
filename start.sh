#!/bin/bash
# ─── SMP Darul Ulum — Quick Start ────────────────────────────────────────────
# Jalankan script ini dari root folder proyek

echo ""
echo "🏫  SMP Darul Ulum Surabaya — Quick Start"
echo "==========================================="
echo ""

# Cek apakah .env sudah ada
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env belum ada. Copy dari example dulu:"
  echo "   cp backend/.env.example backend/.env"
  echo "   lalu edit DATABASE_URL, JWT_SECRET, EMAIL_USER, EMAIL_PASS"
  exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
  echo "⚠️  frontend/.env.local belum ada. Copy dari example dulu:"
  echo "   cp frontend/.env.example frontend/.env.local"
  echo "   lalu edit NEXTAUTH_SECRET, EMAIL_*, UPLOADTHING_*"
  exit 1
fi

# Install deps kalau belum
if [ ! -d "backend/node_modules" ]; then
  echo "📦  Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦  Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo "✅  Dependencies OK"
echo ""
echo "🚀  Menjalankan Backend  → http://localhost:5000"
echo "🚀  Menjalankan Frontend → http://localhost:3000"
echo ""
echo "   Tekan Ctrl+C untuk menghentikan"
echo ""

# Jalankan backend dan frontend secara bersamaan
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "green,blue" \
  "cd backend && npm run dev" \
  "cd frontend && npm run dev"

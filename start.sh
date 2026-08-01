#!/usr/bin/env bash
#
# 🌾 Krishi Sangam Launcher (Bash version)
# Works in Git Bash on Windows, and Linux/macOS terminals
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
CLIENT_DIR="$SCRIPT_DIR/client"

echo ""
echo "============================================"
echo "   🌾 Krishi Sangam — Starting Application"
echo "============================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ [ERROR] Node.js is not installed."
  echo "   Please install it from https://nodejs.org"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "📦 [INFO] Installing server dependencies..."
  cd "$SERVER_DIR"
  npm install
  cd "$SCRIPT_DIR"
fi

if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo "📦 [INFO] Installing client dependencies..."
  cd "$CLIENT_DIR"
  npm install
  cd "$SCRIPT_DIR"
fi

echo "🚀 [INFO] Starting the Krishi Sangam API server..."
echo ""

# Start the API server in the background
cd "$SERVER_DIR"
node server.js &
SERVER_PID=$!
cd "$SCRIPT_DIR"

# Start the React dev server in the background
cd "$CLIENT_DIR"
npm run dev &
CLIENT_PID=$!
cd "$SCRIPT_DIR"

# Wait for the API server to be ready
echo "⏳ [INFO] Waiting for API server..."
for i in $(seq 1 15); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ [INFO] API server is ready!"
    break
  fi
  sleep 1
done

# Open the browser (cross-platform)
echo "🌐 [INFO] Opening http://localhost:5173 in your browser..."
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)  cmd //c "start http://localhost:5173" ;;
  Darwin*)               open http://localhost:5173 ;;
  *)                     xdg-open http://localhost:5173 ;;
esac

echo ""
echo "============================================"
echo "   ✅ Krishi Sangam is running!"
echo "   📍 App:    http://localhost:5173"
echo "   📍 API:    http://localhost:3001/api/health"
echo ""
echo "   Press Ctrl+C to stop the servers."
echo "============================================"
echo ""

cleanup() {
  echo ""
  echo "🛑 Stopping servers..."
  kill $SERVER_PID $CLIENT_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait

#!/usr/bin/env bash
#
# 🌾 KrishiSetu Launcher (Bash version)
# Works in Git Bash on Windows, and Linux/macOS terminals
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"

echo ""
echo "============================================"
echo "   🌾 KrishiSetu — Starting Application"
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
  echo "📦 [INFO] Installing dependencies..."
  cd "$SERVER_DIR"
  npm install
  cd "$SCRIPT_DIR"
fi

echo "🚀 [INFO] Starting the KrishiSetu API server..."
echo ""

# Start the server in the background
cd "$SERVER_DIR"
node server.js &
SERVER_PID=$!
cd "$SCRIPT_DIR"

# Wait for the server to be ready
echo "⏳ [INFO] Waiting for server..."
for i in $(seq 1 10); do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ [INFO] Server is ready!"
    break
  fi
  sleep 1
done

# Open the browser (cross-platform)
echo "🌐 [INFO] Opening http://localhost:3001 in your browser..."
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)  cmd //c "start http://localhost:3001" ;;
  Darwin*)               open http://localhost:3001 ;;
  *)                     xdg-open http://localhost:3001 ;;
esac

echo ""
echo "============================================"
echo "   ✅ KrishiSetu is running!"
echo "   📍 App:    http://localhost:3001"
echo "   📍 Health: http://localhost:3001/api/health"
echo ""
echo "   Press Ctrl+C to stop the server."
echo "============================================"
echo ""

# Wait for the server process
wait $SERVER_PID

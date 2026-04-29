#!/bin/bash
# ShanXBot — Start Frontend
# Built by Shanmukh Datta

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ShanXBot Frontend"
echo "  Built by Shanmukh Datta"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting frontend on http://localhost:3000"
echo ""
npm run dev

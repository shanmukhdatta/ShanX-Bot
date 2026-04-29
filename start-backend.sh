#!/bin/bash
# ShanXBot — Start Backend
# Built by Shanmukh Datta

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ShanXBot Backend"
echo "  Built by Shanmukh Datta"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    py -3.11 -m venv venv
fi

echo "📦 Installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "🚀 Starting backend on http://localhost:8000"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

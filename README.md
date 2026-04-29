# ShanXBot 🧠

**Think in Parallel. Answer in Perfect.**

A premium, next-generation multi-model agentic AI assistant with a stunning glassmorphism UI and neural network aesthetic.

> Built with ♥ by **Shanmukh Datta**

---

## 🚀 Recent Updates
- **Deployment Migration**: Successfully migrated deployment strategy to **Vercel** (Frontend) and **Render** (Backend).
- **Firebase Auth Fixes**: Implemented forced account selection on sign-out to ensure a clean session and allow easy account switching.
- **Enhanced Super Intelligence**: Improved parallel processing and synthesis logic for more accurate multi-model reasoning.
- **Premium Glassmorphism**: Refined UI with deeper blur effects, animated neural backgrounds, and emerald color palettes.

---

## ✨ Features

- **Multi-Model AI** — Groq (LLaMA 3.3), Google Gemini, OpenRouter (Mistral, Claude, etc.)
- **⚡ Super Intelligence Mode** — Two models reason in parallel, a judge synthesizes the best answer
- **📄 Document RAG** — Upload PDF, DOCX, TXT, MD, CSV files and chat with them
- **🔊 Voice Input** — Web Speech API for hands-free queries
- **💬 Chat History** — Sessions persisted in Firebase Firestore (when signed in) or localStorage
- **🎨 Glassmorphism UI** — Animated neural network background, emerald glass panels
- **📡 Streaming** — Word-by-word token streaming with blinking cursor animation
- **⚙️ Settings Modal** — API key management, system prompt editor, model selection
- **📱 Responsive** — Works on mobile with collapsible sidebar

---

## 🚀 Deployment Guide

### 1. Backend (Render)
1. **Prepare**: Ensure `render.yaml` and `backend/requirements.txt` are present.
2. **Deploy**: Create a new **Web Service** on Render and point it to the `backend` directory.
3. **Environment Variables**: Add your API keys to Render (optional, as users can provide their own):
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `OPENROUTER_API_KEY`
4. **Networking**: Render will automatically use the `PORT` variable.

### 2. Frontend (Vercel)
1. **Prepare**: Ensure `frontend/vercel.json` is present for SPA routing.
2. **Deploy**: Create a new project on Vercel and point it to the `frontend` directory.
3. **Build Settings**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**: Add the following:
   - `VITE_API_BASE`: (Your Render Backend URL, e.g., `https://shanxbot-backend.onrender.com`)
   - Firebase variables (copy from `.env.example` or your Firebase Console)

---

## 🛠️ Local Development

### Requirements
- Node.js 18+
- Python 3.10+

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
Backend runs at: **http://localhost:8000**

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:3000**

---

## 🏗️ Architecture

```
shanxbot/
├── frontend/               # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx         # Main app, chat orchestration
│   │   ├── components/     # UI Components
│   │   ├── stores/         # Zustand stores (Chat, Auth, Settings)
│   │   └── utils/          # API & Helpers
│   └── vercel.json         # Vercel SPA config
│
├── backend/                # FastAPI + LangChain
│   ├── main.py             # Main entry point
│   └── requirements.txt    # Python dependencies
│
└── render.yaml             # Render deployment config
```

---

> **Built with ♥ by Shanmukh Datta**

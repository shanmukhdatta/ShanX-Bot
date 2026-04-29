# 🚀 ShanXBot Deployment Guide

This guide explains how to deploy the **ShanXBot** project with the **Frontend on Vercel** and the **Backend on Render**.

---

## 🏗️ 1. Backend Deployment (Render)

The backend is built with FastAPI and runs on Render.

### Steps:
1.  Log in to [Render.com](https://render.com/).
2.  Click **New** → **Web Service**.
3.  Connect your GitHub repository (`ShanX-Bot`).
4.  Configure the service:
    *   **Name**: `shanxbot-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    *   `GROQ_API_KEY`: (Optional)
    *   `GEMINI_API_KEY`: (Optional)
    *   `OPENROUTER_API_KEY`: (Optional)
6.  Once deployed, copy your Render URL (e.g., `https://shanxbot-backend.onrender.com`).

---

## 🌐 2. Frontend Deployment (Vercel)

The frontend is a Vite + React application deployed on Vercel.

### Steps:
1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New** → **Project**.
3.  Import your `ShanX-Bot` repository.
4.  Configure the project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_BASE`: Paste your **Render Backend URL** here.
    *   Add all your `VITE_FIREBASE_*` keys from your local `.env`.

---

## 🔐 3. Firebase Authorized Domains (CRITICAL)

If you see an `auth/unauthorized-domain` error when trying to sign in on your deployed site:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Authentication** → **Settings** → **Authorized domains**.
3.  Click **Add domain**.
4.  Add your Vercel domain (e.g., `shanxbot-frontend.vercel.app`).

---

## 🛠️ 4. How to See Changes in Code

1.  **Backend Config**: Check `render.yaml` in the root for the backend specification.
2.  **Frontend Config**: Check `frontend/vercel.json` for SPA routing configuration.
3.  **API Integration**: Check `frontend/src/utils/api.js` to ensure it uses the `VITE_API_BASE` environment variable.

---

## 💾 5. Git Commit & Push

To sync these changes to your GitHub:

```bash
# Stage changes
git add .

# Commit
git commit -m "chore: configure deployment for Vercel (Frontend) and Render (Backend)"

# Push
git push origin main
```

---

> [!TIP]
> Render's free tier services spin down after inactivity. The first request to the backend after a break may take a moment to wake up.

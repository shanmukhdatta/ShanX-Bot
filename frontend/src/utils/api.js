// During deployment, VITE_API_BASE should be set to your Render backend URL.
// The local fallback is commented out below to prevent accidental local connection in production.
const API_BASE = import.meta.env.VITE_API_BASE // || 'http://localhost:8000'


export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`)
  return res.ok
}

export default API_BASE

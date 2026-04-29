import { useState } from 'react'
import { Activity, ArrowRight, Zap } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { firebaseReady } from '../firebase'

// Google G logo SVG
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthGate({ onGoHome }) {
  const { signIn, enterDemoMode } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const result = await signIn()
    if (!result.success) {
      setError(result.error || 'Sign-in failed. Please try again.')
    }
    setLoading(false)
  }

  const handleDemo = () => {
    enterDemoMode()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #ecfdf5 70%, #d1fae5 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top-left Logo Navigation */}
      <div 
        onClick={onGoHome}
        className="absolute top-8 left-8 flex items-center gap-2.5 cursor-pointer group z-50"
        title="Return to Landing Page"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
             style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 0 12px rgba(5,150,105,0.3)' }}>
          <Activity size={14} color="white" />
        </div>
        <span className="font-display font-bold text-gray-900 text-sm opacity-60 group-hover:opacity-100 transition-opacity">
          ShanXBot
        </span>
      </div>

      {/* Subtle background blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(16,185,129,0.2)',
          boxShadow: '0 24px 80px rgba(5,150,105,0.14)',
          padding: '44px 40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg, #059669, #047857)',
            boxShadow: '0 0 24px rgba(5,150,105,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={22} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.04em', color: '#111827' }}>
            ShanX<span style={{ color: '#059669' }}>Bot</span>
          </span>
        </div>

        <h2 style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>
          Sign in to save your chats privately, or try a demo session instantly.
        </p>

        {/* Google Sign In */}
        {firebaseReady ? (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 20px',
              borderRadius: 14,
              background: loading ? 'rgba(0,0,0,0.04)' : 'white',
              border: '1.5px solid rgba(0,0,0,0.12)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
              fontWeight: 600,
              color: '#374151',
              transition: 'all 0.2s ease',
              marginBottom: 12,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)' }}
          >
            <GoogleIcon />
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        ) : (
          <div style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            background: 'rgba(239,68,68,0.05)',
            border: '1.5px solid rgba(239,68,68,0.2)',
            fontSize: 13,
            color: '#dc2626',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            ⚠️ Firebase not configured — add keys to <code>.env</code> to enable Google sign-in.
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
        </div>

        {/* Demo Mode */}
        <button
          onClick={handleDemo}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 20px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(16,185,129,0.05))',
            border: '1.5px solid rgba(5,150,105,0.25)',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
            color: '#059669',
            transition: 'all 0.2s ease',
            marginBottom: 12,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(5,150,105,0.14), rgba(16,185,129,0.08))'
            e.currentTarget.style.borderColor = 'rgba(5,150,105,0.45)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(16,185,129,0.05))'
            e.currentTarget.style.borderColor = 'rgba(5,150,105,0.25)'
          }}
        >
          <Zap size={16} />
          Try Demo Mode
        </button>

        {error && (
          <p style={{ fontSize: 13, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Info note */}
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 20, lineHeight: 1.6 }}>
          {firebaseReady
            ? 'Google sign-in stores your chats privately in Firebase. Demo mode uses local browser storage only.'
            : 'Demo mode uses local browser storage. Your chats stay on this device.'}
        </p>
      </div>

      {/* Built by */}
      <p style={{ marginTop: 24, fontSize: 12, color: '#9ca3af' }}>
        Built with ♥ by <strong style={{ color: '#059669' }}>Shanmukh Datta</strong>
      </p>
    </div>
  )
}

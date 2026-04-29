import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { firebaseReady } from '../firebase'

/**
 * Shows three status indicators in a floating pill:
 *  • Frontend (always connected once rendered)
 *  • Backend  (ping /health)
 *  • Database (Firebase or localStorage)
 */
export default function ConnectionStatus({ backendOnline }) {
  const { dbConnected, isDemo } = useAuthStore()
  const [visible, setVisible] = useState(false)

  // Fade in after mount so it doesn't flash on initial render
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const dbOk = firebaseReady && dbConnected && !isDemo
  const dbLabel = isDemo ? 'Local DB' : firebaseReady ? 'Firebase' : 'Local DB'

  const indicators = [
    { label: 'Frontend', ok: true },
    { label: 'Backend', ok: backendOnline },
    { label: dbLabel, ok: dbOk || isDemo }, // local DB always "ok" in demo
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.5s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          borderRadius: 50,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 4px 20px rgba(5,150,105,0.1)',
        }}
      >
        {indicators.map(({ label, ok }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={`${label}: ${ok ? 'Connected' : 'Disconnected'}`}
          >
            {ok ? (
              <CheckCircle2
                size={13}
                style={{ color: '#059669', flexShrink: 0 }}
              />
            ) : (
              <XCircle
                size={13}
                style={{ color: '#d1d5db', flexShrink: 0 }}
              />
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: ok ? '#059669' : '#9ca3af',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

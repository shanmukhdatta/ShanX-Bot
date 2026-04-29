import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Zap, Shield, Brain, Mic, FileText, Activity, ChevronDown } from 'lucide-react'

// Particle canvas for background
function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = window.innerWidth
    let h = window.innerHeight
    let animId

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1.5,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        n.phase += n.pulseSpeed
        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.18
            ctx.beginPath()
            ctx.strokeStyle = `rgba(52,211,153,${alpha})`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        const pulse = Math.sin(n.phase) * 0.3 + 0.7
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5)
        grad.addColorStop(0, `rgba(52,211,153,${0.2 * pulse})`)
        grad.addColorStop(1, 'rgba(52,211,153,0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.75 * pulse})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(52,211,153,${0.5 * pulse})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #ecfdf5 70%, #d1fae5 100%)',
      }}
    />
  )
}

const features = [
  {
    icon: <Shield size={26} />,
    title: 'Triple Failover',
    subtitle: '99%+ Uptime',
    desc: 'Three AI providers in a failover chain. Groq → Gemini → OpenRouter. One goes down, the next takes over instantly — you never notice.',
    color: '#059669',
    glow: 'rgba(5,150,105,0.25)',
    tag: 'Reliability',
  },
  {
    icon: <Brain size={26} />,
    title: 'Super Intelligence',
    subtitle: 'Dual-Model Synthesis',
    desc: 'Two models generate independent answers. A third Judge AI synthesizes them, resolves conflicts, and produces a superior response beyond any single model.',
    color: '#d97706',
    glow: 'rgba(217,119,6,0.25)',
    tag: 'Flagship Feature',
  },
  {
    icon: <FileText size={26} />,
    title: 'Document RAG',
    subtitle: 'Chat With Your Files',
    desc: 'Upload PDFs, DOCX, TXT, CSV. ShanXBot indexes them with vector embeddings and answers questions grounded in your actual document content.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.25)',
    tag: 'Productivity',
  },
  {
    icon: <Mic size={26} />,
    title: 'Voice Input',
    subtitle: 'Speak Naturally',
    desc: "Just press the mic and talk. ShanXBot transcribes your speech in real-time and processes it like a typed message — completely hands-free.",
    color: '#0891b2',
    glow: 'rgba(8,145,178,0.25)',
    tag: 'Accessibility',
  },
  {
    icon: <Zap size={26} />,
    title: 'Streaming Responses',
    subtitle: 'Real-Time Tokens',
    desc: 'Responses stream token-by-token the moment they are generated, powered by server-sent events and LangChain callbacks for minimal latency.',
    color: '#059669',
    glow: 'rgba(5,150,105,0.25)',
    tag: 'Performance',
  },
  {
    icon: <Activity size={26} />,
    title: 'Custom System Prompts',
    subtitle: 'Shape Every Response',
    desc: 'Change the AI personality on-the-fly. Configure system prompts directly from the chat interface to tailor ShanXBot for any task or persona.',
    color: '#db2777',
    glow: 'rgba(219,39,119,0.25)',
    tag: 'Personalization',
  },
]

const providers = [
  { name: 'Groq', model: 'Llama 3.3 70B', role: 'Primary', color: '#059669' },
  { name: 'Gemini', model: 'Gemini 1.5 Flash', role: 'Secondary', color: '#0891b2' },
  { name: 'OpenRouter', model: 'DeepSeek R1', role: 'Tertiary', color: '#7c3aed' },
]

export default function IntroPage({ onEnter }) {
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeProviderIdx, setActiveProviderIdx] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveProviderIdx(i => (i + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el))
    }, 100)
    
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden w-full flex-1"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <ParticleBackground />

      {/* Glassmorphic nav bar */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          padding: '14px 32px',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(16,185,129,0.15)',
          boxShadow: '0 2px 20px rgba(5,150,105,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: '0 0 14px rgba(5,150,105,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#111827' }}>
            ShanX<span style={{ color: '#059669' }}>Bot</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'rgba(5,150,105,0.08)',
              color: '#059669',
              border: '1px solid rgba(5,150,105,0.2)',
            }}
          >
            v1.0
          </div>
          <button
            onClick={onEnter}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.35)'
            }}
          >
            Open Chat <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        style={{
          position: 'relative', zIndex: 10, minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '120px 24px 80px',
          textAlign: 'center',
        }}
      >
        {/* Animated badge */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 30,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: '0 4px 20px rgba(5,150,105,0.12)',
            marginBottom: 36,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#047857', letterSpacing: '0.02em' }}>
            Multi-Model Agentic AI
          </span>
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontSize: 'clamp(44px, 8vw, 88px)',
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: '-0.04em',
            color: '#0f172a',
            marginBottom: 12,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
          }}
        >
          Think in Parallel.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Answer in Perfect.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#4b5563',
            maxWidth: 600,
            lineHeight: 1.6,
            marginBottom: 44,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.2s',
          }}
        >
          ShanXBot orchestrates <strong style={{ color: '#059669' }}>Groq</strong>, <strong style={{ color: '#0891b2' }}>Gemini</strong> & <strong style={{ color: '#7c3aed' }}>OpenRouter</strong> in a single, beautiful interface — with triple failover and agentic Super Intelligence.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.3s',
          }}
        >
          <button
            onClick={onEnter}
            style={{
              padding: '16px 36px', borderRadius: 50, fontSize: 16, fontWeight: 800,
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(5,150,105,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.25s ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(5,150,105,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(5,150,105,0.4)'
            }}
          >
            Start Chatting <ArrowRight size={18} />
          </button>
          <button
            style={{
              padding: '16px 36px', borderRadius: 50, fontSize: 16, fontWeight: 700,
              background: 'rgba(255,255,255,0.8)',
              color: '#059669', border: '2px solid rgba(5,150,105,0.3)',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.25s ease',
              letterSpacing: '-0.01em',
            }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(5,150,105,0.08)'
              e.currentTarget.style.borderColor = 'rgba(5,150,105,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
              e.currentTarget.style.borderColor = 'rgba(5,150,105,0.3)'
            }}
          >
            Explore Features
          </button>
        </div>

        {/* Provider pills — live cycling */}
        <div
          style={{
            marginTop: 56,
            display: 'flex', alignItems: 'center', gap: 10,
            flexWrap: 'wrap', justifyContent: 'center',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.5s',
          }}
        >
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Powered by</span>
          {providers.map((p, idx) => (
            <div
              key={p.name}
              style={{
                padding: '6px 16px', borderRadius: 30,
                background: activeProviderIdx === idx ? p.color : 'rgba(255,255,255,0.7)',
                color: activeProviderIdx === idx ? 'white' : p.color,
                border: `1.5px solid ${p.color}`,
                fontSize: 12, fontWeight: 700,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.4s ease',
                boxShadow: activeProviderIdx === idx ? `0 4px 14px ${p.color}50` : 'none',
              }}
            >
              {p.name}
              <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>{p.role}</span>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div
          style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: '#9ca3af', fontSize: 11, fontWeight: 500,
            animation: 'bounce-slow 2.5s ease-in-out infinite',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ─── SUPER INTELLIGENCE SHOWCASE ─── */}
      <section
        style={{
          position: 'relative', zIndex: 10,
          padding: '80px 24px',
          maxWidth: 1100, margin: '0 auto',
        }}
      >
        <div
          className="reveal-on-scroll"
          style={{
            borderRadius: 32,
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 24px 80px rgba(5,150,105,0.12)',
            padding: 'clamp(32px, 5vw, 60px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 20,
              background: 'rgba(217,119,6,0.1)',
              border: '1px solid rgba(217,119,6,0.3)',
              color: '#d97706', fontSize: 12, fontWeight: 700,
              marginBottom: 24,
            }}
          >
            <Zap size={13} fill="#d97706" /> Flagship Feature
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 900, letterSpacing: '-0.03em',
              color: '#0f172a', marginBottom: 16,
            }}
          >
            Super Intelligence Mode
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, lineHeight: 1.7, marginBottom: 44 }}>
            One query. Three AIs. A synthesized answer that surpasses any individual model.
          </p>

          {/* Pipeline visualization */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flexWrap: 'wrap', justifyContent: 'center', width: '100%',
            }}
          >
            {[
              { label: 'Your Query', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.3)', color: '#059669', icon: '💬' },
              { label: '→', bg: 'transparent', border: 'transparent', color: '#9ca3af', icon: '' },
              { label: 'Groq\nModel A', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.25)', color: '#059669', icon: '🧠' },
              { label: '&', bg: 'transparent', border: 'transparent', color: '#9ca3af', icon: '' },
              { label: 'Gemini\nModel B', bg: 'rgba(8,145,178,0.08)', border: 'rgba(8,145,178,0.25)', color: '#0891b2', icon: '🧠' },
              { label: '→', bg: 'transparent', border: 'transparent', color: '#9ca3af', icon: '' },
              { label: 'Judge AI\nSynthesizes', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.3)', color: '#d97706', icon: '⚖️' },
              { label: '→', bg: 'transparent', border: 'transparent', color: '#9ca3af', icon: '' },
              { label: 'Perfect\nAnswer', bg: 'linear-gradient(135deg,rgba(5,150,105,0.12),rgba(16,185,129,0.08))', border: 'rgba(5,150,105,0.4)', color: '#059669', icon: '✨' },
            ].map((step, i) => (
              step.label === '→' || step.label === '&' ? (
                <span key={i} style={{ fontSize: 20, color: step.color, fontWeight: 300 }}>{step.label}</span>
              ) : (
                <div
                  key={i}
                  style={{
                    padding: '14px 18px', borderRadius: 16,
                    background: step.bg, border: `1.5px solid ${step.border}`,
                    color: step.color, fontWeight: 700, fontSize: 13,
                    textAlign: 'center', lineHeight: 1.4, minWidth: 90,
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 4px 16px ${step.border}`,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{step.icon}</div>
                  {step.label}
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section
        id="features"
        style={{ position: 'relative', zIndex: 10, padding: '40px 24px 100px', maxWidth: 1100, margin: '0 auto' }}
      >
        <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 5vw, 46px)',
              fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 14,
            }}
          >
            Everything you need.
            <br />
            <span style={{ color: '#059669' }}>Nothing you don't.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
            Six powerful capabilities. One elegant interface.
          </p>
        </div>

        <div
          className="reveal-on-scroll"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                padding: 28, borderRadius: 24,
                background: hoveredCard === i
                  ? 'rgba(255,255,255,0.92)'
                  : 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: hoveredCard === i
                  ? `1.5px solid ${f.color}50`
                  : '1px solid rgba(16,185,129,0.15)',
                boxShadow: hoveredCard === i
                  ? `0 16px 48px ${f.glow}`
                  : '0 8px 28px rgba(5,150,105,0.08)',
                transform: hoveredCard === i ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'default',
              }}
            >
              {/* Tag */}
              <div
                style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                  background: `${f.color}15`, color: f.color,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}
              >
                {f.tag}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `linear-gradient(135deg, ${f.color}20, ${f.color}10)`,
                  border: `1.5px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, marginBottom: 18,
                  boxShadow: hoveredCard === i ? `0 4px 16px ${f.glow}` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {f.icon}
              </div>

              <h3
                style={{ fontSize: 19, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.02em' }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 12, fontWeight: 600, color: f.color, marginBottom: 12 }}>
                {f.subtitle}
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section
        style={{
          position: 'relative', zIndex: 10,
          padding: '20px 24px 80px', maxWidth: 1100, margin: '0 auto',
        }}
      >
        <div
          className="reveal-on-scroll"
          style={{
            borderRadius: 28,
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.15)',
            padding: '44px clamp(24px, 5vw, 60px)',
          }}
        >
          <h3
            style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 28, textAlign: 'center', letterSpacing: '-0.02em' }}
          >
            Built With a Serious Stack
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {[
              { name: 'FastAPI', layer: 'Backend', color: '#059669' },
              { name: 'LangChain', layer: 'Orchestration', color: '#7c3aed' },
              { name: 'LangGraph', layer: 'Agentic Pipeline', color: '#0891b2' },
              { name: 'React 18', layer: 'Frontend', color: '#059669' },
              { name: 'TailwindCSS', layer: 'Styling', color: '#0891b2' },
              { name: 'ChromaDB', layer: 'Vector Store', color: '#7c3aed' },
              { name: 'Groq API', layer: 'AI Provider', color: '#059669' },
              { name: 'Gemini', layer: 'AI Provider', color: '#d97706' },
              { name: 'OpenRouter', layer: 'AI Provider', color: '#db2777' },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: `${t.color}08`,
                  border: `1px solid ${t.color}25`,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: t.color, marginBottom: 2 }}>{t.name}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{t.layer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section
        style={{
          position: 'relative', zIndex: 10,
          padding: '20px 24px 120px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}
      >
        <div
          className="reveal-on-scroll"
          style={{
            maxWidth: 640, width: '100%', borderRadius: 36,
            padding: 'clamp(40px,6vw,72px) clamp(28px,6vw,64px)',
            background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.05) 100%)',
            border: '1.5px solid rgba(5,150,105,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 80px rgba(5,150,105,0.15)',
          }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: '0 0 40px rgba(5,150,105,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="white" />
              <circle cx="5" cy="6" r="2" fill="white" opacity="0.7" />
              <circle cx="19" cy="6" r="2" fill="white" opacity="0.7" />
              <circle cx="5" cy="18" r="2" fill="white" opacity="0.7" />
              <circle cx="19" cy="18" r="2" fill="white" opacity="0.7" />
              <line x1="12" y1="9" x2="5" y2="7" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="12" y1="9" x2="19" y2="7" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="12" y1="15" x2="5" y2="17" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="12" y1="15" x2="19" y2="17" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 900, color: '#0f172a', marginBottom: 14, letterSpacing: '-0.03em',
            }}
          >
            Ready to think smarter?
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, lineHeight: 1.7 }}>
            ShanXBot is free to use — just bring your API keys.<br />
            Built with love by <strong style={{ color: '#059669' }}>Shanmukh Datta</strong>.
          </p>
          <button
            onClick={onEnter}
            style={{
              padding: '18px 48px', borderRadius: 50, fontSize: 17, fontWeight: 800,
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(5,150,105,0.45)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              letterSpacing: '-0.01em',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 14px 44px rgba(5,150,105,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(5,150,105,0.45)'
            }}
          >
            Launch ShanXBot <ArrowRight size={20} />
          </button>
        </div>

      </section>

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          background: '#0f172a', /* Dark black/slate color */
          color: '#ffffff',
          padding: '48px 24px',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: '#ffffff' }}>
              ShanX<span style={{ color: '#10b981' }}>Bot</span>
            </span>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
              v1.0
            </span>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
              Built with <span style={{ color: '#ef4444' }}>♥</span> by <strong style={{ color: '#ffffff', fontWeight: 700 }}>Shanmukh Datta</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* Global keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

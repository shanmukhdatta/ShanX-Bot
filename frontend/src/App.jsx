import { useState, useEffect, useRef, useCallback } from 'react'
import NeuralBackground from './components/NeuralBackground'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MessageBubble, { ThinkingIndicator } from './components/MessageBubble'
import InputBar from './components/InputBar'
import RightPanel from './components/RightPanel'
import SettingsModal from './components/SettingsModal'
import Footer from './components/Footer'
import IntroPage from './components/IntroPage'
import AuthGate from './components/AuthGate'
import ConnectionStatus from './components/ConnectionStatus'
import SuperIntelPanel from './components/SuperIntelPanel'
import { useChatStore } from './stores/chatStore'
import { useSettingsStore } from './stores/settingsStore'
import { useAuthStore } from './stores/authStore'

// During deployment, VITE_API_BASE should be set to your Railway backend URL.
const API_BASE = import.meta.env.VITE_API_BASE // || 'http://localhost:8000'


// ─── view states ─────────────────────────────────────────────────────────────
// 'intro'    → Landing / intro page
// 'auth'     → Sign in / demo gate
// 'chat'     → Main chat UI
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onGoHome }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-12 animate-fade-in">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          boxShadow: '0 0 40px rgba(5,150,105,0.35)',
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
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
      <div className="text-center">
        <h2
          onClick={onGoHome}
          className="font-display font-bold text-3xl text-gray-900 mb-2 logo-glow cursor-pointer"
          style={{ letterSpacing: '-0.03em' }}
        >
          ShanXBot
        </h2>
        <p className="text-gray-500 text-sm mb-1">Think in Parallel. Answer in Perfect.</p>
        <p className="text-gray-400 text-xs">Built by Shanmukh Datta</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {[
          { icon: '🧠', title: 'Multi-Model AI', desc: 'Powered by Groq, Gemini & more' },
          { icon: '⚡', title: 'Super Intelligence', desc: 'Parallel reasoning synthesis' },
          { icon: '📄', title: 'Document RAG', desc: 'Chat with your documents' },
          { icon: '🔊', title: 'Voice Input', desc: 'Speak your queries naturally' },
        ].map((item, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl transition-all glass-hover"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.2)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
            }}
          >
            <span className="text-2xl block mb-1.5">{item.icon}</span>
            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Start a conversation below. For best results, add your API keys in Settings.
      </p>
    </div>
  )
}

export default function App() {
  // ── view ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState('intro') // 'intro' | 'auth' | 'chat'

  // ── ui state ──────────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState(null)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)

  // ── stores ────────────────────────────────────────────────────────────────
  const {
    sessions, currentSessionId, isStreaming, mode,
    addMessage, updateLastMessage, setStreaming,
    setSuperIntelStep, setSuperIntelData, setSuperIntelTiming, resetSuperIntelTiming,
    attachSuperIntelData,
    getCurrentSession, createSession, initForUser, persistCurrentSession,
    setRagStatus, ragStatus,
  } = useChatStore()

  const { systemPrompt, modelPreferences, getHeaders, fontSize } = useSettingsStore()

  const { user, isDemo, loading, initAuth, setDbConnected } = useAuthStore()

  // ── bootstrap ─────────────────────────────────────────────────────────────

  // Init Firebase auth listener once
  useEffect(() => { initAuth() }, [])

  // When user auth state resolves, load their sessions and navigate
  useEffect(() => {
    if (loading) return
    if (user) {
      // User is authenticated (Google or demo) — load their sessions
      initForUser(user.uid).then(() => {
        // Navigate to chat from any non-chat view (handles reload + auth gate)
        if (view !== 'chat') setView('chat')
      })
    } else {
      // User signed out — send back to auth gate
      if (view === 'chat') setView('auth')
    }
  }, [user, loading])

  // Check backend health
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`)
        setBackendOnline(res.ok)
      } catch {
        setBackendOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessions, streamingContent])

  // ── derived ───────────────────────────────────────────────────────────────
  const currentSession = getCurrentSession()
  const messages = currentSession?.messages || []
  const fontSizeMap = { sm: '13px', md: '15px', lg: '17px' }
  const uid = user?.uid

  // ── handlers ──────────────────────────────────────────────────────────────

  // Called by IntroPage's "Start Chatting" / "Open Chat" / "Launch ShanXBot"
  const handleEnterFromIntro = () => {
    if (user) {
      // Already authenticated — go straight to chat
      setView('chat')
    } else {
      setView('auth')
    }
  }

  const sendMessage = useCallback(async (content) => {
    if (isStreaming) return
    if (!currentSessionId) createSession(uid)

    addMessage({ role: 'user', content }, uid)
    addMessage({ role: 'assistant', content: '' }, uid)
    setStreamingMessageId(Date.now())
    setStreamingContent('')
    setStreaming(true)

    const headers = getHeaders()
    const body = {
      message: content,
      session_id: currentSessionId,
      system_prompt: systemPrompt,
      model: modelPreferences.primary,
      rag_enabled: ragStatus.active,
    }

    if (mode === 'superintelligence') {
      await handleSuperIntel(content, headers, body)
    } else {
      await handleStreamChat(content, headers, body)
    }
  }, [isStreaming, currentSessionId, mode, ragStatus.active, systemPrompt, modelPreferences, uid])

  const handleStreamChat = async (content, headers, body) => {
    let fullText = ''
    let lastUpdateTime = 0
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current?.signal,
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const token = parsed.token || parsed.text || parsed.content || ''
              if (token) {
                fullText += token
                const now = Date.now()
                if (now - lastUpdateTime > 30) {
                  setStreamingContent(fullText)
                  updateLastMessage(fullText)
                  lastUpdateTime = now
                }
              }
            } catch { /* skip */ }
          }
        }
      }
      updateLastMessage(fullText || 'No response received.')
    } catch (err) {
      if (err.name === 'AbortError') {
        updateLastMessage(fullText || '(Response cancelled)')
      } else {
        updateLastMessage('')
        addMessage({
          role: 'assistant',
          content: `**Error:** ${err.message}\n\nPlease check your API keys in Settings and ensure the backend is running.`,
          isError: true,
        }, uid)
      }
    } finally {
      setStreaming(false)
      setStreamingMessageId(null)
      setStreamingContent('')
      persistCurrentSession(uid)
    }
  }

  const handleSuperIntel = async (content, headers, body) => {
    resetSuperIntelTiming()
    setSuperIntelStep(1)
    setSuperIntelTiming({ step1Start: Date.now() })
    const abortController = new AbortController()
    abortRef.current = abortController
    let step1Timeout, step2Timeout
    try {
      step1Timeout = setTimeout(() => {
        setSuperIntelTiming({ step1End: Date.now(), step2Start: Date.now() })
        setSuperIntelStep(2)
      }, 2500)
      step2Timeout = setTimeout(() => {
        setSuperIntelTiming({ step2End: Date.now(), step3Start: Date.now() })
        setSuperIntelStep(3)
      }, 5000)
      const response = await fetch(`${API_BASE}/chat/superintel`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })
      clearTimeout(step1Timeout)
      clearTimeout(step2Timeout)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error ${response.status}`)
      }
      const data = await response.json()
      setSuperIntelTiming({ step3End: Date.now() })
      const finalText = data.final_response || data.response || 'No response'
      setSuperIntelStep(0)
      await new Promise(r => setTimeout(r, 400))
      const words = finalText.split(/(\s+)/)
      let accumulated = ''
      for (const word of words) {
        accumulated += word
        setStreamingContent(accumulated)
        updateLastMessage(accumulated)
        await new Promise(r => setTimeout(r, 25))
      }
      updateLastMessage(finalText)
      attachSuperIntelData(data, uid)
    } catch (err) {
      clearTimeout(step1Timeout)
      clearTimeout(step2Timeout)
      if (err.name === 'AbortError') {
        updateLastMessage('(Super Intelligence cancelled)')
      } else {
        addMessage({
          role: 'assistant',
          content: `**Super Intelligence Error:** ${err.message}`,
          isError: true,
        }, uid)
      }
    } finally {
      setStreaming(false)
      setSuperIntelStep(0)
      setStreamingMessageId(null)
      setStreamingContent('')
      persistCurrentSession(uid)
    }
  }

  const handleFileAttach = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/rag/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      const data = await res.json()
      setRagStatus({ active: true, filename: file.name, chunkCount: data.chunk_count || 0 })
      addMessage({
        role: 'assistant',
        content: `📄 **Document loaded:** \`${file.name}\`\n\nI've indexed this document. You can now ask me questions about its contents!`,
      }, uid)
    } catch {
      addMessage({
        role: 'assistant',
        content: '❌ Failed to upload document. Please check your connection and try again.',
        isError: true,
      }, uid)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (view === 'intro') {
    return <IntroPage onEnter={handleEnterFromIntro} />
  }

  if (view === 'auth' && !user) {
    return <AuthGate onGoHome={() => setView('intro')} />
  }

  // Loading spinner while sessions are being fetched (only when authenticated, not during sign-out)
  if (user && !currentSessionId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #d1fae5', borderTop: '3px solid #059669', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>Loading your chats…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ fontSize: fontSizeMap[fontSize] || '15px' }}
    >
      <NeuralBackground />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-shrink-0 z-40 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative h-full`}
        style={{ width: 280 }}
      >
        <Sidebar
          onOpenSettings={() => { setSettingsOpen(true); setSidebarOpen(false) }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onGoHome={() => setView('intro')}
        />
      </div>

      <div
        className="flex flex-col flex-1 min-w-0 relative z-10"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(2px)' }}
      >
        <TopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          backendOnline={backendOnline}
          onGoHome={() => setView('intro')}
        />

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.length === 0 ? (
            <EmptyState onGoHome={() => setView('intro')} />
          ) : (
            <>
              {messages.map((msg, i) => {
                const isLastAI = msg.role === 'assistant' && i === messages.length - 1
                const showStreaming = isLastAI && isStreaming
                return (
                  <MessageBubble
                    key={msg.id || i}
                    message={showStreaming ? { ...msg, content: streamingContent } : msg}
                    isStreaming={showStreaming}
                  />
                )
              })}
              {isStreaming && mode !== 'superintelligence' && messages[messages.length - 1]?.role !== 'assistant' && (
                <ThinkingIndicator />
              )}
              <SuperIntelPanel />
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <InputBar
          onSend={sendMessage}
          onFileAttach={handleFileAttach}
          disabled={!currentSessionId}
        />
      </div>

      <div
        className={`flex-shrink-0 z-10 transition-all duration-300 hidden md:flex`}
        style={{ width: rightPanelCollapsed ? 24 : 300 }}
      >
        <RightPanel
          collapsed={rightPanelCollapsed}
          onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
        />
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {/* Connection status widget — bottom-right */}
      <ConnectionStatus backendOnline={backendOnline} />

      <Footer />
    </div>
  )
}

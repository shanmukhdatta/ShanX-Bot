import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, Info, Terminal, X, RotateCcw, Check } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'

function SystemPromptPanel({ onClose }) {
  const { systemPrompt, setSystemPrompt, resetSystemPrompt } = useSettingsStore()
  const [localPrompt, setLocalPrompt] = useState(systemPrompt)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => { textareaRef.current?.focus() }, [])

  const handleSave = () => {
    setSystemPrompt(localPrompt)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetSystemPrompt()
    setLocalPrompt(useSettingsStore.getState().systemPrompt)
  }

  return (
    <div style={{
      marginBottom: 12, borderRadius: 20,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1.5px solid rgba(5,150,105,0.25)',
      boxShadow: '0 12px 40px rgba(5,150,105,0.15)',
      overflow: 'hidden', animation: 'slideUpPanel 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid rgba(5,150,105,0.1)',
        background: 'rgba(5,150,105,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #059669, #047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(5,150,105,0.35)',
          }}>
            <Terminal size={13} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>System Prompt</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Shapes AI behavior for this session</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={handleReset} title="Reset to default" style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            color: '#9ca3af', background: 'transparent',
            border: '1px solid rgba(156,163,175,0.3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
          }}>
            <RotateCcw size={10} /> Reset
          </button>
          <button onClick={onClose} style={{
            width: 26, height: 26, borderRadius: 8, border: 'none',
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={13} />
          </button>
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={(e) => { setLocalPrompt(e.target.value); setSaved(false) }}
          placeholder="e.g. You are a helpful coding assistant. Always use Python. Be concise."
          rows={4}
          style={{
            width: '100%', borderRadius: 12, padding: '10px 14px',
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(5,150,105,0.2)',
            color: '#111827', fontSize: 13, lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            resize: 'none', outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(5,150,105,0.5)'
            e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(5,150,105,0.2)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 14px',
      }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {localPrompt.length} chars · Applied to all new messages
        </span>
        <button
          onClick={handleSave}
          style={{
            padding: '7px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.35)',
            display: 'flex', alignItems: 'center', gap: 5,
            opacity: localPrompt === systemPrompt && !saved ? 0.65 : 1,
            transition: 'all 0.2s',
          }}
        >
          {saved ? <><Check size={12} /> Saved!</> : 'Apply Prompt'}
        </button>
      </div>
      <style>{`
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function InputBar({ onSend, onFileAttach, disabled }) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const { mode, setMode, isStreaming } = useChatStore()
  const { systemPrompt } = useSettingsStore()
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [text])

  const handleSend = () => {
    if (!text.trim() || isStreaming || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.'); return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript
      setText(transcript)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.start(); recognitionRef.current = recognition; setIsRecording(true)
  }

  const stopVoice = () => { if (recognitionRef.current) recognitionRef.current.stop(); setIsRecording(false) }
  const toggleVoice = () => { if (isRecording) stopVoice(); else startVoice() }

  const isSuperIntel = mode === 'superintelligence'
  const canSend = text.trim() && !isStreaming && !disabled
  const hasCustomPrompt = systemPrompt && systemPrompt.trim().length > 0

  return (
    <div className="px-4 pb-4 pt-2">
      {showSystemPrompt && <SystemPromptPanel onClose={() => setShowSystemPrompt(false)} />}

      {/* Mode Toggle */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMode(isSuperIntel ? 'standard' : 'superintelligence')}
            className="flex items-center gap-1.5"
            aria-label="Toggle Super Intelligence mode"
          >
            <div
              className="relative w-10 h-5 rounded-full transition-all duration-300"
              style={{
                background: isSuperIntel ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(156,163,175,0.4)',
                boxShadow: isSuperIntel ? '0 0 12px rgba(217,119,6,0.4)' : 'none',
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: isSuperIntel ? '22px' : '2px' }}
              />
            </div>
            <span className="text-xs font-semibold transition-colors" style={{ color: isSuperIntel ? '#d97706' : '#9ca3af' }}>
              {isSuperIntel ? '⚡ Super Intelligence' : 'Standard Mode'}
            </span>
          </button>
          {isSuperIntel && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Info size={11} /><span>Takes longer, thinks smarter</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Panel */}
      <div
        className="rounded-2xl p-3 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 8px 32px rgba(5,150,105,0.12)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ShanXBot... (Shift+Enter for new line)"
          disabled={isStreaming || disabled}
          rows={1}
          className="w-full bg-transparent text-gray-900 text-sm leading-relaxed resize-none outline-none placeholder-gray-400"
          style={{ minHeight: '24px', maxHeight: '160px', fontFamily: "'DM Sans', sans-serif" }}
          aria-label="Message input"
        />

        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
          <div className="flex items-center gap-1">
            {/* Attach */}
            <label className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer" title="Attach file">
              <Paperclip size={16} />
              <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.csv"
                onChange={(e) => e.target.files?.[0] && onFileAttach(e.target.files[0])} />
            </label>

            {/* Voice */}
            <div className="relative">
              {isRecording && (
                <>
                  <div className="mic-ripple absolute inset-0 rounded-full" style={{ inset: '-8px' }} />
                  <div className="mic-ripple absolute inset-0 rounded-full" style={{ inset: '-8px', animationDelay: '0.5s' }} />
                </>
              )}
              <button onClick={toggleVoice} className="relative p-2 rounded-xl transition-all"
                style={{
                  color: isRecording ? '#fff' : '#9ca3af',
                  background: isRecording ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
                }}
                title={isRecording ? 'Stop recording' : 'Voice input'} aria-label="Voice input"
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              {!isRecording && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-emerald-500 font-medium whitespace-nowrap" style={{ fontSize: '9px' }}>
                  Voice
                </span>
              )}
            </div>

            {/* System Prompt Button */}
            <div className="relative">
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="p-2 rounded-xl transition-all"
                style={{
                  color: showSystemPrompt ? '#fff' : hasCustomPrompt ? '#059669' : '#9ca3af',
                  background: showSystemPrompt
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : hasCustomPrompt ? 'rgba(5,150,105,0.08)' : 'transparent',
                  border: hasCustomPrompt && !showSystemPrompt ? '1px solid rgba(5,150,105,0.25)' : '1px solid transparent',
                  boxShadow: showSystemPrompt ? '0 4px 12px rgba(5,150,105,0.35)' : 'none',
                  position: 'relative',
                }}
                title="Edit system prompt"
                aria-label="System prompt"
              >
                <Terminal size={16} />
                {hasCustomPrompt && !showSystemPrompt && (
                  <span style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#059669', border: '1px solid white',
                  }} />
                )}
              </button>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap"
                style={{ fontSize: '9px', color: showSystemPrompt ? '#059669' : hasCustomPrompt ? '#059669' : '#9ca3af' }}>
                System
              </span>
            </div>
          </div>

          {/* Right: send */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{text.length > 0 && `${text.length} chars`}</span>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: canSend ? 'linear-gradient(135deg, #059669, #047857)' : 'rgba(156,163,175,0.2)',
                boxShadow: canSend ? '0 4px 12px rgba(5,150,105,0.35)' : 'none',
                transform: canSend ? 'scale(1)' : 'scale(0.95)',
              }}
              aria-label="Send message"
            >
              <Send size={14} color={canSend ? 'white' : '#9ca3af'} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Built with ♥ by{' '}
        <span className="text-emerald-600 font-semibold">Shanmukh Datta</span>
        {' '}· ShanXBot may make mistakes
      </p>
    </div>
  )
}

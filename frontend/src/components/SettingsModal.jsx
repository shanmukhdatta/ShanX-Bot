import { useState } from 'react'
import { X, Eye, EyeOff, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react'
import { useSettingsStore } from '../stores/settingsStore'
import axios from 'axios'

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
]

const OPENROUTER_MODELS = [
  'mistralai/mistral-7b-instruct',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.1-8b-instruct',
  'nousresearch/hermes-3-llama-3.1-405b',
]

function KeyInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-9 rounded-xl text-sm outline-none transition-all font-mono"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#111827',
          }}
          onFocus={e => {
            e.target.style.border = '1px solid rgba(16,185,129,0.6)'
            e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'
          }}
          onBlur={e => {
            e.target.style.border = '1px solid rgba(16,185,129,0.2)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsModal({ onClose }) {
  const {
    apiKeys, setApiKeys,
    systemPrompt, setSystemPrompt, resetSystemPrompt,
    modelPreferences, setModelPreferences,
    fontSize, setFontSize,
  } = useSettingsStore()

  const [localKeys, setLocalKeys] = useState({ ...apiKeys })
  const [validating, setValidating] = useState(false)
  const [validationResults, setValidationResults] = useState(null)
  const [activeTab, setActiveTab] = useState('keys')

  const tabs = [
    { id: 'keys', label: '🔑 API Keys' },
    { id: 'prompt', label: '💬 System Prompt' },
    { id: 'models', label: '🤖 Models' },
    { id: 'appearance', label: '🎨 Appearance' },
  ]

  const handleSaveKeys = () => {
    setApiKeys(localKeys)
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      const res = await axios.post('http://localhost:8000/settings/validate', {}, {
        headers: {
          'x-groq-key': localKeys.groq,
          'x-gemini-key': localKeys.gemini,
          'x-openrouter-key': localKeys.openrouter,
        },
      })
      setValidationResults(res.data)
    } catch {
      setValidationResults({ groq: false, gemini: false, openrouter: false })
    } finally {
      setValidating(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    color: '#111827',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16,185,129,0.25)',
          boxShadow: '0 24px 64px rgba(5,150,105,0.2)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(16,185,129,0.12)' }}
        >
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure ShanXBot to your preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-5 pt-4"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(5,150,105,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#059669' : '#6b7280',
                border: activeTab === tab.id ? '1px solid rgba(5,150,105,0.2)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {activeTab === 'keys' && (
            <>
              <KeyInput
                label="Groq API Key"
                value={localKeys.groq}
                onChange={(v) => setLocalKeys(k => ({ ...k, groq: v }))}
                placeholder="gsk_..."
              />
              {validationResults && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {validationResults.groq
                    ? <><CheckCircle size={12} color="#059669" /><span className="text-emerald-600">Valid</span></>
                    : <><XCircle size={12} color="#ef4444" /><span className="text-red-500">Invalid</span></>}
                </div>
              )}

              <KeyInput
                label="Google Gemini API Key"
                value={localKeys.gemini}
                onChange={(v) => setLocalKeys(k => ({ ...k, gemini: v }))}
                placeholder="AIza..."
              />
              {validationResults && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {validationResults.gemini
                    ? <><CheckCircle size={12} color="#059669" /><span className="text-emerald-600">Valid</span></>
                    : <><XCircle size={12} color="#ef4444" /><span className="text-red-500">Invalid</span></>}
                </div>
              )}

              <KeyInput
                label="OpenRouter API Key"
                value={localKeys.openrouter}
                onChange={(v) => setLocalKeys(k => ({ ...k, openrouter: v }))}
                placeholder="sk-or-..."
              />
              {validationResults && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {validationResults.openrouter
                    ? <><CheckCircle size={12} color="#059669" /><span className="text-emerald-600">Valid</span></>
                    : <><XCircle size={12} color="#ef4444" /><span className="text-red-500">Invalid</span></>}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(5,150,105,0.1)',
                    border: '1px solid rgba(5,150,105,0.2)',
                    color: '#059669',
                  }}
                >
                  {validating ? <Loader2 size={14} className="animate-spin" /> : null}
                  Validate Keys
                </button>
                <button
                  onClick={handleSaveKeys}
                  className="btn-emerald flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white"
                >
                  Save Keys
                </button>
              </div>
            </>
          )}

          {activeTab === 'prompt' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">System Prompt</label>
                  <span className="text-xs text-gray-400">{systemPrompt.length}/2000</span>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={8}
                  maxLength={2000}
                  className="resize-none text-sm leading-relaxed"
                  style={{ ...inputStyle }}
                  placeholder="Enter system prompt..."
                />
              </div>
              <button
                onClick={resetSystemPrompt}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <RotateCcw size={12} />
                Reset to Default
              </button>
            </>
          )}

          {activeTab === 'models' && (
            <>
              {[
                { label: 'Primary Model (Groq)', key: 'primary', options: GROQ_MODELS },
                { label: 'Backup 1 (Gemini)', key: 'backup1', options: GEMINI_MODELS },
                { label: 'Backup 2 (OpenRouter)', key: 'backup2', options: OPENROUTER_MODELS },
                { label: 'Judge Model (Super Intel)', key: 'judge', options: GROQ_MODELS, recommended: 'llama-3.3-70b-versatile' },
              ].map(({ label, key, options, recommended }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                  <select
                    value={modelPreferences[key]}
                    onChange={(e) => setModelPreferences({ [key]: e.target.value })}
                    style={{ ...inputStyle }}
                  >
                    {options.map(m => (
                      <option key={m} value={m}>
                        {m}{m === recommended ? ' ⭐ Recommended' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Font Size</label>
                <div className="flex gap-2">
                  {['sm', 'md', 'lg'].map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize"
                      style={{
                        background: fontSize === size ? 'rgba(5,150,105,0.1)' : 'rgba(255,255,255,0.6)',
                        border: fontSize === size ? '1px solid rgba(5,150,105,0.3)' : '1px solid rgba(16,185,129,0.15)',
                        color: fontSize === size ? '#059669' : '#6b7280',
                      }}
                    >
                      {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}
        >
          <p className="text-xs text-gray-400">
            Built by <span className="text-emerald-600 font-semibold">Shanmukh Datta</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

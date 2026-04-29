import { useState, useRef } from 'react'
import { Upload, FileText, X, ChevronRight, ChevronLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'
import axios from 'axios'

function StatusDot({ status }) {
  const colors = {
    active: '#10b981',
    standby: '#f59e0b',
    failed: '#ef4444',
  }
  const labels = { active: 'Active', standby: 'Standby', failed: 'Failed' }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${status === 'active' ? 'status-active' : ''}`}
        style={{ background: colors[status] || '#9ca3af' }}
      />
      <span className="text-xs" style={{ color: colors[status] }}>{labels[status] || status}</span>
    </div>
  )
}



export default function RightPanel({ collapsed, onToggle }) {
  const { ragStatus, setRagStatus, modelStatus, superIntelStep, mode } = useChatStore()
  const { modelPreferences, getHeaders } = useSettingsStore()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async (file) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('http://localhost:8000/rag/upload', formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      setRagStatus({
        active: true,
        filename: file.name,
        chunkCount: res.data.chunk_count || 0,
      })
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handleClearRag = async () => {
    try {
      await axios.delete('http://localhost:8000/rag/clear', { headers: getHeaders() })
      setRagStatus({ active: false, filename: '', chunkCount: 0 })
    } catch (err) {
      setRagStatus({ active: false, filename: '', chunkCount: 0 })
    }
  }

  const modelEntries = [
    { label: 'Primary', key: 'primary', model: modelPreferences.primary },
    { label: 'Backup 1', key: 'backup1', model: modelPreferences.backup1 },
    { label: 'Backup 2', key: 'backup2', model: modelPreferences.backup2 },
  ]

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-6 h-full"
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(16,185,129,0.15)',
        }}
        aria-label="Expand right panel"
      >
        <ChevronLeft size={14} color="#059669" />
      </button>
    )
  }

  return (
    <div
      className="flex flex-col h-full overflow-y-auto right-panel-fixed"
      style={{
        width: 300,
        background: 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(16,185,129,0.15)',
        boxShadow: '-4px 0 24px rgba(5,150,105,0.06)',
      }}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assistant Panel</h2>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>



        {/* RAG Section */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
          }}
        >
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            📄 Document Context
          </h3>

          {ragStatus.active ? (
            <div>
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl mb-2 rag-active-glow"
                style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}
              >
                <FileText size={14} color="#059669" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 truncate">{ragStatus.filename}</p>
                  <p className="text-xs text-emerald-500">{ragStatus.chunkCount} chunks indexed</p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#059669', color: 'white' }}
                >
                  RAG Active
                </span>
              </div>
              <button
                onClick={handleClearRag}
                className="w-full text-xs text-red-400 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-all"
              >
                Clear Document
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#059669' : 'rgba(16,185,129,0.3)',
                background: dragOver ? 'rgba(5,150,105,0.04)' : 'transparent',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) handleUpload(file)
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={20} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-xs font-medium text-gray-600">Drop file or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD, CSV</p>
              {uploading && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-emerald-500 mt-1">{uploadProgress}%</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.csv"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* Model Status */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
          }}
        >
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            🤖 Model Status
          </h3>
          <div className="space-y-2">
            {modelEntries.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{ background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}
              >
                <div>
                  <p className="text-xs font-semibold text-gray-700">{entry.label}</p>
                  <p className="text-xs text-gray-400 font-mono truncate max-w-28">{entry.model}</p>
                </div>
                <StatusDot status={modelStatus[entry.key] || 'standby'} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
          }}
        >
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            💡 Tips
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">•</span>
              Upload a document to ask questions about it
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">•</span>
              Use ⚡ Super Intelligence for complex reasoning
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">•</span>
              Shift+Enter for newlines in the input
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">•</span>
              Use the mic icon for voice input
            </li>
          </ul>
        </div>

        {/* Attribution */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            Built with{' '}
            <span style={{ color: '#f43f5e' }}>♥</span>
            {' '}by{' '}
            <span className="font-semibold text-emerald-600">Shanmukh Datta</span>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Plus, Trash2, Settings, MessageSquare, LogOut, User } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

export default function Sidebar({ onOpenSettings, isOpen, onClose, onGoHome }) {
  const { sessions, currentSessionId, createSession, setCurrentSession, deleteSession, clearForUser } = useChatStore()
  const { user, isDemo, signOut } = useAuthStore()
  const [deletingId, setDeletingId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  const uid = user?.uid

  const handleNew = () => {
    createSession(uid)
    onClose?.()
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
    setTimeout(() => {
      deleteSession(id, uid)
      setDeletingId(null)
    }, 450)
  }

  const handleSelect = (id) => {
    setCurrentSession(id)
    onClose?.()
  }

  const handleSignOut = async () => {
    clearForUser()
    await signOut()
  }

  return (
    <div
      className={`sidebar-fixed flex flex-col h-full z-40 transition-all duration-300 ${isOpen ? 'open' : ''}`}
      style={{
        width: 280,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(16,185,129,0.18)',
        boxShadow: '4px 0 24px rgba(5,150,105,0.08)',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div className="p-5 pb-4 cursor-pointer" onClick={onGoHome} title="Go to Home Page">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="white" />
              <circle cx="5" cy="6" r="2" fill="white" opacity="0.7" />
              <circle cx="19" cy="6" r="2" fill="white" opacity="0.7" />
              <circle cx="5" cy="18" r="2" fill="white" opacity="0.7" />
              <circle cx="19" cy="18" r="2" fill="white" opacity="0.7" />
              <line x1="12" y1="9" x2="5" y2="7" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="12" y1="9" x2="19" y2="7" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="12" y1="15" x2="5" y2="17" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="12" y1="15" x2="19" y2="17" stroke="white" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
          <div>
            <h1
              className="font-display font-bold text-emerald-600 text-lg leading-none logo-glow"
              style={{ letterSpacing: '-0.02em' }}
            >
              ShanXBot
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-sans">Think in Parallel.</p>
          </div>
        </div>
      </div>

      {/* User info strip */}
      {user && (
        <div
          style={{
            margin: '0 12px 12px',
            padding: '10px 12px',
            borderRadius: 12,
            background: isDemo ? 'rgba(217,119,6,0.07)' : 'rgba(5,150,105,0.07)',
            border: `1px solid ${isDemo ? 'rgba(217,119,6,0.18)' : 'rgba(5,150,105,0.18)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: isDemo ? 'rgba(217,119,6,0.2)' : 'rgba(5,150,105,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={14} color={isDemo ? '#d97706' : '#059669'} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isDemo ? 'Demo Mode' : (user.displayName || user.email)}
            </p>
            {isDemo && (
              <p style={{ fontSize: 10, color: '#d97706' }}>Local storage only</p>
            )}
          </div>
        </div>
      )}

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <button
          onClick={handleNew}
          className="btn-emerald w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm group relative overflow-hidden"
        >
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus size={16} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
            <p>No chats yet</p>
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`sidebar-item relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer group ${
                session.id === currentSessionId ? 'active' : ''
              } ${deletingId === session.id ? 'deleting' : ''}`}
              onClick={() => handleSelect(session.id)}
              onMouseEnter={() => setHoveredId(session.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <MessageSquare
                size={14}
                className={session.id === currentSessionId ? 'text-emerald-600' : 'text-gray-400'}
                style={{ flexShrink: 0 }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate font-medium ${
                  session.id === currentSessionId ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {session.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(session.updatedAt)}</p>
              </div>
              {hoveredId === session.id && (
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className="p-4 border-t flex items-center justify-between"
        style={{ borderColor: 'rgba(16,185,129,0.12)' }}
      >
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm font-medium"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm"
        >
          <LogOut size={14} />
          <span className="text-xs">Sign out</span>
        </button>
      </div>
    </div>
  )
}

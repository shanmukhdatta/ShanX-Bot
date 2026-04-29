import { useState } from 'react'
import { Menu, Wifi, WifiOff, Zap, Activity } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function TopBar({ onMenuToggle, backendOnline, onGoHome }) {
  const { mode, modelStatus } = useChatStore()
  const isSuperIntel = mode === 'superintelligence'

  return (
    <div
      className="flex items-center px-5 py-3.5 gap-4"
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16,185,129,0.12)',
        boxShadow: '0 2px 16px rgba(5,150,105,0.06)',
      }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all md:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Logo/Title */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={onGoHome} title="Go to Home Page">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            boxShadow: '0 0 12px rgba(5,150,105,0.3)',
          }}
        >
          <Activity size={13} color="white" />
        </div>
        <span className="font-display font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
          ShanXBot
        </span>
      </div>

      {/* Mode Badge */}
      <div
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          background: isSuperIntel ? 'rgba(217,119,6,0.1)' : 'rgba(5,150,105,0.08)',
          color: isSuperIntel ? '#d97706' : '#059669',
          border: `1px solid ${isSuperIntel ? 'rgba(217,119,6,0.25)' : 'rgba(5,150,105,0.2)'}`,
        }}
      >
        {isSuperIntel ? '⚡ Super Intelligence' : '✦ Standard'}
      </div>

      <div className="flex-1" />

      {/* Model dots */}
      <div className="hidden sm:flex items-center gap-2">
        {[
          { key: 'primary', label: 'P' },
          { key: 'backup1', label: 'B1' },
          { key: 'backup2', label: 'B2' },
        ].map(({ key, label }) => {
          const status = modelStatus[key] || 'standby'
          const colors = { active: '#10b981', standby: '#f59e0b', failed: '#ef4444' }
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(16,185,129,0.12)',
              }}
              title={`${label}: ${status}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'status-active' : ''}`}
                style={{ background: colors[status] }}
              />
              <span className="text-gray-500">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Backend Status */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
        style={{
          background: backendOnline ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${backendOnline ? 'rgba(5,150,105,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: backendOnline ? '#059669' : '#ef4444',
        }}
      >
        {backendOnline
          ? <><Wifi size={12} /><span className="hidden sm:inline">Online</span></>
          : <><WifiOff size={12} /><span className="hidden sm:inline">Offline</span></>}
      </div>
    </div>
  )
}

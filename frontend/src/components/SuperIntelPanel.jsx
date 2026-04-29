import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Loader2, Brain, Scale } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function SuperIntelPanel() {
  const { superIntelStep, superIntelTiming } = useChatStore()
  const [elapsed, setElapsed] = useState(0)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)

  // Sync exiting state
  useEffect(() => {
    if (superIntelStep === 0 && elapsed > 0) {
      setExiting(true)
      const timeout = setTimeout(() => {
        setExiting(false)
        setElapsed(0)
      }, 800) // Match fade out duration
      return () => clearTimeout(timeout)
    } else if (superIntelStep > 0) {
      setExiting(false)
    }
  }, [superIntelStep])

  // Timer logic
  useEffect(() => {
    if (superIntelStep > 0 && !exiting) {
      const start = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - start) / 1000)
      }, 100)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [superIntelStep, exiting])

  if (superIntelStep === 0 && !exiting) return null

  const steps = [
    { label: 'Model A Reasoning', icon: <Brain size={14} />, key: 1, start: superIntelTiming.step1Start, end: superIntelTiming.step1End },
    { label: 'Model B Parallel Thinking', icon: <Brain size={14} />, key: 2, start: superIntelTiming.step2Start, end: superIntelTiming.step2End },
    { label: 'Intelligence Synthesis', icon: <Scale size={14} />, key: 3, start: superIntelTiming.step3Start, end: superIntelTiming.step3End },
  ]

  const calculateDuration = (start, end) => {
    if (!start) return null
    const duration = end ? (end - start) / 1000 : (Date.now() - start) / 1000
    return duration.toFixed(1) + 's'
  }

  return (
    <div
      className={`super-intel-panel fixed z-50 transition-all duration-700 ease-in-out ${
        exiting ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      style={{
        left: '50%',
        transform: exiting ? 'translate(-50%, 20px)' : 'translate(-50%, 0)',
        bottom: '100px',
        width: 'min(400px, 90vw)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 20px 50px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)',
        padding: '20px',
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">Super Intelligence</h3>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Parallel Processing</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-emerald-600 tabular-nums">
            {elapsed.toFixed(1)}s
          </span>
          <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Elapsed Time</p>
        </div>
      </div>

      <div className="space-y-3 relative">
        {/* Connection Line */}
        <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-emerald-100/50" />
        
        {steps.map((s, i) => {
          const isDone = superIntelStep > s.key
          const isActive = superIntelStep === s.key
          const isPending = superIntelStep < s.key
          
          const duration = calculateDuration(s.start, s.end)

          return (
            <div key={i} className="relative flex items-center gap-4 group">
              {/* Node Icon */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                  isDone ? 'bg-emerald-500 text-white' : 
                  isActive ? 'bg-white border-2 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                  'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? <CheckCircle size={14} /> : isActive ? <Loader2 size={14} className="animate-spin" /> : s.icon}
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-between">
                <div className="flex flex-col">
                  <span 
                    className={`text-xs font-semibold transition-colors duration-300 ${
                      isDone ? 'text-emerald-700' : isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  {isActive && i < 2 && (
                    <span className="text-[9px] text-emerald-500 font-medium animate-pulse">
                      Runs in parallel with Model A
                    </span>
                  )}
                </div>
                {duration && (
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    {duration}
                  </span>
                )}
              </div>

              {/* Connector Fill Animation */}
              {i < steps.length - 1 && (
                <div 
                  className="absolute left-[15px] top-8 w-[2px] z-20"
                  style={{ 
                    height: '24px',
                    background: 'rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <div 
                    className="w-full bg-emerald-500 transition-all duration-500"
                    style={{ 
                      height: isDone ? '100%' : '0%',
                      boxShadow: isDone ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {superIntelStep === 3 && elapsed > 8 && (
        <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2.5 animate-pulse">
          <Loader2 size={14} className="text-amber-500 animate-spin" />
          <p className="text-[10px] text-amber-700 font-medium">
            Models are taking longer than usual. Finalizing synthesis...
          </p>
        </div>
      )}
    </div>
  )
}

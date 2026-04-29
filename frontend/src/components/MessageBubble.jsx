import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check, ChevronDown, ChevronUp, Brain } from 'lucide-react'

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3">
      <div
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.3)',
            color: '#34d399',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        className={className}
        style={{
          background: '#0d1117',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 12,
          padding: '16px',
          overflowX: 'auto',
          margin: 0,
        }}
      >
        <code className={className} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82em' }}>
          {children}
        </code>
      </pre>
    </div>
  )
}

function StreamingText({ text, isStreaming }) {
  const words = text.split(/(\s+)/)

  return (
    <span>
      {words.map((word, i) => (
        <span key={i} className="token-appear" style={{ animationDelay: '0ms' }}>
          {word}
        </span>
      ))}
      {isStreaming && <span className="streaming-cursor" />}
    </span>
  )
}

function AIAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #059669, #047857)',
        boxShadow: '0 0 12px rgba(5,150,105,0.3)',
      }}
    >
      <Brain size={14} color="white" />
    </div>
  )
}

export function ThinkingIndicator() {
  return (
    <div className="msg-ai flex items-start gap-3 max-w-2xl">
      <AIAvatar />
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderLeft: '3px solid #059669',
          boxShadow: '0 4px 16px rgba(5,150,105,0.1)',
        }}
      >
        <div className="flex items-center gap-1.5 py-1">
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>
      </div>
    </div>
  )
}

export default function MessageBubble({ message, isStreaming }) {
  const [showIndividual, setShowIndividual] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.isError

  if (isUser) {
    return (
      <div className="msg-user flex justify-end">
        <div
          className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
          }}
        >
          <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
          <p className="text-xs mt-1.5 text-emerald-200 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="msg-ai flex items-start gap-3 max-w-3xl">
      <AIAvatar />
      <div className="flex-1 min-w-0">
        <div
          className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${isError ? 'border-red-200' : ''}`}
          style={{
            background: isError ? 'rgba(254,226,226,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.2)',
            borderLeft: isError ? '3px solid #ef4444' : '3px solid #059669',
            boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
            color: '#111827',
          }}
        >
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          ) : isStreaming ? (
            <div className="prose prose-sm max-w-none" style={{ color: '#111827' }}>
              <StreamingText text={message.content} isStreaming={isStreaming} />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  if (inline) {
                    return (
                      <code
                        className={className}
                        style={{
                          background: 'rgba(16,185,129,0.1)',
                          color: '#059669',
                          padding: '0.1em 0.4em',
                          borderRadius: 4,
                          border: '1px solid rgba(16,185,129,0.2)',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85em',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                  return <CodeBlock className={className}>{children}</CodeBlock>
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3">
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}
                      >
                        {children}
                      </table>
                    </div>
                  )
                },
                th({ children }) {
                  return (
                    <th
                      style={{
                        background: 'rgba(5,150,105,0.1)',
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(16,185,129,0.2)',
                        color: '#059669',
                        fontSize: '0.82em',
                      }}
                    >
                      {children}
                    </th>
                  )
                },
                td({ children }) {
                  return (
                    <td
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(16,185,129,0.08)',
                        fontSize: '0.85em',
                      }}
                    >
                      {children}
                    </td>
                  )
                },
              }}
              className="prose prose-sm max-w-none"
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Super Intel individual responses */}
        {message.superIntelData && (
          <div className="mt-2">
            <button
              onClick={() => setShowIndividual(!showIndividual)}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              {showIndividual ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              View Individual Model Responses
            </button>
            {showIndividual && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['model1_response', 'model2_response'].map((key, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl text-xs text-gray-600"
                    style={{
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(16,185,129,0.15)',
                    }}
                  >
                    <p className="font-semibold text-emerald-600 mb-1">Model {i + 1}</p>
                    <p className="leading-relaxed line-clamp-6">{message.superIntelData[key]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-1.5 ml-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.model && <span className="ml-2 text-emerald-500">· {message.model}</span>}
        </p>
      </div>
    </div>
  )
}

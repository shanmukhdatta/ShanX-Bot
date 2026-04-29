import { useState, useCallback, useRef } from 'react'

export function useStreamingText() {
  const [displayText, setDisplayText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const timeoutRefs = useRef([])

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(t => clearTimeout(t))
    timeoutRefs.current = []
  }

  const streamText = useCallback((text, onComplete) => {
    clearTimeouts()
    setDisplayText('')
    setIsStreaming(true)

    const words = text.split(/(\s+)/)
    let accumulated = ''

    words.forEach((word, index) => {
      const delay = index * 30
      const t = setTimeout(() => {
        accumulated += word
        setDisplayText(accumulated)
        if (index === words.length - 1) {
          setIsStreaming(false)
          onComplete?.()
        }
      }, delay)
      timeoutRefs.current.push(t)
    })
  }, [])

  const streamFromSSE = useCallback((url, headers, body, onToken, onComplete, onError) => {
    setDisplayText('')
    setIsStreaming(true)

    fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
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
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsStreaming(false)
                onComplete?.()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const token = parsed.token || parsed.text || parsed.content || ''
                if (token) {
                  onToken(token)
                }
              } catch {
                // skip malformed
              }
            }
          }
        }
        setIsStreaming(false)
        onComplete?.()
      })
      .catch(err => {
        setIsStreaming(false)
        onError?.(err)
      })
  }, [])

  const reset = useCallback(() => {
    clearTimeouts()
    setDisplayText('')
    setIsStreaming(false)
  }, [])

  return { displayText, isStreaming, streamText, streamFromSSE, reset, setDisplayText, setIsStreaming }
}

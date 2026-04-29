import { useEffect, useRef } from 'react'

const NUM_NODES = 50
const MAX_DIST = 160

function createNode(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 3 + 2,
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.01,
  }
}

export default function NeuralBackground() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const nodesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    resize()
    window.addEventListener('resize', resize)

    nodesRef.current = Array.from({ length: NUM_NODES }, () => createNode(w, h))

    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      frame++

      const nodes = nodesRef.current

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        n.phase += n.pulseSpeed

        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = Math.sin(n.phase) * 0.3 + 0.7
        const radius = n.r * pulse

        // Glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 4)
        gradient.addColorStop(0, `rgba(52, 211, 153, ${0.15 * pulse})`)
        gradient.addColorStop(1, 'rgba(52, 211, 153, 0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * pulse})`
        ctx.fill()

        // Emerald ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.4 * pulse})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)',
      }}
    />
  )
}

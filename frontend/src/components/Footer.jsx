export default function Footer() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-center py-1.5"
      style={{
        background: 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)',
      }}
    >
      <p
        className="text-xs pointer-events-auto"
        style={{
          color: 'rgba(107,114,128,0.7)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.01em',
          userSelect: 'none',
        }}
      >
        Built with{' '}
        <span style={{ color: 'rgba(239,68,68,0.7)' }}>♥</span>
        {' '}by{' '}
        <span
          style={{
            color: 'rgba(5,150,105,0.8)',
            fontWeight: 600,
          }}
        >
          Shanmukh Datta
        </span>
        {' '}· © 2026 ShanXBot
      </p>
    </div>
  )
}

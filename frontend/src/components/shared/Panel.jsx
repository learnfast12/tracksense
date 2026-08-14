export default function Panel({ children, className = '', glow = false }) {
  return (
    <div
      className={`rounded-lg border ${className}`}
      style={{
        background: 'var(--ts-bg-panel)',
        borderColor: 'var(--ts-border)',
        boxShadow: glow ? 'var(--ts-glow)' : 'none',
      }}
    >
      {children}
    </div>
  )
}

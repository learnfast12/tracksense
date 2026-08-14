const variants = {
  ok: { color: 'var(--ts-accent)', border: 'var(--ts-accent-dim)' },
  warn: { color: 'var(--ts-warn)', border: 'var(--ts-warn)' },
  danger: { color: 'var(--ts-danger)', border: 'var(--ts-danger)' },
  neutral: { color: 'var(--ts-text-dim)', border: 'var(--ts-border)' },
}

export default function Badge({ children, variant = 'neutral' }) {
  const v = variants[variant] || variants.neutral
  return (
    <span
      className="font-telemetry text-xs px-2 py-1 rounded border uppercase"
      style={{ color: v.color, borderColor: v.border }}
    >
      {children}
    </span>
  )
}

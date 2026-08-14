export default function Skeleton({ width = '100%', height = 14, className = '', style = {} }) {
  return (
    <span
      className={`inline-block rounded ${className}`}
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'ts-shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

// Injected once globally is cleaner, but keeping it colocated keeps this
// component fully self-contained/drop-in anywhere without a separate CSS file.
if (typeof document !== 'undefined' && !document.getElementById('ts-shimmer-keyframes')) {
  const styleTag = document.createElement('style')
  styleTag.id = 'ts-shimmer-keyframes'
  styleTag.textContent = `
    @keyframes ts-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(styleTag)
}

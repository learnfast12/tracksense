import { useEffect, useState } from 'react'

export default function ClockReadout() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const ss = String(time.getSeconds()).padStart(2, '0')

  return (
    <span className="font-telemetry text-xs tracking-widest" style={{ color: 'var(--ts-text-dim)' }}>
      {hh}:{mm}:{ss}
    </span>
  )
}

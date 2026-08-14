import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

/**
 * Smoothly tweens a displayed number toward `value` whenever it changes,
 * instead of snapping. Use for any live telemetry readout (wetness %,
 * confidence %, etc.) so updates read as continuous tracking, not jumps.
 */
export default function AnimatedNumber({ value, suffix = '', decimals = 1, className, style }) {
  const [display, setDisplay] = useState(value ?? 0)
  const prevRef = useRef(value ?? 0)

  useEffect(() => {
    if (value == null) return
    const from = prevRef.current
    const to = value
    if (from === to) return

    const controls = animate(from, to, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })

    prevRef.current = to
    return () => controls.stop()
  }, [value])

  if (value == null) return <span className={className} style={style}>--</span>

  return (
    <span className={className} style={style}>
      {display.toFixed(decimals)}{suffix}
    </span>
  )
}

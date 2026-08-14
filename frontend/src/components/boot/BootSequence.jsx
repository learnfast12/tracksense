import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function BootSequence({ onComplete, playKey }) {
  const overlayRef = useRef(null)
  const logoRef = useRef(null)
  const subRef = useRef(null)
  const trackPathRef = useRef(null)
  const zoneRefs = useRef([])
  const statusRef = useRef(null)
  const barFillRef = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => onComplete?.(),
        })
      },
    })

    gsap.set(overlay, { opacity: 1, display: 'flex' })
    gsap.set(logoRef.current, { opacity: 0, y: 20 })
    gsap.set(subRef.current, { opacity: 0 })
    gsap.set(zoneRefs.current, { opacity: 0.15 })
    gsap.set(statusRef.current, { opacity: 0 })
    gsap.set(barFillRef.current, { scaleX: 0 })
    gsap.set(finalRef.current, { opacity: 0, y: 10 })

    const pathLength = trackPathRef.current?.getTotalLength() || 0
    gsap.set(trackPathRef.current, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    })

    tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.7 })
      .to(subRef.current, { opacity: 1, duration: 0.5 }, '-=0.2')
      .to(trackPathRef.current, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, '+=0.2')
      .to(zoneRefs.current[0], { opacity: 1, duration: 0.4 }, '-=0.3')
      .to(zoneRefs.current[1], { opacity: 1, duration: 0.4 }, '-=0.2')
      .to(zoneRefs.current[2], { opacity: 1, duration: 0.4 }, '-=0.2')
      .to(statusRef.current, { opacity: 1, duration: 0.3 }, '+=0.1')
      .to(barFillRef.current, { scaleX: 1, duration: 1.1, ease: 'power1.inOut' }, '-=0.1')
      .to(statusRef.current, { opacity: 0, duration: 0.3 }, '+=0.3')
      .to(finalRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.1')
      .to({}, { duration: 0.9 }) // hold on final message before fade

    return () => tl.kill()
  }, [playKey, onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex-col items-center justify-center"
      style={{ background: 'var(--ts-bg)', display: 'none' }}
    >
      <div ref={logoRef} className="font-telemetry text-4xl tracking-widest mb-2" style={{ color: 'var(--ts-text-primary)' }}>
        TRACKSENSE
      </div>
      <div ref={subRef} className="font-telemetry text-xs tracking-[0.3em] mb-10" style={{ color: 'var(--ts-text-dim)' }}>
        LIVE TRACK CONDITION INTELLIGENCE
      </div>

      <svg width="280" height="140" viewBox="0 0 280 140" className="mb-8">
        <path
          ref={trackPathRef}
          d="M20,110 C60,20 100,20 140,70 C180,120 220,120 260,40"
          fill="none"
          stroke="var(--ts-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex gap-8 mb-8">
        {['RACING LINE', 'APEX', 'OUTER EDGE'].map((label, i) => (
          <div
            key={label}
            ref={el => (zoneRefs.current[i] = el)}
            className="font-telemetry text-xs tracking-wider"
            style={{ color: 'var(--ts-accent)' }}
          >
            {label}
          </div>
        ))}
      </div>

      <div ref={statusRef} className="w-64 absolute" style={{ top: '65%' }}>
        <div className="font-telemetry text-xs mb-2 text-center" style={{ color: 'var(--ts-text-dim)' }}>
          ANALYZING SURFACE...
        </div>
        <div className="h-1 w-full rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            ref={barFillRef}
            className="h-full origin-left"
            style={{ background: 'var(--ts-accent)', transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      <div ref={finalRef} className="font-telemetry text-sm tracking-[0.2em] absolute" style={{ top: '65%', color: 'var(--ts-accent)' }}>
        SURFACE INTELLIGENCE ONLINE
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function BootSequence({ onComplete, playKey }) {
  const overlayRef = useRef(null)
  const logoRef = useRef(null)
  const subRef = useRef(null)

  // Stage A — F1 lights-out + car launch
  const stageARef = useRef(null)
  const lightRefs = useRef([])
  const goFlashRef = useRef(null)
  const flagRef = useRef(null)
  const carTrackRef = useRef(null)
  const carRef = useRef(null)
  const carTrailRef = useRef(null)

  // Stage B — existing track/zone boot
  const stageBRef = useRef(null)
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

    // ---- initial states ----
    gsap.set(overlay, { opacity: 1, display: 'flex' })
    gsap.set(logoRef.current, { opacity: 0, y: 20 })
    gsap.set(subRef.current, { opacity: 0 })

    gsap.set(stageARef.current, { opacity: 1, display: 'flex' })
    gsap.set(lightRefs.current, { opacity: 0.15, scale: 1 })
    gsap.set(goFlashRef.current, { opacity: 0 })
    gsap.set(carRef.current, { x: -120 })
    gsap.set(carTrailRef.current, { scaleX: 0, opacity: 0.5 })

    gsap.set(stageBRef.current, { opacity: 0 })
    gsap.set(zoneRefs.current, { opacity: 0.15 })
    gsap.set(statusRef.current, { opacity: 0 })
    gsap.set(barFillRef.current, { scaleX: 0 })
    gsap.set(finalRef.current, { opacity: 0, y: 10 })

    const pathLength = trackPathRef.current?.getTotalLength() || 0
    gsap.set(trackPathRef.current, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    })

    const carTravel = () => (carTrackRef.current?.offsetWidth || 700) + 160

    // ---- timeline ----
    tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.7 })
      .to(subRef.current, { opacity: 1, duration: 0.5 }, '-=0.2')

      // lights igniting one by one — classic F1 start
      .to(lightRefs.current[0], { opacity: 1, duration: 0.22 }, '+=0.2')
      .to(lightRefs.current[1], { opacity: 1, duration: 0.22 }, '+=0.18')
      .to(lightRefs.current[2], { opacity: 1, duration: 0.22 }, '+=0.18')
      .to(lightRefs.current[3], { opacity: 1, duration: 0.22 }, '+=0.18')
      .to(lightRefs.current[4], { opacity: 1, duration: 0.22 }, '+=0.18')

      // hold — the "anticipation" beat
      .to({}, { duration: 0.55 })

      // LIGHTS OUT — all go dark instantly, GO flash, flag waves
      .to(lightRefs.current, { opacity: 0.12, duration: 0.08, ease: 'power4.in' })
      .to(goFlashRef.current, { opacity: 1, duration: 0.15 }, '<')
      .to(flagRef.current, { rotate: -8, duration: 0.12, ease: 'power1.inOut' }, '<')
      .to(flagRef.current, { rotate: 8, duration: 0.24, ease: 'power1.inOut', repeat: 2, yoyo: true }, '<')

      // car launches across the screen
      .to(carTrailRef.current, { scaleX: 1, opacity: 0, duration: 1.1, ease: 'power2.in' }, '-=0.05')
      .to(carRef.current, { x: carTravel, duration: 1.05, ease: 'power2.in' }, '<')
      .to(goFlashRef.current, { opacity: 0, duration: 0.3 }, '-=0.6')

      // hand off to track-mapping stage
      .to(stageARef.current, { opacity: 0, duration: 0.35 }, '-=0.1')
      .set(stageARef.current, { display: 'none' })
      .to(stageBRef.current, { opacity: 1, duration: 0.35 })

      .to(trackPathRef.current, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, '+=0.1')
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

      {/* ---- STAGE A: F1 lights-out + car launch ---- */}
      <div ref={stageARef} className="flex-col items-center" style={{ display: 'none' }}>
        <div className="relative flex items-center gap-6 mb-2">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              ref={el => (lightRefs.current[i] = el)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#ff2b2b',
                boxShadow: '0 0 14px #ff2b2b, 0 0 4px #ff2b2b inset',
              }}
            />
          ))}
          <div
            ref={flagRef}
            className="absolute"
            style={{
              right: -52,
              top: -6,
              width: 26,
              height: 20,
              transformOrigin: 'left center',
              clipPath: 'polygon(0 0, 100% 0, 82% 50%, 100% 100%, 0 100%)',
              background:
                'repeating-conic-gradient(#e8e8e8 0% 25%, #111 0% 50%) 0 0 / 8px 8px',
            }}
          />
        </div>

        <div
          ref={goFlashRef}
          className="font-telemetry text-sm tracking-[0.4em] mb-2"
          style={{ color: 'var(--ts-accent)' }}
        >
          GO
        </div>

        <div ref={carTrackRef} className="relative w-full max-w-[700px] h-10 mt-2">
          <div
            ref={carTrailRef}
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{
              height: 3,
              width: '60%',
              transformOrigin: 'left center',
              background: 'linear-gradient(90deg, transparent, var(--ts-accent))',
              filter: 'blur(1px)',
            }}
          />
          <div ref={carRef} className="absolute left-0 top-1/2 -translate-y-1/2">
            <svg width="70" height="26" viewBox="0 0 70 26">
              <rect x="10" y="10" width="42" height="8" rx="3" fill="var(--ts-accent)" />
              <rect x="2" y="13" width="10" height="3" rx="1.5" fill="var(--ts-accent)" />
              <rect x="52" y="8" width="4" height="12" rx="1" fill="var(--ts-accent)" />
              <rect x="56" y="6" width="10" height="3" rx="1" fill="var(--ts-text-dim)" />
              <circle cx="18" cy="20" r="5" fill="#111" stroke="var(--ts-accent)" strokeWidth="1.5" />
              <circle cx="48" cy="20" r="5" fill="#111" stroke="var(--ts-accent)" strokeWidth="1.5" />
              <rect x="26" y="4" width="10" height="7" rx="2" fill="var(--ts-text-primary)" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>

      {/* ---- STAGE B: track mapping / zones / status ---- */}
      <div ref={stageBRef} className="flex-col items-center" style={{ display: 'flex' }}>
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
    </div>
  )
}

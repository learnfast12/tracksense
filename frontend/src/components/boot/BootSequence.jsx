import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const CAR_COLORS = ['#00FFB2', '#FF3B3B', '#3B82F6', '#FBBF24', '#A855F7', '#FF7A00']

// Staggered starting grid — alternating rows offset horizontally, like a real F1 grid.
// top: vertical lane (% of grid container height), xOffset: how far back this car
// starts relative to the front row (creates the grid stagger look).
const GRID_LAYOUT = [
  { top: 12, xOffset: 0 },
  { top: 28, xOffset: 46 },
  { top: 44, xOffset: 0 },
  { top: 60, xOffset: 46 },
  { top: 76, xOffset: 0 },
  { top: 92, xOffset: 46 },
]

function CarSVG({ color }) {
  return (
    <svg width="64" height="24" viewBox="0 0 70 26">
      <rect x="10" y="10" width="42" height="8" rx="3" fill={color} />
      <rect x="2" y="13" width="10" height="3" rx="1.5" fill={color} />
      <rect x="52" y="8" width="4" height="12" rx="1" fill={color} />
      <rect x="56" y="6" width="10" height="3" rx="1" fill="rgba(255,255,255,0.7)" />
      <circle cx="18" cy="20" r="5" fill="#0a0a0a" stroke={color} strokeWidth="1.5" />
      <circle cx="48" cy="20" r="5" fill="#0a0a0a" stroke={color} strokeWidth="1.5" />
      <rect x="26" y="4" width="10" height="7" rx="2" fill="rgba(255,255,255,0.9)" />
    </svg>
  )
}

export default function BootSequence({ onComplete, playKey }) {
  const overlayRef = useRef(null)
  const logoRef = useRef(null)
  const subRef = useRef(null)

  // Stage A — full-grid F1 lights-out launch
  const stageARef = useRef(null)
  const lightRefs = useRef([])
  const goFlashRef = useRef(null)
  const screenFlashRef = useRef(null)
  const flagRef = useRef(null)
  const gridRef = useRef(null)
  const carRefs = useRef([])
  const trailRefs = useRef([])

  // Stage B — track/zone boot
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
    gsap.set(screenFlashRef.current, { opacity: 0 })

    GRID_LAYOUT.forEach((pos, i) => {
      gsap.set(carRefs.current[i], { x: pos.xOffset, opacity: 0, scale: 0.9 })
      gsap.set(trailRefs.current[i], { scaleX: 0, opacity: 0 })
    })

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

    const travelDistance = () => (gridRef.current?.offsetWidth || 900) + 200

    // ---- timeline ----
    tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.6 })
      .to(subRef.current, { opacity: 1, duration: 0.4 }, '-=0.15')

      // cars roll onto the grid
      .to(carRefs.current, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05 }, '+=0.1')

      // lights igniting one by one
      .to(lightRefs.current[0], { opacity: 1, duration: 0.2 }, '+=0.25')
      .to(lightRefs.current[1], { opacity: 1, duration: 0.2 }, '+=0.16')
      .to(lightRefs.current[2], { opacity: 1, duration: 0.2 }, '+=0.16')
      .to(lightRefs.current[3], { opacity: 1, duration: 0.2 }, '+=0.16')
      .to(lightRefs.current[4], { opacity: 1, duration: 0.2 }, '+=0.16')

      // anticipation hold
      .to({}, { duration: 0.5 })

      // LIGHTS OUT — screen flash, GO, flag wave
      .to(lightRefs.current, { opacity: 0.12, duration: 0.06, ease: 'power4.in' })
      .to(screenFlashRef.current, { opacity: 0.55, duration: 0.06 }, '<')
      .to(screenFlashRef.current, { opacity: 0, duration: 0.4, ease: 'power2.out' }, '+=0.02')
      .to(goFlashRef.current, { opacity: 1, duration: 0.12 }, '<')
      .to(flagRef.current, { rotate: -10, duration: 0.1, ease: 'power1.inOut' }, '<')
      .to(flagRef.current, { rotate: 10, duration: 0.22, ease: 'power1.inOut', repeat: 2, yoyo: true }, '<')

      // camera shake punch on launch
      .to(overlay, { x: -6, duration: 0.05 }, '<')
      .to(overlay, { x: 6, duration: 0.05 })
      .to(overlay, { x: 0, duration: 0.05 })

      // full grid launches — trails first, cars streak across full width,
      // slight stagger per car so it reads as a real rolling start, not a sync'd wall
      .to(trailRefs.current, { scaleX: 1, opacity: 0.6, duration: 1.0, stagger: 0.04, ease: 'power2.in' }, '-=0.05')
      .to(carRefs.current, { x: travelDistance, duration: 1.15, stagger: 0.04, ease: 'power2.in' }, '<')
      .to(goFlashRef.current, { opacity: 0, duration: 0.25 }, '-=0.7')

      // hand off to track-mapping stage
      .to(stageARef.current, { opacity: 0, duration: 0.35 }, '-=0.15')
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
      .to({}, { duration: 0.9 })

    return () => tl.kill()
  }, [playKey, onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--ts-bg)', display: 'none' }}
    >
      {/* full-screen flash on lights-out */}
      <div
        ref={screenFlashRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.9), transparent 70%)' }}
      />

      <div ref={logoRef} className="font-telemetry text-4xl tracking-widest mb-1 z-10" style={{ color: 'var(--ts-text-primary)' }}>
        TRACKSENSE
      </div>
      <div ref={subRef} className="font-telemetry text-xs tracking-[0.3em] mb-4 z-10" style={{ color: 'var(--ts-text-dim)' }}>
        LIVE TRACK CONDITION INTELLIGENCE
      </div>

      {/* ---- STAGE A: full-grid F1 lights-out launch ---- */}
      <div ref={stageARef} className="flex-col items-center w-full flex-1 justify-center" style={{ display: 'none' }}>
        <div className="relative flex items-center gap-6 mb-6 z-10">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              ref={el => (lightRefs.current[i] = el)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#ff2b2b',
                boxShadow: '0 0 18px #ff2b2b, 0 0 5px #ff2b2b inset',
              }}
            />
          ))}
          <div
            ref={flagRef}
            className="absolute"
            style={{
              right: -56,
              top: -8,
              width: 30,
              height: 24,
              transformOrigin: 'left center',
              clipPath: 'polygon(0 0, 100% 0, 82% 50%, 100% 100%, 0 100%)',
              background: 'repeating-conic-gradient(#e8e8e8 0% 25%, #111 0% 50%) 0 0 / 9px 9px',
            }}
          />
        </div>

        <div
          ref={goFlashRef}
          className="font-telemetry text-lg tracking-[0.5em] mb-4 z-10"
          style={{ color: 'var(--ts-accent)', textShadow: '0 0 20px var(--ts-accent)' }}
        >
          GO
        </div>

        <div ref={gridRef} className="relative w-full flex-1 max-h-[260px] overflow-hidden">
          {GRID_LAYOUT.map((pos, i) => (
            <div key={i} className="absolute" style={{ top: `${pos.top}%`, left: pos.xOffset }}>
              <div
                ref={el => (trailRefs.current[i] = el)}
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  right: '100%',
                  height: 3,
                  width: 160,
                  transformOrigin: 'right center',
                  background: `linear-gradient(90deg, transparent, ${CAR_COLORS[i]})`,
                  filter: 'blur(1.5px)',
                }}
              />
              <div ref={el => (carRefs.current[i] = el)}>
                <CarSVG color={CAR_COLORS[i]} />
              </div>
            </div>
          ))}
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

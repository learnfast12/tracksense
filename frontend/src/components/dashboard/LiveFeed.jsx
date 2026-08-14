import { useEffect, useRef, useState } from 'react'
import Panel from '../shared/Panel'
import Badge from '../shared/Badge'

export default function LiveFeed({ onFrame }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    let stream
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStatus('live')
        }
      } catch (err) {
        setStatus('unavailable')
      }
    }
    start()
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [])

  useEffect(() => {
    if (status !== 'live') return
    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(blob => { if (blob) onFrame(blob) }, 'image/jpeg', 0.85)
    }, 3000)
    return () => clearInterval(interval)
  }, [status, onFrame])

  return (
    <Panel className="p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-telemetry text-xs" style={{ color: 'var(--ts-text-dim)' }}>LIVE FEED</span>
        <Badge variant={status === 'live' ? 'ok' : status === 'connecting' ? 'neutral' : 'danger'}>
          {status}
        </Badge>
      </div>
      <div className="relative rounded overflow-hidden" style={{ aspectRatio: '16/9', background: '#000' }}>
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {status === 'live' && (
          <>
            {/* Sweeping scan line */}
            <div
              className="absolute left-0 w-full pointer-events-none"
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--ts-accent), transparent)',
                boxShadow: '0 0 8px var(--ts-accent)',
                animation: 'ts-scan-sweep 3s linear infinite',
              }}
            />
            {/* Faint scanline texture overlay for telemetry feel */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
              }}
            />
            {/* Corner brackets — telemetry framing */}
            <div className="absolute inset-2 pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
          </>
        )}
      </div>

      <style>{`
        @keyframes ts-scan-sweep {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </Panel>
  )
}

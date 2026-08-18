import { useEffect, useRef, useState } from 'react'
import Panel from '../shared/Panel'
import Badge from '../shared/Badge'
import ZoneOverlay from './ZoneOverlay'
import { Camera, Video, Upload, X, Image as ImageIcon } from 'lucide-react'

export default function LiveFeed({ onFrame, zones }) {
  const videoRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const [status, setStatus] = useState('connecting')
  // 'webcam' | 'demo' | 'upload-video' | 'upload-image'
  const [source, setSource] = useState('webcam')
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [uploadedName, setUploadedName] = useState('')

  // ---- webcam ----
  useEffect(() => {
    if (source !== 'webcam') return
    let stream
    setStatus('connecting')

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.src = ''
          await videoRef.current.play()
          setStatus('live')
        }
      } catch (err) {
        setStatus('unavailable')
      }
    }
    start()
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [source])

  // ---- demo clip ----
  useEffect(() => {
    if (source !== 'demo') return
    setStatus('connecting')
    const video = videoRef.current
    if (!video) return

    video.srcObject = null
    video.src = '/demo/track-demo.mp4'
    video.loop = true
    video.muted = true

    const handleReady = () => setStatus('live')
    const handleError = () => setStatus('unavailable')
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('error', handleError)
    video.play().catch(() => setStatus('unavailable'))

    return () => {
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('error', handleError)
    }
  }, [source])

  // ---- uploaded video ----
  useEffect(() => {
    if (source !== 'upload-video' || !uploadedUrl) return
    setStatus('connecting')
    const video = videoRef.current
    if (!video) return

    video.srcObject = null
    video.src = uploadedUrl
    video.loop = true
    video.muted = true

    const handleReady = () => setStatus('live')
    const handleError = () => setStatus('unavailable')
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('error', handleError)
    video.play().catch(() => setStatus('unavailable'))

    return () => {
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('error', handleError)
    }
  }, [source, uploadedUrl])

  // ---- uploaded image ----
  useEffect(() => {
    if (source !== 'upload-image' || !uploadedUrl) return
    setStatus('connecting')
    const img = imgRef.current
    if (!img) return

    const handleReady = () => setStatus('live')
    const handleError = () => setStatus('unavailable')
    img.addEventListener('load', handleReady)
    img.addEventListener('error', handleError)
    img.src = uploadedUrl

    return () => {
      img.removeEventListener('load', handleReady)
      img.removeEventListener('error', handleError)
    }
  }, [source, uploadedUrl])

  // ---- shared frame-capture polling — works for video-based AND image-based sources ----
  useEffect(() => {
    if (status !== 'live') return
    const interval = setInterval(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')

      if (source === 'upload-image') {
        const img = imgRef.current
        if (!img || !img.naturalWidth) return
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
      } else {
        const video = videoRef.current
        if (!video || video.readyState < 2) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
      }

      canvas.toBlob(blob => { if (blob) onFrame(blob) }, 'image/jpeg', 0.85)
    }, 3000)
    return () => clearInterval(interval)
  }, [status, source, onFrame])

  // ---- cleanup object URLs on unmount / replacement ----
  useEffect(() => {
    return () => { if (uploadedUrl) URL.revokeObjectURL(uploadedUrl) }
  }, [uploadedUrl])

  const switchSource = (next) => {
    if (next === source) return
    setSource(next)
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl)

    const url = URL.createObjectURL(file)
    setUploadedUrl(url)
    setUploadedName(file.name)

    if (file.type.startsWith('image/')) {
      setSource('upload-image')
    } else if (file.type.startsWith('video/')) {
      setSource('upload-video')
    }
    e.target.value = '' // allow re-selecting the same file later
  }

  const clearUpload = () => {
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl)
    setUploadedUrl(null)
    setUploadedName('')
    setSource('webcam')
  }

  const isUpload = source === 'upload-video' || source === 'upload-image'

  return (
    <Panel className="p-4">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <span className="font-telemetry text-xs flex items-center gap-1.5" style={{ color: 'var(--ts-text-dim)' }}>
          <Camera size={13} strokeWidth={2} />
          LIVE FEED
        </span>

        <div className="flex items-center gap-2">
          <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--ts-border)' }}>
            <button
              onClick={() => switchSource('webcam')}
              className="font-telemetry text-xs px-2.5 py-1 flex items-center gap-1 transition-colors"
              style={{
                background: source === 'webcam' ? 'rgba(0,255,178,0.12)' : 'transparent',
                color: source === 'webcam' ? 'var(--ts-accent)' : 'var(--ts-text-dim)',
              }}
            >
              <Camera size={11} strokeWidth={2} /> CAM
            </button>
            <button
              onClick={() => switchSource('demo')}
              className="font-telemetry text-xs px-2.5 py-1 flex items-center gap-1 transition-colors"
              style={{
                background: source === 'demo' ? 'rgba(0,255,178,0.12)' : 'transparent',
                color: source === 'demo' ? 'var(--ts-accent)' : 'var(--ts-text-dim)',
              }}
            >
              <Video size={11} strokeWidth={2} /> DEMO
            </button>
            <button
              onClick={handleUploadClick}
              className="font-telemetry text-xs px-2.5 py-1 flex items-center gap-1 transition-colors"
              style={{
                background: isUpload ? 'rgba(0,255,178,0.12)' : 'transparent',
                color: isUpload ? 'var(--ts-accent)' : 'var(--ts-text-dim)',
              }}
            >
              <Upload size={11} strokeWidth={2} /> UPLOAD
            </button>
          </div>

          <Badge variant={status === 'live' ? 'ok' : status === 'connecting' ? 'neutral' : 'danger'}>
            {status}
          </Badge>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative rounded overflow-hidden" style={{ aspectRatio: '16/9', background: '#000' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ display: source === 'upload-image' ? 'none' : 'block' }}
        />
        <img
          ref={imgRef}
          alt=""
          className="w-full h-full object-cover absolute inset-0"
          style={{ display: source === 'upload-image' ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {status === 'live' && (
          <>
            <ZoneOverlay zones={zones} />

            <div
              className="absolute left-0 w-full pointer-events-none"
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--ts-accent), transparent)',
                boxShadow: '0 0 8px var(--ts-accent)',
                animation: 'ts-scan-sweep 3s linear infinite',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
              }}
            />
            <div className="absolute inset-2 pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />

            {source === 'demo' && (
              <div
                className="absolute top-2 right-2 font-telemetry text-[10px] px-2 py-1 rounded pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--ts-text-dim)', letterSpacing: '0.1em' }}
              >
                DEMO FOOTAGE
              </div>
            )}

            {isUpload && (
              <div
                className="absolute top-2 right-2 font-telemetry text-[10px] px-2 py-1 rounded flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.55)', color: 'var(--ts-text-dim)', letterSpacing: '0.08em' }}
              >
                {source === 'upload-image' ? <ImageIcon size={10} /> : <Video size={10} />}
                <span className="max-w-[140px] truncate">{uploadedName || 'UPLOADED'}</span>
                <button onClick={clearUpload} className="pointer-events-auto hover:opacity-70">
                  <X size={12} />
                </button>
              </div>
            )}
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

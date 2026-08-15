import { useCallback, useState } from 'react'
import LiveFeed from '../components/dashboard/LiveFeed'
import ZoneMap from '../components/dashboard/ZoneMap'
import TrendGraph from '../components/dashboard/TrendGraph'
import StrategyCard from '../components/dashboard/StrategyCard'
import BootSequence from '../components/boot/BootSequence'
import TelemetryBackground from '../components/shared/TelemetryBackground'
import ClockReadout from '../components/shared/ClockReadout'
import { TriangleAlert } from 'lucide-react'
import { analyzeFrame } from '../lib/api'

export default function Dashboard() {
  const [zones, setZones] = useState(null)
  const [strategy, setStrategy] = useState(null)
  const [history, setHistory] = useState([])
  const [booting, setBooting] = useState(true)
  const [playKey, setPlayKey] = useState(0)
  const [backendStatus, setBackendStatus] = useState('unknown') // 'unknown' | 'ok' | 'error'
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)

  const handleFrame = useCallback(async (blob) => {
    try {
      const data = await analyzeFrame(blob)
      setZones(data.zones)
      setStrategy(data.strategy)
      setHistory(prev => [...prev.slice(-29), {
        t: Date.now(),
        racing_line: data.zones.racing_line?.fusion.fused_wetness,
        apex: data.zones.apex?.fusion.fused_wetness,
        outer_edge: data.zones.outer_edge?.fusion.fused_wetness,
      }])
      setBackendStatus('ok')
      setConsecutiveFailures(0)
    } catch (err) {
      console.error('analyze-frame failed', err)
      setConsecutiveFailures(prev => {
        const next = prev + 1
        // only flip to a visible error state after 2 consecutive misses —
        // avoids flashing a false alarm on a single dropped frame
        if (next >= 2) setBackendStatus('error')
        return next
      })
    }
  }, [])

  const handleBootComplete = useCallback(() => setBooting(false), [])
  const replayBoot = () => {
    setBooting(true)
    setPlayKey(k => k + 1)
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--ts-bg)' }}>
      <TelemetryBackground />
      {booting && (
        <BootSequence playKey={playKey} onComplete={handleBootComplete} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-telemetry text-2xl">TRACKSENSE // DASHBOARD</h1>
        <div className="flex items-center gap-4">
          <ClockReadout />
          <button
            onClick={replayBoot}
            className="font-telemetry text-xs px-3 py-1.5 rounded border tracking-wider"
            style={{ borderColor: 'var(--ts-border)', color: 'var(--ts-text-dim)' }}
          >
            ▶ REPLAY INTRO
          </button>
        </div>
      </div>

      {backendStatus === 'error' && (
        <div
          className="mb-6 px-4 py-3 rounded font-telemetry text-xs tracking-wider flex items-center gap-2"
          style={{
            background: 'rgba(255,60,60,0.08)',
            border: '1px solid rgba(255,60,60,0.4)',
            color: '#ff6b6b',
          }}
        >
          <TriangleAlert size={14} strokeWidth={2} />
          BACKEND UNREACHABLE — check that uvicorn is running on :8000. Displaying last known readings.
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <LiveFeed onFrame={handleFrame} zones={zones} />
          <TrendGraph history={history} />
        </div>
        <div className="space-y-6">
          <StrategyCard strategy={strategy} />
          <ZoneMap zones={zones} />
        </div>
      </div>
    </div>
  )
}

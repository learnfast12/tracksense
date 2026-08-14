import { useCallback, useState } from 'react'
import LiveFeed from '../components/dashboard/LiveFeed'
import ZoneMap from '../components/dashboard/ZoneMap'
import TrendGraph from '../components/dashboard/TrendGraph'
import StrategyCard from '../components/dashboard/StrategyCard'
import BootSequence from '../components/boot/BootSequence'
import { analyzeFrame } from '../lib/api'

export default function Dashboard() {
  const [zones, setZones] = useState(null)
  const [strategy, setStrategy] = useState(null)
  const [history, setHistory] = useState([])
  const [booting, setBooting] = useState(true)
  const [playKey, setPlayKey] = useState(0)

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
    } catch (err) {
      console.error('analyze-frame failed', err)
    }
  }, [])

  const replayBoot = () => {
    setBooting(true)
    setPlayKey(k => k + 1)
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--ts-bg)' }}>
      {booting && (
        <BootSequence playKey={playKey} onComplete={() => setBooting(false)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-telemetry text-2xl">TRACKSENSE // DASHBOARD</h1>
        <button
          onClick={replayBoot}
          className="font-telemetry text-xs px-3 py-1.5 rounded border tracking-wider"
          style={{ borderColor: 'var(--ts-border)', color: 'var(--ts-text-dim)' }}
        >
          ▶ REPLAY INTRO
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <LiveFeed onFrame={handleFrame} />
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

import { useEffect, useRef, useState } from 'react'
import Panel from '../shared/Panel'
import Badge from '../shared/Badge'
import AnimatedNumber from '../shared/AnimatedNumber'
import Skeleton from '../shared/Skeleton'

function zoneVariant(label) {
  if (label === 'Dry') return 'ok'
  if (label?.includes('Wet')) return 'danger'
  return 'warn'
}

function ZoneRow({ name, z }) {
  const [pulse, setPulse] = useState(false)
  const prevVal = useRef(z?.fusion.fused_wetness)

  useEffect(() => {
    const current = z?.fusion.fused_wetness
    if (current != null && prevVal.current != null && current !== prevVal.current) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 500)
      prevVal.current = current
      return () => clearTimeout(t)
    }
    prevVal.current = current
  }, [z?.fusion.fused_wetness])

  return (
    <div
      className="flex justify-between items-center p-2 rounded transition-shadow duration-500"
      style={{
        background: 'rgba(255,255,255,0.02)',
        boxShadow: pulse ? '0 0 12px var(--ts-accent)' : '0 0 0 transparent',
      }}
    >
      <span className="font-telemetry text-sm uppercase">{name.replace('_', ' ')}</span>
      <div className="flex items-center gap-2">
        <span className="font-telemetry text-sm">
          {z ? <AnimatedNumber value={z.fusion.fused_wetness} suffix="%" decimals={1} /> : '--'}
        </span>
        <Badge variant={z ? zoneVariant(z.label) : 'neutral'}>{z?.label || '—'}</Badge>
      </div>
    </div>
  )
}

function ZoneRowSkeleton({ name }) {
  return (
    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <span className="font-telemetry text-sm uppercase" style={{ color: 'var(--ts-text-dim)' }}>
        {name.replace('_', ' ')}
      </span>
      <div className="flex items-center gap-2">
        <Skeleton width={40} height={14} />
        <Skeleton width={70} height={22} style={{ borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function ZoneMap({ zones }) {
  const order = ['outer_edge', 'apex', 'racing_line']
  const hasData = zones != null

  return (
    <Panel className="p-4">
      <div className="font-telemetry text-xs mb-3" style={{ color: 'var(--ts-text-dim)' }}>ZONE READING</div>
      <div className="space-y-2">
        {order.map(name =>
          hasData
            ? <ZoneRow key={name} name={name} z={zones?.[name]} />
            : <ZoneRowSkeleton key={name} name={name} />
        )}
      </div>
    </Panel>
  )
}

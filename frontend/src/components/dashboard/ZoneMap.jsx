import Panel from '../shared/Panel'
import Badge from '../shared/Badge'

function zoneVariant(label) {
  if (label === 'Dry') return 'ok'
  if (label?.includes('Wet')) return 'danger'
  return 'warn'
}

export default function ZoneMap({ zones }) {
  const order = ['outer_edge', 'apex', 'racing_line']
  return (
    <Panel className="p-4">
      <div className="font-telemetry text-xs mb-3" style={{ color: 'var(--ts-text-dim)' }}>ZONE READING</div>
      <div className="space-y-2">
        {order.map(name => {
          const z = zones?.[name]
          return (
            <div key={name} className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-telemetry text-sm uppercase">{name.replace('_', ' ')}</span>
              <div className="flex items-center gap-2">
                <span className="font-telemetry text-sm">{z ? `${z.fusion.fused_wetness}%` : '--'}</span>
                <Badge variant={z ? zoneVariant(z.label) : 'neutral'}>{z?.label || '—'}</Badge>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

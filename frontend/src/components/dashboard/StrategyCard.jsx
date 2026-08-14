import Panel from '../shared/Panel'
import Badge from '../shared/Badge'

export default function StrategyCard({ strategy }) {
  return (
    <Panel className="p-6 text-center" glow>
      <div className="font-telemetry text-xs mb-2" style={{ color: 'var(--ts-text-dim)' }}>STRATEGY RECOMMENDATION</div>
      <div className="font-telemetry text-2xl mb-2" style={{ color: 'var(--ts-accent)' }}>
        {strategy?.recommended_tyre || '—'}
      </div>
      <div className="text-sm mb-3" style={{ color: 'var(--ts-text-primary)' }}>
        {strategy?.message || 'Awaiting data...'}
      </div>
      <Badge variant="neutral">Confidence {strategy?.confidence ?? '--'}%</Badge>
    </Panel>
  )
}

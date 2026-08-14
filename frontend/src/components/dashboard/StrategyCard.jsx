import { AnimatePresence, motion } from 'motion/react'
import Panel from '../shared/Panel'
import Badge from '../shared/Badge'
import AnimatedNumber from '../shared/AnimatedNumber'
import Skeleton from '../shared/Skeleton'

export default function StrategyCard({ strategy }) {
  if (!strategy) {
    return (
      <Panel className="p-6 text-center" glow>
        <div className="font-telemetry text-xs mb-3" style={{ color: 'var(--ts-text-dim)' }}>
          STRATEGY RECOMMENDATION
        </div>
        <div className="flex justify-center mb-3">
          <Skeleton width={140} height={28} />
        </div>
        <div className="flex justify-center mb-4">
          <Skeleton width={200} height={14} />
        </div>
        <div className="flex justify-center">
          <Skeleton width={110} height={22} style={{ borderRadius: 6 }} />
        </div>
      </Panel>
    )
  }

  const tyre = strategy.recommended_tyre || '—'

  return (
    <Panel className="p-6 text-center" glow>
      <div className="font-telemetry text-xs mb-2" style={{ color: 'var(--ts-text-dim)' }}>
        STRATEGY RECOMMENDATION
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tyre}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-telemetry text-2xl mb-2"
          style={{ color: 'var(--ts-accent)' }}
        >
          {tyre}
        </motion.div>
      </AnimatePresence>

      <div className="text-sm mb-3" style={{ color: 'var(--ts-text-primary)' }}>
        {strategy.message}
      </div>

      <Badge variant="neutral">
        Confidence <AnimatedNumber value={strategy.confidence} suffix="%" decimals={0} />
      </Badge>
    </Panel>
  )
}

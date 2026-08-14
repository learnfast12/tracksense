import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'motion/react'
import Panel from '../shared/Panel'

export default function TrendGraph({ history }) {
  return (
    <Panel className="p-4">
      <div className="font-telemetry text-xs mb-3" style={{ color: 'var(--ts-text-dim)' }}>
        WETNESS HISTORY
      </div>
      <motion.div
        key={history.length}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', height: 180 }}
      >
        <ResponsiveContainer>
          <LineChart data={history}>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} stroke="var(--ts-text-dim)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'var(--ts-bg-panel)', border: '1px solid var(--ts-border)' }} />
            <Line
              type="monotone"
              dataKey="racing_line"
              stroke="var(--ts-accent)"
              dot={false}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="apex"
              stroke="var(--ts-warn)"
              dot={false}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="outer_edge"
              stroke="var(--ts-danger)"
              dot={false}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </Panel>
  )
}

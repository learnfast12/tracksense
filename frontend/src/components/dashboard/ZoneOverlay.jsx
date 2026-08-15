// Mirrors backend/app/services/zones.py DEFAULT_ZONES exactly (0-1 normalized
// x1,y1,x2,y2), so the boxes drawn here always match what's actually being
// analyzed server-side — not a decorative approximation.
const ZONE_BOXES = {
  racing_line: { x1: 0.10, y1: 0.70, x2: 0.90, y2: 0.95, label: 'RACING LINE' },
  apex:        { x1: 0.35, y1: 0.35, x2: 0.65, y2: 0.65, label: 'APEX' },
  outer_edge:  { x1: 0.05, y1: 0.05, x2: 0.95, y2: 0.30, label: 'OUTER EDGE' },
}

function colorForLabel(label) {
  if (label === 'Dry') return 'var(--ts-accent)'
  if (label === 'Wet' || label === 'Damp/Wet') return 'var(--ts-danger)'
  if (label === 'Damp (light)') return 'var(--ts-warn)'
  return 'rgba(255,255,255,0.35)' // no data yet
}

function ZoneBox({ zoneKey, box, zoneData }) {
  const left = `${box.x1 * 100}%`
  const top = `${box.y1 * 100}%`
  const width = `${(box.x2 - box.x1) * 100}%`
  const height = `${(box.y2 - box.y1) * 100}%`
  const color = zoneData ? colorForLabel(zoneData.label) : 'rgba(255,255,255,0.25)'
  const pct = zoneData?.fusion?.fused_wetness

  return (
    <div
      className="absolute pointer-events-none transition-colors duration-500"
      style={{ left, top, width, height, border: `1.5px solid ${color}` }}
    >
      {/* corner ticks, radar/targeting style rather than a plain box */}
      {['tl', 'tr', 'bl', 'br'].map(corner => (
        <span
          key={corner}
          className="absolute"
          style={{
            width: 8,
            height: 8,
            borderColor: color,
            ...(corner === 'tl' && { top: -1.5, left: -1.5, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }),
            ...(corner === 'tr' && { top: -1.5, right: -1.5, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }),
            ...(corner === 'bl' && { bottom: -1.5, left: -1.5, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }),
            ...(corner === 'br' && { bottom: -1.5, right: -1.5, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }),
          }}
        />
      ))}

      <div
        className="absolute font-telemetry"
        style={{
          top: -18,
          left: -1.5,
          fontSize: 9,
          letterSpacing: '0.08em',
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 0 4px rgba(0,0,0,0.8)',
        }}
      >
        {box.label}{pct != null ? ` ${pct.toFixed(0)}%` : ''}
      </div>
    </div>
  )
}

export default function ZoneOverlay({ zones }) {
  return (
    <div className="absolute inset-0">
      {Object.entries(ZONE_BOXES).map(([key, box]) => (
        <ZoneBox key={key} zoneKey={key} box={box} zoneData={zones?.[key]} />
      ))}
    </div>
  )
}

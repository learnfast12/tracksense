export default function TelemetryBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" style={{ background: 'var(--ts-bg)' }}>
      {/* base grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)',
        }}
      />
      {/* ambient glow, top center */}
      <div
        className="absolute"
        style={{
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '50%',
          background: 'radial-gradient(circle, var(--ts-accent) 0%, transparent 70%)',
          opacity: 0.06,
          filter: 'blur(60px)',
        }}
      />
      {/* slow drifting secondary glow, bottom right */}
      <div
        className="absolute"
        style={{
          bottom: '-15%',
          right: '-10%',
          width: '45%',
          height: '45%',
          background: 'radial-gradient(circle, var(--ts-accent) 0%, transparent 70%)',
          opacity: 0.045,
          filter: 'blur(80px)',
          animation: 'ts-drift 14s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes ts-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, -20px); }
        }
      `}</style>
    </div>
  )
}

'use client'

export default function StatCard({
  label,
  value,
  icon,
  color = '#4f46e5',
  subtitle,
  trend,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="glass" style={{ padding: '20px' }}>
        <div style={{ animation: 'pulse 1.5s ease infinite', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 14, width: '60%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
          <div style={{ height: 28, width: '40%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="glass glass-hover" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', color, lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
      )}
      {trend !== undefined && (
        <div style={{
          marginTop: 10,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

'use client'

export default function StatCard({
  label,
  value,
  icon,
  color = 'var(--text-main)',
  subtitle,
  trend,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="glass" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ animation: 'pulse 1.5s ease infinite', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 14, width: '60%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
          <div style={{ height: 28, width: '40%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
        </div>
      </div>
    )
  }
  return (
    <div className="glass glass-hover" style={{ padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '-0.2px' }}>
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px', color, lineHeight: 1.1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: 8, fontWeight: 500 }}>{subtitle}</div>
      )}
      {trend !== undefined && (
        <div style={{
          marginTop: 12,
          fontSize: '13px',
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

'use client'

export default function ReportsError({ error, reset }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        gap: 16,
      }}
    >
      <div style={{ fontSize: '3rem' }}>📊</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Failed to load reports</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>
        {error?.message || 'An error occurred while loading the reports page.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)',
          color: '#000',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}

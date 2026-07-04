'use client'

export default function ProtectedError({ error, reset }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        gap: 16,
        minHeight: '60vh',
      }}
    >
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Something went wrong</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>
        {error?.message || 'An unexpected error occurred in this page.'}
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

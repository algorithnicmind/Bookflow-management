'use client'

import { useState, useEffect } from 'react'

export default function LiveClock({ compact = false }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!now) return null

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 100,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#fff',
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
      }}>
        <span style={{ fontSize: '0.85rem' }}>🕐</span>
        <span>{time}</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span style={{ opacity: 0.7 }}>{date}</span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '0.9rem' }}>🕐</span>
      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{time}</span>
      <span style={{ opacity: 0.3 }}>|</span>
      <span>{date}</span>
    </div>
  )
}

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
        background: 'var(--border)',
        border: '1px solid var(--border-hover)',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-main)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.2px',
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
      padding: '6px 16px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      fontSize: '13px',
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

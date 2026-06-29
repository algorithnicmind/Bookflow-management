'use client'

import { getStatusColor } from '@/lib/utils'

export default function Badge({ status, style = {} }) {
  const colors = getStatusColor(status)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize',
        background: colors.bg,
        color: colors.text,
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        ...style,
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colors.dot,
        flexShrink: 0,
        animation: 'pulse-dot 2s infinite',
      }} />
      {status}
    </span>
  )
}

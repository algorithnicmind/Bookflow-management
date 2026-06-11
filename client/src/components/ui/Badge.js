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
        padding: '3px 10px',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        background: colors.bg,
        color: colors.text,
        ...style,
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colors.dot,
        flexShrink: 0,
      }} />
      {status}
    </span>
  )
}

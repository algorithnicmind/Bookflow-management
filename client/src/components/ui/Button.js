'use client'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
}) {
  const variants = {
    primary: {
      background: 'var(--text-main)',
      color: 'var(--bg-primary)',
      border: 'none',
      boxShadow: 'var(--shadow-md)',
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-main)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    },
    success: {
      background: 'var(--accent-green)',
      color: '#fff',
      border: 'none',
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: 'none',
    },
  }

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.78rem' },
    md: { padding: '10px 20px', fontSize: '0.85rem' },
    lg: { padding: '14px 28px', fontSize: '0.95rem' },
  }

  const baseStyle = {
    ...variants[variant],
    ...sizes[size],
    borderRadius: 'var(--radius-md)', // 12px
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    transition: 'var(--transition)',
    opacity: loading || disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
    ...style,
  }

  return (
    <button
      type={type}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={(e) => {
        if (!loading && !disabled) e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onMouseUp={(e) => {
        if (!loading && !disabled) e.currentTarget.style.transform = 'scale(1)'
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
      {children}
    </button>
  )
}

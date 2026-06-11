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
      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-main)',
      border: '1px solid var(--border)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff',
      border: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
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
    borderRadius: 'var(--radius-sm)',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
      onMouseEnter={(e) => {
        if (!loading && !disabled && variant !== 'ghost') {
          if (variant === 'secondary') e.target.style.borderColor = 'var(--accent)'
          else e.target.style.opacity = '0.9'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) {
          if (variant === 'secondary') e.target.style.borderColor = 'var(--border)'
          else e.target.style.opacity = '1'
        }
      }}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
      {children}
    </button>
  )
}

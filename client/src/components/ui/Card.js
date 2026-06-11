'use client'

export default function Card({ children, className = '', hover = true, style = {} }) {
  return (
    <div
      className={`glass ${hover ? 'glass-hover' : ''} ${className}`}
      style={{
        padding: '20px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

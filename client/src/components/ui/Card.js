'use client'

export default function Card({ children, className = '', hover = true, style = {} }) {
  return (
    <div
      className={`glass ${hover ? 'glass-hover' : ''} ${className}`}
      style={{
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

'use client'

import { useAuth } from '@/context/AuthContext'

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 'var(--header-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.3rem',
            cursor: 'pointer',
            padding: 4,
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-primary)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ') || ''}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
          onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

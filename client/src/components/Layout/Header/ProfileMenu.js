'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'

export default function ProfileMenu({ setShowNotifications }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={profileRef} style={{ position: 'relative' }}>
      <div
        onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: showProfileMenu ? 'var(--accent-glow)' : 'var(--bg-primary)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          border: showProfileMenu ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
        }}
        onMouseEnter={(e) => { if (!showProfileMenu) e.currentTarget.style.borderColor = 'var(--border-hover)' }}
        onMouseLeave={(e) => { if (!showProfileMenu) e.currentTarget.style.borderColor = 'transparent' }}
      >
        {user?.profile_image_url ? (
          <img 
            src={user.profile_image_url} 
            alt="Avatar" 
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
          />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize', lineHeight: 1.2 }}>
            {user?.role?.replace('_', ' ') || ''}
          </div>
        </div>
        <span style={{
          fontSize: '0.6rem',
          color: 'var(--text-dim)',
          transition: 'transform 0.2s',
          transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)',
        }}>▼</span>
      </div>

      {showProfileMenu && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: 240,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 8,
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)',
            marginBottom: 4,
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>

          <button
            onClick={() => { setShowProfileMenu(false); router.push('/account-settings'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            ⚙️ Account Settings
          </button>

          <button
            onClick={() => { setShowProfileMenu(false); logout(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: 'none',
              color: 'var(--danger)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
              marginTop: 4,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}

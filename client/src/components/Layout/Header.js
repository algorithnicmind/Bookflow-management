'use client'

import { useState } from 'react'

import OrganizationBadge from './Header/OrganizationBadge'
import ThemeToggle from './Header/ThemeToggle'
import NotificationsDropdown from './Header/NotificationsDropdown'
import ProfileMenu from './Header/ProfileMenu'

export default function Header({ onToggleSidebar }) {
  const [activeDropdown, setActiveDropdown] = useState(null) // 'notifications' or 'profile'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 'var(--header-height)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
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

      <OrganizationBadge />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        <ThemeToggle />
        
        {/* We can just render them since they manage their own click outside behavior. 
            Passing dummy setShow* to avoid breaking the extracted props. */}
        <NotificationsDropdown setShowProfileMenu={() => {}} />
        <ProfileMenu setShowNotifications={() => {}} />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

import AppleEmoji from '@/components/AppleEmoji'

const navItems = {
  employee: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  manager: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/pending-requests', label: 'Pending Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/team-overview', label: 'Team Overview', icon: <AppleEmoji char="👥" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/employees', label: 'Employees', icon: <AppleEmoji char="👥" /> },
    { href: '/pending-requests', label: 'Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/system-settings', label: 'Settings', icon: <AppleEmoji char="⚙️" /> },
    { href: '/audit-logs', label: 'Audit Logs', icon: <AppleEmoji char="🔍" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  super_admin: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/employees', label: 'Employees', icon: <AppleEmoji char="👥" /> },
    { href: '/manage-admins', label: 'Manage Admins', icon: <AppleEmoji char="👑" /> },
    { href: '/pending-requests', label: 'Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/system-settings', label: 'Settings', icon: <AppleEmoji char="⚙️" /> },
    { href: '/organization-reports', label: 'Reports', icon: <AppleEmoji char="📈" /> },
    { href: '/audit-logs', label: 'Audit Logs', icon: <AppleEmoji char="🔍" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const role = user?.role || 'employee'
  
  let items = navItems[role] || navItems.employee
  
  // Platform Owner specific tabs (Exclusive)
  if (user?.department === 'System') {
    items = [
      { href: '/leads', label: 'Leads', icon: <AppleEmoji char="🎯" /> },
      { href: '/owner-contacts', label: 'Contact Messages', icon: <AppleEmoji char="📨" /> },
      { href: '/platform-owners', label: 'Platform Owners', icon: <AppleEmoji char="👥" /> },
      { href: '/tenants', label: 'Provisioning', icon: <AppleEmoji char="🏗️" /> },
      { href: '/organizations', label: 'Organizations', icon: <AppleEmoji char="🏢" /> },
    ]
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
          }}
          className="sidebar-overlay"
        />
      )}
      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(0)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src="/logo.png"
            alt="LeaveFlow Logo"
            style={{
              width: 36,
              height: 36,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>LeaveFlow</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {user?.department === 'System' ? 'Platform Owner' : role.replace('_', ' ')}
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px', overflow: 'auto' }}>
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  marginBottom: 2,
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {user?.profile_image_url ? (
              <img 
                src={user.profile_image_url} 
                alt="Avatar" 
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--danger)', e.target.style.color = 'var(--danger)' }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)', e.target.style.color = 'var(--text-muted)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

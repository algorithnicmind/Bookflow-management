'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/context/NotificationContext'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const notificationTypeColors = {
  info: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', dot: '#3b82f6' },
  success: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', dot: '#10b981' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', dot: '#f59e0b' },
  danger: { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', dot: '#f43f5e' },
}

export default function NotificationsDropdown({ setShowProfileMenu }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id)
    setShowNotifications(false)
    if (notif.action_url) {
      router.push(notif.action_url)
    }
  }

  return (
    <div ref={notifRef} style={{ position: 'relative' }}>
      <button
        onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
        style={{
          background: showNotifications ? 'var(--accent-glow)' : 'none',
          border: 'none',
          color: showNotifications ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: '1.15rem',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { if (!showNotifications) e.target.style.color = 'var(--text-main)' }}
        onMouseLeave={(e) => { if (!showNotifications) e.target.style.color = 'var(--text-muted)' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: 'var(--danger)',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 700,
            borderRadius: '50%',
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: 360,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: 420,
          overflow: 'hidden',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8, opacity: 0.5 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => {
                const colors = notificationTypeColors[notif.type] || notificationTypeColors.info
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      cursor: notif.action_url ? 'pointer' : 'default',
                      background: notif.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.05)' }}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: notif.is_read ? 'transparent' : colors.dot,
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem',
                        fontWeight: notif.is_read ? 400 : 600,
                        marginBottom: 2,
                        color: 'var(--text-main)',
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {notif.message}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-dim)',
                        marginTop: 4,
                      }}>
                        {timeAgo(notif.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

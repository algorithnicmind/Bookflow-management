'use client'

/**
 * Notification Context
 * --------------------
 * Provides real-time notification state to all components in the app.
 * 
 * Uses exponential backoff when the backend is unreachable to avoid
 * spamming ECONNREFUSED errors every 30 seconds.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { notificationsApi } from '@/services/api'

const NotificationContext = createContext(null)

const POLL_INTERVAL = 30000
const BACKOFF_INTERVAL = 120000

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const consecutiveFailures = useRef(0)
  const timerRef = useRef(null)

  const fetchNotifications = useCallback(async (signal) => {
    if (!user) return
    try {
      const data = await notificationsApi.list(signal)
      const list = data.notifications || []
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.is_read).length)
      consecutiveFailures.current = 0
    } catch (err) {
      if (err.name === 'AbortError') return
      if (err.message?.includes('Session expired')) {
        setNotifications([])
        setUnreadCount(0)
      }
      consecutiveFailures.current += 1
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsApi.markRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {}
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {}
  }, [])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      consecutiveFailures.current = 0
      return
    }

    const controller = new AbortController()
    fetchNotifications(controller.signal)

    timerRef.current = setInterval(() => {
      fetchNotifications(controller.signal)
    }, consecutiveFailures.current > 0 ? BACKOFF_INTERVAL : POLL_INTERVAL)

    return () => {
      controller.abort()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [user, fetchNotifications])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

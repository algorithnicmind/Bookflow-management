'use client'

/**
 * Global Authentication State Management
 * --------------------------------------
 * This Context Provider wraps the entire application and manages the user's session.
 * 
 * Architectural Flow:
 * 1. On Mount: Calls `/api/auth/session` to check if a valid HttpOnly cookie exists.
 *    This endpoint always returns 200 (never 401), so the browser console stays clean.
 * 2. If valid, it populates the global `user` state and the app proceeds.
 * 3. If invalid, it sets `user` to null.
 * 4. Provides `login` and `logout` callbacks for the UI components to trigger state changes.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLocalProfile() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_BASE}/api/auth/session`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchLocalProfile()
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      const { authApi } = await import('@/services/api')
      await authApi.logout()
    } catch (e) {
      console.error('Logout error', e)
    }
    setUser(null)
    window.location.href = '/' // Redirect to landing page
  }, [])

  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

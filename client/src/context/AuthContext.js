'use client'

/**
 * Global Authentication State Management
 * --------------------------------------
 * This Context Provider wraps the entire application and manages the user's session.
 * 
 * Architectural Flow:
 * 1. On Mount: Calls `/api/employees/me` to check if a valid HttpOnly cookie exists.
 * 2. If valid, it populates the global `user` state and the app proceeds.
 * 3. If invalid (401), it sets `user` to null and redirects unauthenticated users to the `/login` page.
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
        const { authApi } = await import('@/services/api')
        const profile = await authApi.getProfile()
        setUser(profile)
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

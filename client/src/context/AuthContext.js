'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      const { authApi } = await import('@/services/api')
      await authApi.logout()
    } catch (e) {
      console.error('Logout error', e)
    }
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

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

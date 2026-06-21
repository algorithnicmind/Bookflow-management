'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerkAuth()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLocalProfile() {
      if (!isLoaded) return;
      
      if (clerkUser) {
        try {
          // Import api dynamically to avoid circular dependencies if any
          const { authApi } = await import('@/services/api');
          // Fetch the full database profile which contains role, organization_id, etc.
          const profile = await authApi.getProfile();
          setUser({ ...profile, clerkInfo: clerkUser });
        } catch (err) {
          console.error("Failed to fetch local profile:", err);
          setUser(null); // Ensure user is null if not authenticated locally
          
          // If they are logged into Clerk but have no local profile, they are a new user.
          // They need to apply for an organization.
          if (window.location.pathname !== '/onboarding/apply' && !window.location.pathname.startsWith('/sign-')) {
            window.location.href = '/onboarding/apply';
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    fetchLocalProfile();
  }, [clerkUser, isLoaded])

  const login = useCallback((userData) => {
    // With Clerk, login is handled by Clerk UI, but we keep this for compatibility
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('Logout error', e)
    }
    setUser(null)
  }, [signOut])

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

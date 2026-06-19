'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { authApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function OnboardingAuthPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleOAuthLogin = async (e, provider) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email to proceed with ' + provider)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Mock OAuth login endpoint that we created
      const response = await authApi.oauthLogin({ email, provider })
      
      // If we reach here, user exists and was logged in
      login(response.user)
      router.push('/dashboard')
      
    } catch (err) {
      if (err.status === 403 && err.data?.detail) {
        const detail = err.data.detail
        if (detail.onboarding_status === 'pending') {
          router.push('/onboarding/pending')
        } else if (detail.onboarding_status === 'required') {
          // Pass the email via query params or session storage so they don't have to retype
          sessionStorage.setItem('onboarding_email', email)
          router.push('/onboarding/apply')
        } else {
          setError(detail.message || 'Access denied.')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      padding: 24
    }}>
      <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
        <img src="/logo.png" alt="LeaveFlow Logo" style={{ height: 26 }} />
        <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>LeaveFlow</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-secondary)',
          borderRadius: 24,
          padding: 40,
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Welcome to LeaveFlow</h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
          Sign up or log in to continue setting up your organization workspace.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, marginBottom: 24, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Work Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                outline: 'none', transition: 'all 0.2s', width: '100%'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <button
            onClick={(e) => handleOAuthLogin(e, 'google')}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', padding: '14px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if(!loading) { e.target.style.borderColor='var(--accent)'; e.target.style.background='rgba(16, 185, 129, 0.05)' } }}
            onMouseLeave={e => { if(!loading) { e.target.style.borderColor='var(--border)'; e.target.style.background='transparent' } }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <button
            onClick={(e) => handleOAuthLogin(e, 'facebook')}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', padding: '14px', borderRadius: 8,
              background: '#1877F2', border: '1px solid #1877F2',
              color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if(!loading) e.target.style.background='#166FE5' }}
            onMouseLeave={e => { if(!loading) e.target.style.background='#1877F2' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" /></svg>
            Continue with Facebook
          </button>
        </div>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
          This is a simulated OAuth screen. In a real app, this would redirect to Google/Facebook.
        </p>
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function PendingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-secondary)',
          borderRadius: 24,
          padding: 48,
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6',
          marginBottom: 24, border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Application Under Review</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6, fontSize: '1.05rem' }}>
          Thank you for applying to LeaveFlow! Our team is currently reviewing your organization details. We will reach out to the admin email provided within 1-2 business days with further instructions.
        </p>

        <button
          onClick={() => router.push('/')}
          style={{
            padding: '14px 32px', borderRadius: 8,
            background: 'transparent', color: '#fff', border: '1px solid var(--border)',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)'; e.target.style.color = '#fff' }}
        >
          Return to Home
        </button>
      </motion.div>
    </div>
  )
}

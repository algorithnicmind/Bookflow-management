'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get('email')
    const provider = searchParams.get('provider')

    if (email && provider) {
      // We got the real email from Google/Facebook securely
      sessionStorage.setItem('onboarding_email', email)
      sessionStorage.setItem('onboarding_provider', provider)
      
      // Since it's OAuth, we don't strictly need a password for this step,
      // but we should proceed to the apply page
      setTimeout(() => {
        router.push('/onboarding/apply')
      }, 1500)
    } else {
      // Missing parameters, redirect back to start
      router.push('/onboarding')
    }
  }, [router, searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          width: 48, height: 48, border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          margin: '0 auto 24px', animation: 'spin 1s linear infinite'
        }}></div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Securely logging you in...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please wait while we verify your account.</p>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingAuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Clerk handles authentication, redirect to the Clerk sign-up page
    router.push('/sign-up')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)'
    }}>
      <p style={{ color: '#fff' }}>Redirecting to sign up...</p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BackgroundBeams } from '@/components/ui/BackgroundBeams'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading || !mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] flex flex-col overflow-hidden">
      <BackgroundBeams />
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff',
          }}>L</div>
          <span className="font-bold text-lg">LeaveFlow</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 rounded-[var(--radius-sm)] text-white font-semibold text-sm border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Sign In
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-[900px] mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8"
            style={{
              background: 'var(--accent-glow)',
              borderColor: 'rgba(79, 70, 229, 0.3)',
              color: 'var(--accent)',
            }}>
            ✨ Enterprise Leave Management
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.1] tracking-tight mb-5">
            Streamline Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Leave Management
            </span>
          </h1>

          <p className="text-[clamp(0.95rem,2vw,1.15rem)] text-[var(--text-muted)] max-w-[600px] leading-relaxed mb-10">
            A powerful, enterprise-grade platform for managing employee leave requests, 
            approvals, and tracking — all in one seamless experience.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 rounded-[var(--radius-sm)] text-white font-semibold border-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                fontSize: '0.95rem',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.target.style.transform = 'none' }}
            >
              Get Started →
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 rounded-[var(--radius-sm)] font-semibold cursor-pointer"
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.transform = 'none' }}
            >
              Learn More
            </button>
          </div>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 px-8 pb-20 max-w-[1100px] mx-auto w-full">
          {[
            { icon: '🎯', title: 'Easy Apply', desc: 'Submit leave requests in seconds with an intuitive interface.' },
            { icon: '⚡', title: 'Fast Approvals', desc: 'Managers can review and approve requests with one click.' },
            { icon: '📊', title: 'Smart Dashboard', desc: 'Role-based dashboards with real-time stats and insights.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade security with JWT authentication.' },
          ].map((feature, i) => (
            <div key={i} className="glass glass-hover animate-in text-center p-6"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{feature.icon}</div>
              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

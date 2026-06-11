'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

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
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff',
          }}>L</div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>LeaveFlow</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
            color: '#fff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Sign In
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 100,
            background: 'var(--accent-glow)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            fontSize: '0.82rem',
            color: 'var(--accent)',
            fontWeight: 500,
            marginBottom: 32,
          }}>
            ✨ Enterprise Leave Management
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: 20,
          }}>
            Streamline Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Leave Management
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: 'var(--text-muted)',
            maxWidth: 600,
            lineHeight: 1.7,
            marginBottom: 40,
          }}>
            A powerful, enterprise-grade platform for managing employee leave requests, 
            approvals, and tracking — all in one seamless experience.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '14px 32px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                color: '#fff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'none'}
            >
              Get Started →
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '14px 32px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.transform = 'none' }}
            >
              Learn More
            </button>
          </div>
        </section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          padding: '40px 32px 80px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
        }}>
          {[
            { icon: '🎯', title: 'Easy Apply', desc: 'Submit leave requests in seconds with an intuitive interface.' },
            { icon: '⚡', title: 'Fast Approvals', desc: 'Managers can review and approve requests with one click.' },
            { icon: '📊', title: 'Smart Dashboard', desc: 'Role-based dashboards with real-time stats and insights.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade security with JWT authentication.' },
          ].map((feature, i) => (
            <div key={i} className="glass glass-hover animate-in" style={{
              padding: '24px',
              textAlign: 'center',
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

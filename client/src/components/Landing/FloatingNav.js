'use client'

import { motion } from 'motion/react'

import { useRouter } from 'next/navigation'

export default function FloatingNav({ isDarkMode, toggleTheme }) {
  const router = useRouter()
  return (
    <motion.nav 
      initial={{ y: -100, x: '-50%' }}
      animate={{ y: 0, x: '-50%' }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 24px 8px 32px',
        borderRadius: 100,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        width: '90%',
        maxWidth: 1200,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="LeaveFlow Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>LeaveFlow</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
        <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Features</a>
        <a href="#solutions" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Solutions</a>

        <a href="#contact" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Contact</a>
        <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Pricing</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background='var(--border)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}
          title="Toggle Theme"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <button 
          onClick={() => router.push('/login')} 
          style={{ padding: '8px 20px', borderRadius: '100px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} 
          onMouseEnter={(e) => { e.currentTarget.style.background='var(--border)'; }} 
          onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}
        >
          Login
        </button>
      </div>
    </motion.nav>
  )
}

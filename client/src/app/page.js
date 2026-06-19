'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import AppleEmoji from '@/components/AppleEmoji'
import { contactApi } from '@/services/api'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)

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

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactStatus('loading')
    try {
      await contactApi.submit(contactData)
      setContactStatus('success')
      setContactData({ name: '', email: '', message: '' })
      setTimeout(() => setContactStatus(null), 3000)
    } catch (error) {
      setContactStatus('error')
      setTimeout(() => setContactStatus(null), 3000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* Floating Dock Navigation */}
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
          background: 'rgba(28, 28, 30, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: '90%',
          maxWidth: 1200,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="LeaveFlow Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px', color: '#fff' }}>LeaveFlow</span>
        </div>

        {/* Center: Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='#fff'} onMouseLeave={(e) => e.target.style.color='#a1a1aa'}>Features</a>
          <a href="#platform" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='#fff'} onMouseLeave={(e) => e.target.style.color='#a1a1aa'}>Platform</a>
          <a href="#solutions" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='#fff'} onMouseLeave={(e) => e.target.style.color='#a1a1aa'}>Solutions</a>
          <a href="#contact" style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.08)', borderRadius: 100, color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background='rgba(255,255,255,0.12)'} onMouseLeave={(e) => e.target.style.background='rgba(255,255,255,0.08)'}>Contact</a>
          <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='#fff'} onMouseLeave={(e) => e.target.style.color='#a1a1aa'}>Pricing</a>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => router.push('/login')} 
            style={{ width: 42, height: 42, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} 
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#fff'; }} 
            onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#a1a1aa'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '160px 24px 80px',
            maxWidth: 1000,
            margin: '0 auto',
            position: 'relative'
          }}
        >
          <motion.div variants={itemVariants} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 100,
            background: 'var(--accent-glow)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.85rem',
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 32,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
          }}>
            <AppleEmoji char="🌿" /> Welcome to the Future of Work
          </motion.div>

          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: 24,
          }}>
            Breathe Easy.<br/>
            <span style={{ 
              background: 'linear-gradient(135deg, #34d399, #059669)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0px 4px 12px rgba(16, 185, 129, 0.2))'
            }}>
              Automate Your Time Off.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: 680,
            lineHeight: 1.7,
            marginBottom: 48,
          }}>
            LeaveFlow is the premium, enterprise-grade platform designed to bring peace of mind to your workforce. Request, approve, and track leaves effortlessly in one beautiful dashboard.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '16px 36px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                color: '#fff',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: '0 8px 24px var(--accent-glow)'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 12px 32px var(--accent-glow)' }}
              onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 24px var(--accent-glow)' }}
            >
              Get Started Now →
            </button>
            <button
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                padding: '16px 36px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'rgba(16, 185, 129, 0.05)' }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
            >
              Explore Features
            </button>
          </motion.div>
        </motion.section>

        {/* Feature Grid */}
        <section id="features" style={{ padding: '80px 32px 120px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: 'spring' }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Everything you need.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Powerful tools disguised in a simple, intuitive interface.</p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {[
              { icon: <AppleEmoji char="✨" />, title: 'Frictionless Requests', desc: 'Apply for time off in seconds. Real-time balance calculations ensure zero errors.' },
              { icon: <AppleEmoji char="⚡" />, title: '1-Click Approvals', desc: 'Managers can approve or deny requests directly from email or their dashboard instantly.' },
              { icon: <AppleEmoji char="📅" />, title: 'Global Holidays', desc: 'Automatically import regional public holidays tailored to your employee locations.' },
              { icon: <AppleEmoji char="🛡️" />, title: 'Audit Ready', desc: 'Comprehensive, tamper-proof logs for HR compliance and seamless annual reporting.' },
              { icon: <AppleEmoji char="⚙️" />, title: 'Custom Workflows', desc: 'Multi-tiered approval chains. Route leaves to HR, Managers, or both seamlessly.' },
              { icon: <AppleEmoji char="📱" />, title: 'Anywhere Access', desc: 'Fully responsive design allows you to manage leaves from desktop, tablet, or phone.' },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.05, translateY: -8 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.1,
                  type: 'spring',
                  stiffness: 100
                }}
                className="glass glass-hover" 
                style={{
                  padding: '32px 24px',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: '4px',
                  background: 'linear-gradient(90deg, var(--accent), transparent)',
                  opacity: 0.5
                }}/>
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: 20,
                    background: 'var(--bg-secondary)',
                    width: 64, height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 16,
                    border: '1px solid var(--border)'
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{feature.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" style={{ padding: '120px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Solutions tailored for you.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Whether you're a fast-moving startup or a global enterprise, LeaveFlow scales with your needs.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {[
              { title: 'For HR Teams', desc: 'Automate compliance, eliminate manual data entry, and generate audit-ready reports instantly.', icon: <AppleEmoji char="👥" /> },
              { title: 'For Managers', desc: 'Review and approve requests in one click without ever leaving your inbox or Slack.', icon: <AppleEmoji char="⚡" /> },
              { title: 'For Employees', desc: 'Check balances, request time off, and plan holidays seamlessly from any device.', icon: <AppleEmoji char="📱" /> }
            ].map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  padding: 40,
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: 20 }}>{sol.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>{sol.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '120px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Simple, transparent pricing.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Start for free, upgrade when you need more power. No hidden fees.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}>
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 40 }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Starter</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Up to 10 employees</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Basic leave tracking</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Standard support</li>
              </ul>
              <button style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Get Started</button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent)', borderRadius: 24, padding: 48, position: 'relative', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            >
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Professional</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>$5<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/user/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-main)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Unlimited employees</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Multi-tier approval workflows</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Advanced reporting & analytics</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Slack & Teams integrations</li>
              </ul>
              <button style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px var(--accent-glow)' }} onMouseEnter={e => e.target.style.background='var(--accent-hover)'} onMouseLeave={e => e.target.style.background='var(--accent)'}>Start Free Trial</button>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 40 }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Enterprise</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Custom</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Everything in Professional</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> SSO & Advanced Security</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Dedicated Success Manager</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Custom integrations</li>
              </ul>
              <button style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Contact Sales</button>
            </motion.div>
          </div>
        </section>

        {/* Enterprise Contact Section */}
        <section id="contact" style={{ padding: '120px 24px', width: '100%', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'relative' }}>
          {/* Subtle Glow */}
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 64 }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}
            >
              <h2 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>Let's Connect.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.6 }}>
                Whether you're looking for an enterprise plan, need custom integration, or just want to say hello, our team is ready to help.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
              {/* Contact Info & Socials */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Sales & Support</h4>
                      <p style={{ color: 'var(--text-muted)' }}>+1 (800) 555-0199</p>
                      <p style={{ color: 'var(--text-muted)' }}>Mon-Fri from 8am to 5pm</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Email Us</h4>
                      <p style={{ color: 'var(--text-muted)' }}>hello@leaveflow.app</p>
                      <p style={{ color: 'var(--text-muted)' }}>We reply within 24 hours</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Headquarters</h4>
                      <p style={{ color: 'var(--text-muted)' }}>100 Innovation Drive</p>
                      <p style={{ color: 'var(--text-muted)' }}>San Francisco, CA 94103</p>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-main)' }}>Follow Us</h4>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 24, padding: 40, border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>First Name</label>
                        <input
                          type="text"
                          required
                          value={contactData.name}
                          onChange={(e) => setContactData({...contactData, name: e.target.value})}
                          style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border)',
                            padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                            outline: 'none', transition: 'all 0.2s'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Work Email</label>
                        <input
                          type="email"
                          required
                          value={contactData.email}
                          onChange={(e) => setContactData({...contactData, email: e.target.value})}
                          style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border)',
                            padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                            outline: 'none', transition: 'all 0.2s'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>How can we help?</label>
                      <textarea
                        required
                        rows="4"
                        value={contactData.message}
                        onChange={(e) => setContactData({...contactData, message: e.target.value})}
                        style={{
                          background: 'var(--bg-primary)', border: '1px solid var(--border)',
                          padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                          outline: 'none', transition: 'all 0.2s', resize: 'vertical'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={contactStatus === 'loading'}
                      style={{
                        padding: '14px 24px', borderRadius: 8,
                        background: contactStatus === 'success' ? '#10b981' : contactStatus === 'error' ? '#ef4444' : 'var(--accent)',
                        color: '#000', border: 'none', fontSize: '1rem', fontWeight: 600,
                        cursor: contactStatus === 'loading' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        marginTop: 8,
                        boxShadow: '0 4px 14px var(--accent-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                      onMouseEnter={(e) => { if(contactStatus !== 'success' && contactStatus !== 'error') e.target.style.background = 'var(--accent-hover)' }}
                      onMouseLeave={(e) => { if(contactStatus !== 'success' && contactStatus !== 'error') e.target.style.background = 'var(--accent)' }}
                    >
                      {contactStatus === 'loading' ? 'Sending...' : 
                       contactStatus === 'success' ? 'Message Sent Successfully ✓' : 
                       contactStatus === 'error' ? 'Failed to Send. Try again.' : 'Submit Request'}
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                      By submitting, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

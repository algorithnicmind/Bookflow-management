'use client'

/**
 * Landing Page
 * ------------
 * The public-facing marketing page. Contains the "Get Started" contact form 
 * which submits data to the backend /api/contact endpoint.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'motion/react'
import AppleEmoji from '@/components/AppleEmoji'
import LiveClock from '@/components/Layout/LiveClock'
import { contactApi, platformConfigApi } from '@/services/api'
import LeadModal from '@/components/LeadModal'
import OnboardingModal from '@/components/OnboardingModal'
import { toast } from 'react-hot-toast'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('free_trial')
  const [platformConfig, setPlatformConfig] = useState({
    show_onboarding_section: true,
    onboarding_section_title: 'Get Started with LeaveFlow',
    onboarding_section_subtitle: 'Fill out the form below and our team will set up your organization.'
  })
  
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)
  
  const [activeSolutionTab, setActiveSolutionTab] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSolutionTab((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  useEffect(() => {
    // Fetch platform config (public endpoint)
    platformConfigApi.get()
      .then(config => setPlatformConfig(config))
      .catch(() => {
        // Use defaults if fetch fails
      })
  }, [])

  useEffect(() => {
    if (!loading && user) {
      if (user.department === 'System') {
        router.push('/leads')
      } else {
        router.push('/dashboard')
      }
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
      toast.success('Message sent successfully!')
      setContactData({ name: '', email: '', message: '' })
      setTimeout(() => setContactStatus(null), 3000)
    } catch (error) {
      setContactStatus('error')
      toast.error('Failed to send message. Try again.')
      setTimeout(() => setContactStatus(null), 3000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(12px)' },
    visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
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
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          width: '90%',
          maxWidth: 1200,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="LeaveFlow Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>LeaveFlow</span>
        </div>

        {/* Center: Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Features</a>
          <a href="#solutions" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Solutions</a>
          <LiveClock compact />
          <a href="#contact" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Contact</a>
          <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-main)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>Pricing</a>
        </div>

        {/* Right: Actions */}
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

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
           {/* Hero Section */}
        {/* Hero Section */}
        <section style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingBottom: '60px' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '180px 24px 60px',
              maxWidth: 1000,
              margin: '0 auto',
            }}
          >
            {/* Continuously Levitating Hero Content */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <motion.div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 100,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                fontWeight: 600,
                marginBottom: 32,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}>
                <AppleEmoji char="✨" /> Welcome to the Future of Work
              </motion.div>

              <h1 style={{
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-2px',
                marginBottom: 24,
              }}>
                Breathe Easy.<br/>
                {/* Continuously Moving Liquid Gradient Text */}
                <motion.span 
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ 
                    display: 'inline-block',
                    background: 'linear-gradient(270deg, #10b981, #3b82f6, #10b981, #34d399)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0px 10px 20px rgba(16, 185, 129, 0.3))'
                  }}
                >
                  Automate Your Time Off.
                </motion.span>
              </h1>

              <p style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                color: 'var(--text-muted)',
                maxWidth: 720,
                lineHeight: 1.6,
                marginBottom: 48,
              }}>
                The ultimate time-off management platform designed for modern teams. Say goodbye to messy spreadsheets and endless email chains.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    if (platformConfig.show_onboarding_section) {
                      document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      // fallback
                    }
                  }}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Get Started Now <AppleEmoji char="🚀" />
                </button>
                <button
                  onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    padding: '16px 32px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  View Solutions
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Infinite Moving Band (Like the Marquee you loved) */}
          <div style={{ marginTop: '80px', width: '100%', overflow: 'hidden', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              style={{ display: 'flex', gap: '80px', whiteSpace: 'nowrap', width: 'fit-content' }}
            >
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="⚡" /> Lightning Fast</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="🔒" /> Enterprise Secure</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="🤖" /> AI Powered</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

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

          <div style={{ position: 'relative', overflow: 'hidden', padding: '20px 0', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
            {/* Top Row: Moves Left */}
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              style={{ display: 'flex', gap: '24px', width: 'fit-content', paddingLeft: '24px', marginBottom: '24px' }}
            >
              {[
                { icon: <AppleEmoji char="✨" />, title: 'Frictionless Requests', desc: 'Apply for time off in seconds. Real-time balance calculations ensure zero errors.' },
                { icon: <AppleEmoji char="⚡" />, title: '1-Click Approvals', desc: 'Managers can approve or deny requests directly from email or their dashboard instantly.' },
                { icon: <AppleEmoji char="📅" />, title: 'Global Holidays', desc: 'Automatically import regional public holidays tailored to your employee locations.' },
                // Duplicate for infinite loop
                { icon: <AppleEmoji char="✨" />, title: 'Frictionless Requests', desc: 'Apply for time off in seconds. Real-time balance calculations ensure zero errors.' },
                { icon: <AppleEmoji char="⚡" />, title: '1-Click Approvals', desc: 'Managers can approve or deny requests directly from email or their dashboard instantly.' },
                { icon: <AppleEmoji char="📅" />, title: 'Global Holidays', desc: 'Automatically import regional public holidays tailored to your employee locations.' },
              ].map((feature, i) => (
                <div key={`top-${i}`} style={{
                  minWidth: '400px',
                  padding: '40px 32px',
                  borderRadius: '24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--accent), #3b82f6)', opacity: 0.8 }} />
                  <div style={{ fontSize: '2.5rem', background: 'rgba(16, 185, 129, 0.1)', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{feature.title}</h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Bottom Row: Moves Right */}
            <motion.div 
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              style={{ display: 'flex', gap: '24px', width: 'fit-content', paddingLeft: '24px' }}
            >
              {[
                { icon: <AppleEmoji char="🛡️" />, title: 'Audit Ready', desc: 'Comprehensive, tamper-proof logs for HR compliance and seamless annual reporting.' },
                { icon: <AppleEmoji char="⚙️" />, title: 'Custom Workflows', desc: 'Multi-tiered approval chains. Route leaves to HR, Managers, or both seamlessly.' },
                { icon: <AppleEmoji char="📱" />, title: 'Anywhere Access', desc: 'Fully responsive design allows you to manage leaves from desktop, tablet, or phone.' },
                // Duplicate for infinite loop
                { icon: <AppleEmoji char="🛡️" />, title: 'Audit Ready', desc: 'Comprehensive, tamper-proof logs for HR compliance and seamless annual reporting.' },
                { icon: <AppleEmoji char="⚙️" />, title: 'Custom Workflows', desc: 'Multi-tiered approval chains. Route leaves to HR, Managers, or both seamlessly.' },
                { icon: <AppleEmoji char="📱" />, title: 'Anywhere Access', desc: 'Fully responsive design allows you to manage leaves from desktop, tablet, or phone.' },
              ].map((feature, i) => (
                <div key={`bottom-${i}`} style={{
                  minWidth: '400px',
                  padding: '40px 32px',
                  borderRadius: '24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3b82f6, var(--accent))', opacity: 0.8 }} />
                  <div style={{ fontSize: '2.5rem', background: 'rgba(59, 130, 246, 0.1)', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{feature.title}</h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Solutions Section - Split Layout Vertical Marquee */}
        <section id="solutions" style={{ display: 'flex', minHeight: '600px', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', position: 'relative', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          
          {/* Left Side: Sticky Title Area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', zIndex: 2 }}>
            <div style={{ maxWidth: '500px' }}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '24px' }}>
                  BUILT FOR SCALE
                </div>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, color: 'var(--text-main)' }}>
                  Solutions tailored for you.
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
                  Whether you're a fast-moving startup or a global enterprise, LeaveFlow scales perfectly with your needs to automate HR entirely.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Infinite Vertical Marquee */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: '600px', display: 'flex', justifyContent: 'center' }}>
            
            {/* Soft gradient masks to fade the top and bottom of the scrolling list */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />

            <motion.div 
              animate={{ y: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px', width: '80%', maxWidth: '500px' }}
            >
              {[
                { title: 'For HR Teams', desc: 'Automate compliance, eliminate manual data entry, and generate audit-ready reports instantly without the spreadsheets.', icon: '👥' },
                { title: 'For Managers', desc: 'Review and approve requests in one click without ever leaving your inbox, Slack, or Microsoft Teams.', icon: '⚡' },
                { title: 'For Employees', desc: 'Check balances, request time off, and plan holidays seamlessly from any device, anywhere in the world.', icon: '📱' },
                // Duplicated exactly for seamless infinite scrolling
                { title: 'For HR Teams', desc: 'Automate compliance, eliminate manual data entry, and generate audit-ready reports instantly without the spreadsheets.', icon: '👥' },
                { title: 'For Managers', desc: 'Review and approve requests in one click without ever leaving your inbox, Slack, or Microsoft Teams.', icon: '⚡' },
                { title: 'For Employees', desc: 'Check balances, request time off, and plan holidays seamlessly from any device, anywhere in the world.', icon: '📱' }
              ].map((sol, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      background: 'var(--bg-secondary)', 
                      width: '64px', height: '64px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)' 
                    }}>
                      <AppleEmoji char={sol.icon} />
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{sol.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.1rem' }}>{sol.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Responsive CSS override for mobile (stacks vertically instead of side-by-side) */}
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 900px) {
              #solutions { flex-direction: column !important; min-height: 800px !important; }
              #solutions > div:first-child { padding: 40px 20px !important; flex: none !important; height: auto !important; }
              #solutions > div:last-child { width: 100% !important; }
              #solutions > div:last-child > div:last-child { width: 90% !important; }
            }
          `}} />
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
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 40 }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Free Tier</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Up to 10 employees</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Basic leave tracking</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Standard support</li>
              </ul>
              <button onClick={() => {
                if (platformConfig.show_onboarding_section) {
                  setSelectedPlan('free_trial')
                  setOnboardingModalOpen(true)
                } else {
                  setLeadModalOpen(true)
                }
              }} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Start Free Tier</button>
            </motion.div>

            {/* Paid Plan */}
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
              <button onClick={() => {
                if (platformConfig.show_onboarding_section) {
                  setSelectedPlan('professional')
                  setOnboardingModalOpen(true)
                } else {
                  setLeadModalOpen(true)
                }
              }} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px var(--accent-glow)' }} onMouseEnter={e => e.target.style.background='var(--accent-hover)'} onMouseLeave={e => e.target.style.background='var(--accent)'}>Get Started</button>
            </motion.div>

            {/* Customization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 40 }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Customization</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Customization</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Everything in Professional</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> SSO & Advanced Security</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Dedicated Success Manager</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>✓</span> Custom integrations</li>
              </ul>
              <button onClick={() => {
                if (platformConfig.show_onboarding_section) {
                  setSelectedPlan('enterprise')
                  setOnboardingModalOpen(true)
                } else {
                  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
                }
              }} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Contact Sales</button>
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
                Whether you're looking for a customization plan, need custom integration, or just want to say hello, our team is ready to help.
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
      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
      <OnboardingModal isOpen={onboardingModalOpen} onClose={() => setOnboardingModalOpen(false)} selectedPlan={selectedPlan} />
    </div>
  )
}

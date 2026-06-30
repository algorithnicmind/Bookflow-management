'use client'

import { motion } from 'motion/react'

export default function PricingSection({ platformConfig, setSelectedPlan, setOnboardingModalOpen, setLeadModalOpen }) {
  return (
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
              setSelectedPlan('free_tier')
              setOnboardingModalOpen(true)
            } else {
              setLeadModalOpen(true)
            }
          }} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Start Free Tier</button>
        </motion.div>

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
              setSelectedPlan('customization')
              setOnboardingModalOpen(true)
            } else {
              document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
            }
          }} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)'}} onMouseLeave={e => {e.target.style.borderColor='var(--border)'; e.target.style.color='#fff'}}>Contact Sales</button>
        </motion.div>
      </div>
    </section>
  )
}

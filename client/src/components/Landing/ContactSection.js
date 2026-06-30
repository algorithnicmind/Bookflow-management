'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { contactApi } from '@/services/api'
import { toast } from 'react-hot-toast'

export default function ContactSection() {
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null)

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

  return (
    <section id="contact" style={{ padding: '120px 24px', width: '100%', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'relative' }}>
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
  )
}

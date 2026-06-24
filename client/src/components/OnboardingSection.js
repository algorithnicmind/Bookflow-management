'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AppleEmoji from '@/components/AppleEmoji'
import { onboardingApi } from '@/services/api'

export default function OnboardingSection({ title, subtitle }) {
  const [formData, setFormData] = useState({
    company_name: '',
    company_size: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    industry: '',
    special_requirements: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await onboardingApi.apply(formData)
      setSuccess(true)
    } catch (err) {
      setError(err.data?.detail || err.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  if (success) {
    return (
      <section id="onboarding" style={{ padding: '120px 24px', width: '100%', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: '#fff' }}>
            <AppleEmoji char="🎉" /> Application Submitted!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 32 }}>
            Thank you for your interest in LeaveFlow! Our team will review your application and contact you within 24 hours to complete your setup.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setFormData({
                company_name: '',
                company_size: '',
                admin_name: '',
                admin_email: '',
                admin_phone: '',
                industry: '',
                special_requirements: ''
              })
            }}
            style={{
              padding: '14px 28px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = '#fff' }}
          >
            Submit Another Application
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section id="onboarding" style={{ padding: '120px 24px', width: '100%', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Subtle Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
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
            marginBottom: 24,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
          }}>
            <AppleEmoji char="🚀" /> Quick Start
          </motion.div>

          <motion.h2 variants={itemVariants} style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>
            {title || 'Get Started with LeaveFlow'}
          </motion.h2>
          <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            {subtitle || 'Fill out the form below and our team will set up your organization. This is completely optional - you can also use the "Get Started" button above.'}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 24,
            padding: 48,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <div style={{ 
                padding: 16, borderRadius: 12, 
                background: 'var(--danger-bg)', border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--danger)', fontSize: '0.9rem' 
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Company Name *</label>
                <input
                  required
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Company Size *</label>
                <select
                  required
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s', cursor: 'pointer'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Your Name *</label>
                <input
                  required
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Work Email *</label>
                <input
                  required
                  type="email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleChange}
                  placeholder="jane@acme.com"
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Industry *</label>
                <input
                  required
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Technology, Healthcare"
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Phone Number *</label>
                <input
                  required
                  type="tel"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0199"
                  style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Special Requirements (Optional)</label>
              <textarea
                name="special_requirements"
                value={formData.special_requirements}
                onChange={handleChange}
                rows={4}
                placeholder="Any specific needs, integrations, or questions..."
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  padding: '14px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem',
                  outline: 'none', transition: 'all 0.2s', resize: 'vertical'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            
            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 8,
                  background: loading ? 'var(--text-muted)' : 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 14px var(--accent-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.background = 'var(--accent-hover)' }}
                onMouseLeave={(e) => { if (!loading) e.target.style.background = 'var(--accent)' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18 }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

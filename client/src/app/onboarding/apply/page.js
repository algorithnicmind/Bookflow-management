'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function ApplyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_size: '',
    industry: '',
    admin_name: '',
    admin_email: '',
    special_requirements: ''
  })

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
    const email = sessionStorage.getItem('onboarding_email')
    if (email) {
      setFormData(prev => ({ ...prev, admin_email: email }))
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await api.post('/onboarding/apply', formData)
      router.push('/onboarding/pending')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      padding: '40px 24px'
    }}>
      <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
        <img src="/logo.png" alt="LeaveFlow Logo" style={{ height: 26 }} />
        <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>LeaveFlow</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--bg-secondary)',
          borderRadius: 24,
          padding: 40,
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Complete Your Application</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Tell us a little bit about your organization to get started with LeaveFlow.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, marginBottom: 24, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Company Name</label>
              <input
                type="text" required
                value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Company Size</label>
              <select
                required
                value={formData.company_size} onChange={e => setFormData({...formData, company_size: e.target.value})}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', appearance: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              >
                <option value="" disabled>Select size</option>
                <option value="1-10">1 - 10 employees</option>
                <option value="11-50">11 - 50 employees</option>
                <option value="51-200">51 - 200 employees</option>
                <option value="201-500">201 - 500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Admin Name</label>
              <input
                type="text" required
                value={formData.admin_name} onChange={e => setFormData({...formData, admin_name: e.target.value})}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Admin Email</label>
              <input
                type="email" required
                value={formData.admin_email} onChange={e => setFormData({...formData, admin_email: e.target.value})}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Industry</label>
            <input
              type="text" required
              value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Special Requirements (Optional)</label>
            <textarea
              rows="3"
              value={formData.special_requirements} onChange={e => setFormData({...formData, special_requirements: e.target.value})}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 12,
              padding: '16px 24px', borderRadius: 8,
              background: 'var(--accent)', color: '#000', border: 'none',
              fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', boxShadow: '0 4px 14px var(--accent-glow)'
            }}
            onMouseEnter={(e) => { if(!loading) e.target.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { if(!loading) e.target.style.background = 'var(--accent)' }}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

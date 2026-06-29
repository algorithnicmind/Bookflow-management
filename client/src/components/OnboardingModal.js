'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { onboardingApi } from '@/services/api'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

const PLAN_META = {
  free_trial: {
    name: 'Free Trial',
    price: '$0/mo',
    color: '#a1a1aa',
    bg: 'rgba(161, 161, 161, 0.1)',
    border: 'rgba(161, 161, 161, 0.3)',
    features: ['Up to 10 employees', 'Basic leave tracking', 'Standard support'],
  },
  professional: {
    name: 'Professional',
    price: '$5/user/mo',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    features: ['Unlimited employees', 'Multi-tier approval workflows', 'Advanced reporting', 'Slack & Teams integrations'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    features: ['Everything in Professional', 'SSO & Advanced Security', 'Dedicated Success Manager', 'Custom integrations'],
  },
}

export default function OnboardingModal({ isOpen, onClose, selectedPlan = 'free_trial' }) {
  const [currentPlan, setCurrentPlan] = useState(selectedPlan)
  const [formData, setFormData] = useState({
    company_name: '',
    company_size: '',
    super_admin_name: '',
    super_admin_email: '',
    super_admin_phone: '',
    industry: '',
    special_requirements: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(selectedPlan)
      setSuccess(false)
      setError(null)
      setFormData({
        company_name: '',
        company_size: '',
        super_admin_name: '',
        super_admin_email: '',
        super_admin_phone: '',
        industry: '',
        special_requirements: '',
      })
    }
  }, [isOpen, selectedPlan])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleClose = () => {
    setSuccess(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onboardingApi.apply({ ...formData, selected_plan: currentPlan })
      setSuccess(true)
      toast.success('Application submitted successfully!')
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Failed to submit application. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const plan = PLAN_META[currentPlan] || PLAN_META.free_trial

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    padding: '10px 14px',
    borderRadius: 8,
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Application Submitted" width="480px">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#fff' }}>Thank you!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            We've received your details for the <strong style={{ color: plan.color }}>{plan.name}</strong> plan.
            Our team will get back to you shortly to complete your setup.
          </p>
          <Button onClick={handleClose} variant="primary">Close</Button>
        </div>
        <style jsx>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Get Started with LeaveFlow" width="580px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ marginBottom: 6 }}>
          <label style={labelStyle}>Selected Plan *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.keys(PLAN_META).map(key => {
              const p = PLAN_META[key]
              const isSelected = currentPlan === key
              return (
                <div 
                  key={key}
                  onClick={() => setCurrentPlan(key)}
                  style={{
                    padding: '12px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${isSelected ? p.color : 'var(--border)'}`,
                    background: isSelected ? p.bg : 'var(--bg-secondary)',
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 0 10px ${p.color}33` : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? p.color : 'var(--text-main)', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.price}</div>
                </div>
              )
            })}
          </div>
        </div>
        {error && (
          <div style={{
            padding: 12, borderRadius: 8, background: 'var(--danger-bg)',
            color: 'var(--danger)', fontSize: '0.85rem',
            animation: 'shake 0.4s ease',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Company Name *</label>
            <input required name="company_name" value={formData.company_name} onChange={handleChange} style={inputStyle} placeholder="Acme Inc."
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Company Size *</label>
            <select required name="company_size" value={formData.company_size} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Your Name *</label>
            <input required name="super_admin_name" value={formData.super_admin_name} onChange={handleChange} style={inputStyle} placeholder="Jane Doe"
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Work Email *</label>
            <input required type="email" name="super_admin_email" value={formData.super_admin_email} onChange={handleChange} style={inputStyle} placeholder="jane@acme.com"
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Industry *</label>
            <input required name="industry" value={formData.industry} onChange={handleChange} style={inputStyle} placeholder="e.g. Technology, Healthcare"
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Phone Number *</label>
            <input required type="tel" name="super_admin_phone" value={formData.super_admin_phone} onChange={handleChange} style={inputStyle} placeholder="e.g. +1 555-0199"
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Special Requirements (Optional)</label>
          <textarea name="special_requirements" value={formData.special_requirements} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} rows={3} placeholder="Any specific needs, integrations, or questions..."
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginTop: 4 }}>
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting...' : `Start ${plan.name}`}
          </Button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          By submitting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </Modal>
  )
}

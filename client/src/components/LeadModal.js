'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { onboardingApi } from '@/services/api'
import Button from '@/components/ui/Button'

export default function LeadModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    company_name: '',
    company_size: '',
    admin_name: '',
    admin_email: '',
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tell us about your organization" width="550px">
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#fff' }}>Thank you!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            We've received your details. Our team will get back to you shortly to complete your setup.
          </p>
          <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Company Name *</label>
              <input required name="company_name" value={formData.company_name} onChange={handleChange} className="form-input" placeholder="Acme Inc." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Company Size *</label>
              <select required name="company_size" value={formData.company_size} onChange={handleChange} className="form-input">
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Admin Name *</label>
              <input required name="admin_name" value={formData.admin_name} onChange={handleChange} className="form-input" placeholder="Jane Doe" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Admin Email *</label>
              <input required type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} className="form-input" placeholder="jane@acme.com" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Industry *</label>
            <input required name="industry" value={formData.industry} onChange={handleChange} className="form-input" placeholder="e.g. Technology, Healthcare" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Special Requirements (Optional)</label>
            <textarea name="special_requirements" value={formData.special_requirements} onChange={handleChange} className="form-input" rows={3} placeholder="Any specific needs..." />
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Submitting...' : 'Get Started'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

'use client'

/**
 * Account Settings Page
 * ---------------------
 * Allows individual users to update their personal profile (name, password).
 */

import { useState, useEffect } from 'react'
import { authApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function AccountSettingsPage() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    date_of_birth: '',
    phone_number: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile()
        setForm({
          name: data.name || '',
          email: data.email || '',
          password: '',
          location: data.location || '',
          date_of_birth: data.date_of_birth || '',
          phone_number: data.phone_number || ''
        })
      } catch (err) {
        console.error(err)
        setMessage({ text: 'Failed to load profile data', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const payload = { ...form }
      if (!payload.password) {
        delete payload.password
      }
      if (!payload.date_of_birth) {
        delete payload.date_of_birth
      }
      
      const updatedUser = await authApi.updateProfile(payload)
      // Update context user if name/email changed
      setUser({ ...user, name: updatedUser.name, email: updatedUser.email })
      
      setForm(prev => ({ ...prev, password: '' })) // Clear password field
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Update your personal information and preferences.</p>
      </div>

      <Card>
        {message.text && (
          <div style={{
            padding: 12,
            marginBottom: 20,
            borderRadius: 'var(--radius-sm)',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="John Doe" 
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input 
                required 
                type="email"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                placeholder="john@company.com" 
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input 
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                placeholder="New York, NY" 
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                value={form.phone_number} 
                onChange={e => setForm({...form, phone_number: e.target.value})} 
                placeholder="+1 (555) 000-0000" 
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date"
                value={form.date_of_birth} 
                onChange={e => setForm({...form, date_of_birth: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Change Password</label>
              <input 
                type="password"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                placeholder="Leave blank to keep current" 
              />
            </div>
          </div>
          
          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

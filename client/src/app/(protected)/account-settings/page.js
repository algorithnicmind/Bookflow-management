'use client'

/**
 * Account Settings Page
 * ---------------------
 * Allows individual users to update their personal profile (name, password).
 */

import { useState, useEffect } from 'react'
import { authApi, integrationsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth()
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

  const [calendarStatus, setCalendarStatus] = useState({ connected: false })
  const [checkingCalendar, setCheckingCalendar] = useState(true)

  const fetchCalendarStatus = async () => {
    try {
      const status = await integrationsApi.getCalendarStatus()
      setCalendarStatus(status)
    } catch (err) {
      console.error('Failed to fetch calendar status:', err)
    } finally {
      setCheckingCalendar(false)
    }
  }

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
    fetchCalendarStatus()
  }, [])

  const handleConnectCalendar = async (provider) => {
    try {
      const data = await integrationsApi.connectCalendar(provider)
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to get connection link', type: 'error' })
    }
  }

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
      updateUser({ name: updatedUser.name, email: updatedUser.email })
      
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

      <Card style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
          Calendar Integration
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Automatically sync your approved leaves to your work calendar and block your availability as Out of Office (OOO).
        </p>

        {checkingCalendar ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checking calendar integration status...</div>
        ) : (
          <div>
            {calendarStatus.connected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    Connected to {calendarStatus.provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Your approved leaves will automatically sync to your calendar.
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => handleConnectCalendar(calendarStatus.provider)}
                >
                  Reconnect
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  You have not connected a work calendar yet.
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <Button 
                    onClick={() => handleConnectCalendar('google')}
                    style={{
                      background: 'linear-gradient(135deg, #ea4335, #c5221f)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Connect Google Calendar
                  </Button>
                  <Button 
                    onClick={() => handleConnectCalendar('outlook')}
                    style={{
                      background: 'linear-gradient(135deg, #0078d4, #005a9e)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Connect Outlook Calendar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}


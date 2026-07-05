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
import { useAuth } from '@/features/auth/AuthContext'
import { toast } from 'react-hot-toast'

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Management', 'General', 'System']

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showPassword, setShowPassword] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    date_of_birth: '',
    phone_number: '',
    department: ''
  })

  const [calendarStatus, setCalendarStatus] = useState({ connected: false })
  const [checkingCalendar, setCheckingCalendar] = useState(true)

  const fetchCalendarStatus = async (signal) => {
    try {
      const status = await integrationsApi.getCalendarStatus(signal)
      setCalendarStatus(status)
    } catch (err) {
      console.error('Failed to fetch calendar status:', err)
    } finally {
      setCheckingCalendar(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile(controller.signal)
        setForm({
          name: data.name || '',
          email: data.email || '',
          password: '',
          location: data.location || '',
          date_of_birth: data.date_of_birth || '',
          phone_number: data.phone_number || '',
          department: data.department || ''
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
        setMessage({ text: 'Failed to load profile data', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
    fetchCalendarStatus(controller.signal)
    return () => controller.abort()
  }, [])

  const handleConnectCalendar = async (provider) => {
    try {
      const data = await integrationsApi.connectCalendar(provider)
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (err) {
      const msg = err.message || 'Failed to get connection link'
      setMessage({ text: msg, type: 'error' })
      toast.error(msg)
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
      toast.success('Profile updated successfully!')
    } catch (err) {
      const msg = err.message || 'Failed to update profile'
      setMessage({ text: msg, type: 'error' })
      toast.error(msg)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            {user?.profile_image_url ? (
              <img 
                src={user.profile_image_url} 
                alt="Profile" 
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} 
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, color: '#fff'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <input 
              type="file" 
              id="avatarUpload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  setSaving(true)
                  const res = await authApi.uploadAvatar(file)
                  updateUser({ profile_image_url: res.profile_image_url })
                  toast.success('Profile picture updated!')
                } catch (err) {
                  toast.error(err.message || 'Failed to upload image')
                } finally {
                  setSaving(false)
                }
              }}
            />
            <button 
              onClick={() => document.getElementById('avatarUpload').click()}
              disabled={saving}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                fontSize: '0.8rem'
              }}
              title="Upload new picture"
            >
              📷
            </button>
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{user?.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>

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
              <label>Department</label>
              <select 
                value={form.department} 
                onChange={e => setForm({...form, department: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              >
                <option value="">Select a department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
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
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  placeholder="Leave blank to keep current" 
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
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


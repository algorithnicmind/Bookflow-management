'use client'

import { useState } from 'react'
import { authApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ManageAdminsPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register(form)
      setMessage(res.message || 'Admin account created successfully!')
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Manage Admins</h1>
          <p className="page-subtitle">Create new admin accounts for system management</p>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--danger-bg)', border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20,
              }}>{error}</div>
            )}
            {message && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)', fontSize: '0.85rem', marginBottom: 20,
              }}>{message}</div>
            )}

            <div className="form-group">
              <label>Admin Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@company.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Secure password" />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Admin Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

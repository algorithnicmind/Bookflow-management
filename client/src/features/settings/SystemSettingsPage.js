'use client'

/**
 * System Settings Page
 * --------------------
 * A configuration hub for admins to manage Approval Chains, Public Holidays, and general Org settings.
 */

import { useState, useEffect } from 'react'
import { settingsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SystemSettingsPage() {
  const [form, setForm] = useState({
    max_casual_leave: 12,
    max_sick_leave: 12,
    max_earned_leave: 18,
    max_maternity_leave: 182,
    max_miscarriage_leave: 42,
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await settingsApi.get()
        if (data) {
          setForm({
            max_casual_leave: data.max_casual_leave ?? 12,
            max_sick_leave: data.max_sick_leave ?? 12,
            max_earned_leave: data.max_earned_leave ?? 18,
            max_maternity_leave: data.max_maternity_leave ?? 182,
            max_miscarriage_leave: data.max_miscarriage_leave ?? 42,
          })
        }
      } catch (err) {
        setError('Failed to load current settings')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await settingsApi.update(form)
      setMessage(res.message || 'Settings updated successfully')
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
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure organization-wide leave policies</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={() => window.location.href='/system-settings/holidays'}>Public Holidays</Button>
          <Button variant="outline" onClick={() => window.location.href='/system-settings/approval-chains'}>Approval Chains</Button>
          <Button variant="outline" onClick={() => window.location.href='/system-settings/leave-policies'}>Leave Policies</Button>
          <Button variant="outline" onClick={() => window.location.href='/system-settings/leave-types'}>Leave Types</Button>
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

            {initialLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Max Casual Leave (CL) Days</label>
                  <input type="number" min={1} value={form.max_casual_leave}
                    onChange={(e) => setForm({ ...form, max_casual_leave: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>Max Sick Leave (SL) Days</label>
                  <input type="number" min={1} value={form.max_sick_leave}
                    onChange={(e) => setForm({ ...form, max_sick_leave: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>Max Earned Leave (EL/PL) Days</label>
                  <input type="number" min={1} value={form.max_earned_leave}
                    onChange={(e) => setForm({ ...form, max_earned_leave: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>Max Maternity Leave Days</label>
                  <input type="number" min={1} value={form.max_maternity_leave}
                    onChange={(e) => setForm({ ...form, max_maternity_leave: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>Max Miscarriage Leave Days</label>
                  <input type="number" min={1} value={form.max_miscarriage_leave}
                    onChange={(e) => setForm({ ...form, max_miscarriage_leave: parseInt(e.target.value) || 0 })} />
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Save Settings
                </Button>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}

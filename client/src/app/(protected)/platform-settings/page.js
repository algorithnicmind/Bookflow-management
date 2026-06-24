'use client'

/**
 * Platform Settings Page
 * ----------------------
 * Platform owners can configure platform-wide settings like the onboarding section toggle.
 */

import { useState, useEffect } from 'react'
import { platformConfigApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function PlatformSettingsPage() {
  const [config, setConfig] = useState({
    show_onboarding_section: true,
    onboarding_section_title: 'Get Started with LeaveFlow',
    onboarding_section_subtitle: 'Fill out the form below and our team will set up your organization.'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const data = await platformConfigApi.get()
      setConfig(data)
    } catch (err) {
      setError('Failed to load platform config')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      const result = await platformConfigApi.update(config)
      setMessage('Platform settings updated successfully')
      setConfig(result)
    } catch (err) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure platform-wide settings for the landing page</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card>
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

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Landing Page Sections</h3>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Onboarding Section</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Show the direct onboarding form on the landing page (linked from pricing buttons)
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, show_onboarding_section: !prev.show_onboarding_section }))}
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 14,
                  background: config.show_onboarding_section ? 'var(--accent)' : 'var(--bg-secondary)',
                  border: `2px solid ${config.show_onboarding_section ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: config.show_onboarding_section ? 26 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {config.show_onboarding_section && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Onboarding Section Content</h3>
              
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={config.onboarding_section_title}
                  onChange={(e) => setConfig(prev => ({ ...prev, onboarding_section_title: e.target.value }))}
                  placeholder="Get Started with LeaveFlow"
                />
              </div>

              <div className="form-group">
                <label>Section Subtitle</label>
                <textarea
                  value={config.onboarding_section_subtitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, onboarding_section_subtitle: e.target.value }))}
                  placeholder="Fill out the form below and our team will set up your organization."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSave} fullWidth loading={saving} size="lg">
            Save Platform Settings
          </Button>
        </Card>

        <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>How it works</h4>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>When <strong>enabled</strong>: Pricing buttons scroll to the onboarding form section on the landing page</li>
            <li>When <strong>disabled</strong>: Pricing buttons open the Lead Modal popup instead</li>
            <li>Platform owners can customize the section title and subtitle</li>
            <li>Changes take effect immediately on the public landing page</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

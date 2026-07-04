'use client'

/**
 * Platform Owners Directory
 * -------------------------
 * Highly restricted view for managing the super-users (System department) of the entire SaaS platform.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { systemOwnersApi, platformConfigApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import AppleEmoji from '@/components/AppleEmoji'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function PlatformOwnersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [owners, setOwners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newOwner, setNewOwner] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [toast, setToast] = useState(null)

  // Config state
  const [config, setConfig] = useState(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchOwners = async (signal) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await systemOwnersApi.list(signal)
      setOwners(data.owners || [])
    } catch (err) {
      setError(err.message || 'Failed to load owners.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfig = async (signal) => {
    setConfigLoading(true)
    try {
      const data = await platformConfigApi.get(signal)
      setConfig(data)
    } catch (err) {
      console.error('Failed to load platform config', err)
    } finally {
      setConfigLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department !== 'System') return
    const controller = new AbortController()
    fetchOwners(controller.signal)
    fetchConfig(controller.signal)
    return () => controller.abort()
  }, [user])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreateOwner = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const res = await systemOwnersApi.create({
        ...newOwner,
        role: 'platform_owner',
        department: 'System',
        password: 'Owner@123!'
      })
      showToast(res.message)
      setIsModalOpen(false)
      setNewOwner({ name: '', email: '' })
      fetchOwners()
    } catch (err) {
      setSubmitError(err.message || 'Failed to create owner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveConfig = async () => {
    setConfigSaving(true)
    try {
      await platformConfigApi.update(config)
      showToast('Platform config saved')
    } catch (err) {
      showToast(err.message || 'Failed to save config', 'error')
    } finally {
      setConfigSaving(false)
    }
  }

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Platform Administration</h1>
          <p className="page-subtitle">Manage system-wide configuration and platform owners</p>
        </div>
      </div>

      {config && (
        <div style={{ marginBottom: 32 }} className="animate-in">
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Platform Configuration</h3>
            <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="show_onboarding" 
                  checked={config.show_onboarding_section} 
                  onChange={(e) => setConfig({ ...config, show_onboarding_section: e.target.checked })} 
                />
                <label htmlFor="show_onboarding" style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>Enable Public Onboarding (Landing Page)</label>
              </div>
              <div className="form-group">
                <label>Onboarding Section Title</label>
                <input value={config.onboarding_section_title} onChange={(e) => setConfig({ ...config, onboarding_section_title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Onboarding Section Subtitle</label>
                <input value={config.onboarding_section_subtitle} onChange={(e) => setConfig({ ...config, onboarding_section_subtitle: e.target.value })} />
              </div>
              <Button loading={configSaving} onClick={handleSaveConfig}>Save Configuration</Button>
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }} className="animate-in">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Platform Owners</h3>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Platform Owner</Button>
      </div>

      {isLoading ? (
        <div style={{ width: '100%' }}>
          <SkeletonTable rows={4} columns={4} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load owners</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={fetchOwners} style={{ marginTop: 16 }}>Try Again</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Status'].map((col) => (
                    <th key={col} style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.id}>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {owner.name} {owner.email === user.email && '(You)'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {owner.email}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {owner.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <Badge status={owner.is_active ? 'approved' : 'rejected'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Owner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Add Platform Owner">
        <form onSubmit={handleCreateOwner}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              required
              value={newOwner.name}
              onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              required
              value={newOwner.email}
              onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
              placeholder="jane@leaveflow.com"
            />
          </div>
          
          {submitError && (
            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', fontWeight: 500 }}>
              {submitError}
            </div>
          )}

          <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: 8, marginBottom: 24, fontSize: '0.85rem', display: 'flex', gap: 8 }}>
            <span>⚠️</span>
            <div>
              <strong>Note:</strong> The new owner will be created with the default password <code>Owner@123!</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Add Owner</Button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

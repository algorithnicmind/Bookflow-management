'use client'

/**
 * Tenant Provisioning Page
 * ------------------------
 * Accessible only to Platform Owners. Shows onboarding leads in 'connected' status.
 * Allows setting a custom password and access duration (in days) to create their tenant profile and administrator.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { onboardingApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AppleEmoji from '@/components/AppleEmoji'
import { formatDate } from '@/lib/utils'

export default function TenantsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const data = await onboardingApi.list({ status: 'connected' })
      setApplications(data.applications || [])
    } catch (err) {
      setError(err.message || 'Failed to load tenants.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department === 'System') {
      fetchApplications()
    }
  }, [user])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleOpenProvisionPage = (app) => {
    router.push(`/tenants/${app.id}`)
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1100,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Tenant Provisioning</h1>
            <p className="page-subtitle">Set up and manage organization accounts for your connected leads.</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load applications</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={fetchApplications} style={{ marginTop: 16 }}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AppleEmoji char="🤝" /></div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No Connected Leads</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>
              Only leads with status <strong>"Connected"</strong> are shown here. 
              Update lead statuses in the <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => router.push('/leads')}>Leads Board</span> first.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Company', 'Industry', 'Super Super Admin Email', 'Super Super Admin Name', 'Role', 'Phone', 'Setup Profile'].map((col) => (
                    <th key={col} style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <span>
                        {app.company_name}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>{app.company_size} employees</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {app.industry || '—'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {app.super_admin_email}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {app.super_admin_name || '—'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      {app.admin_role ? (
                        <span style={{
                          display: 'inline-block',
                          background: app.admin_role === 'super_admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                          color: app.admin_role === 'super_admin' ? '#10b981' : '#4f46e5',
                          border: app.admin_role === 'super_admin' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(79, 70, 229, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}>
                          {app.admin_role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}>
                          Super Admin
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {app.super_admin_phone || '—'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <Button size="sm" onClick={() => handleOpenProvisionPage(app)}>
                        Setup Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translate(20px, -50%); }
          to { opacity: 1; transform: translate(0, -50%); }
        }
      `}</style>
    </div>
  )
}

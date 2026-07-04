'use client'

/**
 * Platform Owner Tenant Dashboard
 * -------------------------------
 * Accessible only to Platform Owners. Shows a detailed list view of all created organizations.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { organizationsApi, authApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AppleEmoji from '@/components/AppleEmoji'
import { formatDate } from '@/lib/utils'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function OrganizationsPage() {
  const { user, login } = useAuth()
  const router = useRouter()

  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [impersonateLoadingId, setImpersonateLoadingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchOrganizations = async (signal) => {
    try {
      setIsLoading(true)
      const data = await organizationsApi.list(signal)
      setOrganizations(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load organizations.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImpersonate = async (orgId) => {
    setImpersonateLoadingId(orgId)
    try {
      const data = await authApi.impersonate(orgId)
      login(data.user)
      router.push('/dashboard')
    } catch (err) {
      setToast({ message: err.message || 'Failed to impersonate', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setImpersonateLoadingId(null)
    }
  }

  useEffect(() => {
    if (user?.department !== 'System') return
    const controller = new AbortController()
    fetchOrganizations(controller.signal)
    return () => controller.abort()
  }, [user])

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1100,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          {toast.message}
        </div>
      )}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">Manage and monitor all tenant organizations on the platform.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ width: '100%' }}>
          <SkeletonTable rows={6} columns={5} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load organizations</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchOrganizations} style={{ marginTop: 16 }}>
              Try Again
            </button>
          </div>
        </Card>
      ) : organizations.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No Organizations Found</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              There are currently no active tenants on the platform.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Organization', 'Domain', 'Plan', 'Max Employees', 'Status', 'Created', 'Actions'].map((col) => (
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
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <span 
                        style={{ cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline' }}
                        onClick={() => router.push(`/organizations/${org.id}`)}
                        title="View Settings"
                      >
                        {org.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {org.domain || '—'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--accent)',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {org.plan_type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {org.max_employees || 'Unlimited'}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <Badge status={org.is_active ? 'approved' : 'rejected'} />
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {formatDate(org.created_at)}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <Button size="sm" variant="secondary" loading={impersonateLoadingId === org.id} onClick={() => handleImpersonate(org.id)}>
                        <AppleEmoji char="🔑" /> Impersonate
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

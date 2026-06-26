'use client'

/**
 * Platform Owner Tenant Dashboard
 * -------------------------------
 * Accessible only to Platform Owners. Shows a detailed list view of all created organizations.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { organizationsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function OrganizationsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const data = await organizationsApi.list()
      setOrganizations(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load organizations.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department === 'System') {
      fetchOrganizations()
    }
  }, [user])

  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">Manage and monitor all tenant organizations on the platform.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
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
                  {['Organization', 'Domain', 'Plan', 'Max Employees', 'Status', 'Created'].map((col) => (
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

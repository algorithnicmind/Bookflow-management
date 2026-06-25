'use client'

/**
 * Leads / Contact Inquiries Page
 * ------------------------------
 * Restricted to Platform Owners. Displays contact submissions from the public landing page.
 * Platform Owner can update lead status via a dropdown (Contacted, Interested, Not Interested).
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { onboardingApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AppleEmoji from '@/components/AppleEmoji'
import { LEAD_STATUS_OPTIONS as STATUS_OPTIONS, getStatusMeta } from '@/lib/constants'

export default function LeadsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')

  const [applications, setApplications] = useState([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, contacted: 0, connected: 0, interested: 0, not_interested: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState(statusParam || null)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Sync filter when URL changes (e.g. clicking sidebar links)
  useEffect(() => {
    setActiveFilter(statusParam || null)
  }, [statusParam])

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchApplications = async (statusFilter = null) => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const data = await onboardingApi.list(params)
      
      let finalApplications = data.applications || []
      setApplications(finalApplications)
      setCounts(data.counts || { total: 0, pending: 0, contacted: 0, connected: 0, interested: 0, not_interested: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load applications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications(activeFilter)
  }, [activeFilter])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId)
    try {
      await onboardingApi.updateStatus(appId, newStatus)
      // Update local state immediately for responsiveness
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      )
      // Update counts based on the frontend changes, or ideally re-fetch:
      await fetchApplications(activeFilter)
      const meta = getStatusMeta(newStatus)
      showToast(`Status updated to "${meta.label}"`)
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filterTabs = [
    { key: null, label: 'All', count: counts.total || 0 },
    { key: 'pending', label: 'Pending', count: counts.pending || 0 },
    { key: 'contacted', label: 'Contacted', count: counts.contacted || 0 },
    { key: 'interested', label: 'Interested', count: counts.interested || 0 },
    { key: 'connected', label: 'Connected', count: counts.connected || 0 },
    { key: 'not_interested', label: 'Not Interested', count: counts.not_interested || 0 },
  ]

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
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
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">Review and manage platform leads and onboarding inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }} className="animate-in">
        {[
          { label: 'Total', value: counts.total || 0, emoji: '📋', color: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.25)' },
          { label: 'Pending', value: counts.pending || 0, emoji: '⏳', color: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.25)' },
          { label: 'Contacted', value: counts.contacted || 0, emoji: '📞', color: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.25)' },
          { label: 'Interested', value: counts.interested || 0, emoji: '🌟', color: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.25)' },
          { label: 'Connected', value: counts.connected || 0, emoji: '🤝', color: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.25)' },
          { label: 'Not Interested', value: counts.not_interested || 0, emoji: '❌', color: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.25)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: stat.color,
            border: `1px solid ${stat.border}`,
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: '1.8rem' }}><AppleEmoji char={stat.emoji} /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap',
      }} className="animate-in">
        {filterTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 100,
              border: activeFilter === tab.key ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeFilter === tab.key ? 'var(--accent-glow)' : 'transparent',
              color: activeFilter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== tab.key) {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== tab.key) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            {tab.label}
            <span style={{
              background: activeFilter === tab.key ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeFilter === tab.key ? '#000' : 'var(--text-muted)',
              padding: '2px 8px',
              borderRadius: 100,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load applications</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={() => fetchApplications(activeFilter)} style={{ marginTop: 16 }}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AppleEmoji char="📭" /></div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No applications found</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {activeFilter ? `No ${activeFilter} applications.` : 'No onboarding applications have been submitted yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Company', 'Industry', 'Super Admin Name', 'Super Admin Email', 'Phone', 'Size', 'Status', 'Submitted'].map((col) => (
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
                {applications.map((app) => {
                  const statusMeta = getStatusMeta(app.status)
                  return (
                    <tr
                      key={app.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {app.company_name}
                        </div>
                        {app.special_requirements && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.special_requirements}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {app.industry || '—'}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {app.super_admin_name || '—'}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {app.super_admin_email}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {app.super_admin_phone || '—'}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {app.company_size}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <select
                          id={`status-select-${app.id}`}
                          value={app.status}
                          disabled={updatingId === app.id || app.status === 'connected'}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            padding: '6px 28px 6px 12px',
                            borderRadius: 8,
                            border: `1px solid ${statusMeta.border}`,
                            background: `${statusMeta.bg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 8px center`,
                            color: statusMeta.color,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: (updatingId === app.id || app.status === 'connected') ? 'not-allowed' : 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s',
                            opacity: (updatingId === app.id || app.status === 'connected') ? 0.6 : 1,
                            minWidth: 160,
                          }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        {formatDate(app.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        select option {
          background: var(--bg-primary, #1a1a2e);
          color: var(--text-primary, #e0e0e0);
          padding: 8px;
        }
      `}</style>
    </div>
  )
}

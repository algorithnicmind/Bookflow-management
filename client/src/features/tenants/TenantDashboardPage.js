'use client'

/**
 * Tenant Dashboard Page
 * ---------------------
 * Shows org-level stats for a provisioned tenant.
 * Accessible only to Platform Owners from the tenant details page.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { onboardingApi, organizationsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AppleEmoji from '@/components/AppleEmoji'
import { SkeletonLayout } from '@/components/ui/Skeleton'

export default function TenantDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id

  const [app, setApp] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (!user || user.department !== 'System' || !applicationId) return
    const controller = new AbortController()
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const appData = await onboardingApi.get(applicationId, controller.signal)
        setApp(appData)
        if (appData.organization_id) {
          const dashData = await organizationsApi.getDashboard(appData.organization_id, controller.signal)
          setDashboard(dashData)
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to load dashboard.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
    return () => controller.abort()
  }, [user, applicationId])

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => router.push(`/tenants/${applicationId}`)}
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            ← Back to Details
          </button>
        </div>
        <h1 className="page-title">{app?.company_name || 'Tenant'} — Dashboard</h1>
        <p className="page-subtitle">Organization statistics and overview</p>
      </div>

      {isLoading ? (
        <SkeletonLayout />
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load dashboard</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
          </div>
        </Card>
      ) : !app?.organization_id ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AppleEmoji char="🏗️" /></div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Not Yet Provisioned</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              This application has not been approved yet. Approve it first to see the dashboard.
            </p>
            <Button variant="secondary" onClick={() => router.push(`/tenants/${applicationId}`)} style={{ marginTop: 16 }}>
              Go to Provisioning
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }} className="animate-in">
            {[
              { label: 'Total Employees', value: dashboard?.total_employees ?? 0, emoji: '👥', color: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.25)' },
              { label: 'Total Leaves', value: dashboard?.total_leave_requests ?? 0, emoji: '📋', color: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.25)' },
              { label: 'Approved', value: dashboard?.approved_leaves ?? 0, emoji: '✅', color: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.25)' },
              { label: 'Pending', value: dashboard?.pending_leaves ?? 0, emoji: '⏳', color: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.25)' },
              { label: 'Rejected', value: dashboard?.rejected_leaves ?? 0, emoji: '❌', color: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.25)' },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: stat.color, border: `1px solid ${stat.border}`,
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
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

          {/* Department breakdown if available */}
          {dashboard?.department_breakdown && dashboard.department_breakdown.length > 0 && (
            <Card>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AppleEmoji char="🏢" /> Department Breakdown
              </h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {dashboard.department_breakdown.map((dept) => (
                  <div key={dept.department} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{dept.department || 'Unassigned'}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{dept.employees} employee{dept.employees !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

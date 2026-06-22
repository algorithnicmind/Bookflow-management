'use client'

/**
 * Dashboard Page
 * --------------
 * The main landing area for authenticated users. Displays personalized widgets
 * based on the user's role (e.g. pending approvals for managers, leave balance for employees).
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { dashboardApi } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, getLeaveTypeIcon } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.department === 'System') {
      router.push('/leads')
    } else {
      fetchDashboard()
    }
  }, [user, router])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await dashboardApi.stats()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen">
          <div className="spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Failed to load dashboard</div>
          <div className="empty-state-desc">{error}</div>
          <Button style={{ marginTop: 20 }} onClick={fetchDashboard}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const role = user?.role || 'employee'
  const isManager = ['manager', 'admin', 'super_admin'].includes(role)
  const isAdmin = ['admin', 'super_admin'].includes(role)

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            {role === 'employee' && 'My Dashboard'}
            {role === 'manager' && 'Manager Dashboard'}
            {role === 'admin' && 'Admin Dashboard'}
            {role === 'super_admin' && (user?.department === 'System' ? 'Platform Owner Dashboard' : 'Super Admin Dashboard')}
          </h1>
          <p className="page-subtitle">
            {role === 'employee' && 'Overview of your leave status and balances'}
            {role === 'manager' && 'Team overview, pending approvals, and more'}
            {role === 'admin' && 'System-wide statistics and employee overview'}
            {role === 'super_admin' && (user?.department === 'System' ? 'Platform metrics and system controls' : 'Organization-wide metrics and controls')}
          </p>
        </div>
        <Button onClick={() => router.push('/apply-leave')}>
          + Apply Leave
        </Button>
      </div>

      <div className="grid-4 animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard
          label="Total Requests"
          value={data.stats?.total_requests || 0}
          icon="📋"
          color="var(--accent)"
        />
        <StatCard
          label="Pending"
          value={data.stats?.pending || 0}
          icon="⏳"
          color="var(--warning)"
        />
        <StatCard
          label="Approved"
          value={data.stats?.approved || 0}
          icon="✅"
          color="var(--success)"
        />
        <StatCard
          label="Rejected"
          value={data.stats?.rejected || 0}
          icon="❌"
          color="var(--danger)"
        />
      </div>

      {isManager && data.team_pending_count !== undefined && (
        <div className="grid-3 animate-in" style={{ animationDelay: '0.1s', marginTop: 20 }}>
          <StatCard
            label="Team Pending Approvals"
            value={data.team_pending_count}
            icon="⏳"
            color="var(--warning)"
            subtitle={data.team_pending_count > 0 ? `${data.team_pending_count} request(s) awaiting your action` : 'No pending requests'}
          />
          {data.team_on_leave_today && data.team_on_leave_today.length > 0 && (
            <div className="glass" style={{ padding: 20, gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Team on Leave Today
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {data.team_on_leave_today.map((name, i) => (
                  <span key={i} style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: 'var(--warning-bg)',
                    color: 'var(--warning)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && data.org_stats && (
        <div className="grid-3 animate-in" style={{ animationDelay: '0.15s', marginTop: 20 }}>
          <StatCard
            label="Total Employees"
            value={data.org_stats.total_employees || 0}
            icon="👥"
            color="var(--info)"
          />
          <StatCard
            label="Total Requests (All)"
            value={data.org_stats.total_requests || 0}
            icon="📊"
            color="var(--accent)"
          />
          {data.org_stats.department_breakdown && data.org_stats.department_breakdown.length > 0 && (
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Department Breakdown
              </div>
              {data.org_stats.department_breakdown.map((dept, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: i < data.org_stats.department_breakdown.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: '0.85rem' }}>{dept.department}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                    {dept.count} {dept.count === 1 ? 'employee' : 'employees'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Leave Balances</h3>
          </div>
          {data.balances && data.balances.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {data.balances.map((b, i) => (
                <div key={i} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span>{getLeaveTypeIcon(b.leave_type)}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{b.leave_type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 2 }}>Total</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.total_days}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 2 }}>Used</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{b.used_days}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 2 }}>Remaining</div>
                      <div style={{
                        fontSize: '1.1rem', fontWeight: 700,
                        color: b.remaining < 3 ? 'var(--danger)' : 'var(--success)',
                      }}>{b.remaining}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-state-desc">No balance data available</div>
            </div>
          )}
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Leaves</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/leave-history')}>
              View All →
            </Button>
          </div>
          {data.recent_leaves && data.recent_leaves.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_leaves.map((leave, i) => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{getLeaveTypeIcon(leave.leave_type)} {leave.leave_type}</span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{leave.days || '-'}</td>
                      <td style={{ padding: '12px' }}><Badge status={leave.status} /></td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'right', fontSize: '0.8rem' }}>
                        {formatDate(leave.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No leaves yet</div>
              <div className="empty-state-desc">Apply for your first leave to get started</div>
              <Button style={{ marginTop: 16 }} onClick={() => router.push('/apply-leave')}>
                Apply for Leave
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

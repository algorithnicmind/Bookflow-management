'use client'

/**
 * Team Overview Page
 * ------------------
 * A calendar and list view for Managers to see who is absent on their direct team today/this week.
 */

import { useState, useEffect } from 'react'
import { dashboardApi, leavesApi } from '@/services/api'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { formatDate } from '@/lib/utils'
import LeaveTypeIcon from '@/components/shared/LeaveTypeIcon'

import { SkeletonLayout } from '@/components/ui/Skeleton'

export default function TeamOverviewPage() {
  const [data, setData] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal) => {
    setLoading(true)
    try {
      const [statsRes, pendingRes] = await Promise.all([
        dashboardApi.stats(signal),
        leavesApi.pending(signal),
      ])
      setData(statsRes)
      setPending(pendingRes.pending || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SkeletonLayout />
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Team Overview</h1>
          <p className="page-subtitle">View your team's leave status and availability</p>
        </div>
      </div>

      <div className="grid-3 animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard label="Pending Approvals" value={data?.team_pending_count || 0} icon="⏳" color="var(--warning)" />
        <StatCard label="On Leave Today" value={data?.team_on_leave_today?.length || 0} icon="🏖️" color="var(--info)"
          subtitle={data?.team_on_leave_today?.length > 0 ? data.team_on_leave_today.join(', ') : 'No one on leave'} />
      </div>

      <Card>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Pending Requests</h3>
        {pending.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px' }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No pending requests</div>
            <div className="empty-state-desc">All team requests have been reviewed</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{req.employee_name || `#${req.employee_id}`}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}><LeaveTypeIcon type={req.leave_type} /> {req.leave_type}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDate(req.start_date)} - {formatDate(req.end_date)}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{req.days || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}><Badge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

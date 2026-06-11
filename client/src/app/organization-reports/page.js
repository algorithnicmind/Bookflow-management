'use client'

import { useState, useEffect } from 'react'
import { reportsApi } from '@/services/api'
import Card from '@/components/UI/Card'
import StatCard from '@/components/UI/StatCard'

export default function OrganizationReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.organization()
      setData(res.org_stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen"><div className="spinner" /><span>Loading reports...</span></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">{error}</div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Organization Reports</h1>
          <p className="page-subtitle">Organization-wide metrics and employee distribution</p>
        </div>
      </div>

      <div className="grid-4 animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard label="Total Employees" value={data.total_employees || 0} icon="👥" color="var(--info)" />
        {data.total_admins !== undefined && (
          <StatCard label="Total Admins" value={data.total_admins} icon="👑" color="var(--accent)" />
        )}
        <StatCard label="Total Leave Requests" value={data.total_leave_requests || data.total_requests || 0} icon="📋" color="var(--warning)" />
        <StatCard label="Approved / Rejected" value={`${data.approved_leaves || 0} / ${data.rejected_leaves || 0}`} icon="📊" color="var(--success)" />
      </div>

      {data.department_breakdown && data.department_breakdown.length > 0 && (
        <Card>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Department Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employees</th>
                  {data.department_breakdown[0].leaves !== undefined && (
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leaves</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.department_breakdown.map((dept, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{dept.department}</td>
                    <td style={{ padding: '12px' }}>{dept.employees || dept.count || 0}</td>
                    {dept.leaves !== undefined && (
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{dept.leaves}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

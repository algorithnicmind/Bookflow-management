'use client'

/**
 * Dashboard Page
 * --------------
 * The main landing area for authenticated users. Displays personalized widgets
 * based on the user's role (e.g. pending approvals for managers, leave balance for employees).
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { dashboardApi } from '@/services/api'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import LeaveTypeIcon from '@/components/shared/LeaveTypeIcon'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadialBarChart, RadialBar } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.department === 'System') {
      router.push('/leads')
      return
    }
    const controller = new AbortController()
    fetchDashboard(controller.signal)
    return () => controller.abort()
  }, [user, router])

  const fetchDashboard = async (signal) => {
    setLoading(true)
    try {
      const res = await dashboardApi.stats(signal)
      setData(res)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
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

  // Color mapping for leave types based on the project's CSS variables
  const leaveColors = {
    sick: '#f43f5e',
    casual: '#f59e0b',
    earned: '#10b981',
    unpaid: '#64748b',
    floater: '#3b82f6',
    default: '#10b981'
  }
  
  const getChartColor = (type) => leaveColors[type?.toLowerCase()] || leaveColors.default;

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {role === 'employee' && 'My Dashboard'}
            {role === 'manager' && 'Manager Dashboard'}
            {role === 'admin' && 'Admin Dashboard'}
            {role === 'super_admin' && (user?.department === 'System' ? 'Platform Owner Dashboard' : 'Super Admin Dashboard')}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem' }}>
            {role === 'employee' && 'Overview of your leave status and balances'}
            {role === 'manager' && 'Team overview, pending approvals, and more'}
            {role === 'admin' && 'System-wide statistics and employee overview'}
            {role === 'super_admin' && (user?.department === 'System' ? 'Platform metrics and system controls' : 'Organization-wide metrics and controls')}
          </p>
        </div>
        <Button onClick={() => router.push('/apply-leave')} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
          + Apply Leave
        </Button>
      </div>

      {/* KPI WIDGETS */}
      <div className="grid-4 animate-in" style={{ animationDelay: '0.05s', marginBottom: '28px' }}>
        <div className="glass widget-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="widget-header" style={{ marginBottom: '16px' }}>
            <span className="widget-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)', width: '48px', height: '48px', fontSize: '1.5rem' }}>📋</span>
          </div>
          <div className="widget-value" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{data.stats?.total_requests || 0}</div>
          <div className="widget-label" style={{ fontSize: '1rem' }}>Total Requests</div>
        </div>
        
        <div className="glass widget-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="widget-header" style={{ marginBottom: '16px' }}>
            <span className="widget-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', width: '48px', height: '48px', fontSize: '1.5rem' }}>⏳</span>
          </div>
          <div className="widget-value" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{data.stats?.pending || 0}</div>
          <div className="widget-label" style={{ fontSize: '1rem' }}>Pending Approvals</div>
        </div>
        
        <div className="glass widget-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="widget-header" style={{ marginBottom: '16px' }}>
            <span className="widget-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', width: '48px', height: '48px', fontSize: '1.5rem' }}>✅</span>
          </div>
          <div className="widget-value" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{data.stats?.approved || 0}</div>
          <div className="widget-label" style={{ fontSize: '1rem' }}>Approved Leaves</div>
        </div>
        
        <div className="glass widget-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="widget-header" style={{ marginBottom: '16px' }}>
            <span className="widget-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)', width: '48px', height: '48px', fontSize: '1.5rem' }}>❌</span>
          </div>
          <div className="widget-value" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{data.stats?.rejected || 0}</div>
          <div className="widget-label" style={{ fontSize: '1rem' }}>Rejected Leaves</div>
        </div>
      </div>

      {/* REQUESTS OVERVIEW CHART */}
      <div className="glass animate-in" style={{ animationDelay: '0.08s', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-main)' }}>Requests Breakdown</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
          
          <div style={{ flex: '1 1 300px', height: '280px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: data.stats?.pending || 0, fill: 'var(--warning)' },
                    { name: 'Approved', value: data.stats?.approved || 0, fill: 'var(--success)' },
                    { name: 'Rejected', value: data.stats?.rejected || 0, fill: 'var(--danger)' }
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={4}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="none"
                >
                  {
                    [
                      { fill: 'var(--warning)' },
                      { fill: 'var(--success)' },
                      { fill: 'var(--danger)' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Text */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
                {(data.stats?.pending || 0) + (data.stats?.approved || 0) + (data.stats?.rejected || 0)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Total</div>
            </div>
          </div>
          
          {/* Minimalist Legend */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Pending', count: data.stats?.pending || 0, color: 'var(--warning)' },
              { name: 'Approved', count: data.stats?.approved || 0, color: 'var(--success)' },
              { name: 'Rejected', count: data.stats?.rejected || 0, color: 'var(--danger)' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {/* LEAVE BALANCES WIDGETS */}
      <div className="glass animate-in" style={{ animationDelay: '0.1s', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Leave Balances</h3>
        </div>
        
        {data.balances && data.balances.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {data.balances.map((b, i) => {
              const color = getChartColor(b.leave_type);
              const chartData = [
                { name: 'Used', value: b.used_days, fill: color },
                { name: 'Remaining', value: b.remaining, fill: 'var(--border)' }
              ];
              
              return (
                <div key={i} style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  transition: 'var(--transition)'
                }} className="glass-hover">
                  <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={35}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }}
                          itemStyle={{ color: 'var(--text-main)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text for donut */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: color
                    }}>
                      {b.remaining}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.2rem' }}><LeaveTypeIcon type={b.leave_type} /></span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, textTransform: 'capitalize' }}>{b.leave_type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{b.total_days}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Used</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--warning)' }}>{b.used_days}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '40px 20px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-desc">No balance data available</div>
          </div>
        )}
      </div>

      <div className="grid-2 animate-in" style={{ animationDelay: '0.15s', alignItems: 'start' }}>
        {/* RECENT LEAVES WIDGET */}
        <div className="glass widget-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Leaves</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/leave-history')} style={{ fontSize: '0.85rem' }}>
              View All →
            </Button>
          </div>
          {data.recent_leaves && data.recent_leaves.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_leaves.map((leave, i) => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getChartColor(leave.leave_type) }}></div>
                          <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{leave.leave_type}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{leave.days || '-'} Days</div>
                        <div style={{ fontSize: '0.8rem' }}>{formatDate(leave.start_date)} - {formatDate(leave.end_date)}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}><Badge status={leave.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No leaves yet</div>
              <Button style={{ marginTop: 16 }} onClick={() => router.push('/apply-leave')}>
                Apply for Leave
              </Button>
            </div>
          )}
        </div>

        {/* EXTRA WIDGETS (Manager/Admin) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {isManager && data.team_pending_count !== undefined && (
            <div className="glass widget-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Team Pending</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Requests awaiting your action</p>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                  {data.team_pending_count}
                </div>
              </div>
              
              {data.team_on_leave_today && data.team_on_leave_today.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    Team on Leave Today
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {data.team_on_leave_today.map((name, i) => (
                      <span key={i} style={{
                        padding: '6px 14px',
                        borderRadius: 100,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
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
            <div className="glass widget-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Organization Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Total Employees</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--info)' }}>{data.org_stats.total_employees || 0}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Total Requests</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{data.org_stats.total_requests || 0}</div>
                </div>
              </div>
              
              {data.org_stats.department_breakdown && data.org_stats.department_breakdown.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                    Department Breakdown
                  </div>
                  {data.org_stats.department_breakdown.map((dept, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: i < data.org_stats.department_breakdown.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{dept.department}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '100px' }}>
                        {dept.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { onboardingApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, Folder, Users, User, Shield, Clock, Activity, ChevronRight, ChevronDown } from 'lucide-react'

// Recursive component to render the employee hierarchy tree
const EmployeeTreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const hasReports = node.reports && node.reports.length > 0
  const isGroup = node.role === 'group'

  const getIcon = () => {
    if (isGroup) return <Folder size={16} color="var(--accent)" />
    if (node.role === 'super_admin' || node.role === 'admin') return <Shield size={16} color="#ef4444" />
    if (node.role === 'manager') return <Users size={16} color="#f59e0b" />
    return <User size={16} color="#3b82f6" />
  }

  const formatLastLogin = (isoString) => {
    if (!isoString) return 'Never'
    const diff = Date.now() - new Date(isoString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div style={{ marginLeft: level > 0 ? 24 : 0 }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 12px',
          borderRadius: 8,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          marginBottom: 8,
          cursor: hasReports ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
          position: 'relative'
        }}
        onClick={() => hasReports && setIsExpanded(!isExpanded)}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {/* Connection line for nested items */}
        {level > 0 && (
          <div style={{ position: 'absolute', left: -24, top: '50%', width: 24, height: 1, background: 'var(--border)' }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', width: 24, justifyContent: 'center' }}>
          {hasReports ? (
            isExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
          ) : <div style={{ width: 14 }} />}
        </div>
        
        <div style={{ marginRight: 12 }}>{getIcon()}</div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{node.name}</div>
          {!isGroup && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {node.role.replace('_', ' ').toUpperCase()} • {node.department}
            </div>
          )}
        </div>
        
        {!isGroup && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <Clock size={12} />
            {formatLastLogin(node.last_login)}
          </div>
        )}
      </div>
      
      {isExpanded && hasReports && (
        <div style={{ position: 'relative', paddingLeft: 12 }}>
          {/* Vertical line connecting children */}
          <div style={{ position: 'absolute', left: 12, top: 0, bottom: 16, width: 1, background: 'var(--border)' }} />
          {node.reports.map((child, idx) => (
            <EmployeeTreeNode key={child.id || idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TenantDashboardPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const data = await onboardingApi.getDashboard(id)
        setDashboardData(data)
      } catch (err) {
        setError(err.message || 'Failed to load tenant dashboard.')
      } finally {
        setIsLoading(false)
      }
    }
    if (user?.department === 'System' && id) {
      fetchDashboard()
    }
  }, [id, user])

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '—'
    const d = new Date(isoDate)
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const getActionColor = (action) => {
    if (action.includes('approve')) return '#10b981'
    if (action.includes('reject')) return '#ef4444'
    if (action.includes('apply') || action.includes('create')) return '#3b82f6'
    return 'var(--text-dim)'
  }

  if (user?.department !== 'System') return null

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="page-container">
        <Button variant="secondary" onClick={() => router.push('/tenants')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Tenants
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Dashboard Unavailable</p>
            <p style={{ color: 'var(--text-muted)' }}>{error || "Could not load dashboard data."}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Back Button */}
      <div className="page-header animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        <Button variant="secondary" onClick={() => router.push('/tenants')}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Tenants
        </Button>
        <div>
          <h1 className="page-title">{dashboardData.company_name} Dashboard</h1>
          <p className="page-subtitle">End-to-end organizational structure and activity monitoring</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="animate-in" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{dashboardData.stats.total_employees}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Employees</div>
          </div>
        </Card>
        
        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{dashboardData.stats.total_managers}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Managers</div>
          </div>
        </Card>

        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{dashboardData.stats.total_super_admins}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Super Admins</div>
          </div>
        </Card>

        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{dashboardData.stats.total_admins}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Admins</div>
          </div>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="animate-in" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'flex-start' }}>
        
        {/* Left Side: Folder Hierarchy */}
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <Folder size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Company Structure</h2>
          </div>
          
          <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 8 }}>
            {dashboardData.hierarchy.length > 0 ? (
              dashboardData.hierarchy.map((node, idx) => (
                <EmployeeTreeNode key={node.id || idx} node={node} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No employees found in this organization.
              </div>
            )}
          </div>
        </Card>

        {/* Right Side: Activity Timeline */}
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <Activity size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Recent Activity Feed</h2>
          </div>

          <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 8 }}>
            {dashboardData.recent_activity.length > 0 ? (
              <div style={{ position: 'relative' }}>
                {/* Timeline vertical line */}
                <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'var(--border)' }} />
                
                {dashboardData.recent_activity.map((action, idx) => (
                  <div key={action.id} style={{ display: 'flex', gap: 16, marginBottom: 24, position: 'relative' }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-primary)', 
                      border: `2px solid ${getActionColor(action.action)}`, zIndex: 1, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getActionColor(action.action) }} />
                    </div>
                    
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{action.actor_name || 'System'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{formatDateTime(action.created_at)}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: getActionColor(action.action) }}>{action.action.toUpperCase()}</strong> on {action.target_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No recent activity recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

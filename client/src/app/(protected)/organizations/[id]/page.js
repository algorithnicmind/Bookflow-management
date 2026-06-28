'use client'

/**
 * Organization Dashboard & Settings Page
 * --------------------------------------
 * Platform Owner view for a specific tenant.
 * - Dynamic Dashboard (Stats, Activity, Structure)
 * - Edit Organization details (name, plan, status, etc.)
 * - Impersonate Super Admin
 * - Dynamic RBAC Matrix
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { organizationsApi, authApi, request } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, Folder, Users, User, Shield, Clock, Activity, ChevronRight, ChevronDown } from 'lucide-react'

// Known permissions list for the RBAC matrix
const AVAILABLE_PERMISSIONS = [
  'manage_employees',
  'approve_leaves',
  'view_reports',
  'manage_settings',
  'view_audit_logs',
  'apply_leave',
  'view_team'
]

const ROLES = ['super_admin', 'admin', 'manager', 'employee']

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

export default function TenantSettingsPage({ params }) {
  const orgId = params.id

  const { user } = useAuth()
  const router = useRouter()

  const [organization, setOrganization] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [roles, setRoles] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [toast, setToast] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false)

  // Local form state for org
  const [formData, setFormData] = useState({
    name: '',
    plan_type: 'starter',
    is_active: true,
    max_employees: '',
    module_access: {}
  })

  // Admin credentials state
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [orgData, rolesData, dashData] = await Promise.all([
        organizationsApi.get(orgId),
        organizationsApi.getRoles(orgId).catch(() => []),
        organizationsApi.getDashboard(orgId).catch(() => null)
      ])
      
      setOrganization(orgData)
      setDashboardData(dashData)
      setFormData({
        name: orgData.name,
        plan_type: orgData.plan_type,
        is_active: orgData.is_active,
        max_employees: orgData.max_employees || '',
        module_access: orgData.module_access || { chatbot: true, advanced_reports: false }
      })
      
      // Initialize roles, fill missing
      const fetchedRoles = Array.isArray(rolesData) ? rolesData : []
      const completeRoles = ROLES.map(rName => {
        const existing = fetchedRoles.find(r => r.role_name === rName)
        return existing || { role_name: rName, permissions: [] }
      })
      setRoles(completeRoles)
      
    } catch (err) {
      setError(err.message || 'Failed to load organization data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department === 'System' && orgId) {
      fetchData()
    }
  }, [user, orgId])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleUpdateOrganization = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        max_employees: formData.max_employees ? parseInt(formData.max_employees, 10) : null
      }
      await organizationsApi.update(orgId, payload)
      showToast('Organization settings updated.')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to update organization.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImpersonate = async () => {
    if (!confirm(`Are you sure you want to login as this tenant's Super Admin? This will replace your current session.`)) return
    
    setIsImpersonating(true)
    try {
      await authApi.impersonate(orgId)
      window.location.href = '/dashboard'
    } catch (err) {
      showToast(err.message || 'Failed to impersonate admin.', 'error')
      setIsImpersonating(false)
    }
  }

  const togglePermission = (roleName, permission) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role.role_name === roleName) {
        const perms = role.permissions || []
        const hasPerm = perms.includes(permission)
        return {
          ...role,
          permissions: hasPerm ? perms.filter(p => p !== permission) : [...perms, permission]
        }
      }
      return role
    }))
  }

  const saveRolePermissions = async (roleName) => {
    const role = roles.find(r => r.role_name === roleName)
    if (!role) return
    try {
      await organizationsApi.updateRole(orgId, roleName, role.permissions)
      showToast(`Permissions updated for ${roleName.replace('_', ' ')}.`)
    } catch (err) {
      showToast(err.message || `Failed to update permissions for ${roleName}.`, 'error')
    }
  }

  const handleRegisterAdmin = async (e) => {
    e.preventDefault()
    setIsRegisteringAdmin(true)
    try {
      await request('/api/auth/register', { 
        method: 'POST', 
        body: {
          ...adminData,
          organization_id: orgId 
        } 
      })
      showToast('Super Admin credentials configured successfully.')
      setAdminData({ name: '', email: '', password: '' })
    } catch (err) {
      showToast(err.message || 'Failed to configure super admin credentials.', 'error')
    } finally {
      setIsRegisteringAdmin(false)
    }
  }

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

  return (
    <div className="page-container" style={{ paddingBottom: 60, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

      <div className="page-header animate-in">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <div style={{ marginBottom: 12 }}>
              <span 
                style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                onClick={() => router.push('/organizations')}
              >
                ← Back to Organizations
              </span>
            </div>
            <h1 className="page-title">{organization?.name || 'Loading...'}</h1>
            <p className="page-subtitle">Tenant ID: {orgId} • {organization?.domain || 'No Domain'} • Comprehensive Overview</p>
          </div>
          <div>
            <Button 
              onClick={handleImpersonate} 
              loading={isImpersonating}
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Login As Super Admin
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Error</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={fetchData} style={{ marginTop: 16 }}>Try Again</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in delay-1">
          
          {/* Dashboard Stats */}
          {dashboardData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
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
          )}

          {/* Dashboard Structure and Activity */}
          {dashboardData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'flex-start' }}>
              
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
          )}

          {/* General Settings */}
          <Card>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'var(--text-main)' }}>General Settings</h2>
            <form onSubmit={handleUpdateOrganization}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Organization Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Plan Type</label>
                  <select
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Max Employees (Leave blank for unlimited)</label>
                  <input
                    type="number"
                    value={formData.max_employees}
                    onChange={(e) => setFormData({ ...formData, max_employees: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Account Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '42px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.is_active} 
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: formData.is_active ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {formData.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </label>
                  </div>
                </div>

              </div>
              
              <div style={{ marginBottom: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>Module Access</h3>
                <div style={{ display: 'flex', gap: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.module_access?.chatbot || false} 
                      onChange={(e) => setFormData({ ...formData, module_access: { ...formData.module_access, chatbot: e.target.checked } })}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '0.85rem' }}>AI Chatbot</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.module_access?.advanced_reports || false} 
                      onChange={(e) => setFormData({ ...formData, module_access: { ...formData.module_access, advanced_reports: e.target.checked } })}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '0.85rem' }}>Advanced Reports</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" loading={isSaving}>Save Changes</Button>
              </div>
            </form>
          </Card>

          {/* Super Admin Credentials */}
          <Card>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'var(--text-main)' }}>Configure Initial Super Admin</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Set up the primary super-admin account for this tenant. 
              Note: This is usually done during provisioning, but can be configured manually here.
            </p>
            <form onSubmit={handleRegisterAdmin}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={adminData.name}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" loading={isRegisteringAdmin} variant="secondary">Configure Credentials</Button>
              </div>
            </form>
          </Card>

          {/* Dynamic RBAC Matrix */}
          <Card>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-main)' }}>Role-Based Access Control (RBAC) Matrix</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              Configure what each role is allowed to do within this organization.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>Permissions \ Roles</th>
                    {roles.map(role => (
                      <th key={role.role_name} style={{ padding: '12px', borderBottom: '2px solid var(--border)', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                        {role.role_name.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <tr key={permission}>
                      <td style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {permission.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </td>
                      {roles.map(role => (
                        <td key={role.role_name} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                          <input 
                            type="checkbox"
                            checked={(role.permissions || []).includes(permission)}
                            onChange={() => togglePermission(role.role_name, permission)}
                            disabled={role.role_name === 'super_admin'}
                            style={{ width: 18, height: 18, cursor: role.role_name === 'super_admin' ? 'not-allowed' : 'pointer', accentColor: 'var(--accent)' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {roles.filter(r => r.role_name !== 'super_admin').map(role => (
                <Button key={role.role_name} variant="secondary" size="sm" onClick={() => saveRolePermissions(role.role_name)}>
                  Save {role.role_name.replace('_', ' ')}
                </Button>
              ))}
            </div>

          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

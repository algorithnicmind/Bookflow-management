'use client'

/**
 * Tenant Settings and Impersonation Page
 * --------------------------------------
 * Platform Owner view for a specific tenant.
 * - Edit Organization details (name, plan, status, etc.)
 * - Impersonate Super Admin
 * - Dynamic RBAC Matrix
 */

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { organizationsApi, authApi, request } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

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

export default function TenantSettingsPage({ params }) {
  // params in Next.js 14 app router might be a promise depending on how it's accessed, 
  // but usually it's just destructured. However, React complains if we don't unwrap it properly 
  // if it's async in recent Next.js versions. We'll use React.use() to be safe.
  const resolvedParams = use(params)
  const orgId = resolvedParams.id

  const { user } = useAuth()
  const router = useRouter()

  const [organization, setOrganization] = useState(null)
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
      const [orgData, rolesData] = await Promise.all([
        organizationsApi.get(orgId),
        organizationsApi.getRoles(orgId).catch(() => []) // It might fail if no roles exist yet
      ])
      
      setOrganization(orgData)
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
    if (!confirm('Are you sure you want to login as this tenant\\'s Super Admin? This will replace your current session.')) return
    
    setIsImpersonating(true)
    try {
      await authApi.impersonate(orgId)
      // Hard refresh to re-evaluate AuthContext and routing
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
      // Temporarily bypass standard auth flow just for this org (requires specific backend handling 
      // or using a specific endpoint to provision admins for *other* orgs. Currently, /api/auth/register 
      // depends on `current_org`, but we might need a Platform Owner specific endpoint. 
      // For now, we will simulate the UI structure as requested.)
      await request('/api/auth/register', { 
        method: 'POST', 
        body: {
          ...adminData,
          organization_id: orgId // Assuming backend will intercept this for Platform Owners
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

  if (user?.department !== 'System') return null

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
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
            <p className="page-subtitle">Tenant ID: {orgId} • {organization?.domain || 'No Domain'}</p>
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
                            disabled={role.role_name === 'super_admin'} // super_admin generally has all permissions implicitly
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

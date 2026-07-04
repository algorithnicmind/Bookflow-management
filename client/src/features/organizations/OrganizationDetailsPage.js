'use client'

/**
 * Organization Details Page
 * -------------------------
 * Platform Owner view for managing a specific organization.
 * Tabs: Overview, Roles, Departments, Leave Types, Dashboard.
 * Includes impersonate functionality.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { organizationsApi, authApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import AppleEmoji from '@/components/AppleEmoji'

const TABS = [
  { key: 'overview', label: 'Overview', emoji: '🏢' },
  { key: 'roles', label: 'Roles', emoji: '🔐' },
  { key: 'departments', label: 'Departments', emoji: '🏗️' },
  { key: 'leave-types', label: 'Leave Types', emoji: '📋' },
  { key: 'dashboard', label: 'Dashboard', emoji: '📊' },
]

const ALL_PERMISSIONS = [
  'manage_everything', 'manage_settings', 'manage_employees',
  'manage_leaves', 'approve_leaves', 'view_reports', 'view_basic_info',
]

export default function OrganizationDetailsPage() {
  const { user, login } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orgId = params?.id

  const [activeTab, setActiveTab] = useState('overview')
  const [org, setOrg] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Edit org state
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)

  // Roles state
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [rolePerms, setRolePerms] = useState([])
  const [roleSaveLoading, setRoleSaveLoading] = useState(false)

  // Departments state
  const [departments, setDepartments] = useState([])
  const [deptsLoading, setDeptsLoading] = useState(false)
  const [deptModal, setDeptModal] = useState(false)
  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [deptSaveLoading, setDeptSaveLoading] = useState(false)

  // Leave types state
  const [leaveTypes, setLeaveTypes] = useState([])
  const [ltLoading, setLtLoading] = useState(false)
  const [ltModal, setLtModal] = useState(false)
  const [ltForm, setLtForm] = useState({ name: '', description: '', default_days: 0, is_paid: true })
  const [ltSaveLoading, setLtSaveLoading] = useState(false)

  // Dashboard state
  const [dashboard, setDashboard] = useState(null)
  const [dashLoading, setDashLoading] = useState(false)

  // Impersonate
  const [impersonateLoading, setImpersonateLoading] = useState(false)

  useEffect(() => {
    if (user && user.department !== 'System') router.push('/dashboard')
  }, [user, router])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchOrg = useCallback(async (signal) => {
    if (!orgId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await organizationsApi.get(orgId, signal)
      setOrg(data)
      setEditForm({
        name: data.name || '',
        domain: data.domain || '',
        plan_type: data.plan_type || 'starter',
        max_employees: data.max_employees || '',
        is_active: data.is_active,
      })
    } catch (err) {
      setError(err.message || 'Failed to load organization.')
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    if (user?.department !== 'System' || !orgId) return
    const controller = new AbortController()
    fetchOrg(controller.signal)
    return () => controller.abort()
  }, [user, orgId, fetchOrg])

  // Tab data loaders
  const loadRoles = async (signal) => {
    setRolesLoading(true)
    try {
      const data = await organizationsApi.getRoles(orgId, signal)
      setRoles(data || [])
    } catch (err) { showToast(err.message, 'error') }
    finally { setRolesLoading(false) }
  }

  const loadDepartments = async (signal) => {
    setDeptsLoading(true)
    try {
      const data = await organizationsApi.getDepartments(orgId, signal)
      setDepartments(data || [])
    } catch (err) { showToast(err.message, 'error') }
    finally { setDeptsLoading(false) }
  }

  const loadLeaveTypes = async (signal) => {
    setLtLoading(true)
    try {
      const data = await organizationsApi.getLeaveTypes(orgId, signal)
      setLeaveTypes(data || [])
    } catch (err) { showToast(err.message, 'error') }
    finally { setLtLoading(false) }
  }

  const loadDashboard = async (signal) => {
    setDashLoading(true)
    try {
      const data = await organizationsApi.getDashboard(orgId, signal)
      setDashboard(data)
    } catch (err) { showToast(err.message, 'error') }
    finally { setDashLoading(false) }
  }

  useEffect(() => {
    if (!orgId || !user || user.department !== 'System') return
    const controller = new AbortController()
    if (activeTab === 'roles') loadRoles(controller.signal)
    if (activeTab === 'departments') loadDepartments(controller.signal)
    if (activeTab === 'leave-types') loadLeaveTypes(controller.signal)
    if (activeTab === 'dashboard') loadDashboard(controller.signal)
    return () => controller.abort()
  }, [activeTab, orgId, user])

  // Handlers
  const handleUpdateOrg = async () => {
    setEditLoading(true)
    try {
      const updated = await organizationsApi.update(orgId, {
        ...editForm,
        max_employees: editForm.max_employees ? parseInt(editForm.max_employees) : null,
      })
      setOrg(updated)
      showToast('Organization updated')
    } catch (err) { showToast(err.message, 'error') }
    finally { setEditLoading(false) }
  }

  const handleSaveRole = async () => {
    setRoleSaveLoading(true)
    try {
      await organizationsApi.updateRole(orgId, editingRole, rolePerms)
      showToast('Role permissions updated')
      setEditingRole(null)
      loadRoles()
    } catch (err) { showToast(err.message, 'error') }
    finally { setRoleSaveLoading(false) }
  }

  const handleDeleteRole = async (roleName) => {
    if (!confirm(`Delete role "${roleName}"?`)) return
    try {
      await organizationsApi.deleteRole(orgId, roleName)
      showToast('Role deleted')
      loadRoles()
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleCreateDept = async () => {
    setDeptSaveLoading(true)
    try {
      await organizationsApi.createDepartment(orgId, deptForm)
      showToast('Department created')
      setDeptModal(false)
      setDeptForm({ name: '', description: '' })
      loadDepartments()
    } catch (err) { showToast(err.message, 'error') }
    finally { setDeptSaveLoading(false) }
  }

  const handleDeleteDept = async (deptId) => {
    if (!confirm('Delete this department?')) return
    try {
      await organizationsApi.deleteDepartment(orgId, deptId)
      showToast('Department deleted')
      loadDepartments()
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleCreateLeaveType = async () => {
    setLtSaveLoading(true)
    try {
      await organizationsApi.createLeaveType(orgId, ltForm)
      showToast('Leave type created')
      setLtModal(false)
      setLtForm({ name: '', description: '', default_days: 0, is_paid: true })
      loadLeaveTypes()
    } catch (err) { showToast(err.message, 'error') }
    finally { setLtSaveLoading(false) }
  }

  const handleDeleteLeaveType = async (typeId) => {
    if (!confirm('Delete this leave type?')) return
    try {
      await organizationsApi.deleteLeaveType(orgId, typeId)
      showToast('Leave type deleted')
      loadLeaveTypes()
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleImpersonate = async () => {
    setImpersonateLoading(true)
    try {
      const data = await authApi.impersonate(orgId)
      login(data.user)
      router.push('/dashboard')
    } catch (err) { showToast(err.message, 'error') }
    finally { setImpersonateLoading(false) }
  }

  if (user?.department !== 'System') return null

  const tabStyle = (key) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
    background: activeTab === key ? 'var(--accent-glow)' : 'transparent',
    color: activeTab === key ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
  })

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1100,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <button
              onClick={() => router.push('/organizations')}
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8,
              }}
            >
              ← Back
            </button>
            <h1 className="page-title">{org?.name || 'Organization Details'}</h1>
            <p className="page-subtitle">Manage organization settings, roles, and structure</p>
          </div>
          {org && (
            <Button loading={impersonateLoading} onClick={handleImpersonate}>
              <AppleEmoji char="🔑" /> Impersonate
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={fetchOrg} style={{ marginTop: 16 }}>Try Again</Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 0 }} className="animate-in">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(tab.key)}>
                <AppleEmoji char={tab.emoji} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Card>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Organization Settings</h3>
              <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Domain</label>
                  <input value={editForm.domain} onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })} placeholder="e.g. acme.com" />
                </div>
                <div className="form-group">
                  <label>Plan Type</label>
                  <select value={editForm.plan_type} onChange={(e) => setEditForm({ ...editForm, plan_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Employees</label>
                  <input type="number" value={editForm.max_employees} onChange={(e) => setEditForm({ ...editForm, max_employees: e.target.value })} placeholder="Unlimited if empty" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="is_active" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />
                  <label htmlFor="is_active" style={{ margin: 0, fontSize: '0.88rem' }}>Active</label>
                </div>
                <Button loading={editLoading} onClick={handleUpdateOrg}>Save Changes</Button>
              </div>
            </Card>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <Card>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Role Permissions</h3>
              {rolesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
              ) : roles.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No custom roles defined.</p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {roles.map((role) => (
                    <div key={role.id} style={{
                      padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>{role.role_name.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {(role.permissions || []).map((p) => (
                            <span key={p} style={{
                              padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                              background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.2)',
                            }}>{p}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" variant="secondary" onClick={() => { setEditingRole(role.role_name); setRolePerms(role.permissions || []) }}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteRole(role.role_name)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Departments</h3>
                <Button size="sm" onClick={() => setDeptModal(true)}>+ Add Department</Button>
              </div>
              {deptsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
              ) : departments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No departments created.</p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {departments.map((dept) => (
                    <div key={dept.id} style={{
                      padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{dept.name}</span>
                        {dept.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>{dept.description}</p>}
                      </div>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteDept(dept.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Leave Types Tab */}
          {activeTab === 'leave-types' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Leave Types</h3>
                <Button size="sm" onClick={() => setLtModal(true)}>+ Add Leave Type</Button>
              </div>
              {ltLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
              ) : leaveTypes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No custom leave types defined.</p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {leaveTypes.map((lt) => (
                    <div key={lt.id} style={{
                      padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lt.name}</span>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{lt.default_days} days</span>
                          <span style={{
                            padding: '1px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                            background: lt.is_paid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: lt.is_paid ? '#10b981' : '#ef4444',
                          }}>{lt.is_paid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                        {lt.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>{lt.description}</p>}
                      </div>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteLeaveType(lt.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            dashLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
            ) : !dashboard ? (
              <Card><p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No dashboard data available.</p></Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }} className="animate-in">
                {[
                  { label: 'Employees', value: dashboard.total_employees ?? 0, emoji: '👥' },
                  { label: 'Leave Requests', value: dashboard.total_leave_requests ?? 0, emoji: '📋' },
                  { label: 'Approved', value: dashboard.approved_leaves ?? 0, emoji: '✅' },
                  { label: 'Pending', value: dashboard.pending_leaves ?? 0, emoji: '⏳' },
                  { label: 'Rejected', value: dashboard.rejected_leaves ?? 0, emoji: '❌' },
                ].map((s) => (
                  <Card key={s.label}>
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}><AppleEmoji char={s.emoji} /></div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Edit Role Modal */}
      <Modal isOpen={!!editingRole} onClose={() => setEditingRole(null)} title={`Edit Permissions: ${editingRole?.replace(/_/g, ' ')}`}>
        <div style={{ display: 'grid', gap: 10 }}>
          {ALL_PERMISSIONS.map((perm) => (
            <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={rolePerms.includes(perm)}
                onChange={(e) => {
                  if (e.target.checked) setRolePerms([...rolePerms, perm])
                  else setRolePerms(rolePerms.filter(p => p !== perm))
                }}
              />
              {perm.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button fullWidth loading={roleSaveLoading} onClick={handleSaveRole}>Save Permissions</Button>
          <Button variant="secondary" onClick={() => setEditingRole(null)}>Cancel</Button>
        </div>
      </Modal>

      {/* Add Department Modal */}
      <Modal isOpen={deptModal} onClose={() => setDeptModal(false)} title="Add Department">
        <div className="form-group">
          <label>Department Name</label>
          <input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. Engineering" />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Brief description" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button fullWidth loading={deptSaveLoading} onClick={handleCreateDept}>Create Department</Button>
          <Button variant="secondary" onClick={() => setDeptModal(false)}>Cancel</Button>
        </div>
      </Modal>

      {/* Add Leave Type Modal */}
      <Modal isOpen={ltModal} onClose={() => setLtModal(false)} title="Add Leave Type">
        <div className="form-group">
          <label>Name</label>
          <input value={ltForm.name} onChange={(e) => setLtForm({ ...ltForm, name: e.target.value })} placeholder="e.g. Paternity Leave" />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input value={ltForm.description} onChange={(e) => setLtForm({ ...ltForm, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Default Days</label>
          <input type="number" min={0} value={ltForm.default_days} onChange={(e) => setLtForm({ ...ltForm, default_days: parseInt(e.target.value) || 0 })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <input type="checkbox" id="lt_is_paid" checked={ltForm.is_paid} onChange={(e) => setLtForm({ ...ltForm, is_paid: e.target.checked })} />
          <label htmlFor="lt_is_paid" style={{ margin: 0, fontSize: '0.88rem' }}>Paid Leave</label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button fullWidth loading={ltSaveLoading} onClick={handleCreateLeaveType}>Create Leave Type</Button>
          <Button variant="secondary" onClick={() => setLtModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

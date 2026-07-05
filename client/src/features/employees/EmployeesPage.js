'use client'

/**
 * Employee Directory Page
 * -----------------------
 * Restricted to admins. Allows the organization administrator to add, edit,
 * or deactivate employee accounts within their tenant.
 */

import { useState, useEffect } from 'react'
import { employeesApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { useDebounce } from '@/hooks'

const roles = ['employee', 'manager', 'admin']
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Management', 'General']

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [total, setTotal] = useState(0)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: 'General', manager_id: null, gender: 'male',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const controller = new AbortController()
    fetchEmployees(controller.signal)
    return () => controller.abort()
  }, [debouncedSearch, page, perPage])

  const fetchEmployees = async (signal) => {
    setLoading(true)
    try {
      const res = await employeesApi.list({ search: debouncedSearch || undefined, page, per_page: perPage }, signal)
      setEmployees(res.employees || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await employeesApi.create(form)
      setAddModal(false)
      setForm({ name: '', email: '', password: '', role: 'employee', department: 'General', manager_id: null, gender: 'male' })
      fetchEmployees()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editModal) return
    setSubmitting(true)
    try {
      await employeesApi.update(editModal.id, {
        name: form.name,
        role: form.role,
        department: form.department,
        manager_id: form.manager_id,
        gender: form.gender,
      })
      setEditModal(null)
      fetchEmployees()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setSubmitting(true)
    try {
      await employeesApi.deactivate(deleteModal.id)
      setDeleteModal(null)
      fetchEmployees()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      department: emp.department,
      manager_id: emp.manager_id,
      gender: emp.gender || 'male',
    })
    setEditModal(emp)
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage all employees in the system</p>
        </div>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', role: 'employee', department: 'General', manager_id: null, gender: 'male' }); setAddModal(true) }}>
          + Add Employee
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonTable rows={5} columns={6} />
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">{error}</div>
            <Button style={{ marginTop: 16 }} onClick={fetchEmployees}>Retry</Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No employees found</div>
            <div className="empty-state-desc">{search ? 'Try a different search term' : 'Add your first employee to get started'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)', opacity: emp.is_active ? 1 : 0.5 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontWeight: 600 }}>{emp.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{emp.email}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 100,
                        background: emp.role === 'admin' || emp.role === 'super_admin' ? 'rgba(79, 70, 229, 0.15)' :
                          emp.role === 'manager' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: emp.role === 'admin' || emp.role === 'super_admin' ? '#4f46e5' :
                          emp.role === 'manager' ? '#f59e0b' : '#10b981',
                        fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{emp.gender || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{emp.department || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{emp.manager_name || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 10px', borderRadius: 100,
                        background: emp.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: emp.is_active ? '#10b981' : '#f43f5e',
                        fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(emp)}>
                          Edit
                        </Button>
                        {emp.is_active && (
                          <Button size="sm" variant="danger" onClick={() => setDeleteModal(emp)}>
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {total > 0 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} results
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select 
                value={perPage} 
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span style={{ fontSize: '0.85rem', padding: '0 8px' }}>Page {page} of {Math.ceil(total / perPage)}</span>
              <Button size="sm" variant="secondary" disabled={page >= Math.ceil(total / perPage)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Employee">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Secure password" required style={{ width: '100%', paddingRight: '40px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Employee</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Employee">
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email (cannot be changed)</label>
            <input value={form.email} disabled style={{ opacity: 0.5 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Deactivate Employee">
        {deleteModal && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              Are you sure you want to deactivate <strong style={{ color: 'var(--text-main)' }}>{deleteModal.name}</strong>?
              They will lose access to the system, but their historical data will be preserved.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button variant="danger" loading={submitting} onClick={handleDelete}>Yes, Deactivate</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { employeesApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const roles = ['employee', 'manager', 'admin']
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Management', 'General']

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: 'General', manager_id: null, gender: 'male',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await employeesApi.list({ search: search || undefined })
      setEmployees(res.employees || [])
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
          <div className="loading-screen">
            <div className="spinner" />
            <span>Loading employees...</span>
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
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Secure password" required />
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

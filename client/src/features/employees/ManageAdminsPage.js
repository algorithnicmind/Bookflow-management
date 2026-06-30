'use client'

/**
 * Manage Admins Page
 * ------------------
 * Allows Super Admins to create, edit, and deactivate Admin accounts.
 */

import { useState, useEffect } from 'react'
import { authApi, employeesApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filteredAdmins, setFilteredAdmins] = useState([])

  // Modal states
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', gender: 'male' })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await employeesApi.list()
      const adminList = res.employees?.filter(e => e.role === 'admin') || []
      setAdmins(adminList)
      setFilteredAdmins(adminList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredAdmins(admins)
    } else {
      const q = search.toLowerCase()
      setFilteredAdmins(
        admins.filter(a => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
      )
    }
  }, [search, admins])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authApi.register(form)
      setAddModal(false)
      setForm({ name: '', email: '', password: '', gender: 'male' })
      fetchAdmins()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editModal) return
    setSubmitting(true)
    try {
      await employeesApi.update(editModal.id, { name: form.name })
      setEditModal(null)
      fetchAdmins()
    } catch (err) {
      setError(err.message)
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
      fetchAdmins()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email, password: '', gender: admin.gender || 'male' })
    setEditModal(admin)
  }

  const activeCount = admins.filter(a => a.is_active).length
  const inactiveCount = admins.filter(a => !a.is_active).length

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Manage Admins</h1>
          <p className="page-subtitle">Create and manage administrator accounts</p>
        </div>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', gender: 'male' }); setAddModal(true) }}>
          + Add Admin
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid-3 animate-in" style={{ marginBottom: 28, animationDelay: '0.1s' }}>
        <StatCard label="Total Admins" value={admins.length} icon="👤" color="#4f46e5" />
        <StatCard label="Active" value={activeCount} icon="✅" color="#10b981" />
        <StatCard label="Inactive" value={inactiveCount} icon="⏸" color="#f43f5e" />
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--danger-bg)', border: '1px solid rgba(244, 63, 94, 0.2)',
          color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20,
        }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', float: 'right', fontSize: '1rem' }}>✕</button>
        </div>
      )}

      {/* Admins Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 0' }}>
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
            <span>Loading admins...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">No admins found</div>
            <div className="empty-state-desc">{search ? 'Try a different search term' : 'Create your first admin to get started'}</div>
            {!search && (
              <Button style={{ marginTop: 16 }} onClick={() => setAddModal(true)}>+ Add Admin</Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: h === 'Actions' ? 'right' : 'left',
                      padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500,
                      fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'var(--transition)',
                      opacity: admin.is_active ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>{admin.name}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{admin.email}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 100,
                        background: 'rgba(79, 70, 229, 0.15)',
                        color: '#4f46e5',
                        fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        Admin
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 10px', borderRadius: 100,
                        background: admin.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: admin.is_active ? '#10b981' : '#f43f5e',
                        fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(admin)}>
                          Edit
                        </Button>
                        {admin.is_active && (
                          <Button size="sm" variant="danger" onClick={() => setDeleteModal(admin)}>
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

      {/* Add Admin Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Admin">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@company.com" required />
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
          <div className="form-group">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Admin</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Admin">
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email (cannot be changed)</label>
            <input value={form.email} disabled style={{ opacity: 0.5 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Admin Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Deactivate Admin">
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

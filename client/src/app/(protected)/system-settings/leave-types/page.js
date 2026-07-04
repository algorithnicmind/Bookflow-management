'use client'

/**
 * Leave Types Page
 * ----------------
 * Manages custom leave types (e.g. Paternity, Bereavement) for the organization.
 */

import { useState, useEffect } from 'react'
import { settingsApi } from '@/services/api'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function LeaveTypesPage() {
  const router = useRouter()
  
  const [leaveTypes, setLeaveTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', default_days: 0, is_paid: true })
  const [saveLoading, setSaveLoading] = useState(false)
  
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchLeaveTypes = async () => {
    setIsLoading(true)
    try {
      const data = await settingsApi.getLeaveTypes()
      setLeaveTypes(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load leave types')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveTypes()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      await settingsApi.createLeaveType(form)
      showToast('Leave type created successfully')
      setModalOpen(false)
      setForm({ name: '', description: '', default_days: 0, is_paid: true })
      fetchLeaveTypes()
    } catch (err) {
      showToast(err.message || 'Failed to create leave type', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return
    try {
      await settingsApi.deleteLeaveType(id)
      showToast('Leave type deleted')
      fetchLeaveTypes()
    } catch (err) {
      showToast(err.message || 'Failed to delete leave type', 'error')
    }
  }

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

      <div className="page-header animate-in">
        <div>
          <button
            onClick={() => router.push('/system-settings')}
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8,
            }}
          >
            ← Back to Settings
          </button>
          <h1 className="page-title">Leave Types</h1>
          <p className="page-subtitle">Manage custom leave types for your organization</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Leave Type</Button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonTable rows={4} columns={5} />
          </div>
        ) : error ? (
          <Card>
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Error</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
              <Button variant="secondary" onClick={fetchLeaveTypes} style={{ marginTop: 16 }}>Try Again</Button>
            </div>
          </Card>
        ) : leaveTypes.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16 }}>No custom leave types defined.</p>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>Add your first leave type</Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Default Days</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Type</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map((lt) => (
                    <tr key={lt.id} style={{ transition: 'background 0.15s' }}>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>{lt.name}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{lt.description || '—'}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{lt.default_days}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                          background: lt.is_paid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: lt.is_paid ? '#10b981' : '#ef4444',
                        }}>
                          {lt.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(lt.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Leave Type">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paternity Leave" />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Default Days</label>
            <input type="number" min={0} value={form.default_days} onChange={(e) => setForm({ ...form, default_days: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="lt_is_paid" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
            <label htmlFor="lt_is_paid" style={{ margin: 0, fontSize: '0.88rem' }}>Paid Leave</label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" fullWidth loading={saveLoading}>Create Leave Type</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
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

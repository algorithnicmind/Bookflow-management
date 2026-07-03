'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { onboardingApi } from '@/services/api'
import { formatDate, formatDateTime } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import AppleEmoji from '@/components/AppleEmoji'

const PLAN_OPTIONS = [
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
]

export default function LeadDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id

  const [app, setApp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [notes, setNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [planLoading, setPlanLoading] = useState(false)

  const [approveModal, setApproveModal] = useState(false)
  const [approveForm, setApproveForm] = useState({ password: '', access_days: 30 })
  const [approveLoading, setApproveLoading] = useState(false)

  const [rejectModal, setRejectModal] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchApplication = async () => {
    if (!applicationId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await onboardingApi.get(applicationId)
      setApp(data)
      setNotes(data.internal_notes || '')
      setSelectedPlan(data.selected_plan || 'free_trial')
    } catch (err) {
      setError(err.message || 'Failed to load application.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department === 'System' && applicationId) {
      fetchApplication()
    }
  }, [user, applicationId])

  const handleSaveNotes = async () => {
    setNotesLoading(true)
    try {
      await onboardingApi.updateNotes(applicationId, notes)
      showToast('Notes saved successfully')
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error')
    } finally {
      setNotesLoading(false)
    }
  }

  const handleChangePlan = async (plan) => {
    setSelectedPlan(plan)
    setPlanLoading(true)
    try {
      await onboardingApi.updatePlan(applicationId, plan)
      setApp(prev => ({ ...prev, selected_plan: plan }))
      showToast(`Plan updated to "${plan}"`)
    } catch (err) {
      showToast(err.message || 'Failed to update plan', 'error')
    } finally {
      setPlanLoading(false)
    }
  }

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await onboardingApi.approve(applicationId, {
        password: approveForm.password || undefined,
        access_days: approveForm.access_days,
      })
      showToast('Application approved! Organization and admin created.')
      setApproveModal(false)
      await fetchApplication()
    } catch (err) {
      showToast(err.message || 'Failed to approve', 'error')
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    setRejectLoading(true)
    try {
      await onboardingApi.reject(applicationId)
      showToast('Application rejected')
      setRejectModal(false)
      await fetchApplication()
    } catch (err) {
      showToast(err.message || 'Failed to reject', 'error')
    } finally {
      setRejectLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await onboardingApi.deleteTenant(applicationId)
      showToast('Tenant deleted successfully')
      setDeleteModal(false)
      router.push('/leads')
    } catch (err) {
      showToast(err.message || 'Failed to delete tenant', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => router.push('/leads')}
                style={{
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                }}
              >
                ← Back
              </button>
            </div>
            <h1 className="page-title">{app?.company_name || 'Lead Details'}</h1>
            <p className="page-subtitle">Review and manage this onboarding lead</p>
          </div>
          {app && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {app.status !== 'approved' && app.status !== 'rejected' && (
                <>
                  <Button variant="success" onClick={() => setApproveModal(true)}>
                    <AppleEmoji char="✅" /> Approve
                  </Button>
                  <Button variant="danger" onClick={() => setRejectModal(true)}>
                    <AppleEmoji char="❌" /> Reject
                  </Button>
                </>
              )}
              <Button
                variant="danger"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
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
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load application</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="secondary" onClick={fetchApplication} style={{ marginTop: 16 }}>Try Again</Button>
          </div>
        </Card>
      ) : !app ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Application not found</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AppleEmoji char="🏢" /> Company Information
            </h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { label: 'Company Name', value: app.company_name },
                { label: 'Industry', value: app.industry || '—' },
                { label: 'Company Size', value: app.company_size },
                { label: 'Super Admin Name', value: app.super_admin_name || '—' },
                { label: 'Super Admin Email', value: app.super_admin_email },
                { label: 'Phone', value: app.super_admin_phone || '—' },
                { label: 'Special Requirements', value: app.special_requirements || '—' },
                { label: 'Submitted', value: formatDateTime(app.created_at) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, minWidth: 140 }}>{label}</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Status</span>
                <Badge status={app.status} />
              </div>
              {app.expires_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Expires</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{formatDate(app.expires_at)}</span>
                </div>
              )}
              {app.organization_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Organization ID</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>#{app.organization_id}</span>
                </div>
              )}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Card>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AppleEmoji char="📋" /> Selected Plan
              </h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => handleChangePlan(plan.value)}
                    disabled={planLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      border: selectedPlan === plan.value ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: selectedPlan === plan.value ? 'var(--accent-glow)' : 'transparent',
                      color: selectedPlan === plan.value ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: planLoading ? 'wait' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AppleEmoji char="📝" /> Internal Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this lead..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="sm" loading={notesLoading} onClick={handleSaveNotes}>Save Notes</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal isOpen={approveModal} onClose={() => setApproveModal(false)} title="Approve Application">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          This will create the organization, super admin account, and default leave balances.
        </p>
        <div className="form-group">
          <label>Admin Password (optional — auto-generated if empty)</label>
          <input
            type="password"
            value={approveForm.password}
            onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
            placeholder="Leave empty for auto-generated"
          />
        </div>
        <div className="form-group">
          <label>Access Duration (days)</label>
          <input
            type="number"
            min={1}
            value={approveForm.access_days}
            onChange={(e) => setApproveForm({ ...approveForm, access_days: parseInt(e.target.value) || 30 })}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="success" fullWidth loading={approveLoading} onClick={handleApprove}>
            Approve & Create Tenant
          </Button>
          <Button variant="secondary" onClick={() => setApproveModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Application">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Are you sure you want to reject this application? This action can be reversed by updating the status later.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="danger" fullWidth loading={rejectLoading} onClick={handleReject}>
            Reject Application
          </Button>
          <Button variant="secondary" onClick={() => setRejectModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Lead">
        <p style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: 20, fontWeight: 600 }}>
          ⚠️ This will permanently delete the application and its associated Organization and Super Admin if provisioned. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="danger" fullWidth loading={deleteLoading} onClick={handleDelete}>
            Delete Permanently
          </Button>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
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

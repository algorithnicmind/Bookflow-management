'use client'

import { useState, useEffect } from 'react'
import { leavesApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatDate, formatDateTime, getLeaveTypeIcon } from '@/lib/utils'

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionModal, setActionModal] = useState(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchPending() }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await leavesApi.pending()
      setRequests(res.pending || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action) => {
    if (!actionModal) return
    setSubmitting(true)
    try {
      if (action === 'approve') {
        await leavesApi.approve(actionModal.id, comments)
      } else {
        if (!comments.trim()) {
          alert('Rejection reason is required')
          setSubmitting(false)
          return
        }
        await leavesApi.reject(actionModal.id, comments)
      }
      setActionModal(null)
      setComments('')
      fetchPending()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Pending Requests</h1>
          <p className="page-subtitle">Review and manage leave requests from your team</p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <span>Loading pending requests...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">{error}</div>
            <Button style={{ marginTop: 16 }} onClick={fetchPending}>Retry</Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All caught up!</div>
            <div className="empty-state-desc">No pending leave requests to review</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      {req.employee_name || `Employee #${req.employee_id}`}
                      {req.current_approval_step > 1 && (
                        <span style={{display: 'inline-block', marginLeft: 8, padding: '2px 6px', background: 'var(--primary)', color: 'white', borderRadius: 12, fontSize: '0.7rem'}}>
                          Step {req.current_approval_step}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{req.department || '-'}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                      {getLeaveTypeIcon(req.leave_type)} {req.leave_type}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(req.start_date)} - {formatDate(req.end_date)}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{req.days || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setComments('')
                            setActionModal({ ...req, action: 'approve' })
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setComments('')
                            setActionModal({ ...req, action: 'reject' })
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setComments('') }}
        title={actionModal?.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
      >
        {actionModal && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 12 }}>
                <strong style={{ textTransform: 'capitalize' }}>{actionModal.employee_name || `Employee #${actionModal.employee_id}`}</strong>
                {' '}is requesting{' '}
                <strong style={{ textTransform: 'capitalize' }}>{actionModal.leave_type}</strong> leave
                from {formatDate(actionModal.start_date)} to {formatDate(actionModal.end_date)} ({actionModal.days} day(s)).
              </p>
              {actionModal.reason && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic',
                  marginBottom: 16,
                }}>
                  "{actionModal.reason}"
                </div>
              )}
            </div>

            <div className="form-group">
              <label>{actionModal.action === 'approve' ? 'Comments (optional)' : 'Rejection Reason *'}</label>
              <textarea
                placeholder={actionModal.action === 'approve' ? 'Add optional comments...' : 'Provide a reason for rejection (required)'}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setActionModal(null); setComments('') }}>
                Cancel
              </Button>
              <Button
                variant={actionModal.action === 'approve' ? 'success' : 'danger'}
                loading={submitting}
                onClick={() => handleAction(actionModal.action)}
              >
                {actionModal.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

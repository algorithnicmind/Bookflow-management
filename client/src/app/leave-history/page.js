'use client'

import { useState, useEffect } from 'react'
import { leavesApi } from '@/services/api'
import Card from '@/components/UI/Card'
import Badge from '@/components/UI/Badge'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import { formatDate, formatDateTime, getLeaveTypeIcon } from '@/lib/utils'

export default function LeaveHistoryPage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelModal, setCancelModal] = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { fetchLeaves() }, [filter])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await leavesApi.history({ status: filter !== 'all' ? filter : undefined })
      setLeaves(res.leaves || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await leavesApi.cancel(id)
      setCancelModal(null)
      fetchLeaves()
    } catch (err) {
      setError(err.message)
      setCancelModal(null)
    }
  }

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Leave History</h1>
          <p className="page-subtitle">View all your leave requests and their status</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 16px',
                borderRadius: 100,
                background: filter === f.value ? 'var(--accent)' : 'transparent',
                color: filter === f.value ? '#fff' : 'var(--text-muted)',
                border: filter === f.value ? 'none' : '1px solid var(--border)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <span>Loading leave history...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">{error}</div>
            <Button style={{ marginTop: 16 }} onClick={fetchLeaves}>Retry</Button>
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No leave requests found</div>
            <div className="empty-state-desc">There are no {filter !== 'all' ? filter : ''} leave requests to display</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave, i) => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {getLeaveTypeIcon(leave.leave_type)} {leave.leave_type}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDate(leave.start_date)}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDate(leave.end_date)}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{leave.days || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge status={leave.status} />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="ghost" onClick={() => setDetailModal(leave)}>
                          👁️
                        </Button>
                        {leave.status === 'pending' && (
                          <Button size="sm" variant="danger" onClick={() => setCancelModal(leave)}>
                            Cancel
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

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Leave Request">
        {cancelModal && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              Are you sure you want to cancel your <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{cancelModal.leave_type}</strong> leave
              from <strong>{formatDate(cancelModal.start_date)}</strong> to <strong>{formatDate(cancelModal.end_date)}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setCancelModal(null)}>Keep Request</Button>
              <Button variant="danger" onClick={() => handleCancel(cancelModal.id)}>Yes, Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Leave Details">
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Leave Type</div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{getLeaveTypeIcon(detailModal.leave_type)} {detailModal.leave_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Status</div>
                  <Badge status={detailModal.status} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Start Date</div>
                  <div>{formatDate(detailModal.start_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>End Date</div>
                  <div>{formatDate(detailModal.end_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Days</div>
                  <div style={{ fontWeight: 700 }}>{detailModal.days || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Applied On</div>
                  <div>{formatDateTime(detailModal.created_at)}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Reason</div>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{detailModal.reason}</div>
              </div>
              {detailModal.approval && (
                <div style={{
                  padding: '14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Manager Response
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Badge status={detailModal.approval.action} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      by {detailModal.approval.manager_name}
                    </span>
                  </div>
                  {detailModal.approval.comments && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{detailModal.approval.comments}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 6 }}>
                    {formatDateTime(detailModal.approval.acted_at)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { auditApi } from '@/services/api'
import { formatDateTime } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Filter States
  const [actorName, setActorName] = useState('')
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  
  // Pagination States
  const [page, setPage] = useState(1)
  const limit = 15
  
  // Modal details state
  const [activeLog, setActiveLog] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const offset = (page - 1) * limit
      const data = await auditApi.list({
        actor_name: actorName || undefined,
        action: action || undefined,
        target_type: targetType || undefined,
        limit,
        offset,
      })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  // Trigger search on filter changes or page transition
  useEffect(() => {
    fetchLogs()
  }, [page, action, targetType])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const handleReset = () => {
    setActorName('')
    setAction('')
    setTargetType('')
    setPage(1)
  }

  const getActionBadgeColor = (actionName) => {
    if (actionName.includes('create') || actionName.includes('apply')) {
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' } // Blue
    }
    if (actionName.includes('approve') || actionName.includes('accrual')) {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' } // Green
    }
    if (actionName.includes('deactivate') || actionName.includes('reject') || actionName.includes('cancel')) {
      return { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e' } // Red
    }
    return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' } // Purple for settings/updates
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track and inspect all organization policy adjustments, approvals, and employee operations for compliance.</p>
        </div>
      </div>

      {/* Filter panel */}
      <Card style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Search Actor</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Action Type</label>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Actions</option>
              <option value="leave_apply">Leave Applied</option>
              <option value="leave_cancel">Leave Cancelled</option>
              <option value="leave_approve">Leave Approved</option>
              <option value="leave_reject">Leave Rejected</option>
              <option value="employee_create">Employee Created</option>
              <option value="employee_update">Employee Updated</option>
              <option value="employee_deactivate">Employee Deactivated</option>
              <option value="settings_update">Settings Policy Updated</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Target Category</label>
            <select
              value={targetType}
              onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Categories</option>
              <option value="leave_request">Leave Requests</option>
              <option value="employee">Employees</option>
              <option value="system_settings">System Settings</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" size="md">
              Search
            </Button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = 'var(--text-main)'}
              onMouseLeave={(e) => e.target.style.borderColor = 'var(--border)'}
            >
              Reset
            </button>
          </div>
        </form>
      </Card>

      {/* Audit Logs Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ marginBottom: 12 }} />
            Retrieving audit logs...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)' }}>
            ⚠️ {error}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records found matching filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Timestamp</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actor</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Entity</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>IP Address</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badge = getActionBadgeColor(log.action)
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.created_at)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{log.actor_name || 'System'}</div>
                        {log.actor_email && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{log.actor_email}</div>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '100px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.text,
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}>{log.target_type.replace('_', ' ')}</div>
                        {log.target_id && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {log.target_id}</div>}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {log.ip_address || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <Button size="sm" variant="secondary" onClick={() => setActiveLog(log)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            <div>
              Showing Page <b>{page}</b> of <b>{totalPages}</b> ({total} records total)
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page === totalPages || loading}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Viewer Modal */}
      {activeLog && (
        <Modal
          isOpen={!!activeLog}
          onClose={() => setActiveLog(null)}
          title={`Audit Log Details (Log ID: ${activeLog.id})`}
        >
          <div style={{ fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Timestamp:</div>
              <div>{formatDateTime(activeLog.created_at)}</div>
              
              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Actor:</div>
              <div>
                <b>{activeLog.actor_name || 'System'}</b> 
                {activeLog.actor_email && ` (${activeLog.actor_email})`}
              </div>
              
              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Action Category:</div>
              <div style={{ textTransform: 'uppercase', fontWeight: 600 }}>{activeLog.action}</div>
              
              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Resource Target:</div>
              <div style={{ textTransform: 'capitalize' }}>{activeLog.target_type} (ID: {activeLog.target_id || 'N/A'})</div>
              
              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Client IP:</div>
              <div style={{ fontFamily: 'monospace' }}>{activeLog.ip_address || 'Not Available'}</div>
            </div>

            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Change Details:</div>
            <pre style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-sm)',
              padding: 16,
              overflow: 'auto',
              maxHeight: 250,
              fontSize: '0.8rem',
              color: '#38bdf8',
              fontFamily: 'Consolas, Monaco, monospace',
              lineHeight: 1.4
            }}>
              {JSON.stringify(activeLog.details, null, 2) || 'No supplementary data payload.'}
            </pre>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setActiveLog(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

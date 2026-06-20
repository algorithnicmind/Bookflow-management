'use client'

import { useState, useEffect } from 'react'
import { leavesApi, integrationsApi, settingsApi, auditApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, formatDateTime, getLeaveTypeIcon } from '@/lib/utils'

export default function IntegrationsDemoPage() {
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  // Accrual / Carry Forward state
  const [policies, setPolicies] = useState([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [accrualMessage, setAccrualMessage] = useState('')
  const [accrualError, setAccrualError] = useState('')

  // Calendar state
  const [calendarStatus, setCalendarStatus] = useState({ connected: false })
  const [checkingCalendar, setCheckingCalendar] = useState(true)

  // Audit Logs state
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  
  // General simulator state
  const [simulatorMode, setSimulatorMode] = useState('slack') // 'slack' or 'teams'
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' })
  const [submittingAction, setSubmittingAction] = useState(false)

  // Fetch all initial data
  const fetchData = async () => {
    fetchPendingRequests()
    fetchPolicies()
    fetchCalendarStatus()
    fetchRecentLogs()
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchPendingRequests = async () => {
    setLoadingRequests(true)
    try {
      const res = await leavesApi.pending()
      const pendingList = res.pending || []
      setRequests(pendingList)
      if (pendingList.length > 0) {
        setSelectedRequest(pendingList[0])
      } else {
        setSelectedRequest(null)
      }
    } catch (err) {
      console.error('Failed to fetch pending requests:', err)
    } finally {
      setLoadingRequests(false)
    }
  }

  const fetchPolicies = async () => {
    setLoadingPolicies(true)
    try {
      const res = await settingsApi.getLeavePolicies()
      setPolicies(res || [])
    } catch (err) {
      console.error('Failed to fetch leave policies:', err)
    } finally {
      setLoadingPolicies(false)
    }
  }

  const fetchCalendarStatus = async () => {
    setCheckingCalendar(true)
    try {
      const status = await integrationsApi.getCalendarStatus()
      setCalendarStatus(status)
    } catch (err) {
      console.error('Failed to fetch calendar status:', err)
    } finally {
      setCheckingCalendar(false)
    }
  }

  const fetchRecentLogs = async () => {
    setLoadingLogs(true)
    try {
      const data = await auditApi.list({ limit: 6 })
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  // Create a mock request automatically
  const handleCreateMockRequest = async () => {
    setLoadingRequests(true)
    try {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() + 5)
      const end = new Date(today)
      end.setDate(today.getDate() + 7)

      await leavesApi.apply({
        leave_type: 'casual',
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        reason: 'Simulated Hook Action - Testing Slack & MS Teams Integration',
      })
      
      setActionStatus({ text: 'Mock leave request applied successfully!', type: 'success' })
      fetchPendingRequests()
      fetchRecentLogs()
    } catch (err) {
      setActionStatus({ text: err.message || 'Failed to apply mock request', type: 'error' })
    } finally {
      setLoadingRequests(false)
    }
  }

  // Handle Slack Webhook Simulation
  const handleSlackSimulate = async (actionType) => {
    if (!selectedRequest) return
    setSubmittingAction(true)
    setActionStatus({ text: '', type: '' })
    
    // Construct Slack-like webhook action payload
    const slackPayload = {
      type: 'block_actions',
      user: { username: 'alice_manager' },
      actions: [
        {
          action_id: actionType === 'approve' ? 'approve_leave' : 'reject_leave',
          value: str(selectedRequest.id)
        }
      ]
    }

    // Helper to stringify value safely matching FastAPI expectations
    function str(val) {
      return String(val)
    }

    try {
      const response = await integrationsApi.simulateSlackAction(slackPayload)
      setActionStatus({ text: response.text || `Leave successfully ${actionType}d via Slack!`, type: 'success' })
      fetchPendingRequests()
      fetchRecentLogs()
      fetchCalendarStatus()
    } catch (err) {
      setActionStatus({ text: err.message || 'Failed to simulate Slack action', type: 'error' })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Handle MS Teams Webhook Simulation
  const handleTeamsSimulate = async (actionType) => {
    if (!selectedRequest) return
    setSubmittingAction(true)
    setActionStatus({ text: '', type: '' })

    // Construct Microsoft Teams Action.Execute payload
    const teamsPayload = {
      action: {
        verb: actionType === 'approve' ? 'approve_leave' : 'reject_leave',
        data: { leave_id: String(selectedRequest.id) },
        user: { displayName: 'Alice Manager' }
      }
    }

    try {
      const response = await integrationsApi.simulateTeamsAction(teamsPayload)
      // Extract the success message from Adaptive Card response
      const responseText = response.body?.[0]?.text || `Leave successfully ${actionType}d via MS Teams!`
      setActionStatus({ text: responseText, type: 'success' })
      fetchPendingRequests()
      fetchRecentLogs()
      fetchCalendarStatus()
    } catch (err) {
      setActionStatus({ text: err.message || 'Failed to simulate MS Teams action', type: 'error' })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Trigger Accruals manually
  const handleTriggerAccrual = async (type) => {
    setTriggerLoading(true)
    setAccrualMessage('')
    setAccrualError('')
    try {
      let res
      if (type === 'monthly') {
        res = await settingsApi.triggerMonthlyAccrual()
      } else {
        res = await settingsApi.triggerYearlyCarryForward()
      }
      setAccrualMessage(res.message || 'Job triggered successfully!')
      fetchRecentLogs()
    } catch (err) {
      setAccrualError(err.message || 'Failed to trigger job')
    } finally {
      setTriggerLoading(false)
    }
  }

  // Connect Google/Outlook OAuth link
  const handleConnectCalendar = async (provider) => {
    try {
      const data = await integrationsApi.connectCalendar(provider)
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (err) {
      setActionStatus({ text: err.message || 'Failed to connect calendar', type: 'error' })
    }
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">⚡ Integrations & Automations Demo Hub</h1>
          <p className="page-subtitle">Demonstrate real-time Slack/Teams workflows, calendar synchronization, policy cron jobs, and strict audit logs.</p>
        </div>
        <Button onClick={handleCreateMockRequest} variant="outline">
          + Auto-Create Pending Leave Request
        </Button>
      </div>

      <div className="grid-2 animate-in" style={{ animationDelay: '0.05s', marginBottom: 24 }}>
        
        {/* LEFT COLUMN: Slack & MS Teams Direct-Chat Simulator */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>1. Slack & Teams Simulator</h2>
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
              <button 
                onClick={() => setSimulatorMode('slack')} 
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                  background: simulatorMode === 'slack' ? '#4a154b' : 'transparent', // Slack eggplant color
                  color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                Slack Chat
              </button>
              <button 
                onClick={() => setSimulatorMode('teams')} 
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                  background: simulatorMode === 'teams' ? '#464eb8' : 'transparent', // Teams blurple color
                  color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                MS Teams
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Simulate how a manager sees a leave request in their chat tool and click Approve/Reject. This calls the actual API callbacks on the backend server.
          </p>

          {/* Leave Selector Dropdown */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem' }}>Select Leave Request to Simulate</label>
            {requests.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>No pending requests found.</span>
                <Button size="sm" onClick={handleCreateMockRequest}>Generate Mock Request</Button>
              </div>
            ) : (
              <select 
                value={selectedRequest?.id || ''} 
                onChange={(e) => setSelectedRequest(requests.find(r => r.id === parseInt(e.target.value)))}
                style={{ fontSize: '0.85rem' }}
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.employee_name} - {r.leave_type.toUpperCase()} ({formatDate(r.start_date)} to {formatDate(r.end_date)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action response toast message inside card */}
          {actionStatus.text && (
            <div style={{
              padding: '10px 14px', marginBottom: 16, borderRadius: 'var(--radius-sm)',
              background: actionStatus.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: actionStatus.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${actionStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
              fontSize: '0.85rem'
            }}>
              {actionStatus.type === 'success' ? '✅' : '⚠️'} {actionStatus.text}
            </div>
          )}

          {/* Interactive Chat Box Mockups */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {simulatorMode === 'slack' ? (
              // SLACK BLOCK KIT SIMULATOR MOCK
              <div style={{
                background: '#1a1d21', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'var(--shadow-md)', fontFamily: 'Slack-Lato, Lato, -apple-system, sans-serif'
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 4, background: '#e01e5a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>LF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: '#f8f8f2', fontSize: '0.9rem' }}>LeaveFlow Bot</span>
                      <span style={{ fontSize: '0.65rem', background: '#35373b', color: '#9a9b9d', padding: '1px 4px', borderRadius: 2, textTransform: 'uppercase', fontWeight: 600 }}>APP</span>
                      <span style={{ fontSize: '0.72rem', color: '#9a9b9d' }}>9:41 AM</span>
                    </div>
                    
                    {/* Slack Block Attachment */}
                    <div style={{
                      marginTop: 8, paddingLeft: 12, borderLeft: '4px solid #10b981', color: '#d1d2d3', fontSize: '0.88rem'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4, color: '#f8f8f2' }}>
                        🚨 Naya Leave Request Aaya Hai!
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 8px', margin: '8px 0', fontSize: '0.82rem', color: '#b0b1b4' }}>
                        <div style={{ fontWeight: 600 }}>Employee:</div>
                        <div style={{ color: '#f8f8f2' }}>{selectedRequest ? selectedRequest.employee_name : 'No Request Selected'}</div>
                        <div style={{ fontWeight: 600 }}>Type:</div>
                        <div style={{ color: '#f8f8f2', textTransform: 'capitalize' }}>{selectedRequest ? selectedRequest.leave_type : '—'}</div>
                        <div style={{ fontWeight: 600 }}>Dates:</div>
                        <div style={{ color: '#f8f8f2' }}>{selectedRequest ? `${formatDate(selectedRequest.start_date)} se ${formatDate(selectedRequest.end_date)}` : '—'}</div>
                        <div style={{ fontWeight: 600 }}>Reason:</div>
                        <div style={{ color: '#f8f8f2', fontStyle: 'italic' }}>"{selectedRequest ? selectedRequest.reason : '—'}"</div>
                      </div>

                      {/* Slack Buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          disabled={submittingAction || !selectedRequest}
                          onClick={() => handleSlackSimulate('approve')}
                          style={{
                            padding: '6px 14px', borderRadius: 4, border: 'none', background: '#007a5a', color: 'white',
                            fontSize: '0.8rem', fontWeight: 700, cursor: selectedRequest ? 'pointer' : 'not-allowed',
                            opacity: selectedRequest ? 1 : 0.5, transition: 'var(--transition)'
                          }}
                        >
                          Approve ✅
                        </button>
                        <button
                          disabled={submittingAction || !selectedRequest}
                          onClick={() => handleSlackSimulate('reject')}
                          style={{
                            padding: '6px 14px', borderRadius: 4, border: '1px solid #e01e5a', background: 'transparent', color: '#e01e5a',
                            fontSize: '0.8rem', fontWeight: 700, cursor: selectedRequest ? 'pointer' : 'not-allowed',
                            opacity: selectedRequest ? 1 : 0.5, transition: 'var(--transition)'
                          }}
                        >
                          Reject ❌
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // TEAMS ADAPTIVE CARD SIMULATOR MOCK
              <div style={{
                background: '#2f2f2f', borderRadius: 'var(--radius-md)', padding: 18, border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'var(--shadow-md)', fontFamily: 'Segoe UI, Helvetica, sans-serif'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#464eb8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 'bold', color: 'white' }}>LF</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f5f5f5' }}>LeaveFlow Bot</div>
                    <div style={{ fontSize: '0.65rem', color: '#adadad' }}>via Power Automate</div>
                  </div>
                </div>

                {/* Adaptive Card Body */}
                <div style={{
                  background: '#202020', border: '1px solid #3d3d3d', borderRadius: 4, padding: 16, color: '#f5f5f5'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 6 }}>
                    Naya Leave Request
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 10px', fontSize: '0.82rem', margin: '12px 0' }}>
                    <div style={{ color: '#adadad' }}>Employee</div>
                    <div>{selectedRequest ? selectedRequest.employee_name : 'No Request Selected'}</div>
                    <div style={{ color: '#adadad' }}>Type</div>
                    <div style={{ textTransform: 'capitalize' }}>{selectedRequest ? selectedRequest.leave_type : '—'}</div>
                    <div style={{ color: '#adadad' }}>Dates</div>
                    <div>{selectedRequest ? `${formatDate(selectedRequest.start_date)} se ${formatDate(selectedRequest.end_date)}` : '—'}</div>
                    <div style={{ color: '#adadad' }}>Reason</div>
                    <div style={{ fontStyle: 'italic', color: '#dfdfdf' }}>"{selectedRequest ? selectedRequest.reason : '—'}"</div>
                  </div>

                  {/* Adaptive Card Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      disabled={submittingAction || !selectedRequest}
                      onClick={() => handleTeamsSimulate('approve')}
                      style={{
                        padding: '8px 16px', borderRadius: 4, border: 'none', background: '#464eb8', color: 'white',
                        fontSize: '0.8rem', fontWeight: 600, cursor: selectedRequest ? 'pointer' : 'not-allowed',
                        opacity: selectedRequest ? 1 : 0.5, transition: 'var(--transition)'
                      }}
                    >
                      Approve ✅
                    </button>
                    <button
                      disabled={submittingAction || !selectedRequest}
                      onClick={() => handleTeamsSimulate('reject')}
                      style={{
                        padding: '8px 16px', borderRadius: 4, border: '1px solid #5a5a5a', background: 'transparent', color: '#f5f5f5',
                        fontSize: '0.8rem', fontWeight: 600, cursor: selectedRequest ? 'pointer' : 'not-allowed',
                        opacity: selectedRequest ? 1 : 0.5, transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#333'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Reject ❌
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT COLUMN: Accrual & Carry-Forward Cron Job Panel */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>2. Accrual & Carry-Forward Automations</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            In production, automated cron jobs calculate leave accruals and roll forward remaining balances. Use the controls below to trigger these jobs on-demand and inspect how policies apply.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            
            {/* Active Policies Summary */}
            <div className="glass" style={{ padding: 14, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Current Leave Policy Schema
              </div>
              {loadingPolicies ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Loading policies...</div>
              ) : policies.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No custom policies configured. System defaults apply (CL: 12, SL: 12, EL: 18).</div>
              ) : (
                <div style={{ overflowX: 'auto', maxH: '120px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ paddingBottom: 4, color: 'var(--text-muted)' }}>Policy</th>
                        <th style={{ paddingBottom: 4, color: 'var(--text-muted)' }}>Type</th>
                        <th style={{ paddingBottom: 4, color: 'var(--text-muted)' }}>Accrual/Mo</th>
                        <th style={{ paddingBottom: 4, color: 'var(--text-muted)' }}>Max Carry-Fwd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.slice(0, 3).map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '6px 0', fontWeight: 600 }}>{p.name || 'Global'}</td>
                          <td style={{ padding: '6px 0', textTransform: 'capitalize' }}>{p.leave_type}</td>
                          <td style={{ padding: '6px 0', color: 'var(--accent)' }}>+{p.accrual_rate} days</td>
                          <td style={{ padding: '6px 0' }}>{p.max_carry_forward} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Run Cron Job actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button 
                  loading={triggerLoading}
                  onClick={() => handleTriggerAccrual('monthly')}
                  style={{ flex: 1 }}
                >
                  ⚙️ Run Monthly Accrual
                </Button>
                <Button 
                  variant="outline"
                  loading={triggerLoading}
                  onClick={() => handleTriggerAccrual('yearly')}
                  style={{ flex: 1 }}
                >
                  🔄 Run Yearly Carry-Forward
                </Button>
              </div>

              {accrualMessage && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', fontSize: '0.82rem'
                }}>
                  ✅ <strong>Success:</strong> {accrualMessage} (Open the Audit Logs or reload your dashboard to view updated balances).
                </div>
              )}

              {accrualError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)',
                  border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--danger)', fontSize: '0.82rem'
                }}>
                  ⚠️ <strong>Error:</strong> {accrualError}
                </div>
              )}
            </div>

            {/* Explanatory text */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              💡 <strong>How it works:</strong>
              <ul style={{ paddingLeft: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li><strong>Monthly Accrual:</strong> Scans all active employees. Automatically adds the configured <code>accrual_rate</code> (e.g. 1.5 days) to their corresponding active leave types.</li>
                <li><strong>Yearly Carry-Forward:</strong> Scans balances from the previous calendar year. Transports the remaining balances to the new year up to the <code>max_carry_forward</code> cap value, resetting used days to 0.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* MID SECTION: Calendar Sync Visualization */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              3. Google Calendar & Outlook Sync
              {calendarStatus.connected ? (
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: 'var(--success-bg)', color: 'var(--success)', fontWeight: 600 }}>Active</span>
              ) : (
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: 600 }}>Not Linked</span>
              )}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              When a leave is approved, the system automatically creates a calendar event and updates the employee's work availability to Out of Office (OOO).
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={() => handleConnectCalendar('google')} variant={calendarStatus.provider === 'google' ? 'success' : 'secondary'}>
              Connect Google Calendar
            </Button>
            <Button size="sm" onClick={() => handleConnectCalendar('outlook')} variant={calendarStatus.provider === 'outlook' ? 'success' : 'secondary'}>
              Connect Outlook Calendar
            </Button>
          </div>
        </div>

        {/* Calendar visual panel split */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Sync Integration Properties:</strong>
            </div>
            <div className="glass" style={{ padding: 12, background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span>{calendarStatus.connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connected Provider:</span>
                <span style={{ textTransform: 'capitalize' }}>{calendarStatus.provider || 'None'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Availability:</span>
                <span style={{ color: 'var(--warning)' }}>Out of Office (OOO)</span>
              </div>
            </div>
            <div style={{ marginTop: 12, color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              ℹ️ Connect calendar above to simulate OAuth login redirection and check database state update.
            </div>
          </div>

          {/* Simulated Google Calendar widget */}
          <div className="glass" style={{ padding: 16, background: '#181a1b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e8eaed' }}>📅 June 2026</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 16, height: 16, display: 'inline-block', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', textAlign: 'center', fontSize: '0.6rem', cursor: 'pointer' }}>&lt;</span>
                <span style={{ width: 16, height: 16, display: 'inline-block', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', textAlign: 'center', fontSize: '0.6rem', cursor: 'pointer' }}>&gt;</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, fontSize: '0.75rem', textAlign: 'center', color: '#9aa0a6' }}>
              <div style={{ fontWeight: 600 }}>Su</div><div style={{ fontWeight: 600 }}>Mo</div><div style={{ fontWeight: 600 }}>Tu</div><div style={{ fontWeight: 600 }}>We</div><div style={{ fontWeight: 600 }}>Th</div><div style={{ fontWeight: 600 }}>Fr</div><div style={{ fontWeight: 600 }}>Sa</div>
              
              {/* Row 1 */}
              <div style={{ padding: 6, color: '#3c4043' }}>31</div><div style={{ padding: 6 }}>1</div><div style={{ padding: 6 }}>2</div><div style={{ padding: 6 }}>3</div><div style={{ padding: 6 }}>4</div><div style={{ padding: 6 }}>5</div><div style={{ padding: 6 }}>6</div>
              
              {/* Row 2 */}
              <div style={{ padding: 6 }}>7</div><div style={{ padding: 6 }}>8</div><div style={{ padding: 6 }}>9</div><div style={{ padding: 6 }}>10</div><div style={{ padding: 6 }}>11</div><div style={{ padding: 6 }}>12</div><div style={{ padding: 6 }}>13</div>
              
              {/* Row 3 with mock OOO */}
              <div style={{ padding: 6 }}>14</div>
              <div style={{ padding: 6 }}>15</div>
              <div style={{ padding: 6 }}>16</div>
              <div style={{ padding: 6 }}>17</div>
              <div style={{ padding: 6 }}>18</div>
              <div style={{ padding: 6, background: '#1a73e8', color: 'white', borderRadius: 4, fontWeight: 'bold', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                OOO
              </div>
              <div style={{ padding: 6, background: '#1a73e8', color: 'white', borderRadius: 4, fontWeight: 'bold', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                OOO
              </div>
              
              {/* Row 4 */}
              <div style={{ padding: 6, background: '#1a73e8', color: 'white', borderRadius: 4, fontWeight: 'bold', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                OOO
              </div>
              <div style={{ padding: 6 }}>22</div><div style={{ padding: 6 }}>23</div><div style={{ padding: 6 }}>24</div><div style={{ padding: 6 }}>25</div><div style={{ padding: 6 }}>26</div><div style={{ padding: 6 }}>27</div>
              
              {/* Row 5 */}
              <div style={{ padding: 6 }}>28</div><div style={{ padding: 6 }}>29</div><div style={{ padding: 6 }}>30</div><div style={{ padding: 6, color: '#3c4043' }}>1</div><div style={{ padding: 6, color: '#3c4043' }}>2</div><div style={{ padding: 6, color: '#3c4043' }}>3</div><div style={{ padding: 6, color: '#3c4043' }}>4</div>
            </div>
            
            <div style={{ marginTop: 12, fontSize: '0.7rem', color: '#1a73e8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1a73e8', display: 'inline-block' }}></span>
              Simulated Sync Event: [John Doe - Casual Leave (Approved)] block synced successfully.
            </div>
          </div>
        </div>
      </Card>

      {/* BOTTOM SECTION: Live Audit Log Stream */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>4. Live Audit Log Stream (Compliance & Auditing)</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Instantly review the immutable log entry populated after executing any of the simulators above.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchRecentLogs}>
            🔄 Refresh Logs
          </Button>
        </div>

        {loadingLogs ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div className="spinner" style={{ margin: '0 auto 8px' }} />
            Loading live logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No audit records registered yet. Perform an action to view here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>Timestamp</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>Actor</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>Action</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>Target</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>Client IP</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', textAlign: 'right' }}>Payload Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{log.actor_name || 'System'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{log.actor_email || 'cron_job@system'}</div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600,
                        background: log.action.includes('approve') || log.action.includes('accrual') ? 'var(--success-bg)' : 'rgba(255,255,255,0.05)',
                        color: log.action.includes('approve') || log.action.includes('accrual') ? 'var(--success)' : 'var(--text-main)'
                      }}>
                        {log.action.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textTransform: 'capitalize' }}>
                      {log.target_type.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px 20px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.ip_address || '—'}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <pre style={{
                        display: 'inline-block', background: '#090d16', border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 4, padding: '4px 8px', fontSize: '0.7rem', color: '#38bdf8',
                        fontFamily: 'Consolas, monospace', textAlign: 'left', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {JSON.stringify(log.details)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

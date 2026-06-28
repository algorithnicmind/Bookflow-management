'use client'

/**
 * Lead Profile Page (CRM Detail View)
 * ------------------------------------
 * Shows the full profile of a single lead/onboarding application.
 * Platform Owner can view contact details, update status, and manage internal notes.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { onboardingApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AppleEmoji from '@/components/AppleEmoji'
import { LEAD_STATUS_OPTIONS as STATUS_OPTIONS, getStatusMeta } from '@/lib/constants'

const PLAN_META = {
  free_trial: { name: 'Free Tier', price: '$0/mo', color: '#a1a1aa', bg: 'rgba(161, 161, 161, 0.1)', border: 'rgba(161, 161, 161, 0.3)' },
  professional: { name: 'Professional', price: '$5/user/mo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
  enterprise: { name: 'Customization', price: 'Custom', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
}

const PLAN_OPTIONS = [
  { value: 'free_trial', label: 'Free Tier' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Customization' },
]

export default function LeadProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const leadId = params.id

  const [lead, setLead] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [toast, setToast] = useState(null)
  const [notesSaved, setNotesSaved] = useState(true)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchLead = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await onboardingApi.get(leadId)
      setLead(data)
      setNotes(data.internal_notes || '')
      setNotesSaved(true)
    } catch (err) {
      setError(err.message || 'Failed to load lead details.')
    } finally {
      setIsLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    if (leadId) fetchLead()
  }, [leadId, fetchLead])

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true)
    try {
      await onboardingApi.updateStatus(leadId, newStatus)
      setLead((prev) => ({ ...prev, status: newStatus }))
      const meta = getStatusMeta(newStatus)
      showToast(`Status updated to "${meta.label}"`)
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handlePlanChange = async (newPlan) => {
    setIsUpdatingPlan(true)
    try {
      await onboardingApi.updatePlan(leadId, newPlan)
      setLead((prev) => ({ ...prev, selected_plan: newPlan }))
      showToast(`Plan updated to "${PLAN_META[newPlan]?.name || newPlan}"`)
    } catch (err) {
      showToast(err.message || 'Failed to update plan.', 'error')
    } finally {
      setIsUpdatingPlan(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await onboardingApi.updateNotes(leadId, notes)
      setNotesSaved(true)
      showToast('Notes saved successfully')
    } catch (err) {
      showToast(err.message || 'Failed to save notes.', 'error')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this application? This will automatically create their organization profile, register their administrator email, and initialize default leave balances.')) {
      return
    }
    setIsApproving(true)
    try {
      await onboardingApi.approve(leadId)
      setLead((prev) => ({ ...prev, status: 'approved' }))
      showToast('Application approved! Organization portal and administrator profile successfully created.')
    } catch (err) {
      showToast(err.message || 'Failed to approve application.', 'error')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this application?')) {
      return
    }
    setIsRejecting(true)
    try {
      await onboardingApi.reject(leadId)
      setLead((prev) => ({ ...prev, status: 'rejected' }))
      showToast('Application rejected.')
    } catch (err) {
      showToast(err.message || 'Failed to reject application.', 'error')
    } finally {
      setIsRejecting(false)
    }
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (user?.department !== 'System') return null

  if (isLoading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AppleEmoji char="⚠️" /></div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Failed to load lead</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => router.push('/leads')}>← Back to Leads</Button>
              <Button onClick={fetchLead}>Try Again</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!lead) return null

  const statusMeta = getStatusMeta(lead.status)

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          padding: '14px 24px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          {toast.message}
        </div>
      )}

      {/* Back Button + Header */}
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push('/leads')}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: 0,
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Back to Leads
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 6 }}>{lead.company_name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {lead.industry && (
                <span style={{
                  fontSize: '0.85rem', color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)', padding: '4px 14px',
                  borderRadius: 100, border: '1px solid var(--border)',
                }}>
                  {lead.industry}
                </span>
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Submitted {formatDate(lead.created_at)}
              </span>
            </div>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
            <select
              id="lead-profile-status"
              value={lead.status}
              disabled={isUpdatingStatus || lead.status === 'approved' || lead.status === 'rejected'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                padding: '8px 32px 8px 14px',
                borderRadius: 10,
                border: `1.5px solid ${statusMeta.border}`,
                background: `${statusMeta.bg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center`,
                color: statusMeta.color,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: (isUpdatingStatus || lead.status === 'approved' || lead.status === 'rejected') ? 'not-allowed' : 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
                opacity: (isUpdatingStatus || lead.status === 'approved' || lead.status === 'rejected') ? 0.6 : 1,
                minWidth: 180,
              }}
            >
              {STATUS_OPTIONS.filter(opt => 
                (opt.value !== 'approved' && opt.value !== 'rejected') || opt.value === lead.status
              ).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding Action Banner */}
      {lead.status === 'approved' && (
        <Card style={{ marginBottom: 24, border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.8rem' }}><AppleEmoji char="✅" /></span>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginBottom: 4 }}>Organization Portal Created</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  The organization portal and super administrator profile are active. The tenant admin can now log in using the email <b>{lead.super_admin_email}</b>.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {lead.status === 'rejected' && (
        <Card style={{ marginBottom: 24, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.8rem' }}><AppleEmoji char="🚫" /></span>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Application Rejected</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  This onboarding application has been rejected and will not be provisioned.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {lead.status !== 'approved' && lead.status !== 'rejected' && (
        <Card style={{ 
          marginBottom: 24, 
          border: (lead.status === 'connected' || lead.status === 'interested') ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid var(--border)', 
          background: (lead.status === 'connected' || lead.status === 'interested') ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-secondary)' 
        }}>
          <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.8rem' }}>
                <AppleEmoji char={(lead.status === 'connected' || lead.status === 'interested') ? '🤝' : '⏳'} />
              </span>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                  {lead.status === 'connected' ? 'Connected & Ready for Portal Provisioning' : 
                   lead.status === 'interested' ? 'Lead is Interested & Ready for Approval' : 'Onboarding Review Pipeline'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {(lead.status === 'connected' || lead.status === 'interested') ? 
                   'Click approve to automatically create the organization profile, register their administrator email, and initialize default leave balances.' : 
                   'You can approve this application to automatically provision the organization portal and register the administrator profile.'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button 
                onClick={handleApprove} 
                disabled={isApproving || isRejecting}
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', 
                  color: '#000', 
                  fontWeight: 700,
                  opacity: (isApproving || isRejecting) ? 0.6 : 1
                }}
              >
                {isApproving ? 'Approving...' : 'Approve & Create Profile'}
              </Button>
              <Button 
                onClick={handleReject} 
                disabled={isApproving || isRejecting} 
                variant="danger"
                style={{ opacity: (isApproving || isRejecting) ? 0.6 : 1 }}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
        gap: 24,
        alignItems: 'start',
      }} className="animate-in">

        {/* Left Column: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Contact Card */}
          <Card>
            <div style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AppleEmoji char="👤" /> Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Name', value: lead.super_admin_name, icon: '🏷️' },
                  { label: 'Email', value: lead.super_admin_email, icon: '📧', isEmail: true },
                  { label: 'Phone', value: lead.super_admin_phone, icon: '📱' },
                ].map((field) => (
                  <div key={field.label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      {field.label}
                    </div>
                    <div style={{
                      fontSize: '0.95rem', fontWeight: 500,
                      color: field.value ? 'var(--text-primary)' : 'var(--text-dim)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: '1rem' }}><AppleEmoji char={field.icon} /></span>
                      {field.isEmail && field.value ? (
                        <a href={`mailto:${field.value}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {field.value}
                        </a>
                      ) : (
                        field.value || '—'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Company Card */}
          <Card>
            <div style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AppleEmoji char="🏢" /> Company Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Company Name', value: lead.company_name },
                  { label: 'Industry', value: lead.industry },
                  { label: 'Company Size', value: lead.company_size },
                ].map((field) => (
                  <div key={field.label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500, color: field.value ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                      {field.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Selected Plan Card */}
          <Card>
            <div style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AppleEmoji char="💎" /> Selected Plan
              </h3>

              {(() => {
                const currentPlan = PLAN_META[lead.selected_plan] || PLAN_META.free_trial
                return (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                      padding: '14px 18px', borderRadius: 12,
                      background: currentPlan.bg, border: `1px solid ${currentPlan.border}`,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: currentPlan.color, color: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                      }}>
                        {lead.selected_plan === 'free_trial' ? '0' : lead.selected_plan === 'professional' ? 'P' : 'E'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: currentPlan.color }}>{currentPlan.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentPlan.price}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      Change Plan
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {PLAN_OPTIONS.map((opt) => {
                        const meta = PLAN_META[opt.value]
                        const isActive = lead.selected_plan === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handlePlanChange(opt.value)}
                            disabled={isUpdatingPlan || isActive}
                            style={{
                              flex: 1, padding: '10px 8px', borderRadius: 8,
                              background: isActive ? meta.bg : 'var(--bg-primary)',
                              border: `1.5px solid ${isActive ? meta.border : 'var(--border)'}`,
                              color: isActive ? meta.color : 'var(--text-muted)',
                              fontSize: '0.8rem', fontWeight: isActive ? 700 : 500,
                              cursor: isUpdatingPlan || isActive ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: isUpdatingPlan ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive && !isUpdatingPlan) {
                                e.currentTarget.style.borderColor = meta.border
                                e.currentTarget.style.color = meta.color
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive && !isUpdatingPlan) {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.color = 'var(--text-muted)'
                              }
                            }}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 10 }}>
                      You can change the plan after discussing with the user during setup.
                    </p>
                  </div>
                )
              })()}
            </div>
          </Card>

          {/* Special Requirements */}
          {lead.special_requirements && (
            <Card>
              <div style={{ padding: 28 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AppleEmoji char="📝" /> Special Requirements
                </h3>
                <div style={{
                  fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)', padding: 20, borderRadius: 12,
                  border: '1px solid var(--border)',
                }}>
                  {lead.special_requirements}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Notes */}
        <div>
          <Card>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AppleEmoji char="📒" /> Internal Notes
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {!notesSaved && (
                    <span style={{
                      fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600,
                      background: 'rgba(245, 158, 11, 0.15)', padding: '4px 12px',
                      borderRadius: 100, border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}>
                      Unsaved changes
                    </span>
                  )}
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || notesSaved}
                    style={{
                      opacity: (isSavingNotes || notesSaved) ? 0.5 : 1,
                      fontSize: '0.82rem',
                      padding: '8px 20px',
                    }}
                  >
                    {isSavingNotes ? 'Saving...' : notesSaved ? '✓ Saved' : 'Save Notes'}
                  </Button>
                </div>
              </div>

              <textarea
                id="lead-profile-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  setNotesSaved(false)
                }}
                placeholder="Add notes about calls, meetings, pricing discussions, follow-ups..."
                style={{
                  width: '100%',
                  minHeight: 400,
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />

              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 12 }}>
                These notes are private and only visible to Platform Owners. Use them to track conversations, pricing negotiations, and follow-up actions.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Timeline */}
      <div style={{ marginTop: 32 }} className="animate-in">
        <Card>
          <div style={{ padding: 28 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AppleEmoji char="🔄" /> Lead Pipeline
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
              {STATUS_OPTIONS.filter(opt => opt.value !== 'approved' && opt.value !== 'rejected').map((opt, idx, arr) => {
                const isActive = lead.status === opt.value
                const isPast = arr.findIndex((s) => s.value === lead.status) > idx
                return (
                  <div key={opt.value} style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      onClick={() => handleStatusChange(opt.value)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '16px 20px', borderRadius: 14, cursor: (lead.status === 'approved' || lead.status === 'rejected') ? 'not-allowed' : 'pointer',
                        background: isActive ? opt.bg : 'transparent',
                        border: isActive ? `1.5px solid ${opt.border}` : '1.5px solid transparent',
                        transition: 'all 0.25s ease',
                        minWidth: 100,
                        opacity: isPast ? 0.5 : 1,
                        pointerEvents: (lead.status === 'approved' || lead.status === 'rejected') ? 'none' : 'auto',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive && lead.status !== 'approved' && lead.status !== 'rejected') {
                          e.currentTarget.style.background = opt.bg
                          e.currentTarget.style.borderColor = opt.border
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive && lead.status !== 'approved' && lead.status !== 'rejected') {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'transparent'
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}><AppleEmoji char={opt.emoji} /></span>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                        color: isActive ? opt.color : 'var(--text-muted)',
                      }}>
                        {opt.label}
                      </span>
                      {isActive && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: opt.color, marginTop: 2,
                        }} />
                      )}
                    </div>
                    {idx < arr.length - 1 && (
                      <div style={{
                        width: 32, height: 2,
                        background: isPast ? 'var(--accent)' : 'var(--border)',
                        transition: 'background 0.3s',
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        select option {
          background: var(--bg-primary, #1a1a2e);
          color: var(--text-primary, #e0e0e0);
          padding: 8px;
        }
        @media (max-width: 768px) {
          .page-container > div:nth-child(4) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

'use client'

/**
 * Dedicated Tenant Setup Profile Page (/tenants/[id])
 * ----------------------------------------------------
 * NOTE FOR DEVELOPERS: Why are there two `page.js` files?
 * In Next.js App Router, folders define the route structure, and `page.js` defines the UI for that route.
 * - `tenants/page.js` is the list view of all connected leads.
 * - `tenants/[id]/page.js` (this file) is the dynamic route for viewing a specific lead's setup page.
 * 
 * Flow & Purpose:
 * 1. Retrieves the specific application `id` from the URL parameters.
 * 2. Fetches the lead's details (Company, Industry, etc.) via `onboardingApi.get(id)`.
 * 3. Provides a form for the Platform Owner to enter Internal Notes, set an Admin Password, and configure Access Duration.
 * 4. Submits the final approval to `onboardingApi.approve()`, which triggers the backend to create the actual Organization, Leave Balances, and Super Admin user in the database.
 * 5. Displays a success modal with the generated credentials for the owner to copy and share.
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { onboardingApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ArrowLeft } from 'lucide-react'

export default function SetupProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form State
  const [internalNotes, setInternalNotes] = useState('')
  const [password, setPassword] = useState('')
  const [planType, setPlanType] = useState('Professional')
  const [accessDays, setAccessDays] = useState(30)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [formError, setFormError] = useState(null)
  
  // Manage State
  const [isDeleting, setIsDeleting] = useState(false)

  // Success Credentials State
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        const data = await onboardingApi.get(id)
        setApplication(data)
        setInternalNotes(data.internal_notes || '')
      } catch (err) {
        setError(err.message || 'Failed to load application details.')
      } finally {
        setIsLoading(false)
      }
    }
    if (user?.department === 'System' && id) {
      fetchApplication()
    }
  }, [id, user])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handlePlanChange = (e) => {
    const plan = e.target.value
    setPlanType(plan)
    if (plan === 'Free Trial') setAccessDays(14)
    else if (plan === 'Professional') setAccessDays(30)
  }

  const handleDeleteTenant = async () => {
    if (!window.confirm('Are you sure you want to completely delete this tenant? This action cannot be undone.')) return
    setIsDeleting(true)
    try {
      await onboardingApi.deleteTenant(id)
      showToast('Tenant deleted successfully')
      router.push('/tenants')
    } catch (err) {
      showToast(err.message || 'Failed to delete tenant', 'error')
      setIsDeleting(false)
    }
  }

  const calculateDaysRemaining = () => {
    if (!application.expires_at) return 'Unknown'
    const diff = new Date(application.expires_at) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 'Expired'
  }

  const handleProvisionTenant = async (e) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }
    if (accessDays <= 0) {
      setFormError('Access duration must be at least 1 day.')
      return
    }

    setIsProvisioning(true)
    setFormError(null)

    try {
      const result = await onboardingApi.approve(id, {
        password: password,
        access_days: accessDays,
        internal_notes: internalNotes,
      })

      // Show credentials success dialog
      setCreatedCredentials({
        company: application.company_name,
        adminEmail: application.admin_email,
        password: password,
        accessDays: accessDays,
        message: result.message,
      })
      showToast('Tenant profile created successfully!')
    } catch (err) {
      setFormError(err.message || 'Failed to provision tenant.')
    } finally {
      setIsProvisioning(false)
    }
  }

  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `LeaveFlow Tenant Credentials\n------------------------------\nCompany: ${createdCredentials.company}\nAdmin Email: ${createdCredentials.adminEmail}\nPassword: ${createdCredentials.password}\nAccess Period: ${createdCredentials.accessDays} days\n------------------------------\nYou can log in at: ${window.location.origin}/login`
    
    navigator.clipboard.writeText(text)
    showToast('Credentials copied to clipboard!')
  }

  const handleBackToTenants = () => {
    router.push('/tenants')
  }

  if (user?.department !== 'System') return null

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="page-container">
        <Button variant="secondary" onClick={() => router.push('/tenants')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Tenants
        </Button>
        <Card>
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Application Not Found</p>
            <p style={{ color: 'var(--text-muted)' }}>{error || "The application you're looking for doesn't exist."}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 1100,
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

        {/* Header & Back Button */}
        <div className="page-header animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <Button variant="secondary" onClick={handleBackToTenants}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Tenants
          </Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="page-title">Setup & Manage Profile</h1>
              <p className="page-subtitle">
                Configure credentials, access duration, and internal notes for {application.company_name}
              </p>
            </div>
            {application.expires_at && (
              <Button variant="danger" onClick={handleDeleteTenant} loading={isDeleting} style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}>
                Delete Tenant
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Company Overview Card */}
        <Card className="animate-in" style={{ animationDelay: '0.1s', padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>Company Overview</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px 32px' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Company Name</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{application.company_name}</strong>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Industry</span>
              <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{application.industry || '—'}</span>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Company Size</span>
              <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{application.company_size || '—'} employees</span>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Admin Name</span>
              <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{application.admin_name}</span>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Admin Email</span>
              <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{application.admin_email}</span>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Phone</span>
              <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{application.admin_phone || '—'}</span>
            </div>
          </div>
        </Card>

        <Card className="animate-in" style={{ animationDelay: '0.15s', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Provisioning Details</h2>
            {application.expires_at && (
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 8 }}>
                Current Status: <span style={{ color: 'var(--accent)' }}>Provisioned ({calculateDaysRemaining()} days left)</span>
              </div>
            )}
          </div>
          <form onSubmit={handleProvisionTenant} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Internal Notes Section */}
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>
                  Internal Message / Details
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 140,
                    padding: '16px 20px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  placeholder="Add extra internal notes, pricing details, or custom requirements here..."
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 8 }}>
                  <span style={{ color: 'var(--accent)' }}>🔒</span> These notes are strictly private and only visible to Leaveflow Platform Owners.
                </span>
              </div>

              {/* Billing & Access Configuration */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Access & Configuration</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      Pricing Plan
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={planType}
                        onChange={handlePlanChange}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          fontWeight: 500,
                          appearance: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Free Trial">Free Trial (14 Days)</option>
                        <option value="Professional">Professional (30 Days)</option>
                        <option value="Customization">Customization (Custom Days)</option>
                      </select>
                      <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      Access Duration (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={planType !== 'Customization'}
                      value={accessDays}
                      onChange={(e) => setAccessDays(parseInt(e.target.value) || '')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: planType !== 'Customization' ? 'rgba(0,0,0,0.2)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: planType !== 'Customization' ? 'var(--text-muted)' : 'var(--text-main)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: planType !== 'Customization' ? 'not-allowed' : 'text',
                      }}
                      placeholder="e.g. 30"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      Admin Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                      }}
                      placeholder="Generate password"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  borderRadius: 12,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>⚠</span> {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <Button type="button" variant="secondary" onClick={handleBackToTenants} disabled={isProvisioning} style={{ padding: '12px 24px' }}>
                  Cancel
                </Button>
                <Button type="submit" loading={isProvisioning} style={{ padding: '12px 32px' }}>
                  {application.expires_at ? 'Save Configuration' : 'Provision Tenant'}
                </Button>
              </div>
            </form>
          </Card>
      </div>

      {/* Success Dialog */}
      <Modal
        isOpen={createdCredentials !== null}
        onClose={() => {
          setCreatedCredentials(null)
          router.push('/tenants')
        }}
        title="Tenant Provisioned Successfully"
      >
        {createdCredentials && (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              The profile has been created. Below are the credentials for the tenant's admin account. Please share these with the client.
            </p>

            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 12,
              padding: 20,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              position: 'relative',
              marginBottom: 24,
            }}>
              <div style={{ marginBottom: 12 }}><span style={{ color: 'var(--text-dim)' }}>Company:</span> {createdCredentials.company}</div>
              <div style={{ marginBottom: 12 }}><span style={{ color: 'var(--text-dim)' }}>Admin Email:</span> {createdCredentials.adminEmail}</div>
              <div style={{ marginBottom: 12 }}><span style={{ color: 'var(--text-dim)' }}>Password:</span> {createdCredentials.password}</div>
              <div><span style={{ color: 'var(--text-dim)' }}>Access Duration:</span> {createdCredentials.accessDays} days</div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => {
                setCreatedCredentials(null)
                router.push('/tenants')
              }}>
                Close & Return
              </Button>
              <Button onClick={handleCopyCredentials}>
                Copy Credentials
              </Button>
            </div>
          </div>
        )}
        </Modal>

        <style jsx>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translate(20px, -50%); }
            to { opacity: 1; transform: translate(0, -50%); }
          }
        `}</style>
      </div>
    </div>
  )
}

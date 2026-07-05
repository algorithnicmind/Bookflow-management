'use client'

/**
 * Apply Leave Page
 * ----------------
 * A form component allowing employees to request time off. 
 * It validates dates against public holidays and checks leave balances before submission.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { leavesApi, settingsApi } from '@/services/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

const leaveTypes = [
  { value: 'casual', label: 'Casual Leave (CL)', quota: 12 },
  { value: 'sick', label: 'Sick Leave (SL)', quota: 12 },
  { value: 'earned', label: 'Earned Leave (EL/PL)', quota: 18 },
  { value: 'maternity', label: 'Maternity Leave', quota: 182 },
  { value: 'miscarriage', label: 'Miscarriage Leave', quota: 42 },
  { value: 'unpaid', label: 'Leave Without Pay (LWP)', quota: 'Unlimited' },
]

export default function ApplyLeavePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    settingsApi.getHolidays(controller.signal).then(setHolidays).catch(() => setHolidays([]))
    return () => controller.abort()
  }, [])

  const calculateDays = () => {
    if (!form.start_date || !form.end_date) return 0
    const start = new Date(form.start_date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(form.end_date)
    end.setHours(0, 0, 0, 0)
    if (end < start) return 0
    
    let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
    let holidayCount = 0
    for (const h of holidays) {
      const hDate = new Date(h.date)
      hDate.setHours(0, 0, 0, 0)
      if (hDate >= start && hDate <= end) {
        holidayCount++
      }
    }
    return days - holidayCount
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      setError('All fields are required')
      toast.error('All fields are required')
      return
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('End date must be on or after start date')
      toast.error('End date must be on or after start date')
      return
    }

    if (new Date(form.start_date) < new Date(new Date().toDateString())) {
      setError('Start date cannot be in the past')
      toast.error('Start date cannot be in the past')
      return
    }

    setLoading(true)
    try {
      const res = await leavesApi.apply({
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason.trim(),
      })
      const msg = res.message || 'Leave application submitted successfully!'
      setSuccess(msg)
      toast.success(msg)
      setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' })
      setTimeout(() => router.push('/leave-history'), 1500)
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Apply for Leave</h1>
          <p className="page-subtitle">Submit a new leave request for manager approval</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--danger-bg)', border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20,
              }}>{error}</div>
            )}

            {success && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)', fontSize: '0.85rem', marginBottom: 20,
              }}>{success}</div>
            )}

            <div className="form-group">
              <label>Leave Type</label>
              <select
                value={form.leave_type}
                onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
              >
                {leaveTypes.map((lt) => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  min={form.start_date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {form.start_date && form.end_date && calculateDays() > 0 && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-glow)', marginBottom: 18,
                fontSize: '0.85rem', fontWeight: 500,
              }}>
                Duration: <strong>{calculateDays()}</strong> day{calculateDays() > 1 ? 's' : ''} (Public holidays are excluded)
              </div>
            )}
            
            {form.start_date && form.end_date && calculateDays() <= 0 && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--danger-bg)', border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 18,
              }}>
                The selected date range consists only of public holidays or invalid dates.
              </div>
            )}

            <div className="form-group">
              <label>Reason</label>
              <textarea
                placeholder="Please provide a detailed reason for your leave request"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Submit Leave Request
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

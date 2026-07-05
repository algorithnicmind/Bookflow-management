'use client'

import { useState, useEffect } from 'react'
import { settingsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function LeavePoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugLoading, setDebugLoading] = useState(false)
  const [form, setForm] = useState({ name: '', department: '', role: '', leave_type: 'earned', base_days: 0, accrual_rate: 0, max_carry_forward: 0 })

  const fetchPolicies = async () => {
    try {
      const res = await settingsApi.getLeavePolicies()
      setPolicies(res)
    } catch (err) {
      console.error('Failed to fetch leave policies:', err)
      alert('Failed to load leave policies: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      if (!payload.department) payload.department = null
      if (!payload.role) payload.role = null
      
      await settingsApi.createLeavePolicy(payload)
      setForm({ name: '', department: '', role: '', leave_type: 'earned', base_days: 0, accrual_rate: 0, max_carry_forward: 0 })
      fetchPolicies()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this policy?')) return
    try {
      await settingsApi.deleteLeavePolicy(id)
      fetchPolicies()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleTrigger = async (type) => {
    setDebugLoading(true)
    try {
      let res
      if (type === 'monthly') res = await settingsApi.triggerMonthlyAccrual()
      else res = await settingsApi.triggerYearlyCarryForward()
      alert(res.message)
    } catch(err) {
      alert(err.message)
    } finally {
      setDebugLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Leave Policies</h1>
          <p className="page-subtitle">Configure dynamic leave limits and accruals by department and role</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" onClick={() => window.location.href='/system-settings'}>Back to Settings</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card>
          <h3>Create Policy</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div className="form-group">
              <label>Policy Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Engineering Earned Leave" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Optional (e.g. Engineering)" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Leave Type</label>
              <select value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
                <option value="maternity">Maternity</option>
                <option value="miscarriage">Miscarriage</option>
              </select>
            </div>
            <div className="form-group">
              <label>Base Days</label>
              <input type="number" required value={form.base_days} onChange={e => setForm({...form, base_days: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="form-group">
              <label>Monthly Accrual Rate</label>
              <input type="number" step="0.5" required value={form.accrual_rate} onChange={e => setForm({...form, accrual_rate: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="form-group">
              <label>Max Carry Forward</label>
              <input type="number" required value={form.max_carry_forward} onChange={e => setForm({...form, max_carry_forward: parseFloat(e.target.value) || 0})} />
            </div>
            <Button type="submit" fullWidth>Add Policy</Button>
          </form>
          
          <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <h4>Admin Debug Controls</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <Button variant="outline" size="sm" loading={debugLoading} onClick={() => handleTrigger('monthly')}>Trigger Monthly Accrual</Button>
                <Button variant="outline" size="sm" loading={debugLoading} onClick={() => handleTrigger('yearly')}>Trigger Yearly Carry-Forward</Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3>Active Policies</h3>
          {loading ? <p>Loading...</p> : (
            <table className="data-table" style={{ marginTop: 20, width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Target</th>
                  <th>Type</th>
                  <th>Base</th>
                  <th>Accrual/mo</th>
                  <th>Max CF</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                        {p.department || 'All Depts'} <br/>
                        <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{p.role || 'All Roles'}</span>
                    </td>
                    <td>{p.leave_type}</td>
                    <td>{p.base_days}</td>
                    <td>{p.accrual_rate}</td>
                    <td>{p.max_carry_forward}</td>
                    <td><button onClick={() => handleDelete(p.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button></td>
                  </tr>
                ))}
                {policies.length === 0 && <tr><td colSpan="7">No custom policies found. System defaults will be used.</td></tr>}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}

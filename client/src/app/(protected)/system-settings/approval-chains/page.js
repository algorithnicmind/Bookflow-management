'use client'

import { useState, useEffect } from 'react'
import { settingsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ApprovalChainsPage() {
  const [chains, setChains] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [department, setDepartment] = useState('')
  const [steps, setSteps] = useState([{ step_order: 1, role_required: 'manager' }])

  const fetchChains = async () => {
    try {
      const res = await settingsApi.getApprovalChains()
      setChains(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChains()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        department: department || null,
        steps: steps.map((s, i) => ({ step_order: i + 1, role_required: s.role_required }))
      }
      await settingsApi.createApprovalChain(payload)
      setDepartment('')
      setSteps([{ step_order: 1, role_required: 'manager' }])
      fetchChains()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this approval chain?')) return
    try {
      await settingsApi.deleteApprovalChain(id)
      fetchChains()
    } catch (err) {
      alert(err.message)
    }
  }

  const addStep = () => {
    setSteps([...steps, { step_order: steps.length + 1, role_required: 'admin' }])
  }
  const removeStep = (idx) => {
    const newSteps = [...steps]
    newSteps.splice(idx, 1)
    setSteps(newSteps)
  }
  const updateStepRole = (idx, role) => {
    const newSteps = [...steps]
    newSteps[idx].role_required = role
    setSteps(newSteps)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Chains</h1>
          <p className="page-subtitle">Configure multi-level approval workflows by department</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href='/system-settings'}>Back to Settings</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card>
          <h3>Create Approval Chain</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div className="form-group">
              <label>Department</label>
              <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Leave empty for Global default" />
            </div>
            
            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>Approval Steps</label>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Step {idx + 1}</span>
                  <select 
                    value={step.role_required} 
                    onChange={e => updateStepRole(idx, e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStep} style={{ width: '100%', marginTop: 10 }}>+ Add Step</Button>
            </div>

            <Button type="submit" fullWidth style={{ marginTop: 20 }}>Save Chain</Button>
          </form>
        </Card>

        <Card>
          <h3>Existing Chains</h3>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: 20 }}>
              {chains.map(c => (
                <div key={c.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4 style={{ margin: 0 }}>{c.department ? `Department: ${c.department}` : 'Global Default Chain'}</h4>
                    <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {c.steps.sort((a, b) => a.step_order - b.step_order).map((s, i) => (
                      <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontSize: '0.85rem' }}>
                          {s.step_order}. {s.role_required}
                        </span>
                        {i < c.steps.length - 1 && <span>→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {chains.length === 0 && <p>No approval chains configured.</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

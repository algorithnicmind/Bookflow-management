'use client'

import { useState, useEffect } from 'react'
import { settingsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', date: '', region: '' })

  const fetchHolidays = async () => {
    try {
      const res = await settingsApi.getHolidays()
      setHolidays(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await settingsApi.createHoliday(form)
      setForm({ name: '', date: '', region: '' })
      fetchHolidays()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return
    try {
      await settingsApi.deleteHoliday(id)
      fetchHolidays()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Public Holidays</h1>
          <p className="page-subtitle">Manage public holidays that don't count towards leave balances</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href='/system-settings'}>Back to Settings</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card>
          <h3>Add Holiday</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div className="form-group">
              <label>Holiday Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Christmas" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Region (Optional)</label>
              <input value={form.region} onChange={e => setForm({...form, region: e.target.value})} placeholder="e.g. US, Global" />
            </div>
            <Button type="submit" fullWidth>Add Holiday</Button>
          </form>
        </Card>

        <Card>
          <h3>Existing Holidays</h3>
          {loading ? <p>Loading...</p> : (
            <table className="data-table" style={{ marginTop: 20, width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Region</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.date}</td>
                    <td>{h.region || '-'}</td>
                    <td><button onClick={() => handleDelete(h.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button></td>
                  </tr>
                ))}
                {holidays.length === 0 && <tr><td colSpan="4">No holidays found</td></tr>}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}

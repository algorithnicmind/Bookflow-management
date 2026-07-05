'use client'

/**
 * Organization Reports Page
 * -------------------------
 * Provides data visualization and CSV exports of company-wide leave statistics.
 */

import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { reportsApi } from '@/services/api'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { SkeletonLayout, SkeletonBox } from '@/components/ui/Skeleton'

/**
 * Dynamic imports for heavy libraries — loaded only when this page is rendered.
 * This prevents recharts (~300KB), papaparse (~50KB), and jspdf (~200KB) from
 * being bundled into the initial app shell, reducing main bundle by ~500KB.
 */

// Recharts components loaded dynamically (client-side only, no SSR)
const RechartsComponents = dynamic(
  () => import('recharts').then(mod => {
    // Return a wrapper component that passes through all recharts exports
    const Wrapper = ({ children, render }) => render(mod)
    return Wrapper
  }),
  { ssr: false, loading: () => <SkeletonBox height="300px" width="100%" borderRadius="12px" /> }
)

// Lazy-load CSV/PDF libraries only when export is triggered (not on page load)
const loadPapaParse = () => import('papaparse')
const loadJsPDF = async () => {
  const jsPDFModule = await import('jspdf')
  await import('jspdf-autotable')
  return jsPDFModule.default
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function OrganizationReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetchReports(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchReports = async (signal) => {
    setLoading(true)
    try {
      const res = await reportsApi.organization(signal)
      setData(res.org_stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const res = await reportsApi.exportLeaves()
      const Papa = await loadPapaParse()
      const csvData = Papa.unparse(res.leaves)
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leave_reports_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      alert('Failed to export CSV: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      const res = await reportsApi.exportLeaves()
      
      const jsPDF = await loadJsPDF()
      const doc = new jsPDF()
      doc.text("Organization Leave Reports", 14, 15)
      
      const tableColumn = ["ID", "Employee", "Dept", "Type", "Start", "End", "Status", "Reason"]
      const tableRows = []
      
      res.leaves.forEach(leave => {
        const rowData = [
          leave.id,
          leave.employee_name,
          leave.department,
          leave.leave_type,
          leave.start_date,
          leave.end_date,
          leave.status,
          leave.reason?.substring(0, 20) || ''
        ]
        tableRows.push(rowData)
      })

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 }
      })
      
      doc.save(`leave_reports_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('Failed to export PDF: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <SkeletonLayout />
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">{error}</div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Format data for charts
  const deptData = data.department_breakdown?.map(d => ({
    name: d.department,
    value: d.employees || d.count || 0
  })) || []

  const roleData = data.role_breakdown?.map(r => ({
    name: r.role,
    value: r.count || 0
  })) || []

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Reporting & Analytics Dashboard</h1>
          <p className="page-subtitle">Organization-wide metrics and visual charts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleExportCSV} 
            disabled={exporting}
            style={{ padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : '📄 Export CSV'}
          </button>
          <button 
            onClick={handleExportPDF} 
            disabled={exporting}
            style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : '📕 Export PDF'}
          </button>
        </div>
      </div>

      <div className="grid-4 animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard label="Total Employees" value={data.total_employees || 0} icon="👥" color="var(--info)" />
        {data.total_admins !== undefined && (
          <StatCard label="Total Admins" value={data.total_admins} icon="👑" color="var(--accent)" />
        )}
        <StatCard label="Total Leave Requests" value={data.total_leave_requests || 0} icon="📋" color="var(--warning)" />
        <StatCard label="Approved / Rejected" value={`${data.approved_leaves || 0} / ${data.rejected_leaves || 0}`} icon="📊" color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Department Breakdown</h3>
          <div style={{ width: '100%', height: 300 }}>
            {deptData.length > 0 ? (
              <RechartsComponents render={({ PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend }) => (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )} />
            ) : (
              <p>No department data available.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Role Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            {roleData.length > 0 ? (
              <RechartsComponents render={({ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
                <ResponsiveContainer>
                  <BarChart data={roleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              )} />
            ) : (
              <p>No role data available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

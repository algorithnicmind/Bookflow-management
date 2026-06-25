import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/(protected)/dashboard/page'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { dashboardApi } from '@/services/api'
import React from 'react'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/services/api', () => ({
  dashboardApi: {
    stats: jest.fn(),
  },
  leavesApi: {},
}))

jest.mock('@/components/ui/Badge', () => {
  return function MockBadge({ status }) {
    return <span data-testid="badge">{status}</span>
  }
})

describe('DashboardPage', () => {
  let mockRouter

  beforeEach(() => {
    mockRouter = { push: jest.fn() }
    useRouter.mockReturnValue(mockRouter)
    dashboardApi.stats.mockClear()
  })

  test('renders employee dashboard with stats and balances', async () => {
    useAuth.mockReturnValue({ user: { role: 'employee' } })
    
    dashboardApi.stats.mockResolvedValueOnce({
      stats: { total_requests: 10, pending: 2, approved: 7, rejected: 1 },
      balances: [
        { leave_type: 'casual', total_days: 10, used_days: 2, remaining: 8 }
      ],
      recent_leaves: [
        { id: 1, leave_type: 'casual', start_date: '2026-06-15', end_date: '2026-06-16', days: 2, status: 'approved', created_at: '2026-06-10' }
      ]
    })

    render(<DashboardPage />)

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument()
    })

    const widgetLabels = screen.getAllByText('Total Requests')
    expect(widgetLabels.length).toBeGreaterThan(0)
    const widgetValues = screen.getAllByText('10')
    expect(widgetValues.length).toBeGreaterThan(0)
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Leave Balances')).toBeInTheDocument()
    expect(screen.getAllByText('casual').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Recent Leaves')).toBeInTheDocument()
  })

  test('manager dashboard shows team extras', async () => {
    useAuth.mockReturnValue({ user: { role: 'manager' } })
    
    dashboardApi.stats.mockResolvedValueOnce({
      stats: { total_requests: 5, pending: 1, approved: 4, rejected: 0 },
      team_pending_count: 3,
      team_on_leave_today: ['Alice', 'Bob'],
      balances: [],
      recent_leaves: []
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Manager Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Team Pending')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Team on Leave Today')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('admin dashboard shows org stats', async () => {
    useAuth.mockReturnValue({ user: { role: 'admin' } })
    
    dashboardApi.stats.mockResolvedValueOnce({
      stats: { total_requests: 5, pending: 1, approved: 4, rejected: 0 },
      org_stats: {
        total_employees: 50,
        total_requests: 120,
        department_breakdown: [
          { department: 'IT', count: 20 },
          { department: 'HR', count: 5 }
        ]
      },
      balances: [],
      recent_leaves: []
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getAllByText('Total Requests').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Department Breakdown')).toBeInTheDocument()
    expect(screen.getByText('IT')).toBeInTheDocument()
  })

  test('shows error state if API fails', async () => {
    useAuth.mockReturnValue({ user: { role: 'employee' } })
    dashboardApi.stats.mockRejectedValueOnce(new Error('Failed to load'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument()
    })
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  test('empty state for recent leaves', async () => {
    useAuth.mockReturnValue({ user: { role: 'employee' } })
    
    dashboardApi.stats.mockResolvedValueOnce({
      stats: {},
      balances: [],
      recent_leaves: []
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No leaves yet')).toBeInTheDocument()
    })
  })
})

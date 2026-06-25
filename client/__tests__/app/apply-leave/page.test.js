import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApplyLeavePage from '@/app/(protected)/apply-leave/page'
import { useRouter } from 'next/navigation'
import { leavesApi } from '@/services/api'
import React from 'react'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/services/api', () => ({
  leavesApi: {
    apply: jest.fn(),
  },
}))

describe('ApplyLeavePage', () => {
  let mockRouter

  beforeEach(() => {
    mockRouter = { push: jest.fn() }
    useRouter.mockReturnValue(mockRouter)
    leavesApi.apply.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders form fields', () => {
    render(<ApplyLeavePage />)

    expect(screen.getByText('Apply for Leave')).toBeInTheDocument()
    expect(screen.getByText('Leave Type')).toBeInTheDocument()
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Reason')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Leave Request/i })).toBeInTheDocument()
  })

  test('shows error when fields are empty', async () => {
    render(<ApplyLeavePage />)

    fireEvent.click(screen.getByRole('button', { name: /Submit Leave Request/i }))

    expect(await screen.findByText('All fields are required')).toBeInTheDocument()
    expect(leavesApi.apply).not.toHaveBeenCalled()
  })

  test('shows error when end date is before start date', async () => {
    const { container } = render(<ApplyLeavePage />)
    const startDateInput = container.querySelectorAll('input[type="date"]')[0]
    const endDateInput = container.querySelectorAll('input[type="date"]')[1]
    const reasonInput = screen.getByPlaceholderText(/Please provide a detailed reason/i)

    fireEvent.change(startDateInput, { target: { value: '2026-06-15' } })
    fireEvent.change(endDateInput, { target: { value: '2026-06-10' } })
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } })

    fireEvent.submit(container.querySelector('form'))

    expect(await screen.findByText('End date must be on or after start date')).toBeInTheDocument()
    expect(leavesApi.apply).not.toHaveBeenCalled()
  })

  test('successful submission shows success message and redirects', async () => {
    leavesApi.apply.mockResolvedValueOnce({ message: 'Leave applied' })

    const { container } = render(<ApplyLeavePage />)

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const typeSelect = container.querySelector('select')
    const startDateInput = container.querySelectorAll('input[type="date"]')[0]
    const endDateInput = container.querySelectorAll('input[type="date"]')[1]
    const reasonInput = screen.getByPlaceholderText(/Please provide a detailed reason/i)

    fireEvent.change(typeSelect, { target: { value: 'sick' } })
    fireEvent.change(startDateInput, { target: { value: today } })
    fireEvent.change(endDateInput, { target: { value: tomorrow } })
    fireEvent.change(reasonInput, { target: { value: 'Feeling unwell' } })

    fireEvent.submit(container.querySelector('form'))

    await waitFor(() => {
      expect(leavesApi.apply).toHaveBeenCalledWith({
        leave_type: 'sick',
        start_date: today,
        end_date: tomorrow,
        reason: 'Feeling unwell',
      })
    })

    expect(await screen.findByText('Leave applied')).toBeInTheDocument()

    // Test redirection
    jest.advanceTimersByTime(1500)
    expect(mockRouter.push).toHaveBeenCalledWith('/leave-history')
  })
})

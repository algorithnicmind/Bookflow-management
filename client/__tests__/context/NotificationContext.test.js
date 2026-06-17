import { render, screen, act, waitFor } from '@testing-library/react'
import { NotificationProvider, useNotifications } from '@/context/NotificationContext'
import React from 'react'

global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
  jest.clearAllMocks()
})

const TestComponent = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  return (
    <div>
      <div data-testid="count">{unreadCount}</div>
      <div data-testid="list">{JSON.stringify(notifications)}</div>
      <button onClick={() => markAsRead(1)}>Read 1</button>
      <button onClick={() => markAllAsRead()}>Read All</button>
    </div>
  )
}

// Helper to mock useAuth
jest.mock('@/context/AuthContext', () => {
  const actual = jest.requireActual('@/context/AuthContext')
  return {
    ...actual,
    useAuth: jest.fn(),
  }
})

import { useAuth as useAuthMock } from '@/context/AuthContext'

describe('NotificationContext', () => {
  test('fetches on mount if user is logged in', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notifications: [] })
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.any(Object)
      )
    })
  })

  test('no fetch without user', async () => {
    useAuthMock.mockReturnValue({ user: null })
    
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('list').textContent).toBe('[]')
  })

  test('unread count calculated correctly', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        notifications: [
          { id: 1, is_read: false },
          { id: 2, is_read: true },
          { id: 3, is_read: false },
        ]
      })
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2')
    })
  })

  test('markAsRead updates state', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        notifications: [
          { id: 1, is_read: false },
          { id: 2, is_read: false },
        ]
      })
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2')
    })

    fetch.mockResolvedValueOnce({ ok: true })

    act(() => {
      screen.getByText('Read 1').click()
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/1/read'),
        expect.objectContaining({ method: 'PUT' })
      )
    })

    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('list').textContent).toContain('"is_read":true')
  })

  test('markAllAsRead updates state', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        notifications: [
          { id: 1, is_read: false },
          { id: 2, is_read: false },
        ]
      })
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2')
    })

    fetch.mockResolvedValueOnce({ ok: true })

    act(() => {
      screen.getByText('Read All').click()
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/read-all'),
        expect.objectContaining({ method: 'PUT' })
      )
    })

    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  test('polling interval calls fetch again', async () => {
    jest.useFakeTimers()
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [] })
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      jest.advanceTimersByTime(30000)
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  test('cleanup clears interval', () => {
    jest.useFakeTimers()
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [] })
    })

    const { unmount } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    unmount()

    act(() => {
      jest.advanceTimersByTime(30000)
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  test('fetch error handled', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading notifications:', expect.any(Error))
    })
  })
})

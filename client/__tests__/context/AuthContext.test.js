import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import React from 'react'

// Mock fetch globally
global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
})

function mockSession(user = null) {
  fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { get: (key) => key === 'content-type' ? 'application/json' : null },
    json: async () => ({ user }),
  })
}

const TestComponent = () => {
  const { user, loading, login, logout, updateUser } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No user'}</div>
      <button onClick={() => login({ id: 1, name: 'John', department: 'IT' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => updateUser({ department: 'Design' })}>Update</button>
    </div>
  )
}

describe('AuthContext', () => {
  test('initial state loading', () => {
    mockSession(null)
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
  })

  test('loads user from session endpoint', async () => {
    mockSession({ name: 'Alice', department: 'HR' })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Alice')
    })
  })

  test('no stored session shows no user', async () => {
    mockSession(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('No user')
    })
  })

  test('login updates state', async () => {
    mockSession(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('No user')
    })

    act(() => {
      screen.getByText('Login').click()
    })

    expect(screen.getByTestId('user').textContent).toContain('John')
  })

  test('logout clears user state', async () => {
    mockSession({ name: 'Alice' })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Alice')
    })

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Logged out' }),
    })

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('user').textContent).toBe('No user')
  })

  test('updateUser merges data', async () => {
    mockSession({ id: 1, name: 'Alice', department: 'IT' })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Alice')
    })

    act(() => {
      screen.getByText('Update').click()
    })

    expect(screen.getByTestId('user').textContent).toContain('Design')
    expect(screen.getByTestId('user').textContent).toContain('Alice')
  })

  test('session endpoint 404 handled gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/html' },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('No user')
    })
  })

  test('network error handled gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('No user')
    })
  })

  test('useAuth outside provider throws', () => {
    const originalError = console.error
    console.error = jest.fn()
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')
    
    console.error = originalError
  })
})

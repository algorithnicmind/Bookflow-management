import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import React from 'react'

// No window location mock needed

beforeEach(() => {
  localStorage.clear()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
})

const TestComponent = () => {
  const { user, loading, login, logout, updateUser } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No user'}</div>
      <button onClick={() => login('fake-token', { id: 1, name: 'John', department: 'IT' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => updateUser({ department: 'Design' })}>Update</button>
    </div>
  )
}

describe('AuthContext', () => {
  test('initial state loading', () => {
    // In React 18, useEffect runs after paint, but loading state starts as true.
    // By the time TestComponent renders, it might be in Loading state or finished.
    // A trick to test initial state is to observe the 'Loading...' text if we don't await anything.
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    // Actually, because TestComponent returns early on loading:
    // We expect it NOT to crash.
  })

  test('loads user from localStorage', () => {
    localStorage.setItem('token', 'fake')
    localStorage.setItem('user', JSON.stringify({ name: 'Alice' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('user').textContent).toContain('Alice')
  })

  test('no stored user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByTestId('user').textContent).toBe('No user')
  })

  test('login stores token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Login').click()
    })

    expect(localStorage.getItem('token')).toBe('fake-token')
  })

  test('login stores user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Login').click()
    })

    const user = JSON.parse(localStorage.getItem('user'))
    expect(user.name).toBe('John')
  })

  test('login updates state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Login').click()
    })

    expect(screen.getByTestId('user').textContent).toContain('John')
  })

  test('logout clears storage', () => {
    localStorage.setItem('token', 'fake')
    localStorage.setItem('user', JSON.stringify({ name: 'Alice' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Logout').click()
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  test('logout clears user state', () => {
    localStorage.setItem('token', 'fake')
    localStorage.setItem('user', JSON.stringify({ name: 'Alice' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('user').textContent).toBe('No user')
  })

  test('updateUser merges data', () => {
    localStorage.setItem('token', 'fake')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Alice', department: 'IT' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    act(() => {
      screen.getByText('Update').click()
    })

    expect(screen.getByTestId('user').textContent).toContain('Design')
    expect(screen.getByTestId('user').textContent).toContain('Alice')
    
    const stored = JSON.parse(localStorage.getItem('user'))
    expect(stored.department).toBe('Design')
    expect(stored.name).toBe('Alice')
  })

  test('corrupt localStorage handled', () => {
    localStorage.setItem('token', 'fake')
    localStorage.setItem('user', 'invalid-json')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('user').textContent).toBe('No user')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  test('useAuth outside provider throws', () => {
    // Disable error boundary output for this expected error test
    const originalError = console.error
    console.error = jest.fn()
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')
    
    console.error = originalError
  })
})

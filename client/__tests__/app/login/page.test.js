import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/services/api'
import React from 'react'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}))

describe('LoginPage', () => {
  let mockRouter
  let mockLogin

  beforeEach(() => {
    mockRouter = { push: jest.fn() }
    useRouter.mockReturnValue(mockRouter)

    mockLogin = jest.fn()
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
    })

    authApi.login.mockClear()
  })

  test('renders login page correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  test('empty submission shows error', async () => {
    render(<LoginPage />)
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
    
    expect(await screen.findByText('Please fill in all fields')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  test('success login redirects to dashboard', async () => {
    authApi.login.mockResolvedValueOnce({
      access_token: 'fake-token',
      user: { id: 1, name: 'Alice' }
    })

    render(<LoginPage />)
    
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'alice@company.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('alice@company.com', 'password123')
    })
    
    expect(mockLogin).toHaveBeenCalledWith('fake-token', { id: 1, name: 'Alice' })
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })

  test('login failure shows error from API', async () => {
    authApi.login.mockRejectedValueOnce(new Error('Invalid credentials'))

    render(<LoginPage />)
    
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'alice@company.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrong' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  test('loading state during API call', async () => {
    let resolveLogin
    authApi.login.mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve
    }))

    render(<LoginPage />)
    
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'alice@company.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    expect(await screen.findByText('Signing in...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled()

    // Resolve the promise
    await waitFor(() => {
      resolveLogin({ access_token: '123', user: {} })
    })
  })

  test('redirects if user is already logged in', () => {
    useAuth.mockReturnValue({
      user: { id: 1 },
      login: mockLogin,
    })

    render(<LoginPage />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })
})

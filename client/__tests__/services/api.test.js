import { request, authApi, leavesApi, employeesApi, dashboardApi, adminsApi, settingsApi, reportsApi, notificationsApi } from '@/services/api'

// Mock global fetch
global.fetch = jest.fn()

// Helper to create a mock response with headers
function mockFetchResponse(data, options = {}) {
  return {
    ok: options.ok !== undefined ? options.ok : true,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    headers: {
      get: (key) => {
        if (key === 'content-type') return 'application/json'
        return null
      }
    },
    json: async () => data,
  }
}

// No window location mock needed

beforeEach(() => {
  fetch.mockClear()
  localStorage.clear()
})

describe('Core request() function', () => {
  test('uses GET method by default', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({ success: true }))

    await request('/test')
    
    expect(fetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        method: 'GET'
      })
    )
  })

  test('post method with body stringifies payload', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({ success: true }))

    const body = { key: 'value' }
    await request('/test', { method: 'POST', body })
    
    expect(fetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body)
      })
    )
  })

  test('appends query params correctly', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({ success: true }))

    await request('/test', { params: { search: 'john', status: 'pending' } })
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('?search=john&status=pending'),
      expect.any(Object)
    )
  })

  test('filters empty query params', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({ success: true }))

    await request('/test', { params: { search: 'john', status: null, filter: '' } })
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('?search=john'),
      expect.any(Object)
    )
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('status'),
      expect.any(Object)
    )
  })

  test('401 redirects to login and clears storage', async () => {
    fetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      statusText: 'Unauthorized',
      headers: { get: () => 'application/json' },
      json: async () => ({})
    })

    await expect(request('/test')).rejects.toThrow('Session expired. Please log in again.')
  })

  test('error response throws detail message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: { get: () => 'application/json' },
      json: async () => ({ detail: 'Custom error message' })
    })

    await expect(request('/test')).rejects.toThrow('Custom error message')
  })

  test('non-JSON error response handles gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/html' },
    })

    await expect(request('/test')).rejects.toThrow('Not Found')
  })

  test('success returns parsed json', async () => {
    const mockData = { id: 1, name: 'Test' }
    fetch.mockResolvedValueOnce(mockFetchResponse(mockData))

    const result = await request('/test')
    expect(result).toEqual(mockData)
  })
})

describe('authApi', () => {
  test('login sends form data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' },
      json: async () => ({ access_token: '123' })
    })

    await authApi.login('test@example.com', 'password123')

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=test%40example.com&password=password123'
      })
    )
  })

  test('login failure throws custom error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: { get: () => 'application/json' },
      json: async () => ({ detail: 'Invalid credentials' })
    })

    await expect(authApi.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  test('register calls request correctly', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse({}))
    await authApi.register({ email: 'test@example.com' })
    expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' }))
  })
})

describe('leavesApi', () => {
  beforeEach(() => {
    fetch.mockResolvedValue(mockFetchResponse({}))
  })

  test('apply', async () => {
    await leavesApi.apply({ type: 'sick' })
    expect(fetch).toHaveBeenCalledWith('/api/leaves', expect.objectContaining({ method: 'POST' }))
  })

  test('history', async () => {
    await leavesApi.history({ status: 'pending' })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/leaves?status=pending'), expect.any(Object))
  })

  test('balance', async () => {
    await leavesApi.balance()
    expect(fetch).toHaveBeenCalledWith('/api/leaves/balance', expect.any(Object))
  })

  test('cancel', async () => {
    await leavesApi.cancel(5)
    expect(fetch).toHaveBeenCalledWith('/api/leaves/5/cancel', expect.objectContaining({ method: 'PUT' }))
  })

  test('pending', async () => {
    await leavesApi.pending()
    expect(fetch).toHaveBeenCalledWith('/api/leaves/pending', expect.any(Object))
  })

  test('approve', async () => {
    await leavesApi.approve(5, 'OK')
    expect(fetch).toHaveBeenCalledWith('/api/leaves/5/approve', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ comments: 'OK' }) }))
  })

  test('reject', async () => {
    await leavesApi.reject(5, 'No')
    expect(fetch).toHaveBeenCalledWith('/api/leaves/5/reject', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ comments: 'No' }) }))
  })
})

describe('Other APIs', () => {
  beforeEach(() => {
    fetch.mockResolvedValue(mockFetchResponse({}))
  })

  test('employeesApi.list', async () => {
    await employeesApi.list({ search: 'john' })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/employees?search=john'), expect.any(Object))
  })

  test('employeesApi.create', async () => {
    await employeesApi.create({ name: 'John' })
    expect(fetch).toHaveBeenCalledWith('/api/employees', expect.objectContaining({ method: 'POST' }))
  })

  test('employeesApi.update', async () => {
    await employeesApi.update(1, { name: 'John' })
    expect(fetch).toHaveBeenCalledWith('/api/employees/1', expect.objectContaining({ method: 'PUT' }))
  })

  test('employeesApi.deactivate', async () => {
    await employeesApi.deactivate(1)
    expect(fetch).toHaveBeenCalledWith('/api/employees/1', expect.objectContaining({ method: 'DELETE' }))
  })

  test('dashboardApi.stats', async () => {
    await dashboardApi.stats()
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/stats', expect.any(Object))
  })

  test('settingsApi.update', async () => {
    await settingsApi.update({ theme: 'dark' })
    expect(fetch).toHaveBeenCalledWith('/api/settings', expect.objectContaining({ method: 'PUT' }))
  })

  test('reportsApi.organization', async () => {
    await reportsApi.organization()
    expect(fetch).toHaveBeenCalledWith('/api/reports/organization', expect.any(Object))
  })

  test('notificationsApi.list', async () => {
    await notificationsApi.list()
    expect(fetch).toHaveBeenCalledWith('/api/notifications', expect.any(Object))
  })

  test('notificationsApi.markRead', async () => {
    await notificationsApi.markRead(1)
    expect(fetch).toHaveBeenCalledWith('/api/notifications/1/read', expect.objectContaining({ method: 'PUT' }))
  })

  test('notificationsApi.markAllRead', async () => {
    await notificationsApi.markAllRead()
    expect(fetch).toHaveBeenCalledWith('/api/notifications/read-all', expect.objectContaining({ method: 'PUT' }))
  })
})

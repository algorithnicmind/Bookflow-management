const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  }

  let url = `${API_BASE}${endpoint}`
  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const response = await fetch(url, config)

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please log in again.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || data.error || 'An error occurred')
  }

  return data
}

export const authApi = {
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed')
    }
    return data
  },
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
}

export const leavesApi = {
  apply: (body) => request('/api/leaves', { method: 'POST', body }),
  history: (params) => request('/api/leaves', { params }),
  balance: () => request('/api/leaves/balance'),
  cancel: (id) => request(`/api/leaves/${id}/cancel`, { method: 'PUT' }),
  pending: () => request('/api/leaves/pending'),
  approve: (id, comments) =>
    request(`/api/leaves/${id}/approve`, { method: 'PUT', body: { comments } }),
  reject: (id, comments) =>
    request(`/api/leaves/${id}/reject`, { method: 'PUT', body: { comments } }),
}

export const employeesApi = {
  list: (params) => request('/api/employees', { params }),
  create: (body) => request('/api/employees', { method: 'POST', body }),
  update: (id, body) => request(`/api/employees/${id}`, { method: 'PUT', body }),
  deactivate: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  stats: () => request('/api/dashboard/stats'),
}

export const adminsApi = {
  create: (body) => request('/api/auth/register', { method: 'POST', body }),
}

export const settingsApi = {
  update: (body) => request('/api/settings', { method: 'PUT', body }),
}

export const reportsApi = {
  organization: () => request('/api/reports/organization'),
}

export const auditApi = {
  list: (params) => request('/api/audit-logs', { params }),
}

export const notificationsApi = {
  list: () => request('/api/notifications'),
  markRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/api/notifications/read-all', { method: 'PUT' }),
}

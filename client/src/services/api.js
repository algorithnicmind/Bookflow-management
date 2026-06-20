const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Important for HttpOnly cookies
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
    localStorage.removeItem('user')
    throw new Error('Session expired. Please log in again.')
  }

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(typeof data.detail === 'string' ? data.detail : (data.error || 'An error occurred'))
    error.status = response.status
    error.data = data
    throw error
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
      credentials: 'include',
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
  getProfile: () => request('/api/employees/me'),
  updateProfile: (body) => request('/api/employees/me', { method: 'PUT', body }),
  oauthLogin: (body) => request('/api/auth/oauth-login', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
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
  getHolidays: () => request('/api/settings/holidays'),
  createHoliday: (body) => request('/api/settings/holidays', { method: 'POST', body }),
  deleteHoliday: (id) => request(`/api/settings/holidays/${id}`, { method: 'DELETE' }),
  getApprovalChains: () => request('/api/settings/approval-chains'),
  createApprovalChain: (body) => request('/api/settings/approval-chains', { method: 'POST', body }),
  deleteApprovalChain: (id) => request(`/api/settings/approval-chains/${id}`, { method: 'DELETE' }),
  getLeavePolicies: () => request('/api/settings/leave-policies'),
  createLeavePolicy: (body) => request('/api/settings/leave-policies', { method: 'POST', body }),
  deleteLeavePolicy: (id) => request(`/api/settings/leave-policies/${id}`, { method: 'DELETE' }),
  triggerMonthlyAccrual: () => request('/api/settings/debug/trigger-monthly-accrual', { method: 'POST' }),
  triggerYearlyCarryForward: () => request('/api/settings/debug/trigger-yearly-carry-forward', { method: 'POST' }),
}

export const reportsApi = {
  organization: () => request('/api/reports/organization'),
  exportLeaves: () => request('/api/reports/leaves-export'),
}

export const auditApi = {
  list: (params) => request('/api/audit-logs', { params }),
}

export const notificationsApi = {
  list: () => request('/api/notifications'),
  markRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/api/notifications/read-all', { method: 'PUT' }),
}

export const botApi = {
  chat: (message, sessionState) =>
    request('/api/bot/chat', {
      method: 'POST',
      body: { message, session_state: sessionState },
    }),
}

export const contactApi = {
  submit: (body) => request('/api/contact', { method: 'POST', body }),
  list: () => request('/api/contact'),
}

export const onboardingApi = {
  apply: (body) => request('/api/onboarding/apply', { method: 'POST', body }),
  list: (params) => request('/api/onboarding/applications', { params }),
  approve: (id) => request(`/api/onboarding/applications/${id}/approve`, { method: 'PUT' }),
  reject: (id) => request(`/api/onboarding/applications/${id}/reject`, { method: 'PUT' }),
}

export const systemOwnersApi = {
  list: () => request('/api/employees/system-owners'),
  create: (body) => request('/api/employees/system-owners', { method: 'POST', body }),
}

/**
 * API Service Layer
 * -----------------
 * This file centralizes all HTTP communication between the Next.js frontend and the FastAPI backend.
 * By using this centralized layer, we ensure consistent error handling, header injection,
 * and session management across the entire application.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Core HTTP Request Wrapper
 * 
 * Architectural Flow:
 * 1. Sets default headers (application/json).
 * 2. Enforces `credentials: 'include'` so that secure HttpOnly cookies (like `access_token`)
 *    are automatically attached to cross-origin requests.
 * 3. Serializes the request body and URL parameters.
 * 4. Intercepts 401 Unauthorized responses to clear local state and trigger a re-login.
 * 5. Parses and normalizes error messages from the backend so components can easily display them.
 */
export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
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
  updateStatus: (id, status) => request(`/api/onboarding/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  approve: (id) => request(`/api/onboarding/applications/${id}/approve`, { method: 'PUT', body: {} }), // Fix to send empty body or match endpoint
  reject: (id) => request(`/api/onboarding/applications/${id}/reject`, { method: 'PUT', body: {} }),
}

export const integrationsApi = {
  getCalendarStatus: () => request('/api/integrations/calendar/status'),
  connectCalendar: (provider) => request(`/api/integrations/calendar/connect/${provider}`),
  simulateSlackAction: async (payload) => {
    const formData = new URLSearchParams()
    formData.append('payload', JSON.stringify(payload))
    const response = await fetch(`${API_BASE}/api/integrations/slack/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
    return response.json()
  },
  simulateTeamsAction: (payload) => request('/api/integrations/teams/actions', { method: 'POST', body: payload })
}

export const systemOwnersApi = {
  list: () => request('/api/employees/system-owners'),
  create: (body) => request('/api/employees/system-owners', { method: 'POST', body }),
}


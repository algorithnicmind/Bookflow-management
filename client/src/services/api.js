/**
 * API Service Layer
 * -----------------
 * This file centralizes all HTTP communication between the Next.js frontend and the FastAPI backend.
 * By using this centralized layer, we ensure consistent error handling, header injection,
 * and session management across the entire application.
 */

import { API_BASE } from '@/config'

/**
 * Core HTTP Request Wrapper
 * 
 * Architectural Flow:
 * 1. Sets default headers (application/json for non-GET requests).
 * 2. Enforces `credentials: 'include'` so that secure HttpOnly cookies (like `access_token`)
 *    are automatically attached to cross-origin requests.
 * 3. Serializes the request body and URL parameters.
 * 4. Intercepts 401 Unauthorized responses to redirect to login and prevent cascading errors.
 * 5. Parses and normalizes error messages from the backend so components can easily display them.
 */
export async function request(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    signal: options.signal,
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

  // Wrap fetch in try/catch to gracefully handle network errors
  // (e.g., ECONNREFUSED when backend isn't running, ECONNRESET when backend restarts).
  // Without this, the Next.js proxy dumps ugly stack traces to the terminal.
  let response
  try {
    response = await fetch(url, config)
  } catch (networkErr) {
    throw new Error('Unable to connect to server. Please ensure the backend is running.')
  }

  if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/session')) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    throw new Error('Session expired. Please log in again.')
  }

  let data
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = { detail: response.statusText || 'An error occurred' }
  }

  if (!response.ok) {
    const error = new Error(typeof data.detail === 'string' ? data.detail : (data.error || 'An error occurred'))
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const authApi = {
  login: async (email, password, signal) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal,
    })
    const contentType = response.headers.get('content-type') || ''
    let data
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = { detail: response.statusText || 'Login failed' }
    }
    if (!response.ok) {
      throw new Error(typeof data.detail === 'string' ? data.detail : 'Login failed')
    }
    return data
  },
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  getProfile: (signal) => request('/api/employees/me', { signal }),
  updateProfile: (body) => request('/api/employees/me', { method: 'PUT', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  uploadAvatar: async (file, signal) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE}/api/auth/upload-avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Failed to upload avatar')
    }
    return response.json()
  },
  impersonate: (orgId) => request(`/api/auth/impersonate/${orgId}`, { method: 'POST' }),
  impersonateEmployee: (employeeId) => request(`/api/auth/impersonate/employee/${employeeId}`, { method: 'POST' }),
}

export const leavesApi = {
  apply: (body) => request('/api/leaves', { method: 'POST', body }),
  history: (params, signal) => request('/api/leaves', { params, signal }),
  balance: (signal) => request('/api/leaves/balance', { signal }),
  cancel: (id) => request(`/api/leaves/${id}/cancel`, { method: 'PUT' }),
  pending: (signal) => request('/api/leaves/pending', { signal }),
  approve: (id, comments) =>
    request(`/api/leaves/${id}/approve`, { method: 'PUT', body: { comments } }),
  reject: (id, comments) =>
    request(`/api/leaves/${id}/reject`, { method: 'PUT', body: { comments } }),
}

export const employeesApi = {
  list: (params, signal) => request('/api/employees', { params, signal }),
  create: (body) => request('/api/employees', { method: 'POST', body }),
  update: (id, body) => request(`/api/employees/${id}`, { method: 'PUT', body }),
  deactivate: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  stats: (signal) => request('/api/dashboard/stats', { signal }),
}

export const settingsApi = {
  get: (signal) => request('/api/settings', { signal }),
  update: (body) => request('/api/settings', { method: 'PUT', body }),
  updateOrganizationName: (name) => request('/api/settings/organization-name', { method: 'PUT', body: { name } }),
  getHolidays: (signal) => request('/api/settings/holidays', { signal }),
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
  getLeaveTypes: () => request('/api/settings/leave-types'),
  createLeaveType: (body) => request('/api/settings/leave-types', { method: 'POST', body }),
  deleteLeaveType: (id) => request(`/api/settings/leave-types/${id}`, { method: 'DELETE' }),
}

export const reportsApi = {
  organization: (signal) => request('/api/reports/organization', { signal }),
  exportLeaves: () => request('/api/reports/leaves-export'),
}

export const auditApi = {
  list: (params, signal) => request('/api/audit-logs', { params, signal }),
}

export const notificationsApi = {
  list: (signal) => request('/api/notifications', { signal }),
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
  list: (signal) => request('/api/contact', { signal }),
}

export const onboardingApi = {
  apply: (body) => request('/api/onboarding/apply', { method: 'POST', body }),
  list: (params, signal) => request('/api/onboarding/applications', { params, signal }),
  get: (id, signal) => request(`/api/onboarding/applications/${id}`, { signal }),
  updateStatus: (id, status) => request(`/api/onboarding/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  updateNotes: (id, notes) => request(`/api/onboarding/applications/${id}/notes`, { method: 'PATCH', body: { notes } }),
  updatePlan: (id, selected_plan) => request(`/api/onboarding/applications/${id}/plan`, { method: 'PATCH', body: { selected_plan } }),
  approve: (id, body) => request(`/api/onboarding/applications/${id}/approve`, { method: 'PUT', body: body || {} }),
  reject: (id) => request(`/api/onboarding/applications/${id}/reject`, { method: 'PUT', body: {} }),
  deleteTenant: (id) => request(`/api/onboarding/applications/${id}/tenant`, { method: 'DELETE' }),
}

export const integrationsApi = {
  getCalendarStatus: (signal) => request('/api/integrations/calendar/status', { signal }),
  connectCalendar: (provider) => request(`/api/integrations/calendar/connect/${provider}`),
  simulateSlackAction: async (payload, signal) => {
    const formData = new URLSearchParams()
    formData.append('payload', JSON.stringify(payload))
    const response = await fetch(`${API_BASE}/api/integrations/slack/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      signal,
    })
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return response.json()
    }
    return { detail: response.statusText || 'Action failed' }
  },
  simulateTeamsAction: (payload) => request('/api/integrations/teams/actions', { method: 'POST', body: payload })
}

export const systemOwnersApi = {
  list: (signal) => request('/api/employees/system-owners', { signal }),
  create: (body) => request('/api/employees/system-owners', { method: 'POST', body }),
}

export const platformConfigApi = {
  get: (signal) => request('/api/settings/platform-config', { signal }),
  update: (body) => request('/api/settings/platform-config', { method: 'PUT', body }),
}

export const organizationsApi = {
  list: (signal) => request('/api/organizations', { signal }),
  get: (id, signal) => request(`/api/organizations/${id}`, { signal }),
  update: (id, body) => request(`/api/organizations/${id}`, { method: 'PUT', body }),
  getRoles: (id, signal) => request(`/api/organizations/${id}/roles`, { signal }),
  updateRole: (id, roleName, permissions) => request(`/api/organizations/${id}/roles/${roleName}`, { method: 'PUT', body: { permissions } }),
  deleteRole: (id, roleName) => request(`/api/organizations/${id}/roles/${roleName}`, { method: 'DELETE' }),
  getDashboard: (id, signal) => request(`/api/organizations/${id}/dashboard`, { signal }),
  getLeaveTypes: (id, signal) => request(`/api/organizations/${id}/leave-types`, { signal }),
  createLeaveType: (id, body) => request(`/api/organizations/${id}/leave-types`, { method: 'POST', body }),
  deleteLeaveType: (id, leaveTypeId) => request(`/api/organizations/${id}/leave-types/${leaveTypeId}`, { method: 'DELETE' }),
  getDepartments: (id, signal) => request(`/api/organizations/${id}/departments`, { signal }),
  createDepartment: (id, body) => request(`/api/organizations/${id}/departments`, { method: 'POST', body }),
  updateDepartment: (id, deptId, body) => request(`/api/organizations/${id}/departments/${deptId}`, { method: 'PUT', body }),
  deleteDepartment: (id, deptId) => request(`/api/organizations/${id}/departments/${deptId}`, { method: 'DELETE' }),
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken(): string | null {
  return localStorage.getItem('shaffotir_token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  
  if (res.status === 401) {
    localStorage.removeItem('shaffotir_token')
    localStorage.removeItem('shaffotir_user')
    window.location.href = '/login'
    return
  }
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.error || data.non_field_errors?.[0] || 'Request failed')
  return data
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),

  async login(email: string, password: string) {
    const data = await this.post('/auth/login/', { email, password })
    localStorage.setItem('shaffotir_token', data.access_token)
    localStorage.setItem('shaffotir_user', JSON.stringify(data.user))
    return data.user
  },

  logout() {
    localStorage.removeItem('shaffotir_token')
    localStorage.removeItem('shaffotir_user')
    window.location.href = '/login'
  },

  // Employees
  getEmployees: () => api.get('/employees/'),
  getEmployee: (id: string) => api.get(`/employees/${id}/`),

  // Weapons
  getWeapons: () => api.get('/weapons/'),
  getWeapon: (id: string) => api.get(`/weapons/${id}/`),

  // Lanes
  getLanes: () => api.get('/lanes/'),
  getLane: (id: string) => api.get(`/lanes/${id}/`),
  updateLane: (id: string, data: any) => api.patch(`/lanes/${id}/`, data),

  // Sessions
  getSessions: () => api.get('/sessions/'),
  getSession: (id: string) => api.get(`/sessions/${id}/`),
  startSession: (data: any) => api.post('/sessions/start/', data),
  processTurn: (data: any) => api.post('/sessions/process-turn/', data),

  // Session flows
  getFlows: () => api.get('/session-flows/'),
  assignToLane: (data: any) => api.post('/session-flows/assign-to-lane/', data),
  selectWeapon: (data: any) => api.post('/session-flows/select-weapon/', data),
  startShooting: (data: any) => api.post('/session-flows/start-shooting/', data),
  completeFlow: (data: any) => api.post('/session-flows/complete/', data),

  // Protocols
  getProtocols: () => api.get('/protocols/'),
  getProtocol: (id: string) => api.get(`/protocols/${id}/`),
  signProtocol: (id: string) => api.post(`/protocols/${id}/sign/`),
  approveProtocol: (id: string) => api.post(`/protocols/${id}/approve/`),
  archiveProtocol: (id: string) => api.post(`/protocols/${id}/archive/`),

  // Cameras
  getCameras: () => api.get('/cameras/'),
  checkCameraHealth: (cameras: any[]) => api.post('/cameras/health/', { cameras }),

  // TB Tests
  getTBTests: () => api.get('/tb-tests/'),
  submitTBTest: (data: any) => api.post('/tb-tests/submit/', data),

  // Audit
  getAuditLogs: () => api.get('/audit/'),

  // Analytics
  getAnalytics: () => api.get('/analytics/summary/'),
}

/**
 * ShaffofTIR API Client
 *
 * Professional fetch-based HTTP client with:
 * - Automatic JWT injection (Authorization header)
 * - Token refresh on 401 with request queuing
 * - Normalised error envelope parsing (ApiError)
 * - Typed service modules via @/api/*
 *
 * Also exports a legacy `api` object for backward compatibility
 * with pages that haven't been migrated to service modules yet.
 *
 * @author ShaffofTIR Team
 */

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'
const TOKEN_KEY = 'shaffotir_token'
const REFRESH_KEY = 'shaffotir_refresh'
const USER_KEY = 'shaffotir_user'

// ─── Token Management ──────────────────────────────────────────────────────

export const tokens = {
  get access(): string | null { return localStorage.getItem(TOKEN_KEY) },
  get refresh(): string | null { return localStorage.getItem(REFRESH_KEY) },
  set(payload: { access_token: string; refresh_token: string }) {
    localStorage.setItem(TOKEN_KEY, payload.access_token)
    localStorage.setItem(REFRESH_KEY, payload.refresh_token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

// ─── Error Class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ErrorEnvelope {
  error?: { code: string; message: string; details?: unknown }
  detail?: string
  non_field_errors?: string[]
}

function parseError(data: unknown, status: number): ApiError {
  const env = data as ErrorEnvelope
  if (env?.error) return new ApiError(env.error.code, env.error.message, status, env.error.details)
  if (env?.detail) return new ApiError('ERROR', env.detail, status)
  if (env?.non_field_errors?.length) return new ApiError('VALIDATION_ERROR', env.non_field_errors[0], status)
  return new ApiError('UNKNOWN', 'Неизвестная ошибка сервера', status)
}

// ─── Token Refresh Queue ─────────────────────────────────────────────────────

let isRefreshing = false
let refreshQueue: Array<() => void> = []

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokens.refresh
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    tokens.set({ access_token: data.access, refresh_token: data.refresh || refreshToken })
    return true
  } catch { return false }
}

// ─── Core Request ──────────────────────────────────────────────────────────

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokens.access
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && !path.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true
      const refreshed = await refreshAccessToken()
      isRefreshing = false
      if (refreshed) return request<T>(path, options)
      tokens.clear()
      window.location.href = '/login'
      throw new ApiError('NOT_AUTHENTICATED', 'Сессия истекла', 401)
    } else {
      await new Promise<void>((resolve) => refreshQueue.push(resolve))
      return request<T>(path, options)
    }
  }

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw parseError(data, res.status)
  return data as T
}

// ─── HTTP Method Wrappers ───────────────────────────────────────────────────

export const http = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ─── Legacy `api` object (backward compat) ──────────────────────────────────

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => request(path, { method: 'DELETE' }),

  async login(email: string, password: string): Promise<any> {
    const data: any = await this.post('/auth/login/', { email, password })
    tokens.set({ access_token: data.access_token, refresh_token: data.refresh_token })
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data.user
  },

  logout() {
    tokens.clear()
    window.location.href = '/login'
  },

  // Employees
  getEmployees: (): Promise<any> => http.get('/employees/'),
  getEmployee: (id: string): Promise<any> => http.get(`/employees/${id}/`),

  // Weapons
  getWeapons: (): Promise<any> => http.get('/weapons/'),
  getWeapon: (id: string): Promise<any> => http.get(`/weapons/${id}/`),

  // Lanes
  getLanes: (): Promise<any> => http.get('/lanes/'),
  getLane: (id: string): Promise<any> => http.get(`/lanes/${id}/`),
  updateLane: (id: string, data: any): Promise<any> => http.patch(`/lanes/${id}/`, data),

  // Sessions
  getSessions: (): Promise<any> => http.get('/sessions/'),
  getSession: (id: string): Promise<any> => http.get(`/sessions/${id}/`),
  startSession: (data: any): Promise<any> => http.post('/sessions/start/', data),
  processTurn: (data: any): Promise<any> => http.post(`/sessions/${data.session_id}/process_turn/`, data),

  // Protocols
  getProtocols: (): Promise<any> => http.get('/protocols/'),
  getProtocol: (id: string): Promise<any> => http.get(`/protocols/${id}/`),
  signProtocol: (id: string): Promise<any> => http.post(`/protocols/${id}/sign/`),
  approveProtocol: (id: string): Promise<any> => http.post(`/protocols/${id}/approve/`),
  archiveProtocol: (id: string): Promise<any> => http.post(`/protocols/${id}/archive/`),

  // Cameras
  getCameras: (): Promise<any> => http.get('/cameras/'),
  checkCameraHealth: (cameras: any[]): Promise<any> => http.post('/cameras/health/', { cameras }),

  // TB Tests
  getTBTests: (): Promise<any> => http.get('/tb-tests/'),

  // Analytics
  getAnalytics: (): Promise<any> => http.get('/analytics/summary/'),
  getAuditLogs: (): Promise<any> => http.get('/audit-logs/'),
}

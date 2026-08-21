/**
 * Authentication API service.
 */
import { http, tokens } from './client'
import type { User } from '@/types'

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const data = await http.post<LoginResponse>('/auth/login/', { email, password })
    tokens.set({ access_token: data.access_token, refresh_token: data.refresh_token })
    localStorage.setItem('shaffotir_user', JSON.stringify(data.user))
    return data.user
  },

  async me(): Promise<User> {
    return http.get<User>('/auth/me/')
  },

  logout() {
    tokens.clear()
    window.location.href = '/login'
  },
}

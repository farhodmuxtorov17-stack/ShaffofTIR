/**
 * Auth store — backward-compatible re-exports.
 *
 * New code should use the useAuth() composable directly.
 * This module exists so existing page imports keep working.
 */
import { reactive } from 'vue'
import { tokens } from '@/api/client'
import type { User, Role } from '@/types'

const stored = localStorage.getItem('shaffotir_user')

export const authState = reactive<{
  user: User | null
  loading: boolean
}>({
  user: stored ? JSON.parse(stored) : null,
  loading: false,
})

export function setUser(user: User | null) {
  authState.user = user
  if (user) localStorage.setItem('shaffotir_user', JSON.stringify(user))
  else localStorage.removeItem('shaffotir_user')
}

export function getRole(): Role | null {
  return authState.user?.role || null
}

export async function login(email: string, password: string): Promise<User> {
  authState.loading = true
  try {
    const { authApi } = await import('@/api/auth')
    authState.user = await authApi.login(email, password)
    return authState.user
  } finally {
    authState.loading = false
  }
}

export function logout() {
  tokens.clear()
  authState.user = null
  window.location.href = '/login'
}

import { reactive } from 'vue'
import { api } from '@/api/client'
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

export async function login(email: string, password: string) {
  authState.loading = true
  try {
    const user = await api.login(email, password)
    setUser(user)
    return user
  } finally {
    authState.loading = false
  }
}

export function logout() {
  setUser(null)
  localStorage.removeItem('shaffotir_token')
  window.location.href = '/login'
}

export function getRole(): Role | null {
  return authState.user?.role || null
}

/**
 * Authentication composable — reactive auth state.
 *
 * Wraps the auth store with computed properties and methods.
 */
import { reactive, computed } from 'vue'
import { authApi } from '@/api/auth'
import { tokens } from '@/api/client'
import type { User, Role } from '@/types'

const stored = localStorage.getItem('shaffotir_user')

const state = reactive<{
  user: User | null
  loading: boolean
}>({
  user: stored ? JSON.parse(stored) : null,
  loading: false,
})

export function useAuth() {
  const isAuthenticated = computed(() => !!state.user && !!tokens.access)
  const role = computed<Role | null>(() => state.user?.role || null)
  const displayName = computed(() => state.user?.full_name || state.user?.email || '')
  const isInstructor = computed(() => role.value === 'INSTRUCTOR')
  const isTechSpec = computed(() => role.value === 'TECHSPEC')

  async function login(email: string, password: string): Promise<User> {
    state.loading = true
    try {
      state.user = await authApi.login(email, password)
      return state.user
    } finally {
      state.loading = false
    }
  }

  function logout() {
    authApi.logout()
    state.user = null
  }

  return {
    state,
    isAuthenticated,
    role,
    displayName,
    isInstructor,
    isTechSpec,
    login,
    logout,
  }
}

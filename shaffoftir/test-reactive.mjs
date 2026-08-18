import { effectScope, reactive, ref, computed } from 'vue'

// Simulate the pinia shim
function defineStore(id, factory) {
  return () => {
    const scope = effectScope(true)
    let raw
    scope.run(() => { raw = factory() })
    const store = reactive(raw)
    return store
  }
}

const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || '')
  
  function login(data) {
    user.value = { email: data.email, role: 'MANAGER' }
    token.value = 'test_token'
  }
  
  return { user, token, isAuthenticated, userRole, login }
})

const auth = useAuthStore()
console.log('Before login:')
console.log('  isAuthenticated:', auth.isAuthenticated)
console.log('  userRole:', auth.userRole)
console.log('  user:', auth.user)

auth.login({ email: 'manager@shaffoftir.uz' })
console.log('After login:')
console.log('  isAuthenticated:', auth.isAuthenticated)
console.log('  userRole:', auth.userRole)
console.log('  user:', auth.user)
console.log('  user.role:', auth.user?.role)

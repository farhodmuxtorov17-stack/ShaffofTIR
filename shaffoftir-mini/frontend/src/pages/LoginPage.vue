<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login, authState } from '@/stores/auth'
import { Zap, Wrench } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const demoAccounts = [
  { role: 'INSTRUCTOR', email: 'instructor@shaffoftir.uz', password: 'inst123', label: 'Инструктор', icon: Zap },
  { role: 'TECHSPEC', email: 'tech@shaffoftir.uz', password: 'tech123', label: 'Тех. Специалист', icon: Wrench },
]

async function doLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    const user = await login(email.value, password.value)
    if (user.role === 'INSTRUCTOR') router.push('/sessions')
    else if (user.role === 'TECHSPEC') router.push('/cameras')
    else { error.value = 'Доступ только для Инструктора и Тех. Специалиста'; authState.user = null; localStorage.clear() }
  } catch (e: any) {
    error.value = e.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}

function fillDemo(acc: typeof demoAccounts[0]) {
  email.value = acc.email
  password.value = acc.password
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" class="w-8 h-8">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="white" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold">Shaffof<span class="text-emerald-400">TIR</span></h1>
        <p class="text-sm text-slate-500 mt-1">Система управления стрелковым полигоном</p>
      </div>

      <!-- Form -->
      <div class="card p-6 space-y-4">
        <div>
          <label class="text-sm text-slate-400 mb-1.5 block">Email</label>
          <input v-model="email" type="email" class="input" placeholder="Введите email" @keyup.enter="doLogin" />
        </div>
        <div>
          <label class="text-sm text-slate-400 mb-1.5 block">Пароль</label>
          <input v-model="password" type="password" class="input" placeholder="Введите пароль" @keyup.enter="doLogin" />
        </div>
        <p v-if="error" class="text-sm text-red-400 bg-red-950/30 rounded-lg px-3 py-2">{{ error }}</p>
        <button @click="doLogin" :disabled="loading" class="btn-primary w-full justify-center">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </div>

      <!-- Demo accounts -->
      <div class="mt-6">
        <p class="text-xs text-slate-500 text-center mb-3">Демо-доступы:</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="acc in demoAccounts"
            :key="acc.role"
            @click="fillDemo(acc)"
            class="card-hover p-3 flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <component :is="acc.icon" :size="20" class="text-emerald-400" />
            <span class="text-sm font-medium text-slate-200">{{ acc.label }}</span>
            <span class="text-xs text-slate-500">{{ acc.email }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

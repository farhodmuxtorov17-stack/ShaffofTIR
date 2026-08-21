<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authState, logout } from '@/stores/auth'
import {
  Zap, Target, Users, FileText,
  Camera, Crosshair, Activity, Monitor,
  LogOut, ScanFace, ListOrdered,
  GraduationCap, ShieldCheck, Globe
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const user = computed(() => authState.user)
const role = computed(() => user.value?.role)

interface NavItem { label: string; path: string; icon: any }

const instructorNav: NavItem[] = [
  { label: 'Стрельбы', path: '/sessions', icon: Zap },
  { label: 'FaceID чекин', path: '/faceid', icon: ScanFace },
  { label: 'Очередь', path: '/queue', icon: ListOrdered },
  { label: 'Результаты', path: '/results', icon: Target },
  { label: 'Сотрудники', path: '/employees', icon: Users },
  { label: 'Протоколы', path: '/protocols', icon: FileText },
  { label: 'Обучение', path: '/training', icon: GraduationCap },
  { label: 'ТБ тест', path: '/tb-test', icon: ShieldCheck },
]

const techSpecNav: NavItem[] = [
  { label: 'Камеры', path: '/cameras', icon: Camera },
  { label: 'Дорожки', path: '/lanes', icon: Monitor },
  { label: 'Арсенал', path: '/arsenal', icon: Crosshair },
  { label: 'Система', path: '/system', icon: Activity },
]

// SUPER_ADMIN sees everything
const adminNav: NavItem[] = [...instructorNav, ...techSpecNav]

const navItems = computed(() => {
  if (role.value === 'SUPER_ADMIN') return adminNav
  if (role.value === 'INSTRUCTOR') return instructorNav
  return techSpecNav
})

function navigate(path: string) { router.push(path) }
function doLogout() { logout() }
function isActive(path: string) { return route.path.startsWith(path) }

const roleLabel = computed(() => {
  const m: Record<string, string> = {
    INSTRUCTOR: 'Инструктор',
    TECHSPEC: 'Тех. Специалист',
    SUPER_ADMIN: 'Администратор',
    MANAGER: 'Руководитель',
  }
  return m[role.value || ''] || ''
})
</script>

<template>
  <div class="flex h-screen bg-slate-950 overflow-hidden">
    <aside class="w-60 flex-shrink-0 bg-slate-900/95 border-r border-slate-800 flex flex-col">
      <div class="px-5 py-4 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" class="w-6 h-6">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="#22c55e" />
          </svg>
          <span class="text-lg font-bold">Shaffof<span class="text-emerald-400">TIR</span></span>
        </div>
        <p class="text-xs text-slate-500 mt-1 ml-8">{{ roleLabel }}</p>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigate(item.path)"
          :class="[
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition',
            isActive(item.path)
              ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-700/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
          ]"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </button>
      </nav>

      <div class="px-3 py-3 border-t border-slate-800">
        <div class="flex items-center gap-2.5 px-2 py-2">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm font-bold text-white">
            {{ user?.full_name?.charAt(0) || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-200 truncate">{{ user?.full_name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user?.rank || user?.email }}</p>
          </div>
        </div>
        <button @click="doLogout" class="w-full mt-1 flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition">
          <LogOut :size="18" />
          Выйти
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

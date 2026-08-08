<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useI18n } from '@/i18n'
import { Mail, Phone, Shield, Calendar, Target, Award, TrendingUp, Activity, ChevronRight, Crosshair, Route, Camera, Wrench } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const authStore = useAuthStore()
const masterStore = useMasterStore()
const historyStore = useSessionsHistoryStore()
const router = useRouter()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const user = computed(() => authStore.user)

const userInitials = computed(() => {
  const name = user.value?.full_name || ''
  const parts = name.split(' ')
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
})

const employeeRecord = computed(() => {
  if (!user.value) return null
  return masterStore.employees.find(e =>
    e.full_name.includes(user.value?.full_name?.split(' ')[0] || '') ||
    e.email === user.value?.email
  ) || null
})

const mySessions = computed(() => {
  if (!employeeRecord.value) return []
  const empShort = employeeRecord.value.full_name.split(' ').slice(0, 2).join(' ')
  const empId = employeeRecord.value.id
  return historyStore.sessions.filter(s => s.employee_id === empId || s.employee_name === empShort)
})

const stats = computed(() => ({
  totalSessions: mySessions.value.length,
  totalShots: mySessions.value.reduce((sum, s) => sum + s.total_shots, 0),
  avgScore: mySessions.value.length > 0 ? Math.round(mySessions.value.reduce((sum, s) => sum + s.total_score, 0) / mySessions.value.length) : 0,
  avgAccuracy: mySessions.value.length > 0 ? Math.round(mySessions.value.reduce((sum, s) => sum + (s.accuracy || 0), 0) / mySessions.value.length) : 0,
  bestScore: mySessions.value.length > 0 ? Math.max(...mySessions.value.map(s => s.total_score)) : 0,
  bestAccuracy: mySessions.value.length > 0 ? Math.max(...mySessions.value.map(s => s.accuracy || 0)) : 0,
}))

const isTechSpec = computed(() => user.value?.role === 'TECHSPEC')

const techStats = computed(() => ({
  ranges: masterStore.ranges.length,
  activeRanges: masterStore.ranges.filter(r => r.status === 'ACTIVE').length,
  rubegs: masterStore.rubegs.length,
  totalLanes: masterStore.rubegs.reduce((s, r) => s + r.lane_count, 0),
  weapons: masterStore.weapons.length,
  availableWeapons: masterStore.weapons.filter(w => w.status === 'AVAILABLE').length,
}))

const roleColor = computed(() => {
  const role = user.value?.role
  if (role === 'MANAGER') return { bg: '#18181b', border: '#ffffff10' }
  if (role === 'INSTRUCTOR') return { bg: '#059669', border: '#10b98130' }
  if (role === 'TECHSPEC') return { bg: '#0891b2', border: '#06b6d430' }
  return { bg: '#18181b', border: '#ffffff10' }
})

const roleLabel = computed(() => {
  if (!user.value?.role) return ''
  return isUz.value ? authStore.roleLabelsUz[user.value.role] : authStore.roleLabels[user.value.role]
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header card -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div class="h-24" style="background: linear-gradient(135deg, #0c0c0d 0%, #1a3a2a 100%);"></div>
      <div class="px-6 pb-6">
        <div class="flex items-end gap-4 -mt-10">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            :style="{ background: roleColor.bg, border: '3px solid white' }">
            {{ userInitials }}
          </div>
          <div class="flex-1 mb-2">
            <h1 class="text-xl font-bold text-gray-900">{{ user?.full_name || '-' }}</h1>
            <div class="flex items-center gap-3 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="user?.role === 'INSTRUCTOR' ? 'bg-emerald-100 text-emerald-700' :
                        user?.role === 'TECHSPEC' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-gray-100 text-gray-600'">
                {{ roleLabel }}
              </span>
              <span v-if="employeeRecord?.rank" class="text-xs text-gray-500">{{ employeeRecord.rank }}</span>
              <span v-if="employeeRecord?.department" class="text-xs text-gray-400">· {{ employeeRecord.department }}</span>
            </div>
          </div>
        </div>

        <!-- Contact info -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-gray-400 shrink-0" />
            <div class="min-w-0">
              <p class="text-[10px] text-gray-400">Email</p>
              <p class="text-xs font-medium text-gray-700 truncate">{{ user?.email || '-' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-gray-400 shrink-0" />
            <div class="min-w-0">
              <p class="text-[10px] text-gray-400">{{ isUz ? "Telefon" : "Телефон" }}</p>
              <p class="text-xs font-medium text-gray-700">{{ employeeRecord?.phone || user?.phone || '-' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
            <div class="min-w-0">
              <p class="text-[10px] text-gray-400">{{ isUz ? "Qoshilgan" : "Дата вступления" }}</p>
              <p class="text-xs font-medium text-gray-700">{{ employeeRecord?.hire_date ? new Date(employeeRecord.hire_date).toLocaleDateString('ru-RU') : '-' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4 text-gray-400 shrink-0" />
            <div class="min-w-0">
              <p class="text-[10px] text-gray-400">{{ isUz ? "Holat" : "Статус" }}</p>
              <p class="text-xs font-medium text-emerald-600">{{ employeeRecord?.status === 'ACTIVE' || isTechSpec ? (isUz ? "Faol" : "Активен") : '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TechSpec Stats -->
    <div v-if="isTechSpec" class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Crosshair class="w-5 h-5 text-cyan-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ techStats.ranges }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Tirlar" : "Тиры" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Activity class="w-5 h-5 text-green-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ techStats.activeRanges }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Faol tirlar" : "Активных тиров" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Route class="w-5 h-5 text-blue-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ techStats.rubegs }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Rubeglar" : "Рубежи" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Target class="w-5 h-5 text-purple-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ techStats.totalLanes }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Yoliqlar" : "Дорожек" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Shield class="w-5 h-5 text-amber-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ techStats.weapons }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Qurollar" : "Оружие" }}</p>
        </div>
      </div>

      <!-- Infrastructure summary -->
      <div class="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 class="text-sm font-bold text-gray-900 mb-4">{{ isUz ? "Infrastruktura holati" : "Состояние инфраструктуры" }}</h2>
        <div class="space-y-3">
          <div v-for="range in masterStore.ranges" :key="range.id" class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div class="flex items-center gap-3">
              <Crosshair class="w-4 h-4 text-gray-400" />
              <div>
                <p class="text-sm font-bold text-gray-800">{{ range.name }}</p>
                <p class="text-[10px] text-gray-400 font-mono">{{ range.code }} · {{ range.ip_prefix }}.x</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="range.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ range.status === 'ACTIVE' ? (isUz ? 'Faol' : 'Активен') : (isUz ? 'Faolsiz' : 'Неактивен') }}
              </span>
              <span class="text-xs text-gray-500">{{ range.total_rubegs }} {{ isUz ? 'rubeg' : 'руб.' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shooting Stats (for non-techspec) -->
    <template v-if="!isTechSpec">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Activity class="w-5 h-5 text-brand-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalSessions }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Sessiyalar" : "Сессий" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Target class="w-5 h-5 text-blue-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalShots }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Oqlar" : "Выстрелов" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Award class="w-5 h-5 text-amber-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.avgScore }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Ortacha ball" : "Ср. балл" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <TrendingUp class="w-5 h-5 text-emerald-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.avgAccuracy }}%</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Ortacha aniqlik" : "Ср. точность" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Award class="w-5 h-5 text-purple-500 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.bestScore }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Eng yaxshi ball" : "Лучший балл" }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <Target class="w-5 h-5 text-brand-600 mb-2" />
          <p class="text-2xl font-bold text-gray-900">{{ stats.bestAccuracy }}%</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Eng yaxshi aniqlik" : "Лучшая точность" }}</p>
        </div>
      </div>

      <!-- Qualification -->
      <div v-if="employeeRecord" class="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 class="text-sm font-bold text-gray-900 mb-4">{{ isUz ? "Malaka darajasi" : "Квалификация" }}</h2>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium"
                :class="employeeRecord.qualification_level === 'EXPERT' ? 'bg-purple-100 text-purple-700' :
                       employeeRecord.qualification_level === 'ADVANCED' ? 'bg-brand-100 text-brand-700' :
                       employeeRecord.qualification_level === 'INTERMEDIATE' ? 'bg-blue-100 text-blue-700' :
                       'bg-gray-100 text-gray-600'">
                {{ employeeRecord.qualification_level === 'EXPERT' ? (isUz ? 'Ekspert' : 'Эксперт') :
                   employeeRecord.qualification_level === 'ADVANCED' ? (isUz ? 'Ilgor' : 'Продвинутый') :
                   employeeRecord.qualification_level === 'INTERMEDIATE' ? (isUz ? 'Ortacha' : 'Средний') :
                   (isUz ? 'Boshlovchi' : 'Новичок') }}
              </span>
              <span v-if="employeeRecord.shooting_qualified" class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                {{ isUz ? "Otishga tayyor" : "Готов к стрельбе" }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-3 mt-3">
              <div>
                <p class="text-[10px] text-gray-400">{{ isUz ? "Sessiyalar" : "Сессий" }}</p>
                <p class="text-sm font-bold text-gray-800">{{ employeeRecord.total_sessions }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">{{ isUz ? "Ballar" : "Баллы" }}</p>
                <p class="text-sm font-bold text-gray-800">{{ employeeRecord.total_score }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">{{ isUz ? "Aniqlik" : "Точность" }}</p>
                <p class="text-sm font-bold text-gray-800">{{ employeeRecord.avg_accuracy }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent sessions -->
      <div v-if="mySessions.length > 0" class="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 class="text-sm font-bold text-gray-900 mb-4">{{ isUz ? "Songgi sessiyalar" : "Недавние сессии" }}</h2>
        <div class="space-y-2">
          <div v-for="s in mySessions.slice(0, 8)" :key="s.id"
            @click="router.push(`/sessions/${s.id}`)"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600 shrink-0">
              L{{ s.lane_number }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-800">{{ s.created_at ? new Date(s.created_at).toLocaleDateString('ru-RU') : '-' }}</p>
              <p class="text-[10px] text-gray-400">{{ s.total_shots }} {{ isUz ? 'oq' : 'выстр.' }} · {{ s.hit_count }} {{ isUz ? "aniq" : "попад." }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-brand-600">{{ s.total_score }}</p>
              <p class="text-[10px] text-gray-400">{{ s.accuracy || 0 }}%</p>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

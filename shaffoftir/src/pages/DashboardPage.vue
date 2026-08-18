<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ArrowUpRight, Users, Target, Bell, ChevronRight, Crosshair, MapPin, Filter, ChevronDown } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useSessionRequestStore } from '@/stores/sessionRequests'
import { useI18n } from '@/i18n'
import { republicRegions } from '@/data/republicData'
import LoadingState from '@/components/ui/LoadingState.vue'
import UzbekistanMap from '@/components/ui/UzbekistanMap.vue'
import NewSessionModal from '@/components/session/NewSessionModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const masterStore = useMasterStore()
const historyStore = useSessionsHistoryStore()
const reqStore = useSessionRequestStore()
const { locale } = useI18n()

const loading = ref(true)
const showNewSession = ref(false)
const isUz = computed(() => locale.value === 'uz')
const isEmployee = computed(() => authStore.user?.role === 'EMPLOYEE')

// --- Filters 
const regionFilter = ref('')
const districtFilter = ref('')
const battalionFilter = ref('')

const regions = computed(() => {
  const set = new Set(masterStore.employees.map(e => e.region || '').filter(Boolean))
  return Array.from(set)
})
const districts = computed(() => {
  const filtered = masterStore.employees.filter(e => !regionFilter.value || e.region === regionFilter.value)
  const set = new Set(filtered.map(e => e.district || '').filter(Boolean))
  return Array.from(set)
})
const battalions = computed(() => {
  const filtered = masterStore.employees.filter(e => !regionFilter.value || e.region === regionFilter.value)
  const set = new Set(filtered.map(e => e.battalion || e.department || '').filter(Boolean))
  return Array.from(set)
})

const filteredEmployees = computed(() => {
  return masterStore.employees.filter(e => {
    if (regionFilter.value && e.region !== regionFilter.value) return false
    if (districtFilter.value && e.district !== districtFilter.value) return false
    if (battalionFilter.value && (e.battalion || e.department) !== battalionFilter.value) return false
    return true
  })
})

function clearFilters() {
  regionFilter.value = ''
  districtFilter.value = ''
  battalionFilter.value = ''
}

const hasFilters = computed(() => regionFilter.value || districtFilter.value || battalionFilter.value)

const stats = computed(() => {
  const empList = filteredEmployees.value
  // Filter sessions by selected employees
  const empIds = new Set(empList.map(e => e.id))
  const empNames = new Set(empList.map(e => e.full_name.split(' ').slice(0, 2).join(' ')))
  const empShortNames = new Set(empList.map(e => {
    const parts = e.full_name.split(' ')
    return parts[0] + ' ' + (parts[1]?.[0] || '') + '.' + (parts[2]?.[0] || '') + '.'
  }))

  const filteredSessions = historyStore.sessions.filter(s => {
    if (hasFilters.value) {
      return empIds.has(s.employee_id) || empNames.has(s.employee_name) || empShortNames.has(s.employee_name)
    }
    return true
  })

  return {
    totalSessions: filteredSessions.length,
    completedSessions: filteredSessions.filter(s => s.status === 'COMPLETED').length,
    activeSessions: filteredSessions.filter(s => s.status === 'PENDING').length,
    pendingRequests: reqStore.pendingCount,
    totalShots: filteredSessions.reduce((sum, s) => sum + s.total_shots, 0),
    accuracy: filteredSessions.length > 0 ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / filteredSessions.length) : 0,
    totalEmployees: empList.length,
    qualifiedEmployees: empList.filter(e => e.shooting_qualified).length,
    passRate: filteredSessions.length > 0 ? Math.round(filteredSessions.filter(s => s.accuracy >= 60).length / filteredSessions.length * 100) : 0,
  }
})

// --- Regional breakdown 
const regionalStats = computed(() => {
  const byRegion = new Map<string, { count: number; sessions: number; avgAccuracy: number; qualified: number }>()
  masterStore.employees.forEach(e => {
    const region = e.region || (isUz.value ? "Noma'lum" : 'Неизвестно')
    if (!byRegion.has(region)) byRegion.set(region, { count: 0, sessions: 0, avgAccuracy: 0, qualified: 0 })
    const stat = byRegion.get(region)!
    stat.count++
    stat.sessions += e.total_sessions
    stat.avgAccuracy += e.avg_accuracy
    if (e.shooting_qualified) stat.qualified++
  })
  return Array.from(byRegion.entries()).map(([region, stat]) => ({
    region,
    count: stat.count,
    sessions: stat.sessions,
    avgAccuracy: stat.count > 0 ? Math.round(stat.avgAccuracy / stat.count) : 0,
    qualified: stat.qualified,
  })).sort((a, b) => b.count - a.count)
})

// Bar chart by weekday
const weekDays = computed(() => {
  const days = isUz.value
    ? ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const values = [8, 14, 11, 19, 16, 7, 3]
  const maxVal = Math.max(...values)
  return days.map((d, i) => ({ label: d, value: values[i], pct: Math.round((values[i] / maxVal) * 100), isToday: i === 3 }))
})

const _dashboardVersion = '2.1.0'
const topRegions = computed(() => {
  return [...republicRegions].sort((a, b) => b.avgScore - a.avgScore).slice(0, 8)
})

const topPerformers = computed(() => historyStore.topPerformers)
const recentSessions = computed(() => historyStore.sessions.slice(0, 5))
const activeLanes = computed(() => masterStore.lanes.filter(l => l.status === 'OCCUPIED').slice(0, 2))

function handleSessionCreated(sessionId: string) {
  showNewSession.value = false
  router.push(`/sessions/${sessionId}`)
}

function onRegionSelect(regionId: string) {
  router.push({ path: '/analytics', query: { region: regionId } })
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5 animate-fade-in">
    <!-- Page Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
          {{ isUz ? "Boshqaruv paneli" : "Панель управления" }}
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ isUz ? "Otish mashg'ulotlarini rejalashtiring va nazorat qiling." : "Планируйте и контролируйте огневую подготовку." }}
        </p>
      </div>
      <div class="flex items-center gap-2" v-if="!isEmployee">
        <button @click="showNewSession = true"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a5c3a] text-white text-sm font-medium hover:bg-[#145030] transition shadow-sm">
          <Plus class="w-4 h-4" /> {{ isUz ? "Yangi sessiya" : "Новая сессия" }}
        </button>
        <button @click="router.push('/reports')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
          {{ isUz ? "Hisobot" : "Отчёт" }}
        </button>
      </div>
    </div>

    <!-- Filters bar -->
    <div v-if="!isEmployee" class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <Filter class="w-3.5 h-3.5 text-gray-400" />
        <span class="text-xs font-medium text-gray-500">{{ isUz ? "Filtr:" : "Фильтр:" }}</span>
      </div>
      <select v-model="regionFilter" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-brand-400 bg-white">
        <option value="">{{ isUz ? "Barcha viloyatlar" : "Все регионы" }}</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
      <select v-model="districtFilter" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-brand-400 bg-white">
        <option value="">{{ isUz ? "Barcha tumanlar" : "Все районы" }}</option>
        <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
      </select>
      <select v-model="battalionFilter" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-brand-400 bg-white">
        <option value="">{{ isUz ? "Barcha bo\u02bblinmalar" : "Все подразделения" }}</option>
        <option v-for="b in battalions" :key="b" :value="b">{{ b }}</option>
      </select>
      <button v-if="hasFilters" @click="clearFilters" class="text-xs text-red-500 hover:text-red-600 font-medium">{{ isUz ? "Tozalash" : "Сбросить" }}</button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style="background: linear-gradient(135deg, #1a5c3a, #145030);" @click="router.push('/sessions')">
        <div class="flex items-start justify-between mb-4">
          <p class="text-sm text-emerald-200/80">{{ isUz ? "Jami sessiyalar" : "Всего сессий" }}</p>
          <ArrowUpRight class="w-3.5 h-3.5 text-white" />
        </div>
        <p class="text-4xl font-bold text-white mb-3">{{ stats.totalSessions }}</p>
        <div class="flex items-center gap-1 text-emerald-300 text-xs">
          <ArrowUpRight class="w-3.5 h-3.5" />
          <span>{{ isUz ? "Oʻtgan oydan +12%" : "+12% к прошлому месяцу" }}</span>
        </div>
      </div>

      <div class="rounded-2xl p-5 bg-white border border-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-gray-200" @click="router.push('/sessions')">
        <div class="flex items-start justify-between mb-4">
          <p class="text-sm text-gray-400">{{ isUz ? "Tugatilgan" : "Завершённые" }}</p>
          <ArrowUpRight class="w-3.5 h-3.5 text-gray-500" />
        </div>
        <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.completedSessions }}</p>
        <div class="flex items-center gap-1 text-emerald-600 text-xs">
          <ArrowUpRight class="w-3.5 h-3.5" />
          <span>{{ isUz ? "O'sdi" : "Рост" }}</span>
        </div>
      </div>

      <div class="rounded-2xl p-5 bg-white border border-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-gray-200" @click="router.push('/hr/employees')">
        <div class="flex items-start justify-between mb-4">
          <p class="text-sm text-gray-400">{{ isUz ? "Xodimlar" : "Сотрудники" }}</p>
          <ArrowUpRight class="w-3.5 h-3.5 text-gray-500" />
        </div>
        <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.totalEmployees }}</p>
        <div class="flex items-center gap-1 text-emerald-600 text-xs">
          <ArrowUpRight class="w-3.5 h-3.5" />
          <span>{{ stats.qualifiedEmployees }} {{ isUz ? "malakali" : "квалифицированных" }}</span>
        </div>
      </div>

      <div class="rounded-2xl p-5 bg-white border border-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-gray-200" @click="router.push('/sessions')">
        <div class="flex items-start justify-between mb-4">
          <p class="text-sm text-gray-400">{{ isUz ? "Kutilayotgan" : "В ожидании" }}</p>
          <ArrowUpRight class="w-3.5 h-3.5 text-gray-500" />
        </div>
        <p class="text-4xl font-bold text-gray-900 mb-3">{{ stats.pendingRequests }}</p>
        <div class="flex items-center gap-1 text-amber-500 text-xs">
          <Bell class="w-3.5 h-3.5" />
          <span>{{ isUz ? "Koʻrib chiqilmoqda" : "На рассмотрении" }}</span>
        </div>
      </div>
    </div>

    <!-- Regional map + top regions -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4" v-if="!isEmployee">
      <!-- Compact map (3/5 width on desktop) -->
      <div class="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-[#1a5c3a]" />
            <h2 class="font-semibold text-gray-900 text-sm">{{ isUz ? "Respublika xaritasi" : "Карта Республики" }}</h2>
          </div>
          <button @click="router.push('/analytics')" class="text-xs text-[#1a5c3a] hover:underline font-medium">
            {{ isUz ? "Batafsil →" : "Подробнее →" }}
          </button>
        </div>
        <div class="aspect-[5/3] w-full">
          <UzbekistanMap @select="onRegionSelect"
          compact /> />
        </div>
      </div>
      <!-- Top regions list (2/5 width on desktop) -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-2 mb-3">
          <Target class="w-4 h-4 text-[#1a5c3a]" />
          <h2 class="font-semibold text-gray-900 text-sm">{{ isUz ? "Top viloyatlar" : "Топ регионов" }}</h2>
        </div>
        <div class="space-y-2">
          <div v-for="r in topRegions" :key="r.id" class="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" @click="router.push('/analytics')">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="r.avgScore >= 70 ? 'bg-green-500' : r.avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ isUz ? r.short_uz : r.short_ru }}</p>
            </div>
            <p class="text-sm font-bold flex-shrink-0" :class="r.avgScore >= 70 ? 'text-green-600' : r.avgScore >= 60 ? 'text-amber-600' : 'text-red-600'">{{ r.avgScore }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Stats row: Bar chart + Regional breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Bar Chart -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-gray-900 text-sm">{{ isUz ? "Haftalik sessiyalar" : "Сессии по дням" }}</h2>
          <span class="text-[10px] text-gray-400">{{ isUz ? "Ushbu hafta" : "Эта неделя" }}</span>
        </div>
        <div class="flex items-end gap-3 h-44 mb-3">
          <div v-for="d in weekDays" :key="d.label" class="flex flex-col items-center gap-1.5 flex-1">
            <span class="text-[10px] font-semibold" :class="d.isToday ? 'text-[#1a5c3a]' : 'text-gray-400'">{{ d.value }}</span>
            <div class="w-full rounded-t-lg relative overflow-hidden transition-all duration-500"
              :style="{ height: d.pct + '%', minHeight: '8px', background: d.isToday ? '#1a5c3a' : '#e8f5ee' }">
              <div v-if="!d.isToday" class="absolute inset-0"
                style="background: repeating-linear-gradient(135deg, #d1eedd 0px, #d1eedd 3px, transparent 3px, transparent 7px); animation: barRise 0.6s ease-out"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-between px-0.5">
          <span v-for="d in weekDays" :key="d.label"
            class="flex-1 text-center text-[10px]"
            :class="d.isToday ? 'text-[#1a5c3a] font-semibold' : 'text-gray-400'">{{ d.label }}</span>
        </div>
      </div>

      <!-- Regional breakdown -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <MapPin class="w-4 h-4 text-gray-400" />
          <h2 class="font-semibold text-gray-900 text-sm">{{ isUz ? "Viloyatlar boʻyicha" : "По регионам" }}</h2>
        </div>
        <div class="space-y-2.5">
          <div v-for="r in regionalStats" :key="r.region" class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ r.region }}</p>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div class="h-full rounded-full bg-brand-500" :style="{ width: Math.round(r.count / masterStore.employees.length * 100) + '%' }"></div>
                </div>
                <span class="text-[10px] text-gray-400 shrink-0">{{ r.count }} {{ isUz ? "kishi" : "чел." }}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-bold text-gray-800">{{ r.avgAccuracy }}%</p>
              <p class="text-[9px] text-gray-400">{{ r.qualified }}/{{ r.count }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <Target class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.accuracy }}%</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Oʻrtacha aniqlik" : "Средняя точность" }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Crosshair class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalShots }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Jami oʻq otish" : "Всего выстрелов" }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Users class="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.passRate }}%</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Oʻtish foizi" : "Процент сдачи" }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
          <Crosshair class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.qualifiedEmployees }}/{{ stats.totalEmployees }}</p>
          <p class="text-[10px] text-gray-400">{{ isUz ? "Malakali xodimlar" : "Квалифицированы" }}</p>
        </div>
      </div>
    </div>

    <!-- Top performers + Recent -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top performers -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 class="font-semibold text-gray-900 text-sm mb-4">{{ isUz ? "Eng yaxshi otishlar" : "Топ стрелков" }}</h2>
        <div class="space-y-2">
          <div v-for="(p, i) in topPerformers" :key="i" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer" @click="router.push(`/results/${p.employee_id}`)">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              :class="i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-800 truncate">{{ p.employee_name }}</p>
              <p class="text-[10px] text-gray-400">{{ p.department || '-' }} · {{ p.session_count }} {{ isUz ? "sessiya" : "сессий" }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-brand-600">{{ p.avg_accuracy }}%</p>
              <p class="text-[10px] text-gray-400">{{ p.total_score }} {{ isUz ? "ball" : "балл" }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent sessions -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 class="font-semibold text-gray-900 text-sm mb-4">{{ isUz ? "Soʻnggi sessiyalar" : "Недавние сессии" }}</h2>
        <div class="space-y-2">
          <div v-for="s in recentSessions" :key="s.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer" @click="router.push(`/sessions/${s.id}`)">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {{ s.employee_name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-800 truncate">{{ s.employee_name }}</p>
              <p class="text-[10px] text-gray-400">L{{ s.lane_number }} · {{ s.total_shots }} {{ isUz ? 'o' + '\u02bb' + 'q' : 'выстр.' }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-gray-800">{{ s.total_score }}</p>
              <p class="text-[10px] text-gray-400">{{ s.accuracy || 0 }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Session Modal -->
    <NewSessionModal :show="showNewSession" @close="showNewSession = false" @created="handleSessionCreated" />
  </div>
</template>

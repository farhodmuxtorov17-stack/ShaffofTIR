<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { TrendingUp, Target, Users, Award, BarChart3, Activity, Crosshair, CheckCircle2, MapPin } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { republicRegions } from '@/data/republicData'

const loading = ref(false)
const router = useRouter()
const route = useRoute()
const historyStore = useSessionsHistoryStore()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const selectedRegionId = computed(() => (route.query.region as string) || '')
const selectedRegionName = computed(() => {
  const id = selectedRegionId.value
  if (!id) return ''
  const r = republicRegions.find(x => x.id === id)
  return r ? (isUz.value ? r.name_uz : r.name_ru) : id
})

const maxScore = computed(() => Math.max(...historyStore.monthlyTrends.map((d: any) => (d as any).avg_score || (d as any).score || 0), 1))

const topEmployees = computed(() => historyStore.topPerformers)

const weaponDist = computed(() => {
  const dist = historyStore.weaponDistribution
  const colors = ['#16a34a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
  return dist.map((d, i) => ({ ...d, color: colors[i % colors.length] }))
})

const maxWeapon = computed(() => Math.max(...weaponDist.value.map(d => d.value), 1))

const qualificationDist = computed(() => {
  const levels = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 }
  masterStore.employees.forEach(e => {
    if (e.qualification_level) levels[e.qualification_level]++
  })
  return [
    { label: isUz.value ? 'Boshlovchi' : 'Начальный', value: levels.BEGINNER, color: '#94a3b8' },
    { label: isUz.value ? "Oʻrta" : 'Средний', value: levels.INTERMEDIATE, color: '#3b82f6' },
    { label: isUz.value ? 'Yuqori' : 'Продвинутый', value: levels.ADVANCED, color: '#8b5cf6' },
    { label: isUz.value ? 'Ekspert' : 'Эксперт', value: levels.EXPERT, color: '#16a34a' },
  ]
})

const qualTotal = computed(() => qualificationDist.value.reduce((s, d) => s + d.value, 0))

const donutSegments = computed(() => {
  const total = qualTotal.value || 1
  let offset = 0
  return qualificationDist.value.map(d => {
    const percent = (d.value / total) * 100
    const seg = { ...d, percent, offset }
    offset += percent
    return seg
  })
})

// Regional breakdown
const regionalStats = computed(() => {
  const byRegion = new Map<string, { count: number; sessions: number; avgAccuracy: number; qualified: number }>()
  masterStore.employees.forEach(e => {
    const region = e.region || 'Неизвестно'
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
  })).sort((a, b) => b.avgAccuracy - a.avgAccuracy)
})

// Accuracy distribution
const accuracyBuckets = computed(() => {
  const buckets = [
    { label: isUz.value ? '0-40%' : '0-40%', count: 0, color: '#ef4444' },
    { label: isUz.value ? '40-60%' : '40-60%', count: 0, color: '#f59e0b' },
    { label: isUz.value ? '60-75%' : '60-75%', count: 0, color: '#eab308' },
    { label: isUz.value ? '75-90%' : '75-90%', count: 0, color: '#22c55e' },
    { label: isUz.value ? '90-100%' : '90-100%', count: 0, color: '#16a34a' },
  ]
  historyStore.sessions.forEach(s => {
    const a = s.accuracy || 0
    if (a < 40) buckets[0].count++
    else if (a < 60) buckets[1].count++
    else if (a < 75) buckets[2].count++
    else if (a < 90) buckets[3].count++
    else buckets[4].count++
  })
  return buckets
})
const maxBucket = computed(() => Math.max(...accuracyBuckets.value.map(b => b.count), 1))

</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">{{ isUz ? "Analitika" : "Аналитика" }}</h1>
      <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Umumiy statistika va trendlar" : "Сводная аналитика и тренды" }}</p>
    </div>

    <!-- Selected region banner -->
    <div v-if="selectedRegionId" class="rounded-2xl p-4 bg-gradient-to-r from-[#1a5c3a] to-[#145030] text-white flex items-center justify-between">
      <div class="flex items-center gap-2">
        <MapPin class="w-4 h-4" />
        <span class="text-sm font-medium">{{ isUz ? 'Tanlangan viloyat' : 'Выбранный регион' }}: <b>{{ selectedRegionName || selectedRegionId }}</b></span>
      </div>
      <button @click="router.push('/dashboard')" class="text-xs text-emerald-200 hover:text-white">{{ isUz ? '← Boshqaruv paneli' : '← На панель' }}</button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami sessiya' : 'Сессий всего'" :value="historyStore.totalSessions" :icon="Activity" accent="brand" @click="router.push('/sessions')" style="cursor: pointer;" />
      <KPICard :title="isUz ? 'O\'rtacha aniqlik' : 'Средняя точность'" :value="historyStore.avgAccuracy + '%'" :icon="Target" accent="blue" @click="router.push('/results')" style="cursor: pointer;" />
      <KPICard :title="isUz ? 'O\'rtacha ball' : 'Средний балл'" :value="historyStore.avgScore" :icon="BarChart3" accent="purple" @click="router.push('/reports')" style="cursor: pointer;" />
      <KPICard :title="isUz ? 'O\'tish foizi' : 'Процент сдачи'" :value="historyStore.passRate + '%'" :icon="CheckCircle2" accent="amber" @click="router.push('/results')" style="cursor: pointer;" />
    </div>

    <!-- Trend Chart -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Oylik dinamika" : "Динамика по месяцам" }}</h2>
        </div>
      </div>
      <div class="flex items-end justify-between gap-3 h-48 relative">
        <!-- Grid lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div class="h-px bg-gray-50"></div>
          <div class="h-px bg-gray-50"></div>
          <div class="h-px bg-gray-50"></div>
          <div class="h-px bg-gray-50"></div>
        </div>
        <div v-for="(d, i) in historyStore.monthlyTrends" :key="i" class="flex-1 flex flex-col items-center gap-2 relative group">
          <div class="relative w-full flex items-end justify-center" style="height: 170px;">
            <div class="chart-bar-3d w-full max-w-[42px] rounded-t-lg transition-all duration-500 cursor-pointer"
              :style="{
                height: ((d.avg_score / maxScore) * 100) + '%',
                background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`,
                boxShadow: '0 10px 24px -5px rgba(34,197,94,0.4), inset 0 1px 0 0 rgba(255,255,255,0.25)',
              }">
              <div class="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-white/40"></div>
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                {{ d.avg_score }} ball · {{ d.session_count }} sessiya
              </div>
            </div>
          </div>
          <span class="text-[10px] text-gray-500 font-medium">{{ isUz ? d.label : d.label }}</span>
        </div>
      </div>
    </div>

    <!-- Two column: Top performers + Qualification donut -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Top performers -->
      <div class="card p-6">
        <div class="flex items-center gap-2 mb-4">
          <Award class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Top otishlar" : "Топ стрелков" }}</h2>
        </div>
        <div class="space-y-2">
          <div v-for="(emp, idx) in topEmployees" :key="emp.employee_id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              :class="idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'"
              style="box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.5);">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ emp.employee_name }}</p>
              <p class="text-xs text-gray-400">{{ emp.rank }} · {{ emp.session_count }} {{ isUz ? "sessiya" : "сессий" }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-brand-600">{{ emp.total_score }}</p>
              <p class="text-xs text-gray-400">{{ emp.avg_accuracy }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Qualification donut -->
      <div class="card p-6">
        <div class="flex items-center gap-2 mb-5">
          <Users class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Malaka darajasi" : "Квалификация" }}</h2>
        </div>
        <div class="flex flex-col items-center gap-5">
          <div class="relative" style="filter: drop-shadow(0 10px 15px rgba(0,0,0,0.08));">
            <svg viewBox="0 0 100 100" class="w-40 h-40 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="12" />
              <circle v-for="(seg, i) in donutSegments" :key="i"
                cx="50" cy="50" r="40" fill="none"
                :stroke="seg.color" stroke-width="12"
                stroke-dasharray="251.2"
                :stroke-dashoffset="251.2 - (seg.percent / 100) * 251.2"
                class="transition-all duration-1000"
                style="stroke-linecap: round;" />
              <text x="50" y="46" text-anchor="middle" dy=".3em" font-size="14" font-weight="bold" fill="#1f2937" class="rotate-90" transform-origin="50 50">{{ qualTotal }}</text>
              <text x="50" y="60" text-anchor="middle" dy=".3em" font-size="5" fill="#9ca3af" class="rotate-90" transform-origin="50 50">{{ isUz ? "Xodimlar" : "Сотрудников" }}</text>
            </svg>
          </div>
          <div class="w-full space-y-2">
            <div v-for="(d, i) in qualificationDist" :key="i" class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-md" :style="{ background: d.color, boxShadow: `0 2px 4px ${d.color}44` }"></span>
              <span class="text-xs text-gray-600 flex-1 font-medium">{{ d.label }}</span>
              <span class="text-xs font-bold text-gray-800">{{ d.value }}</span>
              <span class="text-[10px] text-gray-400">({{ qualTotal > 0 ? Math.round(d.value / qualTotal * 100) : 0 }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weapon distribution -->
    <div class="card p-6">
      <div class="flex items-center gap-2 mb-5">
        <Crosshair class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Qurol ishlatilishi" : "Использование оружия" }}</h2>
      </div>
      <div class="space-y-4">
        <div v-for="(w, i) in weaponDist" :key="i" class="group">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-medium text-gray-600">{{ w.label }}</span>
            <span class="text-xs font-bold text-gray-800">{{ w.value }} {{ isUz ? "sessiya" : "сессий" }}</span>
          </div>
          <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 relative"
              :style="{
                width: (w.value / maxWeapon * 100) + '%',
                background: `linear-gradient(90deg, ${w.color} 0%, ${w.color}cc 100%)`,
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.3)',
              }">
              <div class="absolute inset-x-0 top-0 h-0.5 rounded-full bg-white/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Regional breakdown table -->
    <div class="card p-0 overflow-hidden">
      <div class="p-5 pb-3">
        <div class="flex items-center gap-2">
          <MapPin class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Viloyatlar boʻyicha tahlil" : "Анализ по регионам" }}</h2>
        </div>
      </div>
      <table class="premium-table">
        <thead>
          <tr>
            <th>{{ isUz ? "Viloyat" : "Регион" }}</th>
            <th>{{ isUz ? "Xodimlar" : "Сотрудников" }}</th>
            <th>{{ isUz ? "Sessiyalar" : "Сессий" }}</th>
            <th>{{ isUz ? "Oʻrtacha aniqlik" : "Ср. точность" }}</th>
            <th>{{ isUz ? "Malakali" : "Квалиф." }}</th>
            <th>{{ isUz ? "Daraja" : "Уровень" }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in regionalStats" :key="r.region" class="cursor-pointer hover:bg-gray-50" @click="router.push('/hr/employees')">
            <td class="text-sm font-bold text-gray-800">{{ r.region }}</td>
            <td class="text-sm text-gray-600">{{ r.count }}</td>
            <td class="text-sm text-gray-600">{{ r.sessions }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div class="h-full rounded-full" :class="r.avgAccuracy >= 70 ? 'bg-brand-500' : r.avgAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-400'" :style="`width: ${r.avgAccuracy}%`"></div>
                </div>
                <span class="text-xs font-bold" :class="r.avgAccuracy >= 70 ? 'text-brand-600' : r.avgAccuracy >= 60 ? 'text-amber-600' : 'text-red-500'">{{ r.avgAccuracy }}%</span>
              </div>
            </td>
            <td class="text-sm text-gray-600">{{ r.qualified }}/{{ r.count }}</td>
            <td>
              <span class="badge" :class="r.avgAccuracy >= 70 ? 'badge-success' : r.avgAccuracy >= 60 ? 'badge-warning' : 'badge-error'">
                {{ r.avgAccuracy >= 70 ? (isUz ? 'Yuqori' : 'Высокий') : r.avgAccuracy >= 60 ? (isUz ? "O'rta" : 'Средний') : (isUz ? 'Past' : 'Низкий') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Accuracy distribution histogram -->
    <div class="card p-6">
      <div class="flex items-center gap-2 mb-5">
        <BarChart3 class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Aniqlik taqsimoti" : "Распределение точности" }}</h2>
      </div>
      <div class="flex items-end justify-between gap-4 h-40">
        <div v-for="(b, i) in accuracyBuckets" :key="i" class="flex-1 flex flex-col items-center gap-2">
          <span class="text-xs font-bold text-gray-700">{{ b.count }}</span>
          <div class="w-full rounded-t-lg transition-all duration-500" :style="{ height: Math.max((b.count / maxBucket) * 100, 3) + '%', background: `linear-gradient(180deg, ${b.color} 0%, ${b.color}cc 100%)` }"></div>
          <span class="text-[10px] text-gray-500 font-medium">{{ b.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Crosshair, Target, TrendingUp, Award, Calendar, User, Radio } from 'lucide-vue-next'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useSessionStore } from '@/stores/session'
import KPICard from '@/components/ui/KPICard.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const sessionStore = useSessionStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const resultId = computed(() => route.params.id as string)

// Try history store first, then current session
const record = computed(() => {
  const histRecord = historyStore.getSession(resultId.value)
  if (histRecord) return histRecord

  // Check if it's the current session
  if (sessionStore.currentSession?.id === resultId.value) {
    const allShots = sessionStore.soldiers.flatMap(s => s.shots || [])
    return {
      id: sessionStore.currentSession.id,
      created_at: sessionStore.currentSession.created_at,
      completed_at: new Date().toISOString(),
      employee_name: sessionStore.sessionMeta.employeeName || '-',
      employee_rank: '',
      weapon_name: '',
      lane_number: sessionStore.sessionMeta.laneNumber || 0,
      status: 'PENDING',
      test_shots: allShots.filter(s => s.shot_type === 'TEST').map(s => ({ x: s.x || 50, y: s.y || 50, score: s.score, shot_type: 'TEST' })),
      main_shots: allShots.filter(s => s.shot_type === 'MAIN').map(s => ({ x: s.x || 50, y: s.y || 50, score: s.score, shot_type: 'MAIN' })),
      total_shots: allShots.length,
      hit_count: allShots.filter(s => s.score > 0).length,
      miss_count: allShots.filter(s => s.score === 0).length,
      total_score: allShots.reduce((sum, s) => sum + s.score, 0),
      accuracy: allShots.length > 0 ? Math.round((allShots.filter(s => s.score > 0).length / allShots.length) * 100) : 0,
      instructor_name: 'Operator',
    }
  }
  return null
})

const allShots = computed(() => {
  if (!record.value) return []
  return [...(record.value.test_shots || []), ...(record.value.main_shots || [])]
})

const accuracy = computed(() => record.value?.accuracy || 0)
const score = computed(() => record.value?.total_score || 0)
const hits = computed(() => record.value?.hit_count || 0)
const totalShots = computed(() => record.value?.total_shots || 0)

// Score distribution
const scoreDistribution = computed(() => {
  const dist: Record<number, number> = { 10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 }
  allShots.value.forEach(s => {
    const sc = Math.floor(s.score)
    if (sc in dist) dist[sc]++
  })
  return Object.entries(dist)
    .filter(([k]) => parseInt(k) > 0)
    .map(([k, v]) => ({ score: parseInt(k), count: v }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.score - a.score)
})

function goBack() {
  router.push('/results')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <button class="btn-ghost flex items-center gap-2 text-xs" @click="goBack">
      <ArrowLeft class="w-4 h-4" /> {{ t('detail.backToResults') }}
    </button>

    <ErrorState v-if="!record" :title="t('detail.resultNotFound')" :message="t('detail.noSessionData')" />

    <template v-else>
      <!-- Header -->
      <div class="card p-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shrink-0"
            style="box-shadow: 0 8px 20px -4px rgba(22,163,74,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2);">
            <Target class="w-7 h-7" />
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">{{ record.employee_name }}</h1>
            <p class="text-sm text-gray-400 mt-1 flex items-center gap-3">
              <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" /> {{ new Date(record.created_at).toLocaleDateString('ru-RU') }}</span>
              <span class="flex items-center gap-1"><Radio class="w-3.5 h-3.5" /> {{ t('detail.lane') }} #{{ record.lane_number }}</span>
              <span v-if="record.weapon_name" class="flex items-center gap-1"><Crosshair class="w-3.5 h-3.5" /> {{ record.weapon_name }}</span>
            </p>
          </div>
        </div>
        <span class="badge"
          :class="record.status === 'COMPLETED' ? 'badge-success' : record.status === 'REVIEWED' ? 'badge-neutral' : 'badge-warning'">
          {{ record.status === 'COMPLETED' ? t('detail.completed') : record.status === 'REVIEWED' ? t('detail.reviewed') : t('detail.pending') }}
        </span>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="t('detail.totalScore')" :value="score" :icon="Award" accent="brand" />
        <KPICard :title="t('detail.accuracy')" :value="accuracy + '%'" :icon="TrendingUp" accent="blue" />
        <KPICard :title="t('detail.hits')" :value="hits + '/' + totalShots" :icon="Crosshair" accent="purple" />
        <KPICard :title="t('detail.misses')" :value="record.miss_count" :icon="Target" accent="red" />
      </div>

      <!-- Target visualization + Shot table -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Target SVG -->
        <div class="card p-6">
          <h2 class="text-sm font-bold text-gray-700 mb-4">{{ t('detail.targetView') }}</h2>
          <div class="flex justify-center">
            <svg viewBox="0 0 100 100" class="w-64 h-64" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1));">
              <!-- Rings -->
              <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#333" stroke-width="1" />
              <circle cx="50" cy="50" r="40" fill="#f8f8f8" stroke="#ddd" stroke-width="0.5" />
              <circle cx="50" cy="50" r="32" fill="#f0f0f0" stroke="#ddd" stroke-width="0.5" />
              <circle cx="50" cy="50" r="24" fill="#e8e8e8" stroke="#ddd" stroke-width="0.5" />
              <circle cx="50" cy="50" r="16" fill="#e0e0e0" stroke="#ddd" stroke-width="0.5" />
              <circle cx="50" cy="50" r="8" fill="#d0d0d0" stroke="#ddd" stroke-width="0.5" />
              <!-- Crosshair -->
              <line x1="50" y1="2" x2="50" y2="98" stroke="#bbb" stroke-width="0.3" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="#bbb" stroke-width="0.3" />
              <!-- Shots -->
              <g v-for="(shot, i) in allShots" :key="i">
                <circle :cx="shot.x" :cy="shot.y" r="1.8" :fill="shot.score >= 8 ? '#16a34a' : shot.score >= 5 ? '#f59e0b' : shot.score > 0 ? '#ef4444' : '#6b7280'"
                  :stroke="shot.score > 0 ? 'white' : '#fff'" stroke-width="0.5" opacity="0.9" />
                <text :x="shot.x + 2.5" :y="shot.y + 0.8" font-size="2.5" fill="#666" font-weight="bold">{{ shot.score }}</text>
              </g>
              <!-- Center -->
              <circle cx="50" cy="50" r="0.5" fill="#333" />
            </svg>
          </div>
          <!-- Score distribution -->
          <div class="mt-5 flex flex-wrap gap-2 justify-center">
            <div v-for="d in scoreDistribution" :key="d.score" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              :class="d.score >= 8 ? 'bg-emerald-50 text-emerald-700' : d.score >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'">
              <span class="text-xs font-bold">{{ d.score }}</span>
              <span class="text-xs text-gray-400">×{{ d.count }}</span>
            </div>
          </div>
        </div>

        <!-- Shot table -->
        <div class="card p-6">
          <h2 class="text-sm font-bold text-gray-700 mb-4">{{ t('detail.shotList') }}</h2>
          <div class="overflow-y-auto max-h-80" style="scrollbar-width: thin;">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ t('detail.type') }}</th>
                  <th>X</th>
                  <th>Y</th>
                  <th>{{ t('detail.score') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shot, i) in allShots" :key="i">
                  <td class="text-xs text-gray-400">{{ i + 1 }}</td>
                  <td>
                    <span class="badge" :class="shot.shot_type === 'TEST' ? 'badge-warning' : 'badge-success'">
                      {{ shot.shot_type === 'TEST' ? t('detail.test') : t('detail.main') }}
                    </span>
                  </td>
                  <td class="text-xs font-mono text-gray-600">{{ shot.x.toFixed(1) }}</td>
                  <td class="text-xs font-mono text-gray-600">{{ shot.y.toFixed(1) }}</td>
                  <td>
                    <span class="text-sm font-bold" :class="shot.score >= 8 ? 'text-emerald-600' : shot.score >= 5 ? 'text-amber-600' : shot.score > 0 ? 'text-red-500' : 'text-gray-400'">
                      {{ shot.score }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

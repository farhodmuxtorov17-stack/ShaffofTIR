<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Users, BarChart3, Target, CheckSquare, RotateCcw
} from 'lucide-vue-next'
import { useSessionStore } from '@/stores/session'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useUiStore } from '@/stores/ui'
import { calculateTotalScore } from '@/api/scoring.api'
import SessionStatusFlow from '@/components/session/SessionStatusFlow.vue'
import ShotTable from '@/components/session/ShotTable.vue'
import TargetViewer from '@/components/target/TargetViewer.vue'
import KPICard from '@/components/ui/KPICard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { resolveImageUrl } from '@/api/imageUrl'
import { useI18n } from '@/i18n'
import { normalizeError } from '@/utils/errorNormalizer'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const historyStore = useSessionsHistoryStore()
const uiStore = useUiStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const sessionId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref<{ title: string; message: string } | null>(null)

// Local session from history store (mock data)
const localSession = computed(() => historyStore.getSession(sessionId.value))
const isLocalSession = computed(() => !!localSession.value)

// For local sessions, build shots from the record
const localShots = computed(() => {
  if (!localSession.value) return []
  return [
    ...localSession.value.test_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score })),
    ...localSession.value.main_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score })),
  ]
})

const localTestScore = computed(() => calculateTotalScore(localSession.value?.test_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score })) || []))
const localMainScore = computed(() => calculateTotalScore(localSession.value?.main_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score })) || []))
const localTotalScore = computed(() => localTestScore.value + localMainScore.value)

// Unified shots for display
const allShots = computed(() => isLocalSession.value ? localShots.value : sessionStore.soldiers.flatMap(s => s.shots || []))
const testShots = computed(() => allShots.value.filter(s => s.shot_type === 'TEST'))
const mainShots = computed(() => allShots.value.filter(s => s.shot_type === 'MAIN'))

const totalScore = computed(() => isLocalSession.value ? localTotalScore.value : calculateTotalScore(allShots.value))
const testScore = computed(() => isLocalSession.value ? localTestScore.value : calculateTotalScore(testShots.value))
const mainScore = computed(() => isLocalSession.value ? localMainScore.value : calculateTotalScore(mainShots.value))

const lastResultImage = computed(() => {
  return sessionStore.lastProcessResult?.result_image_url
    ? resolveImageUrl(sessionStore.lastProcessResult.result_image_url)
    : ''
})

async function loadSession() {
  // First check local history store
  if (localSession.value) {
    return // Use local data, no API call needed
  }

  // Only call API if not found locally
  loading.value = true
  error.value = null
  try {
    await sessionStore.fetchSummary(sessionId.value)
  } catch (err) {
    error.value = normalizeError(err)
  } finally {
    loading.value = false
  }
}

function selectSoldier(seq: number) {
  sessionStore.selectSoldier(seq)
}

async function handleApprove() {
  try {
    sessionStore.moveToReview()
    sessionStore.approveSession()
    uiStore.showToast('success', t('detail.confirmed'), t('detail.sessionApprovedMsg'))
  } catch (err: any) {
    uiStore.showToast('error', t('detail.error'), err.message)
  }
}

function handleReset() {
  if (confirm(t('detail.resetConfirm'))) {
    sessionStore.resetSession()
    router.push('/sessions/new')
  }
}

onMounted(() => {
  if (isLocalSession.value) return // Local data available immediately
  if (sessionStore.currentSession?.id === sessionId.value) return
  loadSession()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/sessions')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            {{ isLocalSession ? localSession?.employee_name : `Sessiya: ${sessionId.substring(0, 12) }...` }}
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isLocalSession ? `${localSession?.lane_number ? 'L' + localSession.lane_number + ' · ' : '' }${localSession?.total_shots || 0 } o'q · ${localSession?.accuracy || 0 }%` : 'Batafsil ma\'lumot' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <StatusBadge v-if="isLocalSession && localSession" :status="localSession.status" />
        <button class="btn-secondary text-xs" @click="handleReset">
          <RotateCcw class="w-3.5 h-3.5" /> {{ t('common.reset') }}
        </button>
        <button v-if="!isLocalSession && sessionStore.sessionStatus === 'MAIN_COMPLETED'" class="btn-primary text-xs" @click="handleApprove">
          <CheckSquare class="w-3.5 h-3.5" /> {{ t('detail.approve') }}
        </button>
      </div>
    </div>

    <LoadingState v-if="loading" :message="t('detail.loadingSession')" />
    <ErrorState v-else-if="error" :title="error.title" :message="error.message" :on-retry="loadSession" />

    <!-- Local session (from history store) -->
    <template v-else-if="isLocalSession && localSession">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="t('detail.shots')" :value="localSession.total_shots" :icon="BarChart3" accent="neutral" />
        <KPICard :title="t('detail.hits')" :value="localSession.hit_count" :icon="Target" accent="brand" />
        <KPICard :title="t('detail.accuracy')" :value="localSession.accuracy + '%'" :icon="CheckSquare" accent="brand" />
        <KPICard :title="t('detail.score')" :value="localSession.total_score" :icon="BarChart3" accent="brand" />
      </div>

      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-4">{{ t('detail.shots') }}</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-xs font-medium text-gray-500 mb-2">Test o'qlari ({{ localSession.test_shots.length }})</h3>
            <ShotTable :shots="localSession.test_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score }))" :show-pagination="false" />
          </div>
          <div>
            <h3 class="text-xs font-medium text-gray-500 mb-2">Asosiy o'qlar ({{ localSession.main_shots.length }})</h3>
            <ShotTable :shots="localSession.main_shots.map((s, i) => ({ id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0, shot_type: s.shot_type, x: s.x, y: s.y, score: s.score }))" :show-pagination="true" :page-size="10" />
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-4">{{ t('detail.targetView') }}</h2>
        <TargetViewer imageUrl="" :shots="allShots" />
      </div>

      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-3">{{ t('detail.sessionData') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-500">t('detail.weapon') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">{{ localSession.weapon_name }}</span>
          </div>
          <div>
            <span class="text-gray-500">t('detail.lane') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">L{{ localSession.lane_number }}</span>
          </div>
          <div>
            <span class="text-gray-500">t('detail.instructor') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">{{ localSession.instructor_name }}</span>
          </div>
          <div>
            <span class="text-gray-500">t('detail.date') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">{{ new Date(localSession.created_at).toLocaleDateString('ru-RU') }}</span>
          </div>
          <div>
            <span class="text-gray-500">t('detail.sessionType') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">{{ localSession.session_type }}</span>
          </div>
          <div v-if="localSession.protocol_id">
            <span class="text-gray-500">t('detail.protocol') + ':'</span>
            <span class="font-medium text-gray-800 ml-2">{{ localSession.protocol_id }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Live session (from session store) -->
    <template v-else-if="sessionStore.currentSession">
      <SessionStatusFlow :current-status="sessionStore.sessionStatus" />

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="t('detail.soldiers')" :value="sessionStore.soldiers.length" :icon="Users" accent="neutral" />
        <KPICard :title="t('detail.test') + ' ' + t('detail.score')" :value="testScore" :icon="BarChart3" accent="neutral" />
        <KPICard :title="t('detail.main') + ' ' + t('detail.score')" :value="mainScore" :icon="Target" accent="brand" />
        <KPICard :title="t('detail.totalScore')" :value="totalScore" :icon="CheckSquare" accent="brand" />
      </div>

      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-4">{{ t('detail.soldierList') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          <button
            v-for="soldier in sessionStore.soldiers"
            :key="soldier.id"
            class="border rounded-btn p-3 text-center transition cursor-pointer"
            :class="sessionStore.currentSoldierSeq === soldier.sequence_number
              ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
              : 'border-shell-border hover:border-gray-300 bg-white'"
            @click="selectSoldier(soldier.sequence_number)"
          >
            <div class="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm mb-2"
              :class="sessionStore.currentSoldierSeq === soldier.sequence_number
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600'"
            >
              {{ soldier.sequence_number }}
            </div>
            <p class="text-xs text-gray-500">{{ soldier.shots?.length || 0 }} {{ t('detail.shotsCount') }}</p>
            <StatusBadge :status="soldier.status" />
          </button>
        </div>
      </div>

      <div v-if="lastResultImage" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 class="text-sm font-bold text-gray-700 mb-3">{{ t('detail.resultImage') }}</h2>
          <TargetViewer :image-url="lastResultImage" :shots="allShots" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-700 mb-3">{{ t('detail.shotTable') }}</h2>
          <ShotTable :shots="allShots" :show-pagination="true" :page-size="10" />
        </div>
      </div>
    </template>

    <div v-else>
      <ErrorState :title="t('detail.sessionNotFound')" :message="t('detail.sessionNoData')" />
    </div>
  </div>
</template>

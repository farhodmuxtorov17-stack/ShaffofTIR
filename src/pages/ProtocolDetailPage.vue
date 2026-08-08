<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer, CheckCircle } from 'lucide-vue-next'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useSessionStore } from '@/stores/session'
import { calculateTotalScore, separateShotsByType } from '@/api/scoring.api'
import ShotTable from '@/components/session/ShotTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const sessionStore = useSessionStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const protocolId = computed(() => route.params.id as string)

// Try history store first (for local/mock protocols)
const protocol = computed(() => historyStore.getProtocol(protocolId.value))
const session = computed(() => protocol.value ? historyStore.getSession(protocol.value.session_id) : null)

// Fallback to live session store
const liveSoldier = computed(() => {
  if (protocol.value) return null
  return sessionStore.soldiers.find(s => String(s.sequence_number) === protocolId.value)
})

const isLocal = computed(() => !!protocol.value)

// Build shots
const shots = computed(() => {
  if (protocol.value && session.value) {
    return [
      ...session.value.test_shots.map((s, i) => ({ ...s, id: i + 1, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0 })),
      ...session.value.main_shots.map((s, i) => ({ ...s, id: i + 100, soldier_id: 0, shot_number: i + 1, is_hit: s.score > 0 })),
    ]
  }
  return liveSoldier.value?.shots || []
})

const separated = computed(() => separateShotsByType(shots.value))
const totalScore = computed(() => isLocal.value ? (protocol.value?.total_score || 0) : calculateTotalScore(shots.value))
const testScore = computed(() => calculateTotalScore(separated.value.test))
const mainScore = computed(() => calculateTotalScore(separated.value.main))
const accuracy = computed(() => isLocal.value ? (protocol.value?.accuracy || 0) : 0)
const hitCount = computed(() => isLocal.value ? (protocol.value?.hit_count || 0) : 0)
const missCount = computed(() => isLocal.value ? (protocol.value?.miss_count || 0) : 0)
const totalShots = computed(() => isLocal.value ? (protocol.value?.total_shots || 0) : shots.value.length)

function printProtocol() {
  window.print()
}

function handleSign() {
  if (protocol.value) {
    historyStore.signProtocol(protocol.value.id)
  }
}

function handleApprove() {
  if (protocol.value) {
    historyStore.approveProtocol(protocol.value.id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/protocols')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            {{ isLocal ? `${t('detail.protocol')} ${protocol?.protocol_number}` : `${t('detail.protocol')}: Askar №${protocolId}` }}
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isLocal ? protocol?.employee_name : t('detail.sessionInfo') }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <StatusBadge v-if="isLocal && protocol" :status="protocol.status" />
        <button class="btn-primary text-xs" @click="printProtocol">
          <Printer class="w-3.5 h-3.5" /> {{ t('detail.print') }}
        </button>
      </div>
    </div>

    <ErrorState v-if="!isLocal && !liveSoldier" :title="t('detail.protocolNotFound')" :message="t('detail.protocolNoData')" />

    <template v-else>
      <div class="card">
        <div class="text-center mb-6 pb-4 border-b border-shell-border">
          <h2 class="text-lg font-bold text-gray-900">ShaffofTIR - {{ t('detail.protocolTitle') }}</h2>
          <p class="text-xs text-gray-400 mt-1">
            {{ isLocal ? `Сессия: ${protocol?.session_id}` : `Сессия: ${sessionStore.currentSession?.id?.substring(0, 16) }...` }}
          </p>
          <p class="text-xs text-gray-400">
            {{ isLocal && protocol ? new Date(protocol.created_at).toLocaleString('ru-RU') : (sessionStore.currentSession ? new Date(sessionStore.currentSession.created_at).toLocaleString() : '') }}
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div>
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.employee') }}</p>
            <p class="font-medium text-gray-800">{{ isLocal ? protocol?.employee_name : `Боец №${protocolId}` }}</p>
          </div>
          <div v-if="isLocal && protocol">
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.rank') }}</p>
            <p class="font-medium text-gray-800">{{ protocol.employee_rank }}</p>
          </div>
          <div v-if="isLocal && protocol">
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.instructor') }}</p>
            <p class="font-medium text-gray-800">{{ protocol.instructor_name }}</p>
          </div>
          <div v-if="isLocal && protocol">
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.lane') }}</p>
            <p class="font-medium text-gray-800">L{{ protocol.lane_number }}</p>
          </div>
          <div v-if="isLocal && protocol">
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.weapon') }}</p>
            <p class="font-medium text-gray-800">{{ protocol.weapon_name }}</p>
          </div>
          <div v-if="isLocal && protocol">
            <p class="text-xs text-gray-400 uppercase mb-1">{{ t('detail.qualification') }}</p>
            <p class="font-medium" :class="protocol.qualification === 'EXCELLENT' ? 'text-green-600' : protocol.qualification === 'PASSED' ? 'text-blue-600' : 'text-red-600'">
              {{ protocol.qualification }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-gray-800">{{ totalScore }}</p>
            <p class="text-xs text-gray-500">{{ t('detail.totalScore') }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-green-600">{{ hitCount }}</p>
            <p class="text-xs text-gray-500">{{ t('detail.hits') }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-red-500">{{ missCount }}</p>
            <p class="text-xs text-gray-500">{{ t('detail.misses') }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ accuracy }}%</p>
            <p class="text-xs text-gray-500">{{ t('detail.accuracy') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-sm font-bold text-gray-700 mb-2">{{ t('detail.testShots') }}</h3>
            <ShotTable :shots="separated.test" :show-pagination="false" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-700 mb-2">{{ t('detail.mainShots') }}</h3>
            <ShotTable :shots="separated.main" :show-pagination="true" :page-size="10" />
          </div>
        </div>

        <div v-if="isLocal && protocol?.notes" class="mb-6 p-3 bg-yellow-50 rounded-lg">
          <p class="text-sm text-gray-600">{{ protocol.notes }}</p>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-shell-border" v-if="isLocal && protocol">
          <button v-if="protocol.status === 'DRAFT'" class="btn-secondary text-xs" @click="handleSign">
            <CheckCircle class="w-3.5 h-3.5" /> {{ t('detail.sign') }}
          </button>
          <button v-if="protocol.status === 'SIGNED'" class="btn-primary text-xs" @click="handleApprove">
            <CheckCircle class="w-3.5 h-3.5" /> {{ t('detail.approve') }}
          </button>
        </div>

        <div v-if="isLocal && protocol?.qr_code" class="mt-4 text-center">
          <div class="inline-block p-3 bg-white border border-shell-border rounded-lg">
            <p class="text-xs text-gray-400 mb-2">{{ t('detail.qrCode') }}</p>
            <div class="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
              <span class="text-xs font-mono text-gray-400">{{ protocol.qr_code.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

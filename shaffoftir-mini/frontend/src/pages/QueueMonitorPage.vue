<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useQueueSocket } from '@/composables/useQueueSocket'
import type { ShootingQueue, QueueEntry } from '@/types'

const router = useRouter()
const toast = useToast()

const queue = ref<ShootingQueue | null>(null)
const currentEntry = ref<QueueEntry | null>(null)
const waitingEntries = ref<QueueEntry[]>([])
const completedEntries = ref<QueueEntry[]>([])
const loading = ref(false)
const pollingTimer = ref<number | null>(null)
const analysisRunning = ref(false)

const progress = computed(() => {
  if (!queue.value) return 0
  const total = queue.value.total_soldiers || 1
  return Math.round((queue.value.completed_count / total) * 100)
})

async function loadQueueState(queueId: string) {
  try {
    const state: any = await api.get(`/queues/${queueId}/state/`)
    queue.value = state.queue
    currentEntry.value = state.current
    waitingEntries.value = state.waiting || []
    completedEntries.value = state.completed || []
  } catch (e: any) {
    toast.error(e.message || 'Ошибка загрузки очереди')
  }
}

async function activateQueue() {
  if (!queue.value) return
  loading.value = true
  try {
    await api.post(`/queues/${queue.value.id}/activate/`)
    toast.success('Очередь активирована')
    await loadQueueState(queue.value.id)
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

async function completeCurrent() {
  if (!queue.value || !currentEntry.value) return
  loading.value = true
  analysisRunning.value = true
  try {
    // 1. Complete the current shooter
    const res: any = await api.post(`/queues/${queue.value.id}/complete_current/`, {})
    const nextEntry = res.next_entry
    const queueComplete = res.queue_complete

    // 2. Run AI analysis on the completed entry
    if (currentEntry.value.id) {
      try {
        const analysis: any = await api.post('/shot-analyses/create_and_run/', {
          queue_entry_id: currentEntry.value.id,
          soldier_seq: currentEntry.value.sequence_number,
          before_photo_url: currentEntry.value.pre_shoot_photo || '',
          after_photo_url: currentEntry.value.post_shoot_photo || '',
        })
        toast.success(
          `AI анализ: ${analysis.hit_count}/${analysis.total_shots_detected} попаданий, точность ${analysis.accuracy}%`
        )
      } catch (e: any) {
        toast.warning('AI анализ не удался, результаты сохранены вручную')
      }
    }

    if (queueComplete) {
      toast.success('Очередь завершена! Все сотрудники отстреляли.')
      router.push('/queue/results')
    } else if (nextEntry) {
      toast.info(`Следующий: ${nextEntry.employee_name}`)
    }

    await loadQueueState(queue.value.id)
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
    analysisRunning.value = false
  }
}

async function skipCurrent() {
  if (!queue.value) return
  loading.value = true
  try {
    await api.post(`/queues/${queue.value.id}/skip_current/`)
    toast.info('Сотрудник пропущен')
    await loadQueueState(queue.value.id)
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

async function pauseQueue() {
  if (!queue.value) return
  try {
    await api.post(`/queues/${queue.value.id}/pause/`)
    toast.info('Очередь приостановлена')
    await loadQueueState(queue.value.id)
  } catch (e: any) {
    toast.error(e.message)
  }
}

async function resumeQueue() {
  if (!queue.value) return
  try {
    await api.post(`/queues/${queue.value.id}/resume/`)
    toast.info('Очередь возобновлена')
    await loadQueueState(queue.value.id)
  } catch (e: any) {
    toast.error(e.message)
  }
}

function startPolling(queueId: string) {
  pollingTimer.value = window.setInterval(() => loadQueueState(queueId), 3000)
}

// WebSocket for real-time updates
let socket: ReturnType<typeof useQueueSocket> | null = null

function startSocket(queueId: string) {
  socket = useQueueSocket(queueId, (event) => {
    switch (event.type) {
      case 'soldier_completed':
        toast.info(`Сотрудник завершен: ${event.data.completed_entry?.employee_name}`)
        break
      case 'next_soldier':
        toast.info(`Следующий: ${event.data.soldier?.employee_name}`)
        break
      case 'queue_completed':
        toast.success('Очередь полностью завершена!')
        router.push('/queue/results')
        break
      case 'analysis_ready':
        toast.success(`AI: ${event.data.hit_count} попаданий, точность ${event.data.accuracy}%`)
        break
    }
    // Refresh state on any event
    loadQueueState(queueId)
  })
  socket.connect()
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const queueId = params.get('id') || ''
  if (queueId) {
    loadQueueState(queueId)
    startPolling(queueId)
    startSocket(queueId)
  } else {
    loadQueuesList()
  }
})

onUnmounted(() => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})

async function loadQueuesList() {
  try {
    const queues: any = await api.get('/queues/')
    if (queues.length > 0) {
      loadQueueState(queues[0].id)
      startPolling(queues[0].id)
      startSocket(queues[0].id)
    }
  } catch (e: any) {
    // No queues yet — that's fine
  }
}

function viewResults(entry: QueueEntry) {
  router.push(`/queue/results?entry=${entry.id}`)
}

function createProtocol(entry: QueueEntry) {
  router.push(`/protocols/create?entry=${entry.id}`)
}

const statusColors: Record<string, string> = {
  CURRENT: 'bg-blue-600 text-white',
  SHOOTING: 'bg-amber-600 text-white',
  WAITING: 'bg-slate-700 text-slate-300',
  COMPLETED: 'bg-emerald-700 text-emerald-200',
  SKIPPED: 'bg-red-800 text-red-200',
}

const queueStatusColors: Record<string, string> = {
  WAITING: 'bg-slate-600',
  ACTIVE: 'bg-emerald-600',
  PAUSED: 'bg-amber-600',
  COMPLETED: 'bg-blue-600',
  CANCELLED: 'bg-red-600',
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Монитор очереди</h1>
        <p v-if="queue" class="text-slate-400 text-sm mt-1">
          {{ queue.queue_id }} • {{ queue.range_name }}
        </p>
      </div>
      <div v-if="queue" :class="['px-3 py-1.5 rounded-full text-xs font-medium', queueStatusColors[queue.status]]">
        {{ queue.status }}
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="queue" class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-400">Прогресс</span>
        <span class="text-sm font-medium text-slate-200">
          {{ queue.completed_count }} / {{ queue.total_soldiers }}
          ({{ progress }}%)
        </span>
      </div>
      <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          :style="{ width: progress + '%' }"
        />
      </div>
    </div>

    <!-- Controls -->
    <div v-if="queue" class="flex gap-3 flex-wrap">
      <button
        v-if="queue.status === 'WAITING'"
        @click="activateQueue"
        :disabled="loading"
        class="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
      >
        ▶ Начать очередь
      </button>
      <button
        v-if="queue.status === 'ACTIVE' && currentEntry"
        @click="completeCurrent"
        :disabled="loading"
        class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm"
      >
        <span v-if="analysisRunning">⏳ AI анализ...</span>
        <span v-else>✓ Завершить стрельбу</span>
      </button>
      <button
        v-if="queue.status === 'ACTIVE' && currentEntry"
        @click="skipCurrent"
        :disabled="loading"
        class="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm"
      >
        ⏭ Пропустить
      </button>
      <button
        v-if="queue.status === 'ACTIVE'"
        @click="pauseQueue"
        :disabled="loading"
        class="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm"
      >
        ⏸ Пауза
      </button>
      <button
        v-if="queue.status === 'PAUSED'"
        @click="resumeQueue"
        class="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
      >
        ▶ Продолжить
      </button>
    </div>

    <!-- Current shooter -->
    <div v-if="currentEntry" class="bg-gradient-to-r from-blue-900/40 to-slate-800/40 rounded-xl p-6 border-2 border-blue-500/50">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span class="text-blue-300 text-sm font-medium uppercase tracking-wide">Сейчас стреляет</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-200 font-bold text-lg">
          {{ currentEntry.sequence_number }}
        </div>
        <div class="flex-1">
          <div class="text-xl font-bold text-slate-100">{{ currentEntry.employee_name }}</div>
          <div class="text-sm text-slate-400">{{ currentEntry.employee_rank }} • {{ currentEntry.employee_department }}</div>
        </div>
        <div v-if="currentEntry.total_shots > 0" class="text-right">
          <div class="text-2xl font-bold text-emerald-400">{{ currentEntry.accuracy }}%</div>
          <div class="text-xs text-slate-400">{{ currentEntry.hit_count }}/{{ currentEntry.total_shots }} попаданий</div>
        </div>
      </div>
    </div>

    <!-- Waiting queue -->
    <div v-if="waitingEntries.length > 0">
      <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">Очередь ({{ waitingEntries.length }})</h3>
      <div class="space-y-2">
        <div
          v-for="entry in waitingEntries.slice(0, 10)"
          :key="entry.id"
          class="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
        >
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-medium">
            {{ entry.sequence_number }}
          </div>
          <div class="flex-1">
            <span class="text-slate-200">{{ entry.employee_name }}</span>
            <span class="text-slate-500 text-sm ml-2">{{ entry.employee_rank }}</span>
          </div>
          <div :class="['px-2 py-0.5 rounded text-xs', statusColors[entry.status]]">
            {{ entry.status }}
          </div>
        </div>
      </div>
      <div v-if="waitingEntries.length > 10" class="text-center text-slate-500 text-sm mt-2">
        ...и ещё {{ waitingEntries.length - 10 }}
      </div>
    </div>

    <!-- Completed -->
    <div v-if="completedEntries.length > 0">
      <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">Завершено ({{ completedEntries.length }})</h3>
      <div class="space-y-2">
        <div
          v-for="entry in completedEntries"
          :key="entry.id"
          :class="[
            'flex items-center gap-4 p-3 rounded-lg border',
            entry.status === 'COMPLETED'
              ? 'bg-emerald-900/20 border-emerald-700/30'
              : 'bg-red-900/20 border-red-700/30'
          ]"
        >
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
            {{ entry.sequence_number }}
          </div>
          <div class="flex-1">
            <span class="text-slate-200">{{ entry.employee_name }}</span>
            <span v-if="entry.total_shots > 0" class="text-slate-500 text-sm ml-2">
              {{ entry.hit_count }}/{{ entry.total_shots }} • {{ entry.total_score }} очк.
            </span>
            <span v-else class="text-slate-500 text-sm ml-2">пропущен</span>
          </div>
          <div v-if="entry.total_shots > 0" :class="entry.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'">
            {{ entry.accuracy }}%
          </div>
          <button
            v-if="entry.status === 'COMPLETED'"
            @click="viewResults(entry)"
            class="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            Результаты
          </button>
          <button
            v-if="entry.status === 'COMPLETED' && entry.total_shots > 0"
            @click="createProtocol(entry)"
            class="px-3 py-1 rounded text-xs bg-blue-700 hover:bg-blue-600 text-white"
          >
            Протокол
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!queue" class="text-center py-16">
      <div class="text-slate-500 text-lg mb-4">Нет активной очереди</div>
      <router-link to="/faceid" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm">
        Создать FaceID чекин
      </router-link>
    </div>
  </div>
</template>

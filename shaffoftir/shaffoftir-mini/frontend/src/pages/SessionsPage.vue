<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { ShootingSession } from '@/types'
import { Zap, Plus, Target, Users, CheckCircle, XCircle } from 'lucide-vue-next'

const router = useRouter()
const sessions = ref<ShootingSession[]>([])
const loading = ref(true)
const showCreate = ref(false)
const soldierCount = ref(1)
const scoringMode = ref('POINTS')
const creating = ref(false)

async function load() {
  loading.value = true
  try {
    sessions.value = await api.getSessions()
  } catch { sessions.value = [] }
  finally { loading.value = false }
}

async function createSession() {
  creating.value = true
  try {
    await api.startSession({
      soldier_count: soldierCount.value,
      scoring_mode: scoringMode.value,
      range_type: 'CLOSED',
      distance: 25,
    })
    showCreate.value = false
    await load()
  } catch (e: any) { alert(e.message) }
  finally { creating.value = false }
}

function openSession(id: string) { router.push(`/sessions/${id}`) }

function statusBadge(status: string) {
  const map: Record<string, string> = {
    SESSION_CREATED: 'badge-blue', SHOOTING: 'badge-yellow',
    ARCHIVED: 'badge-gray', COMPLETED: 'badge-green',
  }
  return map[status] || 'badge-gray'
}
function statusLabel(status: string) {
  const map: Record<string, string> = {
    SESSION_CREATED: 'Создана', SHOOTING: 'Стрельба',
    ARCHIVED: 'Архив', COMPLETED: 'Завершена',
  }
  return map[status] || status
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2"><Zap :size="22" class="text-emerald-400" /> Стрельбы</h1>
        <p class="text-sm text-slate-500 mt-0.5">Управление стрелковыми сессиями</p>
      </div>
      <button @click="showCreate = true" class="btn-primary">
        <Plus :size="18" /> Новая сессия
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Всего</span><span class="stat-value">{{ sessions.length }}</span></div>
      <div class="stat-card"><span class="stat-label">Активных</span><span class="stat-value text-emerald-400">{{ sessions.filter(s => s.status === 'SHOOTING').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Сдано</span><span class="stat-value">{{ sessions.filter(s => s.passed).length }}</span></div>
      <div class="stat-card"><span class="stat-label">Средн. точность</span><span class="stat-value">{{ sessions.length ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length) : 0 }}%</span></div>
    </div>

    <!-- List -->
    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="sessions.length === 0" class="card text-center py-12 text-slate-500">
      Нет сессий. Создайте новую.
    </div>
    <div v-else class="space-y-2.5">
      <div v-for="s in sessions" :key="s.id" @click="openSession(s.id)" class="card-hover cursor-pointer flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
          <Target :size="20" class="text-emerald-400" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium text-slate-200 truncate">{{ s.employee_name || 'Сессия' }}</p>
            <span :class="statusBadge(s.status)">{{ statusLabel(s.status) }}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ s.weapon_name || '—' }} • Дорожка {{ s.lane_number || '—' }} • {{ s.total_shots }} выстрелов
            <span v-if="s.employee_department"> • {{ s.employee_department }}</span>
          </p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-lg font-bold" :class="s.passed ? 'text-emerald-400' : 'text-red-400'">{{ s.total_score }}</p>
          <p class="text-xs text-slate-500">{{ s.accuracy }}%</p>
        </div>
        <div class="flex-shrink-0">
          <CheckCircle v-if="s.passed" :size="20" class="text-emerald-400" />
          <XCircle v-else :size="20" class="text-red-400" />
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click.self="showCreate = false">
      <div class="card p-6 w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold">Новая сессия</h2>
        <div>
          <label class="text-sm text-slate-400 mb-1.5 block">Количество стрелков</label>
          <input v-model.number="soldierCount" type="number" min="1" max="20" class="input" />
        </div>
        <div>
          <label class="text-sm text-slate-400 mb-1.5 block">Режим скоринга</label>
          <select v-model="scoringMode" class="input">
            <option value="POINTS">Баллы</option>
            <option value="HIT_MISS">Hit / Miss</option>
          </select>
        </div>
        <div class="flex gap-3">
          <button @click="showCreate = false" class="btn-secondary flex-1 justify-center">Отмена</button>
          <button @click="createSession" :disabled="creating" class="btn-primary flex-1 justify-center">{{ creating ? 'Создание...' : 'Создать' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

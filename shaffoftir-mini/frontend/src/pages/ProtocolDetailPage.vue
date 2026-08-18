<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { Protocol } from '@/types'
import { ArrowLeft, FileText, CheckCircle, XCircle, PenLine, Check, Archive } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const protocol = ref<Protocol | null>(null)
const loading = ref(true)
const actionLoading = ref(false)

async function load() {
  try { protocol.value = await api.getProtocol(route.params.id as string) }
  catch { router.push('/protocols') }
  finally { loading.value = false }
}

async function doAction(action: 'sign' | 'approve' | 'archive') {
  actionLoading.value = true
  try {
    if (action === 'sign') protocol.value = await api.signProtocol(route.params.id as string)
    if (action === 'approve') protocol.value = await api.approveProtocol(route.params.id as string)
    if (action === 'archive') protocol.value = await api.archiveProtocol(route.params.id as string)
  } catch (e: any) { alert(e.message) }
  finally { actionLoading.value = false }
}

function statusLabel(s: string) {
  const map: Record<string, string> = { DRAFT: 'Черновик', SIGNED: 'Подписан', APPROVED: 'Утверждён', ARCHIVED: 'Архив', REJECTED: 'Отклонён' }
  return map[s] || s
}

onMounted(load)
function goBack() { router.push('/protocols') }
</script>

<template>
  <div>
    <button @click="goBack" class="btn-secondary mb-4"><ArrowLeft :size="18" /> Назад</button>
    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="protocol">
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">Протокол — {{ protocol.employee_name }}</h1>
            <p class="text-sm text-slate-500 mt-1">
              {{ protocol.employee_rank || '' }} • {{ protocol.employee_department || '—' }}
              • {{ protocol.weapon_name || '—' }}
            </p>
            <p class="text-xs text-slate-600 mt-1">Инструктор: {{ protocol.instructor_name || '—' }} • Место: {{ protocol.location || '—' }} • Дорожка {{ protocol.lane_number || '—' }}</p>
          </div>
          <span class="badge-blue text-sm">{{ statusLabel(protocol.status) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="stat-card"><span class="stat-label">Выстрелов</span><span class="stat-value">{{ protocol.total_shots }}</span></div>
        <div class="stat-card"><span class="stat-label">Попаданий</span><span class="stat-value text-emerald-400">{{ protocol.hit_count }}</span></div>
        <div class="stat-card"><span class="stat-label">Промахов</span><span class="stat-value text-red-400">{{ protocol.miss_count }}</span></div>
        <div class="stat-card"><span class="stat-label">Балл</span><span class="stat-value">{{ protocol.total_score }}</span></div>
      </div>

      <div class="card flex items-center justify-between">
        <div>
          <p class="font-medium">Результат: <span :class="protocol.passed ? 'text-emerald-400' : 'text-red-400'">{{ protocol.passed ? 'Сдано' : 'Не сдано' }}</span></p>
          <p class="text-sm text-slate-500">Точность: {{ protocol.accuracy }}% • Квалификация: {{ protocol.qualification || '—' }}</p>
        </div>
        <div class="flex gap-2">
          <button v-if="protocol.status === 'DRAFT'" @click="doAction('sign')" :disabled="actionLoading" class="btn-secondary"><PenLine :size="18" /> Подписать</button>
          <button v-if="protocol.status === 'SIGNED'" @click="doAction('approve')" :disabled="actionLoading" class="btn-primary"><Check :size="18" /> Утвердить</button>
          <button v-if="protocol.status === 'APPROVED'" @click="doAction('archive')" :disabled="actionLoading" class="btn-secondary"><Archive :size="18" /> В архив</button>
        </div>
      </div>
    </div>
  </div>
</template>

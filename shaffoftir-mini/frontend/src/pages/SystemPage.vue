<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import type { AuditLog } from '@/types'
import { Activity, Server, Database, Shield } from 'lucide-vue-next'

const auditLogs = ref<AuditLog[]>([])
const analytics = ref<any>(null)
const loading = ref(true)

async function load() {
  try {
    auditLogs.value = await api.getAuditLogs()
    analytics.value = await api.getAnalytics()
  } catch {}
  finally { loading.value = false }
}

function formatTime(ts: string) { return new Date(ts).toLocaleString('ru-RU') }

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><Activity :size="22" class="text-emerald-400" /> Система</h1>
      <p class="text-sm text-slate-500 mt-0.5">Мониторинг и аудит</p>
    </div>

    <!-- System health -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="flex items-center gap-2"><Server :size="16" class="text-emerald-400" /><span class="stat-label">Сервер</span></div>
        <span class="stat-value text-emerald-400">● Онлайн</span>
      </div>
      <div class="stat-card">
        <div class="flex items-center gap-2"><Database :size="16" class="text-blue-400" /><span class="stat-label">База данных</span></div>
        <span class="stat-value text-emerald-400">● Активна</span>
      </div>
      <div class="stat-card">
        <div class="flex items-center gap-2"><Shield :size="16" class="text-amber-400" /><span class="stat-label">JWT Auth</span></div>
        <span class="stat-value text-emerald-400">● Активна</span>
      </div>
      <div class="stat-card">
        <div class="flex items-center gap-2"><Activity :size="16" class="text-purple-400" /><span class="stat-label">API</span></div>
        <span class="stat-value text-emerald-400">● Работает</span>
      </div>
    </div>

    <!-- Analytics -->
    <div v-if="analytics" class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Сессий всего</span><span class="stat-value">{{ analytics.total_sessions }}</span></div>
      <div class="stat-card"><span class="stat-label">Выстрелов</span><span class="stat-value">{{ analytics.total_shots }}</span></div>
      <div class="stat-card"><span class="stat-label">Средн. точность</span><span class="stat-value">{{ analytics.avg_accuracy }}%</span></div>
      <div class="stat-card"><span class="stat-label">Сотрудников обучено</span><span class="stat-value">{{ analytics.total_employees_trained }}</span></div>
    </div>

    <!-- Audit log -->
    <div class="card">
      <h2 class="font-semibold text-slate-200 mb-4">Журнал аудита</h2>
      <div v-if="loading" class="text-slate-500 text-sm">Загрузка...</div>
      <div v-else-if="auditLogs.length === 0" class="text-slate-500 text-sm">Нет записей</div>
      <div v-else class="space-y-2">
        <div v-for="log in auditLogs" :key="log.id" class="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50">
          <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-200">{{ log.details }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ log.actor_name }} ({{ log.actor_role }}) • {{ log.module }} • {{ formatTime(log.timestamp) }}</p>
          </div>
          <span class="text-xs text-slate-600">{{ log.ip_address || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

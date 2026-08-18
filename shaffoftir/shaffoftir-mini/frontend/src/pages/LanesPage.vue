<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import type { ShootingLane } from '@/types'
import { Monitor, Users, Crosshair, Wifi, WifiOff } from 'lucide-vue-next'

const lanes = ref<ShootingLane[]>([])
const loading = ref(true)

async function load() {
  try { lanes.value = await api.getLanes() } catch { lanes.value = [] }
  finally { loading.value = false }
}

function statusBadge(status: string) {
  const map: Record<string, string> = { AVAILABLE: 'badge-green', OCCUPIED: 'badge-yellow', MAINTENANCE: 'badge-red', OFFLINE: 'badge-gray' }
  return map[status] || 'badge-gray'
}
function statusLabel(status: string) {
  const map: Record<string, string> = { AVAILABLE: 'Свободна', OCCUPIED: 'Занята', MAINTENANCE: 'Обслуживание', OFFLINE: 'Недоступна' }
  return map[status] || status
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><Monitor :size="22" class="text-emerald-400" /> Дорожки</h1>
      <p class="text-sm text-slate-500 mt-0.5">Статус стрелковых дорожек</p>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Всего</span><span class="stat-value">{{ lanes.length }}</span></div>
      <div class="stat-card"><span class="stat-label">Свободны</span><span class="stat-value text-emerald-400">{{ lanes.filter(l => l.status === 'AVAILABLE').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Заняты</span><span class="stat-value text-amber-400">{{ lanes.filter(l => l.status === 'OCCUPIED').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Камеры онлайн</span><span class="stat-value text-emerald-400">{{ lanes.filter(l => l.camera_status === 'ONLINE').length }}</span></div>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="lane in lanes" :key="lane.id" class="card-hover">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Monitor :size="20" class="text-slate-400" />
          </div>
          <span :class="statusBadge(lane.status)">{{ statusLabel(lane.status) }}</span>
        </div>
        <p class="font-medium text-sm">{{ lane.name }}</p>
        <p class="text-xs text-slate-500 mt-1">№{{ lane.lane_number }} • {{ lane.distance_m }}м • {{ lane.target_type }}</p>
        <div class="flex items-center gap-3 mt-3 text-xs">
          <span class="flex items-center gap-1" :class="lane.camera_status === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'">
            <Wifi v-if="lane.camera_status === 'ONLINE'" :size="14" />
            <WifiOff v-else :size="14" />
            {{ lane.camera_ip || '—' }}
          </span>
          <span v-if="lane.current_employee_name" class="flex items-center gap-1 text-slate-400">
            <Users :size="14" /> {{ lane.current_employee_name }}
          </span>
        </div>
        <p v-if="lane.weapon_assigned" class="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
          <Crosshair :size="14" /> {{ lane.weapon_assigned }}
        </p>
      </div>
    </div>
  </div>
</template>

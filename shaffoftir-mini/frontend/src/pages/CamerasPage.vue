<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import type { LaneCamera } from '@/types'
import { Camera, Wifi, WifiOff, RefreshCw, Video } from 'lucide-vue-next'

const cameras = ref<LaneCamera[]>([])
const loading = ref(true)
const checking = ref(false)
const healthResults = ref<any[]>([])

async function load() {
  loading.value = true
  try { cameras.value = await api.getCameras() } catch { cameras.value = [] }
  finally { loading.value = false }
}

async function checkHealth() {
  checking.value = true
  try {
    const result = await api.checkCameraHealth(cameras.value.map(c => ({ camera_ip: c.camera_ip, label: c.name })))
    healthResults.value = result.camera_results || []
  } catch { alert('Ошибка проверки') }
  finally { checking.value = false }
}

function camStatus(ip: string) {
  const r = healthResults.value.find(h => h.camera_ip === ip)
  return r?.status || '—'
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2"><Camera :size="22" class="text-emerald-400" /> Камеры</h1>
        <p class="text-sm text-slate-500 mt-0.5">Мониторинг камер наблюдения</p>
      </div>
      <button @click="checkHealth" :disabled="checking" class="btn-primary">
        <RefreshCw :size="18" :class="{ 'animate-spin': checking }" /> Проверить
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Всего</span><span class="stat-value">{{ cameras.length }}</span></div>
      <div class="stat-card"><span class="stat-label">Онлайн</span><span class="stat-value text-emerald-400">{{ cameras.filter(c => c.status === 'ONLINE').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Офлайн</span><span class="stat-value text-red-400">{{ cameras.filter(c => c.status === 'OFFLINE').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Дорожек</span><span class="stat-value">{{ new Set(cameras.map(c => c.lane_number)).size }}</span></div>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="cam in cameras" :key="cam.id" class="card-hover">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Video :size="20" class="text-slate-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ cam.name }}</p>
            <p class="text-xs text-slate-500">Дорожка {{ cam.lane_number }}</p>
          </div>
          <Wifi v-if="cam.status === 'ONLINE'" :size="18" class="text-emerald-400" />
          <WifiOff v-else :size="18" class="text-red-400" />
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500">IP: {{ cam.camera_ip }}</span>
          <span :class="camStatus(cam.camera_ip) === 'ONLINE' ? 'badge-green' : camStatus(cam.camera_ip) === 'OFFLINE' ? 'badge-red' : 'badge-gray'">
            {{ camStatus(cam.camera_ip) === 'ONLINE' ? 'Онлайн' : camStatus(cam.camera_ip) === 'OFFLINE' ? 'Офлайн' : 'Не проверено' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

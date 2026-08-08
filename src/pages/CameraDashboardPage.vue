<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Camera, Radio, Activity, Video, Maximize, Wifi, WifiOff, Crosshair } from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import KPICard from '@/components/ui/KPICard.vue'

const router = useRouter()
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const lanes = computed(() => masterStore.lanes)

const stats = computed(() => ({
  total: lanes.value.length,
  online: lanes.value.filter(l => l.camera_status === 'ONLINE').length,
  offline: lanes.value.filter(l => l.camera_status === 'OFFLINE').length,
  connecting: lanes.value.filter(l => l.camera_status === 'CONNECTING').length,
}))

// All areas with cameras
const cameraAreas = computed(() => [
  { id: 'lane', label: isUz.value ? "Yo'lak kameralari" : 'Камеры дорожек', icon: Crosshair, count: lanes.value.length, online: stats.value.online },
  { id: 'entrance', label: isUz.value ? "Kirish" : 'Вход', icon: Camera, count: 2, online: 2 },
  { id: 'parking', label: isUz.value ? "Avtoturargoh" : 'Парковка', icon: Camera, count: 1, online: 1 },
  { id: 'corridor', label: isUz.value ? "Koridor" : 'Коридор', icon: Camera, count: 3, online: 2 },
  { id: 'armory', label: isUz.value ? "Qurol ombori" : 'Арсенал', icon: Camera, count: 1, online: 1 },
  { id: 'control', label: isUz.value ? "Boshqaruv xonasi" : 'Пункт управления', icon: Camera, count: 1, online: 1 },
])

const totalCameras = computed(() => cameraAreas.value.reduce((sum, a) => sum + a.count, 0))
const totalOnline = computed(() => cameraAreas.value.reduce((sum, a) => sum + a.online, 0))
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isUz ? "Kameralar" : "Камеры" }}</h1>
      <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? "Barcha zonalar bo'yicha jonli kuzatuv" : "Живое наблюдение всех зон" }}</p>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami kameralar' : 'Всего камер'" :value="totalCameras" :subtitle="isUz ? 'barchasi' : 'всего'" :icon="Camera" accent="neutral" />
      <KPICard :title="isUz ? 'Onlayn' : 'Онлайн'" :value="totalOnline" :subtitle="isUz ? 'faol' : 'активны'" :icon="Activity" accent="brand" />
      <KPICard :title="isUz ? 'Oflayn' : 'Офлайн'" :value="totalCameras - totalOnline" :subtitle="isUz ? 'off' : 'офлайн'" :icon="WifiOff" accent="neutral" />
      <KPICard :title="isUz ? 'Ulanmoqda' : 'Подключение'" :value="stats.connecting" :subtitle="isUz ? 'kutish' : 'ожидание'" :icon="Radio" accent="neutral" />
    </div>

    <!-- Camera zones overview -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Kamera zonalari" : "Зоны камер" }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="area in cameraAreas" :key="area.id"
          class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition cursor-pointer">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :style="{ background: area.online === area.count ? '#dcfce7' : '#fee2e2' }">
              <component :is="area.icon" class="w-4 h-4" :style="{ color: area.online === area.count ? '#16a34a' : '#dc2626' }" />
            </div>
            <div class="flex items-center gap-1">
              <Wifi v-if="area.online === area.count" class="w-3 h-3 text-green-500" />
              <WifiOff v-else class="w-3 h-3 text-red-400" />
            </div>
          </div>
          <p class="text-xs font-bold text-gray-800 truncate">{{ area.label }}</p>
          <p class="text-[10px] text-gray-400 mt-0.5">{{ area.online }}/{{ area.count }} {{ isUz ? "onlayn" : "онлайн" }}</p>
          <!-- Mini status bar -->
          <div class="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full rounded-full" :style="{ width: (area.online / area.count * 100) + '%', background: area.online === area.count ? '#16a34a' : '#f59e0b' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lane cameras grid -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Yo'lak kameralari" : "Камеры дорожек" }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="lane in lanes" :key="lane.id"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group">
          <!-- Camera feed -->
          <div class="relative cursor-pointer" @click="router.push(`/cameras/live/${lane.lane_number}`)">
            <LiveCameraMini
              :lane-number="lane.lane_number"
              :status="lane.camera_status"
              :employee-name="lane.current_employee_name"
              :is-shooting="lane.status === 'OCCUPIED'"
              :height="160"
            />
            <!-- Maximize button -->
            <div class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
              <Maximize class="w-3.5 h-3.5 text-white" />
            </div>
            <!-- LIVE badge -->
            <div v-if="lane.camera_status === 'ONLINE' && lane.status === 'OCCUPIED'"
              class="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
            </div>
          </div>
          <!-- Info bar -->
          <div class="p-3 flex items-center justify-between border-t border-gray-50">
            <div class="min-w-0">
              <p class="text-sm font-bold text-gray-800">{{ isUz ? "Yo'lak" : "Дорожка" }} {{ lane.lane_number }}</p>
              <p class="text-[10px] text-gray-400 truncate">
                {{ lane.distance_m }}м · {{ lane.target_type }}
                <span v-if="lane.current_employee_name">· {{ lane.current_employee_name }}</span>
              </p>
            </div>
            <button @click="router.push(`/cameras/live/${lane.lane_number}`)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0"
              :class="lane.status === 'OCCUPIED' ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'">
              <Video class="w-3.5 h-3.5" />
              {{ isUz ? "Kuzatish" : "Смотреть" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

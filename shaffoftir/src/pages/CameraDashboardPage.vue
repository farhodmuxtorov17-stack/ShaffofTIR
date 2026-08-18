<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import type { CameraConfig } from '@/api/camera.api'
import { useCameraStore } from '@/stores/camera'
import { useI18n } from '@/i18n'
import { Camera, Radio, Activity, Video, Maximize, Wifi, WifiOff, Crosshair, Settings } from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import KPICard from '@/components/ui/KPICard.vue'

const router = useRouter()
const masterStore = useMasterStore()
const cameraStore = useCameraStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const lanes = computed(() => masterStore.lanes)

const stats = computed(() => ({
  total: cameraStore.cameras.length,
  online: cameraStore.enabledCameras.length,
  offline: cameraStore.cameras.length - cameraStore.enabledCameras.length,
  connecting: 0,
}))

const cameraAreas = computed(() => [
  { id: 'lane', label: isUz.value ? "Yoʻlak kameralari" : 'Камеры дорожек', icon: Crosshair, count: cameraStore.getCamerasByZone('lane').length, online: cameraStore.getCamerasByZone('lane').length },
  { id: 'entrance', label: isUz.value ? "Kirish" : 'Вход', icon: Camera, count: cameraStore.getCamerasByZone('entrance').length, online: cameraStore.getCamerasByZone('entrance').length },
  { id: 'armory', label: isUz.value ? "Qurol ombori" : 'Арсенал', icon: Camera, count: cameraStore.getCamerasByZone('armory').length, online: cameraStore.getCamerasByZone('armory').length },
  { id: 'control', label: isUz.value ? "Boshqaruv xonasi" : 'Пункт управления', icon: Camera, count: cameraStore.getCamerasByZone('control').length, online: cameraStore.getCamerasByZone('control').length },
])

const laneCameras = computed(() => cameraStore.getCamerasByZone('lane').sort((a: CameraConfig, b: CameraConfig) => (a.laneNumber || 0) - (b.laneNumber || 0)))
const otherCameras = computed(() => cameraStore.cameras.filter(c => c.zone !== 'lane' && c.enabled))
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isUz ? "Kameralar" : "Камеры" }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? "Barcha zonalar boʻyicha jonli kuzatuv" : "Живое наблюдение всех зон" }}</p>
      </div>
      <button class="btn-ghost text-sm flex items-center gap-1.5" @click="router.push('/cameras/config')">
        <Settings class="w-4 h-4" />
        {{ isUz ? "Sozlash" : "Настройки" }}
      </button>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami kameralar' : 'Всего камер'" :value="stats.total" :subtitle="isUz ? 'barchasi' : 'всего'" :icon="Camera" accent="neutral" />
      <KPICard :title="isUz ? 'Onlayn' : 'Онлайн'" :value="stats.online" :subtitle="isUz ? 'faol' : 'активны'" :icon="Activity" accent="brand" />
      <KPICard :title="isUz ? 'Oflayn' : 'Офлайн'" :value="stats.offline" :subtitle="isUz ? 'off' : 'офлайн'" :icon="WifiOff" accent="neutral" />
      <KPICard :title="isUz ? 'Zonalar' : 'Зоны'" :value="cameraAreas.length" :subtitle="isUz ? 'zona' : 'зон'" :icon="Radio" accent="neutral" />
    </div>

    <!-- Lane cameras grid -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Yoʻlak kameralari" : "Камеры дорожек" }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="cam in laneCameras" :key="cam.id"
          @click="router.push(`/cameras/live/${cam.laneNumber || cam.id}`)"
          class="cursor-pointer hover:scale-[1.02] transition">
          <LiveCameraMini
            :camera-id="cam.id"
            :lane-number="cam.laneNumber || 0"
            :status="cam.enabled ? 'ONLINE' : 'OFFLINE'"
            :employee-name="lanes.find(l => l.lane_number === cam.laneNumber)?.current_employee_name || null"
            :is-shooting="lanes.find(l => l.lane_number === cam.laneNumber)?.status === 'OCCUPIED'"
            :height="160"
          />
        </div>
      </div>
    </div>

    <!-- Other zone cameras -->
    <div v-if="otherCameras.length > 0">
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Boshqa zonalar" : "Другие зоны" }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="cam in otherCameras" :key="cam.id"
          @click="router.push(`/cameras/live/${cam.id}`)"
          class="cursor-pointer hover:scale-[1.02] transition">
          <LiveCameraMini
            :camera-id="cam.id"
            :status="cam.enabled ? 'ONLINE' : 'OFFLINE'"
            :height="160"
          />
        </div>
      </div>
    </div>

    <!-- Camera zones overview -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Kamera zonalari" : "Зоны камер" }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="area in cameraAreas" :key="area.id"
          class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition cursor-pointer">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <component :is="area.icon" class="w-4 h-4 text-gray-500" />
            </div>
            <span class="text-xs font-bold" :class="area.online === area.count ? 'text-green-500' : 'text-yellow-500'">
              {{ area.online }}/{{ area.count }}
            </span>
          </div>
          <p class="text-sm font-medium text-gray-700">{{ area.label }}</p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="cameraStore.cameras.length === 0" class="text-center py-12">
      <Camera class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm text-gray-400 mb-4">{{ isUz ? "Kameralar sozlanmagan" : "Камеры не настроены" }}</p>
      <button class="btn-primary text-sm" @click="router.push('/cameras/config')">
        {{ isUz ? "Kamera qoʻshish" : "Добавить камеру" }}
      </button>
    </div>
  </div>
</template>

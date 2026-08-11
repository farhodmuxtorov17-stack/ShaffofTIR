<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useCameraStore } from '@/stores/camera'
import { Radio, Camera, Activity, Crosshair, Target, Clock, ChevronRight, AlertCircle, Maximize2 } from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import LiveTargetMini from '@/components/camera/LiveTargetMini.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const cameraStore = useCameraStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const param = computed(() => route.params.id as string)
const laneNum = computed(() => Number(param.value))
const isLane = computed(() => !isNaN(laneNum.value) && laneNum.value > 0)

const camera = computed(() => {
  if (isLane.value) return cameraStore.getCameraByLane(laneNum.value)
  return cameraStore.cameras.find((c: any) => c.id === param.value)
})

const lane = computed(() => masterStore.lanes.find(l => l.lane_number === laneNum.value))

const startTime = ref(Date.now())
const elapsedTime = ref('00:00')
let timerId: number | null = null

function updateTimer() {
  const diff = Math.floor((Date.now() - startTime.value) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  elapsedTime.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

onMounted(() => {
  timerId = window.setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

// Shot data from store
const shots = computed(() => {
  if (!lane.value) return []
  const count = lane.value.current_shots_fired || 0
  const score = lane.value.current_score || 0
  return Array.from({ length: count }, (_, i) => ({
    x: 40 + Math.random() * 20,
    y: 35 + Math.random() * 15,
    score: Math.floor(score / Math.max(count, 1)),
    time: `00:${String(i * 4).padStart(2, '0')}`,
  }))
})

const totalScore = computed(() => shots.value.reduce((s, sh) => s + sh.score, 0))
const avgScore = computed(() => shots.value.length > 0 ? (totalScore.value / shots.value.length).toFixed(1) : '0')
const accuracy = computed(() => lane.value ? Math.round(((lane.value.current_score ?? 0) / Math.max((lane.value.current_shots_fired ?? 0) * 10, 1)) * 100) : 0)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight class="w-5 h-5 text-gray-400 rotate-180" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ camera?.name || (isUz ? `Yoʻlak ${laneNum}` : `Дорожка ${laneNum}`) }}
          </h1>
          <p class="text-sm text-gray-400 mt-0.5">
            {{ isUz ? 'Real vaqt rejimida kuzatish' : 'Наблюдение в реальном времени' }}
            <span v-if="camera" class="ml-2 font-mono text-gray-500">{{ camera.ip }}:{{ camera.port }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs font-mono font-bold text-green-600">{{ elapsedTime }}</span>
        </div>
      </div>
    </div>

    <!-- No camera found -->
    <div v-if="!camera" class="card text-center py-12">
      <AlertCircle class="w-10 h-10 text-yellow-400 mx-auto mb-3" />
      <p class="text-sm text-gray-500">{{ isUz ? 'Kamera topilmadi' : 'Камера не найдена' }}</p>
      <button class="btn-primary text-sm mt-4" @click="router.push('/cameras/config')">
        {{ isUz ? 'Kamera sozlash' : 'Настроить камеру' }}
      </button>
    </div>

    <template v-else>
      <!-- Main feed + target side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Camera feed (large) -->
        <div class="lg:col-span-2 card !p-0 overflow-hidden rounded-xl">
          <LiveCameraMini
            :camera-id="camera.id"
            :lane-number="laneNum"
            :status="camera.enabled ? 'ONLINE' : 'OFFLINE'"
            :employee-name="lane?.current_employee_name || null"
            :is-shooting="lane?.status === 'OCCUPIED'"
            :height="420"
          />
        </div>

        <!-- Target view -->
        <div class="card !p-0 overflow-hidden rounded-xl bg-gray-900">
          <div class="p-3 border-b border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <Target class="w-4 h-4 text-brand-400" />
              <span class="text-xs font-bold text-gray-300">{{ isUz ? 'Nishon' : 'Мишень' }}</span>
            </div>
            <span class="text-[10px] font-mono text-gray-500">{{ camera.streamType }}</span>
          </div>
          <div class="flex items-center justify-center" style="height: 354px;">
            <LiveTargetMini
              v-if="lane"
              :lane-number="laneNum"
              :shooter="lane.current_employee_name || ''"
              :accuracy="accuracy"
              :shots-fired="lane.current_shots_fired || 0"
              :hits="Math.floor((lane.current_shots_fired || 0) * (accuracy / 100))"
              :is-shooting="lane.status === 'OCCUPIED'"
              :size="300"
            />
            <div v-else class="text-center text-gray-500">
              <Target class="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p class="text-xs">{{ isUz ? 'Nishon maʼlumotlari yoʻq' : 'Нет данных о мишени' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div v-if="lane" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-1">
            <Crosshair class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Otilgan' : 'Выстрелов' }}</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ lane.current_shots_fired || 0 }}</p>
        </div>
        <div class="card">
          <div class="flex items-center gap-2 mb-1">
            <Target class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Aniqlik' : 'Точность' }}</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ accuracy }}%</p>
        </div>
        <div class="card">
          <div class="flex items-center gap-2 mb-1">
            <Activity class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Ball' : 'Балл' }}</span>
          </div>
          <p class="text-2xl font-bold text-brand-600">{{ lane.current_score || 0 }}</p>
        </div>
        <div class="card">
          <div class="flex items-center gap-2 mb-1">
            <Clock class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? "O'rtacha" : 'Средний' }}</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ avgScore }}</p>
        </div>
      </div>

      <!-- Shot history -->
      <div v-if="shots.length > 0" class="card">
        <h3 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Otishlar tarixi" : "История выстрелов" }}</h3>
        <div class="space-y-1.5">
          <div v-for="(s, i) in shots" :key="i"
            class="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 text-xs">
            <span class="font-mono text-gray-400">#{{ i + 1 }}</span>
            <span class="font-mono text-gray-300">{{ s.time }}</span>
            <span class="font-bold" :class="s.score >= 8 ? 'text-green-600' : s.score >= 5 ? 'text-yellow-600' : 'text-red-500'">
              {{ s.score }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

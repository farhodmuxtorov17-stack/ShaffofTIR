<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { Radio, Camera, Activity, Crosshair, Target, Clock, ChevronRight, AlertCircle } from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const laneNum = computed(() => Number(route.params.lane))
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

// Mock shot data
const shots = ref([
  { x: 45, y: 35, score: 10, time: '00:12' },
  { x: 52, y: 40, score: 9, time: '00:18' },
  { x: 38, y: 42, score: 8, time: '00:25' },
  { x: 55, y: 38, score: 10, time: '00:33' },
  { x: 48, y: 45, score: 9, time: '00:41' },
])

const totalScore = computed(() => shots.value.reduce((s, sh) => s + sh.score, 0))
const avgScore = computed(() => shots.value.length > 0 ? (totalScore.value / shots.value.length).toFixed(1) : '0')
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
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isUz ? `Yoʻlak ${laneNum} - Jonli efir` : `Дорожка ${laneNum} - Прямой эфир` }}</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? 'Real vaqt rejimida kuzatish' : 'Наблюдение в реальном времени' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span class="text-xs font-bold">LIVE</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600">
          <Clock class="w-4 h-4" />
          <span class="text-xs font-mono font-bold">{{ elapsedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Large camera view -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <LiveCameraMini
            :lane-number="laneNum"
            :status="lane?.camera_status || 'ONLINE'"
            :employee-name="lane?.current_employee_name"
            :is-shooting="lane?.status === 'OCCUPIED'"
            :height="400"
          />
          <!-- Camera info bar -->
          <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <Camera class="w-4 h-4 text-gray-400" />
                <span class="text-xs text-gray-500">{{ lane?.camera_ip || '192.168.1.64' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Radio class="w-4 h-4 text-gray-400" />
                <span class="text-xs text-gray-500">CH-{{ String(laneNum).padStart(2, '0') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Target class="w-4 h-4 text-gray-400" />
                <span class="text-xs text-gray-500">{{ lane?.distance_m || 100 }}м · {{ lane?.target_type || 'STANDARD' }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-400">1080p · 30fps</span>
            </div>
          </div>
        </div>

        <!-- Shot timeline -->
        <div class="mt-4 card p-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3">Otish tarixi</h3>
          <div class="space-y-2">
            <div v-for="(shot, i) in shots" :key="i" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                :class="shot.score >= 9 ? 'bg-brand-100 text-brand-700' : shot.score >= 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'">
                {{ i + 1 }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <Crosshair class="w-3 h-3 text-gray-400" />
                  <span class="text-xs text-gray-600">X: {{ shot.x }} Y: {{ shot.y }}</span>
                </div>
              </div>
              <span class="text-xs text-gray-400 font-mono">{{ shot.time }}</span>
              <span class="text-sm font-bold" :class="shot.score >= 9 ? 'text-brand-600' : 'text-gray-600'">{{ shot.score }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Side panel -->
      <div class="space-y-4">
        <!-- Employee info -->
        <div class="card p-5" v-if="lane?.current_employee_name">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-lg font-bold">
              {{ lane.current_employee_name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">{{ lane.current_employee_name }}</p>
              <p class="text-[10px] text-gray-400">{{ isUz ? `Otmoqda · Yoʻlak ${laneNum}` : `Стреляет · Дорожка ${laneNum}` }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div class="text-center">
              <p class="text-xl font-bold text-brand-600">{{ shots.length }}</p>
              <p class="text-[9px] text-gray-400">oq otildi</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-gray-800">{{ avgScore }}</p>
              <p class="text-[9px] text-gray-400">oʻrtacha ball</p>
            </div>
          </div>
        </div>

        <!-- Lane status -->
        <div class="card p-5">
          <h3 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? 'Yoʻlak maʻlumotlari' : 'Данные дорожки' }}</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-gray-400">{{ isUz ? 'Masofa' : 'Дистанция' }}</span>
              <span class="font-medium text-gray-700">{{ lane?.distance_m || 100 }}м</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">{{ isUz ? 'Nishon turi' : 'Тип мишени' }}</span>
              <span class="font-medium text-gray-700">{{ lane?.target_type || 'STANDARD' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">{{ isUz ? 'Kamera holati' : 'Состояние камеры' }}</span>
              <span class="font-medium" :class="lane?.camera_status === 'ONLINE' ? 'text-brand-600' : 'text-gray-500'">
                {{ lane?.camera_status || 'ONLINE' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Qurol</span>
              <span class="font-medium text-gray-700">{{ lane?.weapon_assigned || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Score summary -->
        <div class="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 text-white">
          <div class="flex items-center gap-2 mb-3">
            <Activity class="w-5 h-5" />
            <h3 class="text-sm font-bold">{{ isUz ? 'Jami natija' : 'Общий результат' }}</h3>
          </div>
          <p class="text-4xl font-bold">{{ totalScore }}</p>
          <p class="text-xs opacity-80 mt-1">{{ shots.length }} oq · oʻrtacha {{ avgScore }}</p>
        </div>

        <!-- Warning if no employee -->
        <div v-if="!lane?.current_employee_name" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-amber-500 shrink-0" />
          <p class="text-xs text-amber-700">{{ isUz ? 'Yoʻlak boʻsh. Kamera kuzatuv rejimida.' : 'Дорожка свободна. Камера в режиме наблюдения.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

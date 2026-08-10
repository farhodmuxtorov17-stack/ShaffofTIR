<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import {
  Search, UserCheck, AlertCircle, Check, X,
  Radio, Users, MapPin, Scan, Zap,
  ArrowRight, Clock, Shield, Loader2, UserX,
  Crosshair, Target, ChevronRight, Repeat, Play, Camera, Video, Maximize
} from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import LiveTargetMini from '@/components/camera/LiveTargetMini.vue'

const auth = useAuthStore()
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

// --- Range / Rubeg selection
const ranges = computed(() => masterStore.ranges)
const rubegs = computed(() => masterStore.rubegs)
const selectedRangeId = ref(ranges.value[0]?.id || 'rg001')
const selectedRange = computed(() => ranges.value.find(r => r.id === selectedRangeId.value))
const rubegsForRange = computed(() => rubegs.value.filter(r => r.range_id === selectedRangeId.value))
const selectedRubegId = ref<string | null>(null)

// --- State
const loading = ref(true)
const rangeStatus = ref<'OPEN' | 'CLOSED'>('OPEN')
const searchQuery = ref('')
const identifiedEmployee = ref<any>(null)
const assignmentFlash = ref<any>(null)
const searchMode = ref<'search' | 'qr' | 'face'>('search')
const isSearching = ref(false)
const faceIdActive = ref(false)
const faceIdError = ref('')
const faceIdStep = ref<'scanning' | 'matched' | 'error'>('scanning')
const videoRef = ref<HTMLVideoElement | null>(null)
let mediaStream: MediaStream | null = null

// --- Session configuration (after FaceID + auto-assign)
const sessionConfig = ref<{
  show: boolean
  employee: any
  lane: any
  rubeg: any
  bullets: number
  distance: number
  exerciseType: string
  seriesCount: number
  weaponType: string
  scoringMode: string
}>({
  show: false,
  employee: null,
  lane: null,
  rubeg: null,
  bullets: 10,
  distance: 100,
  exerciseType: 'basic',
  seriesCount: 1,
  weaponType: 'AK-12',
  scoringMode: 'POINTS',
})

// --- Active sessions (lane id → session config)
const activeSessions = ref<Record<string, any>>({})
const selectedLaneDetail = ref<any>(null)

// Simulated shot data for live monitoring
const liveShotData = ref<Record<string, { shots: number; hits: number; accuracy: number; score: number }>>({})
let liveSimTimer: ReturnType<typeof setInterval> | null = null

function startLiveSimulation() {
  liveSimTimer = setInterval(() => {
    Object.entries(activeSessions.value).forEach(([laneId, session]: [string, any]) => {
      if (!liveShotData.value[laneId]) {
        liveShotData.value[laneId] = { shots: 0, hits: 0, accuracy: 0, score: 0 }
      }
      const data = liveShotData.value[laneId]
      if (data.shots < session.bullets) {
        const isHit = Math.random() < 0.72
        data.shots++
        if (isHit) {
          data.hits++
          data.score += Math.floor(Math.random() * 5) + 6
        }
        data.accuracy = Math.round((data.hits / data.shots) * 100)
        // Also update the lane
        const lane = lanes.value.find(l => l.id === laneId)
        if (lane) {
          lane.current_shots_fired = data.shots
          lane.current_score = data.score
        }
      }
    })
  }, 2500)
}

function stopLiveSimulation() {
  if (liveSimTimer) {
    clearInterval(liveSimTimer)
    liveSimTimer = null
  }
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
  startLiveSimulation()
})

onUnmounted(() => {
  stopCamera()
  stopLiveSimulation()
})

// --- Lanes
const lanes = computed(() => masterStore.lanes)
const availableLanes = computed(() => lanes.value.filter(l => l.status === 'AVAILABLE'))
const occupiedLanes = computed(() => lanes.value.filter(l => l.status === 'OCCUPIED'))
const maintenanceLanes = computed(() => lanes.value.filter(l => l.status === 'MAINTENANCE'))

// --- Employees (only ACTIVE, TB passed, shooting qualified)
const eligibleEmployees = computed(() =>
  masterStore.employees.filter(e => e.status === 'ACTIVE' && e.tb_test_passed && e.shooting_qualified)
)
const employeesOnLanes = computed(() =>
  new Set(Object.values(activeSessions.value).map((s: any) => s.employee_id))
)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase().trim()
  return eligibleEmployees.value
    .filter(e =>
      !employeesOnLanes.value.has(e.id) &&
      (e.full_name.toLowerCase().includes(q) || e.personal_number.toLowerCase().includes(q) || e.rank.toLowerCase().includes(q))
    )
    .slice(0, 8)
})

// --- Exercise presets
const exerciseTypes = [
  { id: 'basic', label: 'Базовое упражнение', labelUz: 'Asosiy mashq', defaultBullets: 10, defaultDistance: 100 },
  { id: 'speed', label: 'Скоростная стрельба', labelUz: 'Tezkor otish', defaultBullets: 15, defaultDistance: 50 },
  { id: 'night', label: 'Ночная стрельба', labelUz: 'Tungi otish', defaultBullets: 8, defaultDistance: 100 },
  { id: 'precision', label: 'Точность', labelUz: 'Aniqlik', defaultBullets: 5, defaultDistance: 200 },
  { id: 'combat', label: 'Боевое упражнение', labelUz: 'Jangovar mashq', defaultBullets: 20, defaultDistance: 100 },
]
const weaponTypes = ['AK-12', 'AK-74', 'СВД', 'Glock 17', 'ПК', 'РПК']

// --- Camera control
function stopCamera() {
  faceIdActive.value = false
  faceIdError.value = ''
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
}

// --- Face ID scan (main entry point)
async function startFaceId() {
  faceIdActive.value = true
  faceIdError.value = ''
  faceIdStep.value = 'scanning'
  searchMode.value = 'face'
  isSearching.value = true

  try {
    if (navigator.mediaDevices?.getUserMedia) {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      await new Promise(resolve => setTimeout(resolve, 200))
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        await videoRef.value.play().catch(() => {})
      }
    }
    await new Promise(resolve => setTimeout(resolve, 3000))

    const available = eligibleEmployees.value.filter(e => !employeesOnLanes.value.has(e.id) && e.face_id_registered)
    if (available.length > 0) {
      const employee = available[Math.floor(Math.random() * available.length)]
      faceIdStep.value = 'matched'
      await new Promise(resolve => setTimeout(resolve, 1200))
      autoAssignEmployee(employee)
    } else {
      faceIdStep.value = 'error'
      faceIdError.value = isUz.value ? 'Aniqlanmadi' : 'Сотрудник не распознан'
    }
    stopCamera()
    isSearching.value = false
    searchMode.value = 'search'
  } catch (err: any) {
    faceIdStep.value = 'error'
    faceIdError.value = isUz.value ? 'Kamera ochilmadi.' : 'Не удалось открыть камеру.'
    isSearching.value = false
    searchMode.value = 'search'
    setTimeout(() => { faceIdActive.value = false }, 2000)
  }
}

// --- Auto-assign: employee → first available lane
function autoAssignEmployee(employee: any) {
  const free = availableLanes.value
  if (free.length === 0) {
    assignmentFlash.value = { employee, lane: null, error: true, timestamp: new Date() }
    setTimeout(() => { assignmentFlash.value = null }, 4000)
    return
  }
  const lane = free[0]
  const rubeg = rubegsForRange.value.find(r => r.rubeg_number === lane.rubeg_number) || rubegsForRange.value[0]
  const exercise = exerciseTypes.find(e => e.id === 'basic')!
  sessionConfig.value = {
    show: true,
    employee,
    lane,
    rubeg,
    bullets: exercise.defaultBullets,
    distance: lane.distance_m || exercise.defaultDistance,
    exerciseType: exercise.id,
    seriesCount: 1,
    weaponType: (lane as any).weapon_type || 'AK-12',
    scoringMode: 'POINTS',
  }
  identifiedEmployee.value = null
}

// --- Manual search identification
function identifyEmployee(emp: any) {
  identifiedEmployee.value = emp
  searchQuery.value = ''
  searchMode.value = 'search'
}

// --- Start session from config modal
function confirmSessionConfig() {
  const cfg = sessionConfig.value
  if (!cfg.employee || !cfg.lane) return
  const lane = lanes.value.find(l => l.id === cfg.lane.id)
  if (lane) {
    lane.status = 'OCCUPIED'
    lane.current_employee_id = cfg.employee.id
    lane.current_employee_name = cfg.employee.full_name.split(' ').slice(0, 2).join(' ')
    lane.session_start_time = new Date().toISOString()
    lane.current_shots_fired = 0
    lane.current_score = 0
    lane.current_soldier_seq = Object.keys(activeSessions.value).length + 1
    ;(lane as any).weapon_assigned = cfg.weaponType
    lane.distance_m = cfg.distance
  }
  activeSessions.value[cfg.lane.id] = {
    employee_id: cfg.employee.id,
    employee_name: cfg.employee.full_name,
    lane_id: cfg.lane?.id,
    lane_number: cfg.lane?.lane_number,
    bullets: cfg.bullets,
    distance: cfg.distance,
    exercise_type: cfg.exerciseType,
    series_count: cfg.seriesCount,
    weapon_type: cfg.weaponType,
    scoring_mode: cfg.scoringMode,
    start_time: new Date().toISOString(),
    shots_fired: 0,
    score: 0,
  }
  assignmentFlash.value = {
    employee: cfg.employee,
    lane: cfg.lane,
    rubeg: cfg.rubeg,
    config: { bullets: cfg.bullets, distance: cfg.distance, exercise: cfg.exerciseType },
    timestamp: new Date(),
  }
  setTimeout(() => { assignmentFlash.value = null }, 5000)
  sessionConfig.value.show = false
}

function cancelSessionConfig() {
  sessionConfig.value.show = false
}

function onExerciseChange(exerciseId: string) {
  const exercise = exerciseTypes.find(e => e.id === exerciseId)
  if (exercise) {
    sessionConfig.value.bullets = exercise.defaultBullets
    sessionConfig.value.distance = exercise.defaultDistance
  }
}

// --- QR scan simulation
function simulateScan() {
  searchMode.value = 'qr'
  isSearching.value = true
  setTimeout(() => {
    const available = eligibleEmployees.value.filter(e => !employeesOnLanes.value.has(e.id))
    if (available.length > 0) identifyEmployee(available[Math.floor(Math.random() * available.length)])
    isSearching.value = false
    searchMode.value = 'search'
  }, 2000)
}

// --- Release lane / end session
function releaseLane(laneId: string) {
  const lane = lanes.value.find(l => l.id === laneId)
  if (!lane) return
  lane.status = 'AVAILABLE'
  lane.current_employee_id = null
  lane.current_employee_name = null
  lane.session_start_time = null
  lane.current_shots_fired = 0
  lane.current_score = 0
  lane.current_soldier_seq = undefined
  delete activeSessions.value[laneId]
  delete liveShotData.value[laneId]
}

function getLiveShots(laneId: string) {
  return liveShotData.value[laneId] || { shots: 0, hits: 0, accuracy: 0, score: 0 }
}

// --- Lane detail modal (live camera + target)
function openLaneDetail(lane: any) {
  selectedLaneDetail.value = lane
}

function closeLaneDetail() {
  selectedLaneDetail.value = null
}

// --- Helpers
function getLaneColor(status: string) {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-50 border-green-200 text-green-700'
    case 'OCCUPIED': return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'MAINTENANCE': return 'bg-red-50 border-red-200 text-red-700'
    case 'RESERVED': return 'bg-amber-50 border-amber-200 text-amber-700'
    default: return 'bg-gray-50 border-gray-200 text-gray-700'
  }
}

function minsAgo(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return isUz.value ? 'hozir' : 'сейчас'
  return `${diff} ${isUz.value ? 'daq' : 'мин'}`
}

function getExerciseLabel(id: string) {
  const ex = exerciseTypes.find(e => e.id === id)
  return isUz.value ? ex?.labelUz : ex?.label
}
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-if="!loading" class="fade-in p-4 space-y-4 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">
          {{ isUz ? 'Instruktor plansheti' : 'Планшет инструктора' }}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ isUz ? "Face ID → avto-tayinlash → sessiyani sozlash" : 'Face ID → авто-назначение → настройка сессии' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="rangeStatus = rangeStatus === 'OPEN' ? 'CLOSED' : 'OPEN'"
          class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
          :class="rangeStatus === 'OPEN' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
          {{ rangeStatus === 'OPEN' ? (isUz ? 'TIR OCHIQ' : 'ТИР ОТКРЫТ') : (isUz ? 'TIR YOPIQ' : 'ТИР ЗАКРЫТ') }}
        </button>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span class="text-xs font-medium text-green-700">{{ availableLanes.length }} {{ isUz ? "boʻsh" : 'свободно' }}</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
          <span class="text-xs font-medium text-blue-700">{{ occupiedLanes.length }} {{ isUz ? 'band' : 'занято' }}</span>
        </div>
      </div>
    </div>

    <!-- Range Selector -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-xs font-medium text-gray-500">{{ isUz ? "Tirni tanlang:" : "Выбрать тир:" }}</span>
      <button v-for="range in ranges" :key="range.id" @click="selectedRangeId = range.id"
        class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
        :class="selectedRangeId === range.id ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
        {{ range.name }}
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" :class="range.range_type === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'">
          {{ range.range_type === 'OPEN' ? (isUz ? 'Ochiq' : 'Откр.') : (isUz ? 'Yopi' : 'Закр.') }}
        </span>
      </button>
    </div>

    <!-- Rubeg Selector -->
    <div v-if="rubegsForRange.length > 0" class="flex items-center gap-2 flex-wrap">
      <span class="text-xs font-medium text-gray-500">{{ isUz ? "Rubeg:" : "Рубеж:" }}</span>
      <button v-for="rubeg in rubegsForRange" :key="rubeg.id" @click="selectedRubegId = rubeg.id"
        class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
        :class="selectedRubegId === rubeg.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-brand-50'">
        {{ isUz ? `Rubeg ${rubeg.rubeg_number}` : `Рубеж ${rubeg.rubeg_number}` }} · {{ rubeg.weapon_type }} · {{ rubeg.distance_m }}{{ isUz ? 'm' : 'м' }}
      </button>
    </div>

    <!-- Assignment Flash -->
    <div v-if="assignmentFlash" class="flex items-center gap-4 p-4 rounded-xl shadow-lg fade-in"
      :class="assignmentFlash.error ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-green-500 to-green-600 text-white'">
      <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <X v-if="assignmentFlash.error" class="w-6 h-6" />
        <Check v-else class="w-6 h-6" />
      </div>
      <div class="flex-1">
        <p class="text-lg font-bold">{{ assignmentFlash.employee.full_name.split(' ').slice(0, 2).join(' ') }}</p>
        <p class="text-sm text-white/90 flex items-center gap-1.5">
          <MapPin class="w-4 h-4" />
          <template v-if="!assignmentFlash.error">
            → {{ isUz ? "Yo'lqa" : 'Дорожка' }} {{ assignmentFlash.lane.lane_number }} ({{ assignmentFlash.config?.distance }}{{ isUz ? 'm' : 'м' }})
            · {{ assignmentFlash.config?.bullets }} {{ isUz ? "o'q" : 'патр.' }}
            · {{ getExerciseLabel(assignmentFlash.config?.exercise) }}
          </template>
          <template v-else>{{ isUz ? "Bo'sh yo'lqa yo'q" : 'Нет свободных дорожек' }}</template>
        </p>
      </div>
      <div v-if="!assignmentFlash.error" class="text-right">
        <p class="text-xs text-white/70">{{ isUz ? "Yoʻnaltirildi" : 'Направлен' }}</p>
        <p class="text-2xl font-bold">{{ assignmentFlash.lane.lane_number }}</p>
      </div>
    </div>

    <!-- Main Face ID Scan Button -->
    <div class="card p-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
            <Scan class="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ isUz ? 'Face ID orqali aniqlash' : 'Идентификация через Face ID' }}</h2>
            <p class="text-sm text-gray-500">{{ isUz ? "Kameraga qarang — sistema avtomatik aniqlaydi va yo'lkaga tayinlaydi" : 'Посмотрите в камеру — система автоматически определит и назначит на дорожку' }}</p>
          </div>
        </div>
        <button class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          @click="startFaceId" :disabled="isSearching || availableLanes.length === 0"
          :class="(isSearching || availableLanes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''">
          <Loader2 v-if="isSearching" class="w-5 h-5 animate-spin" />
          <UserCheck v-else class="w-5 h-5" />
          {{ isSearching ? (isUz ? 'Aniqlanmoqda...' : 'Сканирование...') : (isUz ? 'Face ID ni boshlash' : 'Начать Face ID') }}
        </button>
      </div>

      <div class="flex items-center gap-3 my-4">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400">{{ isUz ? 'yoki qoʻlda qidirish' : 'или ручной поиск' }}</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input v-model="searchQuery" class="input text-sm pl-9" :placeholder="isUz ? 'Ism, shaxsiy raqam...' : 'Имя, личный номер...'" />
        </div>
        <button class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50 transition"
          @click="simulateScan" :disabled="isSearching">
          <Scan class="w-4 h-4" /> QR
        </button>
      </div>

      <div v-if="searchResults.length > 0" class="mt-3 space-y-1 max-h-48 overflow-y-auto">
        <button v-for="emp in searchResults" :key="emp.id"
          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-brand-50 transition text-left"
          @click="autoAssignEmployee(emp)">
          <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">{{ emp.full_name[0] }}</div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800 truncate">{{ emp.full_name }}</p>
            <p class="text-xs text-gray-400">{{ emp.rank }} · {{ emp.personal_number }}</p>
          </div>
          <div class="flex items-center gap-1 text-xs text-brand-600 font-medium">
            {{ isUz ? "Tayinlash" : 'Назначить' }} <ChevronRight class="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>

    <!-- Lane Grid -->
    <div class="card p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Radio class="w-4 h-4 text-brand-600" />
          <h2 class="text-sm font-bold text-gray-800">{{ isUz ? "Yo'lkalar holati" : 'Состояние дорожек' }}</h2>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <Shield class="w-3.5 h-3.5" />
          {{ selectedRange?.name }}
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="lane in lanes" :key="lane.id" class="rounded-xl border-2 p-3 transition" :class="getLaneColor(lane.status)">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                :class="lane.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : lane.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'">
                {{ lane.lane_number }}
              </div>
              <div>
                <p class="text-xs font-bold">{{ isUz ? `Yo'lqa ${lane.lane_number}` : `Дорожка ${lane.lane_number}` }}</p>
                <p class="text-[10px] opacity-70">{{ lane.distance_m }}{{ isUz ? 'm' : 'м' }} · {{ lane.target_type }}</p>
              </div>
            </div>
            <div class="w-2 h-2 rounded-full" :class="lane.status === 'AVAILABLE' ? 'bg-green-500' : lane.status === 'OCCUPIED' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'"></div>
          </div>

          <!-- Occupied with session info + LIVE camera & target -->
          <div v-if="lane.status === 'OCCUPIED' && activeSessions[lane.id]" class="space-y-1.5">
            <p class="text-sm font-medium truncate">{{ activeSessions[lane.id].employee_name.split(' ').slice(0, 2).join(' ') }}</p>
            <div class="flex items-center gap-2 text-[10px] opacity-70 flex-wrap">
              <span class="flex items-center gap-0.5"><Clock class="w-2.5 h-2.5" /> {{ minsAgo(lane.session_start_time) }}</span>
              <span class="flex items-center gap-0.5"><Crosshair class="w-2.5 h-2.5" /> {{ activeSessions[lane.id].bullets }} {{ isUz ? "o'q" : 'патр.' }}</span>
              <span class="flex items-center gap-0.5"><Target class="w-2.5 h-2.5" /> {{ activeSessions[lane.id].distance }}{{ isUz ? 'm' : 'м' }}</span>
            </div>
            <div class="flex items-center gap-1 text-[10px]">
              <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{{ getExerciseLabel(activeSessions[lane.id].exercise_type) }}</span>
              <span v-if="activeSessions[lane.id].series_count > 1" class="flex items-center gap-0.5 px-1 py-0.5 rounded bg-gray-100 text-gray-600">
                <Repeat class="w-2.5 h-2.5" /> {{ activeSessions[lane.id].series_count }}
              </span>
            </div>
            <!-- LIVE Camera + Target mini views -->
            <div class="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-gray-200">
              <div class="relative cursor-pointer" @click.stop="openLaneDetail(lane)">
                <LiveCameraMini :lane-number="lane.lane_number" status="ONLINE" :employee-name="activeSessions[lane.id].employee_name.split(' ').slice(0, 2).join(' ')" :is-shooting="getLiveShots(lane.id).shots < activeSessions[lane.id].bullets" :height="80" />
              </div>
              <div class="relative cursor-pointer" @click.stop="openLaneDetail(lane)">
                <LiveTargetMini :lane-number="lane.lane_number" :accuracy="getLiveShots(lane.id).accuracy" :shots-fired="getLiveShots(lane.id).shots" :hits="getLiveShots(lane.id).hits" :is-shooting="getLiveShots(lane.id).shots < activeSessions[lane.id].bullets" :size="80" compact />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-gray-500">{{ getLiveShots(lane.id).shots }}/{{ activeSessions[lane.id].bullets }} {{ isUz ? 'otish' : 'выстр.' }}</span>
              <span class="flex items-center gap-1">
                <span class="text-[10px] font-bold" :class="getLiveShots(lane.id).accuracy >= 70 ? 'text-green-600' : getLiveShots(lane.id).accuracy >= 50 ? 'text-amber-600' : 'text-red-600'">{{ getLiveShots(lane.id).accuracy }}%</span>
                <span v-if="lane.current_score" class="text-[10px] font-bold text-blue-700">{{ lane.current_score }} {{ isUz ? 'ball' : 'балл' }}</span>
              </span>
            </div>
            <div class="flex gap-1">
              <button class="flex-1 text-[10px] py-1 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium transition flex items-center justify-center gap-1" @click.stop="openLaneDetail(lane)">
                <Video class="w-3 h-3" /> {{ isUz ? "Jonli" : 'LIVE' }}
              </button>
              <button class="flex-1 text-[10px] py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-medium transition" @click="releaseLane(lane.id)">
                {{ isUz ? "Tugatish" : 'Завершить' }}
              </button>
            </div>
          </div>

          <!-- Occupied without session info (legacy) -->
          <div v-else-if="lane.status === 'OCCUPIED' && lane.current_employee_name" class="space-y-1">
            <p class="text-sm font-medium truncate">{{ lane.current_employee_name }}</p>
            <div class="flex items-center gap-2 text-[10px] opacity-70">
              <span class="flex items-center gap-0.5"><Clock class="w-2.5 h-2.5" /> {{ minsAgo(lane.session_start_time) }}</span>
              <span>{{ lane.current_shots_fired }} {{ isUz ? 'otish' : 'выстр.' }}</span>
            </div>
            <button class="w-full mt-1.5 text-[10px] py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-medium transition" @click="releaseLane(lane.id)">
              {{ isUz ? "Boʻshatish" : 'Освободить' }}
            </button>
          </div>

          <!-- Available -->
          <div v-else-if="lane.status === 'AVAILABLE'" class="text-center py-2">
            <p class="text-xs font-medium opacity-80">{{ isUz ? "Boʻsh" : 'Свободна' }}</p>
            <div v-if="lane.camera_status === 'ONLINE'" class="flex items-center justify-center gap-1 mt-1">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span class="text-[10px] opacity-60">{{ isUz ? 'Kamera on' : 'Камера вкл' }}</span>
            </div>
          </div>

          <!-- Maintenance -->
          <div v-else class="text-center py-2">
            <p class="text-xs font-medium opacity-80">{{ isUz ? "Ta'mir" : 'Обслуживание' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Face ID Camera Modal -->
    <Teleport to="body">
      <div v-if="faceIdActive" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="stopCamera">
        <div class="relative bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold text-sm">{{ isUz ? 'Yuzni aniqlash' : 'Face ID — Распознавание' }}</h3>
            <button @click="stopCamera" class="text-gray-400 hover:text-white transition"><X class="w-5 h-5" /></button>
          </div>
          <div class="relative rounded-xl overflow-hidden bg-black aspect-[4/3] mb-4">
            <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />
            <div v-if="faceIdStep === 'scanning'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-40 h-48 border-2 border-green-400 rounded-2xl relative">
                <div class="absolute inset-x-0 h-0.5 bg-green-400 shadow-lg animate-[scan_2s_ease-in-out_infinite]" style="top: 50%"></div>
                <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl-xl"></div>
                <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr-xl"></div>
                <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl-xl"></div>
                <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br-xl"></div>
              </div>
            </div>
            <div v-if="faceIdStep === 'matched'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-40 h-48 border-2 border-green-400 rounded-2xl flex items-center justify-center">
                <Check class="w-16 h-16 text-green-400" />
              </div>
            </div>
            <div v-if="faceIdStep === 'error'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-40 h-48 border-2 border-red-400 rounded-2xl flex items-center justify-center">
                <X class="w-16 h-16 text-red-400" />
              </div>
            </div>
            <div v-if="faceIdStep === 'scanning'" class="absolute bottom-3 left-0 right-0 text-center">
              <p class="text-green-400 text-xs font-medium animate-pulse">{{ isUz ? 'Aniqlanmoqda...' : 'Сканирование...' }}</p>
            </div>
            <div v-else-if="faceIdStep === 'matched'" class="absolute bottom-3 left-0 right-0 text-center">
              <p class="text-green-400 text-xs font-medium">{{ isUz ? "Aniqlandi!" : 'Распознан!' }}</p>
            </div>
          </div>
          <div v-if="faceIdError" class="text-center text-red-400 text-sm mb-2">{{ faceIdError }}</div>
          <p v-else-if="faceIdStep === 'scanning'" class="text-center text-gray-400 text-xs">{{ isUz ? 'Kameraga qarang' : 'Смотрите в камеру' }}</p>
        </div>
      </div>
    </Teleport>

    <!-- Session Configuration Modal -->
    <Teleport to="body">
      <div v-if="sessionConfig.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="cancelSessionConfig">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div class="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><UserCheck class="w-5 h-5 text-white" /></div>
                <div>
                  <p class="text-white font-bold">{{ sessionConfig.employee?.full_name.split(' ').slice(0, 2).join(' ') }}</p>
                  <p class="text-white/70 text-xs">{{ sessionConfig.employee?.rank }} · {{ sessionConfig.employee?.personal_number }}</p>
                </div>
              </div>
              <button @click="cancelSessionConfig" class="text-white/70 hover:text-white"><X class="w-5 h-5" /></button>
            </div>
          </div>
          <div class="px-6 py-3 bg-green-50 border-b border-green-100">
            <div class="flex items-center gap-2 text-sm">
              <MapPin class="w-4 h-4 text-green-600" />
              <span class="text-green-700 font-medium">
                {{ isUz ? "Avto-tayinlandi:" : 'Авто-назначен:' }} {{ isUz ? "Yo'lqa" : 'Дорожка' }} {{ sessionConfig.lane?.lane_number }}
                · {{ sessionConfig.rubeg ? (isUz ? `Rubeg ${sessionConfig.rubeg.rubeg_number}` : `Рубеж ${sessionConfig.rubeg.rubeg_number}`) : '' }}
              </span>
            </div>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{{ isUz ? "Mashq turi" : 'Тип упражнения' }}</label>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="ex in exerciseTypes" :key="ex.id"
                  class="px-3 py-2 rounded-lg text-xs font-medium border-2 transition text-left"
                  :class="sessionConfig.exerciseType === ex.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  @click="sessionConfig.exerciseType = ex.id; onExerciseChange(ex.id)">
                  {{ isUz ? ex.labelUz : ex.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{{ isUz ? "Qurol turi" : 'Тип оружия' }}</label>
              <select v-model="sessionConfig.weaponType" class="input text-sm">
                <option v-for="w in weaponTypes" :key="w" :value="w">{{ w }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{{ isUz ? "O'qlar soni" : 'Патроны' }}</label>
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" @click="sessionConfig.bullets = Math.max(1, sessionConfig.bullets - 1)">−</button>
                  <input v-model.number="sessionConfig.bullets" type="number" min="1" max="100" class="input text-sm text-center font-bold" />
                  <button class="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" @click="sessionConfig.bullets = Math.min(100, sessionConfig.bullets + 1)">+</button>
                </div>
              </div>
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{{ isUz ? "Masofa (m)" : 'Расстояние (м)' }}</label>
                <select v-model.number="sessionConfig.distance" class="input text-sm">
                  <option :value="25">25 м</option><option :value="50">50 м</option><option :value="100">100 м</option>
                  <option :value="150">150 м</option><option :value="200">200 м</option><option :value="300">300 м</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{{ isUz ? "Seriya soni" : 'Количество серий' }}</label>
              <div class="flex items-center gap-2">
                <button v-for="n in 3" :key="n" class="flex-1 py-2 rounded-lg text-sm font-medium border-2 transition"
                  :class="sessionConfig.seriesCount === n ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  @click="sessionConfig.seriesCount = n">{{ n }}</button>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex gap-3">
            <button @click="cancelSessionConfig" class="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition">
              {{ isUz ? "Bekor qilish" : 'Отмена' }}
            </button>
            <button @click="confirmSessionConfig" class="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
              <Play class="w-4 h-4" /> {{ isUz ? "Sessiyani boshlash" : 'Начать сессию' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- LIVE Monitoring Bar (prominent section for tablet/phone) -->
    <div v-if="Object.keys(activeSessions).length > 0" class="card overflow-hidden">
      <div class="px-4 py-3 bg-gradient-to-r from-gray-900 to-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <h2 class="text-sm font-bold text-white">{{ isUz ? 'JONLI TRANSLYATSIYA' : 'LIVE ТРАНСЛЯЦИЯ' }}</h2>
          <span class="text-[10px] text-gray-400 ml-1">{{ Object.keys(activeSessions).length }} {{ isUz ? "aktiv dor" : 'активн. дорожек' }}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] text-gray-400">
          <Radio class="w-3.5 h-3.5 text-red-400" />
          <span>REC</span>
          <span class="text-gray-600">|</span>
          <span>{{ new Date().toLocaleTimeString('en-GB') }}</span>
        </div>
      </div>
      <div class="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-950">
        <div v-for="(session, laneId) in activeSessions" :key="laneId" class="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div class="px-3 py-2 flex items-center justify-between bg-gray-800/50">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white">{{ isUz ? "Yo'lqa" : 'Дорожка' }} {{ session.lane_number }}</span>
              <span class="text-[10px] text-gray-400">{{ session.employee_name.split(' ').slice(0, 2).join(' ') }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span class="text-[9px] font-mono text-red-400 font-bold">LIVE</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-px bg-gray-800">
            <div class="relative cursor-pointer" @click="openLaneDetail(lanes.find(l => l.id === laneId))">
              <LiveCameraMini :lane-number="session.lane_number" status="ONLINE" :employee-name="session.employee_name.split(' ').slice(0, 2).join(' ')" :is-shooting="getLiveShots(laneId as string).shots < session.bullets" :height="120" />
            </div>
            <div class="relative cursor-pointer" @click="openLaneDetail(lanes.find(l => l.id === laneId))">
              <LiveTargetMini :lane-number="session.lane_number" :accuracy="getLiveShots(laneId as string).accuracy" :shots-fired="getLiveShots(laneId as string).shots" :hits="getLiveShots(laneId as string).hits" :is-shooting="getLiveShots(laneId as string).shots < session.bullets" :size="120" />
            </div>
          </div>
          <div class="px-3 py-2 bg-gray-800/30">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-gray-400">{{ getLiveShots(laneId as string).shots }}/{{ session.bullets }} {{ isUz ? "o'q" : 'патр.' }}</span>
              <span class="font-bold" :class="getLiveShots(laneId as string).accuracy >= 70 ? 'text-green-400' : getLiveShots(laneId as string).accuracy >= 50 ? 'text-amber-400' : 'text-red-400'">{{ getLiveShots(laneId as string).accuracy }}%</span>
              <span class="text-blue-400 font-bold">{{ getLiveShots(laneId as string).score }} {{ isUz ? 'ball' : 'балл' }}</span>
            </div>
            <div class="mt-1.5 h-1 rounded-full bg-gray-700 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :class="getLiveShots(laneId as string).accuracy >= 70 ? 'bg-green-500' : getLiveShots(laneId as string).accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'" :style="{ width: (getLiveShots(laneId as string).shots / session.bullets * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lane Detail Modal (full camera + target) -->
    <Teleport to="body">
      <div v-if="selectedLaneDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeLaneDetail" />
        <div class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-r from-gray-900 to-slate-800 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Video class="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p class="text-xs text-gray-400">{{ isUz ? "Yo'lqa" : 'Дорожка' }} {{ selectedLaneDetail.lane_number }} · {{ selectedLaneDetail.distance_m }}{{ isUz ? 'm' : 'м' }}</p>
                <p class="text-sm font-bold">{{ activeSessions[selectedLaneDetail.id]?.employee_name }}</p>
              </div>
            </div>
            <button @click="closeLaneDetail" class="text-gray-400 hover:text-white"><X class="w-5 h-5" /></button>
          </div>
          <div class="p-4 space-y-4">
            <!-- Big camera + target side by side -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex items-center gap-1.5 mb-2">
                  <Camera class="w-4 h-4 text-gray-500" />
                  <span class="text-xs font-bold text-gray-700">{{ isUz ? 'Kamera' : 'Камера' }}</span>
                  <span class="ml-auto flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span class="text-[9px] font-mono text-red-500 font-bold">LIVE</span>
                  </span>
                </div>
                <LiveCameraMini :lane-number="selectedLaneDetail.lane_number" status="ONLINE" :employee-name="activeSessions[selectedLaneDetail.id]?.employee_name" :is-shooting="getLiveShots(selectedLaneDetail.id).shots < activeSessions[selectedLaneDetail.id]?.bullets" :height="220" />
              </div>
              <div>
                <div class="flex items-center gap-1.5 mb-2">
                  <Crosshair class="w-4 h-4 text-gray-500" />
                  <span class="text-xs font-bold text-gray-700">{{ isUz ? 'Mishen' : 'Мишень' }}</span>
                  <span class="ml-auto flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span class="text-[9px] font-mono text-red-500 font-bold">LIVE</span>
                  </span>
                </div>
                <LiveTargetMini :lane-number="selectedLaneDetail.lane_number" :accuracy="getLiveShots(selectedLaneDetail.id).accuracy" :shots-fired="getLiveShots(selectedLaneDetail.id).shots" :hits="getLiveShots(selectedLaneDetail.id).hits" :is-shooting="getLiveShots(selectedLaneDetail.id).shots < activeSessions[selectedLaneDetail.id]?.bullets" :size="220" />
              </div>
            </div>
            <!-- Live stats -->
            <div class="grid grid-cols-4 gap-2">
              <div class="text-center p-2.5 rounded-lg bg-gray-50">
                <p class="text-[10px] text-gray-400 mb-0.5">{{ isUz ? "O'qlar" : 'Выстрелы' }}</p>
                <p class="text-lg font-bold text-gray-800">{{ getLiveShots(selectedLaneDetail.id).shots }}/{{ activeSessions[selectedLaneDetail.id]?.bullets }}</p>
              </div>
              <div class="text-center p-2.5 rounded-lg bg-gray-50">
                <p class="text-[10px] text-gray-400 mb-0.5">{{ isUz ? "Aniqlik" : 'Точность' }}</p>
                <p class="text-lg font-bold" :class="getLiveShots(selectedLaneDetail.id).accuracy >= 70 ? 'text-green-600' : getLiveShots(selectedLaneDetail.id).accuracy >= 50 ? 'text-amber-600' : 'text-red-600'">{{ getLiveShots(selectedLaneDetail.id).accuracy }}%</p>
              </div>
              <div class="text-center p-2.5 rounded-lg bg-gray-50">
                <p class="text-[10px] text-gray-400 mb-0.5">{{ isUz ? "Ball" : 'Очки' }}</p>
                <p class="text-lg font-bold text-blue-600">{{ getLiveShots(selectedLaneDetail.id).score }}</p>
              </div>
              <div class="text-center p-2.5 rounded-lg bg-gray-50">
                <p class="text-[10px] text-gray-400 mb-0.5">{{ isUz ? "Urish" : 'Попад.' }}</p>
                <p class="text-lg font-bold text-green-600">{{ getLiveShots(selectedLaneDetail.id).hits }}</p>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-gray-400">{{ isUz ? "Progress" : 'Прогресс' }}</span>
                <span class="text-gray-600 font-medium">{{ Math.round(getLiveShots(selectedLaneDetail.id).shots / activeSessions[selectedLaneDetail.id]?.bullets * 100) }}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="getLiveShots(selectedLaneDetail.id).accuracy >= 70 ? 'bg-green-500' : getLiveShots(selectedLaneDetail.id).accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'" :style="{ width: (getLiveShots(selectedLaneDetail.id).shots / activeSessions[selectedLaneDetail.id]?.bullets * 100) + '%' }"></div>
              </div>
            </div>
            <div class="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-xs">
              <Clock class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-gray-500">{{ isUz ? "Boshlangan" : 'Начата' }}: {{ minsAgo(selectedLaneDetail.session_start_time) }}</span>
              <span class="text-gray-300">·</span>
              <Crosshair class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-gray-500">{{ getExerciseLabel(activeSessions[selectedLaneDetail.id]?.exercise_type) }}</span>
              <span class="text-gray-300">·</span>
              <Target class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-gray-500">{{ activeSessions[selectedLaneDetail.id]?.distance }}{{ isUz ? 'm' : 'м' }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
@keyframes scan {
  0%, 100% { top: 10%; }
  50% { top: 90%; }
}
</style>

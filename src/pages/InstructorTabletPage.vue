<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import {
  Search, UserCheck, AlertCircle, Check, X,
  Radio, Users, MapPin, Scan, Zap,
  ArrowRight, Clock, Shield, Loader2, UserX
} from 'lucide-vue-next'

const auth = useAuthStore()
const masterStore = useMasterStore()
const ranges = computed(() => masterStore.ranges)
const rubegs = computed(() => masterStore.rubegs)
const selectedRangeId = ref("rg001")
const selectedRange = computed(() => ranges.value.find(r => r.id === selectedRangeId.value))
const rubegsForRange = computed(() => rubegs.value.filter(r => r.range_id === selectedRangeId.value))
const { locale, t } = useI18n()

const isUz = computed(() => locale.value === 'uz')

// ── State ──
const loading = ref(true)
const rangeStatus = ref<"OPEN" | "CLOSED">("OPEN")
const searchQuery = ref('')
const identifiedEmployee = ref<any>(null)
const assignmentQueue = ref<any[]>([])
const assignmentFlash = ref<any>(null)
const searchMode = ref<'search' | 'qr' | 'face'>('search')
const isSearching = ref(false)
const faceIdActive = ref(false)
const faceIdError = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)
let mediaStream: MediaStream | null = null

function stopCamera() {
  faceIdActive.value = false
  faceIdError.value = ''
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

// ── Lanes ──
const lanes = computed(() => masterStore.lanes)

const availableLanes = computed(() =>
  lanes.value.filter(l => l.status === 'AVAILABLE')
)

const occupiedLanes = computed(() =>
  lanes.value.filter(l => l.status === 'OCCUPIED')
)

const maintenanceLanes = computed(() =>
  lanes.value.filter(l => l.status === 'MAINTENANCE')
)

// ── Employees (only ACTIVE, TB passed, shooting qualified) ──
const eligibleEmployees = computed(() =>
  masterStore.employees.filter(e =>
    e.status === 'ACTIVE' &&
    e.tb_test_passed &&
    e.shooting_qualified
  )
)

// Search results (exclude already in queue or on lane)
const employeesOnLanes = computed(() =>
  new Set(lanes.value.filter(l => l.current_employee_id).map(l => l.current_employee_id))
)

const employeesInQueue = computed(() =>
  new Set(assignmentQueue.value.map(q => q.employee.id))
)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase().trim()
  return eligibleEmployees.value
    .filter(e =>
      !employeesOnLanes.value.has(e.id) &&
      !employeesInQueue.value.has(e.id) &&
      (e.full_name.toLowerCase().includes(q) ||
       e.personal_number.toLowerCase().includes(q) ||
       e.rank.toLowerCase().includes(q))
    )
    .slice(0, 8)
})

// ── Identify employee ──
function identifyEmployee(emp: any) {
  identifiedEmployee.value = emp
  searchQuery.value = ''
  searchMode.value = 'search'
}

function clearIdentification() {
  identifiedEmployee.value = null
}

// ── Queue management ──
function addToQueue() {
  if (!identifiedEmployee.value) return

  assignmentQueue.value.push({
    employee: identifiedEmployee.value,
    addedAt: new Date(),
    assignedLane: null,
  })

  identifiedEmployee.value = null
}

function removeFromQueue(idx: number) {
  assignmentQueue.value.splice(idx, 1)
}

// ── Auto-assign logic: sequential by queue order ──
function autoAssignNext() {
  const unassigned = assignmentQueue.value.filter(q => !q.assignedLane)
  if (unassigned.length === 0) return

  const free = availableLanes.value
  if (free.length === 0) {
    // No free lanes - can't assign
    return
  }

  // Assign first unassigned to first available lane
  const next = unassigned[0]
  const lane = free[0]

  // Mark as assigned
  next.assignedLane = lane

  // Update lane status
  lane.status = 'OCCUPIED'
  lane.current_employee_id = next.employee.id
  lane.current_employee_name = next.employee.full_name.split(' ').slice(0, 2).join(' ')
  lane.session_start_time = new Date().toISOString()
  lane.current_shots_fired = 0
  lane.current_score = 0
  lane.current_soldier_seq = 1

  // Show flash assignment
  assignmentFlash.value = {
    employee: next.employee,
    lane: lane,
    timestamp: new Date(),
  }

  // Remove from queue after assignment
  const queueIdx = assignmentQueue.value.findIndex(q => q === next)
  if (queueIdx !== -1) {
    assignmentQueue.value.splice(queueIdx, 1)
  }

  // Clear flash after 5 seconds
  setTimeout(() => {
    if (assignmentFlash.value) {
      assignmentFlash.value = null
    }
  }, 5000)
}

// Assign all queue to available lanes
function autoAssignAll() {
  while (availableLanes.value.length > 0 && assignmentQueue.value.length > 0) {
    autoAssignNext()
  }
}

// Manual assign to specific lane
function manualAssign(queueIdx: number, laneId: string) {
  const item = assignmentQueue.value[queueIdx]
  const lane = lanes.value.find(l => l.id === laneId)
  if (!lane || lane.status !== 'AVAILABLE') return

  item.assignedLane = lane
  lane.status = 'OCCUPIED'
  lane.current_employee_id = item.employee.id
  lane.current_employee_name = item.employee.full_name.split(' ').slice(0, 2).join(' ')
  lane.session_start_time = new Date().toISOString()
  lane.current_shots_fired = 0
  lane.current_score = 0
  lane.current_soldier_seq = 1

  assignmentFlash.value = {
    employee: item.employee,
    lane: lane,
    timestamp: new Date(),
  }

  assignmentQueue.value.splice(queueIdx, 1)

  setTimeout(() => {
    if (assignmentFlash.value) assignmentFlash.value = null
  }, 5000)
}

// Release a lane
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
}

// ── QR/Face ID simulation ──
function simulateScan() {
  searchMode.value = 'qr'
  isSearching.value = true
  setTimeout(() => {
    // Pick a random eligible employee not already assigned
    const available = eligibleEmployees.value.filter(e =>
      !employeesOnLanes.value.has(e.id) &&
      !employeesInQueue.value.has(e.id)
    )
    if (available.length > 0) {
      identifiedEmployee.value = available[Math.floor(Math.random() * available.length)]
    }
    isSearching.value = false
    searchMode.value = 'search'
  }, 2000)
}

async function simulateFaceId() {
  // Open camera for Face ID identification
  faceIdActive.value = true
  faceIdError.value = ''
  searchMode.value = 'face'
  isSearching.value = true

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    })

    // Wait for video element to render
    await new Promise(resolve => setTimeout(resolve, 200))
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play().catch(() => {})
    }

    // Simulate face detection scan (camera stays open ~3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Pick a random eligible employee with face_id registered
    const available = eligibleEmployees.value.filter(e =>
      !employeesOnLanes.value.has(e.id) &&
      !employeesInQueue.value.has(e.id) &&
      e.face_id_registered
    )
    if (available.length > 0) {
      identifiedEmployee.value = available[Math.floor(Math.random() * available.length)]
    } else {
      faceIdError.value = isUz.value ? 'Aniqlanmadi' : 'Не распознано'
    }

    stopCamera()
    isSearching.value = false
    searchMode.value = 'search'
  } catch (err: any) {
    faceIdError.value = isUz.value
      ? 'Kamera ochilmadi. Ruxsat bering.'
      : 'Не удалось открыть камеру. Разрешите доступ.'
    isSearching.value = false
    searchMode.value = 'search'
    // Keep modal open so user sees error, close after 2s
    setTimeout(() => { faceIdActive.value = false }, 2000)
  }
}

// ── Helpers ──
function getLaneColor(status: string) {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-50 border-green-200 text-green-700'
    case 'OCCUPIED': return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'MAINTENANCE': return 'bg-red-50 border-red-200 text-red-700'
    case 'RESERVED': return 'bg-amber-50 border-amber-200 text-amber-700'
    default: return 'bg-gray-50 border-gray-200 text-gray-700'
  }
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function minsAgo(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return isUz.value ? 'hozir' : 'сейчас'
  return `${diff} ${isUz.value ? 'daq' : 'мин'}`
}
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-if="!loading" class="fade-in p-4 space-y-4 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">
          {{ isUz ? 'Instruktor plansheti' : 'Планшет инструктора' }}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ isUz ? "Xodimlarni aniqlash va yo'lkalar bo'yicha taqsimlash" : 'Идентификация сотрудников и распределение по дорожкам' }}
        </p>
      </div>
      <!-- Range Status Toggle -->
      <div class="flex items-center gap-2">
        <button @click="rangeStatus = rangeStatus === 'OPEN' ? 'CLOSED' : 'OPEN'" 
          class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors" 
          :class="rangeStatus === 'OPEN' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
          {{ rangeStatus === 'OPEN' ? (isUz ? 'TIR OCHIQ' : 'ТИР ОТКРЫТ') : (isUz ? 'TIR YOPIQ' : 'ТИР ЗАКРЫТ') }}
        </button>
      </div>
      <!-- Lane stats -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span class="text-xs font-medium text-green-700">{{ availableLanes.length }} {{ isUz ? "bo'sh" : 'свободно' }}</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
          <span class="text-xs font-medium text-blue-700">{{ occupiedLanes.length }} {{ isUz ? 'band' : 'занято' }}</span>
        </div>
        <div v-if="maintenanceLanes.length" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <span class="text-xs font-medium text-red-700">{{ maintenanceLanes.length }} {{ isUz ? 'ta\'mir' : 'ТО' }}</span>
        </div>
      </div>
    </div>

    <!-- Assignment Flash (big notification) -->
    <div v-if="assignmentFlash" class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg fade-in">
      <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <Check class="w-6 h-6" />
      </div>
      <div class="flex-1">
        <p class="text-lg font-bold">
          {{ assignmentFlash.employee.full_name.split(' ').slice(0, 2).join(' ') }}
        </p>
        <p class="text-sm text-white/90 flex items-center gap-1.5">
          <MapPin class="w-4 h-4" />
          → {{ isUz ? "Yo'lqа" : 'Дорожка' }} {{ assignmentFlash.lane.lane_number }}
          ({{ assignmentFlash.lane.distance_m }}{{ isUz ? 'm' : 'м' }})
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-white/70">{{ isUz ? "Yo'naltirildi" : 'Направлен' }}</p>
        <p class="text-2xl font-bold">{{ assignmentFlash.lane.lane_number }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- LEFT: Identification + Queue -->
      <div class="space-y-4">
        <!-- Identification panel -->
        <div class="card p-4 space-y-3">
          <div class="flex items-center gap-2">
            <Scan class="w-4 h-4 text-brand-600" />
            <h2 class="text-sm font-bold text-gray-800">
              {{ isUz ? "Xodimni aniqlash" : 'Идентификация' }}
            </h2>
          </div>

          <!-- Search input -->
          <div v-if="!identifiedEmployee" class="space-y-2">
            <div class="relative">
              <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                class="input text-sm pl-9"
                :placeholder="isUz ? 'Ism, shaxsiy raqam...' : 'Имя, личный номер...'"
                @focus="searchMode = 'search'"
              />
            </div>

            <!-- Quick scan buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button
                class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition"
                :class="searchMode === 'qr' && isSearching
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'"
                @click="simulateScan"
                :disabled="isSearching"
              >
                <Loader2 v-if="searchMode === 'qr' && isSearching" class="w-3.5 h-3.5 animate-spin" />
                <Scan v-else class="w-3.5 h-3.5" />
                QR
              </button>
              <button
                class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition"
                :class="searchMode === 'face' && isSearching
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'"
                @click="simulateFaceId"
                :disabled="isSearching"
              >
                <Loader2 v-if="searchMode === 'face' && isSearching" class="w-3.5 h-3.5 animate-spin" />
                <UserCheck v-else class="w-3.5 h-3.5" />
                Face ID
              </button>
            </div>

            <!-- Face ID Camera Modal -->
            <Teleport to="body">
              <div v-if="faceIdActive" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="stopCamera">
                <div class="relative bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold text-sm">{{ isUz ? 'Yuzni aniqlash' : 'Face ID - Распознавание' }}</h3>
                    <button @click="stopCamera" class="text-gray-400 hover:text-white transition">
                      <X class="w-5 h-5" />
                    </button>
                  </div>

                  <!-- Camera feed -->
                  <div class="relative rounded-xl overflow-hidden bg-black aspect-[4/3] mb-4">
                    <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" />
                    <!-- Scanning overlay -->
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div class="w-40 h-48 border-2 border-green-400 rounded-2xl relative">
                        <div class="absolute inset-x-0 h-0.5 bg-green-400 shadow-lg animate-[scan_2s_ease-in-out_infinite]" style="top: 50%"></div>
                        <!-- Corner brackets -->
                        <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl-xl"></div>
                        <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr-xl"></div>
                        <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl-xl"></div>
                        <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br-xl"></div>
                      </div>
                    </div>
                    <div v-if="isSearching" class="absolute bottom-3 left-0 right-0 text-center">
                      <p class="text-green-400 text-xs font-medium animate-pulse">{{ isUz ? 'Aniqlanmoqda...' : 'Сканирование...' }}</p>
                    </div>
                  </div>

                  <div v-if="faceIdError" class="text-center text-red-400 text-sm mb-2">{{ faceIdError }}</div>
                  <p v-else class="text-center text-gray-400 text-xs">{{ isUz ? 'Kameraga qarang' : 'Смотрите в камеру' }}</p>
                </div>
              </div>
            </Teleport>

            <!-- Search results -->
            <div v-if="searchResults.length > 0" class="space-y-1 max-h-48 overflow-y-auto">
              <button
                v-for="emp in searchResults" :key="emp.id"
                class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-brand-50 transition text-left"
                @click="identifyEmployee(emp)"
              >
                <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                  {{ emp.full_name[0] }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ emp.full_name }}</p>
                  <p class="text-xs text-gray-400">{{ emp.rank }} · {{ emp.personal_number }}</p>
                </div>
                <Check class="w-4 h-4 text-brand-600 shrink-0" />
              </button>
            </div>
            <div v-else-if="searchQuery.trim() && !isSearching" class="text-center py-3">
              <UserX class="w-6 h-6 text-gray-300 mx-auto mb-1" />
              <p class="text-xs text-gray-400">
                {{ isUz ? "Topilmadi yoki tayinlangan" : 'Не найден или уже назначен' }}
              </p>
            </div>
          </div>

          <!-- Identified employee card -->
          <div v-else class="space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-brand-50 border border-brand-200">
              <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold text-white">
                {{ identifiedEmployee.full_name[0] }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-gray-800">{{ identifiedEmployee.full_name }}</p>
                <p class="text-xs text-gray-500">{{ identifiedEmployee.rank }} · {{ identifiedEmployee.personal_number }}</p>
              </div>
              <button @click="clearIdentification" class="p-1 rounded hover:bg-white/50">
                <X class="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <!-- TB Test check -->
            <div class="flex items-center gap-2 p-2 rounded-lg" :class="identifiedEmployee.tb_test_passed ? 'bg-green-50' : 'bg-red-50'">
              <Shield class="w-4 h-4" :class="identifiedEmployee.tb_test_passed ? 'text-green-600' : 'text-red-600'" />
              <span class="text-xs font-medium" :class="identifiedEmployee.tb_test_passed ? 'text-green-700' : 'text-red-700'">
                {{ identifiedEmployee.tb_test_passed
                  ? (isUz ? "TB testidan o'tgan ✓" : 'ТБ-тест сдан ✓')
                  : (isUz ? "TB testidan o'tmagan ✗" : 'ТБ-тест не сдан ✗')
                }}
              </span>
              <span v-if="identifiedEmployee.tb_test_score" class="ml-auto text-xs text-gray-400">
                {{ identifiedEmployee.tb_test_score }}%
              </span>
            </div>

            <!-- Shooting qualification -->
            <div class="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
              <Zap class="w-4 h-4 text-blue-600" />
              <span class="text-xs font-medium text-blue-700">
                {{ identifiedEmployee.qualification_level || (isUz ? "O'rtacha" : 'Средний') }}
              </span>
              <span class="ml-auto text-xs text-gray-400">
                {{ identifiedEmployee.total_sessions }} {{ isUz ? 'sessiya' : 'сессий' }}
              </span>
            </div>

            <!-- Add to queue button -->
            <button
              v-if="identifiedEmployee.tb_test_passed"
              class="btn-primary w-full text-sm py-2.5"
              @click="addToQueue"
            >
              <Users class="w-4 h-4" />
              {{ isUz ? "Navbatga qo'shish" : 'В очередь' }}
            </button>
            <div v-else class="p-2 rounded-lg bg-red-50 text-center">
              <p class="text-xs font-medium text-red-700">
                {{ isUz ? "TB testisiz poligonga ruxsat yo'q" : 'Без ТБ-теста доступ на полигон запрещён' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Queue panel -->
        <div class="card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-gray-600" />
              <h2 class="text-sm font-bold text-gray-800">
                {{ isUz ? "Navbat" : 'Очередь' }}
              </h2>
              <span v-if="assignmentQueue.length" class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-700">
                {{ assignmentQueue.length }}
              </span>
            </div>
            <button
              v-if="assignmentQueue.length > 0 && availableLanes.length > 0"
              class="btn-primary text-xs py-1.5 px-3"
              @click="autoAssignAll"
            >
              <Zap class="w-3 h-3" />
              {{ isUz ? "Avto-taqsimlash" : 'Авто-распределение' }}
            </button>
          </div>

          <div v-if="assignmentQueue.length === 0" class="text-center py-4">
            <p class="text-xs text-gray-400">
              {{ isUz ? "Navbat bo'sh" : 'Очередь пуста' }}
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(item, idx) in assignmentQueue" :key="idx"
>
              <span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                {{ idx + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-800 truncate">{{ item.employee.full_name }}</p>
                <p class="text-xs text-gray-400">{{ item.employee.rank }} · {{ item.employee.personal_number }}</p>
              </div>
              <!-- Manual lane select -->
              <select
                class="text-xs border border-gray-200 rounded-md px-2 py-1 max-w-[100px]"
                @change="(e) => manualAssign(idx, (e.target as HTMLSelectElement).value)"
              >
                <option value="">{{ isUz ? "Yo'lqa tanlang" : 'Дорожка' }}</option>
                <option v-for="lane in availableLanes" :key="lane.id" :value="lane.id">
                  №{{ lane.lane_number }}
                </option>
              </select>
              <button @click="removeFromQueue(idx)" class="p-1 rounded hover:bg-red-50">
                <X class="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Auto-assign next button -->
          <button
            v-if="assignmentQueue.length > 0 && availableLanes.length > 0"
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-brand-300 text-brand-600 text-sm font-medium hover:bg-brand-50 transition"
            @click="autoAssignNext"
          >
            <ArrowRight class="w-4 h-4" />
            {{ isUz ? "Keyinagini tayinlash" : 'Назначить следующего' }}
            <span class="text-xs text-gray-400">
              ({{ isUz ? "Yo'lqa" : 'Дорожка' }} {{ availableLanes[0]?.lane_number }})
            </span>
          </button>
          <div v-else-if="assignmentQueue.length > 0 && availableLanes.length === 0" class="p-2 rounded-lg bg-amber-50 text-center">
            <p class="text-xs text-amber-700">
              {{ isUz ? "Barcha yo'lkalar band" : 'Все дорожки заняты' }}
            </p>
          </div>
        </div>
      </div>

        <!-- Range Selector -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-medium text-gray-500">' + (isUz ? "Tirni tanlang:" : "Выбрать тир:") + '' + '</span>
          <button v-for="range in ranges" :key="range.id" @click="selectedRangeId = range.id" 
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors" 
            :class="selectedRangeId === range.id ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
            {{ range.name }}
            <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" :class="range.range_type === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'">{{ range.range_type === 'OPEN' ? (isUz ? 'Ochiq' : 'Откр.') : (isUz ? 'Yopi' : 'Закр.') }}</span>
          </button>
        </div>
      <!-- RIGHT: Lane grid -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card p-4 space-y-3">
          <div class="flex items-center gap-2">
            <Radio class="w-4 h-4 text-brand-600" />
            <h2 class="text-sm font-bold text-gray-800">
              {{ isUz ? "Yo'lkalar holati" : 'Состояние дорожек' }}
            </h2>
          </div>

          <!-- Lane grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="lane in lanes" :key="lane.id"
              class="rounded-xl border-2 p-3 transition"
              :class="getLaneColor(lane.status)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" :class="lane.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : lane.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'">
                    {{ lane.lane_number }}
                  </div>
                  <div>
                    <p class="text-xs font-bold">{{ isUz ? `Yo'lqa ${lane.lane_number}` : `Дорожка ${lane.lane_number}` }}</p>
                    <p class="text-[10px] opacity-70">{{ lane.distance_m }}{{ isUz ? 'm' : 'м' }} · {{ lane.target_type }}</p>
                  </div>
                </div>
                <div class="w-2 h-2 rounded-full" :class="lane.status === 'AVAILABLE' ? 'bg-green-500' : lane.status === 'OCCUPIED' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'"></div>
              </div>

              <!-- Occupied -->
              <div v-if="lane.status === 'OCCUPIED' && lane.current_employee_name" class="space-y-1">
                <p class="text-sm font-medium truncate">{{ lane.current_employee_name }}</p>
                <div class="flex items-center gap-2 text-[10px] opacity-70">
                  <span class="flex items-center gap-0.5">
                    <Clock class="w-2.5 h-2.5" />
                    {{ minsAgo(lane.session_start_time) }}
                  </span>
                  <span>{{ lane.current_shots_fired }} {{ isUz ? 'otish' : 'выстр.' }}</span>
                  <span v-if="lane.current_score">{{ lane.current_score }} {{ isUz ? 'ball' : 'балл' }}</span>
                </div>
                <button
                  class="w-full mt-1.5 text-[10px] py-1 rounded-md bg-white/60 hover:bg-white text-gray-600 font-medium transition"
                  @click="releaseLane(lane.id)"
                >
                  {{ isUz ? "Bo'shatish" : 'Освободить' }}
                </button>
              </div>

              <!-- Available -->
              <div v-else-if="lane.status === 'AVAILABLE'" class="text-center py-2">
                <p class="text-xs font-medium opacity-80">{{ isUz ? "Bo'sh" : 'Свободна' }}</p>
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

          <!-- Assignment flow info -->
          <div class="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div class="flex items-start gap-2">
              <AlertCircle class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-xs text-gray-600">
                  <b>{{ isUz ? "Avto-taqsimlash tartibi:" : 'Порядок авто-распределения:' }}</b>
                  {{ isUz
                    ? "Birinchi kelgan → 1-yo'lqa, ikkinchi → 2-yo'lqa va h.k. Bo'sh yo'lqalar ketma-ket to'ldiriladi."
                    : 'Первый в очереди → дорожка 1, второй → дорожка 2 и т.д. Свободные дорожки заполняются последовательно.'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0%, 100% { top: 10%; }
  50% { top: 90%; }
}
</style>

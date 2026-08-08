<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Camera, Users, Target, Crosshair, Zap, Loader2, Play, Check, Radio, ScanFace, Wifi, WifiOff, AlertCircle } from 'lucide-vue-next'
import { useMasterStore } from '@/stores/master'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import KPICard from '@/components/ui/KPICard.vue'
import type { Weapon } from '@/types/extended'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const authStore = useAuthStore()

const laneNumber = computed(() => Number(route.params.lane))
const lane = computed(() => masterStore.lanes.find(l => l.lane_number === laneNumber.value))

const selectedEmployee = ref<string | null>(lane.value?.current_employee_id || null)
const selectedWeapon = ref<string | null>(null)
const shotType = ref<'TEST' | 'MAIN'>('TEST')
const expectedShots = ref(10)
const step = ref<'SELECT' | 'WEAPON' | 'READY' | 'SHOOTING'>(lane.value?.status === 'OCCUPIED' ? 'SHOOTING' : 'SELECT')

const availableWeapons = computed(() => masterStore.weapons.filter(w => w.status === 'AVAILABLE'))
const employees = computed(() => masterStore.employees.filter(e => e.status === 'ACTIVE'))

function selectEmployee(id: string) {
  selectedEmployee.value = id
  step.value = 'WEAPON'
}

function selectWeapon(id: string) {
  selectedWeapon.value = id
  const w = masterStore.weapons.find(w => w.id === id)
  if (w) expectedShots.value = w.category === 'PISTOL' ? 5 : 10
  step.value = 'READY'
}

function startShooting() {
  step.value = 'SHOOTING'
  if (lane.value) masterStore.updateLaneStatus(lane.value.id, 'OCCUPIED')
  const emp = masterStore.employees.find(e => e.id === selectedEmployee.value)
  const wpn = masterStore.weapons.find(w => w.id === selectedWeapon.value)
  if (lane.value && emp && wpn) {
    masterStore.assignWeaponToLane(wpn.id, lane.value.id)
    masterStore.sessionFlows.push({
      id: `sf-${Date.now()}`,
      session_id: `sess-${Date.now()}`,
      lane_id: lane.value.id,
      lane_number: lane.value.lane_number,
      employee_id: emp.id,
      employee_name: emp.full_name.split(' ').slice(0, 2).join(' '),
      employee_rank: emp.rank,
      weapon_id: wpn.id,
      weapon_name: wpn.name,
      weapon_category: wpn.category,
      instructor_id: authStore.user?.id || 'u002',
      instructor_name: authStore.user?.full_name || (isUz ? 'Karimov B.R.' : 'Каримов Б.Р.'),
      status: 'SHOOTING',
      shot_type: shotType.value,
      expected_shots: expectedShots.value,
      rounds_fired: 0,
      score: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      notes: null, scoring_mode: 'POINTS', hit_count: 0, miss_count: 0, passed: false,
    })
  }
}

function finishShooting() {
  if (lane.value) {
    masterStore.updateLaneStatus(lane.value.id, 'AVAILABLE')
    const flow = masterStore.sessionFlows.find(f => f.lane_id === lane.value!.id && f.status === 'SHOOTING')
    if (flow) {
      flow.status = 'COMPLETED'
      flow.completed_at = new Date().toISOString()
    }
  }
  router.push('/range/dashboard')
}

const currentFlow = computed(() => masterStore.sessionFlows.find(f => f.lane_id === lane.value?.id && f.status === 'SHOOTING'))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/range/dashboard')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Yoʻlak' : 'Дорожка' }} {{ laneNumber }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ lane?.name }} · {{ lane?.distance_m }}м</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Wifi v-if="lane?.camera_status === 'ONLINE'" class="w-4 h-4 text-brand-500" />
        <WifiOff v-else class="w-4 h-4 text-red-500" />
        <StatusBadge :status="lane?.status || 'AVAILABLE'" />
      </div>
    </div>

    <!-- Camera Feed (simulated) -->
    <div class="card p-0 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2.5 bg-gray-900/95">
        <div class="flex items-center gap-2">
          <span class="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span class="text-xs font-medium text-white">LIVE CAMERA · {{ lane?.camera_ip }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-400 text-xs">
          <Camera class="w-3.5 h-3.5" />
          <span>{{ new Date().toLocaleTimeString() }}</span>
        </div>
      </div>
      <div class="relative h-[280px] bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
        <!-- Simulated range view -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative">
            <!-- Target circle -->
            <div class="w-40 h-40 rounded-full border-4 border-white/80 shadow-2xl flex items-center justify-center"
              style="box-shadow: 0 0 40px rgba(255,255,255,0.15);">
              <div class="w-28 h-28 rounded-full border-2 border-white/60 flex items-center justify-center">
                <div class="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center">
                  <div class="w-6 h-6 rounded-full bg-white/30"></div>
                </div>
              </div>
            </div>
            <!-- Crosshair overlay -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-[2px] h-48 bg-white/10"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="h-[2px] w-48 bg-white/10"></div>
            </div>
          </div>
        </div>
        <!-- Distance indicator -->
        <div class="absolute bottom-3 right-4 text-xs text-white/40 font-mono">{{ lane?.distance_m }}m</div>
        <!-- Lane number -->
        <div class="absolute top-3 left-4 text-xs text-white/40 font-mono">LANE {{ laneNumber }}</div>
      </div>
    </div>

    <!-- Session Flow Steps -->
    <div class="card">
      <div class="flex items-center gap-2 mb-4">
        <Zap class="w-4 h-4 text-brand-600" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Sessiya jarayoni' : 'Процесс сессии' }}</h2>
      </div>

      <!-- Step indicators -->
      <div class="flex items-center gap-2 mb-6">
        <div v-for="(s, idx) in ['SELECT', 'WEAPON', 'READY', 'SHOOTING']" :key="s"
          class="flex-1 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition"
            :class="step === s ? 'bg-brand-600 text-white' : ['SELECT','WEAPON','READY','SHOOTING'].indexOf(step) > idx ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-400'">
            {{ idx + 1 }}
          </div>
          <span class="text-xs" :class="step === s ? 'font-bold text-brand-700' : 'text-gray-400'">
            {{ s === 'SELECT' ? (isUz ? 'Xodim' : 'Сотрудник') : s === 'WEAPON' ? (isUz ? 'Qurol' : 'Оружие') : s === 'READY' ? (isUz ? 'Tayyor' : 'Готовность') : (isUz ? 'Otish' : 'Стрельба') }}
          </span>
          <div v-if="idx < 3" class="flex-1 h-px bg-gray-200"></div>
        </div>
      </div>

      <!-- Step: Select Employee -->
      <div v-if="step === 'SELECT'">
        <p class="text-xs text-gray-500 mb-3">{{ isUz ? 'Xodimni tanlang (HR tizimi maʻlumotlari):' : 'Выберите сотрудника (данные из HR системы):' }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <button v-for="emp in employees" :key="emp.id"
            class="border rounded-xl p-3 text-left transition hover:border-brand-400 hover:bg-brand-50/30"
            :class="selectedEmployee === emp.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-shell-border'"
            @click="selectEmployee(emp.id)">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {{ emp.full_name.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ emp.full_name.split(' ').slice(0,2).join(' ') }}</p>
                <p class="text-[10px] text-gray-400">{{ emp.rank }} · {{ emp.department }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <ScanFace v-if="emp.face_id_registered" class="w-3 h-3 text-brand-500" />
              <span class="text-[10px]" :class="emp.face_id_registered ? 'text-brand-600' : 'text-red-500'">
                {{ emp.face_id_registered ? 'FaceID ✓' : 'FaceID ✗' }}
              </span>
              <span class="text-[10px] text-gray-400">· Ур. {{ emp.qualification_level }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Step: Select Weapon -->
      <div v-else-if="step === 'WEAPON'">
        <p class="text-xs text-gray-500 mb-3">{{ isUz ? 'Qurolni tanlang:' : 'Выберите оружие:' }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <button v-for="wpn in availableWeapons" :key="wpn.id"
            class="border rounded-xl p-3 text-left transition hover:border-brand-400 hover:bg-brand-50/30"
            :class="selectedWeapon === wpn.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-shell-border'"
            @click="selectWeapon(wpn.id)">
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-semibold text-gray-800">{{ wpn.name }}</p>
              <StatusBadge :status="wpn.category" />
            </div>
            <p class="text-[10px] text-gray-400">{{ wpn.caliber }} · {{ wpn.serial_number }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ isUz ? 'Masofa:' : 'Дальность:' }} {{ wpn.max_range_m }}м</p>
          </button>
        </div>
      </div>

      <!-- Step: Ready -->
      <div v-else-if="step === 'READY'">
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
            <span class="text-xs text-gray-500">{{ isUz ? 'Otish turi' : 'Тип стрельбы' }}</span>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
                :class="shotType === 'TEST' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-shell-border text-gray-600'"
                @click="shotType = 'TEST'">{{ isUz ? 'Sinov (TEST)' : 'Пробный (TEST)' }}</button>
              <button class="px-3 py-1.5 rounded-lg border text-xs font-medium transition"
                :class="shotType === 'MAIN' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-shell-border text-gray-600'"
                @click="shotType = 'MAIN'">{{ isUz ? 'Asosiy (MAIN)' : 'Основной (MAIN)' }}</button>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
            <span class="text-xs text-gray-500">{{ isUz ? 'Oʻqlar soni' : 'Количество выстрелов' }}</span>
            <input v-model.number="expectedShots" type="number" min="1" max="30" class="input w-20 text-sm text-center" />
          </div>
          <button class="btn-primary w-full" @click="startShooting">
            <Play class="w-4 h-4" /> Начать стрельбу
          </button>
        </div>
      </div>

      <!-- Step: Shooting -->
      <div v-else-if="step === 'SHOOTING'">
        <div class="space-y-4">
          <!-- Live stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 rounded-xl bg-gray-50/50">
              <p class="text-xs text-gray-400 uppercase">{{ isUz ? 'Oʻqlar' : 'Выстрелов' }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ currentFlow?.rounds_fired || 0 }}/{{ currentFlow?.expected_shots }}</p>
            </div>
            <div class="text-center p-3 rounded-xl bg-gray-50/50">
              <p class="text-xs text-gray-400 uppercase">{{ isUz ? 'Tur' : 'Тип' }}</p>
              <p class="text-lg font-bold text-brand-600">{{ currentFlow?.shot_type }}</p>
            </div>
            <div class="text-center p-3 rounded-xl bg-gray-50/50">
              <p class="text-xs text-gray-400 uppercase">{{ isUz ? 'Qurol' : 'Оружие' }}</p>
              <p class="text-sm font-bold text-gray-800">{{ currentFlow?.weapon_name }}</p>
            </div>
          </div>

          <!-- Instructor controls -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-amber-50/30 border border-amber-100">
            <div class="flex items-center gap-2">
              <Radio class="w-4 h-4 text-amber-600" />
              <span class="text-xs text-amber-700">{{ isUz ? 'Instruktor' : 'Инструктор' }}: {{ authStore.user?.full_name || (isUz ? 'Karimov B.R.' : 'Каримов Б.Р.') }}</span>
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary text-xs" @click="router.push('/upload-analysis')">
                <Camera class="w-3.5 h-3.5" /> Снять и анализ
              </button>
              <button class="btn-primary text-xs" @click="finishShooting">
                <Check class="w-3.5 h-3.5" /> Завершить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

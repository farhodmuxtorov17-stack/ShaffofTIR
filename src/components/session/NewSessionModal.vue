<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMasterStore } from '@/stores/master'
import { useSessionStore } from '@/stores/session'
import { useAuthStore } from '@/stores/auth'
import { X, Search, Crosshair, Users, Radio, ArrowRight, Check, Target, Shield } from 'lucide-vue-next'
import type { Weapon, ShootingLane, ScoringMode, ScoringModeConfig } from '@/types/extended'
import { useI18n } from '@/i18n'
import { SCORING_PRESETS, SCORING_MODE_LABELS } from '@/utils/scoringPresets'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: []; created: [sessionId: string] }>()

const masterStore = useMasterStore()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const step = ref(0) // 0=scoring mode, 1=employee, 2=weapon, 3=lane, 4=confirm
const searchQuery = ref('')
const selectedScoringMode = ref<ScoringMode>('POINTS')
const selectedEmployee = ref<string | null>(null)
const selectedWeapon = ref<string | null>(null)
const selectedLane = ref<string | null>(null)
const creating = ref(false)

// Ammo config (editable - instructor can change rounds)
const testRounds = ref(SCORING_PRESETS['POINTS'].testRounds)
const combatRounds = ref(SCORING_PRESETS['POINTS'].combatRounds)
const totalRounds = computed(() => testRounds.value + combatRounds.value)

// When scoring mode changes, update defaults (but keep editable)
watch(selectedScoringMode, (mode) => {
  testRounds.value = SCORING_PRESETS[mode].testRounds
  combatRounds.value = SCORING_PRESETS[mode].combatRounds
})

const availableEmployees = computed(() => {
  return masterStore.employees
    .filter(e => e.status === 'ACTIVE' && e.shooting_qualified && e.tb_test_passed)
    .filter(e => {
      if (!searchQuery.value) return true
      return e.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             e.personal_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             e.rank.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
})

const availableWeapons = computed(() =>
  masterStore.weapons.filter(w => w.status === 'AVAILABLE')
)

const availableLanes = computed(() =>
  masterStore.lanes.filter(l => l.status === 'AVAILABLE')
)

const selectedEmployeeData = computed(() =>
  masterStore.employees.find(e => e.id === selectedEmployee.value)
)
const selectedWeaponData = computed(() =>
  masterStore.weapons.find(w => w.id === selectedWeapon.value)
)
const selectedLaneData = computed(() =>
  masterStore.lanes.find(l => l.id === selectedLane.value)
)

function selectScoringMode(mode: ScoringMode) {
  selectedScoringMode.value = mode
  setTimeout(() => step.value = 1, 200)
}

function selectEmployee(id: string) {
  selectedEmployee.value = id
  setTimeout(() => step.value = 2, 200)
}

function selectWeapon(id: string) {
  selectedWeapon.value = id
  setTimeout(() => step.value = 3, 200)
}

function selectLane(id: string) {
  selectedLane.value = id
  setTimeout(() => step.value = 4, 200)
}

function nextStep() {
  if (step.value < 4) step.value++
}

function prevStep() {
  if (step.value > 0) step.value--
}

async function createSession() {
  creating.value = true
  try {
    // Mark lane as occupied and assign weapon/employee
    if (selectedLaneData.value) {
      selectedLaneData.value.status = 'OCCUPIED'
      selectedLaneData.value.current_employee_id = selectedEmployeeData.value?.id || null
      selectedLaneData.value.current_employee_name = selectedEmployeeData.value?.full_name || null
      selectedLaneData.value.current_shots_fired = 0
      selectedLaneData.value.current_score = 0
      selectedLaneData.value.session_start_time = new Date().toISOString()
    }
    if (selectedWeaponData.value) {
      selectedWeaponData.value.status = 'IN_USE'
      selectedWeaponData.value.assigned_to = selectedEmployeeData.value?.id || null
    }
    // Build camera config from selected lane
    const cameras = selectedLaneData.value?.camera_ip
      ? [{ camera_ip: selectedLaneData.value.camera_ip, username: 'admin', password: '', label: `Lane ${selectedLaneData.value.lane_number}` }]
      : undefined
    // Create session via session store - pass meta with scoring mode
    await sessionStore.createSession(1, cameras, {
      employeeId: selectedEmployeeData.value?.id,
      employeeName: selectedEmployeeData.value?.full_name,
      weaponId: selectedWeaponData.value?.id,
      laneNumber: selectedLaneData.value?.lane_number,
      laneId: selectedLaneData.value?.id,
      scoringMode: selectedScoringMode.value,
      testRounds: testRounds.value,
      combatRounds: combatRounds.value,
    })
    const sessionId = sessionStore.currentSession?.id || `s-${Date.now()}`
    emit('created', sessionId)
    reset()
  } catch (e) {
    const sessionId = `s-${Date.now()}`
    emit('created', sessionId)
    reset()
  } finally {
    creating.value = false
  }
}

function reset() {
  step.value = 0
  selectedScoringMode.value = 'POINTS'
  selectedEmployee.value = null
  selectedWeapon.value = null
  selectedLane.value = null
  searchQuery.value = ''
}

watch(() => props.show, (val) => {
  if (val) reset()
})

const steps = computed(() => [
  { icon: Target, label: locale.value === 'uz' ? 'Baholash' : 'Оценка' },
  { icon: Users, label: locale.value === 'uz' ? 'Xodim' : 'Сотрудник' },
  { icon: Crosshair, label: locale.value === 'uz' ? 'Qurol' : 'Оружие' },
  { icon: Radio, label: locale.value === 'uz' ? "Yo02BBlak" : 'Дорожка' },
  { icon: Check, label: locale.value === 'uz' ? 'Tasdiq' : 'Подтвердить' },
])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0" style="background: rgba(15,23,42,0.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" @click="emit('close')"></div>

        <div class="relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 25px -10px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div class="px-6 py-4 flex items-center justify-between" style="background: rgba(248,250,252,0.5); border-bottom: 1px solid rgba(232,237,236,0.5);">
            <h2 class="text-lg font-bold text-gray-900">{{ locale === 'uz' ? 'Yangi sessiya' : 'Новая сессия' }}</h2>
            <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition">
              <X class="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <!-- Stepper -->
          <div class="px-6 py-3 flex items-center justify-between border-b border-gray-50">
            <div v-for="(s, i) in steps" :key="i" class="flex items-center flex-1">
              <div
                class="flex items-center gap-2 transition-all"
                :class="i <= step ? 'text-brand-600' : 'text-gray-300'"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" style="box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.2);"
                  :class="i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400' : 'bg-gray-100'"
                >
                  <Check v-if="i < step" class="w-4 h-4" />
                  <component v-else :is="s.icon" class="w-4 h-4" />
                </div>
                <span class="text-xs font-medium hidden sm:block">{{ s.label }}</span>
              </div>
              <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 rounded" :class="i < step ? 'bg-brand-500' : 'bg-gray-200'"></div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Step 0: Scoring Mode -->
            <div v-if="step === 0">
              <p class="text-sm text-gray-500 mb-4">{{ locale === 'uz' ? "Baholash tizimini tanlang" : "Выберите систему оценки" }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- POINTS mode -->
                <button @click="selectScoringMode('POINTS')"
                  class="p-4 rounded-xl border-2 transition-all hover:shadow-md text-left"
                  :class="selectedScoringMode === 'POINTS' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                      <Target class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ SCORING_MODE_LABELS.POINTS[locale === 'uz' ? 'uz' : 'ru'] }}</p>
                      <p class="text-[10px] text-gray-400">10 · 9 · 8 · 7 · 6...</p>
                    </div>
                  </div>
                  <p class="text-[11px] text-gray-500 leading-relaxed">{{ SCORING_MODE_LABELS.POINTS[locale === 'uz' ? 'desc_uz' : 'desc_ru'] }}</p>
                  <div class="mt-3 flex items-center gap-2 text-[10px]">
                    <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-medium">{{ testRounds }} {{ locale === 'uz' ? 'sinov' : 'пробн.' }}</span>
                    <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{{ combatRounds }} {{ locale === 'uz' ? 'jangovar' : 'боев.' }}</span>
                  </div>
                </button>

                <!-- HIT_MISS mode -->
                <button @click="selectScoringMode('HIT_MISS')"
                  class="p-4 rounded-xl border-2 transition-all hover:shadow-md text-left"
                  :class="selectedScoringMode === 'HIT_MISS' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Shield class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ SCORING_MODE_LABELS.HIT_MISS[locale === 'uz' ? 'uz' : 'ru'] }}</p>
                      <p class="text-[10px] text-gray-400">{{ locale === 'uz' ? 'Tegdi / Te\'gmadi' : 'Попал / Мимо' }}</p>
                    </div>
                  </div>
                  <p class="text-[11px] text-gray-500 leading-relaxed">{{ SCORING_MODE_LABELS.HIT_MISS[locale === 'uz' ? 'desc_uz' : 'desc_ru'] }}</p>
                  <div class="mt-3 flex items-center gap-2 text-[10px]">
                    <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-medium">{{ testRounds }} {{ locale === 'uz' ? 'sinov' : 'пробн.' }}</span>
                    <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{{ combatRounds }} {{ locale === 'uz' ? 'joriy' : 'зачёт.' }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 1: Employee -->
            <div v-else-if="step === 1">
              <div class="relative mb-4">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input v-model="searchQuery" type="text" :placeholder="locale === 'uz' ? 'Ism, raqam yoki zvanja bo\u02bbyicha qidirish...' : 'Поиск по имени, номеру или званию...'"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
                <button v-for="emp in availableEmployees" :key="emp.id"
                  @click="selectEmployee(emp.id)"
                  class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-md text-left"
                  :class="selectedEmployee === emp.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-bold">
                    {{ emp.full_name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ emp.full_name }}</p>
                    <p class="text-[10px] text-gray-400">{{ emp.rank }} · {{ emp.department }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[9px] px-1.5 py-0.5 rounded-full" :class="emp.tb_test_passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                        {{ emp.tb_test_passed ? (locale === 'uz' ? 'TB o\'tdi' : 'ТБ сдан') : (locale === 'uz' ? 'TB o\'tmadi' : 'ТБ не сдан') }}
                      </span>
                      <span class="text-[9px] text-gray-400">{{ emp.total_sessions }} {{ locale === 'uz' ? 'sessiya' : 'сессий' }}</span>
                    </div>
                  </div>
                </button>
              </div>
              <p v-if="availableEmployees.length === 0" class="text-center text-sm text-gray-400 py-8">
                {{ locale === 'uz' ? 'Faol xodimlar topilmadi (TB testidan o\'tmaganlar ko\'rinmaydi)' : 'Активные сотрудники не найдены (без ТБ-теста не допускаются)' }}
              </p>
            </div>

            <!-- Step 2: Weapon -->
            <div v-else-if="step === 2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto">
                <button v-for="w in availableWeapons" :key="w.id"
                  @click="selectWeapon(w.id)"
                  class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-md text-left"
                  :class="selectedWeapon === w.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Crosshair class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ w.name }}</p>
                    <p class="text-[10px] text-gray-400">{{ w.category }} · {{ w.caliber }}</p>
                    <p class="text-[9px] text-gray-400 mt-0.5">{{ locale === 'uz' ? 'Ishlab chiqaruvchi' : 'Производитель' }}: {{ w.manufacturer }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 3: Lane -->
            <div v-else-if="step === 3">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[45vh] overflow-y-auto">
                <button v-for="l in availableLanes" :key="l.id"
                  @click="selectLane(l.id)"
                  class="p-4 rounded-xl border-2 transition-all hover:shadow-md text-center"
                  :class="selectedLane === l.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <Radio class="w-6 h-6 mx-auto mb-2" :class="selectedLane === l.id ? 'text-brand-600' : 'text-gray-400'" />
                  <p class="text-sm font-bold text-gray-800">{{ locale === 'uz' ? "Yo02BBlak" : 'Дорожка' }} {{ l.lane_number }}</p>
                  <p class="text-[10px] text-gray-400 mt-1">{{ l.distance_m }}{{ locale === 'uz' ? 'm masofa' : 'м дистанция' }}</p>
                  <p class="text-[10px] mt-0.5" :class="l.camera_status === 'ONLINE' ? 'text-green-500' : 'text-gray-300'">
                    {{ l.camera_status === 'ONLINE' ? (locale === 'uz' ? 'Kamera ON' : 'Камера ON') : (locale === 'uz' ? 'Kamera OFF' : 'Камера OFF') }}
                  </p>
                </button>
              </div>
            </div>

            <!-- Step 4: Confirm -->
            <div v-else-if="step === 4">
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h3 class="text-sm font-bold text-gray-700 mb-3">{{ locale === 'uz' ? 'Sessiya parametrlari' : 'Параметры сессии' }}</h3>
                  <div class="space-y-2.5 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? 'Baholash tizimi' : 'Система оценки' }}</span>
                      <span class="font-semibold text-gray-800">{{ SCORING_MODE_LABELS[selectedScoringMode][locale === 'uz' ? 'uz' : 'ru'] }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? 'Xodim' : 'Сотрудник' }}</span>
                      <span class="font-semibold text-gray-800">{{ selectedEmployeeData?.full_name }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? 'Qurol' : 'Оружие' }}</span>
                      <span class="font-semibold text-gray-800">{{ selectedWeaponData?.name }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? "Yo02BBlak" : 'Дорожка' }}</span>
                      <span class="font-semibold text-gray-800">№{{ selectedLaneData?.lane_number }}</span>
                    </div>
                    <div class="pt-2 border-t border-gray-100">
                      <p class="text-gray-400 mb-2">{{ locale === 'uz' ? 'Patronlar soni (tahrirlanadigan)' : 'Количество патронов (редактируемое)' }}</p>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="text-[10px] text-gray-400 mb-1 block">{{ locale === 'uz' ? 'Sinov (probnyye)' : 'Пробные' }}</label>
                          <input v-model.number="testRounds" type="number" min="0" max="20"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-center focus:ring-2 focus:ring-brand-400" />
                        </div>
                        <div>
                          <label class="text-[10px] text-gray-400 mb-1 block">{{ locale === 'uz' ? 'Jangovar (boevyye)' : 'Боевые' }}</label>
                          <input v-model.number="combatRounds" type="number" min="1" max="50"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-center focus:ring-2 focus:ring-brand-400" />
                        </div>
                      </div>
                      <p class="text-[11px] text-brand-600 font-semibold text-center mt-2">
                        {{ locale === 'uz' ? 'Jami' : 'Итого' }}: {{ totalRounds }} {{ locale === 'uz' ? 'patron' : 'патронов' }}
                      </p>
                    </div>
                    <div v-if="selectedScoringMode === 'POINTS'" class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? 'Maksimal ball' : 'Макс. балл' }}</span>
                      <span class="font-semibold text-brand-600">{{ SCORING_PRESETS[selectedScoringMode].maxScore }}</span>
                    </div>
                    <div v-else class="flex items-center justify-between">
                      <span class="text-gray-400">{{ locale === 'uz' ? 'Baholash' : 'Оценка' }}</span>
                      <span class="font-semibold text-orange-600">{{ locale === 'uz' ? 'Tegdi/Te\'gmadi' : 'Попал/Мимо' }}</span>
                    </div>
                  </div>
                </div>
                <div class="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p class="text-[11px] text-amber-600 leading-relaxed">
                    ⚠️ {{ locale === 'uz'
                      ? 'Diqqat: tizim faqat lokal Wi-Fi orqali ishlaydi. Instructor poligonda jismonan bo\'lishi shart.'
                      : 'Внимание: система работает только через локальный Wi-Fi. Инструктор должен физически находиться на полигоне.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <button v-if="step > 0" @click="prevStep" class="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1">
              <ArrowRight class="w-4 h-4 rotate-180" />
              {{ locale === 'uz' ? 'Orqaga' : 'Назад' }}
            </button>
            <div v-else></div>

            <button v-if="step === 4" @click="createSession" :disabled="creating"
              class="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center gap-2"
              :class="creating ? 'bg-gray-300' : 'bg-brand-600 hover:bg-brand-700'"
              style="background: #16a34a;">
              <span v-if="creating" class="inline-spinner"></span>
              <Check v-else class="w-4 h-4" />
              {{ creating ? (locale === 'uz' ? 'Yaratilmoqda...' : 'Создание...') : (locale === 'uz' ? 'Boshlash' : 'Начать') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

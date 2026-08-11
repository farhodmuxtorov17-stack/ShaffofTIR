<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { sessionApi } from '@/api/session.api'
import { useCameraStore } from '@/stores/camera'
import { useI18n } from '@/i18n'
import { resolveImageUrl } from '@/api/imageUrl'
import {
  Play, CheckCircle2, Target, Camera, Loader2, AlertCircle,
  Crosshair, Award, Clock, ChevronRight, RefreshCw, X,
  Shield, Upload, MapPin, Home,
} from 'lucide-vue-next'
import type {
  TargetProcessResponse, ShotResponse, LaneCameraRequest,
} from '@/types'

const props = defineProps<{
  laneNumber: number
  employeeId?: string
  employeeName?: string
  weaponType?: string
  distance?: number
  bulletCount?: number
  defaultRangeType?: 'OPEN' | 'CLOSED'
}>()

const emit = defineEmits<{
  (e: 'session-complete', data: { sessionId: string; score: number; shots: ShotResponse[] }): void
  (e: 'close'): void
}>()

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const cameraStore = useCameraStore()

// === Range type: OPEN (scored) vs CLOSED (hit/miss only) ===
const rangeType = ref<'OPEN' | 'CLOSED'>(props.defaultRangeType || 'OPEN')
const scoringMode = computed(() => rangeType.value === 'OPEN' ? 'POINTS' : 'HIT_MISS')

type Stage = 'setup' | 'test_shots' | 'test_results' | 'main_shots' | 'main_results' | 'final'
const stage = ref<Stage>('setup')

const stageSteps = computed(() => [
  { id: 'setup', label: isUz.value ? 'Tayyorgarlik' : 'Подготовка', icon: Shield },
  { id: 'test_shots', label: isUz.value ? 'Sinov otish' : 'Пробные выстрелы', icon: Crosshair },
  { id: 'main_shots', label: isUz.value ? 'Asosiy otish' : 'Основные выстрелы', icon: Target },
  { id: 'final', label: isUz.value ? 'Natija' : 'Результат', icon: Award },
])

const currentStepIndex = computed(() => {
  const ids = ['setup', 'test_shots', 'main_shots', 'final']
  const idx = ids.indexOf(stage.value)
  if (idx >= 0) return idx
  if (stage.value === 'test_results') return 1
  if (stage.value === 'main_results') return 2
  return 0
})

const sessionId = ref<string>('')
const soldierSeq = ref<number>(1)
const loading = ref(false)
const error = ref<string | null>(null)

const testShots = ref<ShotResponse[]>([])
const mainShots = ref<ShotResponse[]>([])
const testResult = ref<TargetProcessResponse | null>(null)
const mainResult = ref<TargetProcessResponse | null>(null)

const camera = computed(() => cameraStore.getCameraByLane(props.laneNumber))
const cameraConfigs = computed<LaneCameraRequest[]>(() => {
  const cam = camera.value
  if (!cam) return []
  return [{ camera_ip: cam.ip, username: cam.username, password: cam.password, label: cam.name }]
})

// Editable params
const expectedTestShots = ref(3)
const expectedMainShots = ref(props.bulletCount || 10)
const customDistance = ref(props.distance || 100)

const uploadMode = ref(false)
const uploadedFile = ref<File | null>(null)
const baselineFile = ref<File | null>(null)

const sessionStartTime = ref<number>(0)
const elapsedTime = ref('00:00')
let timerId: number | null = null

function updateTimer() {
  if (!sessionStartTime.value) return
  const diff = Math.floor((Date.now() - sessionStartTime.value) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  elapsedTime.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

async function startSession() {
  loading.value = true
  error.value = null
  try {
    const resp = await sessionApi.start({
      soldier_count: 1,
      cameras: cameraConfigs.value,
      range_type: rangeType.value,
      scoring_mode: scoringMode.value,
      distance: customDistance.value,
    })
    sessionId.value = resp.session.id
    sessionStartTime.value = Date.now()
    if (timerId) clearInterval(timerId)
    timerId = window.setInterval(updateTimer, 1000)
    stage.value = 'test_shots'
  } catch (e: any) {
    error.value = e.message || (isUz.value ? 'Sessiya boshlanmadi' : 'Не удалось начать сессию')
  } finally {
    loading.value = false
  }
}

async function processTestShots() {
  if (!sessionId.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await sessionApi.processTurn({
      session_id: sessionId.value, soldier_seq: soldierSeq.value,
      shot_type: 'TEST', expected_shots: expectedTestShots.value,
      cameras: cameraConfigs.value.length > 0 ? cameraConfigs.value : null,
    })
    testResult.value = resp
    testShots.value = resp.new_shots || []
    stage.value = 'test_results'
  } catch (e: any) {
    error.value = e.message || (isUz.value ? 'Sinov otish amalga oshmadi' : 'Пробные выстрелы не обработаны')
  } finally {
    loading.value = false
  }
}

async function processTestShotsUpload() {
  if (!sessionId.value || !uploadedFile.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await sessionApi.processTurnUpload({
      session_id: sessionId.value, soldier_seq: soldierSeq.value,
      shot_type: 'TEST', expected_shots: expectedTestShots.value,
      file: uploadedFile.value, baseline_file: baselineFile.value,
    })
    testResult.value = resp
    testShots.value = resp.new_shots || []
    stage.value = 'test_results'
  } catch (e: any) {
    error.value = e.message || (isUz.value ? 'Yuklash xatosi' : 'Ошибка загрузки')
  } finally {
    loading.value = false
  }
}

function goToMainShots() {
  stage.value = 'main_shots'
  uploadedFile.value = null
  baselineFile.value = null
}

async function processMainShots() {
  if (!sessionId.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await sessionApi.processTurn({
      session_id: sessionId.value, soldier_seq: soldierSeq.value,
      shot_type: 'MAIN', expected_shots: expectedMainShots.value,
      cameras: cameraConfigs.value.length > 0 ? cameraConfigs.value : null,
    })
    mainResult.value = resp
    mainShots.value = resp.new_shots || []
    stage.value = 'main_results'
  } catch (e: any) {
    error.value = e.message || (isUz.value ? 'Asosiy otish amalga oshmadi' : 'Основные выстрелы не обработаны')
  } finally {
    loading.value = false
  }
}

async function processMainShotsUpload() {
  if (!sessionId.value || !uploadedFile.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await sessionApi.processTurnUpload({
      session_id: sessionId.value, soldier_seq: soldierSeq.value,
      shot_type: 'MAIN', expected_shots: expectedMainShots.value,
      file: uploadedFile.value, baseline_file: baselineFile.value,
    })
    mainResult.value = resp
    mainShots.value = resp.new_shots || []
    stage.value = 'main_results'
  } catch (e: any) {
    error.value = e.message || (isUz.value ? 'Yuklash xatosi' : 'Ошибка загрузки')
  } finally {
    loading.value = false
  }
}

function finishSession() {
  const allShots = [...testShots.value, ...mainShots.value]
  const totalScoreVal = (testResult.value?.total_score || 0) + (mainResult.value?.total_score || 0)
  emit('session-complete', { sessionId: sessionId.value, score: totalScoreVal, shots: allShots })
  stage.value = 'final'
}

function reset() {
  if (timerId) clearInterval(timerId)
  sessionId.value = ''
  testShots.value = []
  mainShots.value = []
  testResult.value = null
  mainResult.value = null
  error.value = null
  uploadedFile.value = null
  baselineFile.value = null
  stage.value = 'setup'
}

function onFileSelect(e: Event, isBaseline = false) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    if (isBaseline) baselineFile.value = target.files[0]
    else uploadedFile.value = target.files[0]
  }
}

const totalScoreVal = computed(() => (testResult.value?.total_score || 0) + (mainResult.value?.total_score || 0))
const totalHits = computed(() => (testResult.value?.hit_count || 0) + (mainResult.value?.hit_count || 0))
const totalShotsCount = computed(() => testShots.value.length + mainShots.value.length)
const accuracyVal = computed(() => totalShotsCount.value > 0 ? Math.round((totalHits.value / totalShotsCount.value) * 100) : 0)

onUnmounted(() => { if (timerId) clearInterval(timerId) })
</script>

<template>
  <div class="space-y-4">
    <!-- Stage progress bar -->
    <div class="flex items-center gap-1">
      <template v-for="(step, i) in stageSteps" :key="step.id">
        <div class="flex items-center gap-1 flex-1">
          <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
            :class="i < currentStepIndex ? 'bg-green-50 text-green-600' : i === currentStepIndex ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200' : 'bg-gray-50 text-gray-400'">
            <component :is="step.icon" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ step.label }}</span>
          </div>
          <ChevronRight v-if="i < stageSteps.length - 1" class="w-3 h-3 text-gray-300" />
        </div>
      </template>
    </div>

    <!-- Timer + session info -->
    <div v-if="sessionId" class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="font-mono text-gray-400">ID: {{ sessionId.substring(0, 8) }}</span>
        <span v-if="employeeName" class="text-gray-600">{{ employeeName }}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="rangeType === 'OPEN' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'">
          {{ rangeType === 'OPEN' ? (isUz ? 'Ochiq poligon' : 'Открытый полигон') : (isUz ? 'Yopiq tir' : 'Закрытый тир') }}
        </span>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg">
        <Clock class="w-3 h-3 text-green-500" />
        <span class="font-mono font-bold text-green-600">{{ elapsedTime }}</span>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ error }}</span>
      <button @click="error = null" class="ml-auto"><X class="w-3.5 h-3.5" /></button>
    </div>

    <!-- Stage: Setup -->
    <div v-if="stage === 'setup'" class="card space-y-4">
      <div class="text-center py-4">
        <Shield class="w-10 h-10 text-brand-400 mx-auto mb-3" />
        <h3 class="text-lg font-bold text-gray-800">{{ isUz ? 'Sessiyani boshlash' : 'Начать сессию' }}</h3>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? 'Parametrlarni tekshiring' : 'Проверьте параметры' }}</p>
      </div>

      <!-- Range type selector -->
      <div>
        <label class="text-xs font-bold text-gray-500 block mb-2">{{ isUz ? 'Tir turi' : 'Тип тира' }}</label>
        <div class="grid grid-cols-2 gap-2">
          <button @click="rangeType = 'OPEN'" class="p-3 rounded-lg border-2 text-left transition"
            :class="rangeType === 'OPEN' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'">
            <MapPin class="w-5 h-5 mb-1.5" :class="rangeType === 'OPEN' ? 'text-orange-500' : 'text-gray-400'" />
            <p class="text-sm font-bold" :class="rangeType === 'OPEN' ? 'text-orange-700' : 'text-gray-600'">{{ isUz ? 'Ochiq poligon' : 'Открытый полигон' }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ isUz ? "Ball tizimi (harbiylar)" : 'Балльная система (военные)' }}</p>
          </button>
          <button @click="rangeType = 'CLOSED'" class="p-3 rounded-lg border-2 text-left transition"
            :class="rangeType === 'CLOSED' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
            <Home class="w-5 h-5 mb-1.5" :class="rangeType === 'CLOSED' ? 'text-blue-500' : 'text-gray-400'" />
            <p class="text-sm font-bold" :class="rangeType === 'CLOSED' ? 'text-blue-700' : 'text-gray-600'">{{ isUz ? 'Yopiq tir' : 'Закрытый тир' }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ isUz ? "Faqat urish (prokuratura, GAI)" : 'Только попадание (прокуратура, ГАИ)' }}</p>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "O'qotuvchi" : 'Стрелок' }}</p><p class="font-medium text-gray-700">{{ employeeName || '—' }}</p></div>
        <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Yo'lag" : 'Дорожка' }}</p><p class="font-medium text-gray-700">#{{ laneNumber }}</p></div>
        <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? 'Qurol' : 'Оружие' }}</p><p class="font-medium text-gray-700">{{ weaponType || '—' }}</p></div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-400">{{ isUz ? 'Masofa' : 'Дистанция' }}</p>
          <div class="flex items-center gap-1">
            <input v-model.number="customDistance" type="number" min="10" max="500" class="w-16 bg-transparent border-b border-gray-300 text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-400" />
            <span class="text-xs text-gray-400">m</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500">{{ isUz ? 'Sinov oqlari (tahrirlanadigan)' : 'Пробные патроны (редактируемые)' }}</label>
          <div class="flex items-center gap-1">
            <button @click="expectedTestShots = Math.max(0, expectedTestShots - 1)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm">−</button>
            <input v-model.number="expectedTestShots" type="number" min="0" max="10" class="input text-sm text-center w-full" />
            <button @click="expectedTestShots = Math.min(10, expectedTestShots + 1)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm">+</button>
          </div>
          <p class="text-[10px] text-gray-400 mt-0.5">{{ isUz ? '0 — sinovsiz' : '0 — без пробных' }}</p>
        </div>
        <div>
          <label class="text-xs text-gray-500">{{ isUz ? 'Asosiy oqlar (tahrirlanadigan)' : 'Основные патроны (редактируемые)' }}</label>
          <div class="flex items-center gap-1">
            <button @click="expectedMainShots = Math.max(1, expectedMainShots - 1)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm">−</button>
            <input v-model.number="expectedMainShots" type="number" min="1" max="30" class="input text-sm text-center w-full" />
            <button @click="expectedMainShots = Math.min(30, expectedMainShots + 1)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm">+</button>
          </div>
          <p class="text-[10px] text-gray-400 mt-0.5">{{ isUz ? '1-30 ta' : '1-30 шт' }}</p>
        </div>
      </div>

      <!-- Scoring mode info -->
      <div class="p-3 rounded-lg text-xs" :class="rangeType === 'OPEN' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'">
        <div v-if="rangeType === 'OPEN'">
          <b>{{ isUz ? "Ochiq poligon:" : 'Открытый полигон:' }}</b>
          {{ isUz ? "Nishon 10-balli tizimda. Har bir o'q uchun ball beriladi (1-10). Natija ballari yig'ildi." : 'Мишень по 10-балльной системе. За каждый выстрел начисляются очки (1-10). Результат — сумма баллов.' }}
        </div>
        <div v-else>
          <b>{{ isUz ? "Yopiq tir:" : 'Закрытый тир:' }}</b>
          {{ isUz ? "Faqat urish / o'tkazib yuborish sanaladi. Ball yo'q. Natija — urishlar foizi." : 'Фиксируется только попадание / промах. Очки не начисляются. Результат — процент попаданий.' }}
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" v-model="uploadMode" class="rounded" />
          <span class="text-gray-600">{{ isUz ? "Rasm yuklash (kamera yo'q bo'lsa)" : 'Загрузка фото (если нет камеры)' }}</span>
        </label>
      </div>

      <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="startSession" :disabled="loading">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" /><Play v-else class="w-4 h-4" />{{ isUz ? "Sessiyani boshlash" : 'Начать сессию' }}
      </button>
    </div>

    <!-- Stage: Test Shots -->
    <div v-if="stage === 'test_shots' && expectedTestShots > 0" class="card space-y-4">
      <div class="text-center py-2">
        <Crosshair class="w-8 h-8 text-brand-400 mx-auto mb-2" />
        <h3 class="text-base font-bold text-gray-800">{{ isUz ? 'Sinov otish' : 'Пробные выстрелы' }}</h3>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? expectedTestShots + " ta sinov o'qi otib oling" : 'Сделайте ' + expectedTestShots + ' пробных выстрелов' }}</p>
      </div>
      <div v-if="camera" class="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg text-xs"><Camera class="w-4 h-4 text-blue-500" /><span class="text-blue-600">{{ camera.name }} — {{ camera.ip }}</span></div>
      <div v-if="uploadMode" class="space-y-2">
        <div><label class="text-xs text-gray-500 block mb-1">{{ isUz ? "Nishon rasmi" : 'Фото мишени' }}</label><input type="file" accept="image/*" class="text-xs w-full" @change="onFileSelect($event, false)" /></div>
        <div><label class="text-xs text-gray-500 block mb-1">{{ isUz ? "Bazis rasm (ixtiyoriy)" : 'Базовое фото (опц.)' }}</label><input type="file" accept="image/*" class="text-xs w-full" @change="onFileSelect($event, true)" /></div>
        <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="processTestShotsUpload" :disabled="loading || !uploadedFile"><Loader2 v-if="loading" class="w-4 h-4 animate-spin" /><Upload v-else class="w-4 h-4" />{{ isUz ? "Yuklash va tahlil" : 'Загрузить и анализировать' }}</button>
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-500 text-center">{{ isUz ? 'Kamera avtomatik aniqlaydi. Otib, tugmani bosing.' : 'Камера автоматически обнаружит. Сделайте выстрелы и нажмите кнопку.' }}</p></div>
        <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="processTestShots" :disabled="loading"><Loader2 v-if="loading" class="w-4 h-4 animate-spin" /><Crosshair v-else class="w-4 h-4" />{{ isUz ? "Oqlarni aniqlash" : 'Обнаружить выстрелы' }}</button>
      </div>
    </div>

    <!-- Skip test shots if 0 -->
    <div v-if="stage === 'test_shots' && expectedTestShots === 0" class="card space-y-4">
      <div class="text-center py-3">
        <p class="text-sm text-gray-500">{{ isUz ? "Sinov oqlari yo'q. Asosiy otishga o'tilmoqda..." : 'Без пробных выстрелов. Переход к основным...' }}</p>
      </div>
      <button class="btn-primary w-full text-sm" @click="goToMainShots">{{ isUz ? "Asosiy otishga o'tish" : 'Перейти к основным' }}</button>
    </div>

    <!-- Stage: Test Results -->
    <div v-if="stage === 'test_results'" class="card space-y-4">
      <div class="flex items-center gap-2 text-green-600"><CheckCircle2 class="w-5 h-5" /><h3 class="text-base font-bold">{{ isUz ? "Sinov natijalari" : 'Результаты пробных' }}</h3></div>
      <div class="grid gap-3 text-center" :class="rangeType === 'OPEN' ? 'grid-cols-3' : 'grid-cols-2'">
        <div class="bg-gray-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Topilgan" : 'Найдено' }}</p><p class="text-xl font-bold text-gray-800">{{ testShots.length }}</p></div>
        <div class="bg-green-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Urish" : 'Попад.' }}</p><p class="text-xl font-bold text-green-600">{{ testResult?.hit_count || 0 }}/{{ testShots.length }}</p></div>
        <div v-if="rangeType === 'OPEN'" class="bg-brand-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Ball" : 'Балл' }}</p><p class="text-xl font-bold text-brand-600">{{ testResult?.total_score || 0 }}</p></div>
      </div>
      <div v-if="testResult?.result_image_url" class="space-y-1"><p class="text-xs text-gray-400">{{ isUz ? "Nishon rasmi" : 'Фото мишени' }}</p><img :src="resolveImageUrl(testResult.result_image_url)" class="w-full rounded-lg border border-gray-200" /></div>
      <div v-if="testShots.length > 0 && rangeType === 'OPEN'" class="space-y-1">
        <p class="text-xs font-bold text-gray-500">{{ isUz ? "Oqlar royxati" : 'Список выстрелов' }}</p>
        <div v-for="(shot, i) in testShots" :key="shot.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
          <span class="font-mono text-gray-400">#{{ i + 1 }}</span><span class="font-mono text-gray-400">X:{{ shot.x.toFixed(1) }} Y:{{ shot.y.toFixed(1) }}</span>
          <span class="font-bold" :class="shot.score >= 8 ? 'text-green-600' : shot.score >= 5 ? 'text-yellow-600' : 'text-red-500'">{{ shot.score }}</span>
        </div>
      </div>
      <div v-if="testShots.length > 0 && rangeType === 'CLOSED'" class="space-y-1">
        <p class="text-xs font-bold text-gray-500">{{ isUz ? "Oqlar royxati" : 'Список выстрелов' }}</p>
        <div v-for="(shot, i) in testShots" :key="shot.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
          <span class="font-mono text-gray-400">#{{ i + 1 }}</span>
          <span class="font-bold text-green-600">{{ isUz ? "Urish" : 'Попадание' }}</span>
        </div>
      </div>
      <div v-if="testResult?.warning" class="text-xs text-yellow-600 flex items-center gap-1.5"><AlertCircle class="w-3.5 h-3.5" />{{ testResult.warning }}</div>
      <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="goToMainShots"><Target class="w-4 h-4" />{{ isUz ? "Asosiy otishga o'tish" : 'Перейти к основным' }}</button>
    </div>

    <!-- Stage: Main Shots -->
    <div v-if="stage === 'main_shots'" class="card space-y-4">
      <div class="text-center py-2"><Target class="w-8 h-8 text-brand-400 mx-auto mb-2" /><h3 class="text-base font-bold text-gray-800">{{ isUz ? "Asosiy otish" : 'Основные выстрелы' }}</h3><p class="text-sm text-gray-400 mt-1">{{ isUz ? expectedMainShots + " ta asosiy o'qi" : expectedMainShots + ' основных выстрелов' }}</p></div>
      <div v-if="camera" class="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg text-xs"><Camera class="w-4 h-4 text-blue-500" /><span class="text-blue-600">{{ camera.name }} — {{ camera.ip }}</span></div>
      <div v-if="uploadMode" class="space-y-2">
        <div><label class="text-xs text-gray-500 block mb-1">{{ isUz ? "Nishon rasmi" : 'Фото мишени' }}</label><input type="file" accept="image/*" class="text-xs w-full" @change="onFileSelect($event, false)" /></div>
        <div><label class="text-xs text-gray-500 block mb-1">{{ isUz ? "Bazis rasm" : 'Базовое фото' }}</label><input type="file" accept="image/*" class="text-xs w-full" @change="onFileSelect($event, true)" /></div>
        <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="processMainShotsUpload" :disabled="loading || !uploadedFile"><Loader2 v-if="loading" class="w-4 h-4 animate-spin" /><Upload v-else class="w-4 h-4" />{{ isUz ? "Yuklash" : 'Загрузить' }}</button>
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-500 text-center">{{ isUz ? "O'q otib, tugmani bosing." : 'Сделайте выстрелы и нажмите кнопку.' }}</p></div>
        <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="processMainShots" :disabled="loading"><Loader2 v-if="loading" class="w-4 h-4 animate-spin" /><Target v-else class="w-4 h-4" />{{ isUz ? "Oqlarni aniqlash" : 'Обнаружить выстрелы' }}</button>
      </div>
    </div>

    <!-- Stage: Main Results -->
    <div v-if="stage === 'main_results'" class="card space-y-4">
      <div class="flex items-center gap-2 text-green-600"><CheckCircle2 class="w-5 h-5" /><h3 class="text-base font-bold">{{ isUz ? "Asosiy natijalar" : 'Результаты основных' }}</h3></div>
      <div class="grid gap-3 text-center" :class="rangeType === 'OPEN' ? 'grid-cols-3' : 'grid-cols-2'">
        <div class="bg-gray-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Topilgan" : 'Найдено' }}</p><p class="text-xl font-bold text-gray-800">{{ mainShots.length }}</p></div>
        <div class="bg-green-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Urish" : 'Попад.' }}</p><p class="text-xl font-bold text-green-600">{{ mainResult?.hit_count || 0 }}/{{ mainShots.length }}</p></div>
        <div v-if="rangeType === 'OPEN'" class="bg-brand-50 rounded-lg p-2.5"><p class="text-xs text-gray-400">{{ isUz ? "Ball" : 'Балл' }}</p><p class="text-xl font-bold text-brand-600">{{ mainResult?.total_score || 0 }}</p></div>
      </div>
      <div v-if="mainResult?.result_image_url" class="space-y-1"><p class="text-xs text-gray-400">{{ isUz ? "Nishon rasmi" : 'Фото мишени' }}</p><img :src="resolveImageUrl(mainResult.result_image_url)" class="w-full rounded-lg border border-gray-200" /></div>
      <div v-if="mainShots.length > 0 && rangeType === 'OPEN'" class="space-y-1">
        <p class="text-xs font-bold text-gray-500">{{ isUz ? "Oqlar royxati" : 'Список выстрелов' }}</p>
        <div v-for="(shot, i) in mainShots" :key="shot.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
          <span class="font-mono text-gray-400">#{{ i + 1 }}</span><span class="font-mono text-gray-400">X:{{ shot.x.toFixed(1) }} Y:{{ shot.y.toFixed(1) }}</span>
          <span class="font-bold" :class="shot.score >= 8 ? 'text-green-600' : shot.score >= 5 ? 'text-yellow-600' : 'text-red-500'">{{ shot.score }}</span>
        </div>
      </div>
      <div v-if="mainShots.length > 0 && rangeType === 'CLOSED'" class="space-y-1">
        <p class="text-xs font-bold text-gray-500">{{ isUz ? "Oqlar royxati" : 'Список выстрелов' }}</p>
        <div v-for="(shot, i) in mainShots" :key="shot.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
          <span class="font-mono text-gray-400">#{{ i + 1 }}</span>
          <span class="font-bold text-green-600">{{ isUz ? "Urish" : 'Попадание' }}</span>
        </div>
      </div>
      <button class="btn-primary w-full text-sm flex items-center justify-center gap-2" @click="finishSession"><Award class="w-4 h-4" />{{ isUz ? "Yakunlash" : 'Завершить' }}</button>
    </div>

    <!-- Stage: Final -->
    <div v-if="stage === 'final'" class="card space-y-4">
      <div class="text-center py-4"><Award class="w-12 h-12 text-yellow-400 mx-auto mb-3" /><h3 class="text-lg font-bold text-gray-800">{{ isUz ? "Sessiya yakunlandi" : 'Сессия завершена' }}</h3></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Jami oqlar" : 'Всего' }}</p><p class="text-2xl font-bold text-gray-800">{{ totalShotsCount }}</p></div>
        <div class="bg-green-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Aniqlik" : 'Точность' }}</p><p class="text-2xl font-bold text-green-600">{{ accuracyVal }}%</p></div>
        <div v-if="rangeType === 'OPEN'" class="bg-brand-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Jami ball" : 'Итог балл' }}</p><p class="text-2xl font-bold text-brand-600">{{ totalScoreVal }}</p></div>
        <div v-else class="bg-blue-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Urishlar" : 'Попаданий' }}</p><p class="text-2xl font-bold text-blue-600">{{ totalHits }}</p></div>
        <div class="bg-yellow-50 rounded-lg p-3"><p class="text-xs text-gray-400">{{ isUz ? "Vaqt" : 'Время' }}</p><p class="text-2xl font-bold text-yellow-600">{{ elapsedTime }}</p></div>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost flex-1 text-sm flex items-center justify-center gap-1.5" @click="reset"><RefreshCw class="w-4 h-4" />{{ isUz ? "Yangi" : 'Новая' }}</button>
        <button class="btn-primary flex-1 text-sm" @click="emit('close')">{{ isUz ? "Yopish" : 'Закрыть' }}</button>
      </div>
    </div>
  </div>
</template>

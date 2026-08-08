<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Camera, ImagePlus, Cpu, FileText,
  Check, Loader2, AlertCircle, Target,
  ArrowRight, RefreshCw, Download, QrCode
} from 'lucide-vue-next'
import FileDropZone from '@/components/ui/FileDropZone.vue'
import TargetViewer from '@/components/target/TargetViewer.vue'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'
import { resolveImageUrl, getApiUrl } from '@/api/imageUrl'
import { calculateTotalScore } from '@/api/scoring.api'
import { normalizeError } from '@/utils/errorNormalizer'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

type Step = 0 | 1 | 2 | 3
const step = ref<Step>(0)

// Images
const beforeImage = ref<File | null>(null)
const afterImage = ref<File | null>(null)
const beforeImageUrl = ref('')
const afterImageUrl = ref('')

// система analysis
const analyzing = ref(false)
const analysisError = ref<{ title: string; message: string } | null>(null)
const analysisResult = ref<any>(null)

// Protocol
const generating = ref(false)
const protocolGenerated = ref(false)
const protocolUrl = ref('')

// Bilingual labels
const L = computed(() => locale.value === 'uz' ? {
  title: 'Taqqoslash',
  subtitle: 'Suratga olish → Avtomatik tahlil → Protokol',
  back: 'Natijalar',
  step1: '1-bosqich: Mishen «Toza» holatda',
  step1Desc: 'Otishdan oldingi mishen rasmini yuklang',
  step1Btn: 'Rasmni yuklash',
  step2: '2-bosqich: Mishen «Keyin» holatda',
  step2Desc: 'Otishdan keyingi mishen rasmini yuklang',
  step2Btn: 'Rasmni yuklash',
  step3: '3-bosqich: Avtomatik tahlil',
  step3Desc: 'Sun\'iy intellekt o\'q teshiklarini aniqlaydi',
  step3Btn: 'Avtomatik tahlilni boshlash',
  step4: '4-bosqich: Protokol',
  step4Desc: 'Rasmiy protokolni yarating va imzolang',
  step4Btn: 'Protokol yaratish',
  before: 'Toza mishen (Toza)',
  after: 'Keyin (Keyin)',
  analyzing: 'Avtomatik tahlil qilmoqda...',
  analyzingDesc: 'ShaffofTIR avtomatik ravishda rasmdan o\'q teshiklarini aniqlamoqda',
  hits: 'Tekkan',
  misses: 'Tegmagan',
  totalShots: 'Umumiy o\'q',
  totalScore: 'Umumiy ball',
  accuracy: 'Aniqlik',
  warnings: 'Ogohlantirish',
  protocolReady: 'Protokol tayyor!',
  protocolDesc: 'Protokol muvaffaqiyatli yaratildi',
  download: 'Yuklab olish',
  qrSign: 'QR imzo',
  newCompare: 'Yangi taqqoslash',
  needBefore: 'Avval «Toza» rasmni yuklang',
  needAfter: 'Avval «Keyin» rasmni yuklang',
  needAnalysis: 'Avval avtomatik tahlilni bajaring',
  next: 'Keyingi',
  prev: 'Oldingi',
} : {
  title: 'Сравнение',
  subtitle: 'Съёмка → автоматический анализ → Протокол',
  back: 'Результаты',
  step1: 'Шаг 1: Мишень «До»',
  step1Desc: 'Загрузите снимок мишени до стрельбы',
  step1Btn: 'Загрузить снимок',
  step2: 'Шаг 2: Мишень «После»',
  step2Desc: 'Загрузите снимок мишени после стрельбы',
  step2Btn: 'Загрузить снимок',
  step3: 'Шаг 3: автоматический анализ',
  step3Desc: 'Искусственный интеллект определит попадания',
  step3Btn: 'Запустить автоматический анализ',
  step4: 'Шаг 4: Протокол',
  step4Desc: 'Создайте и подпишите официальный протокол',
  step4Btn: 'Создать протокол',
  before: 'До',
  after: 'После',
  analyzing: 'автоматический анализирует...',
  analyzingDesc: 'ShaffofTIR автоматически обнаруживает отверстия от пуль',
  hits: 'Попаданий',
  misses: 'Промахов',
  totalShots: 'Всего выстрелов',
  totalScore: 'Общий балл',
  accuracy: 'Точность',
  warnings: 'Предупреждение',
  protocolReady: 'Протокол готов!',
  protocolDesc: 'Протокол успешно создан',
  download: 'Скачать',
  qrSign: 'QR подпись',
  newCompare: 'Новое сравнение',
  needBefore: 'Сначала загрузите снимок «До»',
  needAfter: 'Сначала загрузите снимок «После»',
  needAnalysis: 'Сначала выполните автоматический анализ',
  next: 'Далее',
  prev: 'Назад',
})

const steps = computed(() => [
  { icon: Camera, label: L.value.before },
  { icon: ImagePlus, label: L.value.after },
  { icon: Cpu, label: 'CPU' },
  { icon: FileText, label: locale.value === 'uz' ? 'Protokol' : 'Протокол' },
])

function onBeforeFiles(files: File[]) {
  beforeImage.value = files[0] || null
  if (beforeImage.value) {
    beforeImageUrl.value = URL.createObjectURL(beforeImage.value)
  }
}

function onAfterFiles(files: File[]) {
  afterImage.value = files[0] || null
  if (afterImage.value) {
    afterImageUrl.value = URL.createObjectURL(afterImage.value)
  }
}

function canGoStep1() { return !!beforeImage.value }
function canGoStep2() { return !!afterImage.value }
function canGoStep3() { return !!analysisResult.value }

function goToStep(s: Step) {
  if (s === 0) step.value = 0
  else if (s === 1 && canGoStep1()) step.value = 1
  else if (s === 2 && canGoStep1() && canGoStep2()) step.value = 2
  else if (s === 3 && canGoStep1() && canGoStep2() && canGoStep3()) step.value = 3
}

async function runAnalysis() {
  analyzing.value = true
  analysisError.value = null
  analysisResult.value = null

  try {
    // Simulate система analysis with realistic results
    // In production this would call the backend API
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Generate mock analysis based on image presence
    const totalShots = Math.floor(Math.random() * 8) + 5 // 5-12 shots
    const hits = Math.floor(Math.random() * (totalShots - 1)) + 3
    const misses = totalShots - hits
    const shots = Array.from({ length: totalShots }, (_, i) => ({
      shot_number: i + 1,
      score: i < hits ? Math.floor(Math.random() * 5) + 5 : 0, // 5-10 for hits, 0 for misses
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      is_hit: i < hits,
    }))

    analysisResult.value = {
      total_shots: totalShots,
      hit_count: hits,
      miss_count: misses,
      total_score: calculateTotalScore(shots),
      accuracy: Math.round((hits / totalShots) * 100),
      shots,
      warning: misses > 3 ? (locale.value === 'uz' ? 'Ko\'p o\'q tegmagan' : 'Много промахов') : null,
    }

    step.value = 3
  } catch (err) {
    analysisError.value = normalizeError(err)
  } finally {
    analyzing.value = false
  }
}

async function generateProtocol() {
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    protocolGenerated.value = true
    protocolUrl.value = `${getApiUrl()}/protocols/PR-${Date.now()}`
  } catch (err) {
    analysisError.value = normalizeError(err)
  } finally {
    generating.value = false
  }
}

function reset() {
  step.value = 0
  beforeImage.value = null
  afterImage.value = null
  beforeImageUrl.value = ''
  afterImageUrl.value = ''
  analyzing.value = false
  analysisError.value = null
  analysisResult.value = null
  generating.value = false
  protocolGenerated.value = false
  protocolUrl.value = ''
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button class="btn-ghost px-2.5 py-2" @click="router.push('/results')">
        <ArrowLeft class="w-4 h-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ L.title }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ L.subtitle }}</p>
      </div>
    </div>

    <!-- Stepper -->
    <div class="card p-4">
      <div class="flex items-center justify-between">
        <div v-for="(s, i) in steps" :key="i" class="flex items-center flex-1">
          <div
            class="flex items-center gap-2 cursor-pointer transition-all"
            :class="i <= step ? 'text-brand-600' : 'text-gray-300'"
            @click="goToStep(i as Step)"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style="box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.2);"
              :class="i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400' : 'bg-gray-100'"
            >
              <Check v-if="i < step" class="w-5 h-5" />
              <component v-else :is="s.icon" class="w-5 h-5" />
            </div>
            <span class="text-xs font-medium hidden sm:block">{{ s.label }}</span>
          </div>
          <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 rounded transition-all" :class="i < step ? 'bg-brand-500' : 'bg-gray-200'"></div>
        </div>
      </div>
    </div>

    <!-- Step 0: Before Image -->
    <div v-if="step === 0" class="card space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
          <Camera class="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-800">{{ L.step1 }}</h2>
          <p class="text-xs text-gray-500 mt-0.5">{{ L.step1Desc }}</p>
        </div>
      </div>

      <div v-if="beforeImageUrl" class="rounded-xl overflow-hidden border border-shell-border">
        <img :src="beforeImageUrl" alt="before" class="w-full max-h-[400px] object-contain bg-gray-50" />
      </div>

      <FileDropZone v-if="!beforeImage" :label="L.step1Btn" @files="onBeforeFiles" />

      <div v-if="beforeImage" class="flex items-center gap-3">
        <button class="btn-primary flex-1" @click="step = 1">
          {{ L.next }}
          <ArrowRight class="w-4 h-4" />
        </button>
        <button class="btn-secondary" @click="beforeImage = null; beforeImageUrl = ''">
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Step 1: After Image -->
    <div v-else-if="step === 1" class="card space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
          <ImagePlus class="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-800">{{ L.step2 }}</h2>
          <p class="text-xs text-gray-500 mt-0.5">{{ L.step2Desc }}</p>
        </div>
      </div>

      <!-- Before thumbnail for reference -->
      <div v-if="beforeImageUrl" class="flex items-center gap-2 text-xs text-gray-500">
        <img :src="beforeImageUrl" alt="before ref" class="w-12 h-12 rounded object-cover border border-shell-border" />
        <span>{{ L.before }}</span>
      </div>

      <div v-if="afterImageUrl" class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500 mb-2">{{ L.before }}</p>
          <img :src="beforeImageUrl" alt="before" class="w-full rounded-xl border border-shell-border object-contain bg-gray-50 max-h-[300px]" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">{{ L.after }}</p>
          <img :src="afterImageUrl" alt="after" class="w-full rounded-xl border border-shell-border object-contain bg-gray-50 max-h-[300px]" />
        </div>
      </div>

      <FileDropZone v-if="!afterImage" :label="L.step2Btn" @files="onAfterFiles" />

      <div v-if="afterImage" class="flex items-center gap-3">
        <button class="btn-ghost" @click="step = 0">
          <ArrowLeft class="w-4 h-4" />
          {{ L.prev }}
        </button>
        <button class="btn-primary flex-1" @click="step = 2">
          {{ L.next }}
          <ArrowRight class="w-4 h-4" />
        </button>
        <button class="btn-secondary" @click="afterImage = null; afterImageUrl = ''">
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Step 2: система Analysis -->
    <div v-else-if="step === 2" class="space-y-4">
      <div class="card space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Cpu class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-gray-800">{{ L.step3 }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ L.step3Desc }}</p>
          </div>
        </div>

        <!-- Side-by-side comparison -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-2">{{ L.before }}</p>
            <img :src="beforeImageUrl" alt="before" class="w-full rounded-xl border border-shell-border object-contain bg-gray-50 max-h-[250px]" />
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">{{ L.after }}</p>
            <img :src="afterImageUrl" alt="after" class="w-full rounded-xl border border-shell-border object-contain bg-gray-50 max-h-[250px]" />
          </div>
        </div>

        <button class="btn-primary w-full" :disabled="analyzing" @click="runAnalysis">
          <Loader2 v-if="analyzing" class="w-4 h-4 animate-spin" />
          <Cpu v-else class="w-4 h-4" />
          {{ analyzing ? L.analyzing : L.step3Btn }}
        </button>
      </div>

      <!-- система Processing -->
      <div v-if="analyzing" class="card border-blue-200 bg-blue-50/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Cpu class="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-blue-900">{{ L.analyzing }}</p>
            <p class="text-xs text-blue-600 mt-0.5">{{ L.analyzingDesc }}</p>
          </div>
          <Loader2 class="w-5 h-5 text-blue-500 animate-spin" />
        </div>
        <div class="mt-3 h-1.5 rounded-full bg-blue-100 overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" style="width: 60%"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="analysisError" class="card border-red-200 bg-red-50/50 flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-bold text-red-900">{{ analysisError.title }}</p>
          <p class="text-xs text-red-700 mt-0.5">{{ analysisError.message }}</p>
        </div>
      </div>
    </div>

    <!-- Step 3: Protocol Generation -->
    <div v-else-if="step === 3" class="space-y-4">
      <!-- Analysis Results -->
      <div v-if="analysisResult" class="card space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Check class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-gray-800">{{ L.step4 }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ L.step4Desc }}</p>
          </div>
        </div>

        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard :title="L.totalShots" :value="analysisResult.total_shots" :icon="Target" accent="brand" />
          <KPICard :title="L.hits" :value="analysisResult.hit_count" :icon="Check" accent="brand" />
          <KPICard :title="L.misses" :value="analysisResult.miss_count" :icon="AlertCircle" accent="neutral" />
          <KPICard :title="L.totalScore" :value="analysisResult.total_score" :icon="Cpu" accent="brand" />
        </div>

        <!-- Accuracy bar -->
        <div class="card bg-gray-50/50 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-600">{{ L.accuracy }}</span>
            <span class="text-sm font-bold text-brand-600">{{ analysisResult.accuracy }}%</span>
          </div>
          <div class="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" :style="{ width: analysisResult.accuracy + '%' }"></div>
          </div>
        </div>

        <!-- Warning -->
        <div v-if="analysisResult.warning" class="card border-amber-200 bg-amber-50/50 flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-bold text-amber-900">{{ L.warnings }}</p>
            <p class="text-xs text-amber-700 mt-0.5">{{ analysisResult.warning }}</p>
          </div>
        </div>

        <!-- Target viewer with detected shots -->
        <div v-if="afterImageUrl">
          <h3 class="text-sm font-bold text-gray-700 mb-3">{{ L.after }}</h3>
          <TargetViewer :image-url="afterImageUrl" :shots="analysisResult.shots" />
        </div>
      </div>

      <!-- Protocol Generation -->
      <div class="card space-y-4">
        <div v-if="!protocolGenerated" class="flex flex-col items-center text-center py-6">
          <div class="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-3">
            <FileText class="w-8 h-8 text-brand-600" />
          </div>
          <button class="btn-primary" :disabled="generating" @click="generateProtocol">
            <Loader2 v-if="generating" class="w-4 h-4 animate-spin" />
            <FileText v-else class="w-4 h-4" />
            {{ generating ? '...' : L.step4Btn }}
          </button>
        </div>

        <div v-else class="flex flex-col items-center text-center py-6 space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <Check class="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">{{ L.protocolReady }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ L.protocolDesc }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn-secondary">
              <Download class="w-4 h-4" />
              {{ L.download }}
            </button>
            <button class="btn-secondary">
              <QrCode class="w-4 h-4" />
              {{ L.qrSign }}
            </button>
          </div>
        </div>
      </div>

      <!-- New Comparison -->
      <div class="flex gap-3">
        <button class="btn-ghost" @click="step = 2">
          <ArrowLeft class="w-4 h-4" />
          {{ L.prev }}
        </button>
        <button class="btn-primary flex-1" @click="reset">
          <RefreshCw class="w-4 h-4" />
          {{ L.newCompare }}
        </button>
      </div>
    </div>
  </div>
</template>

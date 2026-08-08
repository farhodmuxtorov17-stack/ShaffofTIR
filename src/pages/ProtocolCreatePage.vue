<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useMasterStore } from '@/stores/master'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import {
  ArrowLeft, FileText, QrCode, Check, User, Calendar,
  Crosshair, Target, Award, Printer, Shield, Hash, Download, Eye, X
} from 'lucide-vue-next'
// jsPDF and html2canvas are dynamically imported to reduce chunk size

const router = useRouter()
const historyStore = useSessionsHistoryStore()
const masterStore = useMasterStore()
const authStore = useAuthStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

// Protocol data
const selectedEmployeeId = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const protocolStatus = ref<'DRAFT' | 'GENERATED' | 'SIGNED' | 'PENDING_SIGN'>('DRAFT')

// Signed state
const signed = ref(false)
const signedBy = ref('')
const signedAt = ref('')
const qrScanned = ref(false)

// PDF preview
const showPdfPreview = ref(false)
const pdfDataUrl = ref<string>('')
const generatingPdf = ref(false)

const availableEmployees = computed(() =>
  masterStore.employees.filter(e => e.status === 'ACTIVE')
)

const employeeSessions = computed(() => {
  if (!selectedEmployeeId.value) return []
  let sessions = historyStore.sessionsByEmployee[selectedEmployeeId.value] || []
  if (dateFrom.value) sessions = sessions.filter(s => new Date(s.created_at) >= new Date(dateFrom.value))
  if (dateTo.value) sessions = sessions.filter(s => new Date(s.created_at) <= new Date(dateTo.value + 'T23:59:59'))
  return sessions
})

const selectedEmployee = computed(() =>
  masterStore.employees.find(e => e.id === selectedEmployeeId.value)
)

const protocolStats = computed(() => {
  const sessions = employeeSessions.value
  if (sessions.length === 0) return { total: 0, avgScore: 0, avgAccuracy: 0, totalShots: 0, totalHits: 0, bestScore: 0, passRate: 0 }
  const totalShots = sessions.reduce((s, x) => s + x.total_shots, 0)
  const totalHits = sessions.reduce((s, x) => s + x.hit_count, 0)
  return {
    total: sessions.length,
    avgScore: Math.round(sessions.reduce((s, x) => s + x.total_score, 0) / sessions.length),
    avgAccuracy: Math.round(sessions.reduce((s, x) => s + x.accuracy, 0) / sessions.length),
    totalShots,
    totalHits,
    bestScore: Math.max(...sessions.map(s => s.total_score)),
    passRate: Math.round((sessions.filter(s => s.accuracy >= 60).length / sessions.length) * 100),
  }
})

const protocolId = computed(() => {
  if (!selectedEmployeeId.value) return ''
  const d = new Date()
  return `PR-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${selectedEmployeeId.value.slice(-3)}`
})

// QR code as SVG pattern
const qrMatrix = computed(() => {
  const size = 21
  const seed = protocolId.value || 'draft'
  const matrix: boolean[][] = []
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  for (let r = 0; r < size; r++) {
    matrix[r] = []
    for (let c = 0; c < size; c++) {
      hash = ((hash << 5) - hash + r * 31 + c * 17) | 0
      matrix[r][c] = ((hash >> 3) & 1) === 1
    }
  }
  const addFinder = (sr: number, sc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4
        matrix[sr + r][sc + c] = isBorder || isCenter
      }
    }
  }
  addFinder(0, 0)
  addFinder(0, size - 7)
  addFinder(size - 7, 0)
  return matrix
})

const qrCells = computed(() => {
  const cells: Array<{ x: number; y: number }> = []
  const matrix = qrMatrix.value
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) cells.push({ x: c, y: r })
    }
  }
  return cells
})

function generateProtocol() {
  if (!selectedEmployeeId.value || employeeSessions.value.length === 0) return
  protocolStatus.value = 'GENERATED'
}

function startSigning() {
  if (protocolStatus.value !== 'GENERATED') return
  protocolStatus.value = 'PENDING_SIGN'
}

function simulateQrScan() {
  qrScanned.value = true
  setTimeout(() => {
    signed.value = true
    signedBy.value = authStore.user?.full_name || 'Рахбарият'
    signedAt.value = new Date().toLocaleString('ru-RU')
    protocolStatus.value = 'SIGNED'
  }, 1200)
}

function resetProtocol() {
  protocolStatus.value = 'DRAFT'
  signed.value = false
  signedBy.value = ''
  signedAt.value = ''
  qrScanned.value = false
  pdfDataUrl.value = ''
  showPdfPreview.value = false
}

async function generatePDF(): Promise<string> {
  generatingPdf.value = true
  await nextTick()
  const el = document.getElementById('protocol-document')
  if (!el) { generatingPdf.value = false; return '' }

  const { default: html2canvas } = await import('html2canvas')
  const { default: jsPDF } = await import('jspdf')
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  const dataUrl = pdf.output('datauristring')
  generatingPdf.value = false
  return dataUrl
}

async function previewPDF() {
  const url = await generatePDF()
  if (url) {
    pdfDataUrl.value = url
    showPdfPreview.value = true
  }
}

async function downloadPDF() {
  const url = await generatePDF()
  if (url) {
    const link = document.createElement('a')
    link.href = url
    link.download = `${protocolId.value || 'protocol'}.pdf`
    link.click()
  }
}

function printProtocol() {
  window.print()
}

function closePreview() {
  showPdfPreview.value = false
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="router.push('/protocols')" class="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft class="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
            {{ isUz ? "Bayonnoma yaratish" : "Создание байонномы" }}
          </h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? "Xodim natijalari bo'yicha hujjat" : "Документ по результатам сотрудника" }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- PDF Preview -->
        <button v-if="protocolStatus !== 'DRAFT'" @click="previewPDF" :disabled="generatingPdf"
          class="btn-ghost flex items-center gap-2 text-xs">
          <Eye class="w-4 h-4" /> {{ generatingPdf ? (isUz ? "Yuklanmoqda..." : "Генерация...") : (isUz ? 'PDF ko\'rish' : 'PDF превью') }}
        </button>
        <!-- PDF Download -->
        <button v-if="protocolStatus !== 'DRAFT'" @click="downloadPDF" :disabled="generatingPdf"
          class="btn-ghost flex items-center gap-2 text-xs">
          <Download class="w-4 h-4" /> {{ isUz ? "PDF yuklab olish" : "PDF скачать" }}
        </button>
        <button v-if="protocolStatus === 'SIGNED'" @click="printProtocol" class="btn-ghost flex items-center gap-2 text-xs">
          <Printer class="w-4 h-4" /> {{ isUz ? "Chop etish" : "Печать" }}
        </button>
      </div>
    </div>

    <!-- Draft: select employee and date range -->
    <template v-if="protocolStatus === 'DRAFT'">
      <div class="card p-6 space-y-5">
        <div class="flex items-center gap-2 mb-2">
          <FileText class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Bayonnoma parametrlari" : "Параметры байонномы" }}</h2>
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1.5 block">{{ isUz ? "Xodim" : "Сотрудник" }}</label>
          <select v-model="selectedEmployeeId" class="input">
            <option :value="null" disabled>{{ isUz ? "Tanlang..." : "Выберите..." }}</option>
            <option v-for="emp in availableEmployees" :key="emp.id" :value="emp.id">
              {{ emp.full_name }} · {{ emp.rank }} · {{ emp.department }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">{{ isUz ? "Boshlanish sanasi" : "Дата начала" }}</label>
            <input v-model="dateFrom" type="date" class="input" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">{{ isUz ? "Tugash sanasi" : "Дата окончания" }}</label>
            <input v-model="dateTo" type="date" class="input" />
          </div>
        </div>
        <button @click="generateProtocol" :disabled="!selectedEmployeeId || employeeSessions.length === 0"
          class="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
          <FileText class="w-4 h-4" /> {{ isUz ? "Bayonnomani shakllantirish" : "Сформировать байонному" }}
        </button>
        <p v-if="selectedEmployeeId && employeeSessions.length === 0" class="text-xs text-center text-amber-600">
          {{ isUz ? "Tanlangan davrda sessiyalar topilmadi" : "Сессии за выбранный период не найдены" }}
        </p>
      </div>
    </template>

    <!-- Generated Protocol -->
    <template v-else>
      <!-- Protocol document -->
      <div class="card p-8" id="protocol-document" style="background: white;">
        <!-- Document header -->
        <div class="flex items-start justify-between mb-6 pb-6 border-b-2 border-gray-200">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Shield class="w-5 h-5 text-brand-600" />
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ isUz ? "Qurolli Kuchlar" : 'Вооружённые Силы' }}</span>
            </div>
            <h2 class="text-lg font-extrabold text-gray-900">{{ isUz ? "Otish mashg'ulotlari bayonnomasi" : 'БАЙОННОМА по итогам огневой подготовки' }}</h2>
            <p class="text-xs text-gray-400 mt-1 flex items-center gap-1.5"><Hash class="w-3 h-3" /> № {{ protocolId }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500">{{ isUz ? "Tuzilgan sana" : 'Дата составления' }}</p>
            <p class="text-sm font-bold text-gray-800">{{ new Date().toLocaleDateString('ru-RU') }}</p>
          </div>
        </div>

        <!-- Employee info -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4 text-gray-400" />
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ isUz ? "To'liq ism" : 'ФИО' }}</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedEmployee?.full_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Award class="w-4 h-4 text-gray-400" />
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ isUz ? 'Zvanja' : 'Звание' }}</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedEmployee?.rank }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-gray-400" />
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ isUz ? "Bo'lim" : 'Подразделение' }}</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedEmployee?.department }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Crosshair class="w-4 h-4 text-gray-400" />
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ isUz ? "Malaka" : 'Квалификация' }}</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedEmployee?.qualification_level }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Period -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <p class="text-xs text-gray-500">
            {{ isUz ? "Davr: " : 'Период: ' }}
            <span class="font-bold text-gray-800">
              {{ dateFrom ? new Date(dateFrom).toLocaleDateString('ru-RU') : new Date(Date.now() - 180 * 86400000).toLocaleDateString('ru-RU') }}
             -
              {{ dateTo ? new Date(dateTo).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU') }}
            </span>
          </p>
        </div>

        <!-- Stats summary -->
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? 'Sessiya' : 'Сессий' }}</p>
            <p class="text-lg font-extrabold text-gray-900">{{ protocolStats.total }}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? "O'qlar" : 'Выстрелы' }}</p>
            <p class="text-lg font-extrabold text-gray-900">{{ protocolStats.totalShots }}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? 'Aniqlangan' : 'Попадания' }}</p>
            <p class="text-lg font-extrabold text-emerald-600">{{ protocolStats.totalHits }}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? "O'rtacha ball" : 'Ср. балл' }}</p>
            <p class="text-lg font-extrabold text-brand-600">{{ protocolStats.avgScore }}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? 'Aniqlik' : 'Точность' }}</p>
            <p class="text-lg font-extrabold text-blue-600">{{ protocolStats.avgAccuracy }}%</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50">
            <p class="text-[9px] text-gray-400 uppercase">{{ isUz ? "O'tish" : 'Сдача' }}</p>
            <p class="text-lg font-extrabold text-violet-600">{{ protocolStats.passRate }}%</p>
          </div>
        </div>

        <!-- Sessions table -->
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-500 uppercase mb-3">{{ isUz ? "Sessiyalar ro'yxati" : 'Список сессий' }}</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-2 px-2 font-bold text-gray-500">#</th>
                <th class="text-left py-2 px-2 font-bold text-gray-500">{{ isUz ? 'Sana' : 'Дата' }}</th>
                <th class="text-left py-2 px-2 font-bold text-gray-500">{{ isUz ? 'Qurol' : 'Оружие' }}</th>
                <th class="text-center py-2 px-2 font-bold text-gray-500">{{ isUz ? "O'qlar" : 'Выстр.' }}</th>
                <th class="text-center py-2 px-2 font-bold text-gray-500">{{ isUz ? 'Aniqlik' : 'Точн.' }}</th>
                <th class="text-right py-2 px-2 font-bold text-gray-500">{{ isUz ? 'Ball' : 'Балл' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in employeeSessions" :key="s.id" class="border-b border-gray-100">
                <td class="py-2 px-2 text-gray-400">{{ i + 1 }}</td>
                <td class="py-2 px-2 font-medium text-gray-700">{{ new Date(s.created_at).toLocaleDateString('ru-RU') }}</td>
                <td class="py-2 px-2 text-gray-600">{{ s.weapon_name }}</td>
                <td class="py-2 px-2 text-center text-gray-600">{{ s.hit_count }}/{{ s.total_shots }}</td>
                <td class="py-2 px-2 text-center font-bold" :class="s.accuracy >= 80 ? 'text-emerald-600' : s.accuracy >= 60 ? 'text-amber-600' : 'text-red-500'">{{ s.accuracy }}%</td>
                <td class="py-2 px-2 text-right font-bold text-gray-800">{{ s.total_score }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200">
                <td colspan="4" class="py-3 px-2 text-right font-bold text-gray-500">{{ isUz ? "Jami:" : 'Итого:' }}</td>
                <td class="py-3 px-2 text-center font-bold text-gray-800">{{ protocolStats.avgAccuracy }}%</td>
                <td class="py-3 px-2 text-right font-extrabold text-brand-600">{{ protocolStats.avgScore }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Conclusion -->
        <div class="rounded-xl p-4 mb-6" style="background: linear-gradient(135deg, #f0fdf4, #f7fee7); border: 1px solid #d1fae5;">
          <p class="text-xs font-bold text-gray-600 uppercase mb-1">{{ isUz ? "Xulosa" : 'Заключение' }}</p>
          <p class="text-sm text-gray-700">
            {{ selectedEmployee?.full_name }} {{ isUz ? "davrida" : 'за период' }} {{ protocolStats.total }} {{ isUz ? "sessiyada" : 'сессий' }}
            {{ protocolStats.totalShots }} {{ isUz ? "marotaba o't ochdi" : 'выстрелов произвёл' }},
            {{ protocolStats.totalHits }} {{ isUz ? "aniqlangan" : 'попаданий' }} ({{ protocolStats.avgAccuracy }}%).
            {{ isUz ? "O'rtacha ball" : 'Средний балл' }} - {{ protocolStats.avgScore }}.
            {{ protocolStats.passRate >= 80 ? (isUz ? "Standartga to'g'ri keladi." : 'Соответствует стандарту.') : (isUz ? "Qo'shimcha mashg'ulot kerak." : 'Требуется доп. подготовка.') }}
          </p>
        </div>

        <!-- Signature section -->
        <div class="grid grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
          <!-- Signer -->
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase mb-3">{{ isUz ? "Tuzuvchi" : 'Составитель' }}</p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-bold shrink-0"
                style="box-shadow: 0 4px 10px -2px rgba(22,163,74,0.3);">
                {{ authStore.user?.full_name?.charAt(0) || '?' }}
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">{{ authStore.user?.full_name }}</p>
                <p class="text-[10px] text-gray-400">{{ authStore.user?.role === 'MANAGER' ? (isUz ? 'Rahbariyat' : 'Рахбарият') : (isUz ? 'Instruktor' : 'Инструктор') }}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-dashed border-gray-200">
              <p class="text-[10px] text-gray-400">{{ isUz ? "Imzo" : 'Подпись' }}</p>
              <div class="h-12"></div>
            </div>
          </div>

          <!-- QR / Signature -->
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase mb-3">{{ isUz ? "QR-imzo" : 'QR-подпись' }}</p>
            <template v-if="!signed">
              <template v-if="protocolStatus === 'PENDING_SIGN'">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-xs font-bold text-emerald-600">{{ isUz ? "Imzolanmoqda..." : 'Подпись...' }}</p>
                </div>
              </template>
              <template v-else-if="protocolStatus === 'GENERATED'">
                <button @click="startSigning"
                  class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 transition-all cursor-pointer group">
                  <QrCode class="w-10 h-10 text-gray-300 group-hover:text-brand-500 transition" />
                  <p class="text-xs font-bold text-gray-400 group-hover:text-brand-600">{{ isUz ? "QR orqali imzolash" : 'Подписать через QR' }}</p>
                </button>
              </template>
              <template v-else>
                <div class="flex flex-col items-center gap-3">
                  <!-- QR Code SVG -->
                  <div class="p-3 bg-white rounded-2xl border-2 border-gray-200" style="box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1);">
                    <svg viewBox="0 0 21 21" class="w-32 h-32">
                      <rect v-for="(cell, i) in qrCells" :key="i"
                          :x="cell.x" :y="cell.y" width="1" height="1" fill="#1f2937" />
                    </svg>
                  </div>
                  <p class="text-xs font-bold text-gray-500">{{ isUz ? "QR ni skanerlang" : 'Сканируйте QR' }}</p>
                  <button @click="simulateQrScan" class="btn-primary text-xs flex items-center gap-2">
                    <QrCode class="w-4 h-4" /> {{ isUz ? "Skaner qilindi" : 'Сканировано' }}
                  </button>
                </div>
              </template>
            </template>
            <template v-else>
              <div class="flex flex-col items-center gap-2">
                <div class="p-3 bg-white rounded-2xl border-2 border-emerald-300" style="box-shadow: 0 4px 12px -2px rgba(16,185,129,0.2);">
                  <svg viewBox="0 0 21 21" class="w-24 h-24">
                    <rect v-for="(cell, i) in qrCells" :key="'s'+i"
                        :x="cell.x" :y="cell.y" width="1" height="1" fill="#059669" />
                  </svg>
                </div>
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                  <Check class="w-4 h-4" />
                  <span class="text-xs font-bold">{{ isUz ? "Imzolangan" : 'Подписано' }}</span>
                </div>
                <p class="text-[10px] text-gray-400 text-center">{{ signedBy }} · {{ signedAt }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between">
        <button @click="resetProtocol" class="btn-ghost text-xs flex items-center gap-2">
          <ArrowLeft class="w-4 h-4" /> {{ isUz ? "Qayta yaratish" : 'Пересоздать' }}
        </button>
      </div>
    </template>

    <!-- PDF Preview Modal -->
    <div v-if="showPdfPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="closePreview">
      <div class="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FileText class="w-4 h-4 text-brand-600" />
            PDF {{ isUz ? "ko'rinishi" : 'превью' }} - {{ protocolId }}
          </h3>
          <div class="flex items-center gap-2">
            <button @click="downloadPDF" :disabled="generatingPdf"
              class="btn-primary text-xs flex items-center gap-2 px-4 py-2">
              <Download class="w-3.5 h-3.5" /> {{ isUz ? 'Yuklab olish' : 'Скачать' }}
            </button>
            <button @click="closePreview" class="p-2 rounded-lg hover:bg-gray-100 transition">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden bg-gray-100 p-4">
          <iframe :src="pdfDataUrl" class="w-full h-full rounded-lg border-0" style="background: white;"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

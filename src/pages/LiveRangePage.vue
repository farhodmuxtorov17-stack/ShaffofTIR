<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { republicRegions } from '@/data/republicData'
import {
  MapPin, Crosshair, Target, Activity, Zap, Radio, ChevronDown,
  Filter, LayoutGrid, List, Search, Clock, Wind, Eye, Thermometer,
  Play, Square, Wrench, Download, Grid2x2, Map as MapIcon, Table,
  X, Award, Gauge, Timer, AlertTriangle
} from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || 'MANAGER')

const loading = ref(true)
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null
let simTimer: ReturnType<typeof setInterval> | null = null

type ViewMode = 'grid' | 'diagram' | 'table'
const viewMode = ref<ViewMode>('grid')

const selectedRegion = ref<string>('')
const selectedPolygon = ref<string>('')
const selectedDistance = ref<number | ''>('')
const selectedWeaponType = ref<string>('')
const statusFilter = ref<string>('')
const searchQuery = ref<string>('')

interface Polygon {
  id: string; name: string; region: string; type: 'OPEN' | 'CLOSED'
  weather?: { wind: number; temp: number; visibility: number }
  rubegs: Rubeg[]
}
interface Rubeg {
  id: string; number: number; distance: number
  weaponType: 'PISTOL' | 'RIFLE' | 'SNIPER' | 'MACHINE_GUN'
  exercise: string; lanes: Lane[]
}
interface Lane {
  num: number; status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE'
  shooter: string; rank: string; weapon: string; ammoType: string
  shotsFired: number; shotsTotal: number; hits: number
  accuracy: number; score: number; timeRemaining: number
  series: number; seriesTotal: number; history: number[]
  bestShot: number; startedAt: number | null
}

const weaponTypeLabels: Record<string, { ru: string; uz: string }> = {
  PISTOL: { ru: 'Пистолет', uz: 'Pistolet' },
  RIFLE: { ru: 'Автомат', uz: 'Avtomat' },
  SNIPER: { ru: 'Снайпер', uz: 'Snayper' },
  MACHINE_GUN: { ru: 'Пулемёт', uz: 'Pulemyot' },
}

const distances = [25, 50, 100, 200, 300]

const exerciseLabels: Record<string, { ru: string; uz: string }> = {
  BASIC: { ru: 'Базовое упражнение', uz: "Asosiy mashq" },
  RAPID: { ru: 'Скоростная стрельба', uz: "Tezkar otish" },
  PRECISION: { ru: 'Точностная стрельба', uz: "Aniqlik otishi" },
  NIGHT: { ru: 'Ночная стрельба', uz: "Tungi otish" },
}

const shooters = [
  { name: 'Каримов А.У.', rank: 'Ефрейтор' },
  { name: 'Юлдашев Д.А.', rank: 'Сержант' },
  { name: 'Махмудов С.Б.', rank: 'Ст. сержант' },
  { name: 'Алиев Б.У.', rank: 'Рядовой' },
  { name: 'Рахимов Ж.Т.', rank: 'Мл. сержант' },
  { name: 'Эргашев Х.М.', rank: 'Ефрейтор' },
  { name: 'Нурматов А.К.', rank: 'Рядовой' },
  { name: 'Хасанов Ш.Р.', rank: 'Ст. лейтенант' },
  { name: 'Исмоилов Р.Б.', rank: 'Капитан' },
  { name: 'Турсунов О.С.', rank: 'Лейтенант' },
  { name: 'Базаров Н.Х.', rank: 'Ст. прапорщик' },
  { name: 'Восиев А.М.', rank: 'Рядовой' },
]

function weaponForType(wt: string): string {
  return wt === 'PISTOL' ? 'ПМ' : wt === 'SNIPER' ? 'СВД-С' : wt === 'MACHINE_GUN' ? 'ПКМ' : 'АК-74М'
}
function ammoForType(wt: string): string {
  return wt === 'PISTOL' ? '9×18 мм' : wt === 'SNIPER' ? '7Н1 7.62×54' : wt === 'MACHINE_GUN' ? '7БЗ 7.62×54' : '7Н6 5.45×39'
}

function generateLanes(count: number, distance: number, weaponType: string): Lane[] {
  const lanes: Lane[] = []
  for (let i = 1; i <= count; i++) {
    const occupied = Math.random() > 0.45
    const maintenance = !occupied && Math.random() > 0.82
    const shooter = occupied ? shooters[Math.floor(Math.random() * shooters.length)] : null
    const shotsTotal = distance <= 25 ? 10 : distance <= 100 ? 20 : 10
    const shotsFired = shooter ? Math.floor(Math.random() * (shotsTotal * 0.6)) + 1 : 0
    const hits = shooter ? Math.floor(shotsFired * (0.55 + Math.random() * 0.4)) : 0
    const history: number[] = []
    for (let s = 0; s < shotsFired; s++) history.push(Math.random() > 0.2 ? 1 : 0)
    lanes.push({
      num: i, status: shooter ? 'ACTIVE' : maintenance ? 'MAINTENANCE' : 'IDLE',
      shooter: shooter?.name || '', rank: shooter?.rank || '',
      weapon: shooter ? weaponForType(weaponType) : '',
      ammoType: shooter ? ammoForType(weaponType) : '',
      shotsFired, shotsTotal, hits,
      accuracy: shotsFired > 0 ? Math.round(hits / shotsFired * 100) : 0,
      score: shooter ? Math.floor(hits * (8 + Math.random() * 3)) : 0,
      timeRemaining: shooter ? Math.floor(Math.random() * 240) + 60 : 0,
      series: shooter ? Math.min(3, Math.floor(shotsFired / 5) + 1) : 0,
      seriesTotal: 3, history,
      bestShot: shooter ? Math.floor(Math.random() * 3) + 8 : 0,
      startedAt: shooter ? Date.now() - (shotsFired * 4000) : null,
    })
  }
  return lanes
}

const polygons = ref<Polygon[]>([
  { id: 'pg_chirchik', name: isUz.value ? 'Chirchiq poligoni' : 'Полигон Чирчик',
    region: 'tashkent_region', type: 'OPEN', weather: { wind: 3, temp: 32, visibility: 10 },
    rubegs: [
      { id: 'rb_c1', number: 1, distance: 100, weaponType: 'RIFLE', exercise: 'BASIC', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_c2', number: 2, distance: 200, weaponType: 'RIFLE', exercise: 'PRECISION', lanes: generateLanes(10, 200, 'RIFLE') },
      { id: 'rb_c3', number: 3, distance: 300, weaponType: 'SNIPER', exercise: 'PRECISION', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
  { id: 'pg_orta', name: isUz.value ? "O'rta Saroy poligoni" : 'Полигон Орта-Сарой',
    region: 'tashkent_city', type: 'CLOSED',
    rubegs: [
      { id: 'rb_o1', number: 1, distance: 25, weaponType: 'PISTOL', exercise: 'RAPID', lanes: generateLanes(10, 25, 'PISTOL') },
      { id: 'rb_o2', number: 2, distance: 50, weaponType: 'PISTOL', exercise: 'BASIC', lanes: generateLanes(10, 50, 'PISTOL') },
      { id: 'rb_o3', number: 3, distance: 100, weaponType: 'RIFLE', exercise: 'BASIC', lanes: generateLanes(10, 100, 'RIFLE') },
    ],
  },
  { id: 'pg_zangiota', name: isUz.value ? 'Zangiota poligoni' : 'Полигон Зангиота',
    region: 'tashkent_region', type: 'OPEN', weather: { wind: 4, temp: 34, visibility: 9 },
    rubegs: [
      { id: 'rb_z1', number: 1, distance: 100, weaponType: 'RIFLE', exercise: 'BASIC', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_z2', number: 2, distance: 200, weaponType: 'MACHINE_GUN', exercise: 'RAPID', lanes: generateLanes(10, 200, 'MACHINE_GUN') },
      { id: 'rb_z3', number: 3, distance: 300, weaponType: 'SNIPER', exercise: 'PRECISION', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
  { id: 'pg_samarkand', name: isUz.value ? 'Samarqand poligoni' : 'Полигон Самарканд',
    region: 'samarkand', type: 'OPEN', weather: { wind: 2, temp: 28, visibility: 10 },
    rubegs: [
      { id: 'rb_s1', number: 1, distance: 100, weaponType: 'RIFLE', exercise: 'BASIC', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_s2', number: 2, distance: 300, weaponType: 'SNIPER', exercise: 'NIGHT', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
])

const filteredPolygons = computed(() => {
  if (selectedPolygon.value) return polygons.value.filter(p => p.id === selectedPolygon.value)
  if (selectedRegion.value) return polygons.value.filter(p => p.region === selectedRegion.value)
  return polygons.value
})

const filteredRubegs = computed(() => {
  let result: { polygon: Polygon; rubeg: Rubeg }[] = []
  const polys = selectedPolygon.value
    ? polygons.value.filter(p => p.id === selectedPolygon.value)
    : selectedRegion.value ? polygons.value.filter(p => p.region === selectedRegion.value) : polygons.value
  polys.forEach(p => {
    p.rubegs.forEach(r => {
      if (selectedDistance.value !== '' && r.distance !== selectedDistance.value) return
      if (selectedWeaponType.value && r.weaponType !== selectedWeaponType.value) return
      result.push({ polygon: p, rubeg: r })
    })
  })
  return result
})

const expandedRubegs = ref<Set<string>>(new Set())
function toggleRubeg(key: string) {
  if (expandedRubegs.value.has(key)) expandedRubegs.value.delete(key)
  else expandedRubegs.value.add(key)
  expandedRubegs.value = new Set(expandedRubegs.value)
}

const selectedLane = ref<{ lane: Lane; rubeg: Rubeg; polygon: Polygon } | null>(null)
function openLaneDetail(lane: Lane, rubeg: Rubeg, polygon: Polygon) {
  if (lane.status === 'ACTIVE') selectedLane.value = { lane, rubeg, polygon }
}
function closeLaneDetail() { selectedLane.value = null }

const allLanes = computed(() => {
  let lanes: Lane[] = []
  filteredRubegs.value.forEach(({ rubeg }) => { lanes = lanes.concat(rubeg.lanes) })
  return lanes
})
const activeLanes = computed(() => allLanes.value.filter(l => l.status === 'ACTIVE'))
const idleLanes = computed(() => allLanes.value.filter(l => l.status === 'IDLE'))
const maintenanceLanes = computed(() => allLanes.value.filter(l => l.status === 'MAINTENANCE'))
const totalShots = computed(() => allLanes.value.reduce((s, l) => s + l.shotsFired, 0))
const totalHits = computed(() => allLanes.value.reduce((s, l) => s + l.hits, 0))
const overallAccuracy = computed(() => totalShots.value > 0 ? Math.round(totalHits.value / totalShots.value * 100) : 0)
const avgScore = computed(() => {
  const sh = activeLanes.value
  return sh.length ? Math.round(sh.reduce((s, l) => s + l.score, 0) / sh.length) : 0
})
const bestShooter = computed(() => {
  const sh = activeLanes.value
  if (!sh.length) return null
  return sh.reduce((best, l) => l.score > best.score ? l : best, sh[0])
})

function polygonStats(poly: Polygon) {
  const lanes = poly.rubegs.flatMap(r => r.lanes)
  const shots = lanes.reduce((s, l) => s + l.shotsFired, 0)
  const hits = lanes.reduce((s, l) => s + l.hits, 0)
  return {
    active: lanes.filter(l => l.status === 'ACTIVE').length,
    total: lanes.length,
    accuracy: shots > 0 ? Math.round(hits / shots * 100) : 0,
    shots,
  }
}

interface EventEntry { time: string; lane: number; text: string; type: 'hit' | 'miss' | 'info'; rubeg: string }
const events = ref<EventEntry[]>([])
const eventFilter = ref<'all' | 'hit' | 'miss'>('all')

function addEvent(lane: number, text: string, type: 'hit' | 'miss' | 'info', rubeg: string) {
  events.value.unshift({ time: new Date().toLocaleTimeString('ru-RU'), lane, text, type, rubeg })
  if (events.value.length > 50) events.value.pop()
}
const filteredEvents = computed(() => {
  if (eventFilter.value === 'all') return events.value
  return events.value.filter(e => e.type === eventFilter.value)
})

function simulateTick() {
  polygons.value.forEach(p => {
    p.rubegs.forEach(r => {
      r.lanes.forEach(lane => {
        if (lane.status === 'ACTIVE' && lane.shotsFired < lane.shotsTotal && lane.timeRemaining > 0) {
          if (Math.random() > 0.55) {
            lane.shotsFired++
            const hit = Math.random() > 0.22
            if (hit) { lane.hits++; lane.score += Math.floor(Math.random() * 3) + 8 }
            lane.history.push(hit ? 1 : 0)
            lane.accuracy = Math.round(lane.hits / lane.shotsFired * 100)
            const points = Math.floor(Math.random() * 3) + 8
            addEvent(lane.num, hit
              ? (isUz.value ? `D${lane.num} - otib o'tdi (${points}-ball)` : `Д${lane.num} — попадание (${points} очк.)`)
              : (isUz.value ? `D${lane.num} - o'tkazib yubordi` : `Д${lane.num} — промах`),
              hit ? 'hit' : 'miss', `Р${r.number}`)
          }
          lane.timeRemaining = Math.max(0, lane.timeRemaining - 3)
          if (lane.timeRemaining === 0 || lane.shotsFired >= lane.shotsTotal) {
            lane.status = 'IDLE'
            addEvent(lane.num, isUz.value ? `D${lane.num} - sessiya tugadi (Ball: ${lane.score})` : `Д${lane.num} — сессия завершена (Очки: ${lane.score})`, 'info', `Р${r.number}`)
          }
        }
        if (lane.status === 'IDLE' && Math.random() > 0.92) {
          const shooter = shooters[Math.floor(Math.random() * shooters.length)]
          lane.status = 'ACTIVE'; lane.shooter = shooter.name; lane.rank = shooter.rank
          lane.shotsFired = 0; lane.hits = 0; lane.accuracy = 0; lane.score = 0
          lane.timeRemaining = Math.floor(Math.random() * 180) + 60
          lane.history = []; lane.series = 1; lane.startedAt = Date.now()
          addEvent(lane.num, isUz.value ? `D${lane.num} - yangi sessiya` : `Д${lane.num} — новая сессия`, 'info', `Р${r.number}`)
        }
      })
    })
  })
}

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE': return { text: isUz.value ? 'FAOL' : 'АКТИВ', bg: 'bg-emerald-500', text_cls: 'text-white' }
    case 'IDLE': return { text: isUz.value ? "BO'SH" : 'СВОБОД', bg: 'bg-slate-400', text_cls: 'text-white' }
    case 'MAINTENANCE': return { text: isUz.value ? "TA'MIR" : 'ТЕХ.ОБС', bg: 'bg-amber-500', text_cls: 'text-white' }
    default: return { text: '—', bg: 'bg-slate-300', text_cls: 'text-white' }
  }
}
function laneBorder(status: string) {
  switch (status) {
    case 'ACTIVE': return 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-200/50'
    case 'IDLE': return 'border-slate-200 bg-white'
    case 'MAINTENANCE': return 'border-amber-400 bg-amber-50/50'
    default: return 'border-slate-200 bg-white'
  }
}
function accuracyColor(acc: number) {
  if (acc >= 85) return 'text-emerald-600'
  if (acc >= 70) return 'text-blue-600'
  if (acc >= 50) return 'text-amber-600'
  return 'text-red-500'
}
function accuracyBg(acc: number) {
  if (acc >= 85) return 'bg-emerald-500'
  if (acc >= 70) return 'bg-blue-500'
  if (acc >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
function progressPct(lane: Lane) { return Math.round(lane.shotsFired / lane.shotsTotal * 100) }
function regionName(id: string) {
  const r = republicRegions.find(r => r.id === id)
  return r ? (isUz.value ? r.short_uz : r.short_ru) : id
}
function weaponLabel(wt: string) {
  return weaponTypeLabels[wt] ? (isUz.value ? weaponTypeLabels[wt].uz : weaponTypeLabels[wt].ru) : wt
}
function exerciseLabel(key: string) {
  return exerciseLabels[key] ? (isUz.value ? exerciseLabels[key].uz : exerciseLabels[key].ru) : key
}
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
function distanceColor(d: number): string {
  if (d <= 25) return 'bg-blue-500'
  if (d <= 50) return 'bg-cyan-500'
  if (d <= 100) return 'bg-emerald-500'
  if (d <= 200) return 'bg-orange-500'
  return 'bg-purple-500'
}
function sparklinePath(history: number[]): string {
  if (!history.length) return ''
  const w = 120, h = 20
  const step = w / Math.max(history.length - 1, 1)
  return history.map((v, i) => {
    const x = i * step
    const y = h - (v * h)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
function accuracyRing(acc: number, size = 64): string {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const offset = c - (acc / 100) * c
  const color = acc >= 85 ? '#059669' : acc >= 70 ? '#2563eb' : acc >= 50 ? '#d97706' : '#dc2626'
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="3"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/></svg>`
}
function exportEvents() {
  const csv = 'Время,Дорожка,Событие,Тип\n' + events.value.map(e => `${e.time},Д${e.lane},${e.text.replace(/,/g, ';')},${e.type}`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `tir-events-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}
function resetFilters() {
  selectedRegion.value = ''; selectedPolygon.value = ''; selectedDistance.value = ''
  selectedWeaponType.value = ''; statusFilter.value = ''; searchQuery.value = ''
  expandedRubegs.value = new Set()
}
const isInstructor = computed(() => userRole.value === 'INSTRUCTOR' || userRole.value === 'SUPER_ADMIN')
const isSuperAdmin = computed(() => userRole.value === 'SUPER_ADMIN')

function laneMatchesSearch(lane: Lane): boolean {
  if (!searchQuery.value) return true
  const q = searchQuery.value.toLowerCase()
  return lane.shooter.toLowerCase().includes(q) || lane.weapon.toLowerCase().includes(q) || lane.rank.toLowerCase().includes(q)
}
function filteredLanes(rubeg: Rubeg): Lane[] {
  let lanes = rubeg.lanes
  if (statusFilter.value) lanes = lanes.filter(l => l.status === statusFilter.value)
  if (searchQuery.value) lanes = lanes.filter(laneMatchesSearch)
  return lanes
}

const clockDisplay = computed(() => now.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
const dateDisplay = computed(() => {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
  return now.value.toLocaleDateString('ru-RU', opts)
})

function rubegAvgAccuracy(rubeg: Rubeg): number {
  const shooters = rubeg.lanes.filter(l => l.shotsFired > 0)
  if (!shooters.length) return 0
  return Math.round(shooters.reduce((s, l) => s + l.accuracy, 0) / shooters.length)
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  simTimer = setInterval(simulateTick, 2500)
})
onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (simTimer) clearInterval(simTimer)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else class="space-y-4 animate-fade-in">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">{{ isUz ? 'TIR Jonli Markazi' : 'Ситуационный центр ТИР' }}</h1>
        <p class="text-sm text-gray-400 mt-0.5 flex items-center gap-2"><Clock class="w-3.5 h-3.5" />{{ dateDisplay }} · {{ clockDisplay }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button @click="viewMode = 'grid'" :class="viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1"><Grid2x2 class="w-3.5 h-3.5" />{{ isUz ? "To'r" : 'Сетка' }}</button>
          <button @click="viewMode = 'diagram'" :class="viewMode === 'diagram' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1"><MapIcon class="w-3.5 h-3.5" />{{ isUz ? "Sxema" : 'Схема' }}</button>
          <button @click="viewMode = 'table'" :class="viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1"><Table class="w-3.5 h-3.5" />{{ isUz ? 'Jadval' : 'Таблица' }}</button>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="text-xs font-bold text-emerald-700">{{ isUz ? 'JONLI' : 'ОНЛАЙН' }}</span>
        </div>
      </div>
    </div>

    <!-- Weather + best shooter -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="viewMode === 'grid'">
      <div class="rounded-xl p-3 bg-white border border-gray-100 flex items-center gap-3">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{{ isUz ? "Ob-havo" : 'Погода' }}</span>
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-50 text-cyan-700 text-xs"><Wind class="w-3.5 h-3.5" />3 {{ isUz ? 'm/s' : 'м/с' }}</div>
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs"><Thermometer class="w-3.5 h-3.5" />+32°C</div>
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs"><Eye class="w-3.5 h-3.5" />10 {{ isUz ? 'km' : 'км' }}</div>
      </div>
      <div v-if="bestShooter" class="rounded-xl p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center gap-3">
        <Award class="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-xs text-amber-600 font-medium">{{ isUz ? "Eng yaxshi natija" : 'Лучший результат' }}</p>
          <p class="text-sm font-bold text-amber-900">{{ bestShooter.shooter }} — {{ bestShooter.score }} {{ isUz ? 'ball' : 'очк.' }} ({{ bestShooter.accuracy }}%)</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <Filter class="w-4 h-4 text-gray-400" />
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ isUz ? 'Filtrlar' : 'Фильтры' }}</span>
        <button @click="resetFilters" class="ml-auto text-xs text-blue-500 hover:text-blue-700">{{ isUz ? 'Tozalash' : 'Сбросить' }}</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? 'Viloyat' : 'Регион' }}</label>
          <div class="relative">
            <select v-model="selectedRegion" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
              <option value="">{{ isUz ? 'Barcha viloyatlar' : 'Все регионы' }}</option>
              <option v-for="r in republicRegions" :key="r.id" :value="r.id">{{ isUz ? r.short_uz : r.short_ru }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? 'Poligon' : 'Полигон' }}</label>
          <div class="relative">
            <select v-model="selectedPolygon" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
              <option value="">{{ isUz ? 'Barcha poligonlar' : 'Все полигоны' }}</option>
              <option v-for="p in polygons" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? 'Masofa' : 'Расстояние' }}</label>
          <div class="relative">
            <select v-model.number="selectedDistance" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
              <option value="">{{ isUz ? 'Barcha masofalar' : 'Все расстояния' }}</option>
              <option v-for="d in distances" :key="d" :value="d">{{ d }}{{ isUz ? 'm' : 'м' }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? "O'q turi" : 'Тип' }}</label>
          <div class="relative">
            <select v-model="selectedWeaponType" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
              <option value="">{{ isUz ? 'Barcha turlari' : 'Все типы' }}</option>
              <option v-for="(wl, key) in weaponTypeLabels" :key="key" :value="key">{{ isUz ? wl.uz : wl.ru }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-50">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input v-model="searchQuery" type="text" :placeholder="isUz ? 'Otuvchini qidirish...' : 'Поиск стрелка...'" class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none bg-gray-50/50" />
        </div>
        <div class="flex items-center gap-1">
          <button @click="statusFilter = ''" :class="!statusFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors">{{ isUz ? 'Hammasi' : 'Все' }}</button>
          <button @click="statusFilter = 'ACTIVE'" :class="statusFilter === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors">{{ isUz ? 'Faol' : 'Актив' }}</button>
          <button @click="statusFilter = 'IDLE'" :class="statusFilter === 'IDLE' ? 'bg-slate-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors">{{ isUz ? "Bo'sh" : 'Свободн.' }}</button>
          <button @click="statusFilter = 'MAINTENANCE'" :class="statusFilter === 'MAINTENANCE' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'" class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors">{{ isUz ? "Ta'mir" : 'Тех.обс' }}</button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Crosshair class="w-3.5 h-3.5 text-emerald-600" /><span class="text-[11px] text-gray-400">{{ isUz ? 'Faol' : 'Активн.' }}</span></div>
        <p class="text-xl font-bold text-gray-900">{{ activeLanes.length }}<span class="text-sm text-gray-400">/{{ allLanes.length }}</span></p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Target class="w-3.5 h-3.5 text-blue-600" /><span class="text-[11px] text-gray-400">{{ isUz ? "O'qlar" : 'Выстрелы' }}</span></div>
        <p class="text-xl font-bold text-gray-900">{{ totalShots }}</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Activity class="w-3.5 h-3.5 text-emerald-600" /><span class="text-[11px] text-gray-400">{{ isUz ? 'Aniqlik' : 'Точность' }}</span></div>
        <p class="text-xl font-bold" :class="accuracyColor(overallAccuracy)">{{ overallAccuracy }}%</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Gauge class="w-3.5 h-3.5 text-purple-600" /><span class="text-[11px] text-gray-400">{{ isUz ? "O'rt. ball" : 'Ср. очки' }}</span></div>
        <p class="text-xl font-bold text-gray-900">{{ avgScore }}</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Zap class="w-3.5 h-3.5 text-amber-500" /><span class="text-[11px] text-gray-400">{{ isUz ? "Bo'sh" : 'Свободн.' }}</span></div>
        <p class="text-xl font-bold text-gray-900">{{ idleLanes.length }}</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1"><Radio class="w-3.5 h-3.5 text-red-500" /><span class="text-[11px] text-gray-400">{{ isUz ? "Ta'mir" : 'Тех.обс' }}</span></div>
        <p class="text-xl font-bold text-gray-900">{{ maintenanceLanes.length }}</p>
      </div>
    </div>

    <!-- Polygon cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3" v-if="viewMode !== 'table'">
      <div v-for="poly in filteredPolygons" :key="poly.id" class="rounded-xl p-3 bg-white border border-gray-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all" :class="selectedPolygon === poly.id ? 'ring-2 ring-blue-400' : ''" @click="selectedPolygon = selectedPolygon === poly.id ? '' : poly.id">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold text-gray-800 truncate">{{ poly.name }}</p>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="poly.type === 'OPEN' ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'">{{ poly.type === 'OPEN' ? (isUz ? 'Ochiq' : 'Откр.') : (isUz ? 'Yopiq' : 'Закр.') }}</span>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <div><span class="text-gray-400">{{ isUz ? 'Faol' : 'Актив' }}: </span><span class="font-bold text-emerald-600">{{ polygonStats(poly).active }}</span><span class="text-gray-400">/{{ polygonStats(poly).total }}</span></div>
          <div><span class="text-gray-400">{{ isUz ? 'Aniqlik' : 'Точн.' }}: </span><span class="font-bold" :class="accuracyColor(polygonStats(poly).accuracy)">{{ polygonStats(poly).accuracy }}%</span></div>
          <div><span class="text-gray-400">{{ isUz ? "O'qlar" : 'Выстр.' }}: </span><span class="font-bold text-gray-700">{{ polygonStats(poly).shots }}</span></div>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><LayoutGrid class="w-4 h-4 text-gray-400" />{{ isUz ? 'Otomch ruberjlari' : 'Стрелковые рубежи' }}<span class="text-xs text-gray-400 font-normal">({{ filteredRubegs.length }})</span></h3>
        <div v-if="!filteredRubegs.length" class="rounded-xl p-8 bg-white border border-gray-100 text-center"><AlertTriangle class="w-8 h-8 text-gray-300 mx-auto mb-2" /><p class="text-sm text-gray-400">{{ isUz ? 'Ruberjlar topilmadi' : 'Рубежи не найдены' }}</p></div>

        <!-- GRID VIEW -->
        <template v-if="viewMode === 'grid'">
          <div v-for="{ polygon, rubeg } in filteredRubegs" :key="`${polygon.id}_${rubeg.id}`" class="rounded-xl bg-white border border-gray-100 overflow-hidden">
            <button @click="toggleRubeg(`${polygon.id}_${rubeg.id}`)" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm" :class="distanceColor(rubeg.distance)">{{ rubeg.distance }}{{ isUz ? 'm' : 'м' }}</div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-gray-800">{{ isUz ? `Ruberj ${rubeg.number}` : `Рубеж ${rubeg.number}` }} · {{ weaponLabel(rubeg.weaponType) }}</p>
                  <p class="text-xs text-gray-400 flex items-center gap-1.5"><MapPin class="w-3 h-3" />{{ polygon.name }} · {{ regionName(polygon.region) }}<span class="text-gray-300">·</span>{{ exerciseLabel(rubeg.exercise) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-500" /><span class="text-gray-500">{{ rubeg.lanes.filter(l => l.status === 'ACTIVE').length }}</span>
                  <span class="w-2 h-2 rounded-full bg-slate-300" /><span class="text-gray-500">{{ rubeg.lanes.filter(l => l.status === 'IDLE').length }}</span>
                  <span class="w-2 h-2 rounded-full bg-amber-400" /><span class="text-gray-500">{{ rubeg.lanes.filter(l => l.status === 'MAINTENANCE').length }}</span>
                </div>
                <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="expandedRubegs.has(`${polygon.id}_${rubeg.id}`) ? 'rotate-180' : ''" />
              </div>
            </button>
            <div v-if="expandedRubegs.has(`${polygon.id}_${rubeg.id}`)" class="px-4 pb-4 pt-1">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div v-for="lane in filteredLanes(rubeg)" :key="lane.num" class="rounded-lg border p-2.5 transition-all cursor-pointer hover:shadow-md relative overflow-hidden" :class="laneBorder(lane.status)" @click="openLaneDetail(lane, rubeg, polygon)">
                  <div v-if="lane.status === 'ACTIVE'" class="absolute top-0 right-0 w-1.5 h-full bg-emerald-500 animate-pulse" />
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-bold text-gray-700">{{ isUz ? 'Dor' : 'Д' }}{{ lane.num }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="statusBadge(lane.status).bg + ' ' + statusBadge(lane.status).text_cls">{{ statusBadge(lane.status).text }}</span>
                  </div>
                  <div v-if="lane.status === 'ACTIVE'" class="space-y-1">
                    <p class="text-xs font-medium text-gray-700 truncate">{{ lane.shooter }}</p>
                    <p class="text-[10px] text-gray-400 truncate">{{ lane.rank }} · {{ lane.weapon }}</p>
                    <div class="flex items-center gap-1 text-[10px] text-gray-500"><Timer class="w-2.5 h-2.5" />{{ formatTime(lane.timeRemaining) }}</div>
                    <div class="flex items-center gap-1.5">
                      <div class="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div class="h-full rounded-full transition-all duration-500" :class="accuracyBg(lane.accuracy)" :style="{ width: progressPct(lane) + '%' }" /></div>
                      <span class="text-[10px] text-gray-400">{{ lane.shotsFired }}/{{ lane.shotsTotal }}</span>
                    </div>
                    <div class="flex items-center justify-between text-[10px] pt-0.5">
                      <span :class="accuracyColor(lane.accuracy)" class="font-bold">{{ lane.accuracy }}%</span>
                      <span class="text-gray-500">{{ isUz ? 'Ball' : 'Очк' }}: <b class="text-gray-700">{{ lane.score }}</b></span>
                    </div>
                    <div v-if="lane.history.length > 1" class="pt-1"><svg width="100%" height="20" viewBox="0 0 120 20" class="overflow-visible"><path :d="sparklinePath(lane.history)" fill="none" :stroke="lane.accuracy >= 70 ? '#059669' : '#d97706'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg></div>
                  </div>
                  <div v-else-if="lane.status === 'IDLE'" class="py-2.5 text-center"><p class="text-[10px] text-gray-400">{{ isUz ? "Bo'sh" : 'Свободна' }}</p></div>
                  <div v-else class="py-2.5 text-center"><Wrench class="w-3 h-3 text-amber-500 mx-auto mb-1" /><p class="text-[10px] text-amber-500">{{ isUz ? "Ta'mir" : 'Тех.обс' }}</p></div>
                </div>
              </div>
              <div v-if="!filteredLanes(rubeg).length" class="py-4 text-center"><p class="text-xs text-gray-400">{{ isUz ? 'Filtrga mos dorlar yoq' : 'Нет дорожек по фильтру' }}</p></div>
              <div class="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-xs">
                <div class="flex items-center gap-4">
                  <span class="text-gray-400">{{ isUz ? "O'rt. aniqlik" : 'Ср. точность' }}: <b :class="accuracyColor(rubegAvgAccuracy(rubeg))" class="ml-1">{{ rubegAvgAccuracy(rubeg) }}%</b></span>
                  <span class="text-gray-400">{{ isUz ? "Jami o'qlar" : 'Всего выстрелов' }}: <b class="text-gray-700 ml-1">{{ rubeg.lanes.reduce((s, l) => s + l.shotsFired, 0) }}</b></span>
                </div>
                <div v-if="isInstructor" class="flex gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"><Play class="w-3 h-3" />{{ isUz ? "Yangi sessiya" : 'Новая сессия' }}</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"><Square class="w-3 h-3" />{{ isUz ? 'Stop' : 'Стоп' }}</button>
                  <button v-if="isSuperAdmin" class="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"><Wrench class="w-3 h-3" />{{ isUz ? "Ta'mir" : 'Обслуж.' }}</button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- DIAGRAM VIEW -->
        <template v-if="viewMode === 'diagram'">
          <div v-for="{ polygon, rubeg } in filteredRubegs" :key="`dg_${polygon.id}_${rubeg.id}`" class="rounded-xl bg-white border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" :class="distanceColor(rubeg.distance)">{{ rubeg.distance }}{{ isUz ? 'm' : 'м' }}</div>
                <div><p class="text-sm font-semibold text-gray-800">{{ isUz ? `Ruberj ${rubeg.number}` : `Рубеж ${rubeg.number}` }} · {{ weaponLabel(rubeg.weaponType) }}</p><p class="text-xs text-gray-400">{{ polygon.name }} · {{ exerciseLabel(rubeg.exercise) }}</p></div>
              </div>
              <span class="text-xs text-gray-400">{{ rubeg.lanes.filter(l => l.status === 'ACTIVE').length }}/{{ rubeg.lanes.length }} {{ isUz ? 'faol' : 'активн.' }}</span>
            </div>
            <div class="p-4 bg-gradient-to-b from-gray-50 to-gray-100/50">
              <div class="relative">
                <div class="flex items-center justify-center mb-3">
                  <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-500">
                    <span>{{ rubeg.distance }}{{ isUz ? 'm' : 'м' }}</span><span class="text-gray-300">←</span>
                    <span>{{ isUz ? "Otish chizig'i" : 'Линия огня' }}</span><span class="text-gray-300">→</span>
                    <span>{{ isUz ? "Nishonlar" : 'Мишени' }}</span>
                  </div>
                </div>
                <div class="grid grid-cols-5 gap-2">
                  <div v-for="lane in rubeg.lanes" :key="lane.num" class="relative rounded-lg border-2 p-2 cursor-pointer transition-all hover:shadow-md" :class="laneBorder(lane.status)" @click="openLaneDetail(lane, rubeg, polygon)" :style="{ minHeight: '90px' }">
                    <div class="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-800 text-white text-[10px] font-bold flex items-center justify-center">{{ lane.num }}</div>
                    <div class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" :class="lane.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : lane.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-slate-300'" />
                    <div v-if="lane.status === 'ACTIVE'" class="text-center pt-1">
                      <p class="text-[10px] font-medium text-gray-700 truncate">{{ lane.shooter }}</p>
                      <p class="text-[9px] text-gray-400">{{ lane.accuracy }}%</p>
                      <div class="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden"><div class="h-full rounded-full" :class="accuracyBg(lane.accuracy)" :style="{ width: progressPct(lane) + '%' }" /></div>
                      <p class="text-[9px] text-gray-400 mt-0.5">{{ lane.shotsFired }}/{{ lane.shotsTotal }}</p>
                    </div>
                    <div v-else-if="lane.status === 'MAINTENANCE'" class="text-center pt-1"><Wrench class="w-3.5 h-3.5 text-amber-500 mx-auto" /></div>
                    <div v-else class="text-center pt-1"><p class="text-[10px] text-gray-300">{{ isUz ? "Bo'sh" : 'Своб.' }}</p></div>
                  </div>
                </div>
                <div class="mt-3 border-t-2 border-dashed border-gray-300 relative">
                  <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gray-100 px-2 text-[10px] text-gray-400">{{ isUz ? "Nishon chizig'i" : 'Линия мишеней' }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- TABLE VIEW -->
        <template v-if="viewMode === 'table'">
          <div class="rounded-xl bg-white border border-gray-100 overflow-hidden overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50">
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400">{{ isUz ? 'Poligon' : 'Полигон' }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400">{{ isUz ? 'Ruberj' : 'Рубеж' }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400">{{ isUz ? 'Dor' : 'Дор.' }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400">{{ isUz ? 'Otuvchi' : 'Стрелок' }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400">{{ isUz ? "Qurol" : 'Оружие' }}</th>
                  <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-400">{{ isUz ? "O'qlar" : 'Выстр.' }}</th>
                  <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-400">{{ isUz ? 'Aniqlik' : 'Точн.' }}</th>
                  <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-400">{{ isUz ? 'Ball' : 'Очки' }}</th>
                  <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-400">{{ isUz ? 'Vaqt' : 'Время' }}</th>
                  <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-400">{{ isUz ? 'Status' : 'Статус' }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="{ polygon, rubeg } in filteredRubegs" :key="`tb_${polygon.id}_${rubeg.id}`">
                  <tr v-for="lane in filteredLanes(rubeg)" :key="`tb_l_${polygon.id}_${rubeg.id}_${lane.num}`" class="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors" @click="openLaneDetail(lane, rubeg, polygon)">
                    <td class="px-3 py-2 text-xs text-gray-500 truncate max-w-[120px]">{{ polygon.name }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600">{{ rubeg.distance }}м · {{ weaponLabel(rubeg.weaponType) }}</td>
                    <td class="px-3 py-2 text-xs font-bold text-gray-700">Д{{ lane.num }}</td>
                    <td class="px-3 py-2 text-xs text-gray-700">{{ lane.shooter || '—' }}</td>
                    <td class="px-3 py-2 text-xs text-gray-500">{{ lane.weapon || '—' }}</td>
                    <td class="px-3 py-2 text-center text-xs text-gray-600">{{ lane.shotsFired }}/{{ lane.shotsTotal }}</td>
                    <td class="px-3 py-2 text-center"><span class="text-xs font-bold" :class="accuracyColor(lane.accuracy)">{{ lane.accuracy }}%</span></td>
                    <td class="px-3 py-2 text-center text-xs font-bold text-gray-700">{{ lane.score || '—' }}</td>
                    <td class="px-3 py-2 text-center text-xs text-gray-500">{{ lane.status === 'ACTIVE' ? formatTime(lane.timeRemaining) : '—' }}</td>
                    <td class="px-3 py-2 text-center"><span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="statusBadge(lane.status).bg + ' ' + statusBadge(lane.status).text_cls">{{ statusBadge(lane.status).text }}</span></td>
                  </tr>
                </template>
              </tbody>
            </table>
            <div v-if="!filteredRubegs.length || !filteredRubegs.some(r => filteredLanes(r.rubeg).length)" class="py-8 text-center"><p class="text-xs text-gray-400">{{ isUz ? "Ma'lumot topilmadi" : 'Нет данных' }}</p></div>
          </div>
        </template>
      </div>

      <!-- Event log -->
      <div class="lg:col-span-1">
        <div class="rounded-xl bg-white border border-gray-100 overflow-hidden sticky top-4">
          <div class="px-4 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><List class="w-4 h-4 text-gray-400" />{{ isUz ? 'Voqealar jurnali' : 'Журнал событий' }}</h3>
              <button @click="exportEvents" :disabled="!events.length" class="text-gray-400 hover:text-gray-600 disabled:opacity-30"><Download class="w-3.5 h-3.5" /></button>
            </div>
            <div class="flex items-center gap-1 mt-2">
              <button @click="eventFilter = 'all'" :class="eventFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'" class="px-2 py-1 rounded-md text-[10px] font-medium transition-colors">{{ isUz ? 'Hammasi' : 'Все' }} ({{ events.length }})</button>
              <button @click="eventFilter = 'hit'" :class="eventFilter === 'hit' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'" class="px-2 py-1 rounded-md text-[10px] font-medium transition-colors">{{ isUz ? 'Otg"ilar' : 'Попад.' }} ({{ events.filter(e => e.type === 'hit').length }})</button>
              <button @click="eventFilter = 'miss'" :class="eventFilter === 'miss' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'" class="px-2 py-1 rounded-md text-[10px] font-medium transition-colors">{{ isUz ? 'Promaxlar' : 'Промахи' }} ({{ events.filter(e => e.type === 'miss').length }})</button>
            </div>
          </div>
          <div class="max-h-[600px] overflow-y-auto">
            <div v-if="!filteredEvents.length" class="p-8 text-center"><p class="text-xs text-gray-400">{{ isUz ? 'Voqealar yoq' : 'Событий пока нет' }}</p></div>
            <div v-for="(e, i) in filteredEvents" :key="i" class="px-4 py-2 border-b border-gray-50 flex items-start gap-2 text-xs" :class="e.type === 'hit' ? 'bg-emerald-50/40' : e.type === 'miss' ? 'bg-red-50/40' : ''">
              <span class="text-gray-400 font-mono text-[10px] pt-0.5 flex-shrink-0">{{ e.time }}</span>
              <span class="text-[10px] text-gray-300 pt-0.5 flex-shrink-0">{{ e.rubeg }}</span>
              <span class="flex-1" :class="e.type === 'hit' ? 'text-emerald-700' : e.type === 'miss' ? 'text-red-600' : 'text-gray-600'">{{ e.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lane Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedLane" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeLaneDetail" />
        <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-in">
          <div class="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-emerald-100">{{ isUz ? 'Dor' : 'Дорожка' }} {{ selectedLane.lane.num }} · {{ selectedLane.rubeg.distance }}{{ isUz ? 'm' : 'м' }}</p>
                <p class="text-lg font-bold">{{ selectedLane.lane.shooter }}</p>
                <p class="text-xs text-emerald-100">{{ selectedLane.lane.rank }} · {{ selectedLane.lane.weapon }}</p>
              </div>
              <button @click="closeLaneDetail" class="text-emerald-100 hover:text-white"><X class="w-5 h-5" /></button>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center gap-4">
              <div class="relative" v-html="accuracyRing(selectedLane.lane.accuracy, 64)" />
              <div class="flex-1 space-y-2">
                <div class="flex items-center justify-between"><span class="text-xs text-gray-400">{{ isUz ? "O'qlar" : 'Выстрелы' }}</span><span class="text-sm font-bold text-gray-800">{{ selectedLane.lane.shotsFired }}/{{ selectedLane.lane.shotsTotal }}</span></div>
                <div class="flex items-center justify-between"><span class="text-xs text-gray-400">{{ isUz ? 'Aniqlik' : 'Точность' }}</span><span class="text-sm font-bold" :class="accuracyColor(selectedLane.lane.accuracy)">{{ selectedLane.lane.accuracy }}%</span></div>
                <div class="flex items-center justify-between"><span class="text-xs text-gray-400">{{ isUz ? 'Ball' : 'Очки' }}</span><span class="text-sm font-bold text-gray-800">{{ selectedLane.lane.score }}</span></div>
                <div class="flex items-center justify-between"><span class="text-xs text-gray-400">{{ isUz ? "Qolgan vaqt" : 'Осталось' }}</span><span class="text-sm font-bold text-gray-800">{{ formatTime(selectedLane.lane.timeRemaining) }}</span></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-1"><span class="text-gray-400">{{ isUz ? "Progress" : 'Прогресс' }}</span><span class="text-gray-600 font-medium">{{ progressPct(selectedLane.lane) }}%</span></div>
              <div class="h-2 rounded-full bg-gray-200 overflow-hidden"><div class="h-full rounded-full transition-all duration-500" :class="accuracyBg(selectedLane.lane.accuracy)" :style="{ width: progressPct(selectedLane.lane) + '%' }" /></div>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-2">{{ isUz ? "O'qlar tarixi" : 'История выстрелов' }}</p>
              <div class="flex flex-wrap gap-1">
                <div v-for="(shot, si) in selectedLane.lane.history" :key="si" class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" :class="shot ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'">{{ shot ? '✓' : '✗' }}</div>
                <div v-if="!selectedLane.lane.history.length" class="text-xs text-gray-300">{{ isUz ? "Hozircha yo'q" : 'Пока нет выстрелов' }}</div>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div><p class="text-xs text-gray-400">{{ isUz ? "Seriya" : 'Серия' }}</p><p class="text-sm font-bold text-gray-800">{{ selectedLane.lane.series }} / {{ selectedLane.lane.seriesTotal }}</p></div>
              <div><p class="text-xs text-gray-400">{{ isUz ? "Patron" : 'Патрон' }}</p><p class="text-sm font-bold text-gray-800">{{ selectedLane.lane.ammoType }}</p></div>
              <div><p class="text-xs text-gray-400">{{ isUz ? "Eng yaxshi" : 'Лучший' }}</p><p class="text-sm font-bold text-gray-800">{{ selectedLane.lane.bestShot }} {{ isUz ? 'ball' : 'очк.' }}</p></div>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500"><MapPin class="w-3.5 h-3.5" />{{ selectedLane.polygon.name }} · {{ isUz ? `Ruberj ${selectedLane.rubeg.number}` : `Рубеж ${selectedLane.rubeg.number}` }} · {{ exerciseLabel(selectedLane.rubeg.exercise) }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

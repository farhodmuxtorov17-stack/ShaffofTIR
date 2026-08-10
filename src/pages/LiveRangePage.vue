<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { republicRegions } from '@/data/republicData'
import { MapPin, Crosshair, Target, Activity, Zap, Radio, ChevronDown, Filter, LayoutGrid, List } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || 'MANAGER')

const loading = ref(true)
const tick = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

/* ── Filter state ── */
const selectedRegion = ref<string>('')
const selectedPolygon = ref<string>('')
const selectedDistance = ref<number | ''>('')
const selectedWeaponType = ref<string>('')

/* ── Data structures ── */
interface Polygon {
  id: string
  name: string
  region: string
  type: 'OPEN' | 'CLOSED'
  rubegs: Rubeg[]
}
interface Rubeg {
  id: string
  number: number
  distance: number
  weaponType: 'PISTOL' | 'RIFLE' | 'SNIPER' | 'MACHINE_GUN'
  lanes: Lane[]
}
interface Lane {
  num: number
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE'
  shooter: string
  rank: string
  weapon: string
  shotsFired: number
  shotsTotal: number
  hits: number
  accuracy: number
  score: number
  timeRemaining: number
}

const weaponTypeLabels: Record<string, { ru: string; uz: string }> = {
  PISTOL: { ru: 'Пистолет', uz: 'Pistolet' },
  RIFLE: { ru: 'Автомат', uz: 'Avtomat' },
  SNIPER: { ru: 'Снайпер', uz: 'Snayper' },
  MACHINE_GUN: { ru: 'Пулемёт', uz: 'Pulemyot' },
}

const distances = [25, 50, 100, 200, 300]

function generateLanes(count: number, distance: number, weaponType: string): Lane[] {
  const shooters = [
    { name: 'Каримов А.У.', rank: 'Ефрейтор', weapon: weaponType === 'PISTOL' ? 'ПМ' : weaponType === 'SNIPER' ? 'СВД' : weaponType === 'MACHINE_GUN' ? 'ПК' : 'АК-74' },
    { name: 'Юлдашев Д.А.', rank: 'Сержант', weapon: weaponType === 'PISTOL' ? 'ПМ' : 'АК-74' },
    { name: 'Махмудов С.Б.', rank: 'Ст. сержант', weapon: weaponType === 'PISTOL' ? 'ПМ' : 'АК-12' },
    { name: 'Алиев Б.У.', rank: 'Рядовой', weapon: 'АК-74' },
    { name: 'Рахимов Ж.Т.', rank: 'Мл. сержант', weapon: weaponType === 'SNIPER' ? 'СВД' : 'АК-74' },
    { name: 'Эргашев Х.М.', rank: 'Ефрейтор', weapon: 'АК-12' },
    { name: 'Нурматов А.К.', rank: 'Рядовой', weapon: 'АК-74' },
  ]
  const lanes: Lane[] = []
  for (let i = 1; i <= count; i++) {
    const occupied = Math.random() > 0.5
    const maintenance = !occupied && Math.random() > 0.85
    const shooter = occupied ? shooters[Math.floor(Math.random() * shooters.length)] : null
    const shotsFired = shooter ? Math.floor(Math.random() * 15) + 1 : 0
    const shotsTotal = distance <= 25 ? 10 : distance <= 100 ? 20 : 10
    const hits = shooter ? Math.floor(shotsFired * (0.6 + Math.random() * 0.35)) : 0
    lanes.push({
      num: i,
      status: shooter ? 'ACTIVE' : maintenance ? 'MAINTENANCE' : 'IDLE',
      shooter: shooter?.name || '',
      rank: shooter?.rank || '',
      weapon: shooter?.weapon || '',
      shotsFired,
      shotsTotal,
      hits,
      accuracy: shotsFired > 0 ? Math.round(hits / shotsFired * 100) : 0,
      score: shooter ? Math.floor(hits * (8 + Math.random() * 3)) : 0,
      timeRemaining: shooter ? Math.floor(Math.random() * 180) + 30 : 0,
    })
  }
  return lanes
}

const polygons = ref<Polygon[]>([
  {
    id: 'pg_chirchik', name: isUz.value ? 'Chirchiq poligoni' : 'Полигон Чирчик',
    region: 'tashkent_region', type: 'OPEN',
    rubegs: [
      { id: 'rb_c1', number: 1, distance: 100, weaponType: 'RIFLE', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_c2', number: 2, distance: 200, weaponType: 'RIFLE', lanes: generateLanes(10, 200, 'RIFLE') },
      { id: 'rb_c3', number: 3, distance: 300, weaponType: 'SNIPER', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
  {
    id: 'pg_orta', name: isUz.value ? "O'rta Saroy poligoni" : 'Полигон Орта-Сарой',
    region: 'tashkent_city', type: 'CLOSED',
    rubegs: [
      { id: 'rb_o1', number: 1, distance: 25, weaponType: 'PISTOL', lanes: generateLanes(10, 25, 'PISTOL') },
      { id: 'rb_o2', number: 2, distance: 50, weaponType: 'PISTOL', lanes: generateLanes(10, 50, 'PISTOL') },
      { id: 'rb_o3', number: 3, distance: 100, weaponType: 'RIFLE', lanes: generateLanes(10, 100, 'RIFLE') },
    ],
  },
  {
    id: 'pg_zangiota', name: isUz.value ? 'Zangiota poligoni' : 'Полигон Зангиота',
    region: 'tashkent_region', type: 'OPEN',
    rubegs: [
      { id: 'rb_z1', number: 1, distance: 100, weaponType: 'RIFLE', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_z2', number: 2, distance: 200, weaponType: 'MACHINE_GUN', lanes: generateLanes(10, 200, 'MACHINE_GUN') },
      { id: 'rb_z3', number: 3, distance: 300, weaponType: 'SNIPER', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
  {
    id: 'pg_samarkand', name: isUz.value ? 'Samarqand poligoni' : 'Полигон Самарканд',
    region: 'samarkand', type: 'OPEN',
    rubegs: [
      { id: 'rb_s1', number: 1, distance: 100, weaponType: 'RIFLE', lanes: generateLanes(10, 100, 'RIFLE') },
      { id: 'rb_s2', number: 2, distance: 300, weaponType: 'SNIPER', lanes: generateLanes(10, 300, 'SNIPER') },
    ],
  },
])

/* ── Filtered data ── */
const filteredPolygons = computed(() => {
  if (!selectedRegion.value) return polygons.value
  return polygons.value.filter(p => p.region === selectedRegion.value)
})

const filteredRubegs = computed(() => {
  let result: { polygon: Polygon; rubeg: Rubeg }[] = []
  const polys = selectedPolygon.value
    ? polygons.value.filter(p => p.id === selectedPolygon.value)
    : filteredPolygons.value
  polys.forEach(p => {
    p.rubegs.forEach(r => {
      if (selectedDistance.value !== '' && r.distance !== selectedDistance.value) return
      if (selectedWeaponType.value && r.weaponType !== selectedWeaponType.value) return
      result.push({ polygon: p, rubeg: r })
    })
  })
  return result
})

/* ── Selected rubeg ── */
const selectedRubegKey = ref<string>('')
const selectedRubeg = computed(() => {
  if (!selectedRubegKey.value) return null
  for (const p of polygons.value) {
    const r = p.rubegs.find(r => `${p.id}_${r.id}` === selectedRubegKey.value)
    if (r) return { polygon: p, rubeg: r }
  }
  return null
})

/* ── Stats ── */
const allLanes = computed(() => {
  let lanes: Lane[] = []
  filteredRubegs.value.forEach(({ rubeg }) => {
    lanes = lanes.concat(rubeg.lanes)
  })
  return lanes
})
const activeLanes = computed(() => allLanes.value.filter(l => l.status === 'ACTIVE'))
const idleLanes = computed(() => allLanes.value.filter(l => l.status === 'IDLE'))
const maintenanceLanes = computed(() => allLanes.value.filter(l => l.status === 'MAINTENANCE'))
const totalShots = computed(() => allLanes.value.reduce((s, l) => s + l.shotsFired, 0))
const totalHits = computed(() => allLanes.value.reduce((s, l) => s + l.hits, 0))
const overallAccuracy = computed(() => totalShots.value > 0 ? Math.round(totalHits.value / totalShots.value * 100) : 0)

/* ── Event log ── */
interface EventEntry { time: string; lane: number; text: string; type: 'hit' | 'miss' | 'info' }
const events = ref<EventEntry[]>([])

function addEvent(lane: number, text: string, type: 'hit' | 'miss' | 'info') {
  events.value.unshift({ time: new Date().toLocaleTimeString('ru-RU'), lane, text, type })
  if (events.value.length > 30) events.value.pop()
}

/* ── Live simulation ── */
function simulateTick() {
  tick.value++
  polygons.value.forEach(p => {
    p.rubegs.forEach(r => {
      r.lanes.forEach(lane => {
        if (lane.status === 'ACTIVE' && lane.shotsFired < lane.shotsTotal && lane.timeRemaining > 0) {
          if (Math.random() > 0.65) {
            lane.shotsFired++
            const hit = Math.random() > 0.2
            if (hit) {
              lane.hits++
              lane.score += Math.floor(Math.random() * 3) + 8
            }
            lane.accuracy = Math.round(lane.hits / lane.shotsFired * 100)
            addEvent(lane.num, hit
              ? (isUz.value ? `D${lane.num} - otib o'tdi (${Math.floor(Math.random()*3)+8}-ball)` : `Д${lane.num} - попадание (${Math.floor(Math.random()*3)+8} очков)`)
              : (isUz.value ? `D${lane.num} - o'tkazib yubordi` : `Д${lane.num} - промах`),
              hit ? 'hit' : 'miss')
          }
          lane.timeRemaining = Math.max(0, lane.timeRemaining - 1)
          if (lane.timeRemaining === 0 || lane.shotsFired >= lane.shotsTotal) {
            lane.status = 'IDLE'
            addEvent(lane.num, isUz.value ? `D${lane.num} - sessiya tugadi` : `Д${lane.num} - сессия завершена`, 'info')
          }
        }
      })
    })
  })
}

/* ── UI helpers ── */
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
    case 'ACTIVE': return 'border-emerald-400 bg-emerald-50'
    case 'IDLE': return 'border-slate-200 bg-white'
    case 'MAINTENANCE': return 'border-amber-400 bg-amber-50'
    default: return 'border-slate-200 bg-white'
  }
}
function accuracyColor(acc: number) {
  if (acc >= 85) return 'text-emerald-600'
  if (acc >= 70) return 'text-blue-600'
  if (acc >= 50) return 'text-amber-600'
  return 'text-red-500'
}
function progressPct(lane: Lane) {
  return Math.round(lane.shotsFired / lane.shotsTotal * 100)
}
function regionName(id: string) {
  const r = republicRegions.find(r => r.id === id)
  return r ? (isUz.value ? r.short_uz : r.short_ru) : id
}
function weaponLabel(wt: string) {
  return weaponTypeLabels[wt] ? (isUz.value ? weaponTypeLabels[wt].uz : weaponTypeLabels[wt].ru) : wt
}

function selectRubeg(key: string) {
  selectedRubegKey.value = selectedRubegKey.value === key ? '' : key
}

function resetFilters() {
  selectedRegion.value = ''
  selectedPolygon.value = ''
  selectedDistance.value = ''
  selectedWeaponType.value = ''
  selectedRubegKey.value = ''
}

/* ── Role flags ── */
const isInstructor = computed(() => userRole.value === 'INSTRUCTOR' || userRole.value === 'SUPER_ADMIN')
const isSuperAdmin = computed(() => userRole.value === 'SUPER_ADMIN')

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
  timer = setInterval(simulateTick, 2500)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else class="space-y-4 animate-fade-in">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          {{ isUz ? 'TIR Jonli Markazi' : 'Ситуационный центр ТИР' }}
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ isUz ? 'Poligon, ruberjlar va dorgalarda jonli kuzatuv' : 'Полигон, рубежи и дорожки в реальном времени' }}
        </p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span class="text-xs font-medium text-emerald-700">{{ isUz ? 'JONLI' : 'ОНЛАЙН' }}</span>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <Filter class="w-4 h-4 text-gray-400" />
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ isUz ? 'Filtrlar' : 'Фильтры' }}</span>
        <button @click="resetFilters" class="ml-auto text-xs text-blue-500 hover:text-blue-700">
          {{ isUz ? 'Tozalash' : 'Сбросить' }}
        </button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Region -->
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
        <!-- Polygon -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? 'Poligon' : 'Полигон' }}</label>
          <div class="relative">
            <select v-model="selectedPolygon" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none" :disabled="!filteredPolygons.length">
              <option value="">{{ isUz ? 'Barcha poligonlar' : 'Все полигоны' }}</option>
              <option v-for="p in filteredPolygons" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <!-- Distance -->
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
        <!-- Weapon type -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">{{ isUz ? "O'q otish turi" : 'Тип стрельбы' }}</label>
          <div class="relative">
            <select v-model="selectedWeaponType" class="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none">
              <option value="">{{ isUz ? 'Barcha turlari' : 'Все типы' }}</option>
              <option v-for="(wl, key) in weaponTypeLabels" :key="key" :value="key">{{ isUz ? wl.uz : wl.ru }}</option>
            </select>
            <ChevronDown class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1">
          <Crosshair class="w-3.5 h-3.5 text-emerald-600" />
          <span class="text-xs text-gray-400">{{ isUz ? 'Faol dorgalar' : 'Активн. дорожки' }}</span>
        </div>
        <p class="text-xl font-bold text-gray-900">{{ activeLanes.length }}<span class="text-sm text-gray-400">/{{ allLanes.length }}</span></p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1">
          <Target class="w-3.5 h-3.5 text-blue-600" />
          <span class="text-xs text-gray-400">{{ isUz ? "Jami o'q" : 'Выстрелов' }}</span>
        </div>
        <p class="text-xl font-bold text-gray-900">{{ totalShots }}</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1">
          <Activity class="w-3.5 h-3.5 text-emerald-600" />
          <span class="text-xs text-gray-400">{{ isUz ? 'Aniqlik' : 'Точность' }}</span>
        </div>
        <p class="text-xl font-bold" :class="accuracyColor(overallAccuracy)">{{ overallAccuracy }}%</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1">
          <Zap class="w-3.5 h-3.5 text-amber-500" />
          <span class="text-xs text-gray-400">{{ isUz ? "Bo'sh" : 'Свободн.' }}</span>
        </div>
        <p class="text-xl font-bold text-gray-900">{{ idleLanes.length }}</p>
      </div>
      <div class="rounded-xl p-3 bg-white border border-gray-100">
        <div class="flex items-center gap-1.5 mb-1">
          <Radio class="w-3.5 h-3.5 text-red-500" />
          <span class="text-xs text-gray-400">{{ isUz ? "Ta'mir" : 'Тех.обс' }}</span>
        </div>
        <p class="text-xl font-bold text-gray-900">{{ maintenanceLanes.length }}</p>
      </div>
    </div>

    <!-- Main layout: rubegs + event log -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Left: rubegs -->
      <div class="lg:col-span-2 space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <LayoutGrid class="w-4 h-4 text-gray-400" />
          {{ isUz ? 'Otomch ruberjlari' : 'Стрелковые рубежи' }}
          <span class="text-xs text-gray-400 font-normal">({{ filteredRubegs.length }})</span>
        </h3>

        <div v-if="!filteredRubegs.length" class="rounded-xl p-8 bg-white border border-gray-100 text-center">
          <p class="text-sm text-gray-400">{{ isUz ? 'Ruberjlar topilmadi' : 'Рубежи не найдены' }}</p>
        </div>

        <div v-for="{ polygon, rubeg } in filteredRubegs" :key="`${polygon.id}_${rubeg.id}`" class="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <button
            @click="selectRubeg(`${polygon.id}_${rubeg.id}`)"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                :class="rubeg.weaponType === 'SNIPER' ? 'bg-purple-500' : rubeg.weaponType === 'PISTOL' ? 'bg-blue-500' : rubeg.weaponType === 'MACHINE_GUN' ? 'bg-red-500' : 'bg-emerald-500'">
                {{ rubeg.distance }}{{ isUz ? 'm' : 'м' }}
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-gray-800">
                  {{ isUz ? `Ruberj ${rubeg.number}` : `Рубеж ${rubeg.number}` }} · {{ weaponLabel(rubeg.weaponType) }}
                </p>
                <p class="text-xs text-gray-400">
                  <MapPin class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ polygon.name }} · {{ regionName(polygon.region) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-400">
                {{ rubeg.lanes.filter(l => l.status === 'ACTIVE').length }}/{{ rubeg.lanes.length }} {{ isUz ? 'faol' : 'активн' }}
              </span>
              <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="selectedRubegKey === `${polygon.id}_${rubeg.id}` ? 'rotate-180' : ''" />
            </div>
          </button>

          <div v-if="selectedRubegKey === `${polygon.id}_${rubeg.id}`" class="px-4 pb-4 pt-1">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div v-for="lane in rubeg.lanes" :key="lane.num"
                class="rounded-lg border p-2.5 transition-all" :class="laneBorder(lane.status)">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-gray-600">{{ isUz ? 'Dor' : 'Д' }}{{ lane.num }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="statusBadge(lane.status).bg + ' ' + statusBadge(lane.status).text_cls">
                    {{ statusBadge(lane.status).text }}
                  </span>
                </div>
                <div v-if="lane.status === 'ACTIVE'" class="space-y-1">
                  <p class="text-xs font-medium text-gray-700 truncate">{{ lane.shooter }}</p>
                  <p class="text-[10px] text-gray-400 truncate">{{ lane.rank }} · {{ lane.weapon }}</p>
                  <div class="flex items-center gap-1.5">
                    <div class="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: progressPct(lane) + '%' }" />
                    </div>
                    <span class="text-[10px] text-gray-400">{{ lane.shotsFired }}/{{ lane.shotsTotal }}</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px]">
                    <span :class="accuracyColor(lane.accuracy)">{{ lane.accuracy }}%</span>
                    <span class="text-gray-500">{{ isUz ? 'Ball' : 'Очк' }}: {{ lane.score }}</span>
                  </div>
                </div>
                <div v-else-if="lane.status === 'IDLE'" class="py-2 text-center">
                  <p class="text-[10px] text-gray-400">{{ isUz ? "Bo'sh" : 'Свободна' }}</p>
                </div>
                <div v-else class="py-2 text-center">
                  <p class="text-[10px] text-amber-500">{{ isUz ? "Ta'mir" : 'Тех. обслуживание' }}</p>
                </div>
              </div>
            </div>

            <div v-if="isInstructor" class="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <button class="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                {{ isUz ? "Yangi sessiya" : 'Новая сессия' }}
              </button>
              <button class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                {{ isUz ? "O'q otishni to'xtatish" : 'Стоп стрельбу' }}
              </button>
              <button v-if="isSuperAdmin" class="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
                {{ isUz ? "Ta'mir rejimi" : 'Режим обслуживания' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: event log -->
      <div class="lg:col-span-1">
        <div class="rounded-xl bg-white border border-gray-100 overflow-hidden sticky top-4">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <List class="w-4 h-4 text-gray-400" />
              {{ isUz ? 'Voqealar jurnali' : 'Журнал событий' }}
            </h3>
          </div>
          <div class="max-h-[500px] overflow-y-auto">
            <div v-if="!events.length" class="p-8 text-center">
              <p class="text-xs text-gray-400">{{ isUz ? 'Voqealar yoq' : 'Событий пока нет' }}</p>
            </div>
            <div v-for="(e, i) in events" :key="i" class="px-4 py-2 border-b border-gray-50 flex items-start gap-2 text-xs"
              :class="e.type === 'hit' ? 'bg-emerald-50/50' : e.type === 'miss' ? 'bg-red-50/50' : ''">
              <span class="text-gray-400 font-mono text-[10px] pt-0.5">{{ e.time }}</span>
              <span class="flex-1"
                :class="e.type === 'hit' ? 'text-emerald-700' : e.type === 'miss' ? 'text-red-600' : 'text-gray-600'">
                {{ e.text }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

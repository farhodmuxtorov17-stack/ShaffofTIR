<script setup lang="ts">
import type { WeaponCategory, Weapon } from '@/types/extended'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Crosshair, Route, Camera, Shield, RefreshCw, Clock, Server, Activity, Wifi, Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, MapPin, AlertTriangle, CheckCircle2, Wrench, Zap, Search, Signal, Network, Monitor, Cpu, HardDrive, Radio } from 'lucide-vue-next'

const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const loading = ref(true)
const refreshing = ref(false)
const activeTab = ref('polygons')
const currentTime = ref('')
const expandedRange = ref<string | null>(null)
const expandedRubeg = ref<string | null>(null)
const searchQuery = ref('')

const ranges = computed(() => masterStore.ranges)
const rubegs = computed(() => masterStore.rubegs)
const weapons = computed(() => masterStore.weapons)

const filteredRanges = computed(() => {
  if (!searchQuery.value) return ranges.value
  const q = searchQuery.value.toLowerCase()
  return ranges.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.code.toLowerCase().includes(q) ||
    r.ip_prefix.includes(q) ||
    r.region.toLowerCase().includes(q)
  )
})

const rangesByRegion = computed(() => {
  const groups: Record<string, typeof ranges.value> = {}
  for (const r of filteredRanges.value) {
    if (!groups[r.region]) groups[r.region] = []
    groups[r.region].push(r)
  }
  return groups
})

const totalLanes = computed(() => rubegs.value.reduce((s, r) => s + r.lane_count, 0))
const totalCameras = computed(() => ranges.value.reduce((s, r) => s + r.cameras_total, 0))
const camerasOnline = computed(() => ranges.value.reduce((s, r) => s + r.cameras_online, 0))
const allRangesActive = computed(() => ranges.value.every(r => r.status === 'ACTIVE'))

const cameras = computed(() => {
  const list: { id: string; ip: string; range_name: string; range_code: string; rubeg_num: number; lane: number; status: string; signal: number; resolution: string }[] = []
  for (const range of ranges.value) {
    const rangeRubegs = rubegs.value.filter(r => r.range_id === range.id)
    for (const rubeg of rangeRubegs) {
      for (let i = 1; i <= rubeg.lane_count; i++) {
        list.push({
          id: `${range.code}-R${rubeg.rubeg_number}-L${i}`,
          ip: `${range.ip_prefix}.${(rubeg.rubeg_number - 1) * 6 + 10 + i}`,
          range_name: range.name,
          range_code: range.code,
          rubeg_num: rubeg.rubeg_number,
          lane: i,
          status: Math.random() > 0.08 ? 'ONLINE' : 'OFFLINE',
          signal: Math.floor(Math.random() * 40 + 60),
          resolution: '1920x1080',
        })
      }
    }
  }
  return list
})

const camerasOnlineCount = computed(() => cameras.value.filter(c => c.status === 'ONLINE').length)

const systemLogs = computed(() => [
  { id: 1, time: '11:45:22', type: 'INFO', source: 'CAM-01', message: isUz.value ? 'Tir 1: Kamera-01 qayta ulandi' : 'Полигон 1: Камера-01 переподключена' },
  { id: 2, time: '11:42:10', type: 'WARNING', source: 'CAM-05', message: isUz.value ? 'Tir 1: Kamera-05 aloqasi yoqoldi (88.1.92.14)' : 'Полигон 1: Камера-05 потеряна связь (88.1.92.14)' },
  { id: 3, time: '11:38:55', type: 'INFO', source: 'RUBEG-2', message: isUz.value ? 'Rubeg 2 (200m): barcha kameralar onlayn' : 'Рубеж 2 (200м): все камеры онлайн' },
  { id: 4, time: '11:30:00', type: 'INFO', source: 'SYSTEM', message: isUz.value ? 'Tir 2: kun rejimi ishga tushdi' : 'Полигон 2: дневной режим запущен' },
  { id: 5, time: '11:15:33', type: 'WARNING', source: 'WEAPON', message: isUz.value ? 'AKSU-2024-001: texnik xizmatga yuborildi' : 'AKSU-2024-001: отправлен на обслуживание' },
  { id: 6, time: '10:58:12', type: 'ERROR', source: 'NETWORK', message: isUz.value ? 'Tir 3: tarmoq uzilishi aniqlandi' : 'Полигон 3: обнаружен обрыв сети' },
  { id: 7, time: '10:45:00', type: 'INFO', source: 'SYSTEM', message: isUz.value ? 'Tir 3: texnik servis tugatildi' : 'Полигон 3: обслуживание завершено' },
  { id: 8, time: '10:30:18', type: 'INFO', source: 'WEAPON', message: isUz.value ? 'AK12-2024-002: yangi qurol royxatga olindi' : 'AK12-2024-002: новое оружие зарегистрировано' },
])

const tabs = computed(() => [
  { id: 'polygons', icon: Crosshair, label_uz: 'Poligonlar', label_ru: 'Полигоны', count: ranges.value.length },
  { id: 'cameras', icon: Camera, label_uz: 'Kameralar', label_ru: 'Камеры', count: cameras.value.length },
  { id: 'weapons', icon: Shield, label_uz: 'Qurollar', label_ru: 'Оружие', count: weapons.value.length },
  { id: 'network', icon: Network, label_uz: 'Tarmoq', label_ru: 'Сеть', count: undefined },
  { id: 'logs', icon: Activity, label_uz: 'Jurnal', label_ru: 'Журнал', count: systemLogs.value.length },
])

const regions: { value: string; label_uz: string; label_ru: string }[] = [
  { value: 'tashkent_city', label_uz: 'Toshkent sh.', label_ru: 'г. Ташкент' },
  { value: 'tashkent_region', label_uz: 'Toshkent vil.', label_ru: 'Ташкентская обл.' },
  { value: 'samarkand', label_uz: 'Samarqand', label_ru: 'Самарканд' },
  { value: 'fergana', label_uz: "Fargʻona", label_ru: 'Фергана' },
  { value: 'bukhara', label_uz: 'Buxoro', label_ru: 'Бухара' },
  { value: 'andijan', label_uz: 'Andijon', label_ru: 'Андижан' },
]

const weaponTypes = [
  { value: 'PISTOL', label_uz: 'Pistolet', label_ru: 'Пистолет' },
  { value: 'RIFLE', label_uz: 'Avtomat', label_ru: 'Автомат' },
  { value: 'SNIPER', label_uz: 'Snayper', label_ru: 'Снайперская' },
  { value: 'SMG', label_uz: 'SMG', label_ru: 'SMG' },
  { value: 'MACHINE_GUN', label_uz: 'Pulemyot', label_ru: 'Пулемёт' },
]

function regionLabel(value: string) {
  const r = regions.find(r => r.value === value)
  return r ? (isUz.value ? r.label_uz : r.label_ru) : value
}

const showRangeModal = ref(false)
const showRubegModal = ref(false)
const showWeaponModal = ref(false)
const editingRange = ref<string | null>(null)
const editingRubeg = ref<string | null>(null)
const editingWeapon = ref<string | null>(null)
const rubegForRange = ref<string | null>(null)
const deleteConfirm = ref<string | null>(null)
const deleteType = ref<'range' | 'rubeg' | 'weapon'>('range')

const rangeForm = ref({
  name: '', code: '', region: 'tashkent_city', ip_prefix: '', range_type: 'OPEN' as 'OPEN' | 'CLOSED', lanes_per_rubeg: 6,
})
const rubegForm = ref<{ range_id: string; name: string; weapon_type: WeaponCategory; distance_m: number; lane_count: number }>({ range_id: '', name: '', weapon_type: 'RIFLE', distance_m: 100, lane_count: 6 })
const weaponForm = ref<{ name: string; category: WeaponCategory; serial_number: string; caliber: string; manufacturer: string }>({ name: '', category: 'RIFLE', serial_number: '', caliber: '', manufacturer: '' })

function openCreateRange() {
  editingRange.value = null
  rangeForm.value = { name: '', code: '', region: 'tashkent_city', ip_prefix: '', range_type: 'OPEN', lanes_per_rubeg: 6 }
  showRangeModal.value = true
}
function openEditRange(r: any) {
  editingRange.value = r.id
  rangeForm.value = { name: r.name, code: r.code, region: r.region, ip_prefix: r.ip_prefix, range_type: r.range_type, lanes_per_rubeg: r.lanes_per_rubeg }
  showRangeModal.value = true
}
function saveRange() {
  if (editingRange.value) {
    masterStore.updateRange(editingRange.value, { name: rangeForm.value.name, code: rangeForm.value.code, region: rangeForm.value.region, ip_prefix: rangeForm.value.ip_prefix, range_type: rangeForm.value.range_type })
  } else {
    masterStore.createRange(rangeForm.value)
  }
  showRangeModal.value = false
}

function openCreateRubeg(rangeId: string) {
  editingRubeg.value = null
  rubegForRange.value = rangeId
  rubegForm.value = { range_id: rangeId, name: '', weapon_type: 'RIFLE', distance_m: 100, lane_count: 6 }
  showRubegModal.value = true
}
function openEditRubeg(r: any) {
  editingRubeg.value = r.id
  rubegForRange.value = r.range_id
  rubegForm.value = { range_id: r.range_id, name: r.name, weapon_type: r.weapon_type, distance_m: r.distance_m, lane_count: r.lane_count }
  showRubegModal.value = true
}
function saveRubeg() {
  if (editingRubeg.value) {
    masterStore.updateRubeg(editingRubeg.value, { name: rubegForm.value.name, weapon_type: rubegForm.value.weapon_type, distance_m: rubegForm.value.distance_m, lane_count: rubegForm.value.lane_count })
  } else {
    masterStore.createRubeg(rubegForm.value)
  }
  showRubegModal.value = false
}

function openCreateWeapon() {
  editingWeapon.value = null
  weaponForm.value = { name: '', category: 'RIFLE', serial_number: '', caliber: '', manufacturer: '' }
  showWeaponModal.value = true
}
function openEditWeapon(w: any) {
  editingWeapon.value = w.id
  weaponForm.value = { name: w.name, category: w.category, serial_number: w.serial_number, caliber: w.caliber, manufacturer: w.manufacturer }
  showWeaponModal.value = true
}
function saveWeapon() {
  if (editingWeapon.value) { masterStore.updateWeapon(editingWeapon.value, weaponForm.value) } else { masterStore.createWeapon(weaponForm.value) }
  showWeaponModal.value = false
}

function confirmDelete(type: 'range' | 'rubeg' | 'weapon', id: string) {
  deleteType.value = type
  deleteConfirm.value = id
}
function doDelete() {
  if (!deleteConfirm.value) return
  if (deleteType.value === 'range') masterStore.deleteRange(deleteConfirm.value)
  else if (deleteType.value === 'rubeg') masterStore.deleteRubeg(deleteConfirm.value)
  else if (deleteType.value === 'weapon') masterStore.deleteWeapon(deleteConfirm.value)
  deleteConfirm.value = null
}

function rubegsByRange(rangeId: string) { return rubegs.value.filter(r => r.range_id === rangeId) }
function toggleRange(id: string) { expandedRange.value = expandedRange.value === id ? null : id }
function toggleRubeg(id: string) { expandedRubeg.value = expandedRubeg.value === id ? null : id }
function refreshAll() { refreshing.value = true; setTimeout(() => { refreshing.value = false }, 1500) }

function weaponTypeLabel(type: string) {
  const labels: Record<string, { uz: string; ru: string }> = {
    PISTOL: { uz: 'Pistolet', ru: 'Пистолет' }, RIFLE: { uz: 'Avtomat', ru: 'Автомат' },
    SNIPER: { uz: 'Snayper', ru: 'Снайперская' }, SMG: { uz: 'SMG', ru: 'SMG' }, MACHINE_GUN: { uz: 'Pulemyot', ru: 'Пулемёт' },
  }
  return labels[type] ? (isUz.value ? labels[type].uz : labels[type].ru) : type
}
function weaponTypeColor(type: string) {
  const colors: Record<string, string> = {
    PISTOL: 'bg-purple-50 text-purple-600 border-purple-100', RIFLE: 'bg-blue-50 text-blue-600 border-blue-100',
    SNIPER: 'bg-red-50 text-red-600 border-red-100', SMG: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    MACHINE_GUN: 'bg-orange-50 text-orange-600 border-orange-100',
  }
  return colors[type] || 'bg-gray-50 text-gray-600 border-gray-100'
}
function weaponStatusLabel(status: string) {
  const labels: Record<string, { uz: string; ru: string }> = {
    AVAILABLE: { uz: 'Mavjud', ru: 'Доступно' }, IN_USE: { uz: 'Ishlatilmoqda', ru: 'В работе' },
    MAINTENANCE: { uz: "Ta'mirlash", ru: 'Ремонт' }, DECOMMISSIONED: { uz: 'Olib tashlangan', ru: 'Списано' },
  }
  return labels[status] ? (isUz.value ? labels[status].uz : labels[status].ru) : status
}
function weaponStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-50 text-green-600 border-green-100', IN_USE: 'bg-blue-50 text-blue-600 border-blue-100',
    MAINTENANCE: 'bg-yellow-50 text-yellow-600 border-yellow-100', DECOMMISSIONED: 'bg-red-50 text-red-600 border-red-100',
  }
  return colors[status] || 'bg-gray-50 text-gray-600 border-gray-100'
}
function conditionLabel(c: string) {
  const labels: Record<string, { uz: string; ru: string }> = {
    EXCELLENT: { uz: 'Aloqi', ru: 'Отличное' }, GOOD: { uz: 'Yaxshi', ru: 'Хорошее' },
    FAIR: { uz: "Oʻrtacha", ru: 'Удовлетвор.' }, POOR: { uz: 'Yomon', ru: 'Плохое' },
  }
  return labels[c] ? (isUz.value ? labels[c].uz : labels[c].ru) : c
}
function conditionColor(c: string) {
  const colors: Record<string, string> = { EXCELLENT: 'text-green-600', GOOD: 'text-blue-600', FAIR: 'text-yellow-600', POOR: 'text-red-600' }
  return colors[c] || 'text-gray-500'
}
function logTypeColor(type: string) {
  if (type === 'ERROR') return 'bg-red-50 text-red-600 border-red-100'
  if (type === 'WARNING') return 'bg-yellow-50 text-yellow-600 border-yellow-100'
  return 'bg-blue-50 text-blue-600 border-blue-100'
}
function rangeStatusColor(status: string) {
  if (status === 'ACTIVE') return 'bg-green-50 text-green-600 border-green-100'
  if (status === 'MAINTENANCE') return 'bg-yellow-50 text-yellow-600 border-yellow-100'
  return 'bg-gray-50 text-gray-500 border-gray-100'
}
function rangeStatusLabel(status: string) {
  if (status === 'ACTIVE') return isUz.value ? 'Faol' : 'Активен'
  if (status === 'MAINTENANCE') return isUz.value ? "Ta'mir" : 'Обслуж.'
  return isUz.value ? 'Faolsiz' : 'Неактив.'
}

function cameraIpFor(range: any, rubeg: any, lane: number) {
  return `${range.ip_prefix}.${(rubeg.rubeg_number - 1) * range.lanes_per_rubeg + 10 + lane}`
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
  const updateTime = () => { currentTime.value = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
  updateTime()
  timer = setInterval(updateTime, 1000)
  if (ranges.value.length > 0) expandedRange.value = ranges.value[0].id
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          {{ isUz ? 'Texnik mutaxassis paneli' : 'Панель технического специалиста' }}
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ isUz ? 'Poligon, rubeg, kamera va qurollarni boshqarish' : 'Управление полигонами, рубежами, камерами и оружием' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs font-medium text-green-700">{{ isUz ? 'Tizim faol' : 'Система активна' }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
          <Clock class="w-3.5 h-3.5 text-gray-400" />
          <span class="text-xs font-mono text-gray-600">{{ currentTime }}</span>
        </div>
        <button @click="refreshAll" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': refreshing }" />
          {{ isUz ? 'Yangilash' : 'Обновить' }}
        </button>
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="rounded-xl p-4 bg-white border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <Crosshair class="w-4 h-4 text-gray-400" />
          <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :class="allRangesActive ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'">
            {{ allRangesActive ? (isUz ? 'HAMMASI OK' : 'ВСЕ ОК') : (isUz ? 'DIQQAT' : 'ВНИМ') }}
          </span>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ ranges.length }}</p>
        <p class="text-[11px] text-gray-400">{{ isUz ? 'Poligonlar' : 'Полигонов' }}</p>
      </div>
      <div class="rounded-xl p-4 bg-white border border-gray-100">
        <Route class="w-4 h-4 text-gray-400 mb-2" />
        <p class="text-2xl font-black text-gray-900">{{ rubegs.length }}</p>
        <p class="text-[11px] text-gray-400">{{ isUz ? 'Rubeglar' : 'Рубежей' }}</p>
      </div>
      <div class="rounded-xl p-4 bg-white border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <Zap class="w-4 h-4 text-gray-400" />
          <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :class="camerasOnline === totalCameras ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'">
            {{ camerasOnline === totalCameras ? '100%' : Math.round(camerasOnline / totalCameras * 100) + '%' }}
          </span>
        </div>
        <p class="text-2xl font-black" :class="camerasOnline === totalCameras ? 'text-green-600' : 'text-yellow-600'">{{ camerasOnline }}/{{ totalCameras }}</p>
        <p class="text-[11px] text-gray-400">{{ isUz ? 'Kameralar' : 'Камеры' }}</p>
      </div>
      <div class="rounded-xl p-4 bg-white border border-gray-100">
        <Shield class="w-4 h-4 text-gray-400 mb-2" />
        <p class="text-2xl font-black text-gray-900">{{ weapons.length }}</p>
        <p class="text-[11px] text-gray-400">{{ isUz ? 'Qurollar' : 'Оружие' }}</p>
      </div>
      <div class="rounded-xl p-4 bg-white border border-gray-100">
        <MapPin class="w-4 h-4 text-gray-400 mb-2" />
        <p class="text-2xl font-black text-gray-900">{{ totalLanes }}</p>
        <p class="text-[11px] text-gray-400">{{ isUz ? "Yoʻliqlar" : 'Дорожек' }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-gray-100 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap"
        :class="activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'">
        <component :is="tab.icon" class="w-4 h-4" />
        {{ isUz ? tab.label_uz : tab.label_ru }}
        <span v-if="tab.count !== undefined" class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{{ tab.count }}</span>
      </button>
    </div>

    <!-- ====== TAB: POLYGONS ====== -->
    <div v-if="activeTab === 'polygons'" class="space-y-4">
      <!-- Toolbar: search + BIG add button -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="relative flex-1 max-w-xs">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input v-model="searchQuery" type="text" :placeholder="isUz ? 'Poligon qidirish...' : 'Поиск полигона...'"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
        </div>
        <button @click="openCreateRange"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20">
          <Plus class="w-5 h-5" />
          {{ isUz ? 'Poligon qoshish' : 'Добавить полигон' }}
        </button>
      </div>

      <!-- Grouped by region -->
      <div v-for="(regionRanges, regionKey) in rangesByRegion" :key="regionKey" class="space-y-2">
        <!-- Region header -->
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <MapPin class="w-4 h-4 text-green-500" />
          <span class="text-sm font-bold text-gray-700">{{ regionLabel(regionKey) }}</span>
          <span class="text-xs text-gray-400">{{ regionRanges.length }} {{ isUz ? 'poligon' : 'полигонов' }}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
          <div class="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{{ regionRanges.reduce((s, r) => s + r.total_rubegs, 0) }} {{ isUz ? 'rubeg' : 'рубеж.' }}</span>
            <span class="text-gray-200">|</span>
            <span>{{ regionRanges.reduce((s, r) => s + r.cameras_online, 0) }}/{{ regionRanges.reduce((s, r) => s + r.cameras_total, 0) }} {{ isUz ? 'kam' : 'кам.' }}</span>
          </div>
        </div>

        <!-- Polygon cards -->
        <div v-for="range in regionRanges" :key="range.id" class="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <!-- Card header -->
          <div class="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition" @click="toggleRange(range.id)">
            <div class="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
              :class="range.range_type === 'OPEN' ? 'bg-green-50' : 'bg-blue-50'">
              <Crosshair class="w-6 h-6" :class="range.range_type === 'OPEN' ? 'text-green-500' : 'text-blue-500'" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-gray-900">{{ range.name }}</h3>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="rangeStatusColor(range.status)">
                  {{ rangeStatusLabel(range.status) }}
                </span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                  :class="range.range_type === 'OPEN' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'">
                  {{ range.range_type === 'OPEN' ? (isUz ? 'Ochiq' : 'Открытый') : (isUz ? 'Yopiq' : 'Закрытый') }}
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                <span class="font-mono font-medium text-gray-500">{{ range.code }}</span>
                <span class="text-gray-200">|</span>
                <span class="font-mono">{{ range.ip_prefix }}.x</span>
                <span class="text-gray-200">|</span>
                <span>{{ range.total_rubegs }} {{ isUz ? 'rubeg' : 'рубеж.' }}</span>
                <span class="text-gray-200">|</span>
                <span>{{ range.total_lanes }} {{ isUz ? "yoʻl" : 'дор.' }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <!-- Camera health -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" :class="range.cameras_online === range.cameras_total ? 'bg-green-50' : 'bg-yellow-50'">
                <Camera class="w-3.5 h-3.5" :class="range.cameras_online === range.cameras_total ? 'text-green-500' : 'text-yellow-500'" />
                <span class="text-xs font-bold" :class="range.cameras_online === range.cameras_total ? 'text-green-600' : 'text-yellow-600'">{{ range.cameras_online }}/{{ range.cameras_total }}</span>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-1" @click.stop>
                <button @click="openEditRange(range)" class="p-2 rounded-lg hover:bg-gray-100 transition" :title="isUz ? 'Tahrirlash' : 'Редактировать'">
                  <Edit2 class="w-4 h-4 text-gray-400" />
                </button>
                <button @click="confirmDelete('range', range.id)" class="p-2 rounded-lg hover:bg-red-50 transition" :title="isUz ? 'Oʼchirish' : 'Удалить'">
                  <Trash2 class="w-4 h-4 text-red-400" />
                </button>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-300 transition-transform" :class="{ 'rotate-90': expandedRange === range.id }" />
            </div>
          </div>

          <!-- Expanded: Rubegs -->
          <div v-if="expandedRange === range.id" class="border-t border-gray-50 bg-gray-50/40">
            <div class="px-4 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Route class="w-4 h-4 text-gray-400" />
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ isUz ? 'Rubeglar (Otish chiziqlari)' : 'Рубежи (Огневые линии)' }}</span>
              </div>
              <button @click="openCreateRubeg(range.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-green-600 hover:bg-green-50 hover:border-green-200 transition">
                <Plus class="w-3.5 h-3.5" />
                {{ isUz ? 'Rubeg qoshish' : 'Добавить рубеж' }}
              </button>
            </div>
            <div class="px-4 pb-4 space-y-2">
              <div v-for="rubeg in rubegsByRange(range.id)" :key="rubeg.id"
                class="rounded-lg bg-white border border-gray-100 overflow-hidden group">
                <!-- Rubeg header -->
                <div class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50/50 transition" @click="toggleRubeg(rubeg.id)">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 shrink-0">
                    <span class="text-sm font-bold text-gray-400">R{{ rubeg.rubeg_number }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-gray-800">{{ rubeg.name }}</span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="weaponTypeColor(rubeg.weapon_type)">
                        {{ weaponTypeLabel(rubeg.weapon_type) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                      <span>{{ rubeg.distance_m }}{{ isUz ? 'm' : 'м' }}</span>
                      <span class="text-gray-200">|</span>
                      <span>{{ rubeg.lane_count }} {{ isUz ? "yoʻl" : 'дорожек' }}</span>
                      <span class="text-gray-200">|</span>
                      <span class="font-mono">{{ range.ip_prefix }}.{{ (rubeg.rubeg_number - 1) * range.lanes_per_rubeg + 10 }}-{{ (rubeg.rubeg_number - 1) * range.lanes_per_rubeg + 10 + rubeg.lane_count - 1 }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" @click.stop>
                    <button @click="openEditRubeg(rubeg)" class="p-1.5 rounded-lg hover:bg-gray-100 transition">
                      <Edit2 class="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button @click="confirmDelete('rubeg', rubeg.id)" class="p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 class="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  <ChevronRight class="w-4 h-4 text-gray-300 transition-transform" :class="{ 'rotate-90': expandedRubeg === rubeg.id }" />
                </div>
                <!-- Rubeg detail: cameras and lanes -->
                <div v-if="expandedRubeg === rubeg.id" class="border-t border-gray-50 px-3 py-3 bg-gray-50/30">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div v-for="lane in rubeg.lane_count" :key="lane"
                      class="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                      <div class="flex items-center justify-center w-7 h-7 rounded shrink-0"
                        :class="Math.random() > 0.08 ? 'bg-green-50' : 'bg-red-50'">
                        <Camera class="w-3.5 h-3.5" :class="Math.random() > 0.08 ? 'text-green-500' : 'text-red-400'" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-gray-700">{{ isUz ? "Yoʻl" : 'Дорожка' }} {{ lane }}</p>
                        <p class="text-[10px] text-gray-400 font-mono">{{ cameraIpFor(range, rubeg, lane) }}</p>
                      </div>
                      <div class="flex items-center gap-2 text-[10px]">
                        <Signal class="w-3 h-3" :class="Math.random() > 0.08 ? 'text-green-400' : 'text-red-400'" />
                        <span class="font-mono text-gray-400">{{ Math.floor(Math.random() * 40 + 60) }}ms</span>
                        <span class="px-1.5 py-0.5 rounded font-medium"
                          :class="Math.random() > 0.08 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                          {{ Math.random() > 0.08 ? 'ONLINE' : 'OFFLINE' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="rubegsByRange(range.id).length === 0" class="text-center py-8 text-gray-300 text-sm">
                {{ isUz ? 'Rubeglar yoq. Birinchisini qoshing.' : 'Нет рубежей. Добавьте первый.' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filteredRanges.length === 0" class="text-center py-12 text-gray-300 text-sm">
        {{ isUz ? 'Poligonlar topilmadi' : 'Полигоны не найдены' }}
      </div>
    </div>

    <!-- ====== TAB: CAMERAS ====== -->
    <div v-if="activeTab === 'cameras'" class="space-y-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          <span class="text-xs font-medium text-green-700">{{ camerasOnlineCount }} {{ isUz ? 'onlayn' : 'онлайн' }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          <span class="text-xs font-medium text-red-600">{{ cameras.length - camerasOnlineCount }} {{ isUz ? 'offlayn' : 'офлайн' }}</span>
        </div>
        <div class="flex-1 h-px bg-gray-100"></div>
        <span class="text-xs text-gray-400">{{ cameras.length }} {{ isUz ? 'jami' : 'всего' }}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="cam in cameras" :key="cam.id" class="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
          <div class="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            :class="cam.status === 'ONLINE' ? 'bg-green-50' : 'bg-red-50'">
            <Monitor class="w-5 h-5" :class="cam.status === 'ONLINE' ? 'text-green-500' : 'text-red-400'" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-bold text-gray-800 truncate">{{ cam.range_name }}</p>
            </div>
            <p class="text-[11px] text-gray-400 mt-0.5">
              {{ isUz ? 'Rubeg' : 'Рубеж' }} {{ cam.rubeg_num }} - {{ isUz ? "Yoʻl" : 'Дорожка' }} {{ cam.lane }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-[10px] font-mono text-gray-500">{{ cam.ip }}</p>
              <span class="text-[10px] text-gray-300">|</span>
              <p class="text-[10px] text-gray-400">{{ cam.resolution }}</p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="cam.status === 'ONLINE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              {{ cam.status === 'ONLINE' ? (isUz ? 'Onlayn' : 'Онлайн') : (isUz ? 'Offlayn' : 'Офлайн') }}
            </span>
            <div class="flex items-center gap-1">
              <Signal class="w-3 h-3" :class="cam.status === 'ONLINE' ? 'text-green-400' : 'text-gray-300'" />
              <span class="text-[10px] font-mono text-gray-400">{{ cam.signal }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== TAB: WEAPONS ====== -->
    <div v-if="activeTab === 'weapons'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Qurol arsenali' : 'Арсенал оружия' }}</h2>
        <button @click="openCreateWeapon"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20">
          <Plus class="w-4 h-4" />
          {{ isUz ? 'Qurol qoshish' : 'Добавить оружие' }}
        </button>
      </div>
      <div class="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-50 text-[11px] text-gray-400 uppercase">
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Qurol' : 'Оружие' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Turi' : 'Тип' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Seriya' : 'Серийный' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Kalibr' : 'Калибр' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Ishlab chiq.' : 'Производ.' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Holat' : 'Сост.' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Status' : 'Статус' }}</th>
              <th class="px-4 py-3 text-left font-medium">{{ isUz ? 'Otilar' : 'Выстрелы' }}</th>
              <th class="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="w in weapons" :key="w.id" class="hover:bg-gray-50/50 transition group">
              <td class="px-4 py-3 font-medium text-gray-800">{{ w.name }}</td>
              <td class="px-4 py-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="weaponTypeColor(w.category)">{{ weaponTypeLabel(w.category) }}</span></td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ w.serial_number }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ w.caliber }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ w.manufacturer }}</td>
              <td class="px-4 py-3"><span class="text-xs font-medium" :class="conditionColor(w.condition)">{{ conditionLabel(w.condition) }}</span></td>
              <td class="px-4 py-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="weaponStatusColor(w.status)">{{ weaponStatusLabel(w.status) }}</span></td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ w.total_shots_fired.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button @click="openEditWeapon(w)" class="p-1.5 rounded-lg hover:bg-gray-100 transition"><Edit2 class="w-3.5 h-3.5 text-gray-400" /></button>
                  <button @click="confirmDelete('weapon', w.id)" class="p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 class="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ====== TAB: NETWORK ====== -->
    <div v-if="activeTab === 'network'" class="space-y-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Tarmoq topologiyasi' : 'Сетевая топология' }}</h2>
      <div class="space-y-3">
        <div v-for="range in ranges" :key="range.id" class="rounded-xl bg-white border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Server class="w-5 h-5 text-gray-400" />
              <span class="text-sm font-bold text-gray-900">{{ range.name }}</span>
              <span class="text-[10px] font-mono text-gray-400">{{ range.code }}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium border" :class="rangeStatusColor(range.status)">
              {{ rangeStatusLabel(range.status) }}
            </span>
          </div>
          <!-- Gateway -->
          <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
            <Cpu class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-xs font-medium text-gray-600">{{ isUz ? 'Shlyuz (Gateway)' : 'Шлюз (Gateway)' }}</span>
            <span class="text-[11px] font-mono text-gray-400 ml-auto">{{ range.ip_prefix }}.1</span>
          </div>
          <div class="ml-4 border-l-2 border-gray-100 pl-4 space-y-1.5">
            <div v-for="rubeg in rubegsByRange(range.id)" :key="rubeg.id" class="flex items-center gap-2 text-xs">
              <span class="w-2 h-2 rounded-full" :class="range.cameras_online === range.cameras_total ? 'bg-green-500' : 'bg-yellow-500'"></span>
              <Radio class="w-3.5 h-3.5 text-gray-300" />
              <span class="text-gray-700 font-medium">{{ rubeg.name }}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border" :class="weaponTypeColor(rubeg.weapon_type)">{{ weaponTypeLabel(rubeg.weapon_type) }}</span>
              <span class="text-gray-400 font-mono ml-auto">{{ range.ip_prefix }}.{{ (rubeg.rubeg_number - 1) * range.lanes_per_rubeg + 10 }}-{{ (rubeg.rubeg_number - 1) * range.lanes_per_rubeg + 10 + rubeg.lane_count - 1 }}</span>
              <span class="text-gray-300">{{ rubeg.lane_count }} {{ isUz ? "yoʻl" : 'дор.' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== TAB: LOGS ====== -->
    <div v-if="activeTab === 'logs'" class="space-y-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Tizim jurnali' : 'Системный журнал' }}</h2>
      <div class="rounded-xl bg-white border border-gray-100 divide-y divide-gray-50">
        <div v-for="log in systemLogs" :key="log.id" class="flex items-center gap-3 px-4 py-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium border" :class="logTypeColor(log.type)">{{ log.type }}</span>
          <span class="text-xs font-mono text-gray-400">{{ log.time }}</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">{{ log.source }}</span>
          <span class="text-sm text-gray-700 flex-1">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Range Modal -->
    <div v-if="showRangeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showRangeModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ editingRange ? (isUz ? 'Poligoni tahrirlash' : 'Редактировать полигон') : (isUz ? 'Yangi poligon' : 'Новый полигон') }}</h3>
          <button @click="showRangeModal = false" class="p-1 rounded hover:bg-gray-100"><X class="w-4 h-4 text-gray-400" /></button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Nomi' : 'Название' }}</label>
            <input v-model="rangeForm.name" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" :placeholder="isUz ? 'Poligon 4' : 'Полигон 4'" />
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Kod' : 'Код' }}</label>
            <input v-model="rangeForm.code" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="RNG-004" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Hudud' : 'Регион' }}</label>
              <select v-model="rangeForm.region" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option v-for="r in regions" :key="r.value" :value="r.value">{{ isUz ? r.label_uz : r.label_ru }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">IP prefix</label>
              <input v-model="rangeForm.ip_prefix" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="88.1.95" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Turi' : 'Тип' }}</label>
              <select v-model="rangeForm.range_type" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option value="OPEN">{{ isUz ? 'Ochiq' : 'Открытый' }}</option>
                <option value="CLOSED">{{ isUz ? 'Yopiq' : 'Закрытый' }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? "Yoʻl / rubeg" : 'Дорожек / рубеж' }}</label>
              <input v-model.number="rangeForm.lanes_per_rubeg" type="number" min="1" max="20" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showRangeModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="saveRange" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">{{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>

    <!-- Rubeg Modal -->
    <div v-if="showRubegModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showRubegModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ editingRubeg ? (isUz ? 'Rubegni tahrirlash' : 'Редактировать рубеж') : (isUz ? 'Yangi rubeg' : 'Новый рубеж') }}</h3>
          <button @click="showRubegModal = false" class="p-1 rounded hover:bg-gray-100"><X class="w-4 h-4 text-gray-400" /></button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Nomi' : 'Название' }}</label>
            <input v-model="rubegForm.name" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" :placeholder="isUz ? 'Rubeg 1 (100m)' : 'Рубеж 1 (100м)'" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Qurol turi' : 'Тип оружия' }}</label>
              <select v-model="rubegForm.weapon_type" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option v-for="wt in weaponTypes" :key="wt.value" :value="wt.value">{{ isUz ? wt.label_uz : wt.label_ru }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Masofa (m)' : 'Дистанция (м)' }}</label>
              <input v-model.number="rubegForm.distance_m" type="number" min="10" max="1000" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? "Yoʻliq soni" : 'Кол-во дорожек' }}</label>
            <input v-model.number="rubegForm.lane_count" type="number" min="1" max="20" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showRubegModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="saveRubeg" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">{{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>

    <!-- Weapon Modal -->
    <div v-if="showWeaponModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showWeaponModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ editingWeapon ? (isUz ? 'Qurolni tahrirlash' : 'Редактировать оружие') : (isUz ? 'Yangi qurol' : 'Новое оружие') }}</h3>
          <button @click="showWeaponModal = false" class="p-1 rounded hover:bg-gray-100"><X class="w-4 h-4 text-gray-400" /></button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Nomi' : 'Название' }}</label>
            <input v-model="weaponForm.name" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="AK-12" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Turi' : 'Тип' }}</label>
              <select v-model="weaponForm.category" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option v-for="wt in weaponTypes" :key="wt.value" :value="wt.value">{{ isUz ? wt.label_uz : wt.label_ru }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Seriya' : 'Серийный №' }}</label>
              <input v-model="weaponForm.serial_number" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="AK12-2024-003" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Kalibr' : 'Калибр' }}</label>
              <input v-model="weaponForm.caliber" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="5.45x39mm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Ishlab chiq.' : 'Производитель' }}</label>
              <input v-model="weaponForm.manufacturer" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="Калашников" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showWeaponModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="saveWeapon" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">{{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="deleteConfirm = null">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
            <AlertTriangle class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">{{ isUz ? "O'chirishni tasdiqlang" : 'Подтвердите удаление' }}</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ isUz ? 'Bu amalni qaytarib bolmaydi' : 'Это действие необратимо' }}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2">
          <button @click="deleteConfirm = null" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="doDelete" class="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">{{ isUz ? "O'chirish" : 'Удалить' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

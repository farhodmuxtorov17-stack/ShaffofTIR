<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Crosshair, Route, Camera, Shield, RefreshCw, Clock, Server, Activity, Wifi, Plus, Edit2, Trash2, X } from 'lucide-vue-next'

const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const loading = ref(true)
const refreshing = ref(false)
const activeTab = ref('ranges')
const currentTime = ref('')

const ranges = computed(() => masterStore.ranges)
const rubegs = computed(() => masterStore.rubegs)
const weapons = computed(() => masterStore.weapons)

const allRangesActive = computed(() => ranges.value.every(r => r.status === 'ACTIVE'))
const totalLanes = computed(() => rubegs.value.reduce((s, r) => s + r.lane_count, 0))

const cameras = ref([
  { id: 'cam1', ip: '88.1.92.10', lane: 1, status: 'ONLINE' },
  { id: 'cam2', ip: '88.1.92.11', lane: 2, status: 'ONLINE' },
  { id: 'cam3', ip: '88.1.92.12', lane: 3, status: 'ONLINE' },
  { id: 'cam4', ip: '88.1.92.13', lane: 4, status: 'ONLINE' },
  { id: 'cam5', ip: '88.1.92.14', lane: 5, status: 'OFFLINE' },
  { id: 'cam6', ip: '88.1.92.15', lane: 6, status: 'ONLINE' },
  { id: 'cam7', ip: '88.1.93.10', lane: 1, status: 'ONLINE' },
  { id: 'cam8', ip: '88.1.93.11', lane: 2, status: 'ONLINE' },
  { id: 'cam9', ip: '88.1.93.12', lane: 3, status: 'ONLINE' },
  { id: 'cam10', ip: '88.1.93.13', lane: 4, status: 'ONLINE' },
  { id: 'cam11', ip: '88.1.94.10', lane: 1, status: 'ONLINE' },
  { id: 'cam12', ip: '88.1.94.11', lane: 2, status: 'ONLINE' },
])

const camerasOnline = computed(() => cameras.value.filter(c => c.status === 'ONLINE').length)

const systemLogs = computed(() => [
  { id: 1, time: '11:45:22', type: 'INFO', message: isUz.value ? 'Tir 1: Kamera-01 qayta ulandi' : 'Тир 1: Камера-01 переподключена' },
  { id: 2, time: '11:42:10', type: 'WARNING', message: isUz.value ? 'Tir 1: Kamera-05 yurak urishi yoqoldi (88.1.92.14)' : 'Тир 1: Камера-05 потеряна связь (88.1.92.14)' },
  { id: 3, time: '11:38:55', type: 'INFO', message: isUz.value ? 'Rubeg 2 (200m): barcha kameralar onlayn' : 'Рубеж 2 (200м): все камеры онлайн' },
  { id: 4, time: '11:30:00', type: 'INFO', message: isUz.value ? 'Tir 2: kun rejimi ishga tushdi' : 'Тир 2: дневной режим запущен' },
  { id: 5, time: '11:15:33', type: 'INFO', message: isUz.value ? 'Tir 3: texnik servis tugatildi' : 'Тир 3: техническое обслуживание завершено' },
])

const tabs = computed(() => [
  { id: 'ranges', icon: Crosshair, label_uz: 'Tirlar', label_ru: 'Тиры', count: ranges.value.length },
  { id: 'cameras', icon: Camera, label_uz: 'Kameralar', label_ru: 'Камеры', count: cameras.value.length },
  { id: 'weapons', icon: Shield, label_uz: 'Qurollar', label_ru: 'Оружие', count: weapons.value.length },
  { id: 'network', icon: Wifi, label_uz: 'Tarmoq', label_ru: 'Сеть', count: undefined },
  { id: 'logs', icon: Activity, label_uz: 'Jurnal', label_ru: 'Журнал', count: systemLogs.value.length },
])

// ── Modals ──
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
  name: '',
  code: '',
  region: 'tashkent_city',
  ip_prefix: '',
  range_type: 'OPEN' as 'OPEN' | 'CLOSED',
  lanes_per_rubeg: 6,
})

const rubegForm = ref({
  range_id: '',
  name: '',
  weapon_type: 'RIFLE',
  distance_m: 100,
  lane_count: 6,
})

const weaponForm = ref({
  name: '',
  category: 'RIFLE',
  serial_number: '',
  caliber: '',
  manufacturer: '',
})

const regions = [
  { value: 'tashkent_city', label_uz: 'Toshkent sh.', label_ru: 'г. Ташкент' },
  { value: 'tashkent_region', label_uz: 'Toshkent vil.', label_ru: 'Ташкентская обл.' },
  { value: 'samarkand', label_uz: 'Samarqand', label_ru: 'Самарканд' },
  { value: 'fergana', label_uz: "Farg'ona", label_ru: 'Фергана' },
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
    masterStore.updateRange(editingRange.value, {
      name: rangeForm.value.name,
      code: rangeForm.value.code,
      region: rangeForm.value.region,
      ip_prefix: rangeForm.value.ip_prefix,
      range_type: rangeForm.value.range_type,
    })
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
    masterStore.updateRubeg(editingRubeg.value, {
      name: rubegForm.value.name,
      weapon_type: rubegForm.value.weapon_type,
      distance_m: rubegForm.value.distance_m,
      lane_count: rubegForm.value.lane_count,
    })
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
  if (editingWeapon.value) {
    masterStore.updateWeapon(editingWeapon.value, weaponForm.value)
  } else {
    masterStore.createWeapon(weaponForm.value)
  }
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

function rubegsByRange(rangeId: string) {
  return rubegs.value.filter(r => r.range_id === rangeId)
}

function refreshAll() {
  refreshing.value = true
  setTimeout(() => { refreshing.value = false }, 1500)
}

function weaponTypeLabel(type: string) {
  const labels: Record<string, { uz: string; ru: string }> = {
    PISTOL: { uz: 'Pistolet', ru: 'Пистолет' },
    RIFLE: { uz: 'Avtomat', ru: 'Автомат' },
    SNIPER: { uz: 'Snayper', ru: 'Снайперская' },
    SMG: { uz: 'SMG', ru: 'SMG' },
    MACHINE_GUN: { uz: 'Pulemyot', ru: 'Пулемёт' },
  }
  return labels[type] ? (isUz.value ? labels[type].uz : labels[type].ru) : type
}

function weaponTypeColor(type: string) {
  const colors: Record<string, string> = {
    PISTOL: 'bg-purple-100 text-purple-700',
    RIFLE: 'bg-blue-100 text-blue-700',
    SNIPER: 'bg-red-100 text-red-700',
    SMG: 'bg-yellow-100 text-yellow-700',
    MACHINE_GUN: 'bg-orange-100 text-orange-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

function weaponStatusLabel(status: string) {
  const labels: Record<string, { uz: string; ru: string }> = {
    AVAILABLE: { uz: 'Mavjud', ru: 'Доступно' },
    IN_USE: { uz: 'Ishlatilmoqda', ru: 'В работе' },
    MAINTENANCE: { uz: "Ta'mirlash", ru: 'Ремонт' },
    DECOMMISSIONED: { uz: 'Olib tashlangan', ru: 'Списано' },
  }
  return labels[status] ? (isUz.value ? labels[status].uz : labels[status].ru) : status
}

function weaponStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    IN_USE: 'bg-blue-100 text-blue-700',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700',
    DECOMMISSIONED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

function logTypeColor(type: string) {
  if (type === 'ERROR') return 'bg-red-100 text-red-700'
  if (type === 'WARNING') return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6 max-w-[1400px] mx-auto">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          {{ isUz ? 'Texnik mutaxassis paneli' : 'Панель технического специалиста' }}
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ isUz ? 'Tirlar, rubeglar, kameralar va qurollarni boshqarish' : 'Управление тирами, рубежами, камерами и оружием' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs font-medium text-green-700">{{ isUz ? 'Tizim faol' : 'Система активна' }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl p-4 bg-white border border-gray-100 hover:shadow-sm transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Crosshair class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Tirlar' : 'Тиры' }}</span>
          </div>
          <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :class="allRangesActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
            {{ allRangesActive ? (isUz ? 'Hammasi faol' : 'Все активны') : (isUz ? 'Diqqat' : 'Внимание') }}
          </span>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ ranges.length }}</p>
        <p class="text-[11px] text-gray-400 mt-1">{{ ranges.filter(r => r.status === 'ACTIVE').length }} {{ isUz ? 'faol /' : 'активных /' }} {{ ranges.length }}</p>
      </div>
      <div class="rounded-2xl p-4 bg-white border border-gray-100 hover:shadow-sm transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Route class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Rubeglar' : 'Рубежи' }}</span>
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ rubegs.length }}</p>
        <p class="text-[11px] text-gray-400 mt-1">{{ totalLanes }} {{ isUz ? "yo'liq" : 'дорожек' }}</p>
      </div>
      <div class="rounded-2xl p-4 bg-white border border-gray-100 hover:shadow-sm transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Camera class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Kameralar' : 'Камеры' }}</span>
          </div>
          <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :class="camerasOnline === cameras.length ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
            {{ camerasOnline === cameras.length ? (isUz ? 'OK' : 'ОК') : (isUz ? 'OGOH' : 'ВНИМ') }}
          </span>
        </div>
        <p class="text-2xl font-black" :class="camerasOnline === cameras.length ? 'text-green-600' : 'text-yellow-600'">{{ camerasOnline }}/{{ cameras.length }}</p>
        <p class="text-[11px] text-gray-400 mt-1">{{ cameras.length - camerasOnline }} {{ isUz ? 'offlayn' : 'офлайн' }}</p>
      </div>
      <div class="rounded-2xl p-4 bg-white border border-gray-100 hover:shadow-sm transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-500">{{ isUz ? 'Qurollar' : 'Оружие' }}</span>
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ weapons.length }}</p>
        <p class="text-[11px] text-gray-400 mt-1">{{ weapons.filter(w => w.status === 'AVAILABLE').length }} {{ isUz ? ' mavjud' : ' доступно' }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-gray-100">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition"
        :class="activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ isUz ? tab.label_uz : tab.label_ru }}
        <span v-if="tab.count" class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Tab: Ranges (Polygons) -->
    <div v-if="activeTab === 'ranges'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Tirlar (Poligonlar)' : 'Тиры (Полигоны)' }}</h2>
        <button @click="openCreateRange" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition">
          <Plus class="w-3.5 h-3.5" />
          {{ isUz ? 'Tir qoshish' : 'Добавить тир' }}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="range in ranges" :key="range.id" class="rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-sm transition">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ range.name }}</h3>
              <p class="text-[11px] text-gray-400 font-mono mt-0.5">{{ range.code }} &middot; {{ range.ip_prefix }}.x</p>
            </div>
            <div class="flex flex-col gap-1 items-end">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="range.range_type === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                {{ range.range_type === 'OPEN' ? (isUz ? 'Ochiq' : 'Открытый') : (isUz ? 'Yopiqlangan' : 'Закрытый') }}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="range.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ range.status === 'ACTIVE' ? (isUz ? 'Faol' : 'Активен') : (isUz ? 'Faolsiz' : 'Неактивен') }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-lg bg-gray-50 p-2 text-center">
              <p class="text-lg font-bold text-gray-900">{{ range.total_rubegs }}</p>
              <p class="text-[10px] text-gray-400">{{ isUz ? 'Rubeg' : 'Рубежей' }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 text-center">
              <p class="text-lg font-bold text-gray-900">{{ range.total_lanes }}</p>
              <p class="text-[10px] text-gray-400">{{ isUz ? "Yo'liq" : 'Дорожек' }}</p>
            </div>
            <div class="rounded-lg p-2 text-center" :class="range.cameras_online === range.cameras_total ? 'bg-green-50' : 'bg-yellow-50'">
              <p class="text-lg font-bold" :class="range.cameras_online === range.cameras_total ? 'text-green-600' : 'text-yellow-600'">{{ range.cameras_online }}/{{ range.cameras_total }}</p>
              <p class="text-[10px] text-gray-400">{{ isUz ? 'Kamera' : 'Камер' }}</p>
            </div>
          </div>
          <!-- Rubegs list inside range -->
          <div class="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-medium text-gray-400 uppercase">{{ isUz ? 'Rubeglar' : 'Рубежи' }}</span>
              <button @click="openCreateRubeg(range.id)" class="flex items-center gap-0.5 text-[10px] text-green-600 hover:text-green-700 font-medium">
                <Plus class="w-3 h-3" />
                {{ isUz ? 'Rubeg' : 'Рубеж' }}
              </button>
            </div>
            <div v-for="rubeg in rubegsByRange(range.id)" :key="rubeg.id" class="flex items-center justify-between text-xs group">
              <div class="flex items-center gap-2">
                <span class="text-gray-600">{{ rubeg.name }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="weaponTypeColor(rubeg.weapon_type)">{{ weaponTypeLabel(rubeg.weapon_type) }}</span>
                <span class="text-gray-400">{{ rubeg.lane_count }} {{ isUz ? "yo'l." : 'дор.' }}</span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button @click="openEditRubeg(rubeg)" class="p-1 rounded hover:bg-gray-100">
                  <Edit2 class="w-3 h-3 text-gray-400" />
                </button>
                <button @click="confirmDelete('rubeg', rubeg.id)" class="p-1 rounded hover:bg-red-50">
                  <Trash2 class="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
            <p v-if="rubegsByRange(range.id).length === 0" class="text-[11px] text-gray-300 italic">{{ isUz ? 'Rubeglar yoq' : 'Нет рубежей' }}</p>
          </div>
          <!-- Range actions -->
          <div class="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end gap-2">
            <button @click="openEditRange(range)" class="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition">
              <Edit2 class="w-3 h-3" />
              {{ isUz ? 'Tahrirlash' : 'Изменить' }}
            </button>
            <button @click="confirmDelete('range', range.id)" class="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 transition">
              <Trash2 class="w-3 h-3" />
              {{ isUz ? "O'chirish" : 'Удалить' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Cameras -->
    <div v-if="activeTab === 'cameras'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Kameralar holati' : 'Статус камер' }}</h2>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500"></span> {{ isUz ? 'Onlayn' : 'Онлайн' }}: {{ camerasOnline }}</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-400"></span> {{ isUz ? 'Offlayn' : 'Офлайн' }}: {{ cameras.length - camerasOnline }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div v-for="cam in cameras" :key="cam.id" class="rounded-xl bg-white border p-3 transition hover:shadow-sm" :class="cam.status === 'ONLINE' ? 'border-gray-100' : 'border-red-100'">
          <div class="flex items-center justify-between mb-2">
            <Camera class="w-4 h-4" :class="cam.status === 'ONLINE' ? 'text-green-500' : 'text-red-400'" />
            <span class="w-2 h-2 rounded-full" :class="cam.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-400'"></span>
          </div>
          <p class="text-sm font-bold text-gray-900">{{ isUz ? "Yo'liq" : 'Дорожка' }} {{ cam.lane }}</p>
          <p class="text-[10px] text-gray-400 font-mono">{{ cam.ip }}</p>
        </div>
      </div>
    </div>

    <!-- Tab: Weapons -->
    <div v-if="activeTab === 'weapons'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Qurollar' : 'Оружие' }}</h2>
        <button @click="openCreateWeapon" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition">
          <Plus class="w-3.5 h-3.5" />
          {{ isUz ? 'Qurol qoshish' : 'Добавить оружие' }}
        </button>
      </div>
      <div class="rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-4 py-3 text-[11px] font-medium text-gray-400 uppercase">{{ isUz ? 'Nomi' : 'Название' }}</th>
              <th class="text-left px-4 py-3 text-[11px] font-medium text-gray-400 uppercase">{{ isUz ? 'Turi' : 'Тип' }}</th>
              <th class="text-left px-4 py-3 text-[11px] font-medium text-gray-400 uppercase">{{ isUz ? 'Seriya' : 'Серия' }}</th>
              <th class="text-left px-4 py-3 text-[11px] font-medium text-gray-400 uppercase">{{ isUz ? 'Kalibr' : 'Калибр' }}</th>
              <th class="text-left px-4 py-3 text-[11px] font-medium text-gray-400 uppercase">{{ isUz ? 'Holati' : 'Статус' }}</th>
              <th class="text-right px-4 py-3 text-[11px] font-medium text-gray-400 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in weapons" :key="w.id" class="border-b border-gray-50 hover:bg-gray-50/50 group">
              <td class="px-4 py-3 font-medium text-gray-900">{{ w.name }}</td>
              <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="weaponTypeColor(w.category)">{{ weaponTypeLabel(w.category) }}</span></td>
              <td class="px-4 py-3 font-mono text-gray-600 text-xs">{{ w.serial_number }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ w.caliber }}</td>
              <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="weaponStatusColor(w.status)">{{ weaponStatusLabel(w.status) }}</span></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button @click="openEditWeapon(w)" class="p-1 rounded hover:bg-gray-100">
                    <Edit2 class="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button @click="confirmDelete('weapon', w.id)" class="p-1 rounded hover:bg-red-50">
                    <Trash2 class="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: System Log -->
    <div v-if="activeTab === 'logs'" class="space-y-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Tizim jurnali' : 'Системный журнал' }}</h2>
      <div class="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50">
        <div v-for="log in systemLogs" :key="log.id" class="flex items-center gap-3 px-4 py-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium" :class="logTypeColor(log.type)">{{ log.type }}</span>
          <span class="text-xs font-mono text-gray-400">{{ log.time }}</span>
          <span class="text-sm text-gray-700">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Tab: Network -->
    <div v-if="activeTab === 'network'" class="space-y-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">{{ isUz ? 'Tarmoq topologiyasi' : 'Сетевая топология' }}</h2>
      <div class="space-y-3">
        <div v-for="range in ranges" :key="range.id" class="rounded-2xl bg-white border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Server class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-bold text-gray-900">{{ range.name }}</span>
            </div>
            <span class="text-[10px] font-mono text-gray-400">{{ range.ip_prefix }}.x</span>
          </div>
          <div class="space-y-1.5 ml-6">
            <div v-for="rubeg in rubegsByRange(range.id)" :key="rubeg.id" class="flex items-center gap-2 text-xs">
              <span class="w-1 h-1 rounded-full bg-green-500"></span>
              <span class="text-gray-600">{{ rubeg.name }}</span>
              <span class="text-gray-400 font-mono">{{ range.ip_prefix }}.{{ 10 + rubeg.rubeg_number - 1 }}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Range Modal ── -->
    <div v-if="showRangeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showRangeModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ editingRange ? (isUz ? 'Tirni tahrirlash' : 'Редактировать тир') : (isUz ? 'Yangi tir' : 'Новый тир') }}</h3>
          <button @click="showRangeModal = false" class="p-1 rounded hover:bg-gray-100"><X class="w-4 h-4 text-gray-400" /></button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Nomi' : 'Название' }}</label>
            <input v-model="rangeForm.name" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" :placeholder="isUz ? 'Tir №4' : 'Тир №4'" />
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
              <label class="text-xs font-medium text-gray-500">IP</label>
              <input v-model="rangeForm.ip_prefix" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="88.1.95" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Turi' : 'Тип' }}</label>
              <select v-model="rangeForm.range_type" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option value="OPEN">{{ isUz ? 'Ochiq' : 'Открытый' }}</option>
                <option value="CLOSED">{{ isUz ? 'Yopiqlangan' : 'Закрытый' }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? "Yo'liq / rubeg" : 'Дорожек / рубеж' }}</label>
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

    <!-- ── Rubeg Modal ── -->
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
            <label class="text-xs font-medium text-gray-500">{{ isUz ? "Yo'liq soni" : 'Кол-во дорожек' }}</label>
            <input v-model.number="rubegForm.lane_count" type="number" min="1" max="20" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showRubegModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="saveRubeg" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">{{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>

    <!-- ── Weapon Modal ── -->
    <div v-if="showWeaponModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showWeaponModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ editingWeapon ? (isUz ? 'Qurolni tahrirlash' : 'Редактировать оружие') : (isUz ? 'Yangi qurol' : 'Новое оружие') }}</h3>
          <button @click="showWeaponModal = false" class="p-1 rounded hover:bg-gray-100"><X class="w-4 h-4 text-gray-400" /></button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Nomi' : 'Название' }}</label>
            <input v-model="weaponForm.name" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="АК-12" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Turi' : 'Тип' }}</label>
              <select v-model="weaponForm.category" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
                <option v-for="wt in weaponTypes" :key="wt.value" :value="wt.value">{{ isUz ? wt.label_uz : wt.label_ru }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Kalibr' : 'Калибр' }}</label>
              <input v-model="weaponForm.caliber" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="5.45×39mm" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Seriya raqam' : 'Серийный номер' }}</label>
              <input v-model="weaponForm.serial_number" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="AK-2024-001" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">{{ isUz ? 'Ishlab chiqaruvchi' : 'Производитель' }}</label>
              <input v-model="weaponForm.manufacturer" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" placeholder="Ижмаш" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showWeaponModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="saveWeapon" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">{{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirmation ── -->
    <div v-if="deleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="deleteConfirm = null">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 class="text-base font-bold text-gray-900">{{ isUz ? 'Tasdiqlash' : 'Подтверждение' }}</h3>
        <p class="text-sm text-gray-500">{{ isUz ? 'Rostdan ham ochirmoqchimisiz?' : 'Вы действительно хотите удалить?' }}</p>
        <div class="flex items-center justify-end gap-2">
          <button @click="deleteConfirm = null" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button @click="doDelete" class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">{{ isUz ? "O'chirish" : 'Удалить' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
main::-webkit-scrollbar { width: 4px; }
main::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
main::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
main::-webkit-scrollbar-track { background: transparent; }
</style>

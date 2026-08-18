<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api/client'
import { useToast } from '@/composables/useToast'

const toast = useToast()

interface Range {
  id: string
  name: string
  range_type: string
  region: string
}

interface Lane {
  id: string
  name: string
  lane_number: number
  distance_m: number
  status: string
  camera_status: string
  rubeg_number?: number
}

interface Rubeg {
  id: string
  rubeg_number: number
  distance: number
  max_lanes: number
  description: string
  lanes: Lane[]
  lane_count: number
}

interface RangeStructure {
  range_type: string
  range: Range
  rubegs?: Rubeg[]
  lanes?: Lane[]
}

const ranges = ref<Range[]>([])
const selectedRangeId = ref('')
const structure = ref<RangeStructure | null>(null)
const loading = ref(false)

const isOpenRange = computed(() => structure.value?.range_type === 'OPEN')
const closedLanes = computed(() => structure.value?.lanes || [])
const rubegs = computed(() => structure.value?.rubegs || [])

async function loadRanges() {
  try {
    ranges.value = (await api.get('/ranges/')) as Range[]
    if (ranges.value.length > 0) {
      selectedRangeId.value = ranges.value[0].id
      await loadStructure()
    }
  } catch (e: any) {
    toast.error(e.message)
  }
}

async function loadStructure() {
  if (!selectedRangeId.value) return
  loading.value = true
  try {
    structure.value = (await api.get(`/ranges/${selectedRangeId.value}/structure/`)) as RangeStructure
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-700 text-emerald-200',
  OCCUPIED: 'bg-amber-700 text-amber-200',
  MAINTENANCE: 'bg-orange-700 text-orange-200',
  OFFLINE: 'bg-red-700 text-red-200',
}

onMounted(loadRanges)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-slate-100">Дорожки и рубежи</h1>

    <!-- Range selector -->
    <div class="flex gap-3 items-center">
      <select
        v-model="selectedRangeId"
        @change="loadStructure"
        class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
      >
        <option v-for="r in ranges" :key="r.id" :value="r.id">
          {{ r.name }} ({{ r.range_type === 'OPEN' ? 'Открытый' : 'Закрытый' }})
        </option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-8 text-slate-400">Загрузка...</div>

    <!-- OPEN range: rubegs with lanes -->
    <div v-else-if="isOpenRange && rubegs.length > 0" class="space-y-6">
      <div v-for="rubeg in rubegs" :key="rubeg.id" class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-100">
              Рубеж {{ rubeg.rubeg_number }} — {{ rubeg.distance }}м
            </h3>
            <p class="text-sm text-slate-400">{{ rubeg.description || '' }}</p>
          </div>
          <div class="text-sm text-slate-400">
            {{ rubeg.lane_count }} / {{ rubeg.max_lanes }} дорожек
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div
            v-for="lane in rubeg.lanes"
            :key="lane.id"
            class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-slate-200">{{ lane.name }}</span>
              <span :class="['px-2 py-0.5 rounded text-xs', statusColors[lane.status]]">
                {{ lane.status }}
              </span>
            </div>
            <div class="text-xs text-slate-500">{{ lane.distance_m }}м • {{ lane.camera_status }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CLOSED range: lanes only -->
    <div v-else-if="!isOpenRange && closedLanes.length > 0" class="space-y-4">
      <div class="text-sm text-slate-400 mb-2">
        Закрытый тир — только дорожки, без рубежей
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          v-for="lane in closedLanes"
          :key="lane.id"
          class="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-slate-200">{{ lane.name }}</span>
            <span :class="['px-2 py-0.5 rounded text-xs', statusColors[lane.status]]">
              {{ lane.status }}
            </span>
          </div>
          <div class="text-xs text-slate-500">{{ lane.distance_m }}м • {{ lane.camera_status }}</div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-slate-500">
      Нет данных о дорожках
    </div>
  </div>
</template>

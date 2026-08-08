<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Radio, Crosshair, Activity, Zap, Wrench, ChevronRight, Plus, Settings, Target, Clock, TrendingUp } from 'lucide-vue-next'
import LiveCameraMini from '@/components/camera/LiveCameraMini.vue'
import NewSessionModal from '@/components/session/NewSessionModal.vue'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const masterStore = useMasterStore()
const showNewSession = ref(false)
const { t, locale } = useI18n()

const lanes = computed(() => masterStore.lanes)
const liveActivity = computed(() => masterStore.liveActivity)

const stats = computed(() => ({
  available: lanes.value.filter(l => l.status === 'AVAILABLE').length,
  occupied: lanes.value.filter(l => l.status === 'OCCUPIED').length,
  maintenance: lanes.value.filter(l => l.status === 'MAINTENANCE').length,
  total: lanes.value.length,
  totalShots: lanes.value.reduce((s, l) => s + (l.current_shots_fired || 0), 0),
  totalScore: lanes.value.reduce((s, l) => s + (l.current_score || 0), 0),
}))

const L = computed(() => ({
  title: locale.value === 'uz' ? "O'q otish tiri" : 'Огневой тир',
  subtitle: locale.value === 'uz' ? "Yo'laklar holati va jonli efir" : 'Состояние дорожек и живой эфир',
  settings: locale.value === 'uz' ? 'Sozlash' : 'Созлаш',
  newSession: locale.value === 'uz' ? 'Yangi sessiya' : 'Новая сессия',
  activeLanes: locale.value === 'uz' ? "Faol yo'lak" : 'Активн. дорож.',
  of: locale.value === 'uz' ? 'dan' : 'дан',
  totalShots: locale.value === 'uz' ? "Jami o'q" : 'Всего выстр.',
  fired: locale.value === 'uz' ? 'otilgan' : 'выстрелов',
  totalScore: locale.value === 'uz' ? 'Jami ball' : 'Всего очков',
  current: locale.value === 'uz' ? 'hozirgi' : 'текущие',
  technical: locale.value === 'uz' ? 'Texnikda' : 'В ремонте',
  repair: locale.value === 'uz' ? "ta'mir" : 'ремонт',
  available: locale.value === 'uz' ? "Bo'sh" : 'Свободна',
  occupied: locale.value === 'uz' ? 'Band' : 'Занята',
  maintenance: locale.value === 'uz' ? 'Texnik xizmat' : 'Техобслуж.',
  lane: locale.value === 'uz' ? "Yo'lak" : 'Дорожка',
  watch: locale.value === 'uz' ? 'Kuzatish' : 'Наблюдать',
  camera: locale.value === 'uz' ? 'Kamera' : 'Камера',
  techService: locale.value === 'uz' ? 'Texnik xizmatda' : 'На техобслуж.',
  liveActivity: locale.value === 'uz' ? 'Jonli faollik' : 'Активность',
  shots: locale.value === 'uz' ? "o'q" : 'выстр.',
  score: locale.value === 'uz' ? 'ball' : 'балл',
  live: locale.value === 'uz' ? 'jonli' : 'живой',
  now: locale.value === 'uz' ? 'hozir' : 'сейчас',
}))

const statusLabels: Record<string, any> = computed(() => ({
  AVAILABLE: L.value.available,
  OCCUPIED: L.value.occupied,
  MAINTENANCE: L.value.maintenance,
  RESERVED: locale.value === 'uz' ? 'Rezerv' : 'Резерв',
})).value

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-gray-100 text-gray-600',
  OCCUPIED: 'bg-brand-50 text-brand-600',
  MAINTENANCE: 'bg-amber-50 text-amber-600',
  RESERVED: 'bg-purple-50 text-purple-600',
}

const colorMap: Record<string, string> = {
  green: 'bg-brand-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "-"
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5) return L.value.now
  if (diff < 60) return locale.value === 'uz' ? `${diff}s oldin` : `${diff}с назад`
  const m = Math.floor(diff / 60)
  if (m < 60) return locale.value === 'uz' ? `${m}d oldin` : `${m}м назад`
  return locale.value === 'uz' ? `${Math.floor(m / 60)}s oldin` : `${Math.floor(m / 60)}ч назад`
}

function handleSessionCreated(sessionId: string) {
  showNewSession.value = false
  router.push(`/sessions/${sessionId}`)
}

onMounted(() => {
})

onUnmounted(() => {
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ L.title }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ L.subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="router.push('/range/config')" class="btn-secondary flex items-center gap-2">
          <Settings class="w-4 h-4" /> {{ L.settings }}
        </button>
        <button @click="showNewSession = true" class="btn-primary flex items-center gap-2">
          <Plus class="w-4 h-4" /> {{ L.newSession }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="L.activeLanes" :value="stats.occupied" :subtitle="`${stats.total}${L.of}`" :icon="Activity" accent="brand" />
      <KPICard :title="L.totalShots" :value="stats.totalShots" :subtitle="L.fired" :icon="Crosshair" accent="brand" />
      <KPICard :title="L.totalScore" :value="stats.totalScore" :subtitle="L.current" :icon="Target" accent="brand" />
      <KPICard :title="L.technical" :value="stats.maintenance" :subtitle="L.repair" :icon="Wrench" accent="neutral" />
    </div>

    <!-- Main grid: lanes + activity feed -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Lanes -->
      <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="lane in lanes" :key="lane.id"
          class="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <!-- Live camera section -->
          <div class="relative cursor-pointer" @click="router.push(`/range/lane/${lane.lane_number}`)">
            <LiveCameraMini
              :lane-number="lane.lane_number"
              :status="lane.camera_status"
              :employee-name="lane.current_employee_name"
              :is-shooting="lane.status === 'OCCUPIED'"
              :height="150"
            />
            <!-- Status badge -->
            <div class="absolute top-2 right-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm" :class="statusColors[lane.status]">
                {{ statusLabels[lane.status] }}
              </span>
            </div>
            <!-- Live score overlay for occupied lanes -->
            <div v-if="lane.status === 'OCCUPIED'" class="absolute bottom-2 left-2 flex items-center gap-2">
              <div class="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <span class="text-[10px] text-brand-300 font-mono">{{ lane.current_shots_fired || 0 }} {{ L.shots }}</span>
              </div>
              <div class="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <span class="text-[10px] text-amber-300 font-mono font-bold">{{ lane.current_score || 0 }} {{ L.score }}</span>
              </div>
            </div>
          </div>

          <!-- Lane info -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="lane.status === 'OCCUPIED' ? 'bg-brand-50' : 'bg-gray-100'">
                  <Radio class="w-4 h-4" :class="lane.status === 'OCCUPIED' ? 'text-brand-600' : 'text-gray-500'" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ L.lane }} {{ lane.lane_number }}</p>
                  <p class="text-[10px] text-gray-400">{{ lane.distance_m }}m · {{ lane.target_type }}</p>
                </div>
              </div>
              <button @click="router.push(`/range/lane/${lane.lane_number}`)"
                class="p-1.5 rounded-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100">
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <!-- Employee info -->
            <div v-if="lane.current_employee_name" class="flex items-center gap-2 p-2 rounded-lg bg-brand-50/40 mb-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                {{ lane.current_employee_name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 truncate">{{ lane.current_employee_name }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] text-gray-400">{{ lane.weapon_assigned || '-' }}</span>
                  <span class="text-[9px] text-gray-300">·</span>
                  <Clock class="w-2.5 h-2.5 text-gray-400" />
                  <span class="text-[9px] text-gray-400">{{ lane.session_start_time ? timeAgo(lane.session_start_time) : '-' }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-brand-600">{{ lane.current_score || 0 }}</p>
                <p class="text-[8px] text-gray-400">{{ L.score }}</p>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="lane.status === 'MAINTENANCE'" class="flex items-center gap-2 p-2 rounded-lg bg-amber-50/40 mb-3">
              <Wrench class="w-4 h-4 text-amber-500" />
              <p class="text-xs text-amber-600">{{ L.techService }}</p>
            </div>

            <!-- Camera status -->
            <div class="flex items-center justify-between text-[10px]">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full"
                  :class="lane.camera_status === 'ONLINE' ? 'bg-brand-500 animate-pulse' : lane.camera_status === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'"></span>
                <span class="text-gray-400">{{ lane.camera_status }}</span>
              </div>
              <span v-if="lane.status === 'OCCUPIED'" class="text-[9px] text-brand-500 font-medium flex items-center gap-1">
                <TrendingUp class="w-2.5 h-2.5" /> {{ L.live }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2 mt-3">
              <button v-if="lane.status === 'OCCUPIED'"
                @click="router.push(`/range/lane/${lane.lane_number}`)"
                class="flex-1 py-2 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition flex items-center justify-center gap-1">
                <Activity class="w-3.5 h-3.5" /> {{ L.watch }}
              </button>
              <div v-else-if="lane.status === 'MAINTENANCE'" class="flex-1 py-2 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium text-center">
                {{ L.techService }}
              </div>
              <button @click="router.push(`/cameras/live/${lane.lane_number}`)"
                class="px-3 py-2 rounded-lg bg-gray-50 text-gray-500 text-xs hover:bg-gray-100 transition">
                {{ L.camera }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Activity Feed -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <h2 class="text-sm font-bold text-gray-700">{{ L.liveActivity }}</h2>
          </div>
          <div class="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            <div v-for="event in liveActivity" :key="event.id"
              class="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition">
              <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="colorMap[event.color] || 'bg-gray-400'"></span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-700 leading-tight">{{ event.message }}</p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[9px] text-gray-400">{{ event.employee }}</span>
                  <span class="text-[9px] text-gray-300">·</span>
                  <span class="text-[9px] text-gray-400">{{ L.lane }} {{ event.lane }}</span>
                  <span class="text-[9px] text-gray-300 ml-auto">{{ timeAgo(event.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Session Modal -->
    <NewSessionModal :show="showNewSession" @close="showNewSession = false" @created="handleSessionCreated" />
  </div>
</template>

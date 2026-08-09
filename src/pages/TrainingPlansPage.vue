<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Award, Clock, CheckCircle2, Play, ChevronRight, Video, BookOpen, Target, Camera, Activity, Zap, Crosshair } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const plans = computed(() => masterStore.trainingPlans)
const assignments = computed(() => masterStore.trainingAssignments)

const stats = computed(() => ({
  total: plans.value.length,
  assigned: assignments.value.filter(a => a.status === 'ASSIGNED').length,
  inProgress: assignments.value.filter(a => a.status === 'IN_PROGRESS').length,
  completed: assignments.value.filter(a => a.status === 'COMPLETED').length,
}))

// --- Visual lesson data 
const lessons = [
  { id: 'l1', title: isUz.value ? 'Asosiy tutish' : 'Базовый хват', desc: isUz.value ? 'To\'g\'ri tutish va nishon olish' : 'Правильный хват и прицеливание', icon: Target, color: '#3b82f6', hasVideo: true, duration: '15 мин', steps: 5 },
  { id: 'l2', title: isUz.value ? 'Nafas nazorati' : 'Контроль дыхания', desc: isUz.value ? 'Otilish vaqtida nafasni to\'xtatish' : 'Задержка дыхания при выстреле', icon: Activity, color: '#10b981', hasVideo: true, duration: '10 мин', steps: 3 },
  { id: 'l3', title: isUz.value ? 'Nishonni urish' : 'Поражение цели', desc: isUz.value ? 'Markaziy zonaga o\'q urish' : 'Попадание в центральную зону', icon: Crosshair, color: '#f59e0b', hasVideo: false, duration: '20 мин', steps: 7 },
  { id: 'l4', title: isUz.value ? 'Tezkor otish' : 'Скоростная стрельба', desc: isUz.value ? 'Qisqa vaqtda ko\'p o\'q otish' : 'Многократный выстрел за короткое время', icon: Zap, color: '#ef4444', hasVideo: true, duration: '25 мин', steps: 6 },
  { id: 'l5', title: isUz.value ? 'Harakatdan otish' : 'Стрельба в движении', desc: isUz.value ? 'Yurishdan turib nishonga o\'q otish' : 'Стрельба по мишени во время движения', icon: Play, color: '#8b5cf6', hasVideo: false, duration: '30 мин', steps: 8 },
  { id: 'l6', title: isUz.value ? 'Tungi otish' : 'Ночная стрельба', desc: isUz.value ? 'Qorong\'ida nishon olish texnikasi' : 'Техника прицеливания в темноте', icon: Camera, color: '#6366f1', hasVideo: true, duration: '35 мин', steps: 5 },
]


// --- Active training employees 
const activeTrainees = computed(() => {
  return assignments.value.filter(a => a.status === 'IN_PROGRESS').slice(0, 5)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900">{{ isUz ? "Oʻquv rejalar" : "Учебные планы" }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Vizual darslar va mashg'ulotlar" : "Визуальные уроки и тренировки" }}</p>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Rejalar' : 'Планов'" :value="stats.total" :icon="Award" accent="neutral" />
      <KPICard :title="isUz ? 'Tayinlangan' : 'Назначено'" :value="stats.assigned" :icon="Clock" accent="neutral" />
      <KPICard :title="isUz ? 'Jarayonda' : 'В процессе'" :value="stats.inProgress" :icon="Play" accent="brand" />
      <KPICard :title="isUz ? 'Yakunlangan' : 'Завершено'" :value="stats.completed" :icon="CheckCircle2" accent="brand" />
    </div>

    <!-- Visual lessons -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Vizual darslar" : "Визуальные уроки" }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="lesson in lessons" :key="lesson.id"
          class="card cursor-pointer group hover:shadow-lg transition relative overflow-hidden"
          @click="router.push('/range/lane/1')">
          <!-- Visual header -->
          <div class="h-28 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center"
            :style="{ background: `linear-gradient(135deg, ${lesson.color}15, ${lesson.color}05)` }">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition group-hover:scale-110"
              :style="{ background: lesson.color + '20', border: '1px solid ' + lesson.color + '30' }">
              <component :is="lesson.icon" class="w-7 h-7" :style="{ color: lesson.color }" />
            </div>
            <!-- Video badge -->
            <div v-if="lesson.hasVideo" class="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium"
              style="background: rgba(0,0,0,0.7); color: white;">
              <Video class="w-2.5 h-2.5" /> Video
            </div>
            <!-- Duration -->
            <div class="absolute bottom-2 left-2 flex items-center gap-1 text-[9px] text-gray-500">
              <Clock class="w-2.5 h-2.5" /> {{ lesson.duration }}
            </div>
          </div>
          <p class="text-sm font-bold text-gray-800 mb-1">{{ lesson.title }}</p>
          <p class="text-xs text-gray-400 mb-3 line-clamp-2">{{ lesson.desc }}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-400">{{ lesson.steps }} {{ isUz ? "qadam" : "шагов" }}</span>
            <span class="text-brand-600 font-medium flex items-center gap-1">
              {{ isUz ? "Boshlash" : "Начать" }} <ChevronRight class="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active trainees - live camera + 3D results -->
    <div v-if="activeTrainees.length > 0">
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Hozir mashq qilayotganlar" : "Сейчас тренируются" }}</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="a in activeTrainees" :key="a.id"
          class="card p-4 cursor-pointer hover:shadow-lg transition"
          @click="router.push(`/range/lane/${a.id.length % 6 + 1}`)">
          <div class="flex items-center gap-3 mb-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-bold">
                {{ a.employee_name.charAt(0) }}
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800">{{ a.employee_name }}</p>
              <p class="text-xs text-gray-400">{{ a.plan_name }}</p>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-600">{{ isUz ? "Jarayonda" : "В процессе" }}</span>
          </div>
          <!-- Camera preview placeholder -->
          <div class="h-32 rounded-xl bg-gray-900 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-20" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px);"></div>
            <div class="text-center">
              <Camera class="w-8 h-8 text-gray-600 mx-auto mb-1" />
              <p class="text-[10px] text-gray-500">{{ isUz ? "Jonli kamera" : "Живая камера" }}</p>
            </div>
            <div class="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500 text-white">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
            </div>
          </div>
          <!-- Quick stats -->
          <div class="grid grid-cols-3 gap-2 mt-3">
            <div class="text-center p-2 rounded-lg bg-gray-50">
              <p class="text-xs font-bold text-gray-800">{{ a.status === 'COMPLETED' ? 100 : a.status === 'IN_PROGRESS' ? 50 : 0 }}%</p>
              <p class="text-[9px] text-gray-400">{{ isUz ? "Progress" : "Прогресс" }}</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-gray-50">
              <p class="text-xs font-bold text-brand-600">{{ a.score || 0 }}</p>
              <p class="text-[9px] text-gray-400">{{ isUz ? "Ball" : "Балл" }}</p>
            </div>
            <div @click.stop="router.push('/3d-target')" class="text-center p-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-brand-50 transition">
              <p class="text-xs font-bold text-purple-600">3D</p>
              <p class="text-[9px] text-gray-400">{{ isUz ? "Natija" : "Результат" }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Training plans list -->
    <div>
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? "Oʻquv rejalari" : "Планы тренировок" }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="plan in plans" :key="plan.id"
          class="card cursor-pointer group hover:shadow-lg transition"
          @click="router.push(`/training/${plan.id}`)">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-btn flex items-center justify-center text-gray-500 bg-gray-50 group-hover:bg-brand-50 group-hover:text-brand-600 transition">
              <Award class="w-5 h-5" />
            </div>
            <span class="badge" :class="plan.difficulty === 'BASIC' ? 'badge-success' :
              plan.difficulty === 'INTERMEDIATE' ? 'badge-warning' :
              plan.difficulty === 'ADVANCED' ? 'badge-danger' : 'bg-red-900 text-white'">
              {{ plan.difficulty }}
            </span>
          </div>
          <p class="text-sm font-bold text-gray-800 mb-1">{{ plan.name }}</p>
          <p class="text-xs text-gray-400 mb-3 line-clamp-2">{{ plan.description }}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-400">{{ plan.duration_minutes }} {{ isUz ? "min" : "мин" }} · {{ plan.target_distance_m }}м</span>
            <span class="text-brand-600 font-medium">{{ plan.completed_count }}/{{ plan.assigned_count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crosshair, TrendingUp, Target, Award, Zap } from 'lucide-vue-next'
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'

const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const topShooters = computed(() => [...masterStore.employees].sort((a, b) => b.total_score - a.total_score).slice(0, 5))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Mashgʻulot samaradorligi' : 'Эффективность тренировок' }}</h1>
      <p class="text-sm text-gray-500 mt-1">Анализ результатов тренировок</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card"><p class="text-xs text-gray-400 uppercase mb-1">{{ isUz ? 'Yakunlangan' : 'Завершено' }}</p><p class="text-2xl font-bold text-brand-600">{{ masterStore.trainingAssignments.filter(a => a.status === 'COMPLETED').length }}</p></div>
      <div class="card"><p class="text-xs text-gray-400 uppercase mb-1">В процессе</p><p class="text-2xl font-bold text-amber-600">{{ masterStore.trainingAssignments.filter(a => a.status === 'IN_PROGRESS').length }}</p></div>
      <div class="card"><p class="text-xs text-gray-400 uppercase mb-1">Просрочено</p><p class="text-2xl font-bold text-red-500">{{ masterStore.trainingAssignments.filter(a => a.status === 'OVERDUE').length }}</p></div>
      <div class="card"><p class="text-xs text-gray-400 uppercase mb-1">Назначено</p><p class="text-2xl font-bold text-gray-700">{{ masterStore.trainingAssignments.filter(a => a.status === 'ASSIGNED').length }}</p></div>
    </div>

    <div class="card">
      <h2 class="text-sm font-bold text-gray-700 mb-4">Прогресс по планам</h2>
      <div class="space-y-3">
        <div v-for="plan in masterStore.trainingPlans" :key="plan.id" class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><Award class="w-5 h-5 text-gray-500" /></div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1"><span class="text-sm font-medium text-gray-700">{{ plan.name }}</span><span class="text-xs text-gray-400">{{ plan.completed_count }}/{{ plan.assigned_count }}</span></div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" :style="`width: ${plan.assigned_count > 0 ? (plan.completed_count / plan.assigned_count) * 100 : 0}%`"></div></div>
          </div>
          <span class="badge" :class="plan.difficulty === 'BASIC' ? 'badge-success' : plan.difficulty === 'INTERMEDIATE' ? 'badge-warning' : plan.difficulty === 'ADVANCED' ? 'badge-danger' : 'badge-neutral'">{{ plan.difficulty }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-sm font-bold text-gray-700 mb-4">Топ стрелков</h2>
      <div class="space-y-2">
        <div v-for="(emp, idx) in topShooters" :key="emp.id" class="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'">{{ idx + 1 }}</div>
          <div class="flex-1"><p class="text-sm font-semibold text-gray-800">{{ emp.full_name.split(' ').slice(0,2).join(' ') }}</p><p class="text-xs text-gray-400">{{ emp.rank }} · {{ emp.qualification_level }}</p></div>
          <div class="text-right"><p class="text-sm font-bold text-brand-600">{{ emp.total_score }}</p><p class="text-xs text-gray-400">{{ emp.avg_accuracy }}%</p></div>
        </div>
      </div>
    </div>
  </div>
</template>

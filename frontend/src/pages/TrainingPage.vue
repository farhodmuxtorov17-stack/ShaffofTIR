<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '@/api/client'
import { useAuth } from '@/composables/useAuth'

const { state } = useAuth()

interface TrainingPlan {
  id: string
  title: string
  description?: string
  plan_type: string
  duration_hours: number
  difficulty: string
  is_active: boolean
}

interface TrainingAssignment {
  id: string
  plan: TrainingPlan
  employee_name: string
  status: string
  assigned_date: string
  due_date?: string
  completed_date?: string
  score?: number
}

const plans = ref<TrainingPlan[]>([])
const assignments = ref<TrainingAssignment[]>([])
const loading = ref(true)
const activeTab = ref<'plans' | 'assignments'>('plans')

async function loadData() {
  loading.value = true
  try {
    const [p, a] = await Promise.all([
      http.get('/training-plans/').catch(() => []),
      http.get('/training-assignments/').catch(() => []),
    ])
    plans.value = p as TrainingPlan[]
    assignments.value = a as TrainingAssignment[]
  } catch { /* ignore */ }
  finally { loading.value = false }
}

const difficultyColors: Record<string, string> = {
  BASIC: 'badge-green',
  INTERMEDIATE: 'badge-yellow',
  ADVANCED: 'badge-red',
}
const statusColors: Record<string, string> = {
  ASSIGNED: 'badge-yellow',
  IN_PROGRESS: 'badge-blue',
  COMPLETED: 'badge-green',
  OVERDUE: 'badge-red',
}
const statusLabels: Record<string, string> = {
  ASSIGNED: 'Назначено',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Завершено',
  OVERDUE: 'Просрочено',
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-slate-100">Учебный модуль</h1>

    <div class="flex gap-2 border-b border-slate-700">
      <button
        class="px-4 py-2 font-medium transition-colors"
        :class="activeTab === 'plans' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'plans'"
      >Планы обучения</button>
      <button
        class="px-4 py-2 font-medium transition-colors"
        :class="activeTab === 'assignments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = 'assignments'"
      >Назначения</button>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400">Загрузка...</div>

    <div v-else-if="activeTab === 'plans'" class="space-y-3">
      <div v-for="p in plans" :key="p.id" class="card">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-slate-100">{{ p.title }}</h3>
            <p class="text-sm text-slate-400 mt-1">{{ p.description || '—' }}</p>
            <div class="flex gap-4 mt-2 text-sm text-slate-500">
              <span>{{ p.duration_hours }}ч</span>
              <span class="badge" :class="difficultyColors[p.difficulty] || 'badge-gray'">{{ p.difficulty }}</span>
              <span v-if="p.is_active" class="text-emerald-400">Активен</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="plans.length === 0" class="text-center py-8 text-slate-400">Нет планов обучения</div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="a in assignments" :key="a.id" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-slate-100">{{ a.employee_name }}</p>
            <p class="text-sm text-slate-400">{{ a.plan?.title || '—' }}</p>
            <div class="flex gap-4 mt-1 text-sm text-slate-500">
              <span>{{ new Date(a.assigned_date).toLocaleDateString('ru-RU') }}</span>
              <span v-if="a.due_date">до {{ new Date(a.due_date).toLocaleDateString('ru-RU') }}</span>
              <span v-if="a.score !== null && a.score !== undefined">Оценка: {{ a.score }}</span>
            </div>
          </div>
          <span class="badge" :class="statusColors[a.status] || 'badge-gray'">{{ statusLabels[a.status] || a.status }}</span>
        </div>
      </div>
      <div v-if="assignments.length === 0" class="text-center py-8 text-slate-400">Нет назначений</div>
    </div>
  </div>
</template>

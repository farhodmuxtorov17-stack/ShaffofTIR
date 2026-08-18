<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { ShootingSession } from '@/types'
import { ArrowLeft, Target, Crosshair, CheckCircle, XCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const session = ref<ShootingSession | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    session.value = await api.getSession(route.params.id as string)
  } catch { router.push('/sessions') }
  finally { loading.value = false }
}

onMounted(load)

const soldiers = computed(() => session.value?.soldiers || [])
function goBack() { router.push('/sessions') }
</script>

<template>
  <div>
    <button @click="goBack" class="btn-secondary mb-4"><ArrowLeft :size="18" /> Назад</button>
    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="session">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">{{ session.employee_name || 'Сессия' }}</h1>
            <p class="text-sm text-slate-500 mt-1">
              {{ session.employee_rank || '' }} {{ session.employee_department ? '• ' + session.employee_department : '' }}
              • {{ session.weapon_name || '—' }}
              • Дорожка {{ session.lane_number || '—' }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold" :class="session.passed ? 'text-emerald-400' : 'text-red-400'">{{ session.total_score }}</p>
            <p class="text-sm text-slate-500">баллов</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="stat-card"><span class="stat-label">Выстрелов</span><span class="stat-value">{{ session.total_shots }}</span></div>
        <div class="stat-card"><span class="stat-label">Попаданий</span><span class="stat-value text-emerald-400">{{ session.hit_count }}</span></div>
        <div class="stat-card"><span class="stat-label">Промахов</span><span class="stat-value text-red-400">{{ session.miss_count }}</span></div>
        <div class="stat-card"><span class="stat-label">Точность</span><span class="stat-value">{{ session.accuracy }}%</span></div>
      </div>

      <!-- Soldiers -->
      <div class="card">
        <h2 class="font-semibold text-slate-200 mb-4">Стрелки</h2>
        <div v-if="soldiers.length === 0" class="text-slate-500 text-sm">Нет данных о стрелках</div>
        <div v-else class="space-y-3">
          <div v-for="s in soldiers" :key="s.id" class="flex items-center gap-4 p-3 rounded-lg bg-slate-900/50">
            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-300">{{ s.sequence_number }}</div>
            <div class="flex-1">
              <p class="font-medium text-slate-200">{{ s.employee_name || `Стрелок ${s.sequence_number}` }}</p>
              <p class="text-xs text-slate-500">{{ s.hit_count }} попад. / {{ s.miss_count }} пром. • {{ s.accuracy }}%</p>
            </div>
            <span class="text-lg font-bold" :class="s.passed ? 'text-emerald-400' : 'text-red-400'">{{ s.total_score }}</span>
            <CheckCircle v-if="s.passed" :size="18" class="text-emerald-400" />
            <XCircle v-else :size="18" class="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

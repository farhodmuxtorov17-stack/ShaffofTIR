<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { Employee, ShootingSession } from '@/types'
import { ArrowLeft, Shield, Target, CheckCircle, XCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const employee = ref<Employee | null>(null)
const sessions = ref<ShootingSession[]>([])
const loading = ref(true)

async function load() {
  try {
    employee.value = await api.getEmployee(route.params.id as string)
    const all = await api.getSessions()
    sessions.value = all.filter((s: any) => s.employee_name === employee.value?.full_name)
  } catch { router.push('/employees') }
  finally { loading.value = false }
}
onMounted(load)
function goBack() { router.push('/employees') }
</script>

<template>
  <div>
    <button @click="goBack" class="btn-secondary mb-4"><ArrowLeft :size="18" /> Назад</button>
    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="employee">
      <div class="card mb-6">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl font-bold text-white">
            {{ employee.full_name?.charAt(0) }}
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold">{{ employee.full_name }}</h1>
            <p class="text-sm text-slate-400 mt-0.5">{{ employee.rank }} • {{ employee.position }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="badge-blue">{{ employee.department }}</span>
              <span class="badge-gray">{{ employee.region }}</span>
              <span class="badge-gray">{{ employee.district }}</span>
              <span class="badge-gray">{{ employee.unit }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <span :class="employee.tb_test_passed ? 'badge-green' : 'badge-red'" class="flex items-center gap-1">
              <Shield :size="14" /> ТБ {{ employee.tb_test_passed ? '✓' : '✗' }}
            </span>
            <span :class="employee.shooting_qualified ? 'badge-green' : 'badge-red'">
              Допуск {{ employee.shooting_qualified ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="stat-card"><span class="stat-label">Сессий</span><span class="stat-value">{{ employee.total_sessions }}</span></div>
        <div class="stat-card"><span class="stat-label">Сумма баллов</span><span class="stat-value">{{ employee.total_score }}</span></div>
        <div class="stat-card"><span class="stat-label">Средн. точность</span><span class="stat-value">{{ employee.avg_accuracy }}%</span></div>
        <div class="stat-card"><span class="stat-label">Квалификация</span><span class="stat-value text-sm">{{ employee.qualification_level }}</span></div>
      </div>

      <div class="card">
        <h2 class="font-semibold mb-4 flex items-center gap-2"><Target :size="18" class="text-emerald-400" /> История стрельб</h2>
        <div v-if="sessions.length === 0" class="text-slate-500 text-sm">Нет данных о стрельбах</div>
        <div v-else class="space-y-2">
          <div v-for="s in sessions" :key="s.id" class="flex items-center gap-4 p-3 rounded-lg bg-slate-900/50">
            <div class="flex-1">
              <p class="text-sm font-medium">{{ s.weapon_name || '—' }} • Дорожка {{ s.lane_number || '—' }}</p>
              <p class="text-xs text-slate-500">{{ new Date(s.created_at).toLocaleDateString('ru-RU') }} • {{ s.total_shots }} выстр.</p>
            </div>
            <span class="text-lg font-bold" :class="s.passed ? 'text-emerald-400' : 'text-red-400'">{{ s.total_score }}</span>
            <span class="text-sm text-slate-400">{{ s.accuracy }}%</span>
            <CheckCircle v-if="s.passed" :size="18" class="text-emerald-400" />
            <XCircle v-else :size="18" class="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

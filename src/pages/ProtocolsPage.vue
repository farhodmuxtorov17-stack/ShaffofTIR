<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useI18n } from '@/i18n'
import EmptyState from '@/components/ui/EmptyState.vue'
import { ScrollText, ArrowRight, FileText, Plus, Calendar, User } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

// Get unique employees with sessions
const employeesWithSessions = computed(() => {
  const empMap: Record<string, { id: string; name: string; rank: string; sessions: number; avgScore: number; avgAccuracy: number }> = {}
  historyStore.sessions.forEach(s => {
    if (!empMap[s.employee_id]) {
      empMap[s.employee_id] = { id: s.employee_id, name: s.employee_name, rank: s.employee_rank, sessions: 0, avgScore: 0, avgAccuracy: 0 }
    }
    empMap[s.employee_id].sessions++
    empMap[s.employee_id].avgScore += s.total_score
    empMap[s.employee_id].avgAccuracy += s.accuracy
  })
  return Object.values(empMap).map(e => ({
    ...e,
    avgScore: Math.round(e.avgScore / e.sessions),
    avgAccuracy: Math.round(e.avgAccuracy / e.sessions),
  }))
})

function createProtocol() {
  router.push('/protocols/create')
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">{{ isUz ? "Bayonnomalar" : "Протоколы" }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? "Xodim natijalari bo'yicha hujjatlar" : "Документы по результатам сотрудников" }}</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="createProtocol">
        <Plus class="w-4 h-4" /> {{ isUz ? "Bayonnoma yaratish" : "Создать протокол" }}
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Xodimlar' : 'Сотрудников'" :value="employeesWithSessions.length" :icon="User" accent="brand" />
      <KPICard :title="isUz ? 'Sessiyalar' : 'Сессий'" :value="historyStore.totalSessions" :icon="ScrollText" accent="blue" />
      <KPICard :title="isUz ? 'O\'rtacha ball' : 'Ср. балл'" :value="historyStore.avgScore" :icon="FileText" accent="purple" />
      <KPICard :title="isUz ? 'O\'tish foizi' : 'Сдача'" :value="historyStore.passRate + '%'" :icon="FileText" accent="amber" />
    </div>

    <!-- Employee list for protocol generation -->
    <div v-if="employeesWithSessions.length > 0" class="card p-0 overflow-hidden">
      <table class="premium-table">
        <thead>
          <tr>
            <th>{{ isUz ? "Xodim" : "Сотрудник" }}</th>
            <th>{{ isUz ? "Zvanja" : "Звание" }}</th>
            <th>{{ isUz ? "Sessiya" : "Сессии" }}</th>
            <th>{{ isUz ? "O'rtacha ball" : "Ср. балл" }}</th>
            <th>{{ isUz ? "Aniqlik" : "Точность" }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employeesWithSessions" :key="emp.id" @click="createProtocol" class="cursor-pointer">
            <td>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {{ emp.name.charAt(0) }}
                </div>
                <span class="text-sm font-bold text-gray-800">{{ emp.name }}</span>
              </div>
            </td>
            <td class="text-sm text-gray-600">{{ emp.rank }}</td>
            <td class="text-sm font-bold text-gray-800">{{ emp.sessions }}</td>
            <td class="text-sm font-bold text-brand-600">{{ emp.avgScore }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div class="h-full rounded-full bg-brand-500" :style="`width: ${emp.avgAccuracy}%`"></div>
                </div>
                <span class="text-xs font-bold text-gray-600">{{ emp.avgAccuracy }}%</span>
              </div>
            </td>
            <td>
              <ArrowRight class="w-4 h-4 text-gray-300" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="card flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <ScrollText class="w-8 h-8 text-gray-300" />
      </div>
      <p class="text-sm font-bold text-gray-400">{{ isUz ? "Bayonnomalar yo'q" : "Протоколов нет" }}</p>
      <p class="text-xs text-gray-300 mt-1">{{ isUz ? "Avval sessiya o'tkazing" : "Сначала проведите сессии" }}</p>
      <button class="btn-primary mt-4" @click="createProtocol">
        <Plus class="w-4 h-4" /> {{ isUz ? "Yaratish" : "Создать" }}
      </button>
    </div>
  </div>
</template>

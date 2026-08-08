<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { FileText, Download, ScrollText, ChevronRight, Filter, FileBarChart, Calendar } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

type Tab = 'reports' | 'protocols'
const activeTab = ref<Tab>('reports')

const regionFilter = ref('')
const regions = computed(() => Array.from(new Set(masterStore.employees.map(e => e.region || '').filter(Boolean))))

const filteredSessions = computed(() => {
  if (!regionFilter.value) return historyStore.sessions
  const empIds = new Set(masterStore.employees.filter(e => e.region === regionFilter.value).map(e => e.id))
  const empNames = new Set(masterStore.employees.filter(e => e.region === regionFilter.value).map(e => e.full_name.split(' ').slice(0, 2).join(' ')))
  return historyStore.sessions.filter(s => empIds.has(s.employee_id) || empNames.has(s.employee_name))
})

const stats = computed(() => ({
  total: filteredSessions.value.length,
  completed: filteredSessions.value.filter(s => s.status === 'COMPLETED').length,
  totalShots: filteredSessions.value.reduce((sum, s) => sum + s.total_shots, 0),
  avgScore: filteredSessions.value.length > 0 ? Math.round(filteredSessions.value.reduce((sum, s) => sum + s.total_score, 0) / filteredSessions.value.length) : 0,
}))

// ── Protocols ──
const protocols = computed(() => historyStore.sessions.filter(s => s.status === 'COMPLETED' || s.status === 'REVIEWED').slice(0, 30))

function printReport() { window.print() }
function exportData() {
  const data = filteredSessions.value.map(s => ({
    ID: s.id, Employee: s.employee_name, Lane: s.lane_number,
    Shots: s.total_shots, Hits: s.hit_count, Score: s.total_score, Accuracy: s.accuracy,
    Date: s.created_at, Status: s.status,
  }))
  const csv = ['ID,Employee,Lane,Shots,Hits,Score,Accuracy,Date,Status',
    ...data.map(d => Object.values(d).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'shaffoftir_report.csv'
  a.click()
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900">{{ isUz ? "Hisobotlar" : "Отчёты" }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Sessiya natijalari va protokollar" : "Результаты сессий и протоколы" }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary text-xs" @click="exportData">
          <Download class="w-3.5 h-3.5" /> CSV
        </button>
        <button class="btn-primary text-xs" @click="printReport">
          <FileText class="w-3.5 h-3.5" /> {{ isUz ? "Chop etish" : "Печать" }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 p-1 rounded-xl bg-gray-100 w-fit">
      <button @click="activeTab = 'reports'" class="px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2"
        :class="activeTab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">
        <FileBarChart class="w-3.5 h-3.5" /> {{ isUz ? "Hisobotlar" : "Отчёты" }}
      </button>
      <button @click="activeTab = 'protocols'" class="px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2"
        :class="activeTab === 'protocols' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">
        <ScrollText class="w-3.5 h-3.5" /> {{ isUz ? "Protokollar" : "Протоколы" }}
      </button>
    </div>

    <!-- Region filter -->
    <div class="flex items-center gap-3">
      <Filter class="w-3.5 h-3.5 text-gray-400" />
      <select v-model="regionFilter" class="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white">
        <option value="">{{ isUz ? "Barcha viloyatlar" : "Все регионы" }}</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>

    <!-- ═══ REPORTS TAB ═══ -->
    <template v-if="activeTab === 'reports'">
      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="isUz ? 'Jami sessiyalar' : 'Всего сессий'" :value="stats.total" :icon="FileText" accent="brand" />
        <KPICard :title="isUz ? 'Yakunlangan' : 'Завершено'" :value="stats.completed" :icon="Calendar" accent="blue" />
        <KPICard :title="isUz ? 'Jami o' + '02bb' + 'qlar' : 'Выстрелов'" :value="stats.totalShots" :icon="FileBarChart" accent="amber" />
        <KPICard :title="isUz ? 'O02bbrtacha ball' : 'Ср. балл'" :value="stats.avgScore" :icon="ChevronRight" accent="purple" />
      </div>

      <!-- Sessions table -->
      <div class="card p-0 overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ isUz ? "Xodim" : "Сотрудник" }}</th>
              <th>{{ isUz ? "Yo'lak" : "Дорожка" }}</th>
              <th>{{ isUz ? "O'qlar" : "Выстрелы" }}</th>
              <th>{{ isUz ? "Aniqlik" : "Точность" }}</th>
              <th>{{ isUz ? "Ball" : "Балл" }}</th>
              <th>{{ isUz ? "Sana" : "Дата" }}</th>
              <th>{{ isUz ? "Holat" : "Статус" }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSessions.slice(0, 50)" :key="s.id" @click="router.push(`/sessions/${s.id}`)" class="cursor-pointer">
              <td class="font-mono text-xs text-gray-400">{{ s.id.substring(0, 8) }}</td>
              <td class="text-sm font-bold text-gray-800">{{ s.employee_name }}</td>
              <td><span class="badge-neutral">L{{ s.lane_number }}</span></td>
              <td class="text-sm text-gray-600">{{ s.hit_count }}/{{ s.total_shots }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div class="h-full rounded-full" :class="(s.accuracy||0) >= 70 ? 'bg-brand-500' : (s.accuracy||0) >= 50 ? 'bg-amber-500' : 'bg-red-400'" :style="`width: ${s.accuracy || 0}%`"></div>
                  </div>
                  <span class="text-xs font-bold text-gray-600">{{ s.accuracy || 0 }}%</span>
                </div>
              </td>
              <td class="text-sm font-bold text-brand-600">{{ s.total_score }}</td>
              <td class="text-xs text-gray-400">{{ s.created_at ? new Date(s.created_at).toLocaleDateString('ru-RU') : '-' }}</td>
              <td>
                <span class="badge" :class="s.status === 'COMPLETED' ? 'badge-success' : s.status === 'REVIEWED' ? 'badge-neutral' : 'badge-warning'">
                  {{ s.status === 'COMPLETED' ? (isUz ? "Yakunlandi" : "Завершён") : s.status === 'REVIEWED' ? (isUz ? "Ko'rilgan" : "Проверен") : (isUz ? "Kutilmoqda" : "Ожидает") }}
                </span>
              </td>
              <td><ChevronRight class="w-4 h-4 text-gray-300" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══ PROTOCOLS TAB ═══ -->
    <template v-if="activeTab === 'protocols'">
      <div class="card p-0 overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>{{ isUz ? 'Protokol №' : 'Протокол №' }}</th>
              <th>{{ isUz ? 'Xodim' : 'Сотрудник' }}</th>
              <th>{{ isUz ? "Yo'lak" : 'Дорожка' }}</th>
              <th>{{ isUz ? "O'qlar" : 'Выстрелы' }}</th>
              <th>{{ isUz ? 'Aniqlik' : 'Точность' }}</th>
              <th>{{ isUz ? 'Ball' : 'Балл' }}</th>
              <th>{{ isUz ? 'Sana' : 'Дата' }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in protocols" :key="p.id" @click="router.push(`/protocols/${p.id}`)" class="cursor-pointer">
              <td class="font-mono text-xs text-gray-400">№{{ String(i + 1).padStart(4, '0') }}</td>
              <td class="text-sm font-bold text-gray-800">{{ p.employee_name }}</td>
              <td><span class="badge-neutral">L{{ p.lane_number }}</span></td>
              <td class="text-sm text-gray-600">{{ p.hit_count }}/{{ p.total_shots }}</td>
              <td class="text-sm font-bold" :class="(p.accuracy||0) >= 70 ? 'text-brand-600' : (p.accuracy||0) >= 50 ? 'text-amber-600' : 'text-red-500'">{{ p.accuracy || 0 }}%</td>
              <td class="text-sm font-bold text-gray-800">{{ p.total_score }}</td>
              <td class="text-xs text-gray-400">{{ p.created_at ? new Date(p.created_at).toLocaleDateString('ru-RU') : '-' }}</td>
              <td><ChevronRight class="w-4 h-4 text-gray-300" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="protocols.length === 0" class="text-center text-sm text-gray-400 py-12">
        {{ isUz ? 'Protokollar topilmadi' : 'Протоколы не найдены' }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { Employee } from '@/types'
import { Users, Search, Shield, CheckCircle, XCircle } from 'lucide-vue-next'

const router = useRouter()
const employees = ref<Employee[]>([])
const loading = ref(true)
const search = ref('')

async function load() {
  try { employees.value = await api.getEmployees() } catch { employees.value = [] }
  finally { loading.value = false }
}

const filtered = () => employees.value.filter(e =>
  !search.value || e.full_name?.toLowerCase().includes(search.value.toLowerCase()) ||
  e.personal_number?.includes(search.value)
)

function openEmployee(id: string) { router.push(`/employees/${id}`) }

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><Users :size="22" class="text-emerald-400" /> Сотрудники</h1>
      <p class="text-sm text-slate-500 mt-0.5">Реестр личного состава</p>
    </div>

    <div class="relative mb-4">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input v-model="search" class="input pl-10" placeholder="Поиск по имени или личному номеру..." />
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Всего</span><span class="stat-value">{{ employees.length }}</span></div>
      <div class="stat-card"><span class="stat-label">Допущены</span><span class="stat-value text-emerald-400">{{ employees.filter(e => e.shooting_qualified).length }}</span></div>
      <div class="stat-card"><span class="stat-label">ТБ пройден</span><span class="stat-value text-emerald-400">{{ employees.filter(e => e.tb_test_passed).length }}</span></div>
      <div class="stat-card"><span class="stat-label">Средн. точность</span><span class="stat-value">{{ employees.length ? Math.round(employees.reduce((a, e) => a + e.avg_accuracy, 0) / employees.length) : 0 }}%</span></div>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else class="card overflow-hidden p-0">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-800 text-xs text-slate-500 uppercase">
            <th class="text-left px-4 py-3 font-medium">ФИО</th>
            <th class="text-left px-4 py-3 font-medium">Звание</th>
            <th class="text-left px-4 py-3 font-medium">Подразделение</th>
            <th class="text-left px-4 py-3 font-medium">Регион</th>
            <th class="text-center px-4 py-3 font-medium">Сессий</th>
            <th class="text-center px-4 py-3 font-medium">Точность</th>
            <th class="text-center px-4 py-3 font-medium">ТБ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered()" :key="e.id" @click="openEmployee(e.id)" class="table-row cursor-pointer">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-200">{{ e.full_name }}</p>
              <p class="text-xs text-slate-500">{{ e.position }} • {{ e.personal_number }}</p>
            </td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ e.rank }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ e.department }}</td>
            <td class="px-4 py-3 text-sm text-slate-500">{{ e.region }}</td>
            <td class="px-4 py-3 text-center text-sm text-slate-300">{{ e.total_sessions }}</td>
            <td class="px-4 py-3 text-center text-sm" :class="e.avg_accuracy >= 70 ? 'text-emerald-400' : e.avg_accuracy >= 60 ? 'text-amber-400' : 'text-red-400'">{{ e.avg_accuracy }}%</td>
            <td class="px-4 py-3 text-center">
              <CheckCircle v-if="e.tb_test_passed" :size="18" class="inline text-emerald-400" />
              <XCircle v-else :size="18" class="inline text-red-400" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

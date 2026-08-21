<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { ShootingSession } from '@/types'
import { Target, CheckCircle, XCircle, Search } from 'lucide-vue-next'

const router = useRouter()
const results = ref<ShootingSession[]>([])
const loading = ref(true)
const search = ref('')

async function load() {
  loading.value = true
  try { results.value = await api.getSessions() } catch { results.value = [] }
  finally { loading.value = false }
}

const filtered = () => results.value.filter(r =>
  !search.value || r.employee_name?.toLowerCase().includes(search.value.toLowerCase())
)

function openResult(id: string) { router.push(`/results/${id}`) }

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><Target :size="22" class="text-emerald-400" /> Результаты</h1>
      <p class="text-sm text-slate-500 mt-0.5">История результатов стрельб</p>
    </div>

    <div class="relative mb-4">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input v-model="search" class="input pl-10" placeholder="Поиск по имени..." />
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="filtered().length === 0" class="card text-center py-12 text-slate-500">Нет результатов</div>
    <div v-else class="card overflow-hidden p-0">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-800 text-xs text-slate-500 uppercase">
            <th class="text-left px-4 py-3 font-medium">Сотрудник</th>
            <th class="text-left px-4 py-3 font-medium">Подразделение</th>
            <th class="text-left px-4 py-3 font-medium">Оружие</th>
            <th class="text-center px-4 py-3 font-medium">Выстр.</th>
            <th class="text-center px-4 py-3 font-medium">Попад.</th>
            <th class="text-center px-4 py-3 font-medium">Точн.</th>
            <th class="text-right px-4 py-3 font-medium">Балл</th>
            <th class="text-center px-4 py-3 font-medium">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered()" :key="r.id" @click="openResult(r.id)" class="table-row cursor-pointer">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-200">{{ r.employee_name }}</p>
              <p class="text-xs text-slate-500">{{ r.employee_rank || '' }}</p>
            </td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ r.employee_department || '—' }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ r.weapon_name || '—' }}</td>
            <td class="px-4 py-3 text-center text-sm text-slate-300">{{ r.total_shots }}</td>
            <td class="px-4 py-3 text-center text-sm text-emerald-400">{{ r.hit_count }}</td>
            <td class="px-4 py-3 text-center text-sm text-slate-300">{{ r.accuracy }}%</td>
            <td class="px-4 py-3 text-right font-bold" :class="r.passed ? 'text-emerald-400' : 'text-red-400'">{{ r.total_score }}</td>
            <td class="px-4 py-3 text-center">
              <CheckCircle v-if="r.passed" :size="18" class="inline text-emerald-400" />
              <XCircle v-else :size="18" class="inline text-red-400" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

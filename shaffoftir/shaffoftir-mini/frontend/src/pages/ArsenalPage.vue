<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import type { Weapon } from '@/types'
import { Crosshair, Search, User } from 'lucide-vue-next'

const weapons = ref<Weapon[]>([])
const loading = ref(true)
const search = ref('')

async function load() {
  try { weapons.value = await api.getWeapons() } catch { weapons.value = [] }
  finally { loading.value = false }
}

const filtered = () => weapons.value.filter(w =>
  !search.value || w.name?.toLowerCase().includes(search.value.toLowerCase()) || w.serial_number?.includes(search.value)
)

function statusBadge(status: string) {
  const map: Record<string, string> = { AVAILABLE: 'badge-green', IN_USE: 'badge-yellow', MAINTENANCE: 'badge-red', DECOMMISSIONED: 'badge-gray' }
  return map[status] || 'badge-gray'
}
function statusLabel(status: string) {
  const map: Record<string, string> = { AVAILABLE: 'Доступно', IN_USE: 'Выдано', MAINTENANCE: 'Ремонт', DECOMMISSIONED: 'Списано' }
  return map[status] || status
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><Crosshair :size="22" class="text-emerald-400" /> Арсенал</h1>
      <p class="text-sm text-slate-500 mt-0.5">Учёт оружия</p>
    </div>

    <div class="relative mb-4">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input v-model="search" class="input pl-10" placeholder="Поиск по названию или серийному номеру..." />
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><span class="stat-label">Всего</span><span class="stat-value">{{ weapons.length }}</span></div>
      <div class="stat-card"><span class="stat-label">Доступно</span><span class="stat-value text-emerald-400">{{ weapons.filter(w => w.status === 'AVAILABLE').length }}</span></div>
      <div class="stat-card"><span class="stat-label">Выдано</span><span class="stat-value text-amber-400">{{ weapons.filter(w => w.status === 'IN_USE').length }}</span></div>
      <div class="stat-card"><span class="stat-label">В ремонте</span><span class="stat-value text-red-400">{{ weapons.filter(w => w.status === 'MAINTENANCE').length }}</span></div>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else class="card overflow-hidden p-0">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-800 text-xs text-slate-500 uppercase">
            <th class="text-left px-4 py-3 font-medium">Оружие</th>
            <th class="text-left px-4 py-3 font-medium">Серийный №</th>
            <th class="text-left px-4 py-3 font-medium">Калибр</th>
            <th class="text-left px-4 py-3 font-medium">Состояние</th>
            <th class="text-left px-4 py-3 font-medium">Выдано</th>
            <th class="text-center px-4 py-3 font-medium">Выстрелов</th>
            <th class="text-center px-4 py-3 font-medium">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in filtered()" :key="w.id" class="table-row">
            <td class="px-4 py-3 font-medium text-slate-200">{{ w.name }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ w.serial_number }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ w.caliber }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ w.condition }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">
              <span v-if="w.assigned_to" class="flex items-center gap-1"><User :size="14" /> {{ w.assigned_to }}</span>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 text-center text-sm text-slate-300">{{ w.total_shots_fired }}</td>
            <td class="px-4 py-3 text-center"><span :class="statusBadge(w.status)">{{ statusLabel(w.status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

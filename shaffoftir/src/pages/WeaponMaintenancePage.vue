<script setup lang="ts">
import { useMasterStore } from '@/stores/master'
import { Wrench, Crosshair, AlertCircle, CheckCircle2, Clock } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const maintenanceWeapons = computed(() => masterStore.weapons.filter(w => w.status === 'MAINTENANCE' || w.condition === 'POOR' || w.condition === 'FAIR'))
const allWeapons = computed(() => masterStore.weapons)

const conditionColors: Record<string, string> = { EXCELLENT: 'text-brand-600', GOOD: 'text-gray-700', FAIR: 'text-amber-600', POOR: 'text-red-500' }
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Texnik xizmat' : 'Обслуживание' }} оружия</h1>
      <p class="text-sm text-gray-500 mt-1">{ isUz ? 'TO grafik va qurol holati' : 'График ТО и состояние оружия' }</p>
    </div>
    <div v-if="maintenanceWeapons.length > 0" class="card border-amber-200 bg-amber-50/30">
      <div class="flex items-center gap-2 mb-3"><AlertCircle class="w-4 h-4 text-amber-600" /><h2 class="text-sm font-bold text-amber-900">{{ isUz ? 'E\u02bbeibor berish kerak' : 'Требует внимания' }}</h2></div>
      <div class="space-y-2">
        <div v-for="w in maintenanceWeapons" :key="w.id" class="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-100">
          <div class="flex items-center gap-3"><Crosshair class="w-5 h-5 text-gray-400" /><div><p class="text-sm font-semibold text-gray-800">{{ w.name }}</p><p class="text-xs text-gray-400">{{ w.serial_number }} · {{ w.total_shots_fired }} выстрелов</p></div></div>
          <div class="flex items-center gap-2"><span class="badge" :class="w.status === 'MAINTENANCE' ? 'badge-danger' : 'badge-warning'">{{ w.status }}</span><span class="text-xs" :class="conditionColors[w.condition]">{{ w.condition }}</span></div>
        </div>
      </div>
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? 'Qurol' : 'Оружие' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Holat' : 'Состояние' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Holat' : 'Статус' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'O\u02bbqilar' : 'Выстрелов' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'So\u02bbnggi TO' : 'Последнее ТО' }}</th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="w in allWeapons" :key="w.id" class="hover:bg-gray-50/50 transition">
            <td class="px-4 py-3"><p class="text-xs font-semibold text-gray-800">{{ w.name }}</p><p class="text-[10px] text-gray-400 font-mono">{{ w.serial_number }}</p></td>
            <td class="px-4 py-3 text-xs" :class="conditionColors[w.condition]">{{ w.condition }}</td>
            <td class="px-4 py-3"><span class="badge" :class="w.status === 'AVAILABLE' ? 'badge-success' : w.status === 'IN_USE' ? 'badge-warning' : w.status === 'MAINTENANCE' ? 'badge-danger' : 'badge-neutral'">{{ w.status }}</span></td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ w.total_shots_fired }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ w.last_maintenance }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

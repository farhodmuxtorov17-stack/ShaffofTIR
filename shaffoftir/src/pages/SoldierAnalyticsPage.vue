<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Target, TrendingUp, Crosshair } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'

const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const employees = computed(() => [...masterStore.employees].sort((a, b) => b.avg_accuracy - a.avg_accuracy))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Otishma boʻyicha analitika' : 'Аналитика по стрелкам' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Individuat koʻrsatkichlar' : 'Индивидуальные показатели' }}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard title="{{ isUz ? 'Otishma' : 'Стрелков' }}" :value="employees.length" accent="neutral" />
      <KPICard title="{{ isUz ? 'Oʻrtacha aniqlik' : 'Средняя точность' }}" :value="`${Math.round(employees.reduce((s, e) => s + e.avg_accuracy, 0) / employees.length)}%`" accent="brand" />
      <KPICard title="{{ isUz ? 'Mutaxassislar' : 'Экспертов' }}" :value="employees.filter(e => e.qualification_level === 'EXPERT').length" accent="brand" />
      <KPICard title="{{ isUz ? 'Boshlovchilar' : 'Начинающих' }}" :value="employees.filter(e => e.qualification_level === 'BEGINNER').length" accent="neutral" />
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? 'Otishma' : 'Стрелок' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Aniqlik' : 'Точность' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Ball' : 'Балл' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Sessiyalar' : 'Сессий' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Malaka' : 'Квалиф.' }}</th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="emp in employees" :key="emp.id" class="hover:bg-gray-50/50 transition cursor-pointer" @click="$router.push(`/hr/employee/${emp.id}`)">
            <td class="px-4 py-3 text-xs font-semibold text-gray-800">{{ emp.full_name.split(' ').slice(0,2).join(' ') }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[100px]"><div class="h-full rounded-full bg-brand-500" :style="`width: ${emp.avg_accuracy}%`"></div></div>
                <span class="text-xs font-bold text-gray-700">{{ emp.avg_accuracy }}%</span>
              </div>
            </td>
            <td class="px-4 py-3 text-xs font-bold text-brand-600">{{ emp.total_score }}</td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ emp.total_sessions }}</td>
            <td class="px-4 py-3"><span class="badge" :class="emp.qualification_level === 'EXPERT' ? 'badge-success' : emp.qualification_level === 'ADVANCED' ? 'badge-warning' : 'badge-neutral'">{{ emp.qualification_level }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

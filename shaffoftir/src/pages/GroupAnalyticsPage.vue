<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Users, Target } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'

const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const departments = computed(() => masterStore.departments.map(d => {
  const employees = masterStore.employees.filter(e => e.department === d.name)
  const avgAccuracy = employees.length > 0 ? Math.round(employees.reduce((s, e) => s + e.avg_accuracy, 0) / employees.length) : 0
  const totalScore = employees.reduce((s, e) => s + e.total_score, 0)
  return { ...d, avgAccuracy, totalScore, employeeCount: employees.length }
}))

const maxScore = computed(() => Math.max(...departments.value.map(d => d.totalScore), 1))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Guruh boʻyicha analitika' : 'Аналитика по группам' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Boʻlinmalarni qiyoslash' : 'Сравнение подразделений' }}</p>
    </div>
    <div class="card">
      <h2 class="text-sm font-bold text-gray-700 mb-4">{{ isUz ? 'Boʻlinmalar boʻyicha natijalar' : 'Результаты по подразделениям' }}</h2>
      <div class="space-y-3">
        <div v-for="d in departments" :key="d.id" class="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50">
          <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Users class="w-5 h-5 text-gray-500" /></div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1"><span class="text-sm font-medium text-gray-700">{{ d.name }}</span><span class="text-xs text-gray-400">{{ d.employeeCount }} {{ isUz ? 'kishi' : 'чел.' }} · {{ d.avgAccuracy }}% {{ isUz ? 'aniq.' : 'точн.' }}</span></div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" :style="`width: ${(d.totalScore / maxScore) * 100}%`"></div></div>
          </div>
          <span class="text-sm font-bold text-brand-600">{{ d.totalScore }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

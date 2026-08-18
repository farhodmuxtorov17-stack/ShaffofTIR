<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Award, Check, X, Clock } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const assignments = computed(() => masterStore.trainingAssignments)

const stats = computed(() => ({
  total: assignments.value.length,
  completed: assignments.value.filter(a => a.status === 'COMPLETED').length,
  overdue: assignments.value.filter(a => a.status === 'OVERDUE').length,
  active: assignments.value.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ASSIGNED').length,
}))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Mashgʻulot tarixi' : 'История тренировок' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Oʻtgan tayinlashlar' : 'Прошедшие назначения' }}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card text-center"><p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Jami' : 'Всего' }}</p></div>
      <div class="card text-center"><p class="text-2xl font-bold text-brand-600">{{ stats.completed }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Yakunlangan' : 'Завершено' }}</p></div>
      <div class="card text-center"><p class="text-2xl font-bold text-amber-600">{{ stats.active }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Faol' : 'Активных' }}</p></div>
      <div class="card text-center"><p class="text-2xl font-bold text-red-500">{{ stats.overdue }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Muddati oʻtgan' : 'Просрочено' }}</p></div>
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? 'Reja' : 'План' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Xodim' : 'Сотрудник' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Sana' : 'Дата' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Ball' : 'Балл' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Holat' : 'Статус' }}</th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="a in assignments" :key="a.id" class="hover:bg-gray-50/50 transition">
            <td class="px-4 py-3 text-xs font-medium text-gray-800">{{ a.plan_name }}</td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ a.employee_name }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ a.assigned_at.split('T')[0] }}</td>
            <td class="px-4 py-3 text-xs font-bold" :class="a.score && a.score >= 70 ? 'text-brand-600' : 'text-amber-600'">{{ a.score || '-' }}</td>
            <td class="px-4 py-3"><span class="badge" :class="a.status === 'COMPLETED' ? 'badge-success' : a.status === 'IN_PROGRESS' ? 'badge-warning' : a.status === 'OVERDUE' ? 'badge-danger' : 'badge-neutral'">{{ a.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

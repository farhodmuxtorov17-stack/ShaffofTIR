<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Hisoblash vazifalari" : "Задачи расчёта" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "KPI hisoblash vazifalari" : "Задачи расчёта KPI" }}</p>
    </div>
    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th class="text-left px-4 py-2">ID</th><th class="text-left px-4 py-2">{{ isUz ? "Davr" : "Период" }}</th><th class="text-left px-4 py-2">{{ isUz ? "Holat" : "Статус" }}</th><th class="text-left px-4 py-2">{{ isUz ? "Vaqt" : "Время" }}</th></tr></thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 font-mono text-xs">{{ job.id }}</td>
            <td class="px-4 py-2">{{ job.period }}</td>
            <td class="px-4 py-2"><span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="job.status === 'DONE' ? 'bg-green-100 text-green-700' : job.status === 'RUNNING' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'">{{ job.status }}</span></td>
            <td class="px-4 py-2 text-xs text-gray-500">{{ job.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const isUz = computed(() => auth.user?.locale === 'uz')
const loading = ref(true)
const jobs = ref([
  { id: 'JOB-2026-031', period: 'Q3 2026', status: 'RUNNING', time: '30.07 11:00' },
  { id: 'JOB-2026-030', period: 'Q2 2026', status: 'DONE', time: '01.07 10:30' },
  { id: 'JOB-2026-029', period: 'Q1 2026', status: 'DONE', time: '01.04 10:15' },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

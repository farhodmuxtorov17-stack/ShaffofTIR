<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Baholash davrlari" : "Периоды оценки" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "KPI baholash davrlarini boshqarish" : "Управление периодами оценки KPI" }}</p>
    </div>
    <div class="space-y-3">
      <div v-for="period in periods" :key="period.id" class="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">{{ period.name }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="period.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : period.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'">{{ period.status }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ period.startDate }} - {{ period.endDate }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">{{ isUz ? "Xodimlar" : "Сотрудники" }}</div>
          <div class="text-sm font-medium text-gray-900">{{ period.employees }}</div>
        </div>
      </div>
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

const periods = ref([
  { id: 'P-2026-Q3', name: 'Q3 2026 (Июль-Сентябрь)', startDate: '01.07.2026', endDate: '30.09.2026', status: 'ACTIVE', employees: 24 },
  { id: 'P-2026-Q2', name: 'Q2 2026 (Апрель-Июнь)', startDate: '01.04.2026', endDate: '30.06.2026', status: 'CLOSED', employees: 22 },
  { id: 'P-2026-Q1', name: 'Q1 2026 (Январь-Март)', startDate: '01.01.2026', endDate: '31.03.2026', status: 'CLOSED', employees: 20 },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

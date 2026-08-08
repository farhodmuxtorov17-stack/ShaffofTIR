<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "KPI katalogi" : "Каталог KPI" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Samaradorlik ko'rsatkichlarini boshqarish" : "Управление показателями эффективности" }}</p>
    </div>

    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="kpi in kpiList" :key="kpi.id" class="card p-4 hover:shadow-md transition-shadow cursor-pointer" @click="selectedKpi = kpi">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ isUz ? kpi.name_uz : kpi.name_ru }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ kpi.code }}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium" :class="kpiCategoryColor(kpi.category)">{{ kpi.category }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">{{ isUz ? "Me\x02BByor" : "Норматив" }}: {{ kpi.target }}{{ kpi.unit }}</span>
          <span class="font-medium" :class="kpi.current >= kpi.target ? 'text-green-600' : 'text-red-600'">{{ kpi.current }}{{ kpi.unit }}</span>
        </div>
        <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-full rounded-full transition-all" :class="kpi.current >= kpi.target ? 'bg-green-500' : kpi.current >= kpi.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'" :style="{ width: Math.min(100, (kpi.current / kpi.target) * 100) + '%' }"></div>
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
const selectedKpi = ref<any>(null)

const kpiList = ref([
  { id: 'k1', code: 'KPI-01', name_ru: 'Точность стрельбы', name_uz: 'O\u02BBq otish aniqligi', category: 'STRELBA', target: 70, current: 68, unit: '%' },
  { id: 'k2', code: 'KPI-02', name_ru: 'Своевременность', name_uz: 'Vaqtida bajarish', category: 'PROCESS', target: 90, current: 85, unit: '%' },
  { id: 'k3', code: 'KPI-03', name_ru: 'Безопасность', name_uz: 'Xavfsizlik', category: 'SAFETY', target: 100, current: 100, unit: '%' },
  { id: 'k4', code: 'KPI-04', name_ru: 'Квалификация', name_uz: 'Malaka', category: 'TRAINING', target: 80, current: 72, unit: '%' },
  { id: 'k5', code: 'KPI-05', name_ru: 'Использование оружия', name_uz: 'Qurol foydalanish', category: 'STRELBA', target: 75, current: 65, unit: '%' },
  { id: 'k6', code: 'KPI-06', name_ru: 'Дисциплина', name_uz: 'Intizom', category: 'PROCESS', target: 95, current: 92, unit: '%' },
])

function kpiCategoryColor(cat: string) {
  const colors: Record<string, string> = { STRELBA: 'bg-blue-100 text-blue-700', SAFETY: 'bg-red-100 text-red-700', PROCESS: 'bg-purple-100 text-purple-700', TRAINING: 'bg-green-100 text-green-700' }
  return colors[cat] || 'bg-gray-100 text-gray-700'
}

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

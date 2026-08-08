<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Tashkiliy tuzilma" : "Организационная структура" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Respublika - Viloyat - Tuman - Bo\u02BBlinma" : "Республика - Регион - Район - Подразделение" }}</p>
    </div>

    <!-- Hierarchy Tree -->
    <div class="card p-4">
      <div class="space-y-1">
        <!-- Republic -->
        <div class="flex items-center gap-2 py-2 px-3 rounded-lg bg-green-50">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          <span class="font-medium text-sm text-gray-900">{{ isUz ? "O\u02BBzbekiston Respublikasi" : "Республика Узбекистан" }}</span>
          <span class="ml-auto text-xs text-gray-500">{{ isUz ? "24 xodim" : "24 сотрудника" }}</span>
        </div>
        <!-- Regions -->
        <div v-for="region in regions" :key="region.id" class="ml-6">
          <button @click="region.expanded = !region.expanded" class="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50">
            <svg class="w-3 h-3 text-gray-400 transition-transform" :class="region.expanded ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="w-2.5 h-2.5 rounded-full" :class="kpiColor(region.kpi)"></span>
            <span class="font-medium text-sm text-gray-700">{{ isUz ? region.name_uz : region.name_ru }}</span>
            <span class="ml-auto text-xs" :class="kpiTextColor(region.kpi)">{{ region.kpi }}%</span>
          </button>
          <!-- Districts -->
          <div v-if="region.expanded" class="ml-6">
            <div v-for="district in region.districts" :key="district.id" class="ml-4">
              <div class="flex items-center gap-2 py-1.5 px-3 rounded text-sm">
                <span class="w-2 h-2 rounded-full" :class="kpiColor(district.kpi)"></span>
                <span class="text-gray-600">{{ isUz ? district.name_uz : district.name_ru }}</span>
                <span class="ml-auto text-xs text-gray-400">{{ district.units }} {{ isUz ? "bo\u02BBlinma" : "подразд." }}</span>
              </div>
            </div>
          </div>
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

const regions = ref([
  { id: 'r1', name_ru: 'Ташкент', name_uz: 'Toshkent', kpi: 75, expanded: false, districts: [
    { id: 'd1', name_ru: 'Яшнабадский', name_uz: 'Yashnobod', units: 3, kpi: 78 },
    { id: 'd2', name_ru: 'Мирзо-Улугбекский', name_uz: 'Mirzo Ulug\u02BBbek', units: 2, kpi: 72 },
    { id: 'd3', name_ru: 'Сергелийский', name_uz: 'Sergeli', units: 2, kpi: 75 },
  ]},
  { id: 'r2', name_ru: 'Самарканд', name_uz: 'Samarqand', kpi: 68, expanded: false, districts: [
    { id: 'd4', name_ru: 'Самаркандский', name_uz: 'Samarqand', units: 4, kpi: 70 },
    { id: 'd5', name_ru: 'Булунгурский', name_uz: 'Bulung\u02BBur', units: 1, kpi: 62 },
  ]},
  { id: 'r3', name_ru: 'Андижан', name_uz: 'Andijon', kpi: 67, expanded: false, districts: [
    { id: 'd6', name_ru: 'Андижанский', name_uz: 'Andijon', units: 3, kpi: 69 },
    { id: 'd7', name_ru: 'Асакинский', name_uz: 'Asaka', units: 2, kpi: 64 },
  ]},
  { id: 'r4', name_ru: 'Каракалпакстан', name_uz: 'Qoraqalpog\u02BBiston', kpi: 63, expanded: false, districts: [
    { id: 'd8', name_ru: 'Нукусский', name_uz: 'Nukus', units: 2, kpi: 65 },
    { id: 'd9', name_ru: 'Чимбайский', name_uz: 'Chimboy', units: 1, kpi: 58 },
  ]},
])

function kpiColor(kpi: number) {
  if (kpi >= 70) return 'bg-green-500'
  if (kpi >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}
function kpiTextColor(kpi: number) {
  if (kpi >= 70) return 'text-green-600'
  if (kpi >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

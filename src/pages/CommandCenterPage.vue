<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in">

    <!-- TOP HEADER BAR -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Breadcrumb -->
          <button @click="goToRepublic" :class="view === 'republic' ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-green-600'" class="text-sm transition-colors">
            {{ isUz ? "Respublika" : "Республика" }}
          </button>
          <template v-if="selectedRegion">
            <span class="text-gray-300">/</span>
            <button @click="goToRegion(selectedRegion!)" :class="view === 'region' ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-green-600'" class="text-sm transition-colors">
              {{ isUz ? selectedRegion.short_uz : selectedRegion.short_ru }}
            </button>
          </template>
          <template v-if="selectedDistrict">
            <span class="text-gray-300">/</span>
            <span class="text-sm text-gray-900 font-bold">{{ isUz ? selectedDistrict.name_uz : selectedDistrict.name_ru }}</span>
          </template>
        </div>
        <!-- Republic KPI pills -->
        <div class="hidden md:flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            {{ republicTotals.totalEmployees }} {{ isUz ? "xodim" : "сотр." }}
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" :class="levelPill(republicLevel)">
            <span>KPI {{ republicTotals.avgScore }}</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            🎯 {{ republicTotals.sessionsThisMonth }} {{ isUz ? "sessiya" : "сессий" }}
          </div>
        </div>
      </div>
    </div>

    <!-- ============ REPUBLIC VIEW ============ -->
    <template v-if="view === 'republic'">
      <div class="flex flex-col lg:flex-row gap-0 h-[calc(100vh-120px)]">

        <!-- LEFT: Map panel -->
        <div class="lg:w-[55%] bg-white border-r border-gray-200 p-6 flex flex-col">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            {{ isUz ? "Xarita - KPI bo'yicha" : "Карта - по KPI" }}
          </h2>
          <div class="flex-1">
            <UzbekistanMap :selectedId="hoveredRegion" @select="goToRegion(getRegionById($event)!)" />
          </div>
        </div>

        <!-- RIGHT: Regions list -->
        <div class="lg:w-[45%] bg-white flex flex-col overflow-hidden">
          <!-- Summary strip -->
          <div class="grid grid-cols-3 border-b border-gray-100">
            <div class="px-5 py-4 border-r border-gray-100 text-center">
              <p class="text-2xl font-black text-gray-900">{{ republicTotals.totalEmployees }}</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{{ isUz ? "Jami" : "Всего сотр." }}</p>
            </div>
            <div class="px-5 py-4 border-r border-gray-100 text-center">
              <p class="text-2xl font-black" :class="levelText(republicLevel)">{{ republicTotals.avgScore }}</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{{ isUz ? "O'rt. KPI" : "Ср. KPI" }}</p>
            </div>
            <div class="px-5 py-4 text-center">
              <p class="text-2xl font-black text-gray-900">{{ qualifiedPercent }}%</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{{ isUz ? "Malakali" : "Квалиф." }}</p>
            </div>
          </div>

          <!-- Region rows -->
          <div class="overflow-y-auto flex-1">
            <div
              v-for="region in sortedRegions"
              :key="region.id"
              @click="goToRegion(region)"
              @mouseenter="hoveredRegion = region.id"
              @mouseleave="hoveredRegion = undefined"
              class="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 hover:bg-green-50 cursor-pointer transition-colors group"
            >
              <!-- Rank -->
              <div class="w-6 text-center">
                <span class="text-xs font-bold" :class="region.rank <= 3 ? 'text-green-600' : 'text-gray-300'">{{ region.rank }}</span>
              </div>

              <!-- Color bar -->
              <div class="w-1 h-10 rounded-full flex-shrink-0" :class="levelBar(getPerformanceLevel(region.avgScore))"></div>

              <!-- Name -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors truncate">
                  {{ isUz ? region.short_uz : region.short_ru }}
                </p>
                <p class="text-[11px] text-gray-400">{{ region.districts.length }} {{ isUz ? "tuman" : "р-нов" }} · {{ region.totalEmployees }} {{ isUz ? "xodim" : "сотр." }}</p>
              </div>

              <!-- KPI score -->
              <div class="text-right flex-shrink-0">
                <p class="text-lg font-black" :class="levelText(getPerformanceLevel(region.avgScore))">{{ region.avgScore }}</p>
                <p class="text-[10px] text-gray-400">KPI</p>
              </div>

              <!-- Mini bar -->
              <div class="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                <div class="h-full rounded-full" :class="levelBar(getPerformanceLevel(region.avgScore))" :style="{ width: region.avgScore + '%' }"></div>
              </div>

              <!-- Arrow -->
              <svg class="w-4 h-4 text-gray-200 group-hover:text-green-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ REGION VIEW ============ -->
    <template v-else-if="view === 'region' && selectedRegion">
      <div class="flex flex-col lg:flex-row gap-0 h-[calc(100vh-120px)]">

        <!-- LEFT: Region summary + visual -->
        <div class="lg:w-[38%] bg-white border-r border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="w-3 h-3 rounded-full" :class="levelDot(getPerformanceLevel(selectedRegion.avgScore))"></div>
              <h2 class="text-xl font-black text-gray-900">{{ isUz ? selectedRegion.name_uz : selectedRegion.name_ru }}</h2>
            </div>
            <p class="text-xs text-gray-400">{{ isUz ? "Viloyat ko'rsatkichlari" : "Показатели области" }}</p>
          </div>

          <!-- KPI blocks -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-gray-50 p-4 text-center">
              <p class="text-3xl font-black" :class="levelText(getPerformanceLevel(selectedRegion.avgScore))">{{ selectedRegion.avgScore }}</p>
              <p class="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">KPI</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-4 text-center">
              <p class="text-3xl font-black text-gray-900">{{ selectedRegion.totalEmployees }}</p>
              <p class="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{{ isUz ? "Xodim" : "Сотр." }}</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-4 text-center">
              <p class="text-3xl font-black text-gray-900">{{ selectedRegion.sessionsThisMonth }}</p>
              <p class="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{{ isUz ? "Sessiya" : "Сессий" }}</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-4 text-center">
              <p class="text-3xl font-black text-green-600">{{ Math.round(selectedRegion.qualifiedEmployees / selectedRegion.totalEmployees * 100) }}%</p>
              <p class="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{{ isUz ? "Malaka" : "Квалиф." }}</p>
            </div>
          </div>

          <!-- District score chart -->
          <div class="flex-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ isUz ? "Tumanlar reytingi" : "Рейтинг районов" }}</p>
            <div class="space-y-2">
              <div v-for="(d, i) in selectedRegion.districts.slice().sort((a,b) => b.avgScore - a.avgScore)" :key="d.id" class="flex items-center gap-3">
                <span class="text-xs text-gray-300 w-4 text-right">{{ i+1 }}</span>
                <div class="flex-1 h-6 rounded-lg bg-gray-100 overflow-hidden relative">
                  <div class="h-full rounded-lg transition-all" :class="levelBar(getPerformanceLevel(d.avgScore))" :style="{ width: d.avgScore + '%' }"></div>
                  <span class="absolute inset-y-0 left-2 flex items-center text-[11px] font-semibold text-white drop-shadow">{{ isUz ? d.name_uz : d.name_ru }}</span>
                </div>
                <span class="text-xs font-bold w-8 text-right" :class="levelText(getPerformanceLevel(d.avgScore))">{{ d.avgScore }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: District list -->
        <div class="lg:w-[62%] bg-white flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-700">{{ isUz ? "Tumanlar ro'yxati" : "Районы" }}</p>
            <span class="text-xs text-gray-400">{{ selectedRegion.districts.length }} {{ isUz ? "tuman" : "района" }}</span>
          </div>
          <div class="overflow-y-auto flex-1">
            <table class="w-full">
              <thead class="sticky top-0 bg-white border-b border-gray-100 z-10">
                <tr class="text-[11px] uppercase tracking-wider text-gray-400">
                  <th class="text-left px-6 py-3 font-medium">#</th>
                  <th class="text-left px-3 py-3 font-medium">{{ isUz ? "Tuman" : "Район" }}</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Xodim" : "Сотр." }}</th>
                  <th class="text-center px-3 py-3 font-medium">KPI</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Sessiya" : "Сессий" }}</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Holat" : "Статус" }}</th>
                  <th class="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="(d, i) in selectedRegion.districts"
                  :key="d.id"
                  @click="goToDistrict(d)"
                  class="hover:bg-green-50 cursor-pointer transition-colors group"
                >
                  <td class="px-6 py-4 text-xs text-gray-300 font-bold">{{ i+1 }}</td>
                  <td class="px-3 py-4">
                    <p class="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{{ isUz ? d.name_uz : d.name_ru }}</p>
                    <p class="text-[11px] text-gray-400">{{ d.units }} {{ isUz ? "bo'linma" : "подразд." }}</p>
                  </td>
                  <td class="px-3 py-4 text-center text-sm font-medium text-gray-700">{{ d.employees }}</td>
                  <td class="px-3 py-4 text-center">
                    <span class="text-base font-black" :class="levelText(getPerformanceLevel(d.avgScore))">{{ d.avgScore }}</span>
                  </td>
                  <td class="px-3 py-4 text-center text-sm text-gray-600">{{ d.sessionsThisMonth }}</td>
                  <td class="px-3 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="levelPill(getPerformanceLevel(d.avgScore))">
                      {{ getPerformanceLabel(getPerformanceLevel(d.avgScore), isUz) }}
                    </span>
                  </td>
                  <td class="px-3 py-4">
                    <svg class="w-4 h-4 text-gray-200 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ DISTRICT VIEW ============ -->
    <template v-else-if="view === 'district' && selectedRegion && selectedDistrict">
      <div class="p-6 space-y-5">
        <!-- District KPI Strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
            <p class="text-[11px] text-gray-400 uppercase tracking-wider">{{ isUz ? "Xodimlar" : "Сотрудники" }}</p>
            <p class="text-3xl font-black text-gray-900">{{ selectedDistrict.employees }}</p>
            <p class="text-xs text-gray-400">{{ selectedDistrict.qualified }} {{ isUz ? "malakali" : "квалиф." }}</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
            <p class="text-[11px] text-gray-400 uppercase tracking-wider">KPI {{ isUz ? "ball" : "балл" }}</p>
            <p class="text-3xl font-black" :class="levelText(getPerformanceLevel(selectedDistrict.avgScore))">{{ selectedDistrict.avgScore }}</p>
            <p class="text-xs" :class="levelText(getPerformanceLevel(selectedDistrict.avgScore))">{{ getPerformanceLabel(getPerformanceLevel(selectedDistrict.avgScore), isUz) }}</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
            <p class="text-[11px] text-gray-400 uppercase tracking-wider">{{ isUz ? "Bo'linmalar" : "Подразделений" }}</p>
            <p class="text-3xl font-black text-gray-900">{{ districtUnits.length }}</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
            <p class="text-[11px] text-gray-400 uppercase tracking-wider">{{ isUz ? "Sessiyalar" : "Сессий" }}</p>
            <p class="text-3xl font-black text-gray-900">{{ selectedDistrict.sessionsThisMonth }}</p>
          </div>
        </div>

        <!-- Units -->
        <div class="space-y-3">
          <div v-for="(unit, idx) in districtUnits" :key="idx" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              @click="toggleUnit(idx)"
            >
              <div class="flex items-center gap-3">
                <div class="w-2 h-8 rounded-full" :class="levelBar(getPerformanceLevel(unit.avgScore))"></div>
                <div class="text-left">
                  <p class="font-bold text-gray-800">{{ unit.unitTypeLabel }}</p>
                  <p class="text-xs text-gray-400">{{ unit.total }} {{ isUz ? "xodim" : "сотр." }} · {{ unit.qualified }} {{ isUz ? "malakali" : "квалиф." }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-xl font-black" :class="levelText(getPerformanceLevel(unit.avgScore))">{{ unit.avgScore }}</span>
                <svg class="w-5 h-5 text-gray-300 transition-transform duration-200" :class="{ 'rotate-180': expandedUnit === idx }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </button>
            <div v-if="expandedUnit === idx" class="border-t border-gray-100">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th class="text-left px-5 py-2.5">{{ isUz ? "F.I.O" : "Ф.И.О." }}</th>
                    <th class="text-left px-3 py-2.5">{{ isUz ? "Unvon" : "Звание" }}</th>
                    <th class="text-center px-3 py-2.5">{{ isUz ? "Sessiya" : "Сессий" }}</th>
                    <th class="text-center px-3 py-2.5">KPI</th>
                    <th class="text-center px-3 py-2.5">{{ isUz ? "Holat" : "Статус" }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="emp in unit.employees" :key="emp.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-3 font-semibold text-gray-800">{{ emp.name }}</td>
                    <td class="px-3 py-3 text-gray-500 text-xs">{{ emp.rank }}</td>
                    <td class="px-3 py-3 text-center text-gray-600">{{ emp.sessionsTotal }}</td>
                    <td class="px-3 py-3 text-center font-black text-base" :class="levelText(getPerformanceLevel(emp.avgScore))">{{ emp.avgScore }}</td>
                    <td class="px-3 py-3 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="emp.qualified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                        {{ emp.qualified ? (isUz ? "Malakali" : "Квалиф.") : (isUz ? "Malakasiz" : "Не квалиф.") }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import UzbekistanMap from '@/components/ui/UzbekistanMap.vue'
import { useI18n } from '@/i18n'
import { republicRegions, getPerformanceLevel, getPerformanceLabel, getRepublicTotals, type RegionData, type DistrictData } from '@/data/republicData'
import { getUnitsForDistrict } from '@/data/unitData'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const loading = ref(true)
const view = ref<'republic' | 'region' | 'district'>('republic')
const selectedRegion = ref<RegionData | null>(null)
const selectedDistrict = ref<DistrictData | null>(null)
const expandedUnit = ref<number | null>(null)
const hoveredRegion = ref<string | undefined>(undefined)

const regions = republicRegions
const republicTotals = getRepublicTotals()
const republicLevel = getPerformanceLevel(republicTotals.avgScore)
const qualifiedPercent = Math.round((republicTotals.qualifiedEmployees / republicTotals.totalEmployees) * 100)

const sortedRegions = computed(() =>
  [...regions].sort((a, b) => b.avgScore - a.avgScore).map((r, i) => ({ ...r, rank: i + 1 }))
)

const districtUnits = computed(() =>
  selectedDistrict.value ? getUnitsForDistrict(selectedDistrict.value.id, isUz.value) : []
)

function getRegionById(id: string) {
  return regions.find(r => r.id === id) || null
}

function goToRepublic() {
  view.value = 'republic'
  selectedRegion.value = null
  selectedDistrict.value = null
}

function goToRegion(region: RegionData | null) {
  if (!region) return
  selectedRegion.value = region
  selectedDistrict.value = null
  expandedUnit.value = null
  view.value = 'region'
}

function goToDistrict(district: DistrictData) {
  selectedDistrict.value = district
  expandedUnit.value = null
  view.value = 'district'
}

function toggleUnit(idx: number) {
  expandedUnit.value = expandedUnit.value === idx ? null : idx
}

// Style helpers
function levelText(level: 'green' | 'yellow' | 'red') {
  return { 'text-green-600': level === 'green', 'text-amber-500': level === 'yellow', 'text-red-500': level === 'red' }
}
function levelBar(level: 'green' | 'yellow' | 'red') {
  return { 'bg-green-500': level === 'green', 'bg-amber-400': level === 'yellow', 'bg-red-500': level === 'red' }
}
function levelDot(level: 'green' | 'yellow' | 'red') {
  return { 'bg-green-500': level === 'green', 'bg-amber-400': level === 'yellow', 'bg-red-500': level === 'red' }
}
function levelPill(level: 'green' | 'yellow' | 'red') {
  return {
    'bg-green-100 text-green-700': level === 'green',
    'bg-amber-100 text-amber-700': level === 'yellow',
    'bg-red-100 text-red-600': level === 'red',
  }
}

onMounted(() => { setTimeout(() => { loading.value = false }, 300) })
</script>

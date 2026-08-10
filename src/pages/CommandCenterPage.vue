<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in">

    <!-- TOP HEADER BAR -->
    <div class="px-6 py-4 bg-white border-b border-slate-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="goToRepublic" :class="view === 'republic' ? 'text-slate-800 font-bold' : 'text-slate-400 hover:text-indigo-500'" class="text-sm transition-colors">
            {{ isUz ? "Respublika" : "Республика" }}
          </button>
          <template v-if="selectedRegion">
            <span class="text-slate-300">/</span>
            <button @click="goToRegion(selectedRegion!)" :class="view === 'region' ? 'text-slate-800 font-bold' : 'text-slate-400 hover:text-indigo-500'" class="text-sm transition-colors">
              {{ isUz ? selectedRegion.short_uz : selectedRegion.short_ru }}
            </button>
          </template>
          <template v-if="selectedDistrict">
            <span class="text-slate-300">/</span>
            <span class="text-sm text-slate-800 font-bold">{{ isUz ? selectedDistrict.name_uz : selectedDistrict.name_ru }}</span>
          </template>
        </div>
        <div class="flex items-center gap-3">
          <!-- Toggle regions list button -->
          <button
            v-if="view === 'republic'"
            @click="showRegionsList = !showRegionsList"
            :class="showRegionsList ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
            class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            {{ isUz ? "Viloyatlar ro'yxati" : "По регионам" }}
          </button>
          <div class="hidden md:flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 text-xs font-medium text-blue-600 border border-blue-100/60">
              <span class="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500"></span>
              {{ republicTotals.totalEmployees }} {{ isUz ? "xodim" : "сотр." }}
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border" :class="levelPill(republicLevel)">
              <span>KPI {{ republicTotals.avgScore }}</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-xs font-medium text-indigo-600 border border-indigo-100/60">
              🎯 {{ republicTotals.sessionsThisMonth }} {{ isUz ? "sessiya" : "сессий" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ REPUBLIC VIEW (MAP FULL WIDTH) ============ -->
    <template v-if="view === 'republic' && !showRegionsList">
      <div class="flex flex-col h-[calc(100vh-120px)]">
        <!-- Summary stats -->
        <div class="grid grid-cols-4 border-b border-slate-100 bg-white">
          <div class="px-6 py-5 border-r border-slate-100 text-center">
            <p class="text-3xl font-black text-slate-800">{{ republicTotals.totalEmployees }}</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Jami xodim" : "Всего сотр." }}</p>
          </div>
          <div class="px-6 py-5 border-r border-slate-100 text-center">
            <p class="text-3xl font-black" :class="levelText(republicLevel)">{{ republicTotals.avgScore }}</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Oʻrt. KPI" : "Ср. KPI" }}</p>
          </div>
          <div class="px-6 py-5 border-r border-slate-100 text-center">
            <p class="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ qualifiedPercent }}%</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Malakali" : "Квалиф." }}</p>
          </div>
          <div class="px-6 py-5 text-center">
            <p class="text-3xl font-black text-slate-800">{{ republicTotals.sessionsThisMonth }}</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Sessiya" : "Сессий" }}</p>
          </div>
        </div>
        <!-- Full width map -->
        <div class="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
          <UzbekistanMap :selectedId="hoveredRegion" @select="goToRegion(getRegionById($event)!)" />
        </div>
      </div>
    </template>

    <!-- ============ REPUBLIC VIEW (REGIONS LIST) ============ -->
    <template v-if="view === 'republic' && showRegionsList">
      <div class="overflow-y-auto h-[calc(100vh-120px)] bg-white">
        <!-- Summary strip -->
        <div class="grid grid-cols-3 border-b border-slate-100">
          <div class="px-5 py-5 border-r border-slate-100 text-center">
            <p class="text-3xl font-black text-slate-800">{{ republicTotals.totalEmployees }}</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Jami" : "Всего сотр." }}</p>
          </div>
          <div class="px-5 py-5 border-r border-slate-100 text-center">
            <p class="text-3xl font-black" :class="levelText(republicLevel)">{{ republicTotals.avgScore }}</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Oʻrt. KPI" : "Ср. KPI" }}</p>
          </div>
          <div class="px-5 py-5 text-center">
            <p class="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ qualifiedPercent }}%</p>
            <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{{ isUz ? "Malakali" : "Квалиф." }}</p>
          </div>
        </div>
        <!-- Region rows -->
        <div
          v-for="region in sortedRegions" :key="region.id"
          @click="goToRegion(region)"
          @mouseenter="hoveredRegion = region.id"
          @mouseleave="hoveredRegion = undefined"
          class="flex items-center gap-4 px-5 py-4 border-b border-slate-50 hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-transparent cursor-pointer transition-all duration-300 group"
        >
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
            :class="region.rank <= 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200/50' : 'bg-slate-100 text-slate-400'">
            {{ region.rank }}
          </div>
          <div class="w-1 h-10 rounded-full flex-shrink-0 bg-gradient-to-b" :class="levelBarGrad(getPerformanceLevel(region.avgScore))"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">
              {{ isUz ? region.short_uz : region.short_ru }}
            </p>
            <p class="text-[11px] text-slate-400">{{ region.districts.length }} {{ isUz ? "tuman" : "р-нов" }} · {{ region.totalEmployees }} {{ isUz ? "xodim" : "сотр." }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xl font-black" :class="levelText(getPerformanceLevel(region.avgScore))">{{ region.avgScore }}</p>
            <p class="text-[10px] text-slate-400">KPI</p>
          </div>
          <div class="w-20 h-2 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
            <div class="h-full rounded-full bg-gradient-to-r transition-all duration-500" :class="levelBarGrad(getPerformanceLevel(region.avgScore))" :style="{ width: region.avgScore + '%' }"></div>
          </div>
          <svg class="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 flex-shrink-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </div>
    </template>

    <!-- ============ REGION VIEW (statistics + districts) ============ -->
    <template v-else-if="view === 'region' && selectedRegion">
      <div class="flex flex-col lg:flex-row gap-0 h-[calc(100vh-120px)]">

        <!-- LEFT: Region summary -->
        <div class="lg:w-[38%] border-r border-slate-100 p-6 flex flex-col gap-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="w-3 h-3 rounded-full shadow-sm" :class="levelDot(getPerformanceLevel(selectedRegion.avgScore))"></div>
              <h2 class="text-xl font-black text-slate-800">{{ isUz ? selectedRegion.name_uz : selectedRegion.name_ru }}</h2>
            </div>
            <p class="text-xs text-slate-400">{{ isUz ? "Viloyat koʻrsatkichlari" : "Показатели области" }}</p>
          </div>

          <!-- KPI blocks -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p class="text-3xl font-black" :class="levelText(getPerformanceLevel(selectedRegion.avgScore))">{{ selectedRegion.avgScore }}</p>
              <p class="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">KPI</p>
            </div>
            <div class="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p class="text-3xl font-black text-slate-800">{{ selectedRegion.totalEmployees }}</p>
              <p class="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">{{ isUz ? "Xodim" : "Сотр." }}</p>
            </div>
            <div class="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p class="text-3xl font-black text-slate-800">{{ selectedRegion.sessionsThisMonth }}</p>
              <p class="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">{{ isUz ? "Sessiya" : "Сессий" }}</p>
            </div>
            <div class="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p class="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ Math.round(selectedRegion.qualifiedEmployees / selectedRegion.totalEmployees * 100) }}%</p>
              <p class="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">{{ isUz ? "Malaka" : "Квалиф." }}</p>
            </div>
          </div>

          <!-- District score chart -->
          <div class="flex-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{{ isUz ? "Tumanlar reytingi" : "Рейтинг районов" }}</p>
            <div class="space-y-2.5">
              <div v-for="(d, i) in selectedRegion.districts.slice().sort((a,b) => b.avgScore - a.avgScore)" :key="d.id" class="flex items-center gap-3">
                <span class="text-xs text-slate-300 w-4 text-right font-bold">{{ i+1 }}</span>
                <div class="flex-1 h-8 rounded-lg bg-slate-100 overflow-hidden relative shadow-sm">
                  <div class="h-full rounded-lg bg-gradient-to-r transition-all duration-500" :class="levelBarGrad(getPerformanceLevel(d.avgScore))" :style="{ width: d.avgScore + '%' }"></div>
                  <span class="absolute inset-y-0 left-2 flex items-center text-[11px] font-semibold text-white drop-shadow">{{ isUz ? d.name_uz : d.name_ru }}</span>
                </div>
                <span class="text-xs font-bold w-8 text-right" :class="levelText(getPerformanceLevel(d.avgScore))">{{ d.avgScore }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: District list -->
        <div class="lg:w-[62%] flex flex-col overflow-hidden bg-white">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">{{ isUz ? "Tumanlar ro'yxati" : "Районы" }}</p>
            <span class="text-xs text-slate-400">{{ selectedRegion.districts.length }} {{ isUz ? "tuman" : "района" }}</span>
          </div>
          <div class="overflow-y-auto flex-1">
            <table class="w-full">
              <thead class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 z-10">
                <tr class="text-[11px] uppercase tracking-wider text-slate-400">
                  <th class="text-left px-6 py-3 font-medium">#</th>
                  <th class="text-left px-3 py-3 font-medium">{{ isUz ? "Tuman" : "Район" }}</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Xodim" : "Сотр." }}</th>
                  <th class="text-center px-3 py-3 font-medium">KPI</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Sessiya" : "Сессий" }}</th>
                  <th class="text-center px-3 py-3 font-medium">{{ isUz ? "Holat" : "Статус" }}</th>
                  <th class="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="(d, i) in selectedRegion.districts" :key="d.id"
                  @click="goToDistrict(d)"
                  class="hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-transparent cursor-pointer transition-all duration-200 group"
                >
                  <td class="px-6 py-4 text-xs text-slate-300 font-bold">{{ i+1 }}</td>
                  <td class="px-3 py-4">
                    <p class="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{{ isUz ? d.name_uz : d.name_ru }}</p>
                    <p class="text-[11px] text-slate-400">{{ d.units }} {{ isUz ? "bo'linma" : "подразд." }}</p>
                  </td>
                  <td class="px-3 py-4 text-center text-sm font-medium text-slate-600">{{ d.employees }}</td>
                  <td class="px-3 py-4 text-center">
                    <span class="text-base font-black" :class="levelText(getPerformanceLevel(d.avgScore))">{{ d.avgScore }}</span>
                  </td>
                  <td class="px-3 py-4 text-center text-sm text-slate-400">{{ d.sessionsThisMonth }}</td>
                  <td class="px-3 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="levelPill(getPerformanceLevel(d.avgScore))">
                      {{ getPerformanceLabel(getPerformanceLevel(d.avgScore), isUz) }}
                    </span>
                  </td>
                  <td class="px-3 py-4">
                    <svg class="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
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
      <div class="p-6 space-y-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-[calc(100vh-120px)]">
        <!-- District KPI Strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col gap-1 shadow-sm hover:shadow-lg transition-shadow">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider">{{ isUz ? "Xodimlar" : "Сотрудники" }}</p>
            <p class="text-3xl font-black text-slate-800">{{ selectedDistrict.employees }}</p>
            <p class="text-xs text-slate-400">{{ selectedDistrict.qualified }} {{ isUz ? "malakali" : "квалиф." }}</p>
          </div>
          <div class="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col gap-1 shadow-sm hover:shadow-lg transition-shadow">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider">KPI {{ isUz ? "ball" : "балл" }}</p>
            <p class="text-3xl font-black" :class="levelText(getPerformanceLevel(selectedDistrict.avgScore))">{{ selectedDistrict.avgScore }}</p>
            <p class="text-xs" :class="levelText(getPerformanceLevel(selectedDistrict.avgScore))">{{ getPerformanceLabel(getPerformanceLevel(selectedDistrict.avgScore), isUz) }}</p>
          </div>
          <div class="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col gap-1 shadow-sm hover:shadow-lg transition-shadow">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider">{{ isUz ? "Bo'linmalar" : "Подразделений" }}</p>
            <p class="text-3xl font-black text-slate-800">{{ districtUnits.length }}</p>
          </div>
          <div class="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col gap-1 shadow-sm hover:shadow-lg transition-shadow">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider">{{ isUz ? "Sessiyalar" : "Сессий" }}</p>
            <p class="text-3xl font-black text-slate-800">{{ selectedDistrict.sessionsThisMonth }}</p>
          </div>
        </div>

        <!-- Units -->
        <div class="space-y-3">
          <div v-for="(unit, idx) in districtUnits" :key="idx" class="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              class="w-full flex items-center justify-between px-5 py-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all"
              @click="toggleUnit(idx)"
            >
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-9 rounded-full bg-gradient-to-b" :class="levelBarGrad(getPerformanceLevel(unit.avgScore))"></div>
                <div class="text-left">
                  <p class="font-bold text-slate-800">{{ unit.unitTypeLabel }}</p>
                  <p class="text-xs text-slate-400">{{ unit.total }} {{ isUz ? "xodim" : "сотр." }} · {{ unit.qualified }} {{ isUz ? "malakali" : "квалиф." }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-2xl font-black" :class="levelText(getPerformanceLevel(unit.avgScore))">{{ unit.avgScore }}</span>
                <svg class="w-5 h-5 text-slate-300 transition-transform" :class="expandedUnit === idx ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </button>
            <div v-if="expandedUnit === idx" class="border-t border-slate-100">
              <table class="w-full">
                <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th class="text-left px-5 py-2.5">{{ isUz ? "F.I.O" : "Ф.И.О." }}</th>
                    <th class="text-left px-3 py-2.5">{{ isUz ? "Unvon" : "Звание" }}</th>
                    <th class="text-center px-3 py-2.5">{{ isUz ? "Sessiya" : "Сессий" }}</th>
                    <th class="text-center px-3 py-2.5">KPI</th>
                    <th class="text-center px-3 py-2.5">{{ isUz ? "Holat" : "Статус" }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="emp in unit.employees" :key="emp.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3 font-semibold text-slate-800">{{ emp.name }}</td>
                    <td class="px-3 py-3 text-slate-400 text-xs">{{ emp.rank }}</td>
                    <td class="px-3 py-3 text-center text-slate-400">{{ emp.sessionsTotal }}</td>
                    <td class="px-3 py-3 text-center font-black text-base" :class="levelText(getPerformanceLevel(emp.avgScore))">{{ emp.avgScore }}</td>
                    <td class="px-3 py-3 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="emp.qualified ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100/60' : 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 border border-rose-100/60'">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingState from '@/components/ui/LoadingState.vue'
import UzbekistanMap from '@/components/ui/UzbekistanMap.vue'
import { useI18n } from '@/i18n'
import { republicRegions, getPerformanceLevel, getPerformanceLabel, getRepublicTotals, type RegionData, type DistrictData } from '@/data/republicData'
import { getUnitsForDistrict } from '@/data/unitData'

const { locale } = useI18n()
const route = useRoute()
const isUz = computed(() => locale.value === 'uz')

const loading = ref(true)
const view = ref<'republic' | 'region' | 'district'>('republic')
const showRegionsList = ref(route.query.view === 'regions')

// Watch for query param changes (bottom tab navigation)
watch(() => route.query.view, (newView) => {
  if (newView === 'regions') {
    view.value = 'republic'
    showRegionsList.value = true
    selectedRegion.value = null
    selectedDistrict.value = null
    expandedUnit.value = null
  } else if (!newView) {
    view.value = 'republic'
    showRegionsList.value = false
    selectedRegion.value = null
    selectedDistrict.value = null
    expandedUnit.value = null
  }
})
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
  showRegionsList.value = false
  selectedRegion.value = null
  selectedDistrict.value = null
}

function goToRegion(region: RegionData | null) {
  if (!region) return
  showRegionsList.value = false
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

function levelText(level: 'green' | 'yellow' | 'red') {
  return {
    'bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent': level === 'green',
    'bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent': level === 'yellow',
    'bg-gradient-to-br from-rose-500 to-red-600 bg-clip-text text-transparent': level === 'red',
  }
}
function levelBarGrad(level: 'green' | 'yellow' | 'red') {
  return {
    'from-emerald-400 to-teal-500': level === 'green',
    'from-amber-400 to-orange-500': level === 'yellow',
    'from-rose-400 to-red-500': level === 'red',
  }
}
function levelDot(level: 'green' | 'yellow' | 'red') {
  return {
    'bg-gradient-to-br from-emerald-400 to-teal-500': level === 'green',
    'bg-gradient-to-br from-amber-400 to-orange-500': level === 'yellow',
    'bg-gradient-to-br from-rose-400 to-red-500': level === 'red',
  }
}
function levelPill(level: 'green' | 'yellow' | 'red') {
  return {
    'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100/60': level === 'green',
    'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-100/60': level === 'yellow',
    'bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 border-rose-100/60': level === 'red',
  }
}

onMounted(() => { setTimeout(() => { loading.value = false }, 300) })
</script>

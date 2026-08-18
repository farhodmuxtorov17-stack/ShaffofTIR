<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Building2, Users, ArrowRight, Shield, Target, TrendingUp, ChevronRight } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()

const departments = computed(() => masterStore.departments)
const employees = computed(() => masterStore.employees)

const totalEmployees = computed(() => departments.value.reduce((s, d) => s + d.employee_count, 0))
const activeEmployees = computed(() => employees.value.filter(e => e.status === 'ACTIVE').length)

// Color palette for department cards
const deptColors = [
  { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
  { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
  { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
  { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', text: 'text-rose-600', icon: 'bg-rose-100' },
  { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
]

function deptColor(idx: number) {
  return deptColors[idx % deptColors.length]
}

// Get stats per department
function deptStats(deptName: string) {
  const deptEmployees = employees.value.filter(e => e.department === deptName)
  const active = deptEmployees.filter(e => e.status === 'ACTIVE').length
  const qualified = deptEmployees.filter(e => e.shooting_qualified).length
  const avgAccuracy = deptEmployees.length > 0
    ? Math.round(deptEmployees.reduce((s, e) => s + e.avg_accuracy, 0) / deptEmployees.length)
    : 0
  return { count: deptEmployees.length, active, qualified, avgAccuracy }
}

const labels = computed(() => ({
  title: locale.value === 'uz' ? "Boʻlinmalar" : 'Подразделения',
  subtitle: locale.value === 'uz' ? "Tashkiliy tuzilma" : 'Организационная структура',
  departments: locale.value === 'uz' ? "Boʻlinmalar" : 'Подразделений',
  employees: locale.value === 'uz' ? "Xodimlar" : 'Сотрудников',
  active: locale.value === 'uz' ? "Faol xodimlar" : 'Активные',
  qualified: locale.value === 'uz' ? "Malakali" : 'Квалифицированы',
  head: locale.value === 'uz' ? "Boshliq" : 'Начальник',
  people: locale.value === 'uz' ? 'kishi' : 'чел.',
  avgAccuracy: locale.value === 'uz' ? "Oʻrtacha aniqlik" : 'Средняя точность',
  employeesInDept: locale.value === 'uz' ? "Xodimlar" : 'Сотрудники',
  activeShort: locale.value === 'uz' ? "Faol" : 'Активн.',
  qualifiedShort: locale.value === 'uz' ? "Malakali" : 'Квал.',
}))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ labels.title }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ labels.subtitle }}</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="labels.departments" :value="departments.length" :icon="Building2" accent="brand" />
      <KPICard :title="labels.employees" :value="totalEmployees" :icon="Users" accent="brand" />
      <KPICard :title="labels.active" :value="activeEmployees" :icon="Shield" accent="brand" />
      <KPICard :title="labels.qualified" :value="employees.filter(e => e.shooting_qualified).length" :icon="Target" accent="neutral" />
    </div>

    <!-- Department cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="(dept, idx) in departments" :key="dept.id"
        class="card overflow-hidden cursor-pointer group hover:shadow-xl hover:border-gray-300 transition-all duration-300"
        @click="router.push(`/hr/department/${dept.id}`)">

        <!-- Gradient header bar -->
        <div class="h-2 bg-gradient-to-r" :class="deptColor(idx).bg"></div>

        <div class="p-5">
          <!-- Top row: icon + code -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition"
              :class="deptColor(idx).icon">
              <Building2 class="w-6 h-6" :class="deptColor(idx).text" />
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono"
              :class="deptColor(idx).light + ' ' + deptColor(idx).text">
              {{ dept.code }}
            </span>
          </div>

          <!-- Department name -->
          <h3 class="text-base font-bold text-gray-900 mb-1">{{ dept.name }}</h3>
          <p class="text-xs text-gray-400 mb-4">{{ dept.description }}</p>

          <!-- Stats grid -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="text-center p-2 rounded-lg bg-gray-50">
              <p class="text-lg font-bold text-gray-800">{{ deptStats(dept.name).count }}</p>
              <p class="text-[9px] text-gray-400 font-medium">{{ labels.employeesInDept }}</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-emerald-50/50">
              <p class="text-lg font-bold text-emerald-600">{{ deptStats(dept.name).active }}</p>
              <p class="text-[9px] text-gray-400 font-medium">{{ labels.activeShort }}</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-blue-50/50">
              <p class="text-lg font-bold text-blue-600">{{ deptStats(dept.name).qualified }}</p>
              <p class="text-[9px] text-gray-400 font-medium">{{ labels.qualifiedShort }}</p>
            </div>
          </div>

          <!-- Accuracy bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] text-gray-400 flex items-center gap-1">
                <Target class="w-3 h-3" /> {{ labels.avgAccuracy }}
              </span>
              <span class="text-xs font-bold" :class="deptColor(idx).text">{{ deptStats(dept.name).avgAccuracy }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r transition-all duration-500 group-hover:w-full"
                :class="deptColor(idx).bg"
                :style="{ width: deptStats(dept.name).avgAccuracy + '%' }"></div>
            </div>
          </div>

          <!-- Footer: head + arrow -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-50">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center text-[10px] font-bold">
                {{ dept.head.charAt(0) }}
              </div>
              <div>
                <p class="text-[9px] text-gray-400">{{ labels.head }}</p>
                <p class="text-xs font-medium text-gray-700">{{ dept.head }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-xs text-gray-300">{{ dept.employee_count }} {{ labels.people }}</span>
              <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

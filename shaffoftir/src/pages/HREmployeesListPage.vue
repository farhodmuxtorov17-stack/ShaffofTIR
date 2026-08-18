<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { Search, UserPlus, Crosshair, Target, Check, X, Loader2, Database, ChevronRight, Filter, MapPin } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import type { HREmployee } from '@/types/extended'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const searchQuery = ref('')
const statusFilter = ref<'ALL' | 'ACTIVE' | 'RESERVE'>('ALL')
const regionFilter = ref('')
const battalionFilter = ref('')
const showAddModal = ref(false)

const hrSearchQuery = ref('')
const hrSearching = ref(false)
const hrResults = ref<HREmployee[]>([])
const selectedHrEmployee = ref<string | null>(null)

const hrSystemEmployees = ref<HREmployee[]>([
  { id: 'hr001', full_name: 'Абдуллаев Бахтиёр Комилович', rank: 'Капитан', position: 'Стрелок', department: '4-я рота', unit: 'Батальон "Ширин"', personal_number: 'AZ-2025-101', birth_date: '1991-03-12', phone: '+998911001122', email: 'abdullaev@mil.uz', face_id_registered: false, tb_test_passed: false, face_id_image_url: null, face_id_confidence: null, status: 'ACTIVE', hire_date: '2018-06-01', shooting_qualified: true, qualification_level: 'INTERMEDIATE', total_sessions: 0, total_score: 0, avg_accuracy: 0, last_shooting_date: null, created_at: '2024-01-01T00:00:00Z', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '4-я рота' },
  { id: 'hr002', full_name: 'Юлдашев Хуршид Алишерович', rank: 'Лейтенант', position: 'Командир отделения', department: '4-я рота', unit: 'Батальон "Ширин"', personal_number: 'AZ-2025-102', birth_date: '1994-07-18', phone: '+998911223344', email: 'yuldashev@mil.uz', face_id_registered: false, tb_test_passed: false, face_id_image_url: null, face_id_confidence: null, status: 'ACTIVE', hire_date: '2020-02-15', shooting_qualified: false, qualification_level: 'BEGINNER', total_sessions: 0, total_score: 0, avg_accuracy: 0, last_shooting_date: null, created_at: '2024-01-01T00:00:00Z', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '4-я рота' },
  { id: 'hr003', full_name: 'Назаров Дилшод Турапович', rank: 'Ст. сержант', position: 'Зам. командира взвода', department: '5-я рота', unit: 'Батальон "Ширин"', personal_number: 'AZ-2025-103', birth_date: '1989-11-22', phone: '+998911334455', email: 'nazarov@mil.uz', face_id_registered: false, tb_test_passed: false, face_id_image_url: null, face_id_confidence: null, status: 'ACTIVE', hire_date: '2011-09-01', shooting_qualified: true, qualification_level: 'EXPERT', total_sessions: 0, total_score: 0, avg_accuracy: 0, last_shooting_date: null, created_at: '2024-01-01T00:00:00Z', region: 'Самаркандская область', district: 'Самаркандский район', battalion: '5-я рота' },
])

const stats = computed(() => ({
  total: masterStore.employees.length,
  active: masterStore.employees.filter(e => e.status === 'ACTIVE').length,
  qualified: masterStore.employees.filter(e => e.shooting_qualified).length,
  experts: masterStore.employees.filter(e => e.qualification_level === 'EXPERT').length,
}))

const regions = computed(() => Array.from(new Set(masterStore.employees.map(e => e.region || '').filter(Boolean))))
const battalions = computed(() => Array.from(new Set(masterStore.employees.map(e => e.battalion || e.department || '').filter(Boolean))))

const filteredEmployees = computed(() => {
  return masterStore.employees.filter(e => {
    if (statusFilter.value !== 'ALL' && e.status !== statusFilter.value) return false
    if (regionFilter.value && e.region !== regionFilter.value) return false
    if (battalionFilter.value && (e.battalion || e.department) !== battalionFilter.value) return false
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()
    return e.full_name.toLowerCase().includes(q) ||
           e.personal_number.toLowerCase().includes(q) ||
           e.rank.toLowerCase().includes(q) ||
           e.department.toLowerCase().includes(q) ||
           (e.region || '').toLowerCase().includes(q) ||
           (e.district || '').toLowerCase().includes(q)
  })
})

function searchHrSystem() {
  hrSearching.value = true
  setTimeout(() => {
    hrResults.value = hrSystemEmployees.value.filter(e => {
      if (!hrSearchQuery.value) return true
      const q = hrSearchQuery.value.toLowerCase()
      return e.full_name.toLowerCase().includes(q) || e.personal_number.toLowerCase().includes(q)
    })
    hrSearching.value = false
  }, 600)
}

function openAddModal() {
  showAddModal.value = true
  hrSearchQuery.value = ''
  selectedHrEmployee.value = null
  hrResults.value = []
  searchHrSystem()
}

function selectHrEmployee(id: string) { selectedHrEmployee.value = id }

function addEmployee() {
  if (!selectedHrEmployee.value) return
  const emp = hrSystemEmployees.value.find(e => e.id === selectedHrEmployee.value)
  if (emp) {
    const newId = `e${String(masterStore.employees.length + 1).padStart(3, '0')}`
    masterStore.employees.push({ ...emp, id: newId })
    hrSystemEmployees.value = hrSystemEmployees.value.filter(e => e.id !== selectedHrEmployee.value)
    showAddModal.value = false
  }
}

const qualColors: Record<string, string> = {
  BEGINNER: 'bg-gray-100 text-gray-600',
  INTERMEDIATE: 'bg-blue-100 text-blue-600',
  ADVANCED: 'bg-brand-100 text-brand-600',
  EXPERT: 'bg-purple-100 text-purple-700',
}
const qualLabels = computed(() => ({
  BEGINNER: t('dashboard.beginner'),
  INTERMEDIATE: t('dashboard.intermediate'),
  ADVANCED: t('dashboard.advanced'),
  EXPERT: t('dashboard.expert'),
}))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ t('hr.employees') }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ t('hr.allEmployees') }}</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center gap-2">
        <UserPlus class="w-4 h-4" /> {{ t('hr.addEmployee') }}
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="t('hr.totalEmployees')" :value="stats.total" :subtitle="locale === 'uz' ? 'roy\u02bbhatda' : 'в реестре'" :icon="UserPlus" accent="neutral" />
      <KPICard :title="t('hr.activeEmployees')" :value="stats.active" :subtitle="locale === 'uz' ? 'ishlamoqda' : 'работают'" :icon="Check" accent="brand" />
      <KPICard :title="t('hr.qualification')" :value="stats.qualified" :subtitle="t('hr.readyToShoot')" :icon="Crosshair" accent="neutral" />
      <KPICard :title="t('hr.experts')" :value="stats.experts" :subtitle="locale === 'uz' ? 'eng yuqori' : 'наивысший'" :icon="Target" accent="brand" />
    </div>

    <!-- Search & Filters -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="searchQuery" type="text" :placeholder="isUz ? 'Ism, tuman, bo\\u02bblinma...' : 'Имя, район, подразделение...'"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
      </div>
      <select v-model="regionFilter" class="px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 bg-white">
        <option value="">{{ isUz ? "Viloyat" : "Регион" }}</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
      <select v-model="battalionFilter" class="px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 bg-white">
        <option value="">{{ isUz ? "Bo'linma" : "Подразделение" }}</option>
        <option v-for="b in battalions" :key="b" :value="b">{{ b }}</option>
      </select>
      <div class="flex items-center gap-1.5">
        <button v-for="s in ['ALL', 'ACTIVE', 'RESERVE']" :key="s"
          @click="statusFilter = s as any"
          class="px-3 py-2 rounded-xl text-xs font-medium transition"
          :class="statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'">
          {{ s === 'ALL' ? (isUz ? "Barcha" : "Все") : s === 'ACTIVE' ? (isUz ? "Faol" : "Актив") : (isUz ? "Rezerv" : "Резерв") }}
        </button>
      </div>
    </div>

    <!-- Count -->
    <p class="text-xs text-gray-400">{{ filteredEmployees.length }} {{ isUz ? "xodim" : "сотрудников" }}</p>

    <!-- Employee list - TABLE ONLY -->
    <div class="card p-0 overflow-hidden">
      <table class="premium-table">
        <thead>
          <tr>
            <th>{{ isUz ? "Xodim" : "Сотрудник" }}</th>
            <th>{{ isUz ? "Zvanja" : "Звание" }}</th>
            <th>{{ isUz ? "Bo'linma" : "Подразделение" }}</th>
            <th>{{ isUz ? "Viloyat" : "Регион" }}</th>
            <th>{{ isUz ? "Tuman" : "Район" }}</th>
            <th>{{ isUz ? "Malaka" : "Квалиф." }}</th>
            <th>{{ isUz ? "Sessiya" : "Сессии" }}</th>
            <th>{{ isUz ? "Aniqlik" : "Точность" }}</th>
            <th>{{ isUz ? "Ball" : "Балл" }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in filteredEmployees" :key="emp.id" @click="router.push(`/hr/employee/${emp.id}`)" class="cursor-pointer">
            <td>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {{ emp.full_name.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ emp.full_name }}</p>
                  <p class="text-[10px] text-gray-400">{{ emp.personal_number }}</p>
                </div>
              </div>
            </td>
            <td class="text-sm text-gray-600">{{ emp.rank }}</td>
            <td class="text-sm text-gray-600">{{ emp.department }}</td>
            <td class="text-xs text-gray-500">{{ emp.region || '-' }}</td>
            <td class="text-xs text-gray-500">{{ emp.district || '-' }}</td>
            <td>
              <span v-if="emp.qualification_level" class="badge" :class="qualColors[emp.qualification_level]">{{ qualLabels[emp.qualification_level] }}</span>
              <span v-else class="text-xs text-gray-300">-</span>
            </td>
            <td class="text-sm font-bold text-gray-800">{{ emp.total_sessions }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div class="h-full rounded-full bg-brand-500" :style="`width: ${emp.avg_accuracy}%`"></div>
                </div>
                <span class="text-xs font-bold text-gray-600">{{ emp.avg_accuracy }}%</span>
              </div>
            </td>
            <td class="text-sm font-bold text-brand-600">{{ emp.total_score }}</td>
            <td><ChevronRight class="w-4 h-4 text-gray-300" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="filteredEmployees.length === 0" class="text-center text-sm text-gray-400 py-12">
      {{ isUz ? "Xodimlar topilmadi" : "Сотрудники не найдены" }}
    </p>

    <!-- Add Employee Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Database class="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">{{ isUz ? "HR dan xodim qo\u02bbshish" : "Добавить из HR" }}</h2>
                  <p class="text-xs text-gray-400">{{ isUz ? "Xodimni qidirib qo\u02bbshing" : "Найдите и добавьте сотрудника" }}</p>
                </div>
              </div>
              <button @click="showAddModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <X class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div class="px-6 py-4 border-b border-gray-50">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input v-model="hrSearchQuery" @input="searchHrSystem" type="text" :placeholder="t('hr.searchInHR')"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="hrSearching" class="flex items-center justify-center py-12 text-gray-400">
                <Loader2 class="w-6 h-6 animate-spin" />
              </div>
              <div v-else-if="hrResults.length === 0" class="text-center py-12">
                <Database class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p class="text-sm text-gray-400">{{ isUz ? "Xodim topilmadi" : "Сотрудник не найден" }}</p>
              </div>
              <div v-else class="space-y-2">
                <div v-for="emp in hrResults" :key="emp.id" @click="selectHrEmployee(emp.id)"
                  class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
                  :class="selectedHrEmployee === emp.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {{ emp.full_name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ emp.full_name }}</p>
                    <p class="text-[10px] text-gray-400">{{ emp.rank }} · {{ emp.position }} · {{ emp.department }}</p>
                    <p class="text-[9px] text-gray-300 mt-0.5">{{ emp.personal_number }} · {{ emp.phone }} · {{ emp.region || '-' }}</p>
                  </div>
                  <div v-if="emp.qualification_level" class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="qualColors[emp.qualification_level]">
                    {{ qualLabels[emp.qualification_level] }}
                  </div>
                  <Check v-if="selectedHrEmployee === emp.id" class="w-5 h-5 text-brand-600" />
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button @click="showAddModal = false" class="btn-secondary">{{ t('common.cancel') }}</button>
              <button @click="addEmployee" :disabled="!selectedHrEmployee" class="btn-primary disabled:opacity-40">{{ t('hr.add') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useAuthStore } from '@/stores/auth'
import { Search, Target, Crosshair, Award, ChevronRight, Filter, X, Activity } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const authStore = useAuthStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const isEmployee = computed(() => authStore.user?.role === 'EMPLOYEE')

const searchQuery = ref('')
const scoreFilter = ref<'ALL' | 'HIGH' | 'MID' | 'LOW'>('ALL')
const showFilters = ref(false)

const filteredResults = computed(() => {
  let sessions = isEmployee.value
    ? historyStore.sessions.filter(s => {
        const userName = authStore.user?.full_name || ''
        const firstName = userName.split(' ')[0] || ''
        return s.employee_name.includes(firstName) || s.employee_name === userName
      })
    : historyStore.sessions

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    sessions = sessions.filter(s =>
      s.employee_name.toLowerCase().includes(q) ||
      s.weapon_name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    )
  }

  if (scoreFilter.value !== 'ALL') {
    sessions = sessions.filter(s => {
      if (scoreFilter.value === 'HIGH') return s.accuracy >= 80
      if (scoreFilter.value === 'MID') return s.accuracy >= 60 && s.accuracy < 80
      if (scoreFilter.value === 'LOW') return s.accuracy < 60
      return true
    })
  }

  return sessions
})

const totalSessions = computed(() => filteredResults.value.length)
const avgScore = computed(() => {
  if (!filteredResults.value.length) return 0
  return Math.round(filteredResults.value.reduce((sum, s) => sum + s.total_score, 0) / filteredResults.value.length)
})
const avgAccuracy = computed(() => {
  if (!filteredResults.value.length) return 0
  return Math.round(filteredResults.value.reduce((sum, s) => sum + s.accuracy, 0) / filteredResults.value.length)
})
const topScore = computed(() => {
  if (!filteredResults.value.length) return 0
  return Math.max(...filteredResults.value.map(s => s.total_score))
})

function openResult(id: string) { router.push(`/results/${id}`) }
function resetFilters() { searchQuery.value = ''; scoreFilter.value = 'ALL' }
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
          {{ isEmployee ? (isUz ? 'Natijalarim' : 'Мои результаты') : (isUz ? 'Otish natijalari' : 'Результаты стрельб') }}
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          {{ isEmployee ? (isUz ? 'Shaxsiy otish natijalari' : 'Личные результаты') : (isUz ? 'Barcha sessiya natijalari' : 'Результаты всех сессий') }}
        </p>
      </div>
      <button class="btn-ghost flex items-center gap-2" @click="showFilters = !showFilters">
        <Filter class="w-4 h-4" />
        {{ isUz ? 'Filtr' : 'Фильтр' }}
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami sessiya' : 'Всего сессий'" :value="totalSessions" :icon="Activity" accent="brand" />
      <KPICard :title="isUz ? 'O\u02bb rtacha ball' : 'Средний балл'" :value="avgScore" :icon="Target" accent="blue" />
      <KPICard :title="isUz ? 'O\u02bb rtacha aniqlik' : 'Средняя точность'" :value="avgAccuracy + '%'" :icon="Crosshair" accent="purple" />
      <KPICard :title="isUz ? 'Eng yuqori ball' : 'Макс. балл'" :value="topScore" :icon="Award" accent="amber" />
    </div>

    <div class="flex items-center gap-3">
      <div class="flex-1 relative">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input v-model="searchQuery" type="text" :placeholder="isUz ? 'Qidirish...' : 'Поиск...'" class="input pl-9" />
      </div>
      <div v-if="showFilters" class="flex items-center gap-2">
        <button
          v-for="f in ['ALL', 'HIGH', 'MID', 'LOW']"
          :key="f"
          @click="scoreFilter = f as any"
          class="px-3 py-2 rounded-btn text-xs font-bold transition-all"
          :class="scoreFilter === f ? 'bg-brand-600 text-white shadow-brand' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'"
        >
          {{ f === 'ALL' ? (isUz ? 'Barchasi' : 'Все') : f === 'HIGH' ? (isUz ? 'Yuqori' : 'Высокие') : f === 'MID' ? (isUz ? 'O\u02bb rtacha' : 'Средние') : (isUz ? 'Past' : 'Низкие') }}
        </button>
      </div>
    </div>

    <div class="card p-0 overflow-hidden" v-if="filteredResults.length > 0">
      <table class="premium-table">
        <thead>
          <tr>
            <th>{{ isUz ? 'Xodim' : 'Сотрудник' }}</th>
            <th>{{ isUz ? 'Qurol' : 'Оружие' }}</th>
            <th>{{ isUz ? 'Yo\u02bb lak' : 'Дорожка' }}</th>
            <th>{{ isUz ? 'O\u02bb qlar' : 'Выстрелы' }}</th>
            <th>{{ isUz ? 'Aniqlik' : 'Точность' }}</th>
            <th>{{ isUz ? 'Ball' : 'Балл' }}</th>
            <th>{{ isUz ? 'Sana' : 'Дата' }}</th>
            <th>{{ isUz ? 'Holat' : 'Статус' }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredResults" :key="record.id" @click="openResult(record.id)" class="cursor-pointer">
            <td>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0"
                  style="box-shadow: 0 2px 6px -1px rgba(22,163,74,0.3); inset 0 1px 0 0 rgba(255,255,255,0.2);">
                  {{ record.employee_name.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ record.employee_name }}</p>
                  <p class="text-[10px] text-gray-400">{{ record.employee_rank }}</p>
                </div>
              </div>
            </td>
            <td class="text-sm text-gray-600">{{ record.weapon_name }}</td>
            <td><span class="badge-neutral">#{{ record.lane_number }}</span></td>
            <td class="text-sm text-gray-600">{{ record.hit_count }}/{{ record.total_shots }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    :class="record.accuracy >= 80 ? 'bg-gradient-to-r from-brand-500 to-brand-600' : record.accuracy >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'"
                    :style="`width: ${record.accuracy}%`"></div>
                </div>
                <span class="text-xs font-bold" :class="record.accuracy >= 80 ? 'text-brand-600' : record.accuracy >= 60 ? 'text-amber-600' : 'text-red-500'">{{ record.accuracy }}%</span>
              </div>
            </td>
            <td class="text-sm font-bold text-gray-800">{{ record.total_score }}</td>
            <td class="text-xs text-gray-400">{{ new Date(record.created_at).toLocaleDateString('ru-RU') }}</td>
            <td>
              <span class="badge"
                :class="record.status === 'COMPLETED' ? 'badge-success' : record.status === 'REVIEWED' ? 'badge-neutral' : 'badge-warning'">
                {{ record.status === 'COMPLETED' ? (isUz ? 'Yakunlangan' : 'Завершён') : record.status === 'REVIEWED' ? (isUz ? 'Ko\u02bb rilgan' : 'Проверен') : (isUz ? 'Kutilmoqda' : 'Ожидает') }}
              </span>
            </td>
            <td><ChevronRight class="w-4 h-4 text-gray-300" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="card flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Target class="w-8 h-8 text-gray-300" />
      </div>
      <p class="text-sm font-bold text-gray-400">{{ isUz ? 'Natijalar topilmadi' : 'Результаты не найдены' }}</p>
      <p class="text-xs text-gray-300 mt-1">{{ isUz ? 'Filterlarni o\u02bb zgartirib ko\u02bb ring' : 'Измените фильтры' }}</p>
      <button v-if="searchQuery || scoreFilter !== 'ALL'" class="btn-ghost mt-4 text-xs" @click="resetFilters">
        <X class="w-3.5 h-3.5" /> {{ isUz ? 'Tozalash' : 'Сбросить' }}
      </button>
    </div>
  </div>
</template>

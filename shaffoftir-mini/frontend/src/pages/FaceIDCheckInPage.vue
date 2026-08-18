<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()

interface Employee {
  id: string
  full_name: string
  rank: string
  department: string
  personal_number: string
}

const employees = ref<Employee[]>([])
const selectedIds = ref<Set<string>>(new Set())
const search = ref('')
const loading = ref(false)
const checkInId = ref('')

const filtered = computed(() => {
  if (!search.value) return employees.value
  const q = search.value.toLowerCase()
  return employees.value.filter(e =>
    e.full_name.toLowerCase().includes(q) ||
    e.personal_number.toLowerCase().includes(q)
  )
})

const selectedCount = computed(() => selectedIds.value.size)

async function loadEmployees() {
  loading.value = true
  try {
    employees.value = await api.getEmployees()
  } catch (e: any) {
    toast.error(e.message || 'Ошибка загрузки сотрудников')
  } finally {
    loading.value = false
  }
}

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
}

async function createCheckIn() {
  if (selectedIds.value.size === 0) {
    toast.warning('Выберите хотя бы одного сотрудника')
    return
  }
  loading.value = true
  try {
    const res: any = await api.post('/face-checkins/create_group/', {
      range_id: null,
      employee_ids: Array.from(selectedIds.value),
    })
    checkInId.value = res.id
    toast.success(`Чекин создан: ${selectedIds.value.size} сотрудников идентифицировано`)
  } catch (e: any) {
    toast.error(e.message || 'Ошибка создания чекина')
  } finally {
    loading.value = false
  }
}

function goToQueue() {
  if (checkInId.value) router.push(`/queue/create?checkin=${checkInId.value}`)
}

loadEmployees()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">FaceID — Чекин группы</h1>
        <p class="text-slate-400 text-sm mt-1">Идентификация сотрудников для стрельбы</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="createCheckIn"
          :disabled="selectedCount === 0 || loading"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm"
        >
          Создать чекин ({{ selectedCount }})
        </button>
        <button
          v-if="checkInId"
          @click="goToQueue"
          class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
        >
          К очереди →
        </button>
      </div>
    </div>

    <div class="relative">
      <input
        v-model="search"
        type="text"
        placeholder="Поиск по имени или личному номеру..."
        class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div v-if="loading" class="text-center py-8 text-slate-400">Загрузка...</div>

    <div v-else class="grid gap-2">
      <div
        v-for="emp in filtered"
        :key="emp.id"
        @click="toggleSelect(emp.id)"
        :class="[
          'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition',
          selectedIds.has(emp.id)
            ? 'bg-blue-900/30 border-blue-500'
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
        ]"
      >
        <div :class="[
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          selectedIds.has(emp.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
        ]">
          <svg v-if="selectedIds.has(emp.id)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-sm">
          {{ emp.full_name.charAt(0) }}
        </div>
        <div class="flex-1">
          <div class="font-medium text-slate-100">{{ emp.full_name }}</div>
          <div class="text-xs text-slate-400">{{ emp.rank }} • {{ emp.department }} • {{ emp.personal_number }}</div>
        </div>
      </div>
    </div>

    <div v-if="filtered.length === 0 && !loading" class="text-center py-8 text-slate-400">
      Сотрудники не найдены
    </div>
  </div>
</template>

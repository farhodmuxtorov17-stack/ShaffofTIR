<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import type { ShotResponse } from '@/types'

const props = withDefaults(
  defineProps<{
    shots: ShotResponse[]
    showPagination?: boolean
    pageSize?: number
    readonly?: boolean
  }>(),
  {
    showPagination: false,
    pageSize: 10,
    readonly: false,
  }
)

// Sorting states
const sortBy = ref<'score' | 'x' | 'y' | null>(null)
const sortDesc = ref<boolean>(false)

// Pagination states
const currentPage = ref(1)

// Reset page when shots count changes
computed(() => {
  if (props.shots.length) {
    currentPage.value = 1
  }
})

const toggleSort = (field: 'score' | 'x' | 'y') => {
  if (sortBy.value === field) {
    if (!sortDesc.value) {
      sortDesc.value = true
    } else {
      sortBy.value = null
      sortDesc.value = false
    }
  } else {
    sortBy.value = field
    sortDesc.value = false
  }
  currentPage.value = 1
}

// Sorted list
const sortedShots = computed(() => {
  if (!sortBy.value) {
    return [...props.shots]
  }
  
  return [...props.shots].sort((a, b) => {
    const valA = a[sortBy.value!]
    const valB = b[sortBy.value!]
    
    if (valA < valB) return sortDesc.value ? 1 : -1
    if (valA > valB) return sortDesc.value ? -1 : 1
    return 0
  })
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(sortedShots.value.length / props.pageSize)
})

// Paginated list
const paginatedShots = computed(() => {
  if (!props.showPagination || sortedShots.value.length <= props.pageSize) {
    return sortedShots.value
  }
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedShots.value.slice(start, end)
})

const getScoreBadgeClass = (score: number) => {
  if (score === 10) return 'bg-brand-50 text-brand-700 border border-brand-200'
  if (score >= 7) return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (score >= 4) return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-red-50 text-red-700 border border-red-200'
}
</script>

<template>
  <div class="overflow-hidden border border-shell-border rounded-card bg-shell-surface shadow-card">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm text-gray-700">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500 font-semibold select-none">
          <tr>
            <th class="px-6 py-4 font-medium w-16">#</th>
            <th class="px-6 py-4 font-medium">Tur</th>
            <th class="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition" @click="toggleSort('x')">
              <div class="flex items-center gap-1">
                X (mm)
                <span class="text-gray-400">
                  <ChevronUp v-if="sortBy === 'x' && !sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronDown v-else-if="sortBy === 'x' && sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                </span>
              </div>
            </th>
            <th class="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition" @click="toggleSort('y')">
              <div class="flex items-center gap-1">
                Y (mm)
                <span class="text-gray-400">
                  <ChevronUp v-if="sortBy === 'y' && !sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronDown v-else-if="sortBy === 'y' && sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                </span>
              </div>
            </th>
            <th class="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition" @click="toggleSort('score')">
              <div class="flex items-center gap-1">
                Ball
                <span class="text-gray-400">
                  <ChevronUp v-if="sortBy === 'score' && !sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronDown v-else-if="sortBy === 'score' && sortDesc" class="w-4 h-4 text-brand-600" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-shell-border">
          <tr
            v-for="(shot, index) in paginatedShots"
            :key="shot.id"
            class="hover:bg-gray-50/50 transition duration-150"
          >
            <td class="px-6 py-4 font-mono text-gray-500">
              {{ showPagination ? (currentPage - 1) * pageSize + index + 1 : index + 1 }}
            </td>
            <td class="px-6 py-4 font-medium">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="shot.shot_type === 'TEST' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'"
              >
                {{ shot.shot_type }}
              </span>
            </td>
            <td class="px-6 py-4 font-mono text-gray-600">
              {{ shot.x.toFixed(1) }}
            </td>
            <td class="px-6 py-4 font-mono text-gray-600">
              {{ shot.y.toFixed(1) }}
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm" :class="getScoreBadgeClass(shot.score)">
                {{ shot.score }}
              </span>
            </td>
          </tr>
          <tr v-if="shots.length === 0">
            <td colspan="5" class="px-6 py-10 text-center text-gray-400">
              Ushbu urinish uchun o'qlar mavjud emas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="showPagination && totalPages > 1"
      class="flex items-center justify-between border-t border-shell-border px-6 py-4 bg-gray-50/30 select-none"
    >
      <span class="text-xs text-gray-500">
        Jami: <strong>{{ shots.length }}</strong> ta o'q. Sahifa: <strong>{{ currentPage }}</strong> / {{ totalPages }}
      </span>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary px-3 py-1.5 text-xs font-medium rounded-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Oldingi
        </button>
        <button
          type="button"
          class="btn-secondary px-3 py-1.5 text-xs font-medium rounded-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Keyingi
        </button>
      </div>
    </div>
  </div>
</template>

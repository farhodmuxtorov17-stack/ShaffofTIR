<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import type { SessionStatus } from '@/types'

const props = defineProps<{
  currentStatus: SessionStatus
}>()

// Simplified to 7 key phases - more elegant and readable
const steps = [
  { status: 'IDLE', label: 'Boshlang\'ich', labelRu: 'Начало' },
  { status: 'SESSION_CREATED', label: 'Ochilgan', labelRu: 'Открыта' },
  { status: 'TEST_READY', label: 'Sinov', labelRu: 'Пробные' },
  { status: 'TEST_COMPLETED', label: 'Sinov Yakun', labelRu: 'Пробные ✓' },
  { status: 'MAIN_READY', label: 'Asosiy', labelRu: 'Основные' },
  { status: 'MAIN_COMPLETED', label: 'Yakun', labelRu: 'Завершение' },
  { status: 'APPROVED', label: 'Tasdiq', labelRu: 'Утверждён' },
] as const

// Map raw statuses to simplified steps
const statusMap: Record<string, string> = {
  IDLE: 'IDLE',
  SESSION_CREATED: 'SESSION_CREATED',
  TEST_READY: 'TEST_READY',
  TEST_ACTIVE: 'TEST_READY',
  TEST_PROCESSING: 'TEST_READY',
  TEST_COMPLETED: 'TEST_COMPLETED',
  MAIN_READY: 'MAIN_READY',
  MAIN_ACTIVE: 'MAIN_READY',
  MAIN_PROCESSING: 'MAIN_READY',
  MAIN_COMPLETED: 'MAIN_COMPLETED',
  REVIEW: 'MAIN_COMPLETED',
  APPROVED: 'APPROVED',
  ARCHIVED: 'APPROVED',
}

const mappedStatus = computed(() => statusMap[props.currentStatus] || props.currentStatus)
const currentIndex = computed(() => {
  const idx = steps.findIndex(s => s.status === mappedStatus.value)
  return idx >= 0 ? idx : 0
})
</script>

<template>
  <div class="w-full bg-white rounded-xl border border-gray-200/60 p-5 overflow-x-auto">
    <div class="flex items-center min-w-[700px] justify-between relative select-none px-2 py-3">
      <!-- Background line -->
      <div class="absolute top-[22px] left-[24px] right-[24px] h-0.5 bg-gray-100 z-0 rounded-full" />
      
      <!-- Progress fill -->
      <div
        class="absolute top-[22px] left-[24px] h-0.5 z-0 transition-all duration-500 rounded-full"
        :style="{
          width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - ${currentIndex === 0 ? 0 : 48}px)`,
          background: '#16a34a'
        }"
      />

      <!-- Steps -->
      <div
        v-for="(step, index) in steps"
        :key="step.status"
        class="flex flex-col items-center flex-1 relative z-10"
      >
        <!-- Step circle -->
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2"
          :class="[
            index < currentIndex
              ? 'border-[#16a34a] bg-[#16a34a] text-white'
              : index === currentIndex
              ? 'border-[#16a34a] bg-white text-[#16a34a] ring-4 ring-[#f0fdf4]'
              : 'border-gray-200 bg-white text-gray-400'
          ]"
        >
          <Check v-if="index < currentIndex" class="w-4 h-4 stroke-[3]" />
          <span v-else-if="index === currentIndex" class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
          </span>
          <span v-else>{{ index + 1 }}</span>
        </div>

        <!-- Label -->
        <div class="mt-2 text-center px-1">
          <p
            class="text-[11px] font-semibold transition-colors duration-200"
            :class="[
              index <= currentIndex ? 'text-gray-800' : 'text-gray-400'
            ]"
          >
            {{ step.label }}
          </p>
          <p
            v-if="index === currentIndex"
            class="text-[9px] text-[#16a34a] font-semibold bg-[#f0fdf4] px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
          >
            Joriy
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

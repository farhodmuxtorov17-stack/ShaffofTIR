<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Calendar, Clock, Plus } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const schedules = computed(() => masterStore.schedules)
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Tir jadvali' : 'Расписание тира' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Yoʻlaklar va vaqt band qilish" : 'Бронирование дорожек и времени' }}</p>
      </div>
      <button class="btn-primary text-xs">
        <Plus class="w-3.5 h-3.5" /> {{ isUz ? 'Slot qo\u02bb shish' : 'Добавить слот' }}
      </button>
    </div>

    <div class="card">
      <div class="flex items-center gap-2 mb-4">
        <Calendar class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Bugun va ertaga" : 'На сегодня и завтра' }}</h2>
      </div>

      <div class="space-y-3">
        <div v-for="sched in schedules" :key="sched.id"
          class="flex items-start gap-4 p-4 rounded-xl border transition hover:shadow-sm"
          :class="sched.status === 'IN_PROGRESS' ? 'border-brand-200 bg-brand-50/30' : 'border-shell-border bg-white'">
          <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gray-50 shrink-0">
            <span class="text-lg font-bold text-gray-800">{{ sched.date.split('-')[2] }}</span>
            <span class="text-[10px] text-gray-400">{{ sched.date.split('-')[1] }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Clock class="w-3.5 h-3.5 text-gray-400" />
                <span class="text-sm font-semibold text-gray-800">{{ sched.time_slot }}</span>
              </div>
              <StatusBadge :status="sched.status" />
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span class="text-gray-400">{{ isUz ? "Bo\u02bb linma:" : 'Подразделение:' }}</span>
                <span class="text-gray-700 font-medium">{{ sched.department }}</span>
              </div>
              <div>
                <span class="text-gray-400">{{ isUz ? "Instruktor:" : 'Инструктор:' }}</span>
                <span class="text-gray-700">{{ sched.instructor_name }}</span>
              </div>
              <div>
                <span class="text-gray-400">{{ isUz ? "Yoʻlaklar:" : 'Дорожки:' }}</span>
                <span class="text-gray-700">{{ sched.lane_numbers.join(', ') }}</span>
              </div>
              <div>
                <span class="text-gray-400">{{ isUz ? "Xodimlar:" : 'Сотрудников:' }}</span>
                <span class="text-gray-700">{{ sched.employee_count }}</span>
              </div>
            </div>
            <div v-if="sched.notes" class="mt-2 text-xs text-gray-400 italic">📝 {{ sched.notes }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

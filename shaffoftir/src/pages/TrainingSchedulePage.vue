<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { Calendar, Plus, Clock } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const schedules = computed(() => masterStore.schedules)
const viewDate = ref(new Date().toISOString().split('T')[0])
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div><h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Mashgʻulot jadvali' : 'Расписание тренировок' }}</h1><p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Vaqt va yoʻlaklarni belgilash' : 'Назначение времени и дорожек' }}</p></div>
      <button class="btn-primary text-xs"><Plus class="w-3.5 h-3.5" /> {{ isUz ? 'Qoʻshish' : 'Добавить' }}</button>
    </div>
    <div class="card flex items-center gap-3">
      <Calendar class="w-4 h-4 text-gray-400" />
      <input v-model="viewDate" type="date" class="input text-sm w-48" />
    </div>
    <div class="space-y-3">
      <div v-for="s in schedules" :key="s.id" class="card flex items-start gap-4">
        <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gray-50 shrink-0">
          <span class="text-lg font-bold text-gray-800">{{ s.date.split('-')[2] }}</span>
          <span class="text-[10px] text-gray-400">{{ ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][Number(s.date.split('-')[1]) - 1] }}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2"><Clock class="w-3.5 h-3.5 text-gray-400" /><span class="text-sm font-semibold text-gray-800">{{ s.time_slot }}</span></div>
            <StatusBadge :status="s.status" />
          </div>
          <p class="text-xs text-gray-600">{{ s.department }} · {{ s.instructor_name }} · {{ s.employee_count }} {{ isUz ? 'kishi' : 'чел.' }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ isUz ? 'Yoʻlaklar:' : 'Дорожки:' }} {{ s.lane_numbers.join(', ') }} · {{ s.weapon_categories.join(', ') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

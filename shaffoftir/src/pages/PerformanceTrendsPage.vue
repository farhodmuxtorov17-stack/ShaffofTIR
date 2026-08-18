<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { TrendingUp, BarChart3, Target, Award } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'

const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const monthlyTrends = [
  { month: 'Янв', sessions: 15, avgScore: 65 },
  { month: 'Фев', sessions: 22, avgScore: 68 },
  { month: 'Мар', sessions: 18, avgScore: 70 },
  { month: 'Апр', sessions: 25, avgScore: 72 },
  { month: 'Май', sessions: 20, avgScore: 71 },
  { month: 'Июн', sessions: 28, avgScore: 74 },
  { month: 'Июл', sessions: 30, avgScore: 76 },
]

const maxScore = Math.max(...monthlyTrends.map(t => t.avgScore))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Samaradorlik tendensiyalari' : 'Тренды производительности' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Oylik natijalar dinamikasi' : 'Динамика результатов по месяцам' }}</p>
    </div>
    <div class="card">
      <div class="flex items-center gap-2 mb-4"><TrendingUp class="w-4 h-4 text-gray-500" /><h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Oylik oʻrtacha ball' : 'Средний балл по месяцам' }}</h2></div>
      <div class="flex items-end justify-between gap-2 h-48 px-4">
        <div v-for="t in monthlyTrends" :key="t.month" class="flex-1 flex flex-col items-center gap-1">
          <div class="text-xs font-bold text-gray-700">{{ t.avgScore }}</div>
          <div class="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 hover:opacity-80 transition" :style="`height: ${(t.avgScore / maxScore) * 100}%; min-height: 8px;`"></div>
          <div class="text-[10px] text-gray-400">{{ t.month }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="flex items-center gap-2 mb-4"><BarChart3 class="w-4 h-4 text-gray-500" /><h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Sessiyalar soni' : 'Количество сессий' }}</h2></div>
      <div class="flex items-end justify-between gap-2 h-32 px-4">
        <div v-for="t in monthlyTrends" :key="t.month" class="flex-1 flex flex-col items-center gap-1">
          <div class="text-xs font-bold text-gray-700">{{ t.sessions }}</div>
          <div class="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 hover:opacity-80 transition" :style="`height: ${(t.sessions / 30) * 100}%; min-height: 8px;`"></div>
          <div class="text-[10px] text-gray-400">{{ t.month }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Harakat rejalari" : "Планы действий" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Avtomatik tavsiyalarga asoslangan rejalaringiz" : "Планы на основе авто-рекомендаций" }}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="plan in plans" :key="plan.id" class="card p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">{{ isUz ? plan.title_uz : plan.title_ru }}</h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">{{ plan.status }}</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">{{ isUz ? plan.desc_uz : plan.desc_ru }}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">{{ isUz ? "Muddat" : "Срок" }}: {{ plan.deadline }}</span>
          <span class="font-medium text-gray-700">{{ plan.progress }}%</span>
        </div>
        <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-full bg-green-500 rounded-full" :style="{ width: plan.progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isUz = computed(() => auth.user?.locale === 'uz')
const loading = ref(true)

const plans = ref([
  { id: 1, title_ru: 'Дополнительная тренировка 300м', title_uz: 'Qo\u02BBshimcha mashq 300m', desc_ru: 'Для сотрудников с точностью ниже 65% на 300м', desc_uz: '300m da aniqlik 65% dan past xodimlar uchun', deadline: '15.08.2026', progress: 40, status: 'ACTIVE' },
  { id: 2, title_ru: 'ТО оружия АКС-74У', title_uz: 'AKS-74U qurol TO', desc_ru: 'Техническое обслуживание и проверка', desc_uz: 'Texnik xizmat va tekshiruv', deadline: '05.08.2026', progress: 70, status: 'ACTIVE' },
  { id: 3, title_ru: 'Повторный ТБ-тест', title_uz: 'Qayta TB testi', desc_ru: 'Для сотрудников, не прошедших ТБ-тест', desc_uz: 'TB testidan o\u02BBtmagan xodimlar uchun', deadline: '10.08.2026', progress: 0, status: 'ACTIVE' },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

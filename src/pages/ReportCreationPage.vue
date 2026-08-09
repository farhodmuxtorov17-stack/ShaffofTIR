<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Hisobot yaratish" : "Создание отчёта" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Yangi hisobot yarating va eksport qiling" : "Создайте и экспортируйте новый отчёт" }}</p>
    </div>
    <div class="card p-6 max-w-2xl space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Hisobot turi" : "Тип отчёта" }}</label>
        <select v-model="reportType" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500">
          <option value="summary">{{ isUz ? "Umumiy hisobot" : "Сводный отчёт" }}</option>
          <option value="individual">{{ isUz ? "Shaxsiy hisobot" : "Индивидуальный отчёт" }}</option>
          <option value="regional">{{ isUz ? "Viloyat bo\u02BByicha" : "Региональный отчёт" }}</option>
          <option value="kpi">KPI {{ isUz ? "hisoboti" : "отчёт" }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Boshlanish" : "Дата с" }}</label>
          <input type="date" v-model="dateFrom" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Tugash" : "Дата по" }}</label>
          <input type="date" v-model="dateTo" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
        </div>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Format" : "Формат" }}</label>
        <div class="flex gap-3">
          <button v-for="fmt in ['PDF', 'Excel', 'CSV']" :key="fmt" @click="format = fmt" class="px-4 py-2 text-sm rounded-lg border transition-colors" :class="format === fmt ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'">{{ fmt }}</button>
        </div>
      </div>
      <button @click="generate" :disabled="generating" class="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
        {{ generating ? (isUz ? "Yaratilmoqda..." : "Создание...") : (isUz ? "Hisobot yaratish" : "Создать отчёт") }}
      </button>
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
const reportType = ref('summary')
const dateFrom = ref('2026-07-01')
const dateTo = ref('2026-07-30')
const format = ref('PDF')
const generating = ref(false)

function generate() {
  generating.value = true
  setTimeout(() => { generating.value = false }, 1500)
}
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "KPI mukarriri" : "Редактор KPI" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "KPI koʻrsatkichlarini tahrirlash" : "Редактирование показателей KPI" }}</p>
    </div>
    <div class="card p-6 max-w-2xl space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "KPI nomi" : "Название KPI" }}</label>
        <input v-model="kpi.name" type="text" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Me\u02BByor" : "Норматив" }}</label>
          <input v-model="kpi.target" type="number" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Birlik" : "Единица" }}</label>
          <select v-model="kpi.unit" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"><option value="%">%</option><option value="ball">балл</option><option value="count">шт</option></select>
        </div>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">{{ isUz ? "Kategoriya" : "Категория" }}</label>
        <select v-model="kpi.category" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"><option value="STRELBA">{{ isUz ? "Strelba" : "Стрельба" }}</option><option value="SAFETY">{{ isUz ? "Xavfsizlik" : "Безопасность" }}</option><option value="TRAINING">{{ isUz ? "O\u02BBqitish" : "Обучение" }}</option><option value="PROCESS">{{ isUz ? "Jarayon" : "Процесс" }}</option></select>
      </div>
      <button class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">{{ isUz ? "Saqlash" : "Сохранить" }}</button>
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
const kpi = ref({ name: 'Точность стрельбы', target: 70, unit: '%', category: 'STRELBA' })
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

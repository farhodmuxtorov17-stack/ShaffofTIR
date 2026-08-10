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
      <button class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"><Save class="w-4 h-4" />{{ isUz ? "Saqlash" : "Сохранить" }}</button>
    </div>

    <!-- KPI List -->
    <div class="card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "KPI ro'yxati" : "Список KPI" }}</h2>
        <button class="text-xs text-green-600 hover:underline flex items-center gap-1"><Plus class="w-3.5 h-3.5" /> {{ isUz ? "Qo'shish" : "Добавить" }}</button>
      </div>
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-gray-100 text-gray-500"><tr>
          <th class="px-4 py-3 font-medium">{{ isUz ? "Nomi" : "Название" }}</th>
          <th class="px-4 py-3 font-medium">{{ isUz ? "Kategoriya" : "Категория" }}</th>
          <th class="px-4 py-3 font-medium">{{ isUz ? "Me'yori" : "Норматив" }}</th>
          <th class="px-4 py-3 font-medium">{{ isUz ? "Joriy" : "Текущий" }}</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="k in kpiList" :key="k.id" class="hover:bg-gray-50/50 cursor-pointer transition" @click="selectKpi(k)">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <component :is="categoryIcons[k.category || 'STRELBA']" class="w-3.5 h-3.5 text-gray-400" />
                <span class="text-sm font-medium text-gray-800">{{ k.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ k.category }}</td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ k.target }} {{ k.unit }}</td>
            <td class="px-4 py-3">
              <span class="text-xs font-bold" :class="k.current >= k.target ? 'text-emerald-600' : 'text-amber-600'">{{ k.current }} {{ k.unit }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full" :class="k.current >= k.target ? 'bg-emerald-500' : 'bg-amber-500'" :style="{ width: Math.min(100, (k.current / k.target) * 100) + '%' }"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'
import { Save, Plus, Trash2, Target, Shield, BookOpen, Activity } from 'lucide-vue-next'
const auth = useAuthStore()
const isUz = computed(() => auth.user?.locale === 'uz')
const loading = ref(true)
const kpi = ref({ name: 'Точность стрельбы', target: 70, unit: '%', category: 'STRELBA' })

const kpiList = ref([
  { id: 1, name: 'Точность стрельбы', target: 70, unit: '%', category: 'STRELBA', current: 74 },
  { id: 2, name: 'Скоростная стрельба', target: 65, unit: '%', current: 61 },
  { id: 3, name: 'ТБ-тест сдан', target: 100, unit: '%', current: 92 },
  { id: 4, name: 'Квалификация', target: 80, unit: '%', current: 85 },
  { id: 5, name: 'Средний балл', target: 75, unit: 'балл', current: 78 },
  { id: 6, name: 'Процент сдачи', target: 70, unit: '%', current: 68 },
  { id: 7, name: 'Время реакции', target: 3, unit: 'сек', current: 2.8 },
  { id: 8, name: 'Посещаемость тренировок', target: 90, unit: '%', current: 87 },
])

const categoryIcons: Record<string, any> = { STRELBA: Target, SAFETY: Shield, TRAINING: BookOpen, PROCESS: Activity }

function selectKpi(k: any) {
  kpi.value = { name: k.name, target: k.target, unit: k.unit, category: k.category }
}
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

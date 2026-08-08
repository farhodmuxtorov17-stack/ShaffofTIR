<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "E\x02BBtirozlar" : "Возражения" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Natijalarga qo\x02BByilgan e\x02BBtirozlar" : "Возражения по результатам стрельб" }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="card p-4">
        <div class="text-xs text-gray-500">{{ isUz ? "Jami e\x02BBtirozlar" : "Всего возражений" }}</div>
        <div class="text-2xl font-bold text-gray-900">{{ objections.length }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500">{{ isUz ? "Ko\x02BBrib chiqilmoqda" : "На рассмотрении" }}</div>
        <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500">{{ isUz ? "Hal qilingan" : "Решено" }}</div>
        <div class="text-2xl font-bold text-green-600">{{ resolvedCount }}</div>
      </div>
    </div>

    <div class="space-y-3">
      <div v-for="obj in objections" :key="obj.id" class="card p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-900">{{ obj.employee_name }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusColor(obj.status)">{{ statusLabel(obj.status) }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ obj.session_id }} · {{ obj.date }}</div>
            <div class="text-sm text-gray-600 mt-2">{{ isUz ? obj.reason_uz : obj.reason_ru }}</div>
          </div>
          <button v-if="obj.status === 'PENDING'" @click="resolveObjection(obj)" class="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 border border-green-200 rounded-lg">{{ isUz ? "Hal qilish" : "Решить" }}</button>
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

const objections = ref([
  { id: 'OB-008', employee_name: 'Каримов А.У.', session_id: 'S-2026-052', date: '28.07.2026', status: 'PENDING', reason_ru: 'Несогласие с результатом 3-го выстрела - счётчик показал попадание, но результат не засчитан', reason_uz: '3-otish natijasiga rozilik - hisoblagich tasodifni qayd etgan, lekin natija hisoblanmagan' },
  { id: 'OB-007', employee_name: 'Алиев Б.У.', session_id: 'S-2026-049', date: '27.07.2026', status: 'RESOLVED', reason_ru: 'Камера 4 не зафиксировала выстрел, результат восстановлен по резервной камере', reason_uz: '4-kamera otishni qayd etmadi, natija zaxira kamera bo\x02BByicha tiklandi' },
  { id: 'OB-006', employee_name: 'Хасанов О.Р.', session_id: 'S-2026-045', date: '25.07.2026', status: 'PENDING', reason_ru: 'ТБ-тест пройден, но система не допустила к полигону', reason_uz: 'TB testidan o\x02BBtgan, lekin tizim poligonga kirmadi' },
  { id: 'OB-005', employee_name: 'Юлдашев Д.А.', session_id: 'S-2026-040', date: '23.07.2026', status: 'RESOLVED', reason_ru: 'Оружие дало осечку, прошу пересмотр результатов', reason_uz: 'Qurol o\x02BBt olmadi, natijalarni qayta ko\x02BBrib chiqishni so\x02BBrayman' },
])

const pendingCount = computed(() => objections.value.filter(o => o.status === 'PENDING').length)
const resolvedCount = computed(() => objections.value.filter(o => o.status === 'RESOLVED').length)

function statusColor(s: string) { return s === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700' }
function statusLabel(s: string) { return s === 'PENDING' ? (isUz.value ? 'Kutilmoqda' : 'Ожидает') : (isUz.value ? 'Hal qilingan' : 'Решено') }
function resolveObjection(obj: any) { obj.status = 'RESOLVED' }

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

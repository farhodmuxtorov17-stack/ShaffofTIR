<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Ma\u02BBlumot sifati" : "Качество данных" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tizim ma\u02BBlumotlari yaxlitligi" : "Целостность данных системы" }}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Yaxlitlik" : "Целостность" }}</div>
        <div class="text-2xl font-bold text-green-600">98.5%</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "To\u02BBliqlik" : "Полнота" }}</div>
        <div class="text-2xl font-bold text-green-600">96.2%</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Aniqlik" : "Точность" }}</div>
        <div class="text-2xl font-bold text-yellow-600">89.1%</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Yangilik" : "Актуальность" }}</div>
        <div class="text-2xl font-bold text-green-600">95.0%</div>
      </div>
    </div>
    <div class="card p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ isUz ? "Muammolar" : "Обнаруженные проблемы" }}</h2>
      <div class="space-y-2">
        <div v-for="issue in issues" :key="issue.id" class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="issue.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">{{ issue.severity }}</span>
          <span class="text-sm text-gray-700 flex-1">{{ isUz ? issue.desc_uz : issue.desc_ru }}</span>
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

const issues = ref([
  { id: 1, severity: 'HIGH', desc_ru: '3 сотрудника без FaceID регистрации', desc_uz: '3 xodim FaceID ro\u02BByxatisiz' },
  { id: 2, severity: 'MEDIUM', desc_ru: '2 протокола без подписи инструктора', desc_uz: '2 protokol instruktor imzosiz' },
  { id: 3, severity: 'LOW', desc_ru: 'Устаревшие данные по 1 сотруднику (перемещён)', desc_uz: '1 xodim uchun eski ma\u02BBlumot (ko\u02BBchirilgan)' },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

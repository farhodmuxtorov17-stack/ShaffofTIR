<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Kelishish vazifalari" : "Задачи согласования" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tasdiqlashni kutayotgan hujjatlar" : "Документы, ожидающие утверждения" }}</p>
    </div>
    <div class="space-y-3">
      <div v-for="task in tasks" :key="task.id" class="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">{{ task.title }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">{{ task.status === 'PENDING' ? (isUz ? 'Kutilmoqda' : 'Ожидает') : (isUz ? 'Tasdiqlangan' : 'Утверждено') }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ task.type }} · {{ task.date }}</div>
        </div>
        <button v-if="task.status === 'PENDING'" @click="task.status = 'APPROVED'" class="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 border border-green-200 rounded-lg">{{ isUz ? "Tasdiqlash" : "Утвердить" }}</button>
        <Check v-else class="w-5 h-5 text-green-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isUz = computed(() => auth.user?.locale === 'uz')
const loading = ref(true)

const tasks = ref([
  { id: 'A-12', title: 'Протокол P-2026-012', type: 'PROTOCOL', date: '30.07.2026', status: 'PENDING' },
  { id: 'A-11', title: 'Отчёт по региону Самарканд', type: 'REPORT', date: '28.07.2026', status: 'PENDING' },
  { id: 'A-10', title: 'KPI за июль 2026', type: 'KPI', date: '25.07.2026', status: 'APPROVED' },
  { id: 'A-09', title: 'План тренировок на август', type: 'TRAINING', date: '24.07.2026', status: 'APPROVED' },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

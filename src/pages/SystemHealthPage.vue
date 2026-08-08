<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Database, Cpu, RefreshCw, Loader2, Server } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { healthApi } from '@/api/health.api'
import { normalizeError } from '@/utils/errorNormalizer'
import { useI18n } from '@/i18n'

const uiStore = useUiStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const loading = ref(false)
const healthDetail = ref<{ status: string; message?: string } | null>(null)
const aiDetail = ref<{ status: string; message?: string } | null>(null)

const apiBaseUrl = computed(() => import.meta.env.VITE_API_URL || "https://soldier.mrdev.uz")

async function checkAll() {
  loading.value = true
  try {
    const [h, ai] = await Promise.allSettled([
      healthApi.check(),
      healthApi.checkAi(),
    ])
    if (h.status === 'fulfilled') {
      healthDetail.value = h.value as any
      uiStore.backendHealthy = true
    } else {
      healthDetail.value = { status: 'error', message: normalizeError(h.reason).message }
      uiStore.backendHealthy = false
    }
    if (ai.status === 'fulfilled') {
      aiDetail.value = ai.value as any
      uiStore.aiHealthy = true
    } else {
      aiDetail.value = { status: 'error', message: normalizeError(ai.reason).message }
      uiStore.aiHealthy = false
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkAll()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Tizim holati' : 'Состояние системы' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Backend va avtomatik modellarni tekshirish' : 'Проверка backend и автоматических моделей' }}</p>
      </div>
      <button class="btn-secondary text-xs" :disabled="loading" @click="checkAll">
        <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
        <RefreshCw v-else class="w-3.5 h-3.5" />
        {{ isUz ? 'Yangilash' : 'Обновить' }}
      </button>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-btn flex items-center justify-center" :class="uiStore.backendHealthy ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600'">
          <Database class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-800">{{ isUz ? 'Backend server' : 'Backend сервер' }}</h2>
          <p class="text-xs text-gray-400 font-mono">{{ apiBaseUrl }}</p>
        </div>
        <span class="ml-auto" :class="uiStore.backendHealthy ? 'badge-success' : 'badge-danger'">
          {{ uiStore.backendHealthy ? (isUz ? 'Onlayn' : 'Онлайн') : (isUz ? 'Oflayn' : 'Офлайн') }}
        </span>
      </div>
      <div v-if="healthDetail" class="bg-gray-50 rounded-btn p-3 text-sm">
        <pre class="text-xs text-gray-600">{{ JSON.stringify(healthDetail, null, 2) }}</pre>
      </div>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-btn flex items-center justify-center" :class="uiStore.aiHealthy ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'">
          <Cpu class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-800">{{ isUz ? 'Avtomatik model' : 'Автоматическая модель' }}</h2>
          <p class="text-xs text-gray-400">{{ isUz ? 'Oʻqlarni aniqlash uchun kompyuter koʻrish' : 'Компьютерное зрение для обнаружения пуль' }}</p>
        </div>
        <span class="ml-auto" :class="uiStore.aiHealthy ? 'badge-success' : 'badge-danger'">
          {{ uiStore.aiHealthy ? (isUz ? 'Tayyor' : 'Готов') : (isUz ? 'Mavjud emas' : 'Недоступен') }}
        </span>
      </div>
      <div v-if="aiDetail" class="bg-gray-50 rounded-btn p-3 text-sm">
        <pre class="text-xs text-gray-600">{{ JSON.stringify(aiDetail, null, 2) }}</pre>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center gap-2 mb-3">
        <Server class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Konfiguratsiya' : 'Конфигурация' }}</h2>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between py-1 border-b border-gray-50">
          <span class="text-gray-500">API URL</span>
          <span class="font-mono text-gray-800 text-xs">{{ apiBaseUrl }}</span>
        </div>
        <div class="flex justify-between py-1 border-b border-gray-50">
          <span class="text-gray-500">OpenAPI Docs</span>
          <a :href="`${apiBaseUrl}/docs`" target="_blank" class="text-brand-600 text-xs hover:underline">{{ apiBaseUrl }}/docs</a>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-gray-500">CORS</span>
          <span class="text-xs text-gray-800">{{ isUz ? 'Ochiq (*)' : 'Открытый (*)' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

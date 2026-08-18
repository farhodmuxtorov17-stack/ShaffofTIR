<script setup lang="ts">
import { AlertCircle, RotateCcw } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from '@/i18n'

defineProps<{
  title: string
  message: string
  onRetry?: () => void
}>()

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
</script>

<template>
  <div class="border border-red-200 bg-red-50/50 rounded-2xl p-6 flex flex-col items-center text-center max-w-md mx-auto my-4">
    <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 shrink-0">
      <AlertCircle class="w-6 h-6" />
    </div>
    <h3 class="text-base font-bold text-red-900 mb-1">{{ title }}</h3>
    <p class="text-sm text-red-700 mb-5 leading-relaxed">{{ message }}</p>
    <button v-if="onRetry" type="button" class="btn-danger" @click="onRetry">
      <RotateCcw class="w-4 h-4 shrink-0" />
      {{ isUz ? 'Qayta urinish' : 'Повторить' }}
    </button>
  </div>
</template>

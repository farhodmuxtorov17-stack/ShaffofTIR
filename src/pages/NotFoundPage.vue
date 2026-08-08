<script setup lang="ts">
import { Compass } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div class="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-6">
      <Compass class="w-10 h-10" />
    </div>
    <h1 class="text-4xl font-bold text-gray-900 mb-2">404</h1>
    <p class="text-sm text-gray-500 mb-6">{{ isUz ? 'Sahifa topilmadi' : 'Страница не найдена' }}</p>
    <button class="btn-primary" @click="router.push('/dashboard')">
      {{ isUz ? 'Boshqaruv paneliga qaytish' : 'На главную' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { Shield, Ban, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from '@/i18n'
const router = useRouter()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div class="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-6">
      <Ban class="w-10 h-10" />
    </div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">403</h1>
    <p class="text-sm text-gray-500 mb-6">{{ isUz ? 'Bu sahifaga ruxsat yoʻq' : 'У вас нет доступа к этой странице' }}</p>
    <button class="btn-primary" @click="router.push('/dashboard')">
      <ArrowLeft class="w-4 h-4" /> {{ isUz ? 'Bosh sahifaga' : 'На главную' }}
    </button>
  </div>
</template>

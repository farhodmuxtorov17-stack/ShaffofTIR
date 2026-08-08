<script setup lang="ts">
import PremiumLoader from './PremiumLoader.vue'

withDefaults(
  defineProps<{
    message?: string
    type?: 'spinner' | 'skeleton' | 'dots' | 'page' | 'table' | 'cards' | 'grid'
    rows?: number
    cols?: number
  }>(),
  { message: 'Загрузка...', type: 'page', rows: 4, cols: 3 }
)
</script>

<template>
  <div class="flex items-center justify-center min-h-[300px] w-full">
    <PremiumLoader :message="message" />
  </div>
</template>

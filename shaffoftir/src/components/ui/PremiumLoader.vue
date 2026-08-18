<script setup lang="ts">
import CreativeLoader from './CreativeLoader.vue'

withDefaults(
  defineProps<{
    message?: string
    size?: number
    inline?: boolean
  }>(),
  { message: '', size: 32, inline: false }
)
</script>

<template>
  <CreativeLoader :message="message" :size="size" :inline="inline" variant="crosshair" />
</template>

<script setup lang="ts">
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
  <div class="premium-loader" :class="{ 'premium-loader--inline': inline }">
    <div class="premium-loader__spinner">
      <svg class="animate-spin" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.15" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <span v-if="message" class="premium-loader__message">{{ message }}</span>
  </div>
</template>

<style scoped>
.premium-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #16a34a;
}
.premium-loader--inline {
  display: inline-flex;
  flex-direction: row;
  padding: 0;
  gap: 8px;
}
.premium-loader__message {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}
</style>

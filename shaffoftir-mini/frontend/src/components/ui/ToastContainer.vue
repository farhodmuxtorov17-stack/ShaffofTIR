<script setup lang="ts">
/**
 * Toast notification container — renders all active toasts.
 * Place once at the app root.
 */
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const styles: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
  warning: 'bg-amber-600',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[styles[toast.type], 'px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-3']"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="remove(toast.id)" class="opacity-70 hover:opacity-100">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>

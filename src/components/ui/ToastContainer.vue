<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<template>
  <div class="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2.5 w-full">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300"
        :class="{
          'border-l-[3px] !border-l-green-500': toast.type === 'success',
          'border-l-[3px] !border-l-red-500': toast.type === 'error',
          'border-l-[3px] !border-l-amber-500': toast.type === 'warning',
          'border-l-[3px] !border-l-blue-500': toast.type === 'info',
        }"
      >
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-500" />
          <Info v-else class="w-5 h-5 text-blue-500" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-xs text-gray-500 mt-1 leading-relaxed">{{ toast.message }}</p>
        </div>
        <button @click="uiStore.removeToast(toast.id)" class="shrink-0 text-gray-400 hover:text-gray-600 rounded-lg p-0.5 hover:bg-gray-50 transition">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-from { opacity: 0; transform: translateY(-16px) scale(0.96); }
.toast-leave-to { opacity: 0; transform: translateY(-8px) scale(0.96); }
.toast-leave-active { position: absolute; width: 100%; }
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    side?: 'right' | 'left'
  }>(),
  {
    title: '',
    side: 'right',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="close"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition :name="side === 'right' ? 'slide-right' : 'slide-left'">
      <div
        v-if="modelValue"
        class="fixed inset-y-0 z-50 flex max-w-full bg-shell-surface shadow-shell border-gray-200 transition-all transform flex-col w-full max-w-md"
        :class="[
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
        ]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-shell-border px-6 py-4 bg-gray-50/50">
          <h3 class="text-base font-semibold text-gray-900">
            {{ title }}
          </h3>
          <button
            class="rounded-btn p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition focus:outline-none"
            @click="close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Right transitions */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Slide Left transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>

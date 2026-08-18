<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { title: '', size: 'md' }
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const close = () => emit('update:modelValue', false)

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))

watch(() => props.modelValue, (val) => {
  document.body.classList.toggle('overflow-hidden', val)
}, { immediate: true })

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 transition-opacity"
        style="background: rgba(15,23,42,0.4); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"
        @click="close"
      />
    </Transition>

    <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <Transition name="modal">
        <div
          class="rounded-2xl flex flex-col overflow-hidden max-h-[90vh] w-full"
          style="background: #fff; box-shadow: 0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 25px -10px rgba(0,0,0,0.08);"
          :class="sizeClasses[size]"
          @click.stop
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-base font-bold text-gray-900" style="letter-spacing: -0.01em;">{{ title }}</h3>
            <button class="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition focus:outline-none" @click="close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: all 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
.modal-enter-from { opacity: 0; transform: scale(0.94) translateY(12px); }
.modal-leave-to { opacity: 0; transform: scale(0.96) translateY(6px); }
</style>

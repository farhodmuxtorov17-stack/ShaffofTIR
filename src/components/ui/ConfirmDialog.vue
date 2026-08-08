<script setup lang="ts">
import { AlertTriangle, HelpCircle } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }>(),
  {
    confirmText: 'Tasdiqlash',
    cancelText: 'Bekor qilish',
    danger: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="title"
    size="sm"
  >
    <div class="flex gap-4 items-start py-2">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        :class="danger ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'"
      >
        <component :is="danger ? AlertTriangle : HelpCircle" class="w-5 h-5" />
      </div>
      <div>
        <p class="text-sm text-gray-600 leading-relaxed">
          {{ message }}
        </p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="btn-secondary"
        @click="handleCancel"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        class="btn"
        :class="danger ? 'btn-danger' : 'btn-primary'"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

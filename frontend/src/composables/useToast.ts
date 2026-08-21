/**
 * Toast notification composable.
 *
 * Provides a reactive list of toast messages with auto-dismiss.
 * Usage: const { toasts, push, remove } = useToast()
 */
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])
let counter = 0

export function useToast() {
  function push(message: string, type: ToastType = 'info', duration = 4000) {
    const id = ++counter
    toasts.value.push({ id, type, message, duration })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    push,
    remove,
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error', 6000),
    info: (msg: string) => push(msg, 'info'),
    warning: (msg: string) => push(msg, 'warning', 5000),
  }
}

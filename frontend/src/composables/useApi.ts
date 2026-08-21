/**
 * Generic async data fetching composable.
 *
 * Provides reactive state for loading, error, and data with
 * automatic error normalization via ApiError.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(() => sessionsApi.list())
 *   onMounted(execute)
 */
import { ref, shallowRef } from 'vue'
import { ApiError } from '@/api/client'

export function useApi<T>(fn: () => Promise<T>) {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function execute(): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      data.value = await fn()
      return data.value
    } catch (e) {
      error.value = e instanceof ApiError ? e : new ApiError('UNKNOWN', String(e), 0)
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}

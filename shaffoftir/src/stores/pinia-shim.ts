// Lightweight Pinia-compatible shim - replaces pinia for environments
// where pinia fails to load (mobile browsers, Telegram WebView).
// Supports the composition-API style: defineStore('name', () => { ... })

import { effectScope, reactive } from 'vue'

type StateFactory<T> = () => T

interface StoreRecord {
  store: Record<string, unknown>
  scope: ReturnType<typeof effectScope>
}

const stores = new Map<string, StoreRecord>()

type UnwrapRefs<T> = {
  [K in keyof T]: T[K] extends import('vue').Ref<infer U> ? U : T[K]
}

export function defineStore<T extends Record<string, unknown>>(
  id: string,
  factory: StateFactory<T>
) {
  return (): UnwrapRefs<T> => {
    if (stores.has(id)) {
      return stores.get(id)!.store as unknown as UnwrapRefs<T>
    }

    const scope = effectScope(true)
    let raw: T | undefined

    scope.run(() => {
      raw = factory()
    })

    const store = reactive(raw as object) as unknown as UnwrapRefs<T>
    stores.set(id, { store: store as unknown as Record<string, unknown>, scope })

    return store
  }
}

export function createPinia() {
  return {
    install() {
      // No-op - stores are self-managed via the shim
    },
  }
}

// Reset all stores (useful for logout)
export function disposeAllStores() {
  for (const [, record] of stores) {
    record.scope.stop()
  }
  stores.clear()
}

/// <reference types='vite/client' />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_JWT_STORAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

<script setup lang="ts">
import { RefreshCw, Download, Upload, Check, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'

const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const uiStore = useUiStore()

const syncing = ref(false)
const syncLog = ref<Array<{ time: string; action: string; status: 'success' | 'error' }>>([])

function sync() {
  syncing.value = true
  syncLog.value = []
  const steps = [
    isUz ? 'HR tizimiga ulanish (hr.mil.uz)...' : 'Подключение к HR системе (hr.mil.uz)...',
    isUz ? 'Xodimlar roʻyxatini olish...' : 'Получение списка сотрудников...',
    isUz ? 'FaceID maʻlumotlarini sinxronizatsiya...' : 'Синхронизация FaceID данных...',
    isUz ? 'Malakalarni yangilash...' : 'Обновление квалификаций...',
    isUz ? 'Boʻlinmalarni sinxronizatsiya...' : 'Синхронизация подразделений...',
    isUz ? 'Yakunlandi!' : 'Завершено!',
  ]
  let idx = 0
  const interval = setInterval(() => {
    if (idx >= steps.length) {
      clearInterval(interval)
      syncing.value = false
      uiStore.showToast('success', isUz ? 'Sinxronizatsiya' : 'Синхронизация', isUz ? 'HR maʻlumotlari yangilandi' : 'HR данные обновлены')
      return
    }
    syncLog.value.push({ time: new Date().toLocaleTimeString(), action: steps[idx], status: idx === steps.length - 1 ? 'success' : 'success' })
    idx++
  }, 600)
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div class="flex items-center gap-3">
      <button class="btn-ghost px-2.5 py-2" @click="router.push('/hr/employees')"><ArrowLeft class="w-4 h-4" /></button>
      <div><h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'HR Sinxronizatsiya' : 'HR Синхронизация' }}</h1><p class="text-sm text-gray-500">{{ isUz ? 'HR tizimidan maʻlumot import qilish' : 'Импорт данных из HR системы' }}</p></div>
    </div>
    <div class="card flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><RefreshCw class="w-6 h-6 text-purple-600" :class="syncing ? 'animate-spin' : ''" /></div>
        <div><p class="text-sm font-semibold text-gray-800">{{ isUz ? 'Toʻli sinxronizatsiya' : 'Полная синхронизация' }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Xodimlar, FaceID, boʻlinmalarni import qilish' : 'Импорт сотрудников, FaceID, подразделений' }}</p></div>
      </div>
      <button class="btn-primary text-xs" :disabled="syncing" @click="sync">{{ syncing ? (isUz ? 'Sinxronizatsiya...' : 'Синхронизация...') : (isUz ? 'Boshlash' : 'Запустить') }}</button>
    </div>
    <div v-if="syncLog.length > 0" class="card space-y-2">
      <div v-for="(log, idx) in syncLog" :key="idx" class="flex items-center gap-2 text-sm">
        <Check class="w-3.5 h-3.5 text-brand-500" /><span class="text-xs text-gray-400 font-mono">{{ log.time }}</span><span class="text-xs text-gray-700">{{ log.action }}</span>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="card text-center"><p class="text-2xl font-bold text-gray-800">{{ masterStore.employees.length }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Xodimlar' : 'Сотрудников' }}</p></div>
      <div class="card text-center"><p class="text-2xl font-bold text-brand-600">{{ masterStore.employees.filter(e => e.face_id_registered).length }}</p><p class="text-xs text-gray-400">FaceID ✓</p></div>
      <div class="card text-center"><p class="text-2xl font-bold text-gray-800">{{ masterStore.departments.length }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Boʻlinmalar' : 'Подразделений' }}</p></div>
    </div>
  </div>
</template>

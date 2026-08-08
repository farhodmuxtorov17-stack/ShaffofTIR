<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{
  status: string
}>()

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const badgeClass = computed(() => {
  const s = props.status.toLowerCase()
  if (['active', 'alive', 'ok', 'healthy', 'approved', 'completed', 'success', 'test_completed', 'main_completed', 'passed', 'done'].includes(s)) {
    return 'badge-success'
  }
  if (['inactive', 'error', 'dead', 'offline', 'failed', 'danger', 'not_passed'].includes(s)) {
    return 'badge-danger'
  }
  if (['processing', 'pending', 'warning', 'test_processing', 'main_processing', 'test_ready', 'main_ready', 'review', 'session_created', 'test_active', 'main_active', 'waiting', 'in_progress'].includes(s)) {
    return 'badge-warning'
  }
  return 'badge-neutral'
})

const statusLabels: Record<string, { ru: string; uz: string }> = {
  active:           { ru: 'Активен', uz: 'Faol' },
  inactive:         { ru: 'Неактивен', uz: 'Faol emas' },
  approved:         { ru: 'Утверждён', uz: 'Tasdiqlangan' },
  completed:        { ru: 'Завершён', uz: 'Yakunlangan' },
  failed:           { ru: 'Не сдал', uz: "O'tmadi" },
  passed:           { ru: 'Сдал', uz: "O'tdi" },
  done:             { ru: 'Выполнено', uz: 'Bajarildi' },
  pending:          { ru: 'Ожидание', uz: 'Kutilmoqda' },
  waiting:          { ru: 'Ожидание', uz: 'Kutilmoqda' },
  processing:       { ru: 'Обработка', uz: 'Qayta ishlanmoqda' },
  in_progress:      { ru: 'В процессе', uz: 'Jarayonda' },
  review:           { ru: 'На проверке', uz: 'Tekshiruvda' },
  session_created:  { ru: 'Открыта', uz: 'Ochilgan' },
  test_ready:       { ru: 'Пробные готовы', uz: 'Sinov tayyor' },
  test_active:      { ru: 'Пробные идут', uz: 'Sinov davom etmoqda' },
  test_processing:  { ru: 'Обработка пробных', uz: "Sinov qayta ishlanmoqda" },
  test_completed:   { ru: 'Пробные завершены', uz: 'Sinov yakunlandi' },
  main_ready:       { ru: 'Основные готовы', uz: 'Asosiy tayyor' },
  main_active:      { ru: 'Основные идут', uz: 'Asosiy davom etmoqda' },
  main_processing:  { ru: 'Обработка', uz: 'Qayta ishlanmoqda' },
  main_completed:   { ru: 'Завершено', uz: 'Yakunlandi' },
  idle:             { ru: 'Ожидание', uz: 'Kutilmoqda' },
  archived:         { ru: 'Архивирован', uz: 'Arxivlangan' },
  error:            { ru: 'Ошибка', uz: 'Xatolik' },
  offline:          { ru: 'Офлайн', uz: 'Oflayn' },
  online:           { ru: 'Онлайн', uz: 'Onlayn' },
  available:        { ru: 'Доступен', uz: 'Mavjud' },
  in_use:           { ru: 'Используется', uz: "Ishlatilmoqda" },
  maintenance:      { ru: 'Обслуживание', uz: 'Texnik xizmat' },
}

const displayStatus = computed(() => {
  const key = props.status?.toLowerCase() || ''
  const entry = statusLabels[key]
  if (entry) return isUz.value ? entry.uz : entry.ru
  // fallback: format as title-case
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})
</script>

<template>
  <span :class="['inline-flex items-center', badgeClass]">
    {{ displayStatus }}
  </span>
</template>

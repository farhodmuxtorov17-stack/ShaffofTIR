<script setup lang="ts">
import { Bell, Settings, Save } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const uiStore = useUiStore()

const settings = ref({
  pushNotifications: true,
  emailNotifications: false,
  trainingReminders: true,
  systemAlerts: true,
  cameraOffline: true,
  sessionCompleted: true,
  weeklyReport: false,
})

const labels: Record<string, { ru: string; uz: string; desc_ru: string; desc_uz: string }> = {
  pushNotifications: { ru: 'Push-уведомления', uz: 'Push-xabarnomalar', desc_ru: 'Показывать в браузере', desc_uz: "Brauzerda ko'rsatish" },
  emailNotifications: { ru: 'Email-уведомления', uz: 'Email-xabarnomalar', desc_ru: 'Отправлять на email', desc_uz: "Emailga yuborish" },
  trainingReminders: { ru: 'Напоминания о тренировках', uz: "Mashg'ulot eslatmalari", desc_ru: 'За день до тренировки', desc_uz: "Mashg'ulotdan bir kun oldin" },
  systemAlerts: { ru: 'Системные оповещения', uz: 'Tizim ogoxlantirishlari', desc_ru: 'Важно: ошибки, сбои', desc_uz: 'Muhim: xatolar, uzilishlar' },
  cameraOffline: { ru: 'Камера офлайн', uz: 'Kamera offlayn', desc_ru: 'При потере связи с камерой', desc_uz: "Kamera aloqasi uzilganda" },
  sessionCompleted: { ru: 'Сессия завершена', uz: 'Sessiya tugadi', desc_ru: 'После завершения сессии', desc_uz: 'Sessiya tugagach' },
  weeklyReport: { ru: 'Еженедельный отчёт', uz: 'Haftalik hisobot', desc_ru: 'Сводка за неделю по понедельникам', desc_uz: 'Haftalik hisobot dushanba kunlari' },
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Xabarnomalar sozlamalari" : "Настройки уведомлений" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Xabarnoma turlarini boshqarish" : "Управление типами уведомлений" }}</p>
    </div>
    <div class="card space-y-4">
      <div v-for="(val, key) in settings" :key="key" class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">{{ isUz ? labels[key].uz : labels[key].ru }}</p>
          <p class="text-xs text-gray-400">{{ isUz ? labels[key].desc_uz : labels[key].desc_ru }}</p>
        </div>
        <button class="relative w-11 h-6 rounded-full transition shrink-0 ml-4" :class="val ? 'bg-brand-500' : 'bg-gray-300'" @click="settings[key] = !val">
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform" :class="val ? 'translate-x-5' : ''"></span>
        </button>
      </div>
      <button class="btn-primary w-full" @click="uiStore.showToast('success', isUz ? 'Saqlandi' : 'Сохранено', isUz ? 'Sozlamalar yangilandi' : 'Настройки обновлены')"><Save class="w-4 h-4" /> {{ isUz ? 'Saqlash' : 'Сохранить' }}</button>
    </div>
  </div>
</template>

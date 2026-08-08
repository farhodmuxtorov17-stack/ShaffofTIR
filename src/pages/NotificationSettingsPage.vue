<script setup lang="ts">
import { Bell, Settings, Save } from 'lucide-vue-next'
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'

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
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Настройки уведомлений</h1>
      <p class="text-sm text-gray-500 mt-1">Управление типами уведомлений</p>
    </div>
    <div class="card space-y-4">
      <div v-for="(val, key) in settings" :key="key" class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">{{ {
            pushNotifications: 'Push-уведомления',
            emailNotifications: 'Email-уведомления',
            trainingReminders: 'Напоминания о тренировках',
            systemAlerts: 'Системные оповещения',
            cameraOffline: 'Камера офлайн',
            sessionCompleted: 'Сессия завершена',
            weeklyReport: 'Еженедельный отчёт',
          }[key] }}</p>
          <p class="text-xs text-gray-400">{{ {
            pushNotifications: 'Показывать в браузере',
            emailNotifications: 'Отправлять на email',
            trainingReminders: 'За день до тренировки',
            systemAlerts: 'Важно: ошибки, сбои',
            cameraOffline: 'При потере связи с камерой',
            sessionCompleted: 'После завершения сессии',
            weeklyReport: 'Сводка за неделю по понедельникам',
          }[key] }}</p>
        </div>
        <button class="relative w-11 h-6 rounded-full transition shrink-0 ml-4" :class="val ? 'bg-brand-500' : 'bg-gray-300'" @click="settings[key] = !val">
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform" :class="val ? 'translate-x-5' : ''"></span>
        </button>
      </div>
      <button class="btn-primary w-full" @click="uiStore.showToast('success', 'Сохранено', 'Настройки обновлены')"><Save class="w-4 h-4" /> Сохранить</button>
    </div>
  </div>
</template>

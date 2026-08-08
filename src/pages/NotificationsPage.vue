<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Bell, Check, CheckCheck, AlertCircle, Info, Award, AlertTriangle, Settings } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const notifications = computed(() => [...masterStore.notifications].sort((a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
))

const unreadCount = computed(() => masterStore.getNotificationsUnread().length)

const typeIcons: Record<string, any> = {
  INFO: Info, SUCCESS: Check, WARNING: AlertTriangle, ERROR: AlertCircle,
  TRAINING: Award, SYSTEM: Settings,
}

const typeColors: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-500',
  SUCCESS: 'bg-brand-50 text-brand-500',
  WARNING: 'bg-amber-50 text-amber-500',
  ERROR: 'bg-red-50 text-red-500',
  TRAINING: 'bg-purple-50 text-purple-500',
  SYSTEM: 'bg-gray-50 text-gray-500',
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Bildirishnomalar' : 'Уведомления' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ unreadCount }} {{ isUz ? "o'qilmagan" : 'непрочитанных' }}</p>
      </div>
      <button class="btn-secondary text-xs" @click="masterStore.markAllNotificationsRead()">
        <CheckCheck class="w-3.5 h-3.5" /> {{ isUz ? "Barchasini o'qish" : 'Прочитать все' }}
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami' : 'Всего'" :value="notifications.length" accent="neutral" />
      <KPICard :title="isUz ? 'O02bbqilmagan' : 'Непрочитанных'" :value="unreadCount" accent="brand" />
      <KPICard :title="isUz ? 'Mashqlar' : 'Тренировки'" :value="notifications.filter(n => n.type === 'TRAINING').length" accent="neutral" />
      <KPICard :title="isUz ? 'Tizim' : 'Система'" :value="notifications.filter(n => n.type === 'SYSTEM').length" accent="neutral" />
    </div>

    <div class="card space-y-2">
      <div v-for="n in notifications" :key="n.id"
        class="flex items-start gap-3 p-3 rounded-xl transition cursor-pointer"
        :class="n.is_read ? 'bg-white' : 'bg-brand-50/30'"
        @click="masterStore.markNotificationRead(n.id)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="typeColors[n.type]">
          <component :is="typeIcons[n.type]" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold text-gray-800">{{ n.title }}</p>
            <span v-if="!n.is_read" class="flex h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">{{ n.message }}</p>
          <p class="text-[10px] text-gray-400 mt-1">{{ new Date(n.created_at).toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

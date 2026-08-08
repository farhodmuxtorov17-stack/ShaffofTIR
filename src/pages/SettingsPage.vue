<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useMasterStore } from '@/stores/master'
import { Radio, Save, Server, Shield, Settings as SettingsIcon } from 'lucide-vue-next'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const uiStore = useUiStore()
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const apiBaseUrl = ref(import.meta.env.VITE_API_URL || "https://soldier.mrdev.uz")
const defaultShots = ref(10)
const theme = ref<'light' | 'dark'>('light')

const laneConfigs = ref(masterStore.lanes.map(l => ({
  id: l.id, lane_number: l.lane_number, name: l.name,
  target_type: l.target_type, distance_m: l.distance_m, camera_ip: l.camera_ip || '',
})))

function saveSettings() {
  uiStore.showToast('success', isUz.value ? 'Saqlandi' : 'Сохранено', isUz.value ? 'Sozlamalar yangilandi' : 'Настройки обновлены')
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6 max-w-2xl">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Sozlamalar' : 'Настройки' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Tizim konfiguratsiyasi' : 'Конфигурация системы' }}</p>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-2">
        <Server class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Backend ulanishi' : 'Подключение к backend' }}</h2>
      </div>
      <div>
        <label class="text-xs text-gray-500 mb-1 block">API URL</label>
        <input v-model="apiBaseUrl" class="input text-sm font-mono" readonly />
        <p class="text-xs text-gray-400 mt-1">{{ isUz ? '.env orqali sozlanadi (VITE_API_URL)' : 'Настройка через .env (VITE_API_URL)' }}</p>
      </div>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-2">
        <SettingsIcon class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Standart parametrlar" : 'Параметры по умолчанию' }}</h2>
      </div>
      <div>
        <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? "O'qlar soni" : 'Количество выстрелов' }}</label>
        <input v-model.number="defaultShots" type="number" min="1" max="50" class="input" />
      </div>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-2">
        <Shield class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Interfeys' : 'Интерфейс' }}</h2>
      </div>
      <div class="flex gap-2">
        <button class="flex-1 px-4 py-2.5 rounded-btn border text-sm font-medium transition" :class="theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-shell-border text-gray-600'" @click="theme = 'light'; uiStore.setTheme('light')">{{ isUz ? 'Yorug' : 'Светлая' }}</button>
        <button class="flex-1 px-4 py-2.5 rounded-btn border text-sm font-medium transition" :class="theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-shell-border text-gray-600'" @click="theme = 'dark'; uiStore.setTheme('dark')">{{ isUz ? 'Qorong' : 'Тёмная' }}</button>
      </div>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-2">
        <Radio class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Yo'laklar konfiguratsiyasi" : 'Конфигурация дорожек' }}</h2>
      </div>
      <div class="space-y-2">
        <div v-for="lane in laneConfigs" :key="lane.id" class="grid grid-cols-4 gap-2 items-end p-2.5 rounded-lg bg-gray-50/50">
          <div><label class="text-[10px] text-gray-400 mb-0.5 block">{{ isUz ? '№' : '№' }}</label><span class="text-sm font-bold text-gray-800">{{ lane.lane_number }}</span></div>
          <div><label class="text-[10px] text-gray-400 mb-0.5 block">{{ isUz ? 'Nomi' : 'Название' }}</label><input v-model="lane.name" class="input text-xs py-1.5" /></div>
          <div><label class="text-[10px] text-gray-400 mb-0.5 block">{{ isUz ? 'Turi' : 'Тип' }}</label>
            <select v-model="lane.target_type" class="input text-xs py-1.5">
              <option value="STANDARD">{{ isUz ? 'Standart' : 'Стандарт' }}</option>
              <option value="SILHOUETTE">{{ isUz ? 'Siluet' : 'Силуэт' }}</option>
              <option value="CIRCLE">{{ isUz ? 'Doira' : 'Круг' }}</option>
            </select>
          </div>
          <div><label class="text-[10px] text-gray-400 mb-0.5 block">{{ isUz ? 'Kamera IP' : 'Камера IP' }}</label><input v-model="lane.camera_ip" class="input text-xs py-1.5 font-mono" /></div>
        </div>
      </div>
    </div>

    <button class="btn-primary" @click="saveSettings">
      <Save class="w-4 h-4" /> {{ isUz ? 'Saqlash' : 'Сохранить' }}
    </button>
  </div>
</template>

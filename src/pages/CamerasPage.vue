<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Camera, Plus, Minus, Loader2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { cameraApi } from '@/api/camera.api'
import { useUiStore } from '@/stores/ui'
import { normalizeError } from '@/utils/errorNormalizer'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { resolveImageUrl } from '@/api/imageUrl'
import type { LaneCameraRequest, CameraHealthResponse } from '@/types'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const uiStore = useUiStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const cameras = reactive<LaneCameraRequest[]>([
  { camera_ip: '', username: 'admin', password: '', label: '' },
])

const checking = ref(false)
const result = ref<CameraHealthResponse | null>(null)
const error = ref<{ title: string; message: string } | null>(null)

function addCameraRow() {
  cameras.push({ camera_ip: '', username: 'admin', password: '', label: '' })
}

function removeCameraRow(idx: number) {
  if (cameras.length > 1) cameras.splice(idx, 1)
}

async function checkAll() {
  checking.value = true
  error.value = null
  const validCameras = cameras.filter(c => c.camera_ip.trim())
  if (validCameras.length === 0) {
    error.value = { title: 'Kamera yoʻq', message: 'Kamida bitta kamera IP kiriting' }
    checking.value = false
    return
  }
  try {
    result.value = await cameraApi.checkHealth({ cameras: validCameras })
    uiStore.showToast('success', isUz ? 'Tekshirildi' : 'Проверено', isUz ? `${result.value.active_cameras}/${result.value.total_cameras} faol` : `${result.value.active_cameras}/${result.value.total_cameras} активны`)
  } catch (err) {
    error.value = normalizeError(err)
    uiStore.showToast('error', 'Xatolik', error.value.message)
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Kameralar' : 'Камеры' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'RTSP kameralarni qoʻshish va holatini tekshirish' : 'Добавление RTSP камер и проверка состояния' }}</p>
    </div>

    <div v-if="error" class="card border-red-200 bg-red-50/50 flex items-start gap-3">
      <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-bold text-red-900">{{ error.title }}</p>
        <p class="text-xs text-red-700 mt-0.5">{{ error.message }}</p>
      </div>
    </div>

    <div class="card space-y-3">
      <div v-for="(cam, idx) in cameras" :key="idx" class="border border-shell-border rounded-btn p-4 space-y-3 bg-gray-50/30">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-500">{{ isUz ? 'Kamera' : 'Камера' }} { idx + 1 }</span>
          <button v-if="cameras.length > 1" class="text-gray-400 hover:text-red-600 p-1" @click="removeCameraRow(idx)">
            <Minus class="w-4 h-4" />
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'IP / RTSP URL' : 'IP / RTSP URL' }}</label>
            <input v-model="cam.camera_ip" class="input text-sm" placeholder="192.168.1.64" />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Belgi' : 'Метка' }}</label>
            <input v-model="cam.label" class="input text-sm" placeholder="Lane 1" />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Login' : 'Логин' }}</label>
            <input v-model="cam.username" class="input text-sm" placeholder="admin" />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Parol' : 'Пароль' }}</label>
            <input v-model="cam.password" type="password" class="input text-sm" placeholder="••••••" />
          </div>
        </div>
      </div>
      <button class="btn-ghost text-xs w-full" @click="addCameraRow">
        <Plus class="w-3.5 h-3.5" /> {{ isUz ? 'Kamera qoʻshish' : 'Добавить камеру' }}
      </button>
    </div>

    <button class="btn-primary w-full" :disabled="checking" @click="checkAll">
      <Loader2 v-if="checking" class="w-4 h-4 animate-spin" />
      <RefreshCw v-else class="w-4 h-4" />
      {{ checking ? (isUz ? 'Tekshirilmoqda...' : 'Проверка...') : (isUz ? 'Hammasini tekshirish' : 'Проверить все') }}
    </button>

    <div v-if="result" class="space-y-3">
      <div class="grid grid-cols-3 gap-4">
        <div class="card-compact text-center">
          <p class="text-xs font-bold text-gray-500 uppercase">{{ isUz ? 'Jami' : 'Всего' }}</p>
          <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ result.total_cameras }}</h3>
        </div>
        <div class="card-compact text-center">
          <p class="text-xs font-bold text-gray-500 uppercase">{{ isUz ? 'Faol' : 'Активно' }}</p>
          <h3 class="text-2xl font-bold text-brand-600 mt-1">{{ result.active_cameras }}</h3>
        </div>
        <div class="card-compact text-center">
          <p class="text-xs font-bold text-gray-500 uppercase">{{ isUz ? 'Nofaol' : 'Неактивно' }}</p>
          <h3 class="text-2xl font-bold text-red-600 mt-1">{{ result.total_cameras - result.active_cameras }}</h3>
        </div>
      </div>

      <div v-if="result.camera_results" class="space-y-2">
        <div v-for="cam in result.camera_results" :key="cam.camera_index" class="card flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Camera class="w-5 h-5 text-gray-500" />
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ cam.label || `Kamera ${cam.camera_index}` }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ cam.camera_ip }}</p>
              <p v-if="cam.detail" class="text-xs text-gray-500 mt-0.5">{{ cam.detail }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div v-if="cam.capture_image_url" class="w-16 h-16 rounded border border-shell-border overflow-hidden">
              <img :src="resolveImageUrl(cam.capture_image_url)" alt="capture" class="w-full h-full object-cover" />
            </div>
            <StatusBadge :status="cam.status" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

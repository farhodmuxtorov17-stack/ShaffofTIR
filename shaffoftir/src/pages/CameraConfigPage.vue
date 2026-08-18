<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCameraStore } from '@/stores/camera'
import { useI18n } from '@/i18n'
import { CAMERA_PRESETS, buildSnapshotUrl, type CameraConfig } from '@/api/camera.api'
import { Camera, Plus, Trash2, Wifi, WifiOff, Loader2, Save, TestTube, Power, PowerOff } from 'lucide-vue-next'

const cameraStore = useCameraStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const showAddForm = ref(false)
const editingId = ref<string | null>(null)
const testing = ref<string | null>(null)
const testResult = ref<Record<string, 'OK' | 'FAIL' | null>>({})

const blankForm: Omit<CameraConfig, 'id'> = {
  name: '', ip: '', port: 80, username: 'admin', password: '',
  streamType: 'SNAPSHOT', rtspPath: '/Streaming/Channels/101',
  hlsPath: '/stream/1/hls', mjpegPath: '/Streaming/Channels/101/preview',
  snapshotPath: '/ISAPI/Streaming/channels/101/picture',
  enabled: true, zone: 'lane', laneNumber: undefined,
}
const form = ref<Omit<CameraConfig, 'id'>>({ ...blankForm })

function startAdd() {
  editingId.value = null
  form.value = { ...blankForm }
  showAddForm.value = true
}

function startEdit(cam: CameraConfig) {
  editingId.value = cam.id
  form.value = { ...cam }
  showAddForm.value = true
}

function applyPreset(brand: string) {
  const preset = CAMERA_PRESETS[brand]
  if (preset) {
    form.value = { ...form.value, ...preset } as any
  }
}

function saveCamera() {
  if (!form.value.ip || !form.value.name) return
  if (editingId.value) {
    cameraStore.updateCamera(editingId.value, form.value)
  } else {
    cameraStore.addCamera(form.value)
  }
  showAddForm.value = false
}

function deleteCamera(id: string) {
  cameraStore.removeCamera(id)
}

function toggleCamera(cam: CameraConfig) {
  cameraStore.updateCamera(cam.id, { enabled: !cam.enabled })
}

async function testCamera(cam: CameraConfig) {
  testing.value = cam.id
  testResult.value[cam.id] = null
  const ok = await cameraStore.testConnection(cam)
  testResult.value[cam.id] = ok ? 'OK' : 'FAIL'
  testing.value = null
}

function statusLabel(s: string) {
  if (s === 'ONLINE') return isUz.value ? 'Onlayn' : 'Онлайн'
  if (s === 'OFFLINE') return isUz.value ? 'Oflayn' : 'Офлайн'
  if (s === 'CONNECTING') return isUz.value ? 'Ulanmoqda' : 'Подключение'
  return isUz.value ? 'Noaniq' : 'Неизвестно'
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isUz ? 'Kamera konfiguratsiyasi' : 'Настройка камер' }}</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ isUz ? 'IP kameralarni boshqarish va ulanishni tekshirish' : 'Управление IP камерами и проверка соединения' }}</p>
      </div>
      <button class="btn-primary text-sm flex items-center gap-1.5" @click="startAdd">
        <Plus class="w-4 h-4" />
        {{ isUz ? 'Kamera qoʻshish' : 'Добавить камеру' }}
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="card !p-3 text-center">
        <p class="text-2xl font-bold text-gray-800">{{ cameraStore.cameras.length }}</p>
        <p class="text-xs text-gray-400">{{ isUz ? 'Jami' : 'Всего' }}</p>
      </div>
      <div class="card !p-3 text-center">
        <p class="text-2xl font-bold text-green-600">{{ cameraStore.enabledCameras.length }}</p>
        <p class="text-xs text-gray-400">{{ isUz ? 'Faol' : 'Активны' }}</p>
      </div>
      <div class="card !p-3 text-center">
        <p class="text-2xl font-bold text-red-500">{{ cameraStore.cameras.length - cameraStore.enabledCameras.length }}</p>
        <p class="text-xs text-gray-400">{{ isUz ? 'Oʻchiq' : 'Отключены' }}</p>
      </div>
    </div>

    <!-- Camera list -->
    <div class="space-y-3">
      <div v-for="cam in cameraStore.cameras" :key="cam.id"
        class="card flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :class="cam.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'">
            <Camera class="w-5 h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ cam.name }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-gray-500 font-mono">{{ cam.ip }}:{{ cam.port }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono"
                :class="cam.streamType === 'SNAPSHOT' ? 'bg-blue-50 text-blue-600' : cam.streamType === 'MJPEG' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'">
                {{ cam.streamType }}
              </span>
              <span v-if="cam.laneNumber" class="text-[10px] text-gray-400">Yoʻlak {{ cam.laneNumber }}</span>
            </div>
            <div v-if="testResult[cam.id]" class="mt-1 flex items-center gap-1">
              <Wifi v-if="testResult[cam.id] === 'OK'" class="w-3 h-3 text-green-500" />
              <WifiOff v-else class="w-3 h-3 text-red-500" />
              <span :class="testResult[cam.id] === 'OK' ? 'text-green-600' : 'text-red-500'" class="text-[10px] font-mono">
                {{ testResult[cam.id] === 'OK' ? (isUz ? 'Ulandi ✅' : 'Подключена ✅') : (isUz ? 'Ulanmadi ❌' : 'Нет связи ❌') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button @click="testCamera(cam)" :disabled="testing === cam.id"
            class="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 disabled:opacity-50"
            :title="isUz ? 'Tekshirish' : 'Проверить'">
            <Loader2 v-if="testing === cam.id" class="w-4 h-4 animate-spin" />
            <TestTube v-else class="w-4 h-4" />
          </button>
          <button @click="toggleCamera(cam)"
            class="p-2 rounded-lg transition"
            :class="cam.enabled ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'"
            :title="cam.enabled ? (isUz ? 'Oʻchirish' : 'Отключить') : (isUz ? 'Yoqish' : 'Включить')">
            <Power v-if="cam.enabled" class="w-4 h-4" />
            <PowerOff v-else class="w-4 h-4" />
          </button>
          <button @click="startEdit(cam)"
            class="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
            :title="isUz ? 'Tahrirlash' : 'Изменить'">
            <Save class="w-4 h-4" />
          </button>
          <button @click="deleteCamera(cam.id)"
            class="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
            :title="isUz ? 'Oʻchirish' : 'Удалить'">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit modal -->
    <div v-if="showAddForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="showAddForm = false">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-800">
          {{ editingId ? (isUz ? 'Kamerani tahrirlash' : 'Редактировать камеру') : (isUz ? 'Yangi kamera' : 'Новая камера') }}
        </h2>

        <!-- Brand preset -->
        <div>
          <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Brend shabloni' : 'Шаблон бренда' }}</label>
          <div class="flex gap-2">
            <button v-for="(preset, brand) in CAMERA_PRESETS" :key="brand"
              @click="applyPreset(brand)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition"
              :class="form.rtspPath === preset.rtspPath ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
              {{ brand }}
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Nomi' : 'Название' }}</label>
          <input v-model="form.name" class="input text-sm" placeholder="Yoʻlak 1 kamerasi" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="text-xs text-gray-500 mb-1 block">IP {{ isUz ? 'manzil' : 'адрес' }}</label>
            <input v-model="form.ip" class="input text-sm font-mono" placeholder="192.168.1.64" />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">Port</label>
            <input v-model.number="form.port" type="number" class="input text-sm font-mono" placeholder="80" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Login' : 'Логин' }}</label>
            <input v-model="form.username" class="input text-sm" placeholder="admin" />
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Parol' : 'Пароль' }}</label>
            <input v-model="form.password" type="password" class="input text-sm" placeholder="•••••" />
          </div>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Strim turi' : 'Тип потока' }}</label>
          <select v-model="form.streamType" class="input text-sm">
            <option value="SNAPSHOT">SNAPSHOT (HTTP {{ isUz ? 'rasm' : 'фото' }})</option>
            <option value="MJPEG">MJPEG (HTTP {{ isUz ? 'video' : 'видео' }})</option>
            <option value="HLS">HLS ({{ isUz ? 'mediya server' : 'медиа сервер' }})</option>
            <option value="RTSP">RTSP ({{ isUz ? 'relay talab qiladi' : 'требует релей' }})</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Zona' : 'Зона' }}</label>
            <select v-model="form.zone" class="input text-sm">
              <option value="lane">{{ isUz ? 'Yoʻlak' : 'Дорожка' }}</option>
              <option value="entrance">{{ isUz ? 'Kirish' : 'Вход' }}</option>
              <option value="parking">{{ isUz ? 'Avtoturargoh' : 'Парковка' }}</option>
              <option value="corridor">{{ isUz ? 'Koridor' : 'Коридор' }}</option>
              <option value="armory">{{ isUz ? 'Qurol ombori' : 'Арсенал' }}</option>
              <option value="control">{{ isUz ? 'Boshqaruv xonasi' : 'Пункт управления' }}</option>
            </select>
          </div>
          <div v-if="form.zone === 'lane'">
            <label class="text-xs text-gray-500 mb-1 block">{{ isUz ? 'Yoʻlak raqami' : 'Номер дорожки' }}</label>
            <input v-model.number="form.laneNumber" type="number" class="input text-sm" placeholder="1" />
          </div>
        </div>

        <!-- Stream paths -->
        <details class="text-sm">
          <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">{{ isUz ? 'Strim yoʻllari (qoʻlda)' : 'Пути потоков (вручную)' }}</summary>
          <div class="mt-2 space-y-2">
            <div>
              <label class="text-[10px] text-gray-400">Snapshot Path</label>
              <input v-model="form.snapshotPath" class="input text-xs font-mono" />
            </div>
            <div>
              <label class="text-[10px] text-gray-400">MJPEG Path</label>
              <input v-model="form.mjpegPath" class="input text-xs font-mono" />
            </div>
            <div>
              <label class="text-[10px] text-gray-400">HLS Path</label>
              <input v-model="form.hlsPath" class="input text-xs font-mono" />
            </div>
            <div>
              <label class="text-[10px] text-gray-400">RTSP Path</label>
              <input v-model="form.rtspPath" class="input text-xs font-mono" />
            </div>
          </div>
        </details>

        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" v-model="form.enabled" class="rounded" />
          {{ isUz ? 'Faol (yoqilgan)' : 'Активна (включена)' }}
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <button class="btn-ghost text-sm" @click="showAddForm = false">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
          <button class="btn-primary text-sm" @click="saveCamera" :disabled="!form.ip || !form.name">
            {{ editingId ? (isUz ? 'Saqlash' : 'Сохранить') : (isUz ? "Qoʻshish" : 'Добавить') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

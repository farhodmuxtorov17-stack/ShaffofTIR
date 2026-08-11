<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Camera, Video, Radio, WifiOff, RefreshCw } from 'lucide-vue-next'
import { useCameraStore } from '@/stores/camera'
import { buildSnapshotUrl, buildMjpegUrl, buildHlsUrl, type CameraConfig } from '@/api/camera.api'

const props = withDefaults(defineProps<{
  laneNumber?: number
  cameraId?: string
  status?: 'ONLINE' | 'OFFLINE' | 'CONNECTING'
  employeeName?: string | null
  isShooting?: boolean
  height?: number
  useRealCamera?: boolean
}>(), {
  laneNumber: 0,
  cameraId: '',
  status: 'ONLINE',
  employeeName: null,
  isShooting: false,
  height: 120,
  useRealCamera: true,
})

const cameraStore = useCameraStore()
const imgRef = ref<HTMLImageElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const streamStatus = ref<'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'SIMULATION'>('CONNECTING')
const snapshotKey = ref(Date.now())
const retryCount = ref(0)
let animationId: number | null = null
let refreshTimer: number | null = null
let hlsController: AbortController | null = null

// Find the camera config
const camera = computed<CameraConfig | undefined>(() => {
  if (props.cameraId) return cameraStore.cameras.find(c => c.id === props.cameraId)
  if (props.laneNumber) return cameraStore.getCameraByLane(props.laneNumber)
  return undefined
})

// Whether to show real camera or simulation
const useReal = computed(() => props.useRealCamera && camera.value && camera.value.enabled)

// Canvas simulation (fallback)
let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = []
let hitMarkers: Array<{ x: number; y: number; life: number }> = []
let frame = 0

function drawScene() {
  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const w = cv.width
  const h = cv.height
  frame++

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a0e1a')
  grad.addColorStop(0.4, '#141929')
  grad.addColorStop(1, '#0a0e1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  for (let i = 0; i < 20; i++) {
    const x = (frame * 0.5 + i * 31) % w
    const y = (frame * 0.3 + i * 17) % h
    ctx.fillRect(x, y, 1, 1)
  }

  // Target at far end
  const targetX = w * 0.5
  const targetY = h * 0.3
  const targetR = h * 0.14

  ctx.strokeStyle = 'rgba(180, 200, 220, 0.25)'
  ctx.lineWidth = 1
  for (let r = targetR; r > 0; r -= targetR / 5) {
    ctx.beginPath()
    ctx.arc(targetX, targetY, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(220, 60, 60, 0.3)'
  ctx.beginPath()
  ctx.arc(targetX, targetY, targetR * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Shooting figure
  if (props.employeeName) {
    const figX = w * 0.5
    const figY = h * 0.78
    const figH = h * 0.38
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(figX, figY, figH * 0.15, figH * 0.03, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(30, 35, 50, 0.95)'
    ctx.beginPath()
    ctx.arc(figX, figY - figH * 0.82, figH * 0.07, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(figX - figH * 0.1, figY - figH * 0.72, figH * 0.2, figH * 0.45, 4)
    ctx.fill()
    ctx.fillRect(figX - figH * 0.18, figY - figH * 0.58, figH * 0.07, figH * 0.25)
    ctx.fillRect(figX + figH * 0.11, figY - figH * 0.58, figH * 0.07, figH * 0.25)
    ctx.fillRect(figX - figH * 0.08, figY - figH * 0.25, figH * 0.06, figH * 0.25)
    ctx.fillRect(figX + figH * 0.02, figY - figH * 0.25, figH * 0.06, figH * 0.25)
    ctx.strokeStyle = 'rgba(80, 90, 110, 0.7)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(figX + figH * 0.12, figY - figH * 0.48)
    ctx.lineTo(figX + figH * 0.35, figY - figH * 0.55)
    ctx.stroke()
  }

  // Muzzle flash
  if (props.isShooting && props.employeeName) {
    const figX = w * 0.5
    const figY = h * 0.78
    const figH = h * 0.38
    const flashX = figX + figH * 0.35
    const flashY = figY - figH * 0.55
    if (Math.random() < 0.08) {
      particles.push({ x: flashX, y: flashY, vx: (Math.random() - 0.3) * 4 + 1, vy: (Math.random() - 0.5) * 3, life: 1 })
      if (Math.random() < 0.7) {
        const accuracy = 0.4 + Math.random() * 0.5
        const angle = Math.random() * Math.PI * 2
        const dist = (1 - accuracy) * targetR * 1.2
        hitMarkers.push({ x: targetX + Math.cos(angle) * dist, y: targetY + Math.sin(angle) * dist, life: 1 })
      }
    }
  }

  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.life * 8)
    fg.addColorStop(0, `rgba(255, 220, 80, ${p.life})`)
    fg.addColorStop(1, 'rgba(255, 100, 0, 0)')
    ctx.fillStyle = fg
    ctx.fillRect(p.x - 10, p.y - 10, 20, 20)
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.04
  })

  hitMarkers = hitMarkers.filter(m => m.life > 0)
  hitMarkers.forEach(m => {
    ctx.fillStyle = `rgba(255, 80, 30, ${m.life})`
    ctx.beginPath()
    ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2)
    ctx.fill()
    m.life -= 0.004
  })

  // HUD
  ctx.fillStyle = 'rgba(0, 255, 100, 0.7)'
  ctx.font = 'bold 10px monospace'
  if (props.laneNumber) ctx.fillText(`LANE-${String(props.laneNumber).padStart(2, '0')}`, 8, 16)
  ctx.fillText(new Date().toLocaleTimeString('en-GB'), w - 58, 16)
  if (props.status === 'ONLINE') {
    ctx.fillStyle = `rgba(255, 50, 50, ${0.6 + Math.sin(frame * 0.1) * 0.3})`
    ctx.beginPath()
    ctx.arc(w - 12, 14, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function animate() {
  drawScene()
  animationId = requestAnimationFrame(animate)
}

// === Real camera stream ===
function startSnapshotStream() {
  if (!camera.value) { startSimulation(); return }
  streamStatus.value = 'CONNECTING'
  retryCount.value = 0
  refreshSnapshot()
}

function refreshSnapshot() {
  if (!camera.value) return
  const url = buildSnapshotUrl(camera.value) + `?t=${Date.now()}`
  snapshotKey.value = Date.now()
  retryCount.value++
}

function handleImgLoad() {
  streamStatus.value = 'ONLINE'
  retryCount.value = 0
  if (camera.value) cameraStore.setStatus(camera.value.id, 'ONLINE')
  // Auto-refresh snapshot every 2 seconds
  if (camera.value?.streamType === 'SNAPSHOT') {
    refreshTimer = window.setTimeout(refreshSnapshot, 2000)
  }
}

function handleImgError() {
  if (retryCount.value < 3) {
    setTimeout(refreshSnapshot, 2000)
  } else {
    streamStatus.value = 'OFFLINE'
    if (camera.value) cameraStore.setStatus(camera.value.id, 'OFFLINE')
    // Fall back to simulation after 3 retries
    setTimeout(() => { if (streamStatus.value === 'OFFLINE') startSimulation() }, 3000)
  }
}

function startMjpegStream() {
  streamStatus.value = 'CONNECTING'
  // MJPEG streams directly in <img> — no refresh needed
  // The img src will be set in template
}

function startHlsStream() {
  streamStatus.value = 'CONNECTING'
  // HLS requires hls.js or native Safari support
  // For now, use video element with native HLS
}

function startSimulation() {
  streamStatus.value = 'SIMULATION'
  if (canvasRef.value) {
    canvasRef.value.width = 320
    canvasRef.value.height = props.height
  }
  if (animationId) cancelAnimationFrame(animationId)
  animate()
}

function startStream() {
  // Clean up previous
  if (animationId) { cancelAnimationFrame(animationId); animationId = null }
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }

  if (!useReal.value || !camera.value) {
    startSimulation()
    return
  }

  if (camera.value.streamType === 'SNAPSHOT') {
    startSnapshotStream()
  } else if (camera.value.streamType === 'MJPEG') {
    startMjpegStream()
  } else if (camera.value.streamType === 'HLS') {
    startHlsStream()
  } else {
    // RTSP not directly supported in browser — use simulation
    startSimulation()
  }
}

function retry() {
  retryCount.value = 0
  startStream()
}

watch(() => [props.cameraId, props.laneNumber, props.useRealCamera], () => {
  startStream()
})

onMounted(() => {
  startStream()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <div class="relative rounded-lg overflow-hidden bg-gray-900" :style="{ height: height + 'px' }">
    <!-- Real camera: SNAPSHOT mode -->
    <img
      v-if="useReal && camera?.streamType === 'SNAPSHOT' && (streamStatus === 'CONNECTING' || streamStatus === 'ONLINE')"
      :src="camera ? buildSnapshotUrl(camera) + '?t=' + snapshotKey : ''"
      :key="snapshotKey"
      crossorigin="anonymous"
      class="w-full h-full object-cover"
      :style="{ height: height + 'px' }"
      @load="handleImgLoad"
      @error="handleImgError"
      alt="Camera feed"
    />

    <!-- Real camera: MJPEG mode -->
    <img
      v-else-if="useReal && camera?.streamType === 'MJPEG' && (streamStatus === 'CONNECTING' || streamStatus === 'ONLINE')"
      :src="camera ? buildMjpegUrl(camera) : ''"
      crossorigin="anonymous"
      class="w-full h-full object-cover"
      :style="{ height: height + 'px' }"
      @load="handleImgLoad"
      @error="handleImgError"
      alt="MJPEG stream"
    />

    <!-- Real camera: HLS mode -->
    <video
      v-else-if="useReal && camera?.streamType === 'HLS' && (streamStatus === 'CONNECTING' || streamStatus === 'ONLINE')"
      ref="videoRef"
      :src="camera ? buildHlsUrl(camera) : ''"
      autoplay
      muted
      playsinline
      class="w-full h-full object-cover"
      :style="{ height: height + 'px' }"
      @loadeddata="streamStatus = 'ONLINE'"
      @error="handleImgError"
    ></video>

    <!-- Simulation (canvas fallback) -->
    <canvas
      v-if="streamStatus === 'SIMULATION' || (!useReal && status === 'ONLINE') || streamStatus === 'OFFLINE'"
      ref="canvasRef"
      class="w-full h-full object-cover"
      :style="{ height: height + 'px' }"
    ></canvas>

    <!-- Offline state -->
    <div v-if="streamStatus === 'OFFLINE'" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-gray-500">
      <WifiOff class="w-5 h-5 mb-1" />
      <span class="text-[10px] font-mono">OFFLINE</span>
      <button @click="retry" class="mt-1 text-[9px] text-brand-400 hover:text-brand-300 flex items-center gap-1">
        <RefreshCw class="w-2.5 h-2.5" /> QAYTA
      </button>
    </div>

    <!-- Connecting state -->
    <div v-if="streamStatus === 'CONNECTING'" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-gray-400 pointer-events-none">
      <Video class="w-5 h-5 mb-1 animate-pulse" />
      <span class="text-[10px] font-mono">ULANMOQDA...</span>
    </div>

    <!-- Top overlay bar -->
    <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10">
      <div class="flex items-center gap-1.5">
        <Radio class="w-3 h-3 text-brand-400" />
        <span class="text-[9px] font-mono text-brand-300 font-bold">
          {{ camera ? camera.ip : (laneNumber ? `CH-${laneNumber}` : 'CAM') }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span v-if="streamStatus === 'ONLINE'" class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span class="text-[8px] font-mono text-red-400 font-bold">LIVE</span>
        </span>
        <span v-else-if="streamStatus === 'SIMULATION'" class="text-[8px] font-mono text-yellow-500/60">SIM</span>
      </div>
    </div>

    <!-- Bottom overlay: employee name -->
    <div v-if="employeeName && (streamStatus === 'ONLINE' || streamStatus === 'SIMULATION')" class="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10">
      <p class="text-[9px] text-white/80 font-medium truncate">{{ employeeName }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Crosshair,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize2
} from 'lucide-vue-next'
import type { ShotResponse, OverlapGroup } from '@/types'
import { groupOverlappingShots } from '@/utils/overlap'

const props = withDefaults(
  defineProps<{
    imageUrl: string
    shots?: ShotResponse[]
    overlapGroups?: OverlapGroup[]
    baselineUrl?: string
    showOverlay?: boolean
  }>(),
  {
    shots: () => [],
    showOverlay: false,
  }
)

const viewerContainer = ref<HTMLDivElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

// Transform states
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const startDragX = ref(0)
const startDragY = ref(0)

// Visual toggles
const showMarkers = ref(true)
const activeOverlay = ref(props.showOverlay)
const overlayOpacity = ref(0.5)
const isFullscreen = ref(false)

// Image size for pixel coordinates mapping
const imageWidth = ref(1)
const imageHeight = ref(1)

// Hovered shot for coordinate tooltip
const hoveredShot = ref<ShotResponse | null>(null)

// Compute overlap groups if not passed explicitly
const computedOverlaps = computed(() => {
  if (props.overlapGroups && props.overlapGroups.length > 0) {
    return { groups: props.overlapGroups, singleShots: [] }
  }
  return groupOverlappingShots(props.shots)
})

// Check if absolute coordinates
const isAbsoluteCoords = computed(() => {
  return props.shots.some((s) => Math.abs(s.x) > 100 || Math.abs(s.y) > 100)
})

const getXPercent = (x: number) => {
  if (isAbsoluteCoords.value) {
    return (x / imageWidth.value) * 100
  }
  return x
}

const getYPercent = (y: number) => {
  if (isAbsoluteCoords.value) {
    return (y / imageHeight.value) * 100
  }
  return y
}

// Watchers
watch(() => props.showOverlay, (val) => {
  activeOverlay.value = val
})

// Handlers
const onImageLoad = () => {
  if (imageRef.value) {
    imageWidth.value = imageRef.value.naturalWidth || 1
    imageHeight.value = imageRef.value.naturalHeight || 1
  }
}

// Zoom logic
const handleZoom = (factor: number) => {
  zoom.value = Math.min(Math.max(zoom.value * factor, 0.5), 10)
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.15 : 0.85
  handleZoom(factor)
}

// Drag logic (panning)
const startDrag = (e: MouseEvent) => {
  if (e.button !== 0) return // Left click only
  isDragging.value = true
  startDragX.value = e.clientX - panX.value
  startDragY.value = e.clientY - panY.value
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  panX.value = e.clientX - startDragX.value
  panY.value = e.clientY - startDragY.value
}

const stopDrag = () => {
  isDragging.value = false
}

// Fullscreen handler
const toggleFullscreen = () => {
  if (!viewerContainer.value) return
  if (!document.fullscreenElement) {
    viewerContainer.value.requestFullscreen()
      .then(() => { isFullscreen.value = true })
      .catch((err) => console.error(err))
  } else {
    document.exitFullscreen()
      .then(() => { isFullscreen.value = false })
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// Reset view
const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

// Fit to screen
const fitToScreen = () => {
  if (!viewerContainer.value || !imageRef.value) return
  const containerW = viewerContainer.value.clientWidth
  const containerH = viewerContainer.value.clientHeight
  const imgW = imageWidth.value
  const imgH = imageHeight.value

  const scaleX = containerW / imgW
  const scaleY = containerH / imgH
  zoom.value = Math.min(scaleX, scaleY, 1) * 0.95
  panX.value = 0
  panY.value = 0
}

// Get marker color based on score
const getMarkerColor = (score: number) => {
  if (score === 10) return 'bg-brand-500 ring-brand-300 text-white'
  if (score >= 7) return 'bg-amber-400 ring-amber-200 text-gray-950'
  return 'bg-red-500 ring-red-300 text-white'
}
</script>

<template>
  <div
    ref="viewerContainer"
    class="relative overflow-hidden rounded-card border border-shell-border bg-gray-950 flex items-center justify-center select-none h-[500px] w-full"
  >
    <!-- Image Transform Wrapper -->
    <div
      class="relative cursor-grab active:cursor-grabbing transition-transform duration-75 origin-center"
      :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
      }"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @wheel="handleWheel"
    >
      <!-- Base Target Image -->
      <img
        ref="imageRef"
        :src="imageUrl"
        alt="Target View"
        class="max-w-none max-h-[75vh] pointer-events-none rounded border border-gray-800"
        @load="onImageLoad"
      />

      <!-- Baseline Overlay Image -->
      <img
        v-if="baselineUrl && activeOverlay"
        :src="baselineUrl"
        alt="Baseline Overlay"
        class="absolute inset-0 max-w-none max-h-[75vh] pointer-events-none transition-opacity duration-150 rounded"
        :style="{ opacity: overlayOpacity }"
      />

      <!-- Markers -->
      <template v-if="showMarkers">
        <!-- Grouped Overlapping Markers -->
        <div
          v-for="(group, idx) in computedOverlaps.groups"
          :key="`group-${idx}`"
          class="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
          :style="{
            left: `${getXPercent(group.centerX)}%`,
            top: `${getYPercent(group.centerY)}%`,
          }"
        >
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ring-4 shadow-lg cursor-pointer transition-all hover:scale-125"
            :class="getMarkerColor(group.shots[0].score)"
            @mouseenter="hoveredShot = group.shots[0]"
            @mouseleave="hoveredShot = null"
          >
            {{ group.shots[0].score }}
          </div>
          <span class="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full shadow border border-white">
            {{ group.badge }}
          </span>
        </div>

        <!-- Single Markers -->
        <div
          v-for="shot in computedOverlaps.singleShots"
          :key="`shot-${shot.id}`"
          class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          :style="{
            left: `${getXPercent(shot.x)}%`,
            top: `${getYPercent(shot.y)}%`,
          }"
        >
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 shadow-md cursor-pointer transition-all hover:scale-125"
            :class="getMarkerColor(shot.score)"
            @mouseenter="hoveredShot = shot"
            @mouseleave="hoveredShot = null"
          >
            {{ shot.score }}
          </div>
        </div>
      </template>
    </div>

    <!-- Coordinate Tooltip -->
    <div
      v-if="hoveredShot"
      class="absolute bottom-4 left-4 bg-gray-900/90 text-white text-xs px-3 py-2 rounded-btn shadow-lg border border-gray-700 pointer-events-none z-10 font-mono"
    >
      <div class="font-bold text-brand-400">Shot #{{ hoveredShot.id }}</div>
      <div>Score: {{ hoveredShot.score }}</div>
      <div>X: {{ hoveredShot.x.toFixed(1) }}</div>
      <div>Y: {{ hoveredShot.y.toFixed(1) }}</div>
      <div>Type: {{ hoveredShot.shot_type }}</div>
    </div>

    <!-- Zoom Level Indicator -->
    <div class="absolute top-4 left-4 bg-gray-950/85 backdrop-blur border border-gray-800 rounded px-2.5 py-1 text-[11px] font-mono text-gray-300 z-10 pointer-events-none">
      ZOOM: {{ Math.round(zoom * 100) }}%
    </div>

    <!-- Toolbar -->
    <div class="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-950/85 backdrop-blur border border-gray-800 p-1.5 rounded-btn shadow-lg z-10 pointer-events-auto">
      <button
        type="button"
        title="Yaqinlashtirish"
        class="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
        @click="handleZoom(1.2)"
      >
        <ZoomIn class="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Uzoqlashtirish"
        class="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
        @click="handleZoom(0.8)"
      >
        <ZoomOut class="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Asl holiga qaytarish"
        class="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
        @click="resetView"
      >
        <RotateCcw class="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Ekranga moslashtirish"
        class="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
        @click="fitToScreen"
      >
        <Maximize class="w-4 h-4" />
      </button>
      <div class="w-px h-5 bg-gray-800 mx-1" />
      <button
        type="button"
        :title="showMarkers ? 'Belgilarni yashirish' : 'Belgilarni ko\'rsatish'"
        class="p-2 rounded-btn transition focus:outline-none"
        :class="showMarkers ? 'text-brand-400 bg-brand-950/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'"
        @click="showMarkers = !showMarkers"
      >
        <Crosshair class="w-4 h-4" />
      </button>
      <button
        v-if="baselineUrl"
        type="button"
        :title="activeOverlay ? 'Andozani yashirish' : 'Andozani ko\'rsatish'"
        class="p-2 rounded-btn transition focus:outline-none"
        :class="activeOverlay ? 'text-brand-400 bg-brand-950/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'"
        @click="activeOverlay = !activeOverlay"
      >
        <component :is="activeOverlay ? Eye : EyeOff" class="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Butun ekran"
        class="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none"
        @click="toggleFullscreen"
      >
        <component :is="isFullscreen ? Minimize : Maximize2" class="w-4 h-4" />
      </button>
    </div>

    <!-- Overlay Opacity Slider -->
    <div
      v-if="baselineUrl && activeOverlay"
      class="absolute bottom-4 right-4 bg-gray-950/85 backdrop-blur border border-gray-800 px-3 py-2 rounded-btn shadow-lg z-10 pointer-events-auto flex items-center gap-3 text-xs text-gray-300"
    >
      <span>Andoza xiraligi:</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        v-model.number="overlayOpacity"
        class="w-24 accent-brand-500 bg-gray-800 h-1.5 rounded-lg cursor-pointer"
      />
      <span class="font-mono min-w-[3ch]">{{ Math.round(overlayOpacity * 100) }}%</span>
    </div>
  </div>
</template>

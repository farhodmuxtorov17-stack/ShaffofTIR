<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  shots?: Array<{ x: number; y: number; score: number }>
  size?: number
  animate?: boolean
}>(), {
  shots: () => [],
  size: 400,
  animate: true,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number
let phase = 0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = props.size * dpr
  canvas.height = props.size * dpr
  ctx.scale(dpr, dpr)

  const w = props.size
  const h = props.size
  const cx = w / 2
  const cy = h / 2
  const maxR = w * 0.46

  ctx.clearRect(0, 0, w, h)

  // Subtle shadow
  ctx.shadowColor = 'rgba(0,0,0,0.08)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4

  // Board background
  ctx.beginPath()
  ctx.arc(cx, cy, maxR + 6, 0, Math.PI * 2)
  ctx.fillStyle = '#fafafa'
  ctx.fill()

  ctx.shadowColor = 'transparent'

  // Scoring rings (10 zones)
  const ringColors = [
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac',
    '#4ade80', '#22c55e', '#16a34a', '#15803d',
    '#166534', '#14532d'
  ]

  for (let i = 0; i < 10; i++) {
    const outerR = maxR - (i / 10) * maxR * 0.88
    const innerR = maxR - ((i + 1) / 10) * maxR * 0.88
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true)
    ctx.fillStyle = ringColors[i]
    ctx.fill()
  }

  // Bullseye center
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.04, 0, Math.PI * 2)
  ctx.fillStyle = '#14532d'
  ctx.fill()

  // Crosshair
  ctx.strokeStyle = 'rgba(150,150,150,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - maxR, cy)
  ctx.lineTo(cx + maxR, cy)
  ctx.moveTo(cx, cy - maxR)
  ctx.lineTo(cx, cy + maxR)
  ctx.stroke()

  // Ring numbers
  ctx.fillStyle = 'rgba(100,100,100,0.35)'
  ctx.font = `600 ${Math.max(8, w * 0.025)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 1; i <= 9; i++) {
    const r = maxR - (i / 10) * maxR * 0.88 - maxR * 0.044
    const y = cy - r
    ctx.fillText(String(10 - i), cx, y)
  }

  // Shot markers
  props.shots.forEach((shot) => {
    const sx = cx + (shot.x - 0.5) * maxR * 1.8
    const sy = cy + (shot.y - 0.5) * maxR * 1.8
    const color = shot.score >= 8 ? '#ef4444' : shot.score >= 5 ? '#f59e0b' : '#6b7280'

    // Pulse ring for recent shots (animate)
    if (props.animate && shot.score >= 8) {
      const pulseR = 6 + Math.sin(phase + shot.x * 10) * 2
      ctx.beginPath()
      ctx.arc(sx, sy, pulseR + 4, 0, Math.PI * 2)
      ctx.strokeStyle = color + '40'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Hole
    ctx.beginPath()
    ctx.arc(sx, sy, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // Inner dot
    ctx.beginPath()
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  })

  // Subtle rotation indicator
  if (props.animate) {
    phase += 0.03
  }
}

function loop() {
  draw()
  animationId = requestAnimationFrame(loop)
}

watch(() => props.shots, () => draw(), { deep: true })

onMounted(() => {
  draw()
  if (props.animate) {
    animationId = requestAnimationFrame(loop)
  }
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="flex items-center justify-center">
    <canvas ref="canvasRef" :style="{ width: size + 'px', height: size + 'px' }" class="rounded-2xl" />
  </div>
</template>

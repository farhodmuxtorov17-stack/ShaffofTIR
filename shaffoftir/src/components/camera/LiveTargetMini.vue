<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Crosshair } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  laneNumber: number
  shooter?: string
  accuracy?: number
  shotsFired?: number
  hits?: number
  isShooting?: boolean
  size?: number
  compact?: boolean
}>(), {
  shooter: '',
  accuracy: 0,
  shotsFired: 0,
  hits: 0,
  isShooting: false,
  size: 120,
  compact: false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let hitMarks: Array<{ x: number; y: number; score: number; life: number; isNew: boolean }> = []
let frame = 0

function generateInitialHits() {
  hitMarks = []
  const count = props.hits || 0
  for (let i = 0; i < count; i++) {
    const isHit = Math.random() < (props.accuracy / 100 || 0.7)
    const angle = Math.random() * Math.PI * 2
    const accuracyFactor = isHit ? Math.random() * 0.5 : 0.5 + Math.random() * 0.5
    const dist = accuracyFactor * 0.42
    const score = isHit ? Math.floor(10 - accuracyFactor * 5) : 0
    hitMarks.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      score,
      life: 1,
      isNew: false,
    })
  }
}

function drawScene() {
  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  const w = cv.width
  const h = cv.height
  frame++

  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(30, 40, 60, 0.3)'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 10; i++) {
    const p = (i / 10) * w
    ctx.beginPath()
    ctx.moveTo(p, 0); ctx.lineTo(p, h)
    ctx.moveTo(0, p); ctx.lineTo(w, p)
    ctx.stroke()
  }

  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) * 0.42

  const ringColors = [
    'rgba(255, 255, 255, 0.08)',
    'rgba(255, 255, 255, 0.06)',
    'rgba(255, 255, 255, 0.05)',
    'rgba(200, 200, 200, 0.04)',
    'rgba(150, 150, 150, 0.06)',
  ]
  for (let i = 0; i < 6; i++) {
    const r = maxR * (1 - i * 0.16)
    if (r < 2) break
    ctx.strokeStyle = ringColors[i] || 'rgba(100, 100, 100, 0.05)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  if (!props.compact) {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.15)'
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    const scores = ['6', '7', '8', '9', '10']
    for (let i = 0; i < 5; i++) {
      const r = maxR * (0.84 - i * 0.16)
      ctx.fillText(scores[i], cx, cy - r + 3)
    }
  }

  ctx.fillStyle = 'rgba(220, 60, 60, 0.15)'
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.08, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(220, 60, 60, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy)
  ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR)
  ctx.stroke()

  if (props.isShooting && Math.random() < 0.04) {
    const isHit = Math.random() < (props.accuracy / 100 || 0.7)
    const angle = Math.random() * Math.PI * 2
    const accuracyFactor = isHit ? Math.random() * 0.4 : 0.4 + Math.random() * 0.55
    const dist = accuracyFactor * 0.42
    const score = isHit ? Math.max(6, Math.floor(10 - accuracyFactor * 5)) : 0
    hitMarks.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      score,
      life: 1,
      isNew: true,
    })
  }

  hitMarks.forEach(m => {
    const mx = m.x * w
    const my = m.y * h

    if (m.score > 0) {
      ctx.fillStyle = `rgba(255, 80, 30, ${m.life * 0.8})`
      ctx.beginPath()
      ctx.arc(mx, my, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(255, 120, 50, ${m.life * 0.4})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(mx, my, 6, 0, Math.PI * 2)
      ctx.stroke()

      if (m.isNew && m.life > 0.7 && !props.compact) {
        ctx.fillStyle = `rgba(255, 200, 100, ${m.life})`
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${m.score}`, mx, my - 8)
      }
    } else {
      ctx.strokeStyle = `rgba(150, 150, 150, ${m.life * 0.5})`
      ctx.lineWidth = 1.5
      const s = 3
      ctx.beginPath()
      ctx.moveTo(mx - s, my - s); ctx.lineTo(mx + s, my + s)
      ctx.moveTo(mx + s, my - s); ctx.lineTo(mx - s, my + s)
      ctx.stroke()
    }

    if (m.isNew) {
      m.life -= 0.003
    }
  })

  if (hitMarks.length > 30) {
    hitMarks = hitMarks.slice(-30)
  }

  ctx.fillStyle = 'rgba(0, 255, 100, 0.5)'
  ctx.font = 'bold 8px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`T-${String(props.laneNumber).padStart(2, '0')}`, 6, 12)

  if (props.shotsFired > 0) {
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(0, 200, 255, 0.5)'
    ctx.fillText(`${props.hits}/${props.shotsFired}`, w - 6, 12)
  }

  const scanY = (frame * 0.8) % h
  const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15)
  scanGrad.addColorStop(0, 'rgba(0, 255, 100, 0)')
  scanGrad.addColorStop(0.5, 'rgba(0, 255, 100, 0.03)')
  scanGrad.addColorStop(1, 'rgba(0, 255, 100, 0)')
  ctx.fillStyle = scanGrad
  ctx.fillRect(0, scanY - 15, w, 30)

  const vGrad = ctx.createRadialGradient(cx, cy, maxR * 0.5, cx, cy, maxR * 1.5)
  vGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vGrad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = vGrad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = `rgba(255, 50, 50, ${0.5 + Math.sin(frame * 0.08) * 0.3})`
  ctx.beginPath()
  ctx.arc(w - 8, h - 8, 2.5, 0, Math.PI * 2)
  ctx.fill()
}

function animate() {
  drawScene()
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  generateInitialHits()
  if (canvasRef.value) {
    canvasRef.value.width = props.size
    canvasRef.value.height = props.size
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

watch(() => props.hits, () => {
  if (Math.abs(hitMarks.filter(m => m.score > 0).length - props.hits) > 2) {
    generateInitialHits()
  }
})
</script>

<template>
  <div class="relative rounded-lg overflow-hidden bg-gray-900" :style="{ height: size + 'px' }">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
    <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
      <div class="flex items-center gap-1">
        <Crosshair class="w-3 h-3 text-emerald-400" />
        <span class="text-[8px] font-mono text-emerald-300 font-bold">TARGET</span>
      </div>
      <div v-if="isShooting" class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <span class="text-[7px] font-mono text-red-400 font-bold">LIVE</span>
      </div>
    </div>
    <div v-if="shotsFired > 0" class="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
      <div class="flex items-center justify-between">
        <span class="text-[8px] text-white/60 font-mono">{{ accuracy }}%</span>
        <span class="text-[8px] text-emerald-400/60 font-mono">{{ hits }}{{ compact ? '' : ' поп.' }}</span>
      </div>
    </div>
  </div>
</template>

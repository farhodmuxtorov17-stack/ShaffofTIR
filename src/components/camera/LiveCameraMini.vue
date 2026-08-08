<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Camera, Video, Radio } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  laneNumber: number
  status?: 'ONLINE' | 'OFFLINE' | 'CONNECTING'
  employeeName?: string | null
  isShooting?: boolean
  height?: number
}>(), {
  status: 'ONLINE',
  employeeName: null,
  isShooting: false,
  height: 120,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
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

  // Background gradient (dark range interior)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a0e1a')
  grad.addColorStop(0.4, '#141929')
  grad.addColorStop(1, '#0a0e1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Ambient noise (static dots)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  for (let i = 0; i < 20; i++) {
    const x = (frame * 0.5 + i * 31) % w
    const y = (frame * 0.3 + i * 17) % h
    ctx.fillRect(x, y, 1, 1)
  }

  // Floor perspective lines
  ctx.strokeStyle = 'rgba(60, 80, 120, 0.15)'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    const y = h * (0.5 + i * 0.08)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  // Side wall perspective
  ctx.strokeStyle = 'rgba(40, 60, 100, 0.2)'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.5)
  ctx.lineTo(w * 0.25, h * 0.42)
  ctx.lineTo(w * 0.75, h * 0.42)
  ctx.lineTo(w, h * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(w * 0.15, h * 0.5)
  ctx.moveTo(w, h)
  ctx.lineTo(w * 0.85, h * 0.5)
  ctx.stroke()

  // Target at far end
  const targetX = w * 0.5
  const targetY = h * 0.3
  const targetR = h * 0.14

  // Target glow
  const glowGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, targetR * 2)
  glowGrad.addColorStop(0, 'rgba(100, 120, 150, 0.08)')
  glowGrad.addColorStop(1, 'rgba(100, 120, 150, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, w, h)

  // Target rings
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.25)'
  ctx.lineWidth = 1
  for (let r = targetR; r > 0; r -= targetR / 5) {
    ctx.beginPath()
    ctx.arc(targetX, targetY, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Target center
  ctx.fillStyle = 'rgba(220, 60, 60, 0.3)'
  ctx.beginPath()
  ctx.arc(targetX, targetY, targetR * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Crosshair on target
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.1)'
  ctx.beginPath()
  ctx.moveTo(targetX - targetR, targetY)
  ctx.lineTo(targetX + targetR, targetY)
  ctx.moveTo(targetX, targetY - targetR)
  ctx.lineTo(targetX, targetY + targetR)
  ctx.stroke()

  // Shooting figure silhouette
  if (props.employeeName) {
    const figX = w * 0.5
    const figY = h * 0.78
    const figH = h * 0.38

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(figX, figY, figH * 0.15, figH * 0.03, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillStyle = 'rgba(30, 35, 50, 0.95)'
    // Head
    ctx.beginPath()
    ctx.arc(figX, figY - figH * 0.82, figH * 0.07, 0, Math.PI * 2)
    ctx.fill()
    // Body torso
    ctx.beginPath()
    ctx.roundRect(figX - figH * 0.1, figY - figH * 0.72, figH * 0.2, figH * 0.45, 4)
    ctx.fill()
    // Arms
    ctx.fillRect(figX - figH * 0.18, figY - figH * 0.58, figH * 0.07, figH * 0.25)
    ctx.fillRect(figX + figH * 0.11, figY - figH * 0.58, figH * 0.07, figH * 0.25)
    // Legs
    ctx.fillRect(figX - figH * 0.08, figY - figH * 0.25, figH * 0.06, figH * 0.25)
    ctx.fillRect(figX + figH * 0.02, figY - figH * 0.25, figH * 0.06, figH * 0.25)

    // Weapon
    ctx.strokeStyle = 'rgba(80, 90, 110, 0.7)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(figX + figH * 0.12, figY - figH * 0.48)
    ctx.lineTo(figX + figH * 0.35, figY - figH * 0.55)
    ctx.stroke()
    // Stock
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(figX + figH * 0.08, figY - figH * 0.45)
    ctx.lineTo(figX + figH * 0.05, figY - figH * 0.35)
    ctx.stroke()
  }

  // Muzzle flash when shooting
  if (props.isShooting && props.employeeName) {
    const figX = w * 0.5
    const figY = h * 0.78
    const figH = h * 0.38
    const flashX = figX + figH * 0.35
    const flashY = figY - figH * 0.55

    if (Math.random() < 0.08) {
      particles.push({
        x: flashX,
        y: flashY,
        vx: (Math.random() - 0.3) * 4 + 1,
        vy: (Math.random() - 0.5) * 3,
        life: 1,
      })
      // Hit marker on target
      if (Math.random() < 0.7) {
        const accuracy = 0.4 + Math.random() * 0.5
        const angle = Math.random() * Math.PI * 2
        const dist = (1 - accuracy) * targetR * 1.2
        hitMarkers.push({
          x: targetX + Math.cos(angle) * dist,
          y: targetY + Math.sin(angle) * dist,
          life: 1,
        })
      }
    }
  }

  // Update & draw particles (muzzle flash)
  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    // Flash
    const flashGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.life * 8)
    flashGrad.addColorStop(0, `rgba(255, 220, 80, ${p.life})`)
    flashGrad.addColorStop(0.4, `rgba(255, 150, 30, ${p.life * 0.5})`)
    flashGrad.addColorStop(1, 'rgba(255, 100, 0, 0)')
    ctx.fillStyle = flashGrad
    ctx.fillRect(p.x - 10, p.y - 10, 20, 20)

    // Smoke trail
    ctx.fillStyle = `rgba(150, 140, 120, ${p.life * 0.2})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2)
    ctx.fill()

    p.x += p.vx
    p.y += p.vy
    p.vy += 0.05
    p.life -= 0.04
  })

  // Hit markers on target
  hitMarkers = hitMarkers.filter(m => m.life > 0)
  hitMarkers.forEach(m => {
    // Impact
    ctx.fillStyle = `rgba(255, 80, 30, ${m.life})`
    ctx.beginPath()
    ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // Ring
    ctx.strokeStyle = `rgba(255, 120, 50, ${m.life * 0.6})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(m.x, m.y, 5 * (1 - m.life * 0.5), 0, Math.PI * 2)
    ctx.stroke()

    m.life -= 0.004
  })

  // Scanline effect
  const scanY = (frame * 1.5) % h
  const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
  scanGrad.addColorStop(0, 'rgba(0, 255, 100, 0)')
  scanGrad.addColorStop(0.5, 'rgba(0, 255, 100, 0.04)')
  scanGrad.addColorStop(1, 'rgba(0, 255, 100, 0)')
  ctx.fillStyle = scanGrad
  ctx.fillRect(0, scanY - 20, w, 40)

  // Vignette
  const vGrad = ctx.createRadialGradient(w/2, h/2, h * 0.3, w/2, h/2, h * 0.8)
  vGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vGrad.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = vGrad
  ctx.fillRect(0, 0, w, h)

  // HUD text
  ctx.fillStyle = 'rgba(0, 255, 100, 0.7)'
  ctx.font = 'bold 10px monospace'
  ctx.fillText(`LANE-${String(props.laneNumber).padStart(2, '0')}`, 8, 16)
  const timeStr = new Date().toLocaleTimeString('en-GB')
  ctx.fillText(timeStr, w - 58, 16)
  if (props.employeeName) {
    ctx.fillStyle = 'rgba(100, 200, 255, 0.6)'
    ctx.fillText(props.employeeName.substring(0, 22), 8, h - 8)
  }
  // REC indicator
  if (props.status === 'ONLINE') {
    ctx.fillStyle = `rgba(255, 50, 50, ${0.6 + Math.sin(frame * 0.1) * 0.3})`
    ctx.beginPath()
    ctx.arc(w - 12, 14, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 50, 50, 0.7)'
    ctx.font = 'bold 8px monospace'
    ctx.fillText('REC', w - 38, 16)
  }

  // Frame counter (bottom right)
  ctx.fillStyle = 'rgba(0, 255, 100, 0.3)'
  ctx.font = '8px monospace'
  ctx.fillText(`FR:${frame}`, w - 40, h - 8)
}

function animate() {
  drawScene()
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = 320
    canvasRef.value.height = props.height
  }
  if (props.status === 'ONLINE') {
    animate()
  } else {
    drawScene()
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="relative rounded-lg overflow-hidden bg-gray-900" :style="{ height: height + 'px' }">
    <!-- Live canvas -->
    <canvas v-if="status === 'ONLINE'" ref="canvasRef" class="w-full h-full object-cover" :style="{ height: height + 'px' }"></canvas>

    <!-- Offline state -->
    <div v-else-if="status === 'OFFLINE'" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
      <Camera class="w-6 h-6 mb-1" />
      <span class="text-[10px]">OFFLINE</span>
    </div>

    <!-- Connecting state -->
    <div v-else class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
      <Video class="w-6 h-6 mb-1 animate-pulse" />
      <span class="text-[10px]">CONNECTING...</span>
    </div>

    <!-- Top overlay bar -->
    <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
      <div class="flex items-center gap-1.5">
        <Radio class="w-3 h-3 text-brand-400" />
        <span class="text-[9px] font-mono text-brand-300 font-bold">CH-{{ laneNumber }}</span>
      </div>
      <div v-if="status === 'ONLINE'" class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <span class="text-[8px] font-mono text-red-400 font-bold">LIVE</span>
      </div>
    </div>

    <!-- Bottom overlay: employee name -->
    <div v-if="employeeName && status === 'ONLINE'" class="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
      <p class="text-[9px] text-white/80 font-medium truncate">{{ employeeName }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    size?: number
    inline?: boolean
    variant?: 'crosshair' | 'pulse' | 'radar' | 'orbits'
  }>(),
  { message: '', size: 48, inline: false, variant: 'crosshair' }
)
</script>

<template>
  <div class="creative-loader" :class="{ 'creative-loader--inline': inline }">
    <!-- Crosshair variant -->
    <div v-if="variant === 'crosshair'" class="crosshair-loader" :style="{ width: size + 'px', height: size + 'px' }">
      <svg class="crosshair-svg" :width="size" :height="size" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" stroke="rgba(22,163,74,0.08)" stroke-width="1" />
        <circle cx="50" cy="50" r="32" stroke="rgba(22,163,74,0.12)" stroke-width="1" />
        <circle cx="50" cy="50" r="20" stroke="rgba(22,163,74,0.18)" stroke-width="1" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="url(#clGrad)" stroke-width="2" class="cl-pulse" />
        <line x1="50" y1="5" x2="50" y2="20" stroke="url(#clGrad)" stroke-width="2" stroke-linecap="round" class="cl-line cl-line-top" />
        <line x1="50" y1="80" x2="50" y2="95" stroke="url(#clGrad)" stroke-width="2" stroke-linecap="round" class="cl-line cl-line-bottom" />
        <line x1="5" y1="50" x2="20" y2="50" stroke="url(#clGrad)" stroke-width="2" stroke-linecap="round" class="cl-line cl-line-left" />
        <line x1="80" y1="50" x2="95" y2="50" stroke="url(#clGrad)" stroke-width="2" stroke-linecap="round" class="cl-line cl-line-right" />
        <circle cx="50" cy="50" r="2.5" fill="#22c55e" class="cl-dot" />
        <defs>
          <linearGradient id="clGrad" x1="0" y1="0" x2="100" y2="100">
            <stop stop-color="#22c55e" />
            <stop offset="1" stop-color="#15803d" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Pulse variant -->
    <div v-else-if="variant === 'pulse'" class="pulse-loader" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="pulse-ring"></div>
      <div class="pulse-ring pulse-ring-2"></div>
      <div class="pulse-ring pulse-ring-3"></div>
      <div class="pulse-core"></div>
    </div>

    <!-- Radar variant -->
    <div v-else-if="variant === 'radar'" class="radar-loader" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="radar-circle"></div>
      <div class="radar-circle radar-circle-2"></div>
      <div class="radar-sweep"></div>
      <div class="radar-blip radar-blip-1"></div>
      <div class="radar-blip radar-blip-2"></div>
      <div class="radar-blip radar-blip-3"></div>
    </div>

    <!-- Orbits variant -->
    <div v-else-if="variant === 'orbits'" class="orbits-loader" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="orbit orbit-1"><div class="orbit-dot"></div></div>
      <div class="orbit orbit-2"><div class="orbit-dot"></div></div>
      <div class="orbit orbit-3"><div class="orbit-dot"></div></div>
      <div class="orbit-center"></div>
    </div>

    <span v-if="message" class="creative-loader__message">{{ message }}</span>
  </div>
</template>

<style scoped>
.creative-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.creative-loader--inline {
  display: inline-flex;
  flex-direction: row;
  padding: 0;
  gap: 8px;
}
.creative-loader__message {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.02em;
  animation: msgFade 2s ease-in-out infinite;
}
@keyframes msgFade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* === Crosshair === */
.crosshair-svg { animation: clRotate 3s linear infinite; }
@keyframes clRotate { to { transform: rotate(360deg); } }
.cl-pulse { animation: clPulse 1.5s ease-in-out infinite; transform-origin: center; }
@keyframes clPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
.cl-line { stroke-dasharray: 15; stroke-dashoffset: 15; animation: clLine 1.5s ease-in-out infinite; }
.cl-line-top { animation-delay: 0s; }
.cl-line-bottom { animation-delay: 0.2s; }
.cl-line-left { animation-delay: 0.4s; }
.cl-line-right { animation-delay: 0.6s; }
@keyframes clLine { 0%, 100% { stroke-dashoffset: 15; } 50% { stroke-dashoffset: 0; } }
.cl-dot { animation: clDot 1s ease-in-out infinite; transform-origin: center; }
@keyframes clDot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* === Pulse === */
.pulse-loader { position: relative; display: flex; align-items: center; justify-content: center; }
.pulse-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid #22c55e; opacity: 0;
  animation: pulseRing 2s cubic-bezier(0.16,1,0.3,1) infinite;
}
.pulse-ring-2 { animation-delay: 0.5s; }
.pulse-ring-3 { animation-delay: 1s; }
@keyframes pulseRing {
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 0; }
}
.pulse-core {
  width: 24%; height: 24%; border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #15803d);
  box-shadow: 0 0 20px rgba(22,163,74,0.4);
  animation: pulseCore 1s ease-in-out infinite;
}
@keyframes pulseCore { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

/* === Radar === */
.radar-loader { position: relative; border-radius: 50%; overflow: hidden; background: rgba(22,163,74,0.03); }
.radar-circle { position: absolute; border: 1px solid rgba(22,163,74,0.15); border-radius: 50%; inset: 15%; }
.radar-circle-2 { inset: 35%; }
.radar-sweep {
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(22,163,74,0.25) 40deg, transparent 60deg);
  animation: radarSweep 2s linear infinite;
}
@keyframes radarSweep { to { transform: rotate(360deg); } }
.radar-blip {
  position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  box-shadow: 0 0 8px rgba(22,163,74,0.6);
  animation: radarBlip 2s ease-in-out infinite;
}
.radar-blip-1 { top: 25%; left: 60%; }
.radar-blip-2 { top: 65%; left: 30%; animation-delay: 0.7s; }
.radar-blip-3 { top: 45%; left: 70%; animation-delay: 1.3s; }
@keyframes radarBlip { 0%, 100% { opacity: 0; } 30% { opacity: 1; } }

/* === Orbits === */
.orbits-loader { position: relative; display: flex; align-items: center; justify-content: center; }
.orbit {
  position: absolute; border: 1px solid rgba(22,163,74,0.1); border-radius: 50%;
  animation: orbitSpin 3s linear infinite;
}
.orbit-1 { inset: 0; }
.orbit-2 { inset: 20%; animation-duration: 2s; animation-direction: reverse; }
.orbit-3 { inset: 40%; animation-duration: 1.5s; }
.orbit-dot {
  position: absolute; width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e; top: -4px; left: 50%; transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(22,163,74,0.5);
}
.orbit-2 .orbit-dot { background: #0ea5e9; box-shadow: 0 0 10px rgba(14,165,233,0.5); }
.orbit-3 .orbit-dot { background: #6366f1; box-shadow: 0 0 10px rgba(99,102,241,0.5); }
@keyframes orbitSpin { to { transform: rotate(360deg); } }
.orbit-center {
  width: 14%; height: 14%; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #15803d);
  box-shadow: 0 0 16px rgba(22,163,74,0.3);
  animation: pulseCore 1.5s ease-in-out infinite;
}
</style>

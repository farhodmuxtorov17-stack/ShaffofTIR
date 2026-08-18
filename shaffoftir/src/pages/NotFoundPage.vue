<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const mounted = ref(false)

onMounted(() => { setTimeout(() => mounted.value = true, 50) })
</script>

<template>
  <div class="not-found-page">
    <div class="nf-bg">
      <div class="nf-glow nf-glow-1"></div>
      <div class="nf-glow nf-glow-2"></div>
      <div class="nf-grid"></div>
    </div>

    <div class="nf-content" :class="{ 'nf-enter': mounted }">
      <!-- Animated target -->
      <div class="nf-target">
        <svg viewBox="0 0 200 200" fill="none" class="nf-target-svg">
          <circle cx="100" cy="100" r="80" stroke="rgba(239,68,68,0.1)" stroke-width="1" />
          <circle cx="100" cy="100" r="55" stroke="rgba(239,68,68,0.15)" stroke-width="1" />
          <circle cx="100" cy="100" r="30" stroke="rgba(239,68,68,0.2)" stroke-width="1.5" />
          <circle cx="100" cy="100" r="10" fill="none" stroke="#ef4444" stroke-width="2" class="nf-target-core" />
          <line x1="100" y1="10" x2="100" y2="35" stroke="#ef4444" stroke-width="2" stroke-linecap="round" class="nf-cross nf-cross-t" />
          <line x1="100" y1="165" x2="100" y2="190" stroke="#ef4444" stroke-width="2" stroke-linecap="round" class="nf-cross nf-cross-b" />
          <line x1="10" y1="100" x2="35" y2="100" stroke="#ef4444" stroke-width="2" stroke-linecap="round" class="nf-cross nf-cross-l" />
          <line x1="165" y1="100" x2="190" y2="100" stroke="#ef4444" stroke-width="2" stroke-linecap="round" class="nf-cross nf-cross-r" />
          <circle cx="100" cy="100" r="2.5" fill="#ef4444" class="nf-target-dot" />
        </svg>
        <span class="nf-404">404</span>
      </div>

      <h1 class="nf-title">{{ isUz ? 'Sahiba topilmadi' : 'Мишень не найдена' }}</h1>
      <p class="nf-subtitle">{{ isUz ? "Bu manzilga murojaat qilib boʻlmadi. Ehtimol, sahifa koʻchirilgan yoki oʻchirilgan." : 'Эта страница вне зоны поражения. Возможно, она была перемещена или больше не существует.' }}</p>

      <div class="nf-actions">
        <button class="nf-btn nf-btn-primary" @click="router.push('/dashboard')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ isUz ? 'Bosh sahifa' : 'На главную' }}
        </button>
        <button class="nf-btn nf-btn-secondary" @click="router.back()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 12h18M3 12l6-6M3 12l6 6" />
          </svg>
          {{ isUz ? 'Orqaga' : 'Назад' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0f1a;
  overflow: hidden;
}

.nf-bg { position: absolute; inset: 0; overflow: hidden; }
.nf-glow {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.3;
  animation: nfGlow 12s ease-in-out infinite;
}
.nf-glow-1 { width: 500px; height: 500px; background: radial-gradient(circle, #ef4444, transparent 70%); top: -100px; left: -100px; }
.nf-glow-2 { width: 400px; height: 400px; background: radial-gradient(circle, #22c55e, transparent 70%); bottom: -100px; right: -100px; animation-delay: -6s; }
@keyframes nfGlow { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
.nf-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}

.nf-content { position: relative; z-index: 10; text-align: center; padding: 40px 20px; max-width: 480px; }
.nf-enter { animation: nfEnter 0.6s cubic-bezier(0.16,1,0.3,1); }
@keyframes nfEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.nf-target { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
.nf-target-svg { width: 200px; height: 200px; animation: nfRotate 8s linear infinite; }
@keyframes nfRotate { to { transform: rotate(360deg); } }
.nf-target-core { animation: nfCorePulse 1.5s ease-in-out infinite; transform-origin: center; }
@keyframes nfCorePulse { 0%, 100% { opacity: 0.3; r: 6; } 50% { opacity: 1; r: 14; } }
.nf-cross { stroke-dasharray: 25; stroke-dashoffset: 25; animation: nfCross 1.5s ease-in-out infinite; }
.nf-cross-t { animation-delay: 0s; }
.nf-cross-b { animation-delay: 0.15s; }
.nf-cross-l { animation-delay: 0.3s; }
.nf-cross-r { animation-delay: 0.45s; }
@keyframes nfCross { 0%, 100% { stroke-dashoffset: 25; } 50% { stroke-dashoffset: 0; } }
.nf-target-dot { animation: nfDotPulse 1s ease-in-out infinite; transform-origin: center; }
@keyframes nfDotPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.nf-404 {
  position: absolute; font-size: 48px; font-weight: 800; color: rgba(239,68,68,0.9);
  letter-spacing: -0.02em; text-shadow: 0 0 40px rgba(239,68,68,0.3);
}

.nf-title { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
.nf-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 28px; }

.nf-actions { display: flex; gap: 10px; justify-content: center; }
.nf-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; border: none;
}
.nf-btn-primary {
  background: linear-gradient(135deg, #22c55e, #15803d); color: white;
  box-shadow: 0 4px 14px -2px rgba(22,163,74,0.4);
}
.nf-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px -2px rgba(22,163,74,0.5); }
.nf-btn-secondary {
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}
.nf-btn-secondary:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }

@media (max-width: 500px) {
  .nf-target-svg { width: 160px; height: 160px; }
  .nf-404 { font-size: 36px; }
  .nf-title { font-size: 18px; }
  .nf-subtitle { font-size: 12px; }
  .nf-actions { flex-direction: column; }
  .nf-btn { width: 100%; justify-content: center; }
}
</style>

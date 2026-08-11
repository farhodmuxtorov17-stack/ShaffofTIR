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
  <div class="forbidden-page">
    <div class="fb-bg">
      <div class="fb-glow fb-glow-1"></div>
      <div class="fb-glow fb-glow-2"></div>
      <div class="fb-grid"></div>
    </div>

    <div class="fb-content" :class="{ 'fb-enter': mounted }">
      <!-- Animated shield -->
      <div class="fb-shield">
        <svg viewBox="0 0 200 220" fill="none" class="fb-shield-svg">
          <defs>
            <linearGradient id="fbShieldGrad" x1="100" y1="10" x2="100" y2="210" gradientUnits="userSpaceOnUse">
              <stop stop-color="#f59e0b" />
              <stop offset="1" stop-color="#d97706" />
            </linearGradient>
          </defs>
          <path d="M100 15L30 40v60c0 50 30 85 70 105 40-20 70-55 70-105V40L100 15z"
            fill="rgba(245,158,11,0.05)" stroke="url(#fbShieldGrad)" stroke-width="2" stroke-linejoin="round" />
          <path d="M100 40L55 55v42c0 35 20 60 45 72 25-12 45-37 45-72V55L100 40z"
            fill="none" stroke="url(#fbShieldGrad)" stroke-width="1.5" opacity="0.4" />
          <!-- Lock body -->
          <rect x="78" y="105" width="44" height="36" rx="6" fill="rgba(245,158,11,0.1)" stroke="url(#fbShieldGrad)" stroke-width="2" class="fb-lock-body" />
          <path d="M83 105v-8c0-9 8-17 17-17s17 8 17 17v8" stroke="url(#fbShieldGrad)" stroke-width="2" fill="none" class="fb-lock-shackle" />
          <circle cx="100" cy="123" r="4" fill="#f59e0b" class="fb-lock-dot" />
          <line x1="100" y1="127" x2="100" y2="135" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" class="fb-lock-line" />
        </svg>
        <span class="fb-403">403</span>
      </div>

      <h1 class="fb-title">{{ isUz ? "Ruxsat berilmagan" : 'Доступ закрыт' }}</h1>
      <p class="fb-subtitle">{{ isUz ? "Sizda ushbu sahifaga kirish huquqi yoʻq. administratorga murojaat qiling." : 'У вас нет прав для просмотра этой страницы. Обратитесь к администратору для получения доступа.' }}</p>

      <div class="fb-actions">
        <button class="fb-btn fb-btn-primary" @click="router.push('/dashboard')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ isUz ? 'Bosh sahifa' : 'На главную' }}
        </button>
        <button class="fb-btn fb-btn-secondary" @click="router.back()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 12h18M3 12l6-6M3 12l6 6" />
          </svg>
          {{ isUz ? "Orqaga" : 'Назад' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forbidden-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0f1a;
  overflow: hidden;
}

.fb-bg { position: absolute; inset: 0; overflow: hidden; }
.fb-glow {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25;
  animation: fbGlow 14s ease-in-out infinite;
}
.fb-glow-1 { width: 450px; height: 450px; background: radial-gradient(circle, #f59e0b, transparent 70%); top: -80px; right: -80px; }
.fb-glow-2 { width: 380px; height: 380px; background: radial-gradient(circle, #dc2626, transparent 70%); bottom: -60px; left: -60px; animation-delay: -7s; }
@keyframes fbGlow { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(1.1); } }
.fb-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}

.fb-content { position: relative; z-index: 10; text-align: center; padding: 40px 20px; max-width: 480px; }
.fb-enter { animation: fbEnter 0.6s cubic-bezier(0.16,1,0.3,1); }
@keyframes fbEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.fb-shield { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
.fb-shield-svg { width: 200px; height: 220px; animation: fbFloat 4s ease-in-out infinite; }
@keyframes fbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.fb-lock-shackle { animation: fbShackle 2s ease-in-out infinite; transform-origin: center; }
@keyframes fbShackle { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
.fb-lock-dot { animation: fbDot 1s ease-in-out infinite; transform-origin: center; }
@keyframes fbDot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.fb-403 {
  position: absolute; font-size: 36px; font-weight: 800; color: rgba(245,158,11,0.9);
  letter-spacing: -0.02em; text-shadow: 0 0 40px rgba(245,158,11,0.3); bottom: 20px;
}

.fb-title { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
.fb-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 28px; }

.fb-actions { display: flex; gap: 10px; justify-content: center; }
.fb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; border: none;
}
.fb-btn-primary {
  background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
  box-shadow: 0 4px 14px -2px rgba(245,158,11,0.4);
}
.fb-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px -2px rgba(245,158,11,0.5); }
.fb-btn-secondary {
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}
.fb-btn-secondary:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }

@media (max-width: 500px) {
  .fb-shield-svg { width: 160px; height: 176px; }
  .fb-403 { font-size: 28px; }
  .fb-title { font-size: 18px; }
  .fb-subtitle { font-size: 12px; }
  .fb-actions { flex-direction: column; }
  .fb-btn { width: 100%; justify-content: center; }
}
</style>

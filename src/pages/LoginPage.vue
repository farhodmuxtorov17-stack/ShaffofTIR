<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { Eye, ArrowRight, Globe, Terminal, ShieldCheck, Lock, Smartphone } from 'lucide-vue-next'
import MiniAppPreview from '@/components/miniapp/MiniAppPreview.vue'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t, setLocale } = useI18n()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const step = ref<'email' | 'password'>('email')

// TechSpec separate login state
const techSpecMode = ref(false)
const techSpecPin = reactive({ d1: '', d2: '', d3: '', d4: '' })
const techSpecError = ref(false)
const miniAppMode = ref(false)

function nextStep() {
  if (!form.email) {
    error.value = t('login.fillAll')
    return
  }
  error.value = null
  step.value = 'password'
}

async function handleLogin() {
  if (!form.email || !form.password) {
    error.value = t('login.fillAll')
    return
  }
  loading.value = true
  error.value = null
  try {
    await authStore.login(form)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || t('login.error')
  } finally {
    loading.value = false
  }
}

function backToEmail() {
  step.value = 'email'
  error.value = null
}

// TechSpec: separate login flow with PIN access
function openTechSpec() {
  techSpecMode.value = true
  techSpecPin.d1 = ''
  techSpecPin.d2 = ''
  techSpecPin.d3 = ''
  techSpecPin.d4 = ''
  techSpecError.value = false
}

function closeTechSpec() {
  techSpecMode.value = false
  techSpecPin.d1 = ''
  techSpecPin.d2 = ''
  techSpecPin.d3 = ''
  techSpecPin.d4 = ''
  techSpecError.value = false
}

function handleTechSpecPin(e: Event, pos: number) {
  const input = e.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '').slice(0, 1)

  if (pos === 1) techSpecPin.d1 = val
  if (pos === 2) techSpecPin.d2 = val
  if (pos === 3) techSpecPin.d3 = val
  if (pos === 4) techSpecPin.d4 = val

  if (val && pos < 4) {
    const next = document.getElementById(`tp-${pos + 1}`)
    next?.focus()
  }

  if (techSpecPin.d1 && techSpecPin.d2 && techSpecPin.d3 && techSpecPin.d4) {
    submitTechSpecPin()
  }
}

function submitTechSpecPin() {
  const pin = techSpecPin.d1 + techSpecPin.d2 + techSpecPin.d3 + techSpecPin.d4
  if (pin === '8424') {
    form.email = 'techspec@shaffoftir.uz'
    form.password = 'techspec123'
    techSpecMode.value = false
    loading.value = true
    authStore.login(form).then(() => {
      router.push('/techspec')
    }).catch(() => {
      error.value = locale.value === 'uz' ? 'Tizim xatosi' : 'Системная ошибка'
    }).finally(() => {
      loading.value = false
    })
  } else {
    techSpecError.value = true
    techSpecPin.d1 = ''
    techSpecPin.d2 = ''
    techSpecPin.d3 = ''
    techSpecPin.d4 = ''
    setTimeout(() => {
      document.getElementById('tp-1')?.focus()
      techSpecError.value = false
    }, 800)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault()
    openTechSpec()
  }
}
</script>

<template>
  <div class="login-screen" @keydown="handleKeydown">
    <!-- Aurora animated background -->
    <div class="aurora-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
      <div class="aurora-veil"></div>
      <div class="aurora-grid"></div>
    </div>

    <!-- Language toggle -->
    <button class="lang-toggle" @click="setLocale(locale === 'ru' ? 'uz' : 'ru')">
      <Globe class="w-3.5 h-3.5" />
      {{ locale === 'ru' ? "O'zbekcha" : 'Русский' }}
    </button>

    <!-- Login card -->
    <div class="login-card-wrapper">
      <div class="login-card">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-badge">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L8 10v14c0 10 7 18 16 20 9-2 16-10 16-20V10L24 4z" fill="rgba(22,163,74,0.08)" stroke="url(#logoGrad)" stroke-width="2.5" stroke-linejoin="round"/>
              <circle cx="24" cy="22" r="12" stroke="url(#logoGrad)" stroke-width="1.5" fill="none" opacity="0.3"/>
              <circle cx="24" cy="22" r="8" stroke="url(#logoGrad)" stroke-width="1.5" fill="none" opacity="0.5"/>
              <circle cx="24" cy="22" r="4" stroke="url(#logoGrad)" stroke-width="1.5" fill="none" opacity="0.7"/>
              <circle cx="24" cy="22" r="1.8" fill="#22c55e"/>
              <defs>
                <linearGradient id="logoGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#22c55e"/>
                  <stop offset="1" stop-color="#15803d"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="app-title">ShaffofTIR</h1>
          <p class="app-subtitle">{{ locale === 'uz' ? "O'q otish tayyorgarligini boshqarish tizimi" : 'Система управления огневой подготовкой' }}</p>
        </div>

        <!-- Step 1: Email -->
        <template v-if="step === 'email'">
          <form @submit.prevent="nextStep" class="form-section">
            <div class="input-group">
              <label class="input-label">{{ locale === 'uz' ? 'Email manzilingiz' : 'Ваш email' }}</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="name@shaffoftir.uz"
                autofocus
                class="form-input"
              />
            </div>

            <div v-if="error" class="error-text">{{ error }}</div>

            <div class="form-actions">
              <p class="forgot-link">{{ locale === 'uz' ? "Parolni unutdingizmi?" : 'Забыли пароль?' }}</p>
              <button type="submit" class="btn-aurora">
                {{ locale === 'uz' ? 'Keyingi' : 'Далее' }}
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </template>

        <!-- Step 2: Password -->
        <template v-else>
          <form @submit.prevent="handleLogin" class="form-section">
            <div class="user-preview">
              <div class="user-avatar">
                <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><circle cx="12" cy="8" r="4" opacity="0.8"/><path d="M12 14c-4.4 0-8 2.7-8 6v2h16v-2c0-3.3-3.6-6-8-6z" opacity="0.6"/></svg>
              </div>
              <div>
                <p class="user-email">{{ form.email }}</p>
                <button type="button" @click="backToEmail" class="change-account">{{ locale === 'uz' ? "Boshqa akkaunt" : 'Другой аккаунт' }}</button>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ locale === 'uz' ? 'Parolingizni kiriting' : 'Введите пароль' }}</label>
              <div class="password-wrapper">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autofocus
                  class="form-input pr-12"
                />
                <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <span v-else class="text-xs">{{ locale === 'uz' ? "Yashirish" : 'Скрыть' }}</span>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-text">{{ error }}</div>

            <div class="form-actions">
              <p class="forgot-link">{{ locale === 'uz' ? "Parolni unutdingizmi?" : 'Забыли пароль?' }}</p>
              <button
                type="submit"
                :disabled="loading"
                class="btn-aurora"
              >
                <span v-if="loading" class="mini-spinner"></span>
                {{ locale === 'uz' ? 'Kirish' : 'Войти' }}
                <ArrowRight v-if="!loading" class="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </template>

        <!-- Security note -->
        <div class="security-note">
          <ShieldCheck class="w-3 h-3 text-green-400/60" />
          <span>{{ locale === 'uz' ? 'Faqat ruxsat etilgan foydalanuvchilar uchun' : 'Только для авторизованных пользователей' }}</span>
        </div>
      </div>

      <!-- Telegram Mini App button -->
      <button class="tg-miniapp-btn" @click="miniAppMode = true">
        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
        <span>Telegram Mini App</span>
        <Smartphone class="w-3 h-3 opacity-50" />
      </button>

      <!-- TechSpec access button - visible -->
      <button class="techspec-link" @click="openTechSpec">
        <Lock class="w-3.5 h-3.5" />
        <span>{{ locale === 'uz' ? 'Texnik mutaxassis kirishi' : 'Вход для тех. специалиста' }}</span>
      </button>

      <p class="version-text">ShaffofTIR v3.3 &middot; 2026</p>
    </div>

    <!-- TechSpec PIN modal -->
    <transition name="fade">
      <div
        v-if="techSpecMode"
        class="techspec-overlay"
        @click.self="closeTechSpec"
      >
        <div class="techspec-modal">
          <div class="techspec-header">
            <div class="techspec-icon">
              <Terminal class="w-5 h-5 text-cyan-400" />
            </div>
            <h3 class="techspec-title">{{ locale === 'uz' ? 'Texnik kirish' : 'Технический доступ' }}</h3>
            <p class="techspec-sub">{{ locale === 'uz' ? 'PIN-kodni kiriting' : 'Введите PIN-код' }}</p>
          </div>

          <div class="pin-row" :class="{ 'animate-shake': techSpecError }">
            <input
              id="tp-1"
              v-model="techSpecPin.d1"
              @input="handleTechSpecPin($event, 1)"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pin-box"
              :class="{ 'pin-error': techSpecError }"
              autofocus
            />
            <input
              id="tp-2"
              v-model="techSpecPin.d2"
              @input="handleTechSpecPin($event, 2)"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pin-box"
              :class="{ 'pin-error': techSpecError }"
            />
            <input
              id="tp-3"
              v-model="techSpecPin.d3"
              @input="handleTechSpecPin($event, 3)"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pin-box"
              :class="{ 'pin-error': techSpecError }"
            />
            <input
              id="tp-4"
              v-model="techSpecPin.d4"
              @input="handleTechSpecPin($event, 4)"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pin-box"
              :class="{ 'pin-error': techSpecError }"
            />
          </div>

          <p v-if="techSpecError" class="pin-error-text">
            {{ locale === 'uz' ? 'Noto‘g‘ri PIN' : 'Неверный PIN' }}
          </p>

          <button @click="closeTechSpec" class="techspec-cancel">
            {{ locale === 'uz' ? 'Bekor qilish' : 'Отмена' }}
          </button>

          <div class="techspec-hint">
            <code>Ctrl+Shift+T</code>
          </div>
        </div>
      </div>
    </transition>
    <!-- Telegram Mini App Preview -->
    <transition name="fade">
      <MiniAppPreview v-if="miniAppMode" @close="miniAppMode = false" />
    </transition>
  </div>
</template>

<style scoped>
.login-screen {
  position: fixed;
  inset: 0;
  background: #0a0f1a;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Aurora Background */
.aurora-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: aurora-float 20s ease-in-out infinite;
}

.aurora-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #16a34a, transparent 70%);
  top: -100px;
  left: -100px;
}

.aurora-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #0ea5e9, transparent 70%);
  bottom: -50px;
  right: -50px;
  animation-delay: -7s;
}

.aurora-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes aurora-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}

.aurora-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,15,26,0.3) 0%, rgba(10,15,26,0.8) 100%);
}

.aurora-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

/* Language Toggle */
.lang-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;
}
.lang-toggle:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
}

/* Login Card */
.login-card-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-card {
  width: 380px;
  padding: 36px 32px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 64px -16px rgba(0,0,0,0.5);
}

.logo-section {
  text-align: center;
  margin-bottom: 28px;
}

.logo-badge {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}

/* Form */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}
.form-input:focus {
  border-color: rgba(34,197,94,0.5);
  background: rgba(255,255,255,0.06);
}
.form-input::placeholder {
  color: rgba(255,255,255,0.2);
}

.password-wrapper {
  position: relative;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.toggle-pw:hover { color: rgba(255,255,255,0.6); }

.user-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  margin-bottom: 4px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
}

.user-email {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
}

.change-account {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
}
.change-account:hover { color: rgba(255,255,255,0.6); }

.error-text {
  font-size: 12px;
  color: #ef4444;
  padding: 8px 12px;
  background: rgba(239,68,68,0.08);
  border-radius: 8px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.forgot-link {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
}

.btn-aurora {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 100px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px -4px rgba(22,163,74,0.5);
}
.btn-aurora:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -4px rgba(22,163,74,0.6);
}
.btn-aurora:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Security note */
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.security-note span {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
}

/* TechSpec link - visible */
.techspec-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(6,182,212,0.08);
  border: 1px solid rgba(6,182,212,0.15);
  color: rgba(6,182,212,0.7);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.techspec-link:hover {
  background: rgba(6,182,212,0.12);
  border-color: rgba(6,182,212,0.3);
  color: rgba(6,182,212,0.9);
}

/* Telegram Mini App button */
.tg-miniapp-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 16px;
  border-radius: 100px;
  background: linear-gradient(135deg, rgba(42,171,238,0.12), rgba(34,158,229,0.08));
  border: 1px solid rgba(42,171,238,0.25);
  color: rgba(42,171,238,0.85);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}
.tg-miniapp-btn:hover {
  background: linear-gradient(135deg, rgba(42,171,238,0.2), rgba(34,158,229,0.15));
  border-color: rgba(42,171,238,0.5);
  color: rgba(42,171,238,1);
  transform: translateY(-1px);
}

/* Version */
.version-text {
  font-size: 11px;
  color: rgba(255,255,255,0.15);
  margin-top: 12px;
}

/* TechSpec modal */
.techspec-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.techspec-modal {
  background: #0f1419;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 32px;
  width: 360px;
  box-shadow: 0 24px 64px -16px rgba(0,0,0,0.8);
}

.techspec-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.techspec-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.techspec-title {
  font-size: 18px;
  font-weight: 500;
  color: #e5e7eb;
  margin: 0;
}

.techspec-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  margin-top: 4px;
}

.pin-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pin-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  background: #1a1f2e;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #e5e7eb;
  outline: none;
  transition: all 0.2s;
}
.pin-box:focus {
  border-color: #06b6d4;
}
.pin-error {
  border-color: #ef4444 !important;
}

.pin-error-text {
  text-align: center;
  font-size: 12px;
  color: #ef4444;
  margin-bottom: 16px;
}

.techspec-cancel {
  display: block;
  margin: 0 auto;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}
.techspec-cancel:hover { color: rgba(255,255,255,0.6); }

.techspec-hint {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  text-align: center;
}
.techspec-hint code {
  font-size: 10px;
  color: rgba(255,255,255,0.15);
  font-family: 'JetBrains Mono', monospace;
}

/* Animations */
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

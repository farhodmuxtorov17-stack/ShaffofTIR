<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/i18n'
import { X, Smartphone, Tablet, Globe, Shield, Wrench, Target, Users, Monitor } from 'lucide-vue-next'

const emit = defineEmits<{ close: [] }>()
const { locale } = useI18n()

type DeviceType = 'phone' | 'tablet'
type RoleType = 'SUPER_ADMIN' | 'MANAGER' | 'INSTRUCTOR' | 'TECHSPEC' | 'EMPLOYEE'

const device = ref<DeviceType>('phone')
const selectedRole = ref<RoleType>('SUPER_ADMIN')

const isUz = computed(() => locale.value === 'uz')

const L = computed(() => isUz.value ? {
  title: 'Telegram Mini App',
  subtitle: 'ShaffofTIR mobil ilovada',
  phone: 'Telefon',
  tablet: 'Planshet',
  selectDevice: 'Qurilma tanlang',
  selectRole: 'Rol tanlang',
  openApp: 'Ilovani ochish',
  close: 'Yopish',
  roles: {
    SUPER_ADMIN: 'Bosh admin',
    MANAGER: 'Rahbar',
    INSTRUCTOR: 'Instruktor',
    TECHSPEC: 'Tex. mutaxassis',
    EMPLOYEE: 'Xodim',
  },
  rolesDesc: {
    SUPER_ADMIN: 'To\\u02BBliq huquqlar',
    MANAGER: 'Tahlil va hisobotlar',
    INSTRUCTOR: 'Otish boshqaruvi',
    TECHSPEC: 'Infrastruktura',
    EMPLOYEE: 'Shaxsiy ma\\u02BClumotlar',
  },
} : {
  title: 'Telegram Mini App',
  subtitle: 'ShaffofTIR в мобильном',
  phone: 'Телефон',
  tablet: 'Планшет',
  selectDevice: 'Устройство',
  selectRole: 'Роль',
  openApp: 'Открыть приложение',
  close: 'Закрыть',
  roles: {
    SUPER_ADMIN: 'Супер админ',
    MANAGER: 'Рахбар',
    INSTRUCTOR: 'Инструктор',
    TECHSPEC: 'Тех. специалист',
    EMPLOYEE: 'Сотрудник',
  },
  rolesDesc: {
    SUPER_ADMIN: 'Полный доступ',
    MANAGER: 'Аналитика и отчёты',
    INSTRUCTOR: 'Управление стрельбами',
    TECHSPEC: 'Инфраструктура',
    EMPLOYEE: 'Личные данные',
  },
})

const roleConfig: Record<RoleType, { icon: any; color: string; email: string; password: string; bg: string }> = {
  SUPER_ADMIN: { icon: Shield, color: '#dc2626', email: 'admin@shaffoftir.uz', password: 'admin123', bg: 'from-red-500/20 to-red-700/20' },
  MANAGER: { icon: Monitor, color: '#18181b', email: 'manager@shaffoftir.uz', password: 'manager123', bg: 'from-gray-500/20 to-gray-700/20' },
  INSTRUCTOR: { icon: Users, color: '#059669', email: 'instructor@shaffoftir.uz', password: 'instructor123', bg: 'from-emerald-500/20 to-emerald-700/20' },
  TECHSPEC: { icon: Wrench, color: '#d97706', email: 'techspec@shaffoftir.uz', password: 'techspec123', bg: 'from-amber-500/20 to-amber-700/20' },
  EMPLOYEE: { icon: Target, color: '#6366f1', email: 'soldier@shaffoftir.uz', password: 'soldier123', bg: 'from-indigo-500/20 to-indigo-700/20' },
}

const iframeKey = ref(0)
const iframeSrc = computed(() => {
  const base = window.location.origin + window.location.pathname
  return `${base}#/login?role=${selectedRole.value}&miniapp=1&device=${device.value}`
})
</script>

<template>
  <div class="miniapp-overlay" @click.self="emit('close')">
    <div class="miniapp-container">
      <button class="close-btn" @click="emit('close')">
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="miniapp-header">
        <div class="tg-badge">
          <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
          </svg>
        </div>
        <div>
          <h2 class="miniapp-title">{{ L.title }}</h2>
          <p class="miniapp-subtitle">{{ L.subtitle }}</p>
        </div>
      </div>

      <!-- Device + Role selectors -->
      <div class="selector-section">
        <!-- Device -->
        <div class="selector-group">
          <p class="selector-label">{{ L.selectDevice }}</p>
          <div class="selector-row">
            <button class="device-btn" :class="{ active: device === 'phone' }" @click="device = 'phone'; iframeKey++">
              <Smartphone class="w-4 h-4" />
              <span>{{ L.phone }}</span>
            </button>
            <button class="device-btn" :class="{ active: device === 'tablet' }" @click="device = 'tablet'; iframeKey++">
              <Tablet class="w-4 h-4" />
              <span>{{ L.tablet }}</span>
            </button>
          </div>
        </div>

        <!-- Role -->
        <div class="selector-group">
          <p class="selector-label">{{ L.selectRole }}</p>
          <div class="roles-grid">
            <button
              v-for="(config, role) in roleConfig"
              :key="role"
              class="role-card"
              :class="{ active: selectedRole === role }"
              @click="selectedRole = role as RoleType; iframeKey++"
            >
              <div class="role-icon-wrap" :style="{ background: config.color + '15', color: config.color }">
                <component :is="config.icon" class="w-3.5 h-3.5" />
              </div>
              <div class="role-text">
                <span class="role-name">{{ L.roles[role as RoleType] }}</span>
                <span class="role-desc">{{ L.rolesDesc[role as RoleType] }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Device Mockup with iframe -->
      <div class="mockup-area">
        <!-- Phone -->
        <div v-if="device === 'phone'" class="phone-mockup">
          <div class="phone-frame">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <iframe
                :key="'phone-' + iframeKey"
                :src="iframeSrc"
                class="device-iframe"
                frameborder="0"
                scrolling="yes"
              />
            </div>
          </div>
        </div>

        <!-- Tablet -->
        <div v-else class="tablet-mockup">
          <div class="tablet-frame">
            <div class="tablet-camera"></div>
            <div class="tablet-screen">
              <iframe
                :key="'tablet-' + iframeKey"
                :src="iframeSrc"
                class="device-iframe"
                frameborder="0"
                scrolling="yes"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.miniapp-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5,8,7,0.92);
  backdrop-filter: blur(8px);
  overflow-y: auto;
  padding: 20px;
}

.miniapp-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 95vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #0a0f0d 0%, #080c0a 100%);
  border: 1px solid rgba(22,163,74,0.1);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); }

.miniapp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.tg-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #229ED9, #0088cc);
  color: white;
  box-shadow: 0 8px 24px rgba(34,158,217,0.3);
}
.miniapp-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}
.miniapp-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

.selector-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
.selector-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.selector-label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.selector-row {
  display: flex;
  gap: 8px;
}
.device-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.15s;
}
.device-btn.active {
  color: #4ade80;
  background: rgba(22,163,74,0.1);
  border-color: rgba(22,163,74,0.3);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}
.role-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.role-card.active {
  background: rgba(22,163,74,0.08);
  border-color: rgba(22,163,74,0.25);
}
.role-card:hover { background: rgba(255,255,255,0.04); }
.role-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.role-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.role-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
}
.role-desc {
  font-size: 10px;
  color: rgba(255,255,255,0.3);
}

/* Mockup area */
.mockup-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  min-height: 400px;
}

/* Phone */
.phone-mockup { display: flex; justify-content: center; }
.phone-frame {
  width: 300px;
  height: 600px;
  background: #1a1a1a;
  border-radius: 36px;
  border: 3px solid #333;
  padding: 8px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 0 2px rgba(255,255,255,0.1);
}
.phone-notch {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 22px;
  background: #1a1a1a;
  border-radius: 0 0 14px 14px;
  z-index: 2;
}
.phone-screen {
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  background: #fff;
  position: relative;
}

/* Tablet */
.tablet-mockup { display: flex; justify-content: center; }
.tablet-frame {
  width: 480px;
  height: 640px;
  background: #1a1a1a;
  border-radius: 24px;
  border: 3px solid #333;
  padding: 12px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 0 2px rgba(255,255,255,0.1);
}
.tablet-camera {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  z-index: 2;
}
.tablet-screen {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  position: relative;
}

.device-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

@media (max-width: 640px) {
  .tablet-frame { width: 340px; height: 480px; }
  .roles-grid { grid-template-columns: 1fr 1fr; }
}
</style>

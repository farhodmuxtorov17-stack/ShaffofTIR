<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import {
  X, Smartphone, Tablet, ChevronRight, ArrowLeft,
  Target, Users, Camera, Shield, Activity,
  CheckCircle2, Clock, Zap, Crosshair, ScanFace
} from 'lucide-vue-next'

const emit = defineEmits<{ close: [] }>()
const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()

type DeviceType = 'phone' | 'tablet'
type Role = 'soldier' | 'instructor'
type Screen = 'home' | 'shooting' | 'results' | 'instructor_assign' | 'instructor_scan'

const device = ref<DeviceType>('phone')
const role = ref<Role>('soldier')
const screen = ref<Screen>('home')

const isUz = computed(() => locale.value === 'uz')

const L = computed(() => isUz.value ? {
  title: 'Telegram Mini App',
  subtitle: 'Mobil ilovada ShaffofTIR',
  phone: 'iPhone',
  tablet: 'Planshet',
  soldier: 'Askar',
  instructor: 'Instruktor',
  soldierRole: 'Otish maydoni',
  instructorRole: 'Ruboj nazorati',
  enter: 'Kirish',
  back: 'Orqaga',
  myResults: 'Natijalarim',
  activeSession: 'Joriy sessiya',
  startShooting: 'Otishni boshlash',
  myStats: 'Mening ko\'rsatkichlarim',
  lastSession: 'So\'nggi sessiya',
  accuracy: 'Aniqlik',
  score: 'Ball',
  hits: 'Teggan',
  total: 'Jami',
  assignSoldier: 'Askarni yo\'lga qo\'yish',
  scanFace: 'Yuzni skanerlash',
  lane: 'Yo\'lak',
  available: 'Bo\'sh',
  occupied: 'Band',
  identify: 'Identifikatsiya',
  identified: 'Aniqlandi',
  assignToLane: 'Yo\'lakka biriktirish',
  assignBtn: 'Biriktirish',
  nextSoldier: 'Keyingi askar',
  tbPassed: 'TB o\'tilgan',
  weapon: 'Qurol',
  distance: 'Masofa',
  timeLeft: 'Qolgan vaqt',
  shooting: 'Otish',
  sessionActive: 'Sessiya faol',
  results: 'Natijalar',
  protocolReady: 'Protokol tayyor',
  welcomeBack: 'Xush kelibsiz',
  todayPlan: 'Bugungi reja',
  noSessions: 'Sessiyalar yo\'q',
  selectDevice: 'Qurilma tanlang',
  selectRole: 'Rolni tanlang',
  demo: 'Demo rejim',
} : {
  title: 'Telegram Mini App',
  subtitle: 'ShaffofTIR в мобильном',
  phone: 'iPhone',
  tablet: 'Планшет',
  soldier: 'Боец',
  instructor: 'Инструктор',
  soldierRole: 'Стрелковый полигон',
  instructorRole: 'Контроль рубежа',
  enter: 'Войти',
  back: 'Назад',
  myResults: 'Мои результаты',
  activeSession: 'Текущая сессия',
  startShooting: 'Начать стрельбу',
  myStats: 'Мои показатели',
  lastSession: 'Последняя сессия',
  accuracy: 'Точность',
  score: 'Балл',
  hits: 'Попаданий',
  total: 'Всего',
  assignSoldier: 'Постановка на рубеж',
  scanFace: 'Сканирование лица',
  lane: 'Дорожка',
  available: 'Свободна',
  occupied: 'Занята',
  identify: 'Идентификация',
  identified: 'Опознан',
  assignToLane: 'Назначить на дорожку',
  assignBtn: 'Назначить',
  nextSoldier: 'Следующий боец',
  tbPassed: 'ТБ пройден',
  weapon: 'Оружие',
  distance: 'Дистанция',
  timeLeft: 'Осталось',
  shooting: 'Стрельба',
  sessionActive: 'Сессия активна',
  results: 'Результаты',
  protocolReady: 'Протокол готов',
  welcomeBack: 'С возвращением',
  todayPlan: 'План на сегодня',
  noSessions: 'Нет сессий',
  selectDevice: 'Выберите устройство',
  selectRole: 'Выберите роль',
  demo: 'Демо режим',
})

const soldierData = {
  name: isUz.value ? 'Ergashev J.' : 'Ергашев Ж.',
  rank: isUz.value ? 'Efrektor' : 'Ефрейтор',
  unit: isUz.value ? '1-rot, 2-polk' : '1-рота, 2-полк',
  todayAccuracy: 78,
  lastScore: 42,
  lastHits: 8,
  lastTotal: 10,
  lastDate: '08.08.2026',
}

const lanes = ref([
  { id: 1, status: 'occupied', soldierName: 'Karimov A.', weapon: 'AK-74', distance: 100, timeLeft: '02:34' },
  { id: 2, status: 'available', soldierName: null, weapon: null, distance: null, timeLeft: null },
  { id: 3, status: 'occupied', soldierName: 'Rahimov B.', weapon: 'AK-74', distance: 100, timeLeft: '04:12' },
  { id: 4, status: 'available', soldierName: null, weapon: null, distance: null, timeLeft: null },
  { id: 5, status: 'occupied', soldierName: 'Sodiqov D.', weapon: 'PM', distance: 25, timeLeft: '01:08' },
  { id: 6, status: 'available', soldierName: null, weapon: null, distance: null, timeLeft: null },
])

const scanning = ref(false)
const identifiedSoldier = ref(false)
const selectedLane = ref<number | null>(null)

function startScan() {
  scanning.value = true
  identifiedSoldier.value = false
  selectedLane.value = null
  setTimeout(() => {
    scanning.value = false
    identifiedSoldier.value = true
  }, 2000)
}

function selectLaneNum(n: number) {
  if (lanes.value[n - 1].status === 'available') {
    selectedLane.value = n
  }
}

function assignSoldier() {
  if (selectedLane.value !== null) {
    lanes.value[selectedLane.value - 1].status = 'occupied'
    lanes.value[selectedLane.value - 1].soldierName = 'Yangi askar'
    lanes.value[selectedLane.value - 1].weapon = 'AK-74'
    lanes.value[selectedLane.value - 1].distance = 100
    lanes.value[selectedLane.value - 1].timeLeft = '05:00'
    identifiedSoldier.value = false
    selectedLane.value = null
  }
}

function enterApp() {
  if (role.value === 'soldier') {
    authStore.login({ email: 'soldier@shaffoftir.uz', password: 'soldier123' }).then(() => {
      router.push('/')
      emit('close')
    }).catch(() => {
      router.push('/')
      emit('close')
    })
  } else {
    authStore.login({ email: 'instructor@shaffoftir.uz', password: 'instructor123' }).then(() => {
      router.push('/instructor')
      emit('close')
    }).catch(() => {
      router.push('/instructor')
      emit('close')
    })
  }
}

function selectDevice(d: DeviceType) {
  device.value = d
  if (d === 'tablet' && role.value === 'soldier') {
    role.value = 'instructor'
    screen.value = 'instructor_assign'
  }
}

function selectRole(r: Role) {
  role.value = r
  if (r === 'instructor' && device.value === 'phone') {
    device.value = 'tablet'
  }
  screen.value = r === 'instructor' ? 'instructor_assign' : 'home'
}
</script>

<template>
  <div class="miniapp-overlay" @click.self="emit('close')">
    <div class="miniapp-container">
      <button class="close-btn" @click="emit('close')">
        <X class="w-5 h-5" />
      </button>

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

      <div class="selector-section">
        <div class="selector-group">
          <p class="selector-label">{{ L.selectDevice }}</p>
          <div class="selector-row">
            <button class="device-btn" :class="{ active: device === 'phone' }" @click="selectDevice('phone')">
              <Smartphone class="w-4 h-4" />
              <span>{{ L.phone }}</span>
            </button>
            <button class="device-btn" :class="{ active: device === 'tablet' }" @click="selectDevice('tablet')">
              <Tablet class="w-4 h-4" />
              <span>{{ L.tablet }}</span>
            </button>
          </div>
        </div>

        <div class="selector-group">
          <p class="selector-label">{{ L.selectRole }}</p>
          <div class="selector-row">
            <button class="role-btn" :class="{ active: role === 'soldier' }" @click="selectRole('soldier')">
              <Target class="w-4 h-4" />
              <div class="role-text">
                <span class="role-name">{{ L.soldier }}</span>
                <span class="role-desc">{{ L.soldierRole }}</span>
              </div>
            </button>
            <button class="role-btn" :class="{ active: role === 'instructor' }" @click="selectRole('instructor')">
              <Users class="w-4 h-4" />
              <div class="role-text">
                <span class="role-name">{{ L.instructor }}</span>
                <span class="role-desc">{{ L.instructorRole }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="mockup-area">
        <!-- Phone Mockup -->
        <div v-if="device === 'phone'" class="phone-mockup">
          <div class="phone-frame">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="status-bar">
                <span>9:41</span>
                <div class="status-icons">
                  <span class="signal"></span>
                  <span class="battery"></span>
                </div>
              </div>

              <div class="app-content">
                <div v-if="role === 'soldier' && screen === 'home'" class="screen-content">
                  <div class="app-header">
                    <div class="app-avatar"><span>Е</span></div>
                    <div>
                      <p class="app-greeting">{{ L.welcomeBack }}</p>
                      <p class="app-username">{{ soldierData.name }}</p>
                      <p class="app-unit">{{ soldierData.unit }}</p>
                    </div>
                  </div>

                  <div class="demo-badge"><Zap class="w-3 h-3" /> {{ L.demo }}</div>

                  <div class="card-mini">
                    <div class="card-header"><Target class="w-4 h-4 text-green-400" /><span>{{ L.todayPlan }}</span></div>
                    <div class="plan-item">
                      <div class="plan-info">
                        <p class="plan-title">AK-74 · 100m</p>
                        <p class="plan-time">10:00 — 12:00</p>
                      </div>
                      <span class="badge-active">{{ L.activeSession }}</span>
                    </div>
                  </div>

                  <div class="stats-row">
                    <div class="stat-card">
                      <p class="stat-value">{{ soldierData.todayAccuracy }}%</p>
                      <p class="stat-label">{{ L.accuracy }}</p>
                    </div>
                    <div class="stat-card">
                      <p class="stat-value">{{ soldierData.lastScore }}</p>
                      <p class="stat-label">{{ L.score }}</p>
                    </div>
                  </div>

                  <div class="card-mini">
                    <div class="card-header"><Activity class="w-4 h-4 text-blue-400" /><span>{{ L.lastSession }}</span></div>
                    <div class="session-row">
                      <div class="session-info">
                        <p class="session-date">{{ soldierData.lastDate }}</p>
                        <p class="session-detail">{{ soldierData.lastHits }}/{{ soldierData.lastTotal }} {{ L.hits }}</p>
                      </div>
                      <div class="session-score">
                        <span class="score-num">{{ soldierData.lastScore }}</span>
                        <span class="score-max">/50</span>
                      </div>
                    </div>
                  </div>

                  <button class="app-action-btn" @click="screen = 'shooting'">
                    <Crosshair class="w-4 h-4" />
                    {{ L.startShooting }}
                  </button>
                </div>

                <div v-else-if="role === 'soldier' && screen === 'shooting'" class="screen-content">
                  <button class="back-arrow" @click="screen = 'home'">
                    <ArrowLeft class="w-4 h-4" /> {{ L.back }}
                  </button>
                  <div class="shooting-view">
                    <div class="target-display">
                      <div class="target-rings">
                        <div class="ring r1"></div>
                        <div class="ring r2"></div>
                        <div class="ring r3"></div>
                        <div class="ring r4"></div>
                        <div class="ring r5"></div>
                        <div class="bullet b1"></div>
                        <div class="bullet b2"></div>
                        <div class="bullet b3"></div>
                        <div class="bullet b4"></div>
                      </div>
                    </div>
                    <div class="shooting-info">
                      <div class="info-item"><p class="info-label">{{ L.weapon }}</p><p class="info-value">AK-74</p></div>
                      <div class="info-item"><p class="info-label">{{ L.distance }}</p><p class="info-value">100m</p></div>
                      <div class="info-item"><p class="info-label">{{ L.hits }}</p><p class="info-value">7/10</p></div>
                    </div>
                    <div class="timer-bar"><Clock class="w-3.5 h-3.5 text-amber-400" /><span class="timer-text">{{ L.timeLeft }}: 02:34</span></div>
                  </div>
                </div>

                <div v-else-if="role === 'instructor'" class="screen-content">
                  <div class="instr-header">
                    <div>
                      <p class="app-greeting">{{ L.instructorRole }}</p>
                      <p class="app-username">{{ L.assignSoldier }}</p>
                    </div>
                    <div class="demo-badge"><Zap class="w-3 h-3" /> {{ L.demo }}</div>
                  </div>

                  <div v-if="!identifiedSoldier" class="scan-section" @click="startScan">
                    <div class="scan-area" :class="{ scanning: scanning }">
                      <ScanFace class="w-12 h-12 text-cyan-400" />
                      <p class="scan-text">{{ scanning ? '...' : L.scanFace }}</p>
                      <div v-if="scanning" class="scan-line"></div>
                    </div>
                  </div>

                  <div v-if="identifiedSoldier" class="identified-section">
                    <div class="identified-card">
                      <div class="identified-avatar"><CheckCircle2 class="w-6 h-6 text-green-400" /></div>
                      <div class="identified-info">
                        <p class="identified-name">{{ isUz ? 'Ergashev J.' : 'Ергашев Ж.' }}</p>
                        <p class="identified-meta">{{ isUz ? 'Efrektor · 1-rot' : 'Ефрейтор · 1-рота' }}</p>
                        <div class="tb-badge"><Shield class="w-3 h-3" /> {{ L.tbPassed }}</div>
                      </div>
                    </div>
                    <p class="section-label">{{ L.assignToLane }}</p>
                    <div class="lanes-grid">
                      <div v-for="lane in lanes" :key="lane.id" class="lane-card" :class="{ 'lane-occupied': lane.status === 'occupied', 'lane-selected': selectedLane === lane.id, 'lane-available': lane.status === 'available' }" @click="selectLaneNum(lane.id)">
                        <p class="lane-num">{{ L.lane }} {{ lane.id }}</p>
                        <p v-if="lane.status === 'occupied'" class="lane-status occupied">{{ lane.soldierName }}</p>
                        <p v-else class="lane-status available">{{ L.available }}</p>
                        <p v-if="lane.status === 'occupied'" class="lane-time">{{ lane.timeLeft }}</p>
                      </div>
                    </div>
                    <button v-if="selectedLane" class="app-action-btn" @click="assignSoldier">
                      <CheckCircle2 class="w-4 h-4" /> {{ L.assignBtn }} — {{ L.lane }} {{ selectedLane }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="bottom-nav">
                <div class="nav-item active"><Target class="w-4 h-4" /></div>
                <div class="nav-item"><Activity class="w-4 h-4" /></div>
                <div class="nav-item"><Camera class="w-4 h-4" /></div>
                <div class="nav-item"><Users class="w-4 h-4" /></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tablet Mockup -->
        <div v-else class="tablet-mockup">
          <div class="tablet-frame">
            <div class="tablet-camera"></div>
            <div class="tablet-screen">
              <div class="status-bar tablet-status">
                <span>9:41</span>
                <div class="status-icons"><span class="signal"></span><span class="battery"></span></div>
              </div>

              <div class="tablet-content">
                <div class="tab-header">
                  <div>
                    <h3 class="tab-title">{{ L.instructorRole }}</h3>
                    <p class="tab-subtitle">{{ L.assignSoldier }}</p>
                  </div>
                  <div class="demo-badge"><Zap class="w-3 h-3" /> {{ L.demo }}</div>
                </div>

                <div class="tab-grid">
                  <div class="tab-col-left">
                    <div v-if="!identifiedSoldier" class="tab-scan" @click="startScan">
                      <div class="scan-area tab-scan-area" :class="{ scanning: scanning }">
                        <ScanFace class="w-16 h-16 text-cyan-400" />
                        <p class="scan-text">{{ scanning ? '...' : L.scanFace }}</p>
                        <div v-if="scanning" class="scan-line"></div>
                      </div>
                    </div>
                    <div v-else class="tab-identified">
                      <div class="identified-card large">
                        <div class="identified-avatar"><CheckCircle2 class="w-8 h-8 text-green-400" /></div>
                        <div class="identified-info">
                          <p class="identified-name">{{ isUz ? 'Ergashev J.' : 'Ергашев Ж.' }}</p>
                          <p class="identified-meta">{{ isUz ? 'Efrektor · 1-rot, 2-polk' : 'Ефрейтор · 1-рота, 2-полк' }}</p>
                          <div class="tb-badge"><Shield class="w-3 h-3" /> {{ L.tbPassed }}</div>
                        </div>
                      </div>
                      <button v-if="selectedLane" class="app-action-btn" @click="assignSoldier">
                        <CheckCircle2 class="w-4 h-4" /> {{ L.assignBtn }} — {{ L.lane }} {{ selectedLane }}
                      </button>
                    </div>
                  </div>

                  <div class="tab-col-right">
                    <p class="section-label">{{ L.assignToLane }}</p>
                    <div class="lanes-list">
                      <div v-for="lane in lanes" :key="lane.id" class="lane-row" :class="{ 'lane-occupied': lane.status === 'occupied', 'lane-selected': selectedLane === lane.id, 'lane-available': lane.status === 'available' }" @click="selectLaneNum(lane.id)">
                        <div class="lane-row-num">{{ L.lane }} {{ lane.id }}</div>
                        <div class="lane-row-info">
                          <p v-if="lane.status === 'occupied'" class="lane-row-name">{{ lane.soldierName }}</p>
                          <p v-else class="lane-row-name available">{{ L.available }}</p>
                          <p v-if="lane.weapon" class="lane-row-meta">{{ lane.weapon }} · {{ lane.distance }}m</p>
                        </div>
                        <div v-if="lane.status === 'occupied'" class="lane-row-timer"><Clock class="w-3.5 h-3.5 text-amber-400" /><span>{{ lane.timeLeft }}</span></div>
                        <div v-else-if="selectedLane === lane.id" class="lane-check"><CheckCircle2 class="w-5 h-5 text-green-400" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bottom-nav tablet-nav">
                <div class="nav-item active"><Target class="w-4 h-4" /></div>
                <div class="nav-item"><Activity class="w-4 h-4" /></div>
                <div class="nav-item"><Camera class="w-4 h-4" /></div>
                <div class="nav-item"><Users class="w-4 h-4" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="enter-btn" @click="enterApp">
        {{ L.enter }}
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.miniapp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; overflow-y: auto; }
.miniapp-container { position: relative; max-width: 900px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px 20px; }
.close-btn { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10; }
.close-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); }
.miniapp-header { display: flex; align-items: center; gap: 12px; }
.tg-badge { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2AABEE, #229ED9); display: flex; align-items: center; justify-content: center; color: white; }
.miniapp-title { font-size: 20px; font-weight: 600; color: #fff; margin: 0; }
.miniapp-subtitle { font-size: 12px; color: rgba(255,255,255,0.4); margin: 2px 0 0; }
.selector-section { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.selector-group { display: flex; flex-direction: column; gap: 8px; }
.selector-label { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 500; text-align: center; }
.selector-row { display: flex; gap: 8px; }
.device-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.device-btn.active { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.4); color: #22c55e; }
.device-btn:hover:not(.active) { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
.role-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
.role-btn.active { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.4); color: #22c55e; }
.role-btn:hover:not(.active) { background: rgba(255,255,255,0.08); }
.role-text { display: flex; flex-direction: column; align-items: flex-start; }
.role-name { font-size: 13px; font-weight: 600; }
.role-desc { font-size: 10px; opacity: 0.6; }
.mockup-area { display: flex; justify-content: center; padding: 20px 0; }
.phone-mockup { perspective: 1000px; }
.phone-frame { width: 280px; height: 580px; background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 44px; padding: 8px; box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; }
.phone-notch { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); width: 90px; height: 24px; background: #0a0a14; border-radius: 14px; z-index: 20; }
.phone-screen { width: 100%; height: 100%; background: #0f1117; border-radius: 36px; overflow: hidden; display: flex; flex-direction: column; position: relative; }
.tablet-mockup { perspective: 1000px; }
.tablet-frame { width: 560px; max-width: 90vw; height: 400px; background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 28px; padding: 10px; box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; }
.tablet-camera { position: absolute; top: 5px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; background: #0a0a14; border-radius: 50%; z-index: 20; }
.tablet-screen { width: 100%; height: 100%; background: #0f1117; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; position: relative; }
.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 20px 4px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.8); flex-shrink: 0; }
.tablet-status { padding: 8px 24px 4px; }
.status-icons { display: flex; align-items: center; gap: 4px; }
.signal { width: 14px; height: 8px; background: linear-gradient(to right, #22c55e 60%, transparent 60%); border-radius: 2px; }
.battery { width: 20px; height: 10px; border: 1px solid rgba(255,255,255,0.4); border-radius: 2px; position: relative; }
.battery::after { content: ''; position: absolute; right: -3px; top: 2px; width: 2px; height: 4px; background: rgba(255,255,255,0.4); border-radius: 0 1px 1px 0; }
.battery::before { content: ''; position: absolute; inset: 1px; width: 75%; background: #22c55e; border-radius: 1px; }
.app-content { flex: 1; overflow-y: auto; padding: 0 16px; }
.screen-content { display: flex; flex-direction: column; gap: 12px; padding: 8px 0 16px; }
.app-header { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.app-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #15803d); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; }
.app-greeting { font-size: 11px; color: rgba(255,255,255,0.4); margin: 0; }
.app-username { font-size: 15px; font-weight: 600; color: #fff; margin: 0; }
.app-unit { font-size: 10px; color: rgba(255,255,255,0.3); margin: 2px 0 0; }
.demo-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 100px; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.2); color: rgba(250,204,21,0.8); font-size: 9px; font-weight: 600; align-self: flex-start; }
.card-mini { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 12px; }
.card-header { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
.plan-item { display: flex; align-items: center; justify-content: space-between; }
.plan-info { display: flex; flex-direction: column; }
.plan-title { font-size: 13px; font-weight: 600; color: #fff; margin: 0; }
.plan-time { font-size: 10px; color: rgba(255,255,255,0.3); margin: 2px 0 0; }
.badge-active { padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); color: #22c55e; font-size: 9px; font-weight: 600; }
.stats-row { display: flex; gap: 8px; }
.stat-card { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px; text-align: center; }
.stat-value { font-size: 20px; font-weight: 700; color: #22c55e; margin: 0; }
.stat-label { font-size: 9px; color: rgba(255,255,255,0.3); margin: 2px 0 0; }
.session-row { display: flex; align-items: center; justify-content: space-between; }
.session-info { display: flex; flex-direction: column; }
.session-date { font-size: 11px; color: rgba(255,255,255,0.5); margin: 0; }
.session-detail { font-size: 10px; color: rgba(255,255,255,0.3); margin: 2px 0 0; }
.session-score { display: flex; align-items: baseline; gap: 2px; }
.score-num { font-size: 20px; font-weight: 700; color: #fff; }
.score-max { font-size: 11px; color: rgba(255,255,255,0.3); }
.app-action-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 14px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px -4px rgba(22,163,74,0.5); }
.app-action-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px -4px rgba(22,163,74,0.6); }
.shooting-view { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.target-display { width: 100%; display: flex; justify-content: center; padding: 16px 0; }
.target-rings { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
.ring { position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.15); }
.r1 { width: 140px; height: 140px; }
.r2 { width: 112px; height: 112px; }
.r3 { width: 84px; height: 84px; }
.r4 { width: 56px; height: 56px; }
.r5 { width: 28px; height: 28px; background: rgba(255,255,255,0.05); }
.bullet { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.6); }
.b1 { top: 35%; left: 42%; }
.b2 { top: 48%; left: 55%; }
.b3 { top: 58%; left: 38%; }
.b4 { top: 30%; left: 60%; }
.shooting-info { display: flex; gap: 12px; width: 100%; }
.info-item { flex: 1; text-align: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px; }
.info-label { font-size: 9px; color: rgba(255,255,255,0.3); margin: 0; }
.info-value { font-size: 14px; font-weight: 700; color: #fff; margin: 2px 0 0; }
.timer-bar { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 100px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
.timer-text { font-size: 12px; font-weight: 600; color: #f59e0b; }
.back-arrow { display: flex; align-items: center; gap: 4px; padding: 4px 0; font-size: 12px; color: rgba(255,255,255,0.5); background: none; border: none; cursor: pointer; }
.back-arrow:hover { color: rgba(255,255,255,0.8); }
.instr-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 8px 0; }
.scan-section { display: flex; justify-content: center; padding: 16px 0; }
.scan-area { width: 160px; height: 160px; border-radius: 24px; background: rgba(6,182,212,0.06); border: 2px dashed rgba(6,182,212,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
.scan-area:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.5); }
.scan-area.scanning { border-style: solid; border-color: rgba(6,182,212,0.6); }
.scan-text { font-size: 12px; color: rgba(6,182,212,0.8); font-weight: 500; }
.scan-line { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #06b6d4, transparent); animation: scan-move 1.5s ease-in-out infinite; }
@keyframes scan-move { 0%, 100% { top: 10%; } 50% { top: 90%; } }
.identified-section { display: flex; flex-direction: column; gap: 12px; }
.identified-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; }
.identified-card.large { padding: 20px; }
.identified-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(34,197,94,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.identified-card.large .identified-avatar { width: 56px; height: 56px; }
.identified-info { flex: 1; }
.identified-name { font-size: 14px; font-weight: 600; color: #fff; margin: 0; }
.identified-card.large .identified-name { font-size: 16px; }
.identified-meta { font-size: 11px; color: rgba(255,255,255,0.4); margin: 2px 0 4px; }
.tb-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); color: #22c55e; font-size: 9px; font-weight: 600; }
.section-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); margin: 0 0 8px; }
.lanes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.lane-card { padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s; }
.lane-available:hover, .lane-selected { border-color: rgba(34,197,94,0.5); background: rgba(34,197,94,0.08); }
.lane-occupied { opacity: 0.6; cursor: not-allowed; }
.lane-num { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.6); margin: 0; }
.lane-status { font-size: 10px; margin: 4px 0 0; }
.lane-status.occupied { color: rgba(255,255,255,0.3); }
.lane-status.available { color: #22c55e; }
.lane-time { font-size: 9px; color: rgba(245,158,11,0.7); margin: 2px 0 0; }
.bottom-nav { display: flex; align-items: center; justify-content: space-around; padding: 8px 0 12px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.tablet-nav { padding: 8px 0 12px; }
.nav-item { color: rgba(255,255,255,0.2); transition: color 0.2s; }
.nav-item.active { color: #22c55e; }
.tablet-content { flex: 1; overflow: hidden; padding: 0 20px; }
.tab-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
.tab-title { font-size: 16px; font-weight: 600; color: #fff; margin: 0; }
.tab-subtitle { font-size: 11px; color: rgba(255,255,255,0.4); margin: 2px 0 0; }
.tab-grid { display: grid; grid-template-columns: 200px 1fr; gap: 16px; margin-top: 8px; }
.tab-col-left { display: flex; flex-direction: column; gap: 10px; }
.tab-scan-area { width: 100%; height: 180px; }
.tab-identified { display: flex; flex-direction: column; gap: 10px; }
.tab-col-right { display: flex; flex-direction: column; overflow-y: auto; }
.lanes-list { display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto; }
.lane-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s; }
.lane-row.lane-occupied { opacity: 0.7; }
.lane-row.lane-available:hover, .lane-row.lane-selected { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.06); }
.lane-row-num { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); min-width: 50px; }
.lane-row-info { flex: 1; }
.lane-row-name { font-size: 12px; font-weight: 500; color: #fff; margin: 0; }
.lane-row-name.available { color: rgba(34,197,94,0.7); }
.lane-row-meta { font-size: 10px; color: rgba(255,255,255,0.3); margin: 2px 0 0; }
.lane-row-timer { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(245,158,11,0.7); font-weight: 600; }
.lane-check { flex-shrink: 0; }
.enter-btn { display: flex; align-items: center; gap: 6px; padding: 12px 32px; border-radius: 100px; background: linear-gradient(135deg, #2AABEE, #229ED9); color: white; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px -4px rgba(42,171,238,0.5); }
.enter-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px -4px rgba(42,171,238,0.6); }
.app-content::-webkit-scrollbar, .lanes-list::-webkit-scrollbar { width: 0; }
</style>

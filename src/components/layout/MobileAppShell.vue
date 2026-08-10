<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import {
  LayoutDashboard, Monitor, Target, FileText, MoreHorizontal,
  Users, Zap, Radio, Calendar, Camera, Wrench,
  Crosshair, GraduationCap, History, Bell, Shield,
  GitCompare, Eye, Building2, MessageSquareWarning,
  CheckCircle, Sparkles, ClipboardList, ScrollText,
  Activity, Settings, HelpCircle, X,
  Network, ShieldCheck, UsersRound, MapPin
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const masterStore = useMasterStore()
const { locale, setLocale } = useI18n()

const deviceType = computed(() => (route.query.device === 'tablet' ? 'tablet' : 'phone') as 'phone' | 'tablet')
const isTablet = computed(() => deviceType.value === 'tablet')
const role = computed(() => authStore.user?.role || 'EMPLOYEE')
const unreadCount = computed(() => masterStore.getNotificationsUnread().length)
const moreSheetOpen = ref(false)
const sidebarOpen = ref(false)

const userName = computed(() => {
  const name = authStore.user?.full_name || ''
  const parts = name.split(' ')
  if (parts.length >= 2) return parts[0] + ' ' + parts[1].charAt(0) + '.'
  return name
})

const userInitials = computed(() => {
  const name = authStore.user?.full_name || ''
  const parts = name.split(' ')
  if (parts.length >= 2) return parts[0].charAt(0) + parts[1].charAt(0)
  if (parts.length === 1) return parts[0].charAt(0)
  return '?'
})

const roleLabel = computed(() => {
  const labels: Record<string, { ru: string; uz: string }> = {
    SUPER_ADMIN: { ru: 'Супер-админ', uz: 'Super admin' },
    MANAGER: { ru: 'Рахбар', uz: 'Rahbar' },
    INSTRUCTOR: { ru: 'Инструктор', uz: 'Instruktor' },
    TECHSPEC: { ru: 'Тех. спец.', uz: 'Tex. mutax.' },
    EMPLOYEE: { ru: 'Сотрудник', uz: 'Xodim' },
  }
  const l = labels[role.value]
  return locale.value === 'uz' ? l?.uz : l?.ru
})

interface TabItem { icon: any; label: string; path: string; badge?: () => number }
interface MoreItem { icon: any; label: string; path: string; badge?: () => number }

function nav(key: string) { return locale.value === 'uz' ? tUz(key) : tRu(key) }

function tRu(key: string) {
  const m: Record<string,string> = {
    home: 'Главная', command: 'Центр', results: 'Результаты',
    reports: 'Отчёты', more: 'Ещё', sessions: 'Сессии', tablet: 'Планшет',
    schedule: 'Расписание', training: 'Учеба', techspec: 'Инфрастр.',
    cameras: 'Камеры', arsenal: 'Арсенал', analytics: 'Аналитика',
    compare: 'Сравнение', orgStructure: 'Структура',
    kpiCatalog: 'Каталог KPI', kpiPeriods: 'Периоды',
    objections: 'Возражения', approvalTasks: 'Согласование',
    recommendations: 'Рекомендации', actionPlans: 'Планы',
    dataQuality: 'Качество', integration: 'Интеграции',
    users: 'Пользователи', audit: 'Аудит', systemHealth: 'Система',
    notifications: 'Уведомления', settings: 'Настройки', help: 'Помощь',
    admin: 'Админ', history: 'История', materials: 'Материалы', regions: 'Регионы',
  }
  return m[key] || key
}

function tUz(key: string) {
  const m: Record<string,string> = {
    home: 'Bosh', command: 'Markaz', results: 'Natijalar',
    reports: 'Hisobot', more: 'Yana', sessions: 'Sessiya', tablet: 'Planshet',
    schedule: 'Jadval', training: 'O\u02BBqitish', techspec: 'Infrastr.',
    cameras: 'Kamera', arsenal: 'Qurollar', analytics: 'Tahlil',
    compare: 'Qiyoslash', orgStructure: 'Tuzilma',
    kpiCatalog: 'KPI katalog', kpiPeriods: 'Davrilar',
    objections: 'E\u02BCtirozlar', approvalTasks: 'Kelishuv',
    recommendations: 'Tavsiyalar', actionPlans: 'Rejalar',
    dataQuality: 'Sifat', integration: 'Integratsiya',
    users: 'Foydalanuvchi', audit: 'Audit', systemHealth: 'Tizim',
    notifications: 'Xabarlar', settings: 'Sozlamalar', help: 'Yordam',
    admin: 'Admin', history: 'Tarix', materials: 'Materiallar', regions: 'Viloyatlar',
  }
  return m[key] || key
}

const tabs = computed<TabItem[]>(() => {
  if (role.value === 'SUPER_ADMIN') return [
    { icon: Shield, label: nav('admin'), path: '/admin' },
    { icon: Monitor, label: nav('command'), path: '/command-center' },
    { icon: MapPin, label: nav('regions'), path: '/command-center?view=regions' },
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
  if (role.value === 'MANAGER') return [
    { icon: LayoutDashboard, label: nav('home'), path: '/dashboard' },
    { icon: Monitor, label: nav('command'), path: '/command-center' },
    { icon: MapPin, label: nav('regions'), path: '/command-center?view=regions' },
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
  if (role.value === 'INSTRUCTOR') return [
    { icon: LayoutDashboard, label: nav('home'), path: '/dashboard' },
    { icon: Users, label: nav('sessions'), path: '/sessions' },
    { icon: Zap, label: nav('tablet'), path: '/range/instructor-tablet' },
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
  if (role.value === 'TECHSPEC') return [
    { icon: Wrench, label: nav('techspec'), path: '/techspec' },
    { icon: Camera, label: nav('cameras'), path: '/cameras/dashboard' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
  return [
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: Calendar, label: nav('schedule'), path: '/range/schedule' },
    { icon: GraduationCap, label: nav('materials'), path: '/training/materials' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
})

const moreItems = computed<MoreItem[]>(() => {
  const badge = () => unreadCount.value
  if (role.value === 'SUPER_ADMIN') return [
    { icon: LayoutDashboard, label: nav('home'), path: '/dashboard' },
    { icon: Users, label: nav('users'), path: '/hr/employees' },
    { icon: Building2, label: nav('orgStructure'), path: '/org-structure' },
    { icon: GitCompare, label: nav('compare'), path: '/compare/0' },
    { icon: Eye, label: nav('analytics'), path: '/analytics' },
    { icon: Target, label: nav('kpiCatalog'), path: '/kpi/catalog' },
    { icon: Calendar, label: nav('kpiPeriods'), path: '/kpi/periods' },
    { icon: MessageSquareWarning, label: nav('objections'), path: '/objections' },
    { icon: CheckCircle, label: nav('approvalTasks'), path: '/approval-tasks' },
    { icon: Sparkles, label: nav('recommendations'), path: '/recommendations' },
    { icon: ClipboardList, label: nav('actionPlans'), path: '/action-plans' },
    { icon: Wrench, label: nav('techspec'), path: '/techspec' },
    { icon: Camera, label: nav('cameras'), path: '/cameras/dashboard' },
    { icon: Crosshair, label: nav('arsenal'), path: '/weapons' },
    { icon: ShieldCheck, label: nav('dataQuality'), path: '/data-quality' },
    { icon: Network, label: nav('integration'), path: '/integration-monitoring' },
    { icon: GraduationCap, label: nav('materials'), path: '/training/materials' },
    { icon: FileText, label: nav('reports'), path: '/reports' },
    { icon: UsersRound, label: nav('users'), path: '/admin/users' },
    { icon: ScrollText, label: nav('audit'), path: '/admin/audit' },
    { icon: Activity, label: nav('systemHealth'), path: '/system-health' },
    { icon: Bell, label: nav('notifications'), path: '/notifications', badge },
    { icon: Settings, label: nav('settings'), path: '/settings' },
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
  if (role.value === 'MANAGER') return [
    { icon: GitCompare, label: nav('compare'), path: '/compare/0' },
    { icon: Building2, label: nav('orgStructure'), path: '/org-structure' },
    { icon: Target, label: nav('kpiCatalog'), path: '/kpi/catalog' },
    { icon: Calendar, label: nav('kpiPeriods'), path: '/kpi/periods' },
    { icon: MessageSquareWarning, label: nav('objections'), path: '/objections' },
    { icon: CheckCircle, label: nav('approvalTasks'), path: '/approval-tasks' },
    { icon: Sparkles, label: nav('recommendations'), path: '/recommendations' },
    { icon: ClipboardList, label: nav('actionPlans'), path: '/action-plans' },
    { icon: Eye, label: nav('analytics'), path: '/analytics' },
    { icon: ShieldCheck, label: nav('dataQuality'), path: '/data-quality' },
    { icon: Network, label: nav('integration'), path: '/integration-monitoring' },
    { icon: GraduationCap, label: nav('materials'), path: '/training/materials' },
    { icon: FileText, label: nav('reports'), path: '/reports' },
    { icon: Bell, label: nav('notifications'), path: '/notifications', badge },
    { icon: Settings, label: nav('settings'), path: '/settings' },
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
  if (role.value === 'INSTRUCTOR') return [
    { icon: Radio, label: nav('home'), path: '/range/dashboard' },
    { icon: Calendar, label: nav('schedule'), path: '/range/schedule' },
    { icon: Crosshair, label: nav('arsenal'), path: '/weapons' },
    { icon: Camera, label: nav('cameras'), path: '/cameras/dashboard' },
    { icon: GraduationCap, label: nav('training'), path: '/training' },
    { icon: History, label: nav('history'), path: '/training/history' },
    { icon: GraduationCap, label: nav('materials'), path: '/training/materials' },
    { icon: GitCompare, label: nav('compare'), path: '/compare/0' },
    { icon: FileText, label: nav('reports'), path: '/reports' },
    { icon: Bell, label: nav('notifications'), path: '/notifications', badge },
    { icon: Settings, label: nav('settings'), path: '/settings' },
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
  if (role.value === 'TECHSPEC') return [
    { icon: Settings, label: nav('settings'), path: '/settings' },
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
  return [
    { icon: History, label: nav('history'), path: '/training/history' },
    { icon: FileText, label: nav('reports'), path: '/protocols' },
    { icon: Bell, label: nav('notifications'), path: '/notifications', badge },
    { icon: Settings, label: nav('settings'), path: '/settings' },
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
})

const activeTabPath = computed(() => {
  const path = route.path
  const basePath = path.split('?')[0]
  for (const tab of tabs.value) {
    const tabBase = tab.path.split('?')[0]
    if (tabBase === basePath) return tab.path
    if (basePath.startsWith(tabBase + '/')) return tab.path
  }
  return ''
})

function onTabClick(tab: TabItem) {
  if (tab.path === '__more__') {
    if (isTablet.value) sidebarOpen.value = true
    else moreSheetOpen.value = true
  } else {
    router.push(tab.path)
  }
}

function onMoreItemClick(path: string) {
  moreSheetOpen.value = false
  sidebarOpen.value = false
  router.push(path)
}

function toggleLocale() { setLocale(locale.value === 'uz' ? 'ru' : 'uz') }
function goProfile() { router.push('/profile') }

const currentPageTitle = computed(() => {
  const tab = tabs.value.find(t => activeTabPath.value === t.path)
  if (tab) return tab.label
  const more = moreItems.value.find(i => route.path === i.path)
  if (more) return more.label
  return nav('home')
})

watch(moreSheetOpen, (v) => { document.body.style.overflow = v ? 'hidden' : '' })
watch(sidebarOpen, (v) => { document.body.style.overflow = v ? 'hidden' : '' })

// ═══ Status bar (clock, battery, signal) ═══
const clockTime = ref('')
const batteryLevel = ref(87)

function updateClock() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  clockTime.value = h + ':' + m
}
updateClock()
setInterval(updateClock, 10000)

// Check Telegram WebApp
const isTelegram = computed(() => {
  try { return !!(window as any).Telegram?.WebApp?.initData }
  catch { return false }
})

// Can go back?
const canGoBack = computed(() => {
  const stack = window.history.length
  return stack > 1
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(tabs.value[0]?.path || '/')
  }
}
</script>

<template>
  <div class="mobile-app" :class="{ 'tablet-landscape': isTablet, 'tg-themed': isTelegram }">
    <!-- Status bar (phone-style) -->
    <div class="status-bar">
      <span class="status-time">{{ clockTime }}</span>
      <div class="status-right">
        <!-- Signal bars -->
        <svg class="status-signal" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor"/>
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/>
          <rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.4"/>
        </svg>
        <!-- WiFi -->
        <svg class="status-wifi" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C10.5 2 12.8 2.9 14.5 4.4L13 5.9C11.7 4.7 10 4 8 4C6 4 4.3 4.7 3 5.9L1.5 4.4C3.2 2.9 5.5 2 8 2Z" fill="currentColor"/>
          <path d="M8 5.5C9.5 5.5 10.8 6 11.8 6.9L10.3 8.4C9.7 7.8 8.9 7.5 8 7.5C7.1 7.5 6.3 7.8 5.7 8.4L4.2 6.9C5.2 6 6.5 5.5 8 5.5Z" fill="currentColor"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
        </svg>
        <!-- Battery -->
        <div class="status-battery">
          <div class="battery-shell">
            <div class="battery-fill" :style="{ width: batteryLevel + '%' }"></div>
          </div>
          <div class="battery-tip"></div>
        </div>
      </div>
    </div>

    <!-- Sub-header with back button + title -->
    <div v-if="canGoBack" class="sub-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="sub-title">{{ currentPageTitle }}</span>
    </div>

    <!-- Topbar -->
    <header class="mobile-topbar">
      <div class="topbar-left">
        <div class="user-avatar" @click="goProfile">{{ userInitials }}</div>
        <div class="topbar-info">
          <span class="topbar-role">{{ roleLabel }}</span>
          <span class="topbar-name">{{ userName }}</span>
        </div>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn" @click="router.push('/notifications')">
          <Bell class="w-5 h-5" />
          <span v-if="unreadCount > 0" class="badge-dot">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
        <button class="topbar-lang" @click="toggleLocale">
          {{ locale === 'uz' ? 'UZ' : 'RU' }}
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="mobile-content">
      <router-view :key="$route.path" />
    </main>

    <!-- Bottom tabbar (phone only) -->
    <nav v-if="!isTablet" class="mobile-tabbar">
      <button v-for="tab in tabs" :key="tab.path" class="tab-item"
        :class="{ active: activeTabPath === tab.path }" @click="onTabClick(tab)">
        <div class="tab-icon-wrap">
          <component :is="tab.icon" class="tab-icon" />
          <span v-if="tab.badge?.()" class="tab-badge">{{ tab.badge()! > 9 ? '9+' : tab.badge()! }}</span>
        </div>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Tablet: left rail with icons + more sidebar -->
    <nav v-if="isTablet" class="tablet-rail">
      <button v-for="tab in tabs" :key="tab.path" class="rail-item"
        :class="{ active: activeTabPath === tab.path }" @click="onTabClick(tab)">
        <div class="rail-icon-wrap">
          <component :is="tab.icon" class="rail-icon" />
          <span v-if="tab.badge?.()" class="rail-badge">{{ tab.badge()! > 9 ? '9+' : tab.badge()! }}</span>
        </div>
        <span class="rail-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Phone: bottom sheet -->
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="moreSheetOpen" class="more-overlay" @click="moreSheetOpen = false" />
    </Transition>
    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-y-full" enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
      <div v-if="moreSheetOpen" class="more-sheet">
        <div class="more-handle"></div>
        <div class="more-header">
          <span class="more-title">{{ nav('more') }}</span>
          <button class="more-close" @click="moreSheetOpen = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="more-grid">
          <button v-for="item in moreItems" :key="item.path" class="more-item"
            :class="{ active: route.path === item.path }" @click="onMoreItemClick(item.path)">
            <div class="more-icon-wrap">
              <component :is="item.icon" class="w-5 h-5" />
              <span v-if="item.badge?.()" class="more-badge">{{ item.badge()! > 9 ? '9+' : item.badge()! }}</span>
            </div>
            <span class="more-label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Tablet: left sidebar drawer -->
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="sidebarOpen" class="more-overlay" @click="sidebarOpen = false" />
    </Transition>
    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full" enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
      <div v-if="sidebarOpen" class="sidebar-drawer">
        <div class="sidebar-header">
          <span class="more-title">{{ nav('more') }}</span>
          <button class="more-close" @click="sidebarOpen = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="sidebar-grid">
          <button v-for="item in moreItems" :key="item.path" class="sidebar-item"
            :class="{ active: route.path === item.path }" @click="onMoreItemClick(item.path)">
            <div class="sidebar-icon-wrap">
              <component :is="item.icon" class="w-5 h-5" />
              <span v-if="item.badge?.()" class="more-badge">{{ item.badge()! > 9 ? '9+' : item.badge()! }}</span>
            </div>
            <span class="sidebar-label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Home indicator (iOS-style bottom bar) -->
    <div v-if="!isTablet" class="home-indicator"></div>
  </div>
</template>

<style scoped>
/* ═══ Status bar ═══ */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px 4px;
  background: rgba(248,250,249,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink: 0;
  z-index: 40;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.status-time { letter-spacing: -0.3px; }
.status-right { display: flex; align-items: center; gap: 6px; }
.status-signal { width: 18px; height: 12px; color: #1f2937; }
.status-wifi { width: 16px; height: 12px; color: #1f2937; }
.status-battery { display: flex; align-items: center; gap: 1px; }
.battery-shell {
  width: 24px; height: 12px; border: 1.5px solid #1f2937;
  border-radius: 3px; padding: 1.5px;
  display: flex; align-items: stretch;
}
.battery-fill {
  background: #1f2937;
  border-radius: 1px;
  min-width: 2px;
}
.battery-tip {
  width: 2px; height: 5px;
  background: #1f2937;
  border-radius: 0 1px 1px 0;
  opacity: 0.5;
}

/* Telegram dark theme */
.tg-themed .status-bar { background: rgba(20,23,28,0.95); color: #e9e9ea; }
.tg-themed .status-signal, .tg-themed .status-wifi { color: #e9e9ea; }
.tg-themed .battery-shell { border-color: #e9e9ea; }
.tg-themed .battery-fill { background: #e9e9ea; }
.tg-themed .battery-tip { background: #e9e9ea; }
.tg-themed .mobile-topbar { background: rgba(20,23,28,0.92); border-bottom-color: rgba(255,255,255,0.06); }
.tg-themed .topbar-role { color: #8e9499; }
.tg-themed .topbar-name { color: #e9e9ea; }
.tg-themed .topbar-icon-btn { background: rgba(255,255,255,0.08); color: #8e9499; }
.tg-themed .topbar-lang { background: rgba(255,255,255,0.08); color: #e9e9ea; }
.tg-themed .mobile-tabbar { background: rgba(20,23,28,0.92); border-top-color: rgba(255,255,255,0.06); }
.tg-themed .tablet-rail { background: rgba(20,23,28,0.92); border-right-color: rgba(255,255,255,0.06); }
.tg-themed .home-indicator { background: rgba(255,255,255,0.3); }
.tg-themed .mobile-content { background: #0e1014; }

/* ═══ Sub-header (back button) ═══ */
.sub-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  flex-shrink: 0;
  z-index: 35;
}
.tg-themed .sub-header { background: rgba(20,23,28,0.92); border-bottom-color: rgba(255,255,255,0.06); }
.back-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: #f3f4f6; border: none;
  display: flex; align-items: center; justify-content: center;
  color: #374151; cursor: pointer;
  transition: all 0.15s;
}
.tg-themed .back-btn { background: rgba(255,255,255,0.1); color: #e9e9ea; }
.back-btn:active { transform: scale(0.92); }
.sub-title {
  font-size: 16px; font-weight: 600; color: #1f2937;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tg-themed .sub-title { color: #e9e9ea; }

/* ═══ Home indicator (iOS bottom bar) ═══ */
.home-indicator {
  width: 134px; height: 5px;
  background: rgba(0,0,0,0.25);
  border-radius: 3px;
  margin: 0 auto 6px;
  flex-shrink: 0;
  z-index: 40;
}

/* ═══ Shared ═══ */
.mobile-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #f8faf9;
  overflow: hidden;
}
.mobile-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  flex-shrink: 0;
  z-index: 30;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 12px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  box-shadow: 0 2px 8px -2px rgba(22,163,74,0.4);
  transition: transform 0.2s;
  cursor: pointer;
}
.user-avatar:active { transform: scale(0.95); }
.topbar-info { display: flex; flex-direction: column; gap: 1px; }
.topbar-role { font-size: 11px; color: #6b7280; font-weight: 500; }
.topbar-name { font-size: 14px; color: #1f2937; font-weight: 600; line-height: 1.2; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.topbar-icon-btn {
  position: relative; width: 38px; height: 38px; border-radius: 12px;
  background: #f3f4f6; border: none;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; cursor: pointer; transition: all 0.15s;
}
.topbar-icon-btn:active { transform: scale(0.92); }
.badge-dot {
  position: absolute; top: -2px; right: -2px;
  background: #ef4444; color: #fff; font-size: 9px; font-weight: 700;
  min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
  animation: badgeBlink 2s ease-in-out infinite;
}
@keyframes badgeBlink {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}
.topbar-lang {
  width: 38px; height: 38px; border-radius: 12px;
  background: #f3f4f6; border: none; color: #374151;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;
}
.topbar-lang:active { transform: scale(0.92); }
.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}
.mobile-content::-webkit-scrollbar { width: 0; }

/* ═══ Phone: bottom tabbar ═══ */
.mobile-tabbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0,0,0,0.04);
  padding: 6px 4px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  flex-shrink: 0;
  z-index: 30;
}
.tab-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: none; border: none; cursor: pointer; padding: 4px 8px;
  border-radius: 12px; flex: 1; min-width: 0;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.tab-item:active { transform: scale(0.95); }
.tab-icon-wrap { position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.tab-icon { width: 22px; height: 22px; color: #9ca3af; transition: all 0.2s; }
.tab-item.active .tab-icon { color: #16a34a; transform: scale(1.08); }
.tab-item.active .tab-icon-wrap::before {
  content: ''; position: absolute; inset: -6px;
  background: radial-gradient(circle, rgba(22,163,74,0.12), transparent 70%);
  border-radius: 50%;
}
.tab-badge {
  position: absolute; top: -4px; right: -6px;
  background: #ef4444; color: #fff; font-size: 8px; font-weight: 700;
  min-width: 14px; height: 14px; border-radius: 7px; padding: 0 3px;
  display: flex; align-items: center; justify-content: center;
}
.tab-label {
  font-size: 10px; font-weight: 500; color: #9ca3af;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%; transition: all 0.15s;
}
.tab-item.active .tab-label { color: #16a34a; font-weight: 600; }

/* ═══ Tablet landscape: left rail ═══ */
.tablet-landscape {
  flex-direction: row;
}
.tablet-landscape .mobile-topbar {
  order: 0;
  width: 100%;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.tablet-landscape .mobile-content {
  order: 2;
  flex: 1;
  padding-bottom: 0;
}
.tablet-rail {
  order: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 72px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(0,0,0,0.04);
  padding: 12px 4px;
  flex-shrink: 0;
  z-index: 20;
}
.rail-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer;
  padding: 8px 6px; border-radius: 14px;
  width: 64px; transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.rail-item:active { transform: scale(0.94); }
.rail-icon-wrap { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.rail-icon { width: 24px; height: 24px; color: #9ca3af; transition: all 0.2s; }
.rail-item.active .rail-icon { color: #16a34a; }
.rail-item.active .rail-icon-wrap::before {
  content: ''; position: absolute; inset: -6px;
  background: radial-gradient(circle, rgba(22,163,74,0.12), transparent 70%);
  border-radius: 50%;
}
.rail-badge {
  position: absolute; top: -4px; right: -6px;
  background: #ef4444; color: #fff; font-size: 8px; font-weight: 700;
  min-width: 14px; height: 14px; border-radius: 7px; padding: 0 3px;
  display: flex; align-items: center; justify-content: center;
}
.rail-label {
  font-size: 9px; font-weight: 500; color: #9ca3af;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 64px; transition: all 0.15s;
}
.rail-item.active .rail-label { color: #16a34a; font-weight: 600; }

/* Wrap topbar + content together in tablet mode */
.tablet-landscape {
  flex-wrap: wrap;
}
.tablet-landscape .mobile-topbar {
  flex-basis: 100%;
  height: 56px;
}
.tablet-landscape .tablet-rail {
  height: calc(100% - 56px);
}
.tablet-landscape .mobile-content {
  height: calc(100% - 56px);
}

/* ═══ Phone: bottom sheet ═══ */
.more-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 100;
}
.more-sheet {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 24px 24px 0 0;
  padding: 12px 16px; padding-bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 101; max-height: 75vh; overflow-y: auto;
  box-shadow: 0 -12px 40px -8px rgba(0,0,0,0.15);
}
.more-handle { width: 40px; height: 4px; border-radius: 2px; background: #d1d5db; margin: 0 auto 12px; }
.more-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.more-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.more-close {
  width: 32px; height: 32px; border-radius: 10px;
  background: #f3f4f6; border: none;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; cursor: pointer; transition: all 0.15s;
}
.more-close:active { transform: scale(0.9); }
.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.more-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; padding: 10px 4px;
  border-radius: 14px; transition: all 0.2s;
}
.more-item:active { background: #f3f4f6; transform: scale(0.96); }
.more-item.active { background: #e8f5e9; }
.more-icon-wrap {
  position: relative; width: 48px; height: 48px; border-radius: 14px;
  background: #f3f4f6; display: flex; align-items: center; justify-content: center;
  color: #6b7280; transition: all 0.2s;
}
.more-item.active .more-icon-wrap {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(22,163,74,0.3);
}
.more-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: #fff; font-size: 9px; font-weight: 700;
  min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px;
  display: flex; align-items: center; justify-content: center;
}
.more-label {
  font-size: 11px; color: #6b7280; text-align: center; line-height: 1.2;
  max-width: 72px; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
@media (max-width: 360px) { .more-grid { grid-template-columns: repeat(3, 1fr); } }

/* ═══ Tablet: left sidebar drawer ═══ */
.sidebar-drawer {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: 300px;
  background: #fff;
  border-radius: 0 24px 24px 0;
  padding: 16px;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 101;
  overflow-y: auto;
  box-shadow: 8px 0 40px -8px rgba(0,0,0,0.15);
}
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.sidebar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.sidebar-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; padding: 10px 6px;
  border-radius: 14px; transition: all 0.2s;
}
.sidebar-item:active { background: #f3f4f6; transform: scale(0.96); }
.sidebar-item.active { background: #e8f5e9; }
.sidebar-icon-wrap {
  position: relative; width: 44px; height: 44px; border-radius: 12px;
  background: #f3f4f6; display: flex; align-items: center; justify-content: center;
  color: #6b7280; transition: all 0.2s;
}
.sidebar-item.active .sidebar-icon-wrap {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
}
.sidebar-label {
  font-size: 11px; color: #6b7280; text-align: center; line-height: 1.2;
  max-width: 80px; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

@media (max-width: 360px) { .more-grid { grid-template-columns: repeat(3, 1fr); } }
</style>

<style>
/* ═══ Global mobile overrides ═══ */
.mobile-app .px-6 { padding-left: 14px !important; padding-right: 14px !important; }
.mobile-app .px-8 { padding-left: 14px !important; padding-right: 14px !important; }
.mobile-app .px-4 { padding-left: 12px !important; padding-right: 12px !important; }
.mobile-app .p-6 { padding: 14px !important; }
.mobile-app .p-8 { padding: 14px !important; }
.mobile-app .gap-6 { gap: 12px !important; }
.mobile-app .gap-8 { gap: 12px !important; }
.mobile-app .text-2xl { font-size: 20px !important; }
.mobile-app .text-3xl { font-size: 22px !important; }
.mobile-app .text-xl { font-size: 18px !important; }
.mobile-app .max-w-7xl { max-width: 100% !important; }
.mobile-app .max-w-6xl { max-width: 100% !important; }
.mobile-app .max-w-5xl { max-width: 100% !important; }
.mobile-app .max-w-4xl { max-width: 100% !important; }
.mobile-app .max-w-3xl { max-width: 100% !important; }
.mobile-app .w-96 { width: 100% !important; }
.mobile-app .w-80 { width: 100% !important; }
.mobile-app table { font-size: 13px !important; }
.mobile-app .overflow-x-auto { -webkit-overflow-scrolling: touch; }
.mobile-app .h-\[calc\(100vh-120px\)\] { height: calc(100vh - 130px) !important; }
.mobile-app .h-\[calc\(100vh-100px\)\] { height: calc(100vh - 130px) !important; }
.mobile-app .h-\[calc\(100vh-80px\)\] { height: calc(100vh - 130px) !important; }
.mobile-app .h-\[calc\(100vh-140px\)\] { height: calc(100vh - 140px) !important; }
.mobile-app .h-\[calc\(100vh-160px\)\] { height: calc(100vh - 140px) !important; }
.mobile-app .h-\[calc\(100vh-200px\)\] { height: calc(100vh - 150px) !important; }
.mobile-app .grid-cols-4 { grid-template-columns: repeat(2, 1fr) !important; }
.mobile-app .grid-cols-3 { grid-template-columns: repeat(2, 1fr) !important; }
.mobile-app .grid-cols-5 { grid-template-columns: repeat(3, 1fr) !important; }
.mobile-app .grid-cols-6 { grid-template-columns: repeat(3, 1fr) !important; }

/* ═══ Tablet landscape: wider grid + more columns ═══ */
.tablet-landscape .px-6 { padding-left: 20px !important; padding-right: 20px !important; }
.tablet-landscape .px-8 { padding-left: 20px !important; padding-right: 20px !important; }
.tablet-landscape .p-6 { padding: 20px !important; }
.tablet-landscape .p-8 { padding: 20px !important; }
.tablet-landscape .gap-6 { gap: 16px !important; }
.tablet-landscape .gap-8 { gap: 16px !important; }
.tablet-landscape .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
.tablet-landscape .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
.tablet-landscape .grid-cols-5 { grid-template-columns: repeat(5, 1fr) !important; }
.tablet-landscape .grid-cols-6 { grid-template-columns: repeat(4, 1fr) !important; }
.tablet-landscape .grid-cols-2 { grid-template-columns: repeat(3, 1fr) !important; }
.tablet-landscape .text-2xl { font-size: 24px !important; }
.tablet-landscape .text-3xl { font-size: 28px !important; }
.tablet-landscape table { font-size: 14px !important; }
</style>

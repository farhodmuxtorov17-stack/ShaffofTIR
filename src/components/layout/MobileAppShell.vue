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
  Network, ShieldCheck, UsersRound
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const masterStore = useMasterStore()
const { locale, setLocale } = useI18n()

const role = computed(() => authStore.user?.role || 'EMPLOYEE')
const unreadCount = computed(() => masterStore.getNotificationsUnread().length)
const moreSheetOpen = ref(false)

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
    admin: 'Админ', history: 'История', materials: 'Материалы',
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
    objections: 'E\tirozlar', approvalTasks: 'Kelishuv',
    recommendations: 'Tavsiyalar', actionPlans: 'Rejalar',
    dataQuality: 'Sifat', integration: 'Integratsiya',
    users: 'Foydalanuvchi', audit: 'Audit', systemHealth: 'Tizim',
    notifications: 'Xabarlar', settings: 'Sozlamalar', help: 'Yordam',
    admin: 'Admin', history: 'Tarix', materials: 'Materiallar',
  }
  return m[key] || key
}

const tabs = computed<TabItem[]>(() => {
  if (role.value === 'SUPER_ADMIN') return [
    { icon: Shield, label: nav('admin'), path: '/admin' },
    { icon: Monitor, label: nav('command'), path: '/command-center' },
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: Users, label: nav('sessions'), path: '/sessions' },
    { icon: MoreHorizontal, label: nav('more'), path: '__more__' },
  ]
  if (role.value === 'MANAGER') return [
    { icon: LayoutDashboard, label: nav('home'), path: '/dashboard' },
    { icon: Monitor, label: nav('command'), path: '/command-center' },
    { icon: Target, label: nav('results'), path: '/results' },
    { icon: FileText, label: nav('reports'), path: '/reports' },
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
    { icon: HelpCircle, label: nav('help'), path: '/help' },
  ]
})

const activeTabPath = computed(() => {
  const path = route.path
  for (const tab of tabs.value) {
    if (tab.path === path) return tab.path
    if (path.startsWith(tab.path + '/')) return tab.path
  }
  return ''
})

function onTabClick(tab: TabItem) {
  if (tab.path === '__more__') moreSheetOpen.value = true
  else router.push(tab.path)
}

function onMoreItemClick(path: string) {
  moreSheetOpen.value = false
  router.push(path)
}

function toggleLocale() { setLocale(locale.value === 'uz' ? 'ru' : 'uz') }
function goProfile() { router.push('/profile') }

watch(moreSheetOpen, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <div class="mobile-app">
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

    <main class="mobile-content">
      <router-view :key="$route.path" />
    </main>

    <nav class="mobile-tabbar">
      <button v-for="tab in tabs" :key="tab.path" class="tab-item"
        :class="{ active: activeTabPath === tab.path }" @click="onTabClick(tab)">
        <div class="tab-icon-wrap">
          <component :is="tab.icon" class="tab-icon" />
          <span v-if="tab.badge?.()" class="tab-badge">{{ tab.badge()! > 9 ? '9+' : tab.badge()! }}</span>
        </div>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

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
  </div>
</template>

<style scoped>
.mobile-app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #f8faf9; overflow: hidden; }
.mobile-topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-bottom: 1px solid #e8edec; flex-shrink: 0; z-index: 30; }
.topbar-left { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 38px; height: 38px; border-radius: 50%; background: #1b5e20; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.topbar-info { display: flex; flex-direction: column; gap: 1px; }
.topbar-role { font-size: 11px; color: #6b7280; font-weight: 500; }
.topbar-name { font-size: 14px; color: #1f2937; font-weight: 600; line-height: 1.2; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.topbar-icon-btn { position: relative; width: 38px; height: 38px; border-radius: 10px; background: #f3f4f6; border: none; display: flex; align-items: center; justify-content: center; color: #6b7280; cursor: pointer; }
.badge-dot { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px; display: flex; align-items: center; justify-content: center; }
.topbar-lang { width: 38px; height: 38px; border-radius: 10px; background: #f3f4f6; border: none; color: #374151; font-size: 12px; font-weight: 700; cursor: pointer; }
.mobile-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
.mobile-content::-webkit-scrollbar { width: 0; }
.mobile-tabbar { display: flex; align-items: center; justify-content: space-around; background: #fff; border-top: 1px solid #e8edec; padding: 6px 4px; padding-bottom: max(6px, env(safe-area-inset-bottom)); flex-shrink: 0; z-index: 30; }
.tab-item { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 10px; flex: 1; min-width: 0; transition: background 0.15s; }
.tab-item:active { background: #f3f4f6; }
.tab-icon-wrap { position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.tab-icon { width: 22px; height: 22px; color: #9ca3af; transition: color 0.15s; }
.tab-item.active .tab-icon { color: #1b5e20; }
.tab-badge { position: absolute; top: -4px; right: -6px; background: #ef4444; color: #fff; font-size: 8px; font-weight: 700; min-width: 14px; height: 14px; border-radius: 7px; padding: 0 3px; display: flex; align-items: center; justify-content: center; }
.tab-label { font-size: 10px; font-weight: 500; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; transition: color 0.15s; }
.tab-item.active .tab-label { color: #1b5e20; font-weight: 600; }
.more-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100; }
.more-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 20px 20px 0 0; padding: 12px 16px; padding-bottom: max(20px, env(safe-area-inset-bottom)); z-index: 101; max-height: 75vh; overflow-y: auto; }
.more-handle { width: 40px; height: 4px; border-radius: 2px; background: #d1d5db; margin: 0 auto 12px; }
.more-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.more-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.more-close { width: 32px; height: 32px; border-radius: 50%; background: #f3f4f6; border: none; display: flex; align-items: center; justify-content: center; color: #6b7280; cursor: pointer; }
.more-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.more-item { display: flex; flex-direction: column; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; padding: 10px 4px; border-radius: 14px; transition: background 0.15s; }
.more-item:active { background: #f3f4f6; }
.more-item.active { background: #e8f5e9; }
.more-icon-wrap { position: relative; width: 48px; height: 48px; border-radius: 14px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; transition: all 0.15s; }
.more-item.active .more-icon-wrap { background: #1b5e20; color: #fff; }
.more-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px; display: flex; align-items: center; justify-content: center; }
.more-label { font-size: 11px; color: #6b7280; text-align: center; line-height: 1.2; max-width: 72px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
@media (max-width: 360px) { .more-grid { grid-template-columns: repeat(3, 1fr); } }
</style>

<style>
/* Global mobile overrides - only active inside MobileAppShell */
.mobile-app .px-6 { padding-left: 14px !important; padding-right: 14px !important; }
.mobile-app .px-8 { padding-left: 14px !important; padding-right: 14px !important; }
.mobile-app .py-6 { padding-top: 12px !important; padding-bottom: 12px !important; }
.mobile-app .py-8 { padding-top: 12px !important; padding-bottom: 12px !important; }
.mobile-app .p-6 { padding: 14px !important; }
.mobile-app .p-8 { padding: 14px !important; }
.mobile-app .gap-6 { gap: 10px !important; }
.mobile-app .gap-8 { gap: 10px !important; }
.mobile-app .mb-6 { margin-bottom: 10px !important; }
.mobile-app .mt-6 { margin-top: 10px !important; }
.mobile-app .mt-8 { margin-top: 12px !important; }
.mobile-app .text-3xl { font-size: 1.5rem !important; }
.mobile-app .text-4xl { font-size: 1.75rem !important; }
.mobile-app .text-5xl { font-size: 2rem !important; }
.mobile-app .max-w-7xl { max-width: 100% !important; }
.mobile-app .max-w-6xl { max-width: 100% !important; }
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
</style>

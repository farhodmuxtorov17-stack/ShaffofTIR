<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { Search, Bell, ChevronDown, Globe, User, LogOut, Check, Menu } from 'lucide-vue-next'

defineProps<{ isMobile?: boolean }>()
const emit = defineEmits<{ toggleSidebar: [] }>()

const uiStore = useUiStore()
const authStore = useAuthStore()
const masterStore = useMasterStore()
const router = useRouter()
const { t, locale, setLocale } = useI18n()

const isDropdownOpen = ref(false)
const showNotifications = ref(false)
const unreadCount = computed(() => masterStore.getNotificationsUnread().length)

const userInitials = computed(() => {
  const name = authStore.user?.full_name || ''
  const parts = name.split(' ')
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
})

const roleColors: Record<string, string> = {
  MANAGER: '#18181b',
  INSTRUCTOR: '#059669',
  EMPLOYEE: '#6366f1',
  TECHSPEC: '#d97706',
  SUPER_ADMIN: '#dc2626',
}

function toggleLocale() {
  setLocale(locale.value === 'ru' ? 'uz' : 'ru')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function markAllRead() {
  masterStore.notifications.forEach((n: any) => n.is_read = true)
}

function markRead(id: string) {
  const n = masterStore.notifications.find((n: any) => n.id === id)
  if (n) n.is_read = true
}

function getNotifIcon(type: string) {
  if (type === 'session') return '\u{1F3AF}'
  if (type === 'review') return '\u{1F4CB}'
  if (type === 'training') return '\u{1F393}'
  if (type === 'system') return '\u{2699}\u{FE0F}'
  return '\u{1F514}'
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu-btn') && !target.closest('.user-dropdown')) {
    isDropdownOpen.value = false
  }
  if (!target.closest('.notif-btn') && !target.closest('.notif-panel')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  uiStore.checkHealth().catch(() => {})
  uiStore.checkAiHealth().catch(() => {})
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="topbar-root">
    <!-- Hamburger (mobile only) -->
    <button class="hamburger-btn lg:hidden" @click="emit('toggleSidebar')">
      <Menu class="w-4 h-4" />
    </button>

    <!-- Search (desktop only) -->
    <div class="topbar-search-wrapper hidden lg:block">
      <div class="topbar-search-icon">
        <Search class="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        :placeholder="t('common.search') + '...'"
        disabled
        class="topbar-search-input"
      />
    </div>

    <!-- Right -->
    <div class="flex items-center gap-1.5 ml-auto">
      <!-- Language -->
      <button class="topbar-icon-btn" @click="toggleLocale">
        <Globe class="w-3.5 h-3.5" />
        <span class="text-[11px] font-medium">{{ locale === 'ru' ? 'RU' : 'UZ' }}</span>
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button class="notif-btn topbar-icon-btn relative" @click.stop="showNotifications = !showNotifications">
          <Bell class="w-3.5 h-3.5" />
          <span v-if="unreadCount > 0" class="absolute top-0 right-0 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform scale-95 opacity-0 -translate-y-1"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0 -translate-y-1">
          <div v-if="showNotifications" class="notif-panel absolute right-0 mt-1 w-72 sm:w-80 rounded-2xl z-50 bg-white border border-gray-100 shadow-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-900">{{ locale === 'uz' ? 'Bildirishnomalar' : 'Уведомления' }}</p>
              <button v-if="unreadCount > 0" @click="markAllRead" class="text-[10px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <Check class="w-3 h-3" /> {{ locale === 'uz' ? 'Barchasini o\u02BBqish' : 'Прочитать все' }}
              </button>
            </div>
            <div class="max-h-72 overflow-y-auto">
              <div v-if="masterStore.notifications.length === 0" class="px-4 py-8 text-center">
                <Bell class="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p class="text-xs text-gray-400">{{ locale === 'uz' ? 'Bildirishnomalar yo\u02BBq' : 'Нет уведомлений' }}</p>
              </div>
              <div v-for="n in masterStore.notifications.slice(0, 15)" :key="n.id"
                @click="markRead(n.id)"
                class="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3"
                :class="!n.is_read ? 'bg-green-50/30' : ''">
                <span class="text-lg shrink-0 mt-0.5">{{ getNotifIcon(n.type) }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-800 truncate">{{ n.title }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{{ n.message }}</p>
                  <p class="text-[9px] text-gray-300 mt-1">{{ n.created_at }}</p>
                </div>
                <span v-if="!n.is_read" class="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5"></span>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- User -->
      <div class="relative ml-1">
        <button @click.stop="isDropdownOpen = !isDropdownOpen"
          class="user-menu-btn flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 transition">
          <div class="w-7 h-7 rounded-full text-white flex items-center justify-center font-medium text-[10px] shrink-0"
            :style="{ background: roleColors[authStore.user?.role || ''] || '#18181b' }">
            {{ userInitials }}
          </div>
          <div class="text-left hidden sm:block">
            <p class="text-[12px] font-medium text-gray-900 leading-none">{{ authStore.user?.full_name?.split(' ').slice(0,2).join(' ') || '-' }}</p>
            <p class="text-[10px] text-gray-500 mt-0.5">{{ authStore.user?.role ? (locale === 'uz' ? authStore.roleLabelsUz[authStore.user.role] : authStore.roleLabels[authStore.user.role]) : '' }}</p>
          </div>
          <ChevronDown class="w-3 h-3 text-gray-400 transition hidden sm:block" :class="{ 'rotate-180': isDropdownOpen }" />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <div v-if="isDropdownOpen" class="user-dropdown absolute right-0 mt-1 w-48 rounded-xl py-1 z-50 bg-white border border-gray-100 shadow-lg">
            <button class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition" @click="router.push('/profile')">
              <User class="w-3.5 h-3.5" /> {{ t('nav.profile') }}
            </button>
            <div class="border-t border-gray-100 my-1"></div>
            <button class="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition" @click="handleLogout">
              <LogOut class="w-3.5 h-3.5" /> {{ t('common.logout') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar-root {
  height: 52px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
@media (min-width: 1024px) {
  .topbar-root { padding: 0 20px; }
}
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.hamburger-btn:hover { background: #f3f4f6; }
.topbar-icon-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.15s;
  background: none;
  border: none;
  cursor: pointer;
}
.topbar-icon-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
.topbar-search-wrapper {
  width: 280px;
  position: relative;
}
.topbar-search-icon {
  position: absolute;
  inset-y: 0;
  left: 10px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #9ca3af;
}
.topbar-search-input {
  width: 100%;
  padding-left: 32px;
  padding-right: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 10px;
  font-size: 12px;
  color: #6b7280;
  background: rgba(249,250,241,0.6);
  border: 1px solid rgba(0,0,0,0.05);
  outline: none;
  cursor: not-allowed;
}
.topbar-search-input::placeholder { color: #9ca3af; }
</style>

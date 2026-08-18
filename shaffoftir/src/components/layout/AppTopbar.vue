<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { Search, Bell, ChevronDown, Globe, User, LogOut, Check, Menu } from 'lucide-vue-next'

defineProps<{ isMobile?: boolean }>()
const emit = defineEmits<{ toggleSidebar: [] }>()

const authStore = useAuthStore()
const router = useRouter()
const { t, locale, setLocale } = useI18n()

const isDropdownOpen = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.full_name || ''
  const parts = name.split(' ')
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
})

const roleColors: Record<string, string> = {
  MANAGER: 'linear-gradient(135deg, #18181b, #27272a)',
  INSTRUCTOR: 'linear-gradient(135deg, #059669, #047857)',
  EMPLOYEE: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  TECHSPEC: 'linear-gradient(135deg, #d97706, #b45309)',
  SUPER_ADMIN: 'linear-gradient(135deg, #dc2626, #b91c1c)',
}

function toggleLocale() {
  setLocale(locale.value === 'ru' ? 'uz' : 'ru')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu-btn') && !target.closest('.user-dropdown')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="topbar-root">
    <button class="hamburger-btn lg:hidden" @click="emit('toggleSidebar')">
      <Menu class="w-4 h-4" />
    </button>

    <div class="topbar-search-wrapper hidden lg:block">
      <div class="topbar-search-icon"><Search class="w-3.5 h-3.5" /></div>
      <input type="text" :placeholder="t('common.search') + '...'" disabled class="topbar-search-input" />
      <div class="topbar-search-kbd">Ctrl K</div>
    </div>

    <div class="flex items-center gap-1.5 ml-auto">
      <button class="topbar-icon-btn" @click="toggleLocale">
        <Globe class="w-3.5 h-3.5" />
        <span class="text-[11px] font-medium">{{ locale === 'ru' ? 'RU' : 'UZ' }}</span>
      </button>

      <!-- Profile button -->
      <div class="relative ml-1">
        <button @click.stop="isDropdownOpen = !isDropdownOpen" class="user-menu-btn">
          <div class="user-avatar" :style="{ background: roleColors[authStore.user?.role || ''] || 'linear-gradient(135deg, #18181b, #27272a)' }">
            {{ userInitials }}
          </div>
          <div class="text-left hidden sm:block">
            <p class="user-name">{{ authStore.user?.full_name?.split(' ').slice(0,2).join(' ') || '-' }}</p>
            <p class="user-role">{{ authStore.user?.role ? (locale === 'uz' ? authStore.roleLabelsUz[authStore.user.role] : authStore.roleLabels[authStore.user.role]) : '' }}</p>
          </div>
          <ChevronDown class="w-3 h-3 text-gray-400 transition hidden sm:block" :class="{ 'rotate-180': isDropdownOpen }" />
        </button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <div v-if="isDropdownOpen" class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="user-avatar" :style="{ background: roleColors[authStore.user?.role || ''] || 'linear-gradient(135deg, #18181b, #27272a)' }">
                {{ userInitials }}
              </div>
              <div>
                <p class="user-dropdown-name">{{ authStore.user?.full_name || '-' }}</p>
                <p class="user-dropdown-email">{{ authStore.user?.email || '' }}</p>
              </div>
            </div>
            <div class="border-t border-gray-100 my-1"></div>
            <button class="user-dropdown-item" @click="router.push('/profile'); isDropdownOpen = false">
              <User class="w-3.5 h-3.5" /> {{ t('nav.profile') }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Logout button (inline, after profile) -->
      <button class="logout-btn" @click="handleLogout" :title="t('common.logout')">
        <LogOut class="w-3.5 h-3.5" />
        <span class="hidden sm:inline text-xs font-medium">{{ t('common.logout') }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar-root {
  height: 52px; padding: 0 12px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
@media (min-width: 1024px) { .topbar-root { padding: 0 20px; } }
.hamburger-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 8px;
  color: #374151; background: none; border: none; cursor: pointer;
  transition: all 0.15s;
}
.hamburger-btn:hover { background: #f3f4f6; }
.topbar-icon-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px; border-radius: 8px;
  color: #6b7280; transition: all 0.15s;
  background: none; border: none; cursor: pointer;
}
.topbar-icon-btn:hover { background: #f3f4f6; color: #111827; }
.topbar-search-wrapper { width: 280px; position: relative; }
.topbar-search-icon { position: absolute; inset-y: 0; left: 10px; display: flex; align-items: center; pointer-events: none; color: #9ca3af; }
.topbar-search-input {
  width: 100%; padding-left: 32px; padding-right: 48px; padding-top: 6px; padding-bottom: 6px;
  border-radius: 10px; font-size: 12px; color: #6b7280;
  background: rgba(249,250,241,0.6); border: 1px solid rgba(0,0,0,0.05);
  outline: none; cursor: not-allowed; transition: all 0.2s;
}
.topbar-search-input::placeholder { color: #9ca3af; }
.topbar-search-kbd {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-size: 9px; font-weight: 500; color: #9ca3af;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.06);
  pointer-events: none;
}
.user-menu-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 4px; border-radius: 10px;
  transition: all 0.15s; border: none; cursor: pointer; background: none;
}
.user-menu-btn:hover { background: #f3f4f6; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
}
.user-name { font-size: 12px; font-weight: 600; color: #111827; line-height: 1.2; }
.user-role { font-size: 10px; color: #6b7280; line-height: 1.2; }
.user-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  width: 240px; background: white; border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.04);
  padding: 8px; z-index: 50;
}
.user-dropdown-header { display: flex; align-items: center; gap: 10px; padding: 8px 6px; }
.user-dropdown-name { font-size: 13px; font-weight: 600; color: #111827; }
.user-dropdown-email { font-size: 11px; color: #6b7280; }
.user-dropdown-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 500; color: #374151;
  transition: all 0.15s; background: none; border: none; cursor: pointer;
}
.user-dropdown-item:hover { background: #f3f4f6; }
.logout-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 10px; border-radius: 8px;
  color: #ef4444; transition: all 0.15s;
  background: none; border: none; cursor: pointer;
}
.logout-btn:hover { background: #fef2f2; }
</style>

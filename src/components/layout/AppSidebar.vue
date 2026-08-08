<script setup lang="ts">
import {
  LayoutDashboard, Users, Radio,
  Camera, FileText, Settings,
  Crosshair, Award, Bell,
  Target, Calendar, Zap,
  HelpCircle, Globe, GitCompare, History,
  Eye, Monitor, Wrench,
  Building2, ShieldCheck, Network,
  MessageSquareWarning, CheckCircle, Sparkles, ClipboardList,
  UsersRound, ScrollText, Shield,
  GraduationCap, Activity
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const masterStore = useMasterStore()
const router = useRouter()
const { t, locale, setLocale } = useI18n()
const role = computed(() => authStore.user?.role || 'EMPLOYEE')

const unreadCount = computed(() => masterStore.getNotificationsUnread().length)

interface NavItem {
  labelKey: string
  path: string
  icon: any
  badge?: () => number
  roles: string[]
}

interface NavGroup {
  labelKey: string
  items: NavItem[]
}

// ── Manager (Раҳбар): analytics, reports, KPI - NO operational shooting management ──
const managerNavGroups: NavGroup[] = [
  {
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
      { labelKey: 'nav.commandCenter', path: '/command-center', icon: Monitor, roles: ['MANAGER'] },
      { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['MANAGER'] },
      { labelKey: 'nav.compare', path: '/compare/0', icon: GitCompare, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.kpi',
    items: [
      { labelKey: 'nav.orgStructure', path: '/org-structure', icon: Building2, roles: ['MANAGER'] },
      { labelKey: 'nav.kpiCatalog', path: '/kpi/catalog', icon: Target, roles: ['MANAGER'] },
      { labelKey: 'nav.kpiPeriods', path: '/kpi/periods', icon: Calendar, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.workflow',
    items: [
      { labelKey: 'nav.objections', path: '/objections', icon: MessageSquareWarning, roles: ['MANAGER'] },
      { labelKey: 'nav.approvalTasks', path: '/approval-tasks', icon: CheckCircle, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.recommendations',
    items: [
      { labelKey: 'nav.recommendationsItems', path: '/recommendations', icon: Sparkles, roles: ['MANAGER'] },
      { labelKey: 'nav.actionPlans', path: '/action-plans', icon: ClipboardList, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.training',
    items: [
      { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.reports',
    items: [
      { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['MANAGER'] },
      { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.analytics',
    items: [
      { labelKey: 'nav.analytics', path: '/analytics', icon: Eye, roles: ['MANAGER'] },
      { labelKey: 'nav.dataQuality', path: '/data-quality', icon: ShieldCheck, roles: ['MANAGER'] },
      { labelKey: 'nav.integrationMonitoring', path: '/integration-monitoring', icon: Network, roles: ['MANAGER'] },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { labelKey: 'nav.notifications', path: '/notifications', icon: Bell, roles: ['MANAGER'], badge: () => unreadCount.value },
      { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['MANAGER'] },
      { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['MANAGER'] },
    ],
  },
]

// ── Instructor: operational - sessions, range, weapons, cameras ──
const instructorNavGroups: NavGroup[] = [
  {
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.tablet', path: '/range/instructor-tablet', icon: Zap, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.range', path: '/range/dashboard', icon: Radio, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.sessions', path: '/sessions', icon: Users, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.schedule', path: '/range/schedule', icon: Calendar, roles: ['INSTRUCTOR'] },
    ],
  },
  {
    labelKey: 'nav.equipment',
    items: [
      { labelKey: 'nav.arsenal', path: '/weapons', icon: Crosshair, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['INSTRUCTOR'] },
    ],
  },
  {
    labelKey: 'nav.training',
    items: [
      { labelKey: 'nav.plans', path: '/training', icon: Award, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.history', path: '/training/history', icon: History, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['INSTRUCTOR'] },
    ],
  },
  {
    labelKey: 'nav.reports',
    items: [
      { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['INSTRUCTOR'] },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { labelKey: 'nav.notifications', path: '/notifications', icon: Bell, roles: ['INSTRUCTOR'], badge: () => unreadCount.value },
      { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['INSTRUCTOR'] },
      { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['INSTRUCTOR'] },
    ],
  },
]

// ── Employee: minimal, own data only ──
const employeeNavGroups: NavGroup[] = [
  {
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.myResults', path: '/results', icon: Target, roles: ['EMPLOYEE'] },
      { labelKey: 'nav.schedule', path: '/range/schedule', icon: Calendar, roles: ['EMPLOYEE'] },
      { labelKey: 'nav.myHistory', path: '/training/history', icon: History, roles: ['EMPLOYEE'] },
      { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['EMPLOYEE'] },
    ],
  },
  {
    labelKey: 'nav.reports',
    items: [
      { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['EMPLOYEE'] },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['EMPLOYEE'] },
    ],
  },
]

// ── TechSpec: isolated - only polygon/camera infrastructure ──
const techSpecNavGroups: NavGroup[] = [
  {
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.techspec', path: '/techspec', icon: Wrench, roles: ['TECHSPEC'] },
    ],
  },
  {
    labelKey: 'nav.equipment',
    items: [
      { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['TECHSPEC'] },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['TECHSPEC'] },
    ],
  },
]

// ── Super Admin: full access to everything ──
const superAdminNavGroups: NavGroup[] = [
  {
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.adminPanel', path: '/admin', icon: Shield, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.commandCenter', path: '/command-center', icon: Monitor, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.sessions', path: '/sessions', icon: Users, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.hr',
    items: [
      { labelKey: 'nav.employees', path: '/hr/employees', icon: Users, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.orgStructure', path: '/org-structure', icon: Building2, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.kpi',
    items: [
      { labelKey: 'nav.kpiCatalog', path: '/kpi/catalog', icon: Target, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.kpiPeriods', path: '/kpi/periods', icon: Calendar, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.workflow',
    items: [
      { labelKey: 'nav.objections', path: '/objections', icon: MessageSquareWarning, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.approvalTasks', path: '/approval-tasks', icon: CheckCircle, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.recommendations',
    items: [
      { labelKey: 'nav.recommendationsItems', path: '/recommendations', icon: Sparkles, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.actionPlans', path: '/action-plans', icon: ClipboardList, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.equipment',
    items: [
      { labelKey: 'nav.techspec', path: '/techspec', icon: Wrench, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.arsenal', path: '/weapons', icon: Crosshair, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.analytics',
    items: [
      { labelKey: 'nav.analytics', path: '/analytics', icon: Eye, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.compare', path: '/compare/0', icon: GitCompare, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.dataQuality', path: '/data-quality', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.integrationMonitoring', path: '/integration-monitoring', icon: Network, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.training',
    items: [
      { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.reports',
    items: [
      { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.administration',
    items: [
      { labelKey: 'nav.usersRoles', path: '/admin/users', icon: UsersRound, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.auditJournal', path: '/admin/audit', icon: ScrollText, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.systemHealth', path: '/system-health', icon: Activity, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { labelKey: 'nav.notifications', path: '/notifications', icon: Bell, roles: ['SUPER_ADMIN'], badge: () => unreadCount.value },
      { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
      { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['SUPER_ADMIN'] },
    ],
  },
]

const navGroups = computed<NavGroup[]>(() => {
  const r = authStore.user?.role || 'EMPLOYEE'
  if (r === 'SUPER_ADMIN') return superAdminNavGroups
  if (r === 'MANAGER') return managerNavGroups
  if (r === 'INSTRUCTOR') return instructorNavGroups
  if (r === 'TECHSPEC') return techSpecNavGroups
  return employeeNavGroups
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function toggleLocale() {
  setLocale(locale.value === 'ru' ? 'uz' : 'ru')
}
</script>

<template>
  <aside class="sidebar-root">
    <div class="sidebar-header">
      <div class="sidebar-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#sidebarGrad)" stroke-width="2" stroke-linecap="round" class="w-3.5 h-3.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="1.5" fill="#22c55e" />
          <defs>
            <linearGradient id="sidebarGrad" x1="0" y1="0" x2="24" y2="24">
              <stop stop-color="#22c55e"/>
              <stop offset="1" stop-color="#15803d"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="sidebar-logo-text">
        Shaffof<span class="sidebar-logo-accent">TIR</span>
      </span>
      <button class="sidebar-lang-btn" @click="toggleLocale">
        <Globe class="w-3 h-3 text-gray-500" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-2.5 py-2 space-y-3 sidebar-scroll">
      <div v-for="group in navGroups" :key="group.labelKey">
        <p class="text-[9px] font-medium uppercase tracking-wider px-2 mb-1" style="color: rgba(255,255,255,0.2);">{{ t(group.labelKey) }}</p>
        <div class="space-y-0.5">
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="sidebar-item relative"
            active-class="sidebar-item-active"
          >
            <component :is="item.icon" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ t(item.labelKey) }}</span>
            <span v-if="item.badge && item.badge() > 0" class="ml-auto px-1.5 py-0.5 text-[9px] font-medium rounded-full" style="background: rgba(22,163,74,0.15); color: #16a34a;">
              {{ item.badge() }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="p-3 border-t border-white/[0.04] shrink-0">
      <button class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition" @click="router.push('/profile')">
        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
          {{ authStore.user?.full_name?.[0] || 'A' }}
        </div>
        <div class="min-w-0 text-left">
          <p class="text-[11px] font-medium text-gray-300 truncate">{{ authStore.user?.full_name || 'Admin' }}</p>
          <p class="text-[9px] text-gray-600">{{ role }}</p>
        </div>
        <button class="ml-auto p-1 rounded hover:bg-white/5 transition shrink-0" @click.stop="handleLogout">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-500">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-root {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #080c0a 0%, #0a0f0d 100%);
  border-right: 1px solid rgba(22,163,74,0.04);
  position: relative;
}
.sidebar-root::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 200px;
  background: radial-gradient(ellipse at top, rgba(22,163,74,0.06), transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.sidebar-logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22,163,74,0.08);
  border: 1px solid rgba(22,163,74,0.12);
  filter: drop-shadow(0 0 8px rgba(22,163,74,0.15));
}
.sidebar-logo-text {
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: -0.02em;
}
.sidebar-logo-accent {
  color: #22c55e;
}
.sidebar-lang-btn {
  margin-left: auto;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}
.sidebar-lang-btn:hover {
  background: rgba(255,255,255,0.05);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.42);
  transition: all 0.15s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}
.sidebar-item:hover {
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.65);
}
.sidebar-item-active {
  background: rgba(22,163,74,0.1) !important;
  color: #4ade80 !important;
}
.sidebar-item-active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: linear-gradient(180deg, #22c55e, #15803d);
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 8px rgba(34,197,94,0.3);
}
.sidebar-scroll::-webkit-scrollbar { width: 3px; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 3px; }
</style>

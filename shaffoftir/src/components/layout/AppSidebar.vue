<script setup lang="ts">
import {
  LayoutDashboard, Users,
  Camera, FileText, Settings,
  Crosshair, Award,
  Target, Calendar, Zap,
  HelpCircle, Globe, GitCompare, History,
  Eye, Wrench,
  MessageSquareWarning, CheckCircle, Sparkles,
  UsersRound, ScrollText, Shield,
  GraduationCap, Activity, Radio,
  Monitor, Bell,
  LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{ navigate: [] }>()
const authStore = useAuthStore()
const { t, locale, setLocale } = useI18n()
const router = useRouter()
const role = computed(() => authStore.user?.role || 'EMPLOYEE')

interface NavItem {
  labelKey: string
  path: string
  icon: any
  roles: string[]
}

interface NavGroup {
  labelKey: string
  items: NavItem[]
}

const managerNavGroups: NavGroup[] = [
  { labelKey: 'nav.main', items: [
    { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
    { labelKey: 'nav.commandCenter', path: '/command-center', icon: Monitor, roles: ['MANAGER'] },
    { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['MANAGER'] },
    { labelKey: 'nav.compare', path: '/compare/0', icon: GitCompare, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.kpi', items: [
    { labelKey: 'nav.kpiCatalog', path: '/kpi/catalog', icon: Target, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.workflow', items: [
    { labelKey: 'nav.objections', path: '/objections', icon: MessageSquareWarning, roles: ['MANAGER'] },
    { labelKey: 'nav.approvalTasks', path: '/approval-tasks', icon: CheckCircle, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.training', items: [
    { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.reports', items: [
    { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['MANAGER'] },
    { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.liveRange', items: [
    { labelKey: 'nav.liveRange', path: '/live-range', icon: Radio, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.analytics', items: [
    { labelKey: 'nav.analytics', path: '/analytics', icon: Eye, roles: ['MANAGER'] },
  ]},
  { labelKey: 'nav.system', items: [
    { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['MANAGER'] },
    { labelKey: 'nav.notifications', path: '/notifications', icon: Bell, roles: ['MANAGER'] },
    { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['MANAGER'] },
  ]},
]

const instructorNavGroups: NavGroup[] = [
  { labelKey: 'nav.main', items: [
    { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.tablet', path: '/range/instructor-tablet', icon: Zap, roles: ['INSTRUCTOR', 'SUPER_ADMIN'] },
    { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.range', path: '/range/dashboard', icon: Target, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.sessions', path: '/sessions', icon: Users, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.schedule', path: '/range/schedule', icon: Calendar, roles: ['INSTRUCTOR'] },
  ]},
  { labelKey: 'nav.equipment', items: [
    { labelKey: 'nav.arsenal', path: '/weapons', icon: Crosshair, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['INSTRUCTOR'] },
  ]},
  { labelKey: 'nav.training', items: [
    { labelKey: 'nav.plans', path: '/training', icon: Award, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.history', path: '/training/history', icon: History, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['INSTRUCTOR'] },
  ]},
  { labelKey: 'nav.reports', items: [
    { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['INSTRUCTOR'] },
  ]},
  { labelKey: 'nav.system', items: [
    { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.notifications', path: '/notifications', icon: Bell, roles: ['INSTRUCTOR'] },
    { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['INSTRUCTOR'] },
  ]},
]

const employeeNavGroups: NavGroup[] = [
  { labelKey: 'nav.main', items: [
    { labelKey: 'nav.myResults', path: '/results', icon: Target, roles: ['EMPLOYEE'] },
    { labelKey: 'nav.schedule', path: '/range/schedule', icon: Calendar, roles: ['EMPLOYEE'] },
    { labelKey: 'nav.myHistory', path: '/training/history', icon: History, roles: ['EMPLOYEE'] },
    { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['EMPLOYEE'] },
  ]},
  { labelKey: 'nav.recommendations', items: [
    { labelKey: 'nav.recommendationsItems', path: '/recommendations', icon: Sparkles, roles: ['EMPLOYEE'] },
  ]},
  { labelKey: 'nav.reports', items: [
    { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['EMPLOYEE'] },
  ]},
  { labelKey: 'nav.system', items: [
    { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['EMPLOYEE'] },
  ]},
]

const techSpecNavGroups: NavGroup[] = [
  { labelKey: 'nav.main', items: [
    { labelKey: 'nav.techspec', path: '/techspec', icon: Wrench, roles: ['TECHSPEC'] },
  ]},
  { labelKey: 'nav.equipment', items: [
    { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['TECHSPEC'] },
    { labelKey: 'nav.cameraConfig', path: '/cameras/config', icon: Settings, roles: ['TECHSPEC'] },
  ]},
  { labelKey: 'nav.system', items: [
    { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['TECHSPEC'] },
  ]},
]

const superAdminNavGroups: NavGroup[] = [
  { labelKey: 'nav.main', items: [
    { labelKey: 'nav.adminPanel', path: '/admin', icon: Shield, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.commandCenter', path: '/command-center', icon: Monitor, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.results', path: '/results', icon: Target, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.sessions', path: '/sessions', icon: Users, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.hr', items: [
    { labelKey: 'nav.employees', path: '/hr/employees', icon: Users, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.kpi', items: [
    { labelKey: 'nav.kpiCatalog', path: '/kpi/catalog', icon: Target, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.workflow', items: [
    { labelKey: 'nav.objections', path: '/objections', icon: MessageSquareWarning, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.approvalTasks', path: '/approval-tasks', icon: CheckCircle, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.equipment', items: [
    { labelKey: 'nav.techspec', path: '/techspec', icon: Wrench, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.cameras', path: '/cameras/dashboard', icon: Camera, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.arsenal', path: '/weapons', icon: Crosshair, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.analytics', items: [
    { labelKey: 'nav.analytics', path: '/analytics', icon: Eye, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.compare', path: '/compare/0', icon: GitCompare, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.training', items: [
    { labelKey: 'nav.trainingMaterials', path: '/training/materials', icon: GraduationCap, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.reports', items: [
    { labelKey: 'nav.reports', path: '/reports', icon: FileText, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.protocols', path: '/protocols', icon: FileText, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.administration', items: [
    { labelKey: 'nav.usersRoles', path: '/admin/users', icon: UsersRound, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.auditJournal', path: '/admin/audit', icon: ScrollText, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.systemHealth', path: '/system-health', icon: Activity, roles: ['SUPER_ADMIN'] },
  ]},
  { labelKey: 'nav.system', items: [
    { labelKey: 'nav.settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
    { labelKey: 'nav.help', path: '/help', icon: HelpCircle, roles: ['SUPER_ADMIN'] },
  ]},
]

const navGroups = computed<NavGroup[]>(() => {
  const r = authStore.user?.role || 'EMPLOYEE'
  if (r === 'SUPER_ADMIN') return superAdminNavGroups
  if (r === 'MANAGER') return managerNavGroups
  if (r === 'INSTRUCTOR') return instructorNavGroups
  if (r === 'TECHSPEC') return techSpecNavGroups
  return employeeNavGroups
})

function toggleLocale() {
  setLocale(locale.value === 'ru' ? 'uz' : 'ru')
}

function handleNavigate() {
  emit('navigate')
}
</script>

<template>
  <aside class="sidebar-root">
    <div class="sidebar-top-glow"></div>
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
      <span class="sidebar-logo-text">Shaffof<span class="sidebar-logo-accent">TIR</span></span>
      <button class="sidebar-lang-btn" @click="toggleLocale">
        <Globe class="w-3 h-3 text-gray-500" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-2.5 py-2 space-y-3 sidebar-scroll">
      <div v-for="group in navGroups" :key="group.labelKey" class="nav-group">
        <p class="nav-group-label">{{ t(group.labelKey) }}</p>
        <div class="space-y-0.5">
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="sidebar-item relative group"
            active-class="sidebar-item-active"
            @click="handleNavigate"
          >
            <component :is="item.icon" class="sidebar-item-icon" />
            <span class="truncate">{{ t(item.labelKey) }}</span>
            <div class="sidebar-item-glow"></div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-user-btn">
        <div class="sidebar-user-avatar">{{ authStore.user?.full_name?.[0] || 'A' }}</div>
        <div class="min-w-0 text-left flex-1">
          <p class="sidebar-user-name">{{ authStore.user?.full_name || 'Admin' }}</p>
          <p class="sidebar-user-role">{{ role }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-root {
  width: 224px; flex-shrink: 0; display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  background: linear-gradient(180deg, #080c0a 0%, #0a0f0d 100%);
  border-right: 1px solid rgba(22,163,74,0.04);
  position: relative;
  z-index: 1000;
}
.sidebar-top-glow {
  position: absolute; top: 0; left: 0; right: 0; height: 200px;
  background: radial-gradient(ellipse at top, rgba(22,163,74,0.06), transparent 70%);
  pointer-events: none;
}
.sidebar-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 14px 12px; flex-shrink: 0;
}
.sidebar-logo-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.12);
}
.sidebar-logo-text { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: #e5e7eb; flex: 1; }
.sidebar-logo-accent { color: #22c55e; }
.sidebar-lang-btn {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 7px;
  background: none; border: none; cursor: pointer; transition: all 0.15s;
}
.sidebar-lang-btn:hover { background: rgba(22,163,74,0.08); }
.sidebar-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(22,163,74,0.15); border-radius: 100px; }
.nav-group-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; padding: 0 10px; margin-bottom: 4px; }
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 500; color: #9ca3af;
  transition: all 0.15s; cursor: pointer; position: relative;
  text-decoration: none;
}
.sidebar-item:hover { background: rgba(255,255,255,0.03); color: #e5e7eb; }
.sidebar-item-active { background: rgba(22,163,74,0.1) !important; color: #22c55e !important; }
.sidebar-item-icon { width: 14px; height: 14px; flex-shrink: 0; }
.sidebar-item-glow { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 2px; height: 0; background: #22c55e; border-radius: 100px; transition: height 0.2s; }
.sidebar-item-active .sidebar-item-glow { height: 60%; }
.sidebar-footer { padding: 10px 14px; border-top: 1px solid rgba(255,255,255,0.04); flex-shrink: 0; }
.sidebar-user-btn { display: flex; align-items: center; gap: 8px; padding: 6px 4px; }
.sidebar-user-avatar { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; background: linear-gradient(135deg, #22c55e, #15803d); flex-shrink: 0; }
.sidebar-user-name { font-size: 11px; font-weight: 600; color: #d1d5db; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: 9px; color: #6b7280; }
</style>

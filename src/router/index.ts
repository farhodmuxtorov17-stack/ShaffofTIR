import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/ProfilePage.vue') },

  { path: '/', redirect: (to: any) => {
    const auth = useAuthStore()
    const role = auth.user?.role
    const q = to.query.miniapp ? { miniapp: to.query.miniapp } : {}
    let p = '/dashboard'
    if (role === 'SUPER_ADMIN') p = '/admin'
    else if (role === 'TECHSPEC') p = '/techspec'
    else if (role === 'EMPLOYEE') p = '/results'
    return { path: p, query: q }
  }},

  { path: '/dashboard', name: 'Dashboard', component: () => import('@/pages/DashboardPage.vue') },

  { path: '/results', name: 'Results', component: () => import('@/pages/ResultsPage.vue') },
  { path: '/results/:id', name: 'ResultDetail', component: () => import('@/pages/ResultDetailPage.vue') },
  { path: '/my-results', redirect: '/results' },
  { path: '/compare', name: 'Compare', component: () => import('@/pages/ComparePage.vue') },
  { path: '/compare/:id', name: 'CompareWithId', component: () => import('@/pages/ComparePage.vue') },
  { path: '/review', name: 'Review', component: () => import('@/pages/ReviewPage.vue') },

  { path: '/cameras', name: 'Cameras', component: () => import('@/pages/CamerasPage.vue') },
  { path: '/cameras/dashboard', name: 'CameraDashboard', component: () => import('@/pages/CameraDashboardPage.vue') },
  { path: '/cameras/live/:id', name: 'CameraLiveFeed', component: () => import('@/pages/CameraLiveFeedPage.vue') },
  { path: '/cameras/recordings', name: 'CameraRecordings', component: () => import('@/pages/CameraRecordingsPage.vue') },

  { path: '/sessions', name: 'Sessions', component: () => import('@/pages/SessionsPage.vue') },
  { path: '/sessions/:id', name: 'SessionsDetail', component: () => import('@/pages/SessionsDetailPage.vue') },

  { path: '/range/dashboard', name: 'RangeDashboard', component: () => import('@/pages/RangeDashboardPage.vue') },
  { path: '/range/lane/:lane', name: 'RangeLane', component: () => import('@/pages/RangeLanePage.vue') },
  { path: '/range/session-setup', redirect: '/range/dashboard' },
  { path: '/range/instructor', redirect: '/range/instructor-tablet' },
  { path: '/range/instructor-tablet', name: 'InstructorTablet', component: () => import('@/pages/InstructorTabletPage.vue') },
  { path: '/range/schedule', name: 'RangeSchedule', component: () => import('@/pages/RangeSchedulePage.vue') },
  { path: '/range/stats', redirect: '/analytics' },
  { path: '/range/config', redirect: '/settings' },

  { path: '/techspec', name: 'TechSpec', component: () => import('@/pages/TechSpecPage.vue') },

  { path: '/kpi/catalog', name: 'KpiCatalog', component: () => import('@/pages/KpiCatalogPage.vue') },
  { path: '/kpi/editor', name: 'KpiEditor', component: () => import('@/pages/KpiEditorPage.vue') },


  { path: '/objections', name: 'Objections', component: () => import('@/pages/ObjectionsPage.vue') },
  { path: '/approval-tasks', name: 'ApprovalTasks', component: () => import('@/pages/ApprovalTasksPage.vue') },

  { path: '/recommendations', name: 'AutoRecommendations', component: () => import('@/pages/AutoRecommendationsPage.vue') },

  { path: '/reports', name: 'Reports', component: () => import('@/pages/ReportsPage.vue') },
  { path: '/reports/create', name: 'ReportCreation', component: () => import('@/pages/ReportCreationPage.vue') },

  { path: '/protocols', name: 'Protocols', component: () => import('@/pages/ProtocolsPage.vue') },
  { path: '/protocols/:id', name: 'ProtocolDetail', component: () => import('@/pages/ProtocolDetailPage.vue') },
  { path: '/protocols/create', name: 'ProtocolCreate', component: () => import('@/pages/ProtocolCreatePage.vue'), meta: { roles: ['SUPER_ADMIN', 'INSTRUCTOR'] } },

  { path: '/admin', name: 'SuperAdmin', component: () => import('@/pages/SuperAdminPage.vue') },
  { path: '/admin/users', name: 'UsersRoles', component: () => import('@/pages/UsersRolesPage.vue') },
  { path: '/admin/reference', name: 'ReferenceData', component: () => import('@/pages/ReferenceDataPage.vue') },
  { path: '/admin/audit', name: 'AuditJournal', component: () => import('@/pages/AuditJournalPage.vue') },

  { path: '/system-health', name: 'SystemHealth', component: () => import('@/pages/SystemHealthPage.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/pages/SettingsPage.vue') },

  { path: '/hr/employees', name: 'HREmployees', component: () => import('@/pages/HREmployeesListPage.vue') },
  { path: '/hr/face-id', redirect: '/hr/employees' },
  { path: '/hr/employee/create', redirect: '/hr/employees' },
  { path: '/hr/employee/:id', name: 'HREmployeeDetail', component: () => import('@/pages/HREmployeeDetailPage.vue') },
  { path: '/hr/departments', name: 'HRDepartments', component: () => import('@/pages/HRDepartmentsPage.vue') },
  { path: '/hr/department/:id', name: 'HRDepartmentDetail', component: () => import('@/pages/HRDepartmentDetailPage.vue') },
  { path: '/hr/sync', name: 'HRSync', component: () => import('@/pages/HRSyncPage.vue') },

  { path: '/weapons', name: 'Weapons', component: () => import('@/pages/WeaponsListPage.vue') },
  { path: '/weapons/maintenance', name: 'WeaponMaintenance', component: () => import('@/pages/WeaponMaintenancePage.vue') },
  { path: '/weapons/inventory', name: 'WeaponInventory', component: () => import('@/pages/WeaponInventoryPage.vue') },
  { path: '/weapons/assignment', name: 'WeaponAssignment', component: () => import('@/pages/WeaponAssignmentPage.vue') },
  { path: '/weapons/:id', name: 'WeaponDetail', component: () => import('@/pages/WeaponDetailPage.vue') },

  { path: '/training', name: 'Training', component: () => import('@/pages/TrainingPlansPage.vue') },
  { path: '/training/schedule', name: 'TrainingSchedule', component: () => import('@/pages/TrainingSchedulePage.vue') },
  { path: '/training/history', name: 'TrainingHistory', component: () => import('@/pages/TrainingHistoryPage.vue') },
  { path: '/training/certification', name: 'TrainingCertification', component: () => import('@/pages/TrainingCertificationPage.vue') },
  { path: '/training/materials', name: 'TrainingMaterials', component: () => import('@/pages/TrainingMaterialsPage.vue') },
  { path: '/training/effectiveness', name: 'TrainingEffectiveness', component: () => import('@/pages/TrainingEffectivenessPage.vue') },
  { path: '/training/:id', name: 'TrainingPlanDetail', component: () => import('@/pages/TrainingPlanDetailPage.vue') },

  { path: '/analytics', name: 'Analytics', component: () => import('@/pages/AnalyticsDashboardPage.vue') },
  { path: '/live-range', name: 'LiveRange', component: () => import('@/pages/LiveRangePage.vue'), meta: { roles: ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR'] } },
  { path: '/analytics/soldiers', name: 'SoldierAnalytics', component: () => import('@/pages/SoldierAnalyticsPage.vue') },
  { path: '/analytics/groups', name: 'GroupAnalytics', component: () => import('@/pages/GroupAnalyticsPage.vue') },
  { path: '/analytics/trends', name: 'PerformanceTrends', component: () => import('@/pages/PerformanceTrendsPage.vue') },


  { path: '/help', name: 'Help', component: () => import('@/pages/HelpPage.vue') },
  { path: '/about', redirect: '/help' },

  { path: '/403', name: 'Error403', component: () => import('@/pages/Error403Page.vue'), meta: { public: true } },
  { path: '/not-found', name: 'NotFound', component: () => import('@/pages/NotFoundPage.vue'), meta: { public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/not-found' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL || '/'),
  routes,
})

const routeRoles: Record<string, string[]> = {
  '/dashboard': ['MANAGER', 'INSTRUCTOR'],
  '/range': ['INSTRUCTOR'],
  '/sessions': ['INSTRUCTOR'],
  '/results': ['MANAGER', 'INSTRUCTOR', 'EMPLOYEE'],
  '/compare': ['MANAGER', 'INSTRUCTOR'],
  '/review': ['INSTRUCTOR'],
  '/cameras': ['MANAGER', 'INSTRUCTOR', 'TECHSPEC'],
  '/hr': ['SUPER_ADMIN', 'INSTRUCTOR'],
  '/weapons': ['INSTRUCTOR'],
  '/training/materials': ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE', 'TECHSPEC'],
  '/training/schedule': ['INSTRUCTOR', 'EMPLOYEE'],
  '/training/history': ['INSTRUCTOR', 'EMPLOYEE'],
  '/training': ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE', 'TECHSPEC'],
  '/analytics': ['SUPER_ADMIN', 'MANAGER'],
  '/live-range': ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR'],
  '/reports': ['MANAGER', 'INSTRUCTOR', 'EMPLOYEE'],
  '/protocols': ['MANAGER', 'INSTRUCTOR', 'EMPLOYEE'],
  '/settings': ['MANAGER', 'INSTRUCTOR', 'SUPER_ADMIN'],
  '/techspec': ['SUPER_ADMIN', 'TECHSPEC'],
  '/kpi': ['SUPER_ADMIN', 'MANAGER'],
  '/objections': ['SUPER_ADMIN', 'MANAGER'],
  '/approval-tasks': ['SUPER_ADMIN', 'MANAGER'],
  '/recommendations': ['SUPER_ADMIN', 'MANAGER'],
  '/admin': ['SUPER_ADMIN'],
  '/profile': ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE', 'TECHSPEC'],
  '/system-health': ['SUPER_ADMIN'],
}

function getRouteRoles(path: string): string[] | null {
  const prefixes = Object.keys(routeRoles).sort((a, b) => b.length - a.length)
  for (const prefix of prefixes) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return routeRoles[prefix]
    }
  }
  return null
}

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Preserve miniapp query param
  if (to.query.miniapp !== '1' && _from.query.miniapp === '1') {
    next({ ...to, query: { ...to.query, miniapp: '1' } })
    return
  }

  if (to.meta.public) {
    next()
    return
  }

  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }

  const role = authStore.user?.role || ''

  if (role === 'SUPER_ADMIN') {
    next()
    return
  }

  if (to.path === '/dashboard' && role === 'EMPLOYEE') {
    next('/results')
    return
  }
  if (to.path === '/dashboard' && role === 'TECHSPEC') {
    next('/techspec')
    return
  }

  if (to.path === '/settings' && role === 'TECHSPEC') {
    next('/techspec')
    return
  }

  const allowedRoles = getRouteRoles(to.path)
  if (allowedRoles && !allowedRoles.includes(role)) {
    next('/403')
    return
  }

  next()
})

export default router

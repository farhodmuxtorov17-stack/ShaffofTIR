import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },

  // Instructor — modules
  { path: '/sessions', name: 'Sessions', component: () => import('@/pages/SessionsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/sessions/:id', name: 'SessionDetail', component: () => import('@/pages/SessionDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/results', name: 'Results', component: () => import('@/pages/ResultsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/results/:id', name: 'ResultDetail', component: () => import('@/pages/ResultDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/employees', name: 'Employees', component: () => import('@/pages/EmployeesPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/employees/:id', name: 'EmployeeDetail', component: () => import('@/pages/EmployeeDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/protocols', name: 'Protocols', component: () => import('@/pages/ProtocolsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/protocols/:id', name: 'ProtocolDetail', component: () => import('@/pages/ProtocolDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },

  // FaceID + Queue + Analysis
  { path: '/faceid', name: 'FaceIDCheckIn', component: () => import('@/pages/FaceIDCheckInPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/queue', name: 'QueueMonitor', component: () => import('@/pages/QueueMonitorPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/queue/results', name: 'QueueResults', component: () => import('@/pages/QueueResultsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },

  // Training + TB Safety
  { path: '/training', name: 'Training', component: () => import('@/pages/TrainingPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/tb-test', name: 'TBTest', component: () => import('@/pages/TBTestPage.vue'), meta: { roles: ['INSTRUCTOR'] } },

  // TechSpec — modules
  { path: '/cameras', name: 'Cameras', component: () => import('@/pages/CamerasPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/lanes', name: 'Lanes', component: () => import('@/pages/LanesPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/arsenal', name: 'Arsenal', component: () => import('@/pages/ArsenalPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/system', name: 'System', component: () => import('@/pages/SystemPage.vue'), meta: { roles: ['TECHSPEC'] } },

  // Redirects
  { path: '/', redirect: () => {
    const { role } = useAuth()
    if (role.value === 'INSTRUCTOR' || role.value === 'SUPER_ADMIN') return '/sessions'
    if (role.value === 'TECHSPEC') return '/cameras'
    return '/login'
  }},
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, role } = useAuth()
  if (to.meta.public) return next()
  if (!isAuthenticated.value) return next('/login')
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && role.value && role.value !== 'SUPER_ADMIN' && !allowedRoles.includes(role.value)) {
    return next(role.value === 'INSTRUCTOR' ? '/sessions' : '/cameras')
  }
  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },

  // Instructor — 4 modules
  { path: '/sessions', name: 'Sessions', component: () => import('@/pages/SessionsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/sessions/:id', name: 'SessionDetail', component: () => import('@/pages/SessionDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/results', name: 'Results', component: () => import('@/pages/ResultsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/results/:id', name: 'ResultDetail', component: () => import('@/pages/ResultDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/employees', name: 'Employees', component: () => import('@/pages/EmployeesPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/employees/:id', name: 'EmployeeDetail', component: () => import('@/pages/EmployeeDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/protocols', name: 'Protocols', component: () => import('@/pages/ProtocolsPage.vue'), meta: { roles: ['INSTRUCTOR'] } },
  { path: '/protocols/:id', name: 'ProtocolDetail', component: () => import('@/pages/ProtocolDetailPage.vue'), meta: { roles: ['INSTRUCTOR'] } },

  // TechSpec — 4 modules
  { path: '/cameras', name: 'Cameras', component: () => import('@/pages/CamerasPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/lanes', name: 'Lanes', component: () => import('@/pages/LanesPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/arsenal', name: 'Arsenal', component: () => import('@/pages/ArsenalPage.vue'), meta: { roles: ['TECHSPEC'] } },
  { path: '/system', name: 'System', component: () => import('@/pages/SystemPage.vue'), meta: { roles: ['TECHSPEC'] } },

  // Redirects
  { path: '/', redirect: () => {
    const role = authState.user?.role
    if (role === 'INSTRUCTOR') return '/sessions'
    if (role === 'TECHSPEC') return '/cameras'
    return '/login'
  }},
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.meta.public) return next()
  if (!authState.user) return next('/login')
  const allowedRoles = to.meta.roles as string[]
  if (allowedRoles && !allowedRoles.includes(authState.user.role)) {
    return next(authState.user.role === 'INSTRUCTOR' ? '/sessions' : '/cameras')
  }
  next()
})

export default router

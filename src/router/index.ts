import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import CandidatureForm from '../components/CandidatureForm.vue'
import LoginView from '../views/LoginView.vue'
import PortalView from '../views/PortalView.vue'
import PortalDashboard from '../views/PortalDashboard.vue'
import PortalSoumettre from '../views/PortalSoumettre.vue'
import { isAuthenticated } from '../services/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'accueil', component: CandidatureForm },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue') },
  {
    path: '/portal',
    component: PortalView,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/portal/dashboard' },
      { path: 'dashboard', name: 'portal-dashboard', component: PortalDashboard },
      { path: 'profil', name: 'portal-profil', component: () => import('../views/PortalProfil.vue') },
      { path: 'parametres', name: 'portal-parametres', component: () => import('../views/PortalParametres.vue') },
      { path: 'soumettre', name: 'portal-soumettre', component: PortalSoumettre },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  // If user is already authenticated and navigates to home or login, redirect to portal
  if ((to.name === 'accueil' || to.path === '/' || to.name === 'login' || to.path === '/login') && isAuthenticated()) {
    next({ path: '/portal' })
    return
  }

  if (to.matched.some(r => r.meta?.requiresAuth) && !isAuthenticated()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

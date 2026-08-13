import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/LandingPage.vue'),
      meta: { title: 'StudyNest — Organize Your Learning & Track Progress' },
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/LoginPage.vue'),
          meta: { guestOnly: true, title: 'Login — StudyNest' },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/RegisterPage.vue'),
          meta: { guestOnly: true, title: 'Create Account — StudyNest' },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/pages/ForgotPasswordPage.vue'),
          meta: { guestOnly: true, title: 'Forgot Password — StudyNest' },
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/pages/ResetPasswordPage.vue'),
          meta: { title: 'Reset Password — StudyNest' },
        },
      ],
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
          meta: { title: 'Dashboard — StudyNest' },
        },
        {
          path: 'courses',
          name: 'courses',
          component: () => import('@/pages/CoursesPage.vue'),
          meta: { title: 'Courses — StudyNest' },
        },
        {
          path: 'courses/:id',
          name: 'course-detail',
          component: () => import('@/pages/CourseDetailPage.vue'),
          meta: { title: 'Course — StudyNest' },
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/pages/TasksPage.vue'),
          meta: { title: 'Tasks — StudyNest' },
        },
        {
          path: 'notes',
          name: 'notes',
          component: () => import('@/pages/NotesPage.vue'),
          meta: { title: 'Notes — StudyNest' },
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('@/pages/StudySessionsPage.vue'),
          meta: { title: 'Study Sessions — StudyNest' },
        },
        {
          path: 'goals',
          name: 'goals',
          component: () => import('@/pages/GoalsPage.vue'),
          meta: { title: 'Goals — StudyNest' },
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/pages/CalendarPage.vue'),
          meta: { title: 'Calendar — StudyNest' },
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/pages/AnalyticsPage.vue'),
          meta: { title: 'Analytics — StudyNest' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/SettingsPage.vue'),
          meta: { title: 'Settings — StudyNest' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'StudyNest'
})

export default router

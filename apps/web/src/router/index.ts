import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import HomePage from '@/views/HomePage.vue';
import { useAuthStore } from '@/stores/auth';
import AuthCallback from '@/components/Landing/AuthCallback.vue';
import AuthError from '@/components/Landing/AuthError.vue';
import NotFound from '@/components/Ui/404.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/auth/callback',
    name: 'SuccessCallback',
    component: () => import('@/components/Landing/SuccessCallback.vue'),
  },
  {
    path: '/auth/error',
    name: 'FailureCallback',
    component: () => import('@/components/Landing/AuthError.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallback,
  },
  {
    path: '/auth/error',
    name: 'auth-error',
    component: AuthError,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  const publicRoutes = ['Landing', 'auth-callback', 'auth-error'];
  if (publicRoutes.includes(to.name as string)) {
    return next();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    auth.returnTo = to.fullPath;
    return next({ name: 'Landing' });
  }

  return next();
});

export default router;

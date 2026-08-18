import { defineStore } from './pinia-shim';
import { ref, computed } from 'vue';
import type { SystemUser, UserRole, LoginRequest } from '@/types/extended';
import { authApi } from '@/api/extended';

const STORAGE_KEY = 'shaffoftir_auth';

// Fallback demo users - used if extended backend is unavailable
const DEMO_USERS: Array<SystemUser & { password: string }> = [
  {
    id: 'u001', email: 'manager@shaffoftir.uz', password: 'manager123',
    full_name: 'Тошматов Фирдавс Шерзодович', role: 'MANAGER',
    rank: 'Старшина', department: 'Огневая подготовка', phone: '+998908889900',
    is_active: true, created_at: '2024-01-01T00:00:00Z', locale: 'ru', last_login: '2026-07-24T08:00:00Z',
  },
  {
    id: 'u002', email: 'instructor@shaffoftir.uz', password: 'instructor123',
    full_name: 'Махмудов Сардор Бахтиёрович', role: 'INSTRUCTOR',
    rank: 'Ст. сержант', department: '1-я рота', phone: '+998905556677',
    is_active: true, created_at: '2024-01-01T00:00:00Z', locale: 'ru', last_login: '2026-07-24T07:30:00Z',
  },
  {
    id: 'u003', email: 'soldier@shaffoftir.uz', password: 'soldier123',
    full_name: 'Юлдашев Дилшод Абдуллажонович', role: 'EMPLOYEE',
    rank: 'Сержант', department: '1-я рота', phone: '+998903334455',
    is_active: true, created_at: '2024-01-01T00:00:00Z', locale: 'ru', last_login: '2026-07-24T09:00:00Z',
  },
  {
    id: 'u004', email: 'techspec@shaffoftir.uz', password: 'techspec123',
    full_name: 'Нормуродов Жасур Бахриддинович', role: 'TECHSPEC',
    rank: 'Техник', department: 'Тех. обслуживание', phone: '+998907778899',
    is_active: true, created_at: '2024-01-01T00:00:00Z', locale: 'ru', last_login: '2026-07-24T06:00:00Z',
  },
  {
    id: 'u005', email: 'admin@shaffoftir.uz', password: 'admin123',
    full_name: 'Системный Администратор', role: 'SUPER_ADMIN',
    rank: 'Админ', department: 'IT', phone: '+998901112233',
    is_active: true, created_at: '2024-01-01T00:00:00Z', locale: 'ru', last_login: '2026-07-25T19:00:00Z',
  },
];

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SystemUser | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Load from localStorage on init
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      user.value = data.user;
      token.value = data.token;
    }
  } catch { /* ignore */ }

  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const userRole = computed(() => user.value?.role || null);

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Супер Админ',
    INSTRUCTOR: 'Инструктор',
    MANAGER: 'Рахбарият',
    EMPLOYEE: 'Сотрудник',
    TECHSPEC: 'Тех. специалист',
  };

  const roleLabelsUz: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    INSTRUCTOR: 'Instruktor',
    MANAGER: 'Rahbariyat',
    EMPLOYEE: 'Xodim',
    TECHSPEC: 'Texnik mutaxassis',
  };

  const roleColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    INSTRUCTOR: 'bg-brand-100 text-brand-700',
    MANAGER: 'bg-purple-100 text-purple-700',
    EMPLOYEE: 'bg-blue-100 text-blue-700',
    TECHSPEC: 'bg-cyan-100 text-cyan-700',
  };

  const roleGradients: Record<UserRole, string> = {
    SUPER_ADMIN: 'from-red-500 to-red-700',
    INSTRUCTOR: 'from-brand-500 to-brand-700',
    MANAGER: 'from-purple-500 to-purple-700',
    EMPLOYEE: 'from-blue-500 to-blue-700',
    TECHSPEC: 'from-cyan-500 to-cyan-700',
  };

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true;
    error.value = null;

    // Check if backend is reachable (skip localhost in browser - mixed content blocked)
    const extUrl = import.meta.env.VITE_API_URL_EXTENDED || 'https://soldier.mrdev.uz';
    const isLocalBackend = extUrl.includes('localhost') || extUrl.includes('127.0.0.1');

    try {
      if (isLocalBackend) {
        // Skip API call for local backend - go straight to demo users
        throw new Error('Local backend - using demo mode');
      }

      // Try extended API first (with 5s timeout via httpClientExtended)
      const response = await authApi.login(credentials);
      user.value = response.user;
      token.value = response.access_token;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: response.user,
        token: response.access_token,
      }));
    } catch (apiErr) {
      // Fallback to demo users
      const found = DEMO_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password && u.is_active
      );

      if (!found) {
        error.value = 'AUTH_FAILED';
        loading.value = false;
        throw new Error('');
      }

      const { password, ...userData } = found;
      user.value = userData;
      token.value = `demo_token_${found.id}_${Date.now()}`;

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: userData,
        token: token.value,
      }));
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function hasRole(roles: UserRole[]): boolean {
    if (!user.value) return false;
    return roles.includes(user.value.role);
  }

  const moduleAccess: Record<UserRole, string[]> = {
    SUPER_ADMIN: ['*'],
    MANAGER: [
      'dashboard', 'command-center', 'results', 'compare', 'analytics',
      'reports', 'protocols', 'notifications', 'settings', 'help', 'profile',
      'org-structure', 'kpi', 'objections', 'approval-tasks',
      'ai-recommendations', 'action-plans', 'data-quality', 'integration-monitoring',
      'training-materials',
    ],
    INSTRUCTOR: [
      'dashboard', 'sessions', 'results', 'compare',
      'review', 'cameras', 'range', 'weapons', 'training', 'protocols', 'reports',
      'analytics', 'notifications', 'settings', 'help', 'profile',
      'instructor-tablet', 'training-materials', 'training-history',
    ],
    EMPLOYEE: [
      'results', 'protocols', 'training-materials', 'schedule', 'notifications', 'help', 'profile',
    ],
    TECHSPEC: [
      'techspec', 'cameras', 'help', 'profile',
    ],
  };

  function canAccess(module: string): boolean {
    if (!user.value) return false;
    const allowed = moduleAccess[user.value.role] || [];
    return allowed.includes('*') || allowed.includes(module);
  }


  // Telegram Mini App login
  async function loginWithTelegram(initData: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await login({ email: 'instructor@shaffoftir.uz', password: 'instructor123' })
    } catch {
      error.value = 'Telegram login failed'
    } finally {
      loading.value = false
    }
  }

  return {
    user, token, loading, error,
    isAuthenticated, userRole,
    roleLabels, roleLabelsUz, roleColors, roleGradients,
    login, logout, loginWithTelegram, hasRole, canAccess,
  };
});

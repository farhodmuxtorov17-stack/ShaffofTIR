import { defineStore } from './pinia-shim';
import { ref } from 'vue';
import type { ToastMessage } from '@/types';
import { healthApi } from '@/api/health.api';

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const backendHealthy = ref<boolean>(true);
  const aiHealthy = ref<boolean>(true);
  const sidebarCollapsed = ref<boolean>(false);
  const toasts = ref<ToastMessage[]>([]);
  const theme = ref<'light' | 'dark'>('light');

  // --- Actions ---
  async function checkHealth() {
    try {
      const res = await healthApi.check();
      backendHealthy.value = res.status === 'ok' || res.status === 'healthy';
      return res;
    } catch (err) {
      backendHealthy.value = false;
      throw err;
    }
  }

  async function checkAiHealth() {
    try {
      const res = await healthApi.checkAi();
      aiHealthy.value = res.status === 'ok' || res.status === 'healthy';
      return res;
    } catch (err) {
      aiHealthy.value = false;
      throw err;
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    duration = 4000
  ) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  return {
    backendHealthy,
    aiHealthy,
    sidebarCollapsed,
    toasts,
    theme,
    checkHealth,
    checkAiHealth,
    toggleSidebar,
    showToast,
    removeToast,
    setTheme,
  };
});

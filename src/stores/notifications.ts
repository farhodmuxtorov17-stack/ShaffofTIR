import { defineStore } from './pinia-shim';
import { ref, computed } from 'vue';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  // --- State ---
  const notifications = ref<AppNotification[]>([]);

  // --- Getters ---
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length;
  });

  // --- Actions ---
  function addNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const id = Math.random().toString(36).substring(2, 9);
    notifications.value.unshift({
      id,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    });
  }

  function markAsRead(id: string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item) {
      item.read = true;
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => {
      n.read = true;
    });
  }

  function clearAll() {
    notifications.value = [];
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
});

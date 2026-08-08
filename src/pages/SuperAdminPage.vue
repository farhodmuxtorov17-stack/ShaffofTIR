<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Super-admin" : "Супер-админ" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tizim administratori paneli" : "Панель администратора системы" }}</p>
    </div>

    <!-- System Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Foydalanuvchilar" : "Пользователи" }}</div>
        <div class="text-2xl font-bold text-gray-900">{{ totalUsers }}</div>
        <div class="text-xs text-green-600 mt-1">{{ activeUsers }} {{ isUz ? "faol" : "активных" }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Sessiyalar" : "Сессии" }}</div>
        <div class="text-2xl font-bold text-gray-900">{{ totalSessions }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ isUz ? "Jami" : "Всего" }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "Server holati" : "Статус сервера" }}</div>
        <div class="text-2xl font-bold text-green-600">{{ isUz ? "OK" : "OK" }}</div>
        <div class="text-xs text-gray-400 mt-1">99.8% uptime</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-gray-500 mb-1">{{ isUz ? "DB hajmi" : "Размер БД" }}</div>
        <div class="text-2xl font-bold text-gray-900">2.4 GB</div>
        <div class="text-xs text-gray-400 mt-1">{{ isUz ? "So\u02BBnggi 30 kun" : "За 30 дней" }}</div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">{{ isUz ? "Foydalanuvchilar ro\u02BByxati" : "Список пользователей" }}</h2>
        <button @click="showAddUser = !showAddUser" class="text-xs text-green-600 hover:text-green-700 font-medium">+ {{ isUz ? "Qo\u02BBshish" : "Добавить" }}</button>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="text-left px-4 py-2">{{ isUz ? "F.I.O" : "Ф.И.О" }}</th>
            <th class="text-left px-4 py-2">Email</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Rol" : "Роль" }}</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Holat" : "Статус" }}</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Oxirgi kirish" : "Последний вход" }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{{ user.full_name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="roleColor(user.role)">{{ roleLabel(user.role) }}</span>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs" :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ user.is_active ? (isUz ? 'Faol' : 'Активен') : (isUz ? 'Bloklangan' : 'Заблокирован') }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(user.last_login) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- System Config -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="card p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ isUz ? "Tizim sozlamalari" : "Настройки системы" }}</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ isUz ? "Skoring tizimi" : "Система скоринга" }}</span>
            <span class="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">{{ isUz ? "Ball + Hit/Miss" : "Баллы + Hit/Miss" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ isUz ? "TB tekshiruvi" : "Проверка ТБ" }}</span>
            <span class="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded">{{ isUz ? "100% majburiy" : "100% обязательно" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ isUz ? "Tarixiy o\u02BBzgartirish" : "Изменение истории" }}</span>
            <span class="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded">{{ isUz ? "Taqiqlangan" : "Запрещено" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ isUz ? "Til" : "Язык" }}</span>
            <span class="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-700 rounded">RU / UZ</span>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ isUz ? "Audit jurnali" : "Журнал аудита" }}</h2>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="log in auditLogs" :key="log.id" class="flex items-start gap-2 text-xs">
            <span class="text-gray-400 font-mono">{{ log.time }}</span>
            <span class="text-gray-600 flex-1">{{ log.action }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isUz = computed(() => auth.user?.locale === 'uz')
const loading = ref(true)
const showAddUser = ref(false)

const users = ref([
  { id: 'u1', full_name: 'Тошматов Фирдавс Шерзодович', email: 'manager@shaffoftir.uz', role: 'MANAGER', is_active: true, last_login: '2026-07-30T08:00:00Z' },
  { id: 'u2', full_name: 'Махмудов Сардор Бахтиёрович', email: 'instructor@shaffoftir.uz', role: 'INSTRUCTOR', is_active: true, last_login: '2026-07-30T07:30:00Z' },
  { id: 'u3', full_name: 'Юлдашев Дилшод Абдуллажонович', email: 'employee@shaffoftir.uz', role: 'EMPLOYEE', is_active: true, last_login: '2026-07-30T09:00:00Z' },
  { id: 'u4', full_name: 'Нормуродов Жасур Бахриддинович', email: 'techspec@shaffoftir.uz', role: 'TECHSPEC', is_active: true, last_login: '2026-07-30T06:00:00Z' },
  { id: 'u5', full_name: 'Системный Администратор', email: 'admin@shaffoftir.uz', role: 'SUPER_ADMIN', is_active: true, last_login: '2026-07-29T19:00:00Z' },
])

const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter(u => u.is_active).length)
const totalSessions = ref(55)

const auditLogs = ref([
  { id: 1, time: '11:45', action: 'SUPER_ADMIN: System config updated' },
  { id: 2, time: '11:30', action: 'INSTRUCTOR: Session #S-2026-055 created' },
  { id: 3, time: '11:15', action: 'MANAGER: Report exported (PDF)' },
  { id: 4, time: '10:50', action: 'TECHSPEC: Camera-05 status changed to OFFLINE' },
  { id: 5, time: '10:30', action: 'INSTRUCTOR: Protocol P-2026-012 signed' },
  { id: 6, time: '09:15', action: 'SUPER_ADMIN: User account activated (u3)' },
])

function roleLabel(role: string) {
  const labels: Record<string, string> = { MANAGER: isUz.value ? 'Rahbar' : 'Рахбар', INSTRUCTOR: isUz.value ? 'Instruktor' : 'Инструктор', EMPLOYEE: isUz.value ? 'Xodim' : 'Сотрудник', TECHSPEC: isUz.value ? 'Texnik' : 'Техник', SUPER_ADMIN: 'Admin' }
  return labels[role] || role
}

function roleColor(role: string) {
  const colors: Record<string, string> = { MANAGER: 'bg-green-100 text-green-700', INSTRUCTOR: 'bg-blue-100 text-blue-700', EMPLOYEE: 'bg-purple-100 text-purple-700', TECHSPEC: 'bg-orange-100 text-orange-700', SUPER_ADMIN: 'bg-red-100 text-red-700' }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

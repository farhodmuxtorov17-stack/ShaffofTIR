<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Foydalanuvchilar va rollar" : "Пользователи и роли" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tizim foydalanuvchilarini boshqarish" : "Управление пользователями системы" }}</p>
    </div>

    <!-- Role Permissions Matrix -->
    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-semibold text-gray-700">{{ isUz ? "Rol ruxsatlari" : "Матрица прав ролей" }}</h2>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="text-left px-4 py-2">{{ isUz ? "Funksiya" : "Функция" }}</th>
            <th class="text-center px-4 py-2">Admin</th>
            <th class="text-center px-4 py-2">{{ isUz ? "Rahbar" : "Рахбар" }}</th>
            <th class="text-center px-4 py-2">{{ isUz ? "Instruktor" : "Инструктор" }}</th>
            <th class="text-center px-4 py-2">{{ isUz ? "Xodim" : "Сотрудник" }}</th>
            <th class="text-center px-4 py-2">{{ isUz ? "Texnik" : "Техник" }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="perm in permissions" :key="perm.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-gray-700">{{ isUz ? perm.name_uz : perm.name_ru }}</td>
            <td v-for="role in ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE', 'TECHSPEC']" :key="role" class="text-center px-4 py-2">
              <svg v-if="perm.roles.includes(role)" class="w-4 h-4 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <svg v-else class="w-4 h-4 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Users List -->
    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-semibold text-gray-700">{{ isUz ? "Foydalanuvchilar" : "Пользователи" }}</h2>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="user in users" :key="user.id" class="flex items-center px-4 py-3 hover:bg-gray-50">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" :class="roleBg(user.role)">{{ user.full_name[0] }}</div>
          <div class="ml-3 flex-1">
            <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
            <div class="text-xs text-gray-500">{{ user.email }}</div>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium" :class="roleBg(user.role)">{{ roleLabel(user.role) }}</span>
          <span class="ml-3 px-2 py-1 rounded-full text-xs" :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ user.is_active ? (isUz ? 'Faol' : 'Активен') : (isUz ? 'Blokl.' : 'Блок.') }}</span>
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

const users = ref([
  { id: 'u1', full_name: 'Тошматов Фирдавс Шерзодович', email: 'manager@shaffoftir.uz', role: 'MANAGER', is_active: true },
  { id: 'u2', full_name: 'Махмудов Сардор Бахтиёрович', email: 'instructor@shaffoftir.uz', role: 'INSTRUCTOR', is_active: true },
  { id: 'u3', full_name: 'Юлдашев Дилшод Абдуллажонович', email: 'employee@shaffoftir.uz', role: 'EMPLOYEE', is_active: true },
  { id: 'u4', full_name: 'Нормуродов Жасур Бахриддинович', email: 'techspec@shaffoftir.uz', role: 'TECHSPEC', is_active: true },
  { id: 'u5', full_name: 'Системный Администратор', email: 'admin@shaffoftir.uz', role: 'SUPER_ADMIN', is_active: true },
])

const permissions = ref([
  { id: 'p1', name_ru: 'Создание сессий', name_uz: 'Sessiya yaratish', roles: ['SUPER_ADMIN', 'INSTRUCTOR'] },
  { id: 'p2', name_ru: 'Просмотр результатов', name_uz: 'Natijalarni ko\u02BBrish', roles: ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE'] },
  { id: 'p3', name_ru: 'Изменение результатов', name_uz: 'Natijani o\u02BBzgartirish', roles: ['SUPER_ADMIN'] },
  { id: 'p4', name_ru: 'Управление оружием', name_uz: 'Qurol boshqaruvi', roles: ['SUPER_ADMIN', 'INSTRUCTOR'] },
  { id: 'p5', name_ru: 'Управление камерами', name_uz: 'Kamera boshqaruvi', roles: ['SUPER_ADMIN', 'TECHSPEC'] },
  { id: 'p6', name_ru: 'Аналитика и отчёты', name_uz: 'Analitika va hisobotlar', roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'p7', name_ru: 'Управление пользователями', name_uz: 'Foydalanuvchi boshqaruvi', roles: ['SUPER_ADMIN'] },
  { id: 'p8', name_ru: 'Согласование/возражения', name_uz: 'Kelishish/e\u02BBtiroz', roles: ['SUPER_ADMIN', 'MANAGER'] },
])

function roleLabel(role: string) {
  const labels: Record<string, string> = { MANAGER: isUz.value ? 'Rahbar' : 'Рахбар', INSTRUCTOR: isUz.value ? 'Instruktor' : 'Инструктор', EMPLOYEE: isUz.value ? 'Xodim' : 'Сотрудник', TECHSPEC: isUz.value ? 'Texnik' : 'Техник', SUPER_ADMIN: 'Admin' }
  return labels[role] || role
}

function roleBg(role: string) {
  const colors: Record<string, string> = { MANAGER: 'bg-green-100 text-green-700', INSTRUCTOR: 'bg-blue-100 text-blue-700', EMPLOYEE: 'bg-purple-100 text-purple-700', TECHSPEC: 'bg-orange-100 text-orange-700', SUPER_ADMIN: 'bg-red-100 text-red-700' }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

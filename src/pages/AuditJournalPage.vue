<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Audit jurnali" : "Журнал аудита" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tizimdagi barcha o\u02BBzgarishlar tarixi" : "История всех изменений в системе" }}</p>
    </div>

    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <input v-model="search" type="text" :placeholder="isUz ? 'Qidirish...' : 'Поиск...'" class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
        <select v-model="filterType" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none">
          <option value="">{{ isUz ? "Barchasi" : "Все" }}</option>
          <option value="CREATE">{{ isUz ? "Yaratish" : "Создание" }}</option>
          <option value="UPDATE">{{ isUz ? "Yangilash" : "Изменение" }}</option>
          <option value="DELETE">{{ isUz ? "O\u02BBchirish" : "Удаление" }}</option>
        </select>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="text-left px-4 py-2">{{ isUz ? "Vaqt" : "Время" }}</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Foydalanuvchi" : "Пользователь" }}</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Amal" : "Действие" }}</th>
            <th class="text-left px-4 py-2">{{ isUz ? "Ob\u02BByekt" : "Объект" }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 text-xs text-gray-500 font-mono">{{ log.time }}</td>
            <td class="px-4 py-2 text-gray-700">{{ log.user }}</td>
            <td class="px-4 py-2">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="actionColor(log.action_type)">{{ log.action_type }}</span>
            </td>
            <td class="px-4 py-2 text-gray-600">{{ log.object }}</td>
          </tr>
        </tbody>
      </table>
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
const search = ref('')
const filterType = ref('')

const logs = ref([
  { id: 1, time: '30.07 11:45:22', user: 'admin@shaffoftir.uz', action_type: 'UPDATE', object: 'System config: scoring=bifurcated' },
  { id: 2, time: '30.07 11:30:10', user: 'instructor@shaffoftir.uz', action_type: 'CREATE', object: 'Session S-2026-055' },
  { id: 3, time: '30.07 11:15:33', user: 'manager@shaffoftir.uz', action_type: 'CREATE', object: 'Report R-2026-012 (PDF export)' },
  { id: 4, time: '30.07 10:50:05', user: 'techspec@shaffoftir.uz', action_type: 'UPDATE', object: 'Camera-05 status -> OFFLINE' },
  { id: 5, time: '30.07 10:30:18', user: 'instructor@shaffoftir.uz', action_type: 'CREATE', object: 'Protocol P-2026-012 (signed)' },
  { id: 6, time: '30.07 09:15:42', user: 'admin@shaffoftir.uz', action_type: 'UPDATE', object: 'User u3: activated' },
  { id: 7, time: '29.07 18:45:00', user: 'admin@shaffoftir.uz', action_type: 'DELETE', object: 'Old session S-2025-099 (archived)' },
  { id: 8, time: '29.07 16:20:15', user: 'manager@shaffoftir.uz', action_type: 'UPDATE', object: 'Objection OB-008: resolved' },
])

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (filterType.value && l.action_type !== filterType.value) return false
    if (search.value) {
      const s = search.value.toLowerCase()
      return l.user.toLowerCase().includes(s) || l.object.toLowerCase().includes(s) || l.action_type.toLowerCase().includes(s)
    }
    return true
  })
})

function actionColor(action: string) {
  const colors: Record<string, string> = { CREATE: 'bg-green-100 text-green-700', UPDATE: 'bg-blue-100 text-blue-700', DELETE: 'bg-red-100 text-red-700' }
  return colors[action] || 'bg-gray-100 text-gray-700'
}

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Integratsiya monitoringi" : "Мониторинг интеграций" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tashqi tizimlar holati" : "Статус внешних систем" }}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="integ in integrations" :key="integ.id" class="card p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">{{ integ.name }}</h3>
          <span class="w-2.5 h-2.5 rounded-full" :class="integ.status === 'OK' ? 'bg-green-500' : 'bg-red-500'"></span>
        </div>
        <div class="text-xs text-gray-500">{{ integ.endpoint }}</div>
        <div class="text-xs mt-1" :class="integ.status === 'OK' ? 'text-green-600' : 'text-red-600'">{{ isUz ? "So\x02BBnggi so\x02BBrov" : "Последний запрос" }}: {{ integ.lastCheck }}</div>
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
const integrations = ref([
  { id: 1, name: 'Dataprizma API', endpoint: 'api.dataprizma.uz/v2', status: 'OK', lastCheck: '30.07 11:45' },
  { id: 2, name: 'Camera System', endpoint: '192.168.1.60-66', status: 'OK', lastCheck: '30.07 11:45' },
  { id: 3, name: 'FaceID Service', endpoint: 'faceid.local:8080', status: 'ERROR', lastCheck: '30.07 10:20' },
  { id: 4, name: 'HR Database', endpoint: 'hr.internal.uz/api', status: 'OK', lastCheck: '30.07 11:40' },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

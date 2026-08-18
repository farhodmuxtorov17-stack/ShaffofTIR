<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import type { Protocol } from '@/types'
import { FileText, Search } from 'lucide-vue-next'

const router = useRouter()
const protocols = ref<Protocol[]>([])
const loading = ref(true)
const search = ref('')

async function load() {
  try { protocols.value = await api.getProtocols() } catch { protocols.value = [] }
  finally { loading.value = false }
}

const filtered = () => protocols.value.filter(p =>
  !search.value || p.employee_name?.toLowerCase().includes(search.value.toLowerCase())
)

function openProtocol(id: string) { router.push(`/protocols/${id}`) }

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'badge-gray', SIGNED: 'badge-blue', APPROVED: 'badge-green',
    REJECTED: 'badge-red', ARCHIVED: 'badge-gray',
  }
  return map[status] || 'badge-gray'
}
function statusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'Черновик', SIGNED: 'Подписан', APPROVED: 'Утверждён',
    REJECTED: 'Отклонён', ARCHIVED: 'Архив',
  }
  return map[status] || status
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold flex items-center gap-2"><FileText :size="22" class="text-emerald-400" /> Протоколы</h1>
      <p class="text-sm text-slate-500 mt-0.5">Стрелковые протоколы</p>
    </div>

    <div class="relative mb-4">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input v-model="search" class="input pl-10" placeholder="Поиск..." />
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">Загрузка...</div>
    <div v-else-if="filtered().length === 0" class="card text-center py-12 text-slate-500">Нет протоколов</div>
    <div v-else class="space-y-2.5">
      <div v-for="p in filtered()" :key="p.id" @click="openProtocol(p.id)" class="card-hover cursor-pointer flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center"><FileText :size="20" class="text-slate-400" /></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium text-slate-200 truncate">{{ p.employee_name }}</p>
            <span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ p.employee_rank || '' }} {{ p.employee_department ? '• ' + p.employee_department : '' }}
            • {{ p.weapon_name || '—' }} • {{ p.instructor_name || '—' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold" :class="p.passed ? 'text-emerald-400' : 'text-red-400'">{{ p.total_score }}</p>
          <p class="text-xs text-slate-500">{{ p.accuracy }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

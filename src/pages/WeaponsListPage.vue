<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Search, Crosshair } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import KPICard from '@/components/ui/KPICard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const search = ref('')
const filterCategory = ref<string>('ALL')
const filterStatus = ref<string>('ALL')

const categoryLabels = computed<Record<string, string>>(() => ({
  ALL: isUz.value ? 'Barchasi' : 'Все',
  PISTOL: isUz.value ? 'Pistolet' : 'Пистолет',
  RIFLE: isUz.value ? "Avtomat" : 'Автомат',
  SMG: isUz.value ? 'PP' : 'ПП',
  SNIPER: isUz.value ? 'Snayper' : 'Снайперская',
  SHOTGUN: isUz.value ? 'Drob' : 'Дробовик',
  MACHINE_GUN: isUz.value ? 'Pulemyot' : 'Пулемёт',
}))

const statusLabels = computed<Record<string, string>>(() => ({
  ALL: isUz.value ? 'Barchasi' : 'Все',
  AVAILABLE: isUz.value ? 'Mavjud' : 'Доступно',
  IN_USE: isUz.value ? "Ishlatilmoqda" : 'В использовании',
  MAINTENANCE: isUz.value ? 'Ta\u02bbmirlash' : 'На обслуживании',
  DECOMMISSIONED: isUz.value ? "O'chirilgan" : 'Списано',
}))

const categories = Object.keys(categoryLabels.value) as string[]
const statuses = Object.keys(statusLabels.value) as string[]

const filtered = computed(() => {
  let result = masterStore.weapons
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(w => w.name.toLowerCase().includes(q) || w.serial_number.toLowerCase().includes(q))
  }
  if (filterCategory.value !== 'ALL') result = result.filter(w => w.category === filterCategory.value)
  if (filterStatus.value !== 'ALL') result = result.filter(w => w.status === filterStatus.value)
  return result
})

const stats = computed(() => ({
  total: masterStore.weapons.length,
  available: masterStore.weapons.filter(w => w.status === 'AVAILABLE').length,
  inUse: masterStore.weapons.filter(w => w.status === 'IN_USE').length,
  maintenance: masterStore.weapons.filter(w => w.status === 'MAINTENANCE').length,
}))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Qurol arsenali' : 'Оружейный арсенал' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Qurollar va inventar boshqaruvi" : 'Управление оружием и инвентарём' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami' : 'Всего'" :value="stats.total" accent="neutral" />
      <KPICard :title="isUz ? 'Mavjud' : 'Доступно'" :value="stats.available" accent="brand" />
      <KPICard :title="isUz ? 'Ishlatilmoqda' : 'В использовании'" :value="stats.inUse" accent="neutral" />
      <KPICard :title="isUz ? 'Ta\u02bbmirda' : 'На обслуживании'" :value="stats.maintenance" accent="neutral" />
    </div>

    <div class="card flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" class="input pl-10 text-sm" :placeholder="isUz ? 'Nomi yoki seriya raqami bo\u02bb yicha qidirish...' : 'Поиск по названию или серийному номеру...'" />
      </div>
      <select v-model="filterCategory" class="input text-sm w-full sm:w-44">
        <option v-for="c in categories" :key="c" :value="c">{{ categoryLabels[c] }}</option>
      </select>
      <select v-model="filterStatus" class="input text-sm w-full sm:w-44">
        <option v-for="s in statuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
      </select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="wpn in filtered" :key="wpn.id"
        class="card cursor-pointer group hover:shadow-lg transition-all duration-300"
        @click="$router.push(`/weapons/${wpn.id}`)">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="wpn.status === 'AVAILABLE' ? 'bg-brand-50 text-brand-600' :
                wpn.status === 'IN_USE' ? 'bg-amber-50 text-amber-600' :
                wpn.status === 'MAINTENANCE' ? 'bg-red-50 text-red-500' :
                'bg-gray-100 text-gray-400'"
            >
              <Crosshair class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">{{ wpn.name }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ wpn.serial_number }}</p>
            </div>
          </div>
          <StatusBadge :status="wpn.status" />
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-gray-400">{{ isUz ? 'Kalibr:' : 'Калибр:' }}</span>
            <span class="text-gray-700 font-medium">{{ wpn.caliber }}</span>
          </div>
          <div>
            <span class="text-gray-400">{{ isUz ? "Masofa:" : 'Дальность:' }}</span>
            <span class="text-gray-700 font-medium">{{ wpn.max_range_m }}{{ isUz ? 'm' : 'м' }}</span>
          </div>
          <div>
            <span class="text-gray-400">{{ isUz ? 'Holat:' : 'Состояние:' }}</span>
            <span :class="wpn.condition === 'EXCELLENT' ? 'text-brand-600' : wpn.condition === 'GOOD' ? 'text-gray-700' : 'text-amber-600'">
              {{ wpn.condition }}
            </span>
          </div>
          <div>
            <span class="text-gray-400">{{ isUz ? "O'qlar:" : 'Выстрелов:' }}</span>
            <span class="text-gray-700">{{ wpn.total_shots_fired }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filtered.length === 0">
      <EmptyState :title="isUz ? 'Topilmadi' : 'Не найдено'" :message="isUz ? 'Filtrlarni o\u02bb zgartiring' : 'Измените фильтры'" :icon="Search" />
    </div>
  </div>
</template>

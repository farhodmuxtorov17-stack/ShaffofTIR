<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Crosshair, Calendar, User, TrendingUp, Wrench } from 'lucide-vue-next'
import { useMasterStore } from '@/stores/master'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import KPICard from '@/components/ui/KPICard.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const weaponId = computed(() => route.params.id as string)
const weapon = computed(() => masterStore.weapons.find(w => w.id === weaponId.value))

const assignedEmployee = computed(() => {
  if (!weapon.value?.assigned_to) return null
  return masterStore.employees.find(e => e.id === weapon.value!.assigned_to)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/weapons')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ weapon?.name }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ weapon?.serial_number }}</p>
        </div>
      </div>
      <StatusBadge :status="weapon?.status || 'AVAILABLE'" />
    </div>

    <ErrorState v-if="!weapon" :title="isUz ? 'Topilmadi' : 'Не найдено'" :message="isUz ? 'Qurol topilmadi' : 'Оружие не найдено'" />

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="isUz ? 'Kalibr' : 'Калибр'" :value="weapon.caliber" accent="neutral" />
        <KPICard :title="isUz ? 'Masofa' : 'Дальность'" :value="`${weapon.max_range_m}м`" accent="neutral" />
        <KPICard :title="isUz ? 'Oʻqlar' : 'Выстрелов'" :value="weapon.total_shots_fired" :icon="Crosshair" accent="brand" />
        <KPICard :title="isUz ? 'Holat' : 'Состояние'" :value="weapon.condition" accent="brand" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card space-y-4">
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Xususiyatlar" : "Характеристики" }}</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500">{{ isUz ? 'Ishlab chiqaruvchi' : 'Производитель' }}</span>
              <span class="text-gray-800">{{ weapon.manufacturer }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500">{{ isUz ? 'Patron turi' : 'Тип патрона' }}</span>
              <span class="text-gray-800">{{ weapon.ammo_type }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500">{{ isUz ? 'Kategoriya' : 'Категория' }}</span>
              <span class="text-gray-800">{{ weapon.category }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-1"><Wrench class="w-3.5 h-3.5" /> {{ isUz ? 'Oxirgi texnik xizmat' : 'Последнее ТО' }}</span>
              <span class="text-gray-800">{{ weapon.last_maintenance }}</span>
            </div>
          </div>
        </div>

        <div class="card space-y-4">
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? "Tayinlash" : "Назначение" }}</h2>
          <div v-if="assignedEmployee" class="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 border border-amber-100">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <User class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ assignedEmployee.full_name }}</p>
              <p class="text-xs text-gray-400">{{ assignedEmployee.rank }} · {{ assignedEmployee.department }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 py-4 text-center">
            {{ isUz ? 'Qurol boʻsh' : 'Оружие свободно' }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

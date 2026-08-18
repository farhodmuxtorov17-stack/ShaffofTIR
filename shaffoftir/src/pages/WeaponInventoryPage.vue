<script setup lang="ts">
import { useMasterStore } from '@/stores/master'
import { ref, computed } from 'vue'
import { Crosshair, Package, AlertTriangle } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const categories = computed(() => {
  const cats: Record<string, { total: number; available: number; inUse: number; totalShots: number }> = {}
  masterStore.weapons.forEach(w => {
    if (!cats[w.category]) cats[w.category] = { total: 0, available: 0, inUse: 0, totalShots: 0 }
    cats[w.category].total++
    if (w.status === 'AVAILABLE') cats[w.category].available++
    if (w.status === 'IN_USE') cats[w.category].inUse++
    cats[w.category].totalShots += w.total_shots_fired
  })
  return Object.entries(cats).map(([cat, data]) => ({ category: cat, ...data }))
})

const totalAmmo = computed(() => masterStore.weapons.reduce((sum, w) => sum + w.total_shots_fired, 0))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Qurollar' : 'Инвентарь' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Qurol va oʻq dorilarning umumiy hisobi' : 'Общий учёт оружия и боеприпасов' }}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Jami qurol' : 'Всего оружия'" :value="masterStore.weapons.length" accent="neutral" />
      <KPICard :title="isUz ? 'Mavjud' : 'Доступно'" :value="masterStore.availableWeapons.length" accent="brand" />
      <KPICard :title="isUz ? 'Kategoriyalar' : 'Категорий'" :value="categories.length" accent="neutral" />
      <KPICard :title="isUz ? 'Patronlar' : 'Патронов'" :value="totalAmmo" accent="brand" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="cat in categories" :key="cat.category" class="card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2"><Crosshair class="w-5 h-5 text-gray-400" /><span class="text-sm font-bold text-gray-800">{{ cat.category }}</span></div>
          <span class="text-xs text-gray-400">{{ cat.total }} {{ isUz ? 'dona' : 'ед.' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 rounded-lg bg-brand-50/50"><p class="text-lg font-bold text-brand-600">{{ cat.available }}</p><p class="text-[10px] text-gray-400">{{ isUz ? 'Mavjud' : 'Доступно' }}</p></div>
          <div class="p-2 rounded-lg bg-amber-50/50"><p class="text-lg font-bold text-amber-600">{{ cat.inUse }}</p><p class="text-[10px] text-gray-400">{{ isUz ? 'Foydalanishda' : 'В использовании' }}</p></div>
          <div class="p-2 rounded-lg bg-gray-50/50"><p class="text-lg font-bold text-gray-700">{{ cat.total - cat.available - cat.inUse }}</p><p class="text-[10px] text-gray-400">{{ isUz ? 'Taʻmir/Hisobdan chiqarilgan' : 'ТО/Списано' }}</p></div>
        </div>
        <div class="mt-2 text-xs text-gray-400">{{ isUz ? 'Oʻqlar:' : 'Выстрелов:' }} {{ cat.totalShots.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Ma\x02BBlumotlar bazasi" : "Справочники" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Tizim ma\x02BBlumotlari" : "Справочные данные системы" }}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="ref in references" :key="ref.id" class="card p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-gray-900">{{ ref.count }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ isUz ? ref.name_uz : ref.name_ru }}</div>
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
const references = ref([
  { id: 1, name_ru: 'Типы оружия', name_uz: 'Qurol turlari', count: 8 },
  { id: 2, name_ru: 'Дистанции', name_uz: 'Masafalar', count: 5 },
  { id: 3, name_ru: 'Типы мишеней', name_uz: 'Nishon turlari', count: 6 },
  { id: 4, name_ru: 'Упражнения', name_uz: 'Mashqlar', count: 12 },
  { id: 5, name_ru: 'Регионы', name_uz: 'Viloyatlar', count: 14 },
  { id: 6, name_ru: 'Районы', name_uz: 'Tumanlar', count: 180 },
  { id: 7, name_ru: 'Подразделения', name_uz: 'Bo\x02BBlinmalar', count: 45 },
  { id: 8, name_ru: 'Должности', name_uz: 'Lavozimlar', count: 15 },
])
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

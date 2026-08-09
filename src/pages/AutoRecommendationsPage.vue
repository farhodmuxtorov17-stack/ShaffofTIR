<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="fade-in p-6 space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Avtomatik tavsiyalar" : "автоматические рекомендации" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Sun\u02BBiy intellekt tahlili va takliflari" : "Анализ и рекомендации от искусственного интеллекта" }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="rec in recommendations" :key="rec.id" class="card p-4 border-l-4" :class="rec.priority === 'HIGH' ? 'border-l-red-500' : rec.priority === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-blue-500'">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ isUz ? rec.title_uz : rec.title_ru }}</h3>
            <span class="text-xs text-gray-400">{{ rec.employee }}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' : rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'">{{ rec.priority }}</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">{{ isUz ? rec.desc_uz : rec.desc_ru }}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ isUz ? rec.confidence + "% ishonch" : rec.confidence + "% уверенность" }}</span>
          <button class="text-xs font-medium text-green-600 hover:text-green-700">{{ isUz ? "Qo\u02BBllash →" : "Применить →" }}</button>
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

const recommendations = ref([
  { id: 1, title_ru: 'Низкая точность на 300м', title_uz: '300m da past aniqlik', employee: 'Каримов А.У.', priority: 'HIGH', confidence: 92, desc_ru: 'За последние 5 сессий точность на дистанции 300м снизилась на 18%. Рекомендуется дополнительная тренировка по силуэтным мишеням.', desc_uz: 'So\u02BBnggi 5 sessiyada 300m aniqlik 18% ga tushdi. Siluet nishonlarga qo\u02BBshimcha mashq tavsiya etiladi.' },
  { id: 2, title_ru: 'Перераспределение оружия', title_uz: 'Qurolni qayta taqsimlash', employee: 'Алиев Б.У.', priority: 'MEDIUM', confidence: 78, desc_ru: 'АКС-74У даёт 3 осечки за 50 выстрелов. Рекомендуется ТО или замена на АК-74.', desc_uz: 'AKS-74U 50 otishda 3 o\u02BBt olmadi. TO yoki AK-74 ga almashtirish tavsiya etiladi.' },
  { id: 3, title_ru: 'ТБ-тест не пройден', title_uz: 'TB testi o\u02BBtmagan', employee: 'Хасанов О.Р.', priority: 'HIGH', confidence: 100, desc_ru: 'Сотрудник не прошёл ТБ-тест. Доступ к полигону заблокирован. Требуется повторное прохождение.', desc_uz: 'Xodim TB testidan o\u02BBtmadi. Poligonga kirish bloklangan. Qayta topshirish kerak.' },
  { id: 4, title_ru: 'Хорошая динамика', title_uz: 'Yaxshi dinamika', employee: 'Юлдашев Д.А.', priority: 'LOW', confidence: 85, desc_ru: 'Точность выросла на 12% за месяц. Рекомендуется повышение квалификационного уровня.', desc_uz: 'Aniqlik bir oyda 12% ga o\x02BIsdi. Malaka darajasini oshirish tavsiya etiladi.' },
])

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>

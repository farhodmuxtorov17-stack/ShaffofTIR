<script setup lang="ts">
import { Film, Play, Calendar, Download } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const recordings = [
  { id: 'r001', lane: 1, date: '2026-08-10 10:30', duration: '15:30', size: '124 MB', shooter: 'Махмудов С.Б.', weapon: 'ПК (Пулемёт)', accuracy: 78 },
  { id: 'r002', lane: 3, date: '2026-08-10 14:00', duration: '22:15', size: '210 MB', shooter: 'Каримов А.У.', weapon: 'СВД (Драгунов)', accuracy: 88 },
  { id: 'r003', lane: 2, date: '2026-08-10 09:15', duration: '18:45', size: '156 MB', shooter: 'Юлдашев Д.А.', weapon: 'АК-12', accuracy: 85 },
  { id: 'r004', lane: 5, date: '2026-08-10 11:20', duration: '12:30', size: '98 MB', shooter: 'Алиев Б.У.', weapon: 'AK-74', accuracy: 72 },
  { id: 'r005', lane: 4, date: '2026-08-09 09:00', duration: '10:45', size: '85 MB', shooter: 'Рахимов Ж.Т.', weapon: 'Glock 17', accuracy: 65 },
  { id: 'r006', lane: 6, date: '2026-08-09 16:00', duration: '08:20', size: '72 MB', shooter: 'Норматов Ж.А.', weapon: 'АК-74М', accuracy: 58 },
  { id: 'r007', lane: 1, date: '2026-08-09 11:00', duration: '25:10', size: '240 MB', shooter: 'Тошматов Ф.Ш.', weapon: 'АК-74М', accuracy: 95 },
  { id: 'r008', lane: 2, date: '2026-08-08 14:30', duration: '19:55', size: '175 MB', shooter: 'Хасанов Ш.Р.', weapon: 'СВД (Драгунов)', accuracy: 82 },
  { id: 'r009', lane: 3, date: '2026-08-08 10:00', duration: '14:20', size: '112 MB', shooter: 'Кадыров У.Т.', weapon: 'АК-74', accuracy: 76 },
  { id: 'r010', lane: 5, date: '2026-08-08 15:45', duration: '30:10', size: '280 MB', shooter: 'Махмудов С.Б.', weapon: 'ПК (Пулемёт)', accuracy: 91 },
  { id: 'r011', lane: 4, date: '2026-08-07 09:30', duration: '11:15', size: '88 MB', shooter: 'Умаров Ш.Б.', weapon: 'Glock 17', accuracy: 52 },
  { id: 'r012', lane: 6, date: '2026-08-07 13:00', duration: '16:40', size: '134 MB', shooter: 'Собиров Б.И.', weapon: 'АК-74', accuracy: 68 },
  { id: 'r013', lane: 1, date: '2026-08-07 16:20', duration: '20:30', size: '190 MB', shooter: 'Исмоилов Р.Б.', weapon: 'АК-12', accuracy: 74 },
  { id: 'r014', lane: 2, date: '2026-08-06 10:15', duration: '13:50', size: '105 MB', shooter: 'Эргашев Х.М.', weapon: 'ПМ', accuracy: 45 },
  { id: 'r015', lane: 3, date: '2026-08-06 14:45', duration: '28:20', size: '265 MB', shooter: 'Турсунов О.С.', weapon: 'СВД (Драгунов)', accuracy: 89 },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Kamera yozuvlari" : "Записи камер" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Yoʻlaklardagi video arxiv" : "Архив видеозаписей с дорожек" }}</p>
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? "Yoʻlak" : "Дорожка" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Suvchi" : "Стрелок" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Qurol" : "Оружие" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Aniqlik" : "Точность" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Sana" : "Дата" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Davomiyligi" : "Длит." }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Hajmi" : "Размер" }}</th><th class="px-4 py-3"></th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="r in recordings" :key="r.id" class="hover:bg-gray-50/50 transition">
            <td class="px-4 py-3"><span class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">№{{ r.lane }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ r.shooter }}</td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ r.weapon }}</td>
            <td class="px-4 py-3"><span class="text-xs font-bold" :class="r.accuracy >= 80 ? 'text-emerald-600' : r.accuracy >= 60 ? 'text-amber-600' : 'text-red-500'">{{ r.accuracy }}%</span></td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ r.date }}</td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ r.duration }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ r.size }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center gap-2 justify-end">
                <button class="text-brand-600 hover:underline text-xs"><Play class="w-3.5 h-3.5 inline" /> {{ isUz ? "Ko'rish" : "Смотреть" }}</button>
                <button class="text-gray-400 hover:text-gray-600 text-xs"><Download class="w-3.5 h-3.5 inline" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

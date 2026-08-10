<script setup lang="ts">
import { Film, Play, Calendar, Download } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const recordings = [
  { id: 'r001', lane: 1, date: '2026-08-10 10:30', duration: '15:30', size: '124 MB' },
  { id: 'r002', lane: 3, date: '2026-08-10 14:00', duration: '22:15', size: '210 MB' },
  { id: 'r003', lane: 2, date: '2026-08-09 09:00', duration: '10:45', size: '85 MB' },
  { id: 'r004', lane: 5, date: '2026-08-09 16:00', duration: '08:20', size: '72 MB' },
  { id: 'r005', lane: 6, date: '2026-08-08 11:00', duration: '30:10', size: '280 MB' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? "Kamera yozuvlari" : "Записи камер" }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Yo'laklardagi video arxiv" : "Архив видеозаписей с дорожек" }}</p>
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? "Yo'lak" : "Дорожка" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Sana" : "Дата" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Davomiyligi" : "Длительность" }}</th><th class="px-4 py-3 font-medium">{{ isUz ? "Hajmi" : "Размер" }}</th><th class="px-4 py-3"></th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="r in recordings" :key="r.id" class="hover:bg-gray-50/50 transition">
            <td class="px-4 py-3"><span class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">№{{ r.lane }}</span></td>
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

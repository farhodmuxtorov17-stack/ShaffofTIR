<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'
import { Award, Calendar, Download, Filter } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useI18n } from '@/i18n'

const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const certifications = computed(() => masterStore.employees.filter(e => e.shooting_qualified).map(e => ({
  employee: e,
  certified: e.shooting_qualified,
  level: e.qualification_level,
  date: e.last_shooting_date,
})))
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div><h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Sertifikatsiya' : 'Сертификация' }}</h1><p class="text-sm text-gray-500 mt-1">{{ isUz ? 'Otishga ruxsatnoma' : 'Допуски к стрельбе' }}</p></div>
      <button class="btn-secondary text-xs"><Download class="w-3.5 h-3.5" /> {{ isUz ? 'Eksport' : 'Экспорт' }}</button>
    </div>
    <div class="card overflow-hidden p-0">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50/70 border-b border-shell-border text-gray-500"><tr><th class="px-4 py-3 font-medium">{{ isUz ? 'Xodim' : 'Сотрудник' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Unvon' : 'Звание' }}</th><th class="px-4 py-3 font-medium">{{ isUz ? 'Daraja' : 'Уровень' }}</th><th class="px-4 py-3 font-medium">Допуск</th><th class="px-4 py-3 font-medium">Дата</th><th class="px-4 py-3 font-medium">Точность</th></tr></thead>
        <tbody class="divide-y divide-shell-border">
          <tr v-for="c in certifications" :key="c.employee.id" class="hover:bg-gray-50/50 transition">
            <td class="px-4 py-3 text-xs font-semibold text-gray-800">{{ c.employee.full_name.split(' ').slice(0,2).join(' ') }}</td>
            <td class="px-4 py-3 text-xs text-gray-600">{{ c.employee.rank }}</td>
            <td class="px-4 py-3"><span class="badge" :class="c.level === 'EXPERT' ? 'badge-success' : c.level === 'ADVANCED' ? 'badge-warning' : 'badge-neutral'">{{ c.level }}</span></td>
            <td class="px-4 py-3"><span class="badge-success">Допущен</span></td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ c.date || '-' }}</td>
            <td class="px-4 py-3 text-xs font-semibold text-brand-600">{{ c.employee.avg_accuracy }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

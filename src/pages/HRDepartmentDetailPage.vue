<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { ArrowLeft, Building2, Users, Award } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const deptId = computed(() => route.params.id as string)
const dept = computed(() => masterStore.departments.find(d => d.id === deptId.value))
const employees = computed(() => masterStore.employees.filter(e => e.department === dept.value?.name))
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <button class="btn-ghost px-2.5 py-2" @click="router.push('/hr/departments')"><ArrowLeft class="w-4 h-4" /></button>
      <div><h1 class="text-xl font-bold text-gray-900">{{ dept?.name }}</h1><p class="text-sm text-gray-500">{{ dept?.description }}</p></div>
    </div>
    <ErrorState v-if="!dept" :title="isUz ? 'Topilmadi' : 'Не найдено'" :message="isUz ? 'Boʻlinma topilmadi' : 'Подразделение не найдено'" />
    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard :title="isUz ? 'Xodimlar' : 'Сотрудников'" :value="dept.employee_count" :icon="Users" accent="brand" />
        <KPICard :title="isUz ? 'Kod' : 'Код'" :value="dept.code" accent="neutral" />
        <KPICard :title="isUz ? 'Boshliʻq' : 'Начальник'" :value="dept.head" accent="neutral" />
      </div>
      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? 'Boʻlinma xodimlari' : 'Сотрудники подразделения' }}</h2>
        <div class="space-y-2">
          <div v-for="emp in employees" :key="emp.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer" @click="router.push(`/hr/employee/${emp.id}`)">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{{ emp.full_name.charAt(0) }}</div>
              <div><p class="text-sm font-semibold text-gray-800">{{ emp.full_name.split(' ').slice(0,2).join(' ') }}</p><p class="text-xs text-gray-400">{{ emp.rank }} · {{ emp.position }}</p></div>
            </div>
            <div class="text-right"><p class="text-xs font-bold text-brand-600">{{ emp.total_score }} {{ isUz ? 'ball' : 'баллов' }}</p><p class="text-xs text-gray-400">{{ emp.avg_accuracy }}% {{ isUz ? 'aniq.' : 'точн.' }}</p></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

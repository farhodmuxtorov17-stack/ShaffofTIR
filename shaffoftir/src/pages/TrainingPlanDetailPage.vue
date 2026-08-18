<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMasterStore } from '@/stores/master'
import { ArrowLeft, Award, Clock, Target, Crosshair, Check } from 'lucide-vue-next'
import KPICard from '@/components/ui/KPICard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const planId = computed(() => route.params.id as string)
const plan = computed(() => masterStore.trainingPlans.find(p => p.id === planId.value))
const assignments = computed(() => masterStore.trainingAssignments.filter(a => a.plan_id === planId.value))
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <button class="btn-ghost px-2.5 py-2" @click="router.push('/training')"><ArrowLeft class="w-4 h-4" /></button>
      <div><h1 class="text-xl font-bold text-gray-900">{{ plan?.name }}</h1><p class="text-sm text-gray-500">{{ plan?.difficulty }}</p></div>
    </div>
    <ErrorState v-if="!plan" :title="isUz ? 'Topilmadi' : 'Не найдено'" :message="isUz ? 'Reja topilmadi' : 'План не найден'" />
    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="isUz ? 'Davomiyligi' : 'Длительность'" :value="`${plan.duration_minutes} ${isUz ? 'min' : 'мин'}`" accent="neutral" />
        <KPICard :title="isUz ? 'Otilar' : 'Выстрелов'" :value="plan.required_shots" accent="brand" />
        <KPICard :title="isUz ? 'Masofa' : 'Дистанция'" :value="`${plan.target_distance_m}м`" accent="neutral" />
        <KPICard :title="isUz ? 'Otish bali' : 'Проходной балл'" :value="plan.passing_score" accent="brand" />
      </div>
      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-2">{{ isUz ? 'Tavsif' : 'Описание' }}</h2>
        <p class="text-sm text-gray-600">{{ plan.description }}</p>
        <div class="flex flex-wrap gap-2 mt-3">
          <span v-for="cat in plan.weapon_categories" :key="cat" class="badge-neutral">{{ cat }}</span>
        </div>
      </div>
      <div class="card">
        <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? 'Tayinlar' : 'Назначения' }}</h2>
        <div class="space-y-2">
          <div v-for="a in assignments" :key="a.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
            <div><p class="text-sm font-semibold text-gray-800">{{ a.employee_name }}</p><p class="text-xs text-gray-400">{{ isUz ? 'Instruktur' : 'Инструктор' }}: {{ a.instructor_name }}</p></div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">{{ isUz ? 'Muddat' : 'Срок' }}: {{ a.due_date }}</span>
              <StatusBadge :status="a.status" />
              <span v-if="a.score" class="text-xs font-bold text-brand-600">{{ a.score }} {{ isUz ? 'ball' : 'баллов' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

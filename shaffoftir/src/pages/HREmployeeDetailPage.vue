<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ScanFace, Award, TrendingUp, Target, Phone, Calendar, Shield, CheckCircle2, AlertCircle, Plus, Camera, Crosshair } from 'lucide-vue-next'
import { useMasterStore } from '@/stores/master'
import KPICard from '@/components/ui/KPICard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Target3DViewer from '@/components/target/Target3DViewer.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const employeeId = computed(() => route.params.id as string)
const employee = computed(() => masterStore.employees.find(e => e.id === employeeId.value))

// Mock recent shots for 3D target
const mockShots = [
  { x: 0.48, y: 0.52, score: 10 },
  { x: 0.55, y: 0.45, score: 9 },
  { x: 0.43, y: 0.55, score: 8 },
  { x: 0.50, y: 0.48, score: 10 },
  { x: 0.58, y: 0.42, score: 7 },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/hr/employees')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ employee?.full_name }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ employee?.rank }} · {{ employee?.position }} · {{ employee?.department }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <StatusBadge :status="employee?.status || 'ACTIVE'" />
        <span v-if="employee?.face_id_registered" class="badge-success">
          <ScanFace class="w-3 h-3 inline mr-1" /> FaceID
        </span>
      </div>
    </div>

    <ErrorState v-if="!employee" :title="isUz ? 'Topilmadi' : 'Не найден'" :message="isUz ? 'Xodim topilmadi' : 'Сотрудник не найден'" />

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="isUz ? 'Sessiyalar' : 'Сессий'" :value="employee.total_sessions" :icon="Crosshair" accent="neutral" />
        <KPICard :title="isUz ? 'Umumiy ball' : 'Общий балл'" :value="employee.total_score" :icon="Target" accent="brand" />
        <KPICard :title="isUz ? 'Aniqlik' : 'Точность'" :value="`${employee.avg_accuracy}%`" :icon="TrendingUp" accent="brand" />
        <KPICard :title="isUz ? 'Malaka' : 'Квалификация'" :value="employee.qualification_level || '-'" :icon="Award" accent="neutral" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Info -->
        <div class="card space-y-4">
          <h2 class="text-sm font-bold text-gray-700">{{ isUz ? 'Shaxsiy maʻlumot' : 'Личная информация' }}</h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2"><Shield class="w-3.5 h-3.5" /> Личный номер</span>
              <span class="font-mono text-gray-800">{{ employee.personal_number }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2"><Phone class="w-3.5 h-3.5" /> Телефон</span>
              <span class="text-gray-800">{{ employee.phone }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2"><Calendar class="w-3.5 h-3.5" /> Дата рождения</span>
              <span class="text-gray-800">{{ employee.birth_date }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2"><Calendar class="w-3.5 h-3.5" /> Дата приёма</span>
              <span class="text-gray-800">{{ employee.hire_date }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-gray-500 flex items-center gap-2"><CheckCircle2 class="w-3.5 h-3.5" /> Допуск к стрельбе</span>
              <span :class="employee.shooting_qualified ? 'text-brand-600 font-semibold' : 'text-red-500'">
                {{ employee.shooting_qualified ? (isUz ? 'Ruxsat berilgan' : 'Допущен') : (isUz ? 'Ruxsat yoʻq' : 'Не допущен') }}
              </span>
            </div>
          </div>

          <!-- FaceID status -->
          <div class="pt-4 border-t border-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="employee.face_id_registered ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'">
                  <ScanFace class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ isUz ? 'FaceID roʻyxatdan oʻtish' : 'FaceID регистрация' }}</p>
                  <p class="text-xs" :class="employee.face_id_registered ? 'text-brand-600' : 'text-red-500'">
                    {{ employee.face_id_registered ? (isUz ? 'Roʻyxatdan oʻtgan' : 'Зарегистрирован') : (isUz ? 'Roʻyxatdan oʻtmagan' : 'Не зарегистрирован') }}
                  </p>
                </div>
              </div>
              <button v-if="!employee.face_id_registered" class="btn-primary text-xs" @click="masterStore.registerFaceID(employee.id)">
                <ScanFace class="w-3.5 h-3.5" /> Регистрировать
              </button>
            </div>
          </div>
        </div>

        <!-- 3D Target with recent shots -->
        <div class="card">
          <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? 'Soʻnggi natijalar (3D)' : 'Последние результаты (3D)' }}</h2>
          <Target3DViewer :shots="mockShots" :size="320" :animate="true" />
        </div>
      </div>

      <!-- Actions -->
      <div class="card flex items-center gap-3">
        <button class="btn-primary text-xs" @click="router.push(`/range/lane/1`)">
          <Plus class="w-3.5 h-3.5" /> Назначить на дорожку
        </button>
        <button class="btn-secondary text-xs" @click="router.push('/training')">
          <Award class="w-3.5 h-3.5" /> Назначить тренировку
        </button>
      </div>
    </template>
  </div>
</template>

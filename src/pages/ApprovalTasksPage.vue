<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import LoadingState from '@/components/ui/LoadingState.vue'
import { CheckCircle, Clock, FileText, XCircle, Filter, User, Calendar } from 'lucide-vue-next'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const loading = ref(true)

interface ApprovalTask {
  id: string
  title: string
  type: 'PROTOCOL' | 'REPORT' | 'KPI' | 'TRAINING'
  requester: string
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

const filterStatus = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

const tasks = ref<ApprovalTask[]>([
  { id: 'A-18', title: 'Протокол P-2026-018', type: 'PROTOCOL', requester: 'Инструктор Турсунов А.К.', date: '10.08.2026', status: 'PENDING', description: 'Протокол по сессии S-2026-058, дорожка 3, СВД', priority: 'HIGH' },
  { id: 'A-17', title: 'Протокол P-2026-017', type: 'PROTOCOL', requester: 'Инструктор Камилов С.Р.', date: '09.08.2026', status: 'PENDING', description: 'Протокол по сессии S-2026-057, дорожка 1, АК-74', priority: 'HIGH' },
  { id: 'A-16', title: 'Отчёт по региону Андижан', type: 'REPORT', requester: 'Менеджер Исомиддинов Б.Ш.', date: '08.08.2026', status: 'PENDING', description: 'Региональный отчёт за первую декаду августа', priority: 'MEDIUM' },
  { id: 'A-15', title: 'KPI за август 2026 (декада 1)', type: 'KPI', requester: 'Система', date: '07.08.2026', status: 'PENDING', description: 'Сводный KPI по всем регионам за 1-10 августа', priority: 'HIGH' },
  { id: 'A-14', title: 'Протокол P-2026-016', type: 'PROTOCOL', requester: 'Инструктор Тошматов Ф.Ш.', date: '06.08.2026', status: 'PENDING', description: 'Протокол по сессии S-2026-055, дорожка 2, АК-12', priority: 'MEDIUM' },
  { id: 'A-13', title: 'План тренировок на 3-ю декаду августа', type: 'TRAINING', requester: 'Инструктор Махмудов С.Б.', date: '05.08.2026', status: 'PENDING', description: 'Расписание тренировок 20-31 августа', priority: 'LOW' },
  { id: 'A-12', title: 'Протокол P-2026-012', type: 'PROTOCOL', requester: 'Инструктор Махмудов С.', date: '30.07.2026', status: 'APPROVED', description: 'Протокол по сессии S-2026-052', priority: 'HIGH' },
  { id: 'A-11', title: 'Отчёт по региону Самарканд', type: 'REPORT', requester: 'Менеджер Тошматов Ф.', date: '28.07.2026', status: 'APPROVED', description: 'Региональный отчёт за июль', priority: 'MEDIUM' },
  { id: 'A-10', title: 'KPI за июль 2026', type: 'KPI', requester: 'Система', date: '25.07.2026', status: 'APPROVED', description: 'Сводный KPI по всем регионам', priority: 'HIGH' },
  { id: 'A-09', title: 'План тренировок на август', type: 'TRAINING', requester: 'Инструктор Махмудов С.', date: '24.07.2026', status: 'APPROVED', description: 'Расписание тренировок на август', priority: 'LOW' },
  { id: 'A-08', title: 'Протокол P-2026-011', type: 'PROTOCOL', requester: 'Инструктор Махмудов С.', date: '22.07.2026', status: 'REJECTED', description: 'Неполные данные о результатах стрельбы', priority: 'MEDIUM' },
  { id: 'A-07', title: 'Протокол P-2026-010', type: 'PROTOCOL', requester: 'Инструктор Камилов С.Р.', date: '20.07.2026', status: 'APPROVED', description: 'Протокол по сессии S-2026-050, дорожка 5', priority: 'MEDIUM' },
  { id: 'A-06', title: 'Отчёт по региону Бухара', type: 'REPORT', requester: 'Менеджер Тешабаев Ж.А.', date: '18.07.2026', status: 'APPROVED', description: 'Региональный отчёт за июль', priority: 'MEDIUM' },
  { id: 'A-05', title: 'Протокол P-2026-009', type: 'PROTOCOL', requester: 'Инструктор Турсунов А.К.', date: '15.07.2026', status: 'REJECTED', description: 'Ошибка в данных инструктора', priority: 'LOW' },
])

const filteredTasks = computed(() => {
  if (filterStatus.value === 'ALL') return tasks.value
  return tasks.value.filter(t => t.status === filterStatus.value)
})

const pendingCount = computed(() => tasks.value.filter(t => t.status === 'PENDING').length)
const approvedCount = computed(() => tasks.value.filter(t => t.status === 'APPROVED').length)
const rejectedCount = computed(() => tasks.value.filter(t => t.status === 'REJECTED').length)

const typeConfig: Record<string, { label_ru: string; label_uz: string; icon: any; color: string }> = {
  PROTOCOL: { label_ru: '\u041F\u0440\u043E\u0442\u043E\u043A\u043E\u043B', label_uz: 'Bayonnoma', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  REPORT: { label_ru: '\u041E\u0442\u0447\u0451\u0442', label_uz: 'Hisobot', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  KPI: { label_ru: 'KPI', label_uz: 'KPI', icon: CheckCircle, color: 'text-amber-600 bg-amber-50' },
  TRAINING: { label_ru: '\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430', label_uz: "Mashg'ulot", icon: Calendar, color: 'text-green-600 bg-green-50' },
}

const priorityConfig: Record<string, { label_ru: string; label_uz: string; color: string }> = {
  HIGH: { label_ru: '\u0412\u044B\u0441\u043E\u043A\u0438\u0439', label_uz: 'Yuqori', color: 'text-red-600 bg-red-50' },
  MEDIUM: { label_ru: '\u0421\u0440\u0435\u0434\u043D\u0438\u0439', label_uz: "O'rta", color: 'text-amber-600 bg-amber-50' },
  LOW: { label_ru: '\u041D\u0438\u0437\u043A\u0438\u0439', label_uz: 'Past', color: 'text-gray-600 bg-gray-50' },
}

function approveTask(task: ApprovalTask) { task.status = 'APPROVED' }
function rejectTask(task: ApprovalTask) { task.status = 'REJECTED' }

onMounted(() => { setTimeout(() => { loading.value = false }, 300) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else class="space-y-5">
    <div>
      <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
        {{ isUz ? "Kelishish vazifalari" : "\u0417\u0430\u0434\u0430\u0447\u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F" }}
      </h1>
      <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Tasdiqlashni kutayotgan hujjatlar" : "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B, \u043E\u0436\u0438\u0434\u0430\u044E\u0449\u0438\u0435 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F" }}</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2"><Clock class="w-3.5 h-3.5 text-amber-500" /><span class="text-xs text-gray-500">{{ isUz ? "Kutilmoqda" : "\u041E\u0436\u0438\u0434\u0430\u0435\u0442" }}</span></div>
        <p class="text-2xl font-bold text-amber-600">{{ pendingCount }}</p>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2"><CheckCircle class="w-3.5 h-3.5 text-green-500" /><span class="text-xs text-gray-500">{{ isUz ? "Tasdiqlangan" : "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E" }}</span></div>
        <p class="text-2xl font-bold text-green-600">{{ approvedCount }}</p>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2"><XCircle class="w-3.5 h-3.5 text-red-500" /><span class="text-xs text-gray-500">{{ isUz ? "Rad etilgan" : "\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E" }}</span></div>
        <p class="text-2xl font-bold text-red-600">{{ rejectedCount }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Filter class="w-3.5 h-3.5 text-gray-400" />
      <button v-for="f in ['ALL', 'PENDING', 'APPROVED', 'REJECTED']" :key="f" @click="filterStatus = f as any"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
        :class="filterStatus === f ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'">
        {{ f === 'ALL' ? (isUz ? 'Barchasi' : '\u0412\u0441\u0435') : f === 'PENDING' ? (isUz ? 'Kutilmoqda' : '\u041E\u0436\u0438\u0434\u0430\u0435\u0442') : f === 'APPROVED' ? (isUz ? 'Tasdiqlangan' : '\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E') : (isUz ? 'Rad etilgan' : '\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E') }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="task in filteredTasks" :key="task.id" class="card p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="typeConfig[task.type].color">
              <component :is="typeConfig[task.type].icon" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-bold text-gray-900">{{ task.title }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="priorityConfig[task.priority].color">
                  {{ isUz ? priorityConfig[task.priority].label_uz : priorityConfig[task.priority].label_ru }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-2">{{ task.description }}</p>
              <div class="flex items-center gap-3 text-[11px] text-gray-400">
                <span class="flex items-center gap-1"><User class="w-3 h-3" /> {{ task.requester }}</span>
                <span class="flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ task.date }}</span>
                <span>{{ isUz ? typeConfig[task.type].label_uz : typeConfig[task.type].label_ru }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <template v-if="task.status === 'PENDING'">
              <button @click="approveTask(task)" class="px-3 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1.5">
                <CheckCircle class="w-3.5 h-3.5" /> {{ isUz ? "Tasdiqlash" : "\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C" }}
              </button>
              <button @click="rejectTask(task)" class="px-3 py-2 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-1.5">
                <XCircle class="w-3.5 h-3.5" /> {{ isUz ? "Rad etish" : "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C" }}
              </button>
            </template>
            <span v-else class="px-3 py-1.5 rounded-lg text-xs font-medium" :class="task.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              {{ task.status === 'APPROVED' ? (isUz ? 'Tasdiqlangan' : '\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E') : (isUz ? 'Rad etilgan' : '\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="card flex flex-col items-center justify-center py-16">
      <CheckCircle class="w-12 h-12 text-gray-200 mb-3" />
      <p class="text-sm font-medium text-gray-400">{{ isUz ? "Vazifalar topilmadi" : "\u0417\u0430\u0434\u0430\u0447\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B" }}</p>
    </div>
  </div>
</template>

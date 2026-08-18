<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { MessageSquareWarning, Plus, X, Filter, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const historyStore = useSessionsHistoryStore()
const loading = ref(true)

interface Objection {
  id: string
  employee_name: string
  session_id: string
  date: string
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED'
  category: string
  reason: string
  resolution?: string
}

const showCreate = ref(false)
const filterStatus = ref<'ALL' | 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED'>('ALL')

const newObjection = ref({
  session_id: '',
  category: '',
  reason: '',
})

const categories = computed(() => isUz.value ? [
  { value: 'SCORING', label: 'Ball hisoblash' },
  { value: 'EQUIPMENT', label: 'Uskuna nosozligi' },
  { value: 'CAMERA', label: 'Kamera xatosi' },
  { value: 'PROCEDURE', label: 'Jarayon buzilishi' },
  { value: 'OTHER', label: 'Boshqa' },
] : [
  { value: 'SCORING', label: 'Подсчёт баллов' },
  { value: 'EQUIPMENT', label: 'Неисправность оборудования' },
  { value: 'CAMERA', label: 'Ошибка камеры' },
  { value: 'PROCEDURE', label: 'Нарушение процедуры' },
  { value: 'OTHER', label: 'Другое' },
])

const objections = ref<Objection[]>([
  { id: 'OB-014', employee_name: 'Турсунов О.С.', session_id: 'S-2026-058', date: '09.08.2026', status: 'PENDING', category: 'SCORING', reason: 'Несогласие с оценкой 7-го выстрела — мишень показала попадание в зону 9, но засчитано 7' },
  { id: 'OB-013', employee_name: 'Бобонов Р.Х.', session_id: 'S-2026-056', date: '08.08.2026', status: 'PENDING', category: 'EQUIPMENT', reason: 'Прицел сбит после 5-го выстрела, прошу пересмотр результатов с 6-го по 10-й' },
  { id: 'OB-012', employee_name: 'Шерматов У.Б.', session_id: 'S-2026-054', date: '07.08.2026', status: 'REVIEWING', category: 'PROCEDURE', reason: 'Не был предупреждён о смене рубежа, результаты 2-й серии прошу аннулировать' },
  { id: 'OB-011', employee_name: 'Фазилов Д.Р.', session_id: 'S-2026-053', date: '06.08.2026', status: 'PENDING', category: 'CAMERA', reason: 'Камера дорожки 4 не зафиксировала 2 выстрела, прошу восстановить по резервной камере' },
  { id: 'OB-010', employee_name: 'Юсупов К.А.', session_id: 'S-2026-051', date: '04.08.2026', status: 'ACCEPTED', category: 'SCORING', reason: 'Ошибка подсчёта — 3 выстрела засчитаны как промах, но мишень показывает попадания', resolution: 'Результат пересчитан по данным мишени. 3 попадания восстановлены, итоговый балл увеличен на 24.' },
  { id: 'OB-009', employee_name: 'Холиков А.Х.', session_id: 'S-2026-050', date: '02.08.2026', status: 'REVIEWING', category: 'EQUIPMENT', reason: 'АК-12 дал задержку при стрельбе сериями, результаты прошу пересмотреть' },
  { id: 'OB-008', employee_name: 'Каримов А.У.', session_id: 'S-2026-052', date: '28.07.2026', status: 'ACCEPTED', category: 'SCORING', reason: 'Несогласие с результатом 3-го выстрела — счётчик показал попадание, но результат не засчитан', resolution: 'Результат пересчитан. Попадание засчитано, балл увеличен на 9.' },
  { id: 'OB-007', employee_name: 'Алиев Б.У.', session_id: 'S-2026-049', date: '27.07.2026', status: 'ACCEPTED', category: 'CAMERA', reason: 'Камера 4 не зафиксировала выстрел, результат восстановлен по резервной камере', resolution: 'Результат восстановлен по данным резервной камеры. Баллы пересчитаны.' },
  { id: 'OB-006', employee_name: 'Хасанов О.Р.', session_id: 'S-2026-045', date: '25.07.2026', status: 'REJECTED', category: 'PROCEDURE', reason: 'ТБ-тест пройден, но система не допустила к полигону', resolution: 'ТБ-тест не пройден — срок действия истёк 24.07.2026. Требуется повторное прохождение.' },
  { id: 'OB-005', employee_name: 'Юлдашев Д.А.', session_id: 'S-2026-040', date: '23.07.2026', status: 'REJECTED', category: 'EQUIPMENT', reason: 'Оружие дало осечку, прошу пересмотр результатов', resolution: 'Осечка подтверждена, но по регламенту результат не подлежит пересмотру.' },
])

const filteredObjections = computed(() => {
  if (filterStatus.value === 'ALL') return objections.value
  return objections.value.filter(o => o.status === filterStatus.value)
})

const pendingCount = computed(() => objections.value.filter(o => o.status === 'PENDING').length)
const reviewingCount = computed(() => objections.value.filter(o => o.status === 'REVIEWING').length)
const acceptedCount = computed(() => objections.value.filter(o => o.status === 'ACCEPTED').length)
const rejectedCount = computed(() => objections.value.filter(o => o.status === 'REJECTED').length)

function statusConfig(s: string) {
  const configs: Record<string, { color: string; bg: string; label_ru: string; label_uz: string; icon: any }> = {
    PENDING: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label_ru: 'Ожидает', label_uz: 'Kutilmoqda', icon: Clock },
    REVIEWING: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label_ru: 'На рассмотрении', label_uz: "Ko'rib chiqilmoqda", icon: AlertCircle },
    ACCEPTED: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', label_ru: 'Принято', label_uz: 'Qabul qilindi', icon: CheckCircle },
    REJECTED: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label_ru: 'Отклонено', label_uz: 'Rad etildi', icon: XCircle },
  }
  return configs[s] || configs.PENDING
}

function createObjection() {
  if (!newObjection.value.session_id || !newObjection.value.reason) return
  const id = 'OB-' + String(Date.now()).slice(-6)
  objections.value.unshift({
    id,
    employee_name: 'Новый сотрудник',
    session_id: newObjection.value.session_id,
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'PENDING',
    category: newObjection.value.category || 'OTHER',
    reason: newObjection.value.reason,
  })
  newObjection.value = { session_id: '', category: '', reason: '' }
  showCreate.value = false
}

function reviewObjection(obj: Objection) {
  obj.status = 'REVIEWING'
}

function acceptObjection(obj: Objection) {
  obj.status = 'ACCEPTED'
  obj.resolution = isUz.value ? 'E\u02BBtiroz qabul qilindi. Natija qayta hisoblandi.' : 'Возражение принято. Результат пересчитан.'
}

function rejectObjection(obj: Objection) {
  obj.status = 'REJECTED'
  obj.resolution = isUz.value ? 'E\u02BBtiroz rad etildi. Natija o\u02BBzgarishsiz qoldi.' : 'Возражение отклонено. Результат остаётся без изменений.'
}

onMounted(() => { setTimeout(() => { loading.value = false }, 300) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
          {{ isUz ? "E\u02BBtirozlar" : "Возражения" }}
        </h1>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Natijalarga qo\u02BByilgan e\u02BBtirozlar boshqaruvi" : "Управление возражениями по результатам" }}</p>
      </div>
      <button class="btn-primary flex items-center gap-2 text-sm" @click="showCreate = !showCreate">
        <Plus v-if="!showCreate" class="w-4 h-4" />
        <X v-else class="w-4 h-4" />
        {{ showCreate ? (isUz ? "Bekor qilish" : "Закрыть") : (isUz ? "Yangi e\u02BBtiroz" : "Новое возражение") }}
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2">
          <Clock class="w-3.5 h-3.5 text-amber-500" />
          <span class="text-xs text-gray-500">{{ isUz ? "Kutilmoqda" : "Ожидает" }}</span>
        </div>
        <p class="text-2xl font-bold text-amber-600">{{ pendingCount }}</p>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2">
          <AlertCircle class="w-3.5 h-3.5 text-blue-500" />
          <span class="text-xs text-gray-500">{{ isUz ? "Ko'rib chiqilmoqda" : "На рассмотрении" }}</span>
        </div>
        <p class="text-2xl font-bold text-blue-600">{{ reviewingCount }}</p>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2">
          <CheckCircle class="w-3.5 h-3.5 text-green-500" />
          <span class="text-xs text-gray-500">{{ isUz ? "Qabul qilindi" : "Принято" }}</span>
        </div>
        <p class="text-2xl font-bold text-green-600">{{ acceptedCount }}</p>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-2">
          <XCircle class="w-3.5 h-3.5 text-red-500" />
          <span class="text-xs text-gray-500">{{ isUz ? "Rad etildi" : "Отклонено" }}</span>
        </div>
        <p class="text-2xl font-bold text-red-600">{{ rejectedCount }}</p>
      </div>
    </div>

    <!-- Create form -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="showCreate" class="card p-5 space-y-4">
        <h3 class="text-sm font-bold text-gray-800">{{ isUz ? "Yangi e\u02BBtiroz yaratish" : "Создать новое возражение" }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">{{ isUz ? "Sessiya ID" : "ID сессии" }}</label>
            <input v-model="newObjection.session_id" type="text" :placeholder="isUz ? 'S-2026-XXX' : 'S-2026-XXX'" class="input" />
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">{{ isUz ? "Kategoriya" : "Категория" }}</label>
            <select v-model="newObjection.category" class="input">
              <option value="">{{ isUz ? "Tanlang" : "Выберите" }}</option>
              <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1 block">{{ isUz ? "Sabab" : "Причина" }}</label>
          <textarea v-model="newObjection.reason" rows="3" :placeholder="isUz ? 'E\u02BBtiroz sababini batafsil yozing...' : 'Опишите причину возражения...'" class="input resize-none"></textarea>
        </div>
        <button class="btn-primary text-sm" @click="createObjection" :disabled="!newObjection.session_id || !newObjection.reason">
          {{ isUz ? "Yuborish" : "Отправить" }}
        </button>
      </div>
    </Transition>

    <!-- Filter -->
    <div class="flex items-center gap-2 flex-wrap">
      <Filter class="w-3.5 h-3.5 text-gray-400" />
      <button
        v-for="f in ['ALL', 'PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED']" :key="f"
        @click="filterStatus = f as any"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
        :class="filterStatus === f ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'"
      >
        {{ f === 'ALL' ? (isUz ? 'Barchasi' : 'Все') : statusConfig(f).label_ru }}
      </button>
    </div>

    <!-- List -->
    <div class="space-y-3">
      <div v-for="obj in filteredObjections" :key="obj.id" class="card p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-bold text-gray-900">{{ obj.employee_name }}</span>
              <span class="text-xs text-gray-400">{{ obj.id }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium border" :class="statusConfig(obj.status).bg + ' ' + statusConfig(obj.status).color">
                {{ isUz ? statusConfig(obj.status).label_uz : statusConfig(obj.status).label_ru }}
              </span>
            </div>
            <div class="text-xs text-gray-400 mb-2">{{ obj.session_id }} · {{ obj.date }}</div>
            <p class="text-sm text-gray-600">{{ obj.reason }}</p>
            <div v-if="obj.resolution" class="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p class="text-xs font-semibold text-gray-500 mb-1">{{ isUz ? "Hal qilish" : "Решение" }}:</p>
              <p class="text-sm text-gray-700">{{ obj.resolution }}</p>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex flex-col gap-1.5 flex-shrink-0">
            <button v-if="obj.status === 'PENDING'" @click="reviewObjection(obj)" class="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
              {{ isUz ? "Ko'rib chiqish" : "Рассмотреть" }}
            </button>
            <template v-if="obj.status === 'PENDING' || obj.status === 'REVIEWING'">
              <button @click="acceptObjection(obj)" class="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition">
                {{ isUz ? "Qabul qilish" : "Принять" }}
              </button>
              <button @click="rejectObjection(obj)" class="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">
                {{ isUz ? "Rad etish" : "Отклонить" }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredObjections.length === 0" class="card flex flex-col items-center justify-center py-16">
      <MessageSquareWarning class="w-12 h-12 text-gray-200 mb-3" />
      <p class="text-sm font-medium text-gray-400">{{ isUz ? "E\u02BBtirozlar topilmadi" : "Возражения не найдены" }}</p>
    </div>
  </div>
</template>

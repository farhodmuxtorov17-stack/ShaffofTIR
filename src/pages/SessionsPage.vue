<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Target, Calendar, Users, ChevronRight, Activity, Clock, Check, X, MapPin, AlertCircle, CalendarDays, List } from 'lucide-vue-next'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { useSessionStore } from '@/stores/session'
import { useSessionRequestStore } from '@/stores/sessionRequests'
import { useMasterStore } from '@/stores/master'
import { useI18n } from '@/i18n'
import KPICard from '@/components/ui/KPICard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const router = useRouter()
const historyStore = useSessionsHistoryStore()
const sessionStore = useSessionStore()
const reqStore = useSessionRequestStore()
const masterStore = useMasterStore()
const { t, locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

// ── Tabs ──
type Tab = 'list' | 'calendar' | 'requests'
const activeTab = ref<Tab>('list')

// ── Calendar state ──
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const viewMode = ref<'week' | 'month'>('week')
const selectedDate = ref<string>(today.toISOString().split('T')[0])
const selectedLane = ref<number>(1)
const bookingTime = ref('')
const bookingDuration = ref(60)
const showBookingModal = ref(false)

// ── Booking form ──
const bookingForm = reactive({
  employeeId: '',
  employeeName: '',
  lane: 1,
  date: '',
  startTime: '',
  duration: 60,
  weapon: '',
  notes: '',
})

// ── Bookings (stored in memory for demo) ──
interface Booking {
  id: string
  employeeId: string
  employeeName: string
  lane: number
  date: string
  startTime: string
  endTime: string
  weapon: string
  notes: string
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED'
}

const bookings = ref<Booking[]>([
  { id: 'b001', employeeId: 'e001', employeeName: 'Алиев Б.У.', lane: 1, date: '2026-07-23', startTime: '09:00', endTime: '10:00', weapon: 'АК-12', notes: 'Плановая стрельба', status: 'CONFIRMED' },
  { id: 'b002', employeeId: 'e003', employeeName: 'Юлдашев Д.А.', lane: 1, date: '2026-07-23', startTime: '14:00', endTime: '15:00', weapon: 'АК-12', notes: 'Скоростная', status: 'CONFIRMED' },
  { id: 'b003', employeeId: 'e005', employeeName: 'Махмудов С.Б.', lane: 2, date: '2026-07-23', startTime: '10:00', endTime: '11:00', weapon: 'ПК', notes: '', status: 'CONFIRMED' },
  { id: 'b004', employeeId: 'e006', employeeName: 'Каримов А.У.', lane: 3, date: '2026-07-23', startTime: '11:00', endTime: '12:00', weapon: 'СВД', notes: 'Снайперская', status: 'CONFIRMED' },
  { id: 'b005', employeeId: 'e008', employeeName: 'Тошматов Ф.Ш.', lane: 1, date: '2026-07-24', startTime: '09:00', endTime: '10:30', weapon: 'АК-12', notes: 'Инструкторская', status: 'CONFIRMED' },
  { id: 'b006', employeeId: 'e015', employeeName: 'Назаров Б.Х.', lane: 2, date: '2026-07-24', startTime: '15:00', endTime: '16:00', weapon: 'СВД', notes: 'Разведка', status: 'CONFIRMED' },
])

// ── Time slots ──
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const LANES = [1, 2, 3, 4, 5, 6]

// ── Conflict detection ──
function checkConflict(lane: number, date: string, startTime: string, duration: number): Booking | null {
  const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
  const endMin = startMin + duration
  return bookings.value.find(b => {
    if (b.lane !== lane || b.date !== date) return false
    const bStart = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
    const bEnd = parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1])
    return startMin < bEnd && endMin > bStart
  }) || null
}

// ── Calendar grid ──
const monthDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()
  const days: Array<{ date: string | null; day: number | null; bookings: Booking[]; isToday: boolean }> = []
  for (let i = 0; i < startOffset; i++) days.push({ date: null, day: null, bookings: [], isToday: false })
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: dateStr,
      day: d,
      bookings: bookings.value.filter(b => b.date === dateStr),
      isToday: dateStr === today.toISOString().split('T')[0],
    })
  }
  return days
})

const weekDays = computed(() => {
  const days: Array<{ date: string; label: string; dayName: string; bookings: Booking[]; isToday: boolean }> = []
  const dayNamesRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const dayNamesUz = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
  const names = isUz.value ? dayNamesUz : dayNamesRu

  const monday = new Date(today)
  const offset = (monday.getDay() + 6) % 7
  monday.setDate(today.getDate() - offset)

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      label: String(d.getDate()),
      dayName: names[i],
      bookings: bookings.value.filter(b => b.date === dateStr),
      isToday: dateStr === today.toISOString().split('T')[0],
    })
  }
  return days
})

const monthLabel = computed(() => {
  const monthsRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  const monthsUz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
  return (isUz.value ? monthsUz : monthsRu)[currentMonth.value] + ' ' + currentYear.value
})

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else currentMonth.value++
}

// ── Day bookings for selected date ──
const dayBookings = computed(() => {
  return bookings.value.filter(b => b.date === selectedDate.value).sort((a, b) => a.startTime.localeCompare(b.startTime))
})

function laneBookingsForDay(lane: number, date: string) {
  return bookings.value.filter(b => b.lane === lane && b.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

// ── Booking submit ──
const bookingError = ref('')

function openBookingModal(date?: string, lane?: number, time?: string) {
  bookingForm.date = date || selectedDate.value
  bookingForm.lane = lane || selectedLane.value
  bookingForm.startTime = time || ''
  bookingForm.employeeId = ''
  bookingForm.employeeName = ''
  bookingForm.weapon = ''
  bookingForm.notes = ''
  bookingForm.duration = 60
  bookingError.value = ''
  showBookingModal.value = true
}

function selectEmployee(emp: any) {
  bookingForm.employeeId = emp.id
  bookingForm.employeeName = emp.full_name.split(' ').slice(0, 2).join(' ')
}

function submitBooking() {
  bookingError.value = ''
  if (!bookingForm.employeeId || !bookingForm.startTime) {
    bookingError.value = isUz.value ? 'Xodim va vaqtni tanlang' : 'Выберите сотрудника и время'
    return
  }
  const conflict = checkConflict(bookingForm.lane, bookingForm.date, bookingForm.startTime, bookingForm.duration)
  if (conflict) {
    bookingError.value = (isUz.value
      ? `Konflikt! ${conflict.employeeName} ${conflict.startTime}-${conflict.endTime} yo'lak ${conflict.lane} band qilgan`
      : `Конфликт! ${conflict.employeeName} занял дорожку ${conflict.lane} с ${conflict.startTime} до ${conflict.endTime}`)
    return
  }
  const startMin = parseInt(bookingForm.startTime.split(':')[0]) * 60 + parseInt(bookingForm.startTime.split(':')[1])
  const endMin = startMin + bookingForm.duration
  const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
  const newBooking: Booking = {
    id: `b${Date.now()}`,
    employeeId: bookingForm.employeeId,
    employeeName: bookingForm.employeeName,
    lane: bookingForm.lane,
    date: bookingForm.date,
    startTime: bookingForm.startTime,
    endTime,
    weapon: bookingForm.weapon || 'АК-12',
    notes: bookingForm.notes,
    status: 'CONFIRMED',
  }
  bookings.value.push(newBooking)
  showBookingModal.value = false
}

function cancelBooking(id: string) {
  bookings.value = bookings.value.filter(b => b.id !== id)
}

// ── Sessions list (existing) ──
const allSessions = computed(() => {
  const list = [...historyStore.sessions]
  if (sessionStore.currentSession && sessionStore.sessionStatus !== 'IDLE') {
    const exists = list.find(s => s.id === sessionStore.currentSession?.id)
    if (!exists) {
      list.unshift({
        id: sessionStore.currentSession.id,
        created_at: sessionStore.currentSession.created_at,
        completed_at: '',
        employee_id: sessionStore.sessionMeta.employeeId || '',
        employee_name: sessionStore.sessionMeta.employeeName || '-',
        employee_rank: '',
        weapon_id: sessionStore.sessionMeta.weaponId || '',
        weapon_name: '',
        lane_number: sessionStore.sessionMeta.laneNumber || 0,
        status: 'PENDING',
        test_shots: [],
        main_shots: [],
        total_shots: sessionStore.soldiers.flatMap(s => s.shots || []).length,
        hit_count: sessionStore.soldiers.flatMap(s => s.shots || []).filter(s => s.score > 0).length,
        miss_count: sessionStore.soldiers.flatMap(s => s.shots || []).filter(s => s.score === 0).length,
        total_score: sessionStore.soldiers.flatMap(s => s.shots || []).reduce((sum, s) => sum + s.score, 0),
        accuracy: 0,
        instructor_name: 'Operator',
        instructor_id: '',
        session_type: 'STANDARD' as any,
        difficulty: 'BASIC' as any,
      })
    }
  }
  return list
})

function openSession(id: string) {
  router.push(`/sessions/${id}`)
}
function newSession() {
  router.push('/dashboard')
}

// ── Requests ──
function approveRequest(id: string) {
  reqStore.resolveRequest(id, 'APPROVED', 'u002', isUz.value ? 'Tasdiqlandi' : 'Одобрено')
}
function rejectRequest(id: string) {
  reqStore.resolveRequest(id, 'REJECTED', 'u002', isUz.value ? 'Rad etildi' : 'Отклонено')
}

// ── Employee search with district/battalion ──
const empSearchQuery = ref('')
const filteredEmployees = computed(() => {
  if (!empSearchQuery.value) return masterStore.employees.slice(0, 8)
  const q = empSearchQuery.value.toLowerCase()
  return masterStore.employees.filter(e =>
    e.full_name.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q) ||
    (e.region || '').toLowerCase().includes(q) ||
    (e.district || '').toLowerCase().includes(q) ||
    (e.battalion || '').toLowerCase().includes(q) ||
    e.rank.toLowerCase().includes(q)
  ).slice(0, 8)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">{{ isUz ? "Mashg'ulotlar" : "Сессии" }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Sessiyalar, kalendar va so'rovlar" : "Сессии, календарь и запросы" }}</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="newSession">
        <Plus class="w-4 h-4" />
        {{ isUz ? "Yangi mashg'ulot" : "Новая сессия" }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 p-1 rounded-xl bg-gray-100 w-fit">
      <button @click="activeTab = 'list'" class="px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2"
        :class="activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        <List class="w-3.5 h-3.5" /> {{ isUz ? "Ro'yxat" : "Список" }}
      </button>
      <button @click="activeTab = 'calendar'" class="px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2"
        :class="activeTab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        <CalendarDays class="w-3.5 h-3.5" /> {{ isUz ? "Kalendar" : "Календарь" }}
      </button>
      <button @click="activeTab = 'requests'" class="px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 relative"
        :class="activeTab === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        <Users class="w-3.5 h-3.5" /> {{ isUz ? "So'rovlar" : "Запросы" }}
        <span v-if="reqStore.pendingCount > 0" class="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{{ reqStore.pendingCount }}</span>
      </button>
    </div>

    <!-- ═══ TAB: LIST ═══ -->
    <template v-if="activeTab === 'list'">
      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard :title="isUz ? 'Jami' : 'Всего'" :value="allSessions.length" :icon="Activity" accent="brand" />
        <KPICard :title="isUz ? 'Yakunlangan' : 'Завершено'" :value="historyStore.completedSessions" :icon="Target" accent="blue" />
        <KPICard :title="isUz ? 'Kutilmoqda' : 'Ожидают'" :value="historyStore.pendingSessions" :icon="Calendar" accent="amber" />
        <KPICard :title="isUz ? 'Jami o' + '02bb' + 'qlar' : 'Выстрелов'" :value="historyStore.totalShots" :icon="Users" accent="purple" />
      </div>

      <!-- Sessions table -->
      <div class="card p-0 overflow-hidden" v-if="allSessions.length > 0">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ isUz ? "Xodim" : "Сотрудник" }}</th>
              <th>{{ isUz ? "Yo'lak" : "Дорожка" }}</th>
              <th>{{ isUz ? "O'qlar" : "Выстрелы" }}</th>
              <th>{{ isUz ? "Ball" : "Балл" }}</th>
              <th>{{ isUz ? "Sana" : "Дата" }}</th>
              <th>{{ isUz ? "Holat" : "Статус" }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in allSessions" :key="record.id" @click="openSession(record.id)" class="cursor-pointer">
              <td class="font-mono text-xs text-gray-400">{{ record.id }}</td>
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {{ record.employee_name.charAt(0) }}
                  </div>
                  <span class="text-sm font-bold text-gray-800">{{ record.employee_name }}</span>
                </div>
              </td>
              <td><span class="badge-neutral">#{{ record.lane_number }}</span></td>
              <td class="text-sm text-gray-600">{{ record.hit_count }}/{{ record.total_shots }}</td>
              <td class="text-sm font-bold text-gray-800">{{ record.total_score }}</td>
              <td class="text-xs text-gray-400">{{ record.created_at ? new Date(record.created_at).toLocaleDateString('ru-RU') : '-' }}</td>
              <td>
                <span class="badge" :class="record.status === 'COMPLETED' ? 'badge-success' : record.status === 'REVIEWED' ? 'badge-neutral' : 'badge-warning'">
                  {{ record.status === 'COMPLETED' ? (isUz ? "Yakunlandi" : "Завершён") : record.status === 'REVIEWED' ? (isUz ? "Ko'rilgan" : "Проверен") : (isUz ? "Kutilmoqda" : "Ожидает") }}
                </span>
              </td>
              <td><ChevronRight class="w-4 h-4 text-gray-300" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══ TAB: CALENDAR ═══ -->
    <template v-if="activeTab === 'calendar'">
      <!-- Calendar controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold text-gray-900">{{ monthLabel }}</h2>
          <div class="flex items-center gap-1">
            <button @click="prevMonth" class="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight class="w-4 h-4 rotate-180 text-gray-500" />
            </button>
            <button @click="nextMonth" class="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight class="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
          <button @click="viewMode = 'week'" class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">{{ isUz ? 'Hafta' : 'Неделя' }}</button>
          <button @click="viewMode = 'month'" class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">{{ isUz ? 'Oy' : 'Месяц' }}</button>
        </div>
      </div>

      <!-- Week view: timeline grid -->
      <div v-if="viewMode === 'week'" class="card p-0 overflow-x-auto">
        <div class="min-w-[900px]">
          <!-- Header row -->
          <div class="grid border-b border-gray-100" style="grid-template-columns: 60px repeat(6, 1fr);">
            <div class="p-2 text-[10px] text-gray-400 font-medium border-r border-gray-100">{{ isUz ? 'Vaqt' : 'Время' }}</div>
            <div v-for="d in weekDays" :key="d.date" class="p-2 text-center border-r border-gray-100 last:border-r-0"
              :class="d.isToday ? 'bg-brand-50' : ''">
              <p class="text-[10px] text-gray-400">{{ d.dayName }}</p>
              <p class="text-sm font-bold" :class="d.isToday ? 'text-brand-600' : 'text-gray-700'">{{ d.label }}</p>
              <p class="text-[9px] text-gray-300 mt-0.5">{{ d.bookings.length }} {{ isUz ? 'band' : 'брони' }}</p>
            </div>
          </div>
          <!-- Time slots -->
          <div v-for="slot in timeSlots" :key="slot" class="grid border-b border-gray-50 last:border-b-0" style="grid-template-columns: 60px repeat(6, 1fr);">
            <div class="p-2 text-[10px] text-gray-400 font-medium border-r border-gray-100 flex items-center">{{ slot }}</div>
            <div v-for="d in weekDays" :key="d.date + slot" class="border-r border-gray-50 last:border-r-0 p-1 min-h-[36px] relative">
              <template v-for="b in d.bookings.filter(bk => bk.startTime === slot)" :key="b.id">
                <div class="text-[9px] rounded px-1.5 py-1 cursor-pointer transition hover:opacity-80"
                  :style="{ background: b.lane <= 2 ? '#dcfce7' : b.lane <= 4 ? '#dbeafe' : '#fce7f3', border: '1px solid ' + (b.lane <= 2 ? '#86efac' : b.lane <= 4 ? '#93c5fd' : '#f9a8d4') }"
                  :title="b.notes">
                  <p class="font-semibold truncate" :style="{ color: b.lane <= 2 ? '#166534' : b.lane <= 4 ? '#1e40af' : '#9d174d' }">{{ b.employeeName }}</p>
                  <p class="truncate opacity-70">L{{ b.lane }} · {{ b.weapon }}</p>
                </div>
              </template>
              <button @click="openBookingModal(d.date, 1, slot)" class="absolute inset-1 opacity-0 hover:opacity-100 bg-gray-50 rounded flex items-center justify-center transition">
                <Plus class="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Month view -->
      <div v-else class="card p-0 overflow-hidden">
        <!-- Day headers -->
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div v-for="(name, i) in (isUz ? ['Du','Se','Ch','Pa','Ju','Sh','Ya'] : ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'])" :key="i"
            class="p-2 text-center text-[10px] font-medium text-gray-400 border-r border-gray-100 last:border-r-0">{{ name }}</div>
        </div>
        <!-- Calendar grid -->
        <div class="grid grid-cols-7">
          <div v-for="(day, i) in monthDays" :key="i"
            class="min-h-[80px] p-1.5 border-r border-b border-gray-50 last-in-row:border-r-0 cursor-pointer hover:bg-gray-50 transition relative"
            :class="[!day.date ? 'bg-gray-50/50' : '', day.isToday ? 'ring-1 ring-brand-300 ring-inset' : '']"
            @click="day.date && (selectedDate = day.date)">
            <template v-if="day.date">
              <p class="text-[11px] font-medium mb-1" :class="day.isToday ? 'text-brand-600' : 'text-gray-500'">{{ day.day }}</p>
              <div v-for="b in day.bookings" :key="b.id" class="text-[8px] rounded px-1 py-0.5 mb-0.5 truncate"
                :style="{ background: b.lane <= 2 ? '#dcfce7' : b.lane <= 4 ? '#dbeafe' : '#fce7f3' }">
                {{ b.startTime }} {{ b.employeeName }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Selected day bookings -->
      <div class="card p-5">
        <h3 class="text-sm font-bold text-gray-900 mb-4">
          {{ isUz ? 'Kun rejasi' : 'Расписание дня' }}: {{ selectedDate }}
        </h3>
        <div class="space-y-3">
          <div v-if="dayBookings.length === 0" class="text-center py-6">
            <Calendar class="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p class="text-xs text-gray-400">{{ isUz ? 'Band qilinmagan' : 'Нет бронирований' }}</p>
          </div>
          <div v-for="b in dayBookings" :key="b.id" class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              :style="{ background: b.lane <= 2 ? '#dcfce7' : b.lane <= 4 ? '#dbeafe' : '#fce7f3', color: b.lane <= 2 ? '#166534' : b.lane <= 4 ? '#1e40af' : '#9d174d' }">
              L{{ b.lane }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800">{{ b.employeeName }}</p>
              <p class="text-xs text-gray-400">{{ b.weapon }} · {{ b.notes || (isUz ? 'Izoh yo' + '\u02bb' + 'q' : 'Без заметок') }}</p>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ b.startTime }} - {{ b.endTime }}</span>
            </div>
            <button @click="cancelBooking(b.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        <button @click="openBookingModal()" class="btn-primary mt-4 w-full">
          <Plus class="w-4 h-4" /> {{ isUz ? "Yo'lakni band qilish" : 'Забронировать дорожку' }}
        </button>
      </div>
    </template>

    <!-- ═══ TAB: REQUESTS ═══ -->
    <template v-if="activeTab === 'requests'">
      <div class="space-y-3">
        <div v-for="req in reqStore.requests" :key="req.id"
          class="card p-4 flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: req.status === 'PENDING' ? '#fef9c3' : req.status === 'APPROVED' ? '#dcfce7' : req.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6' }">
            <component :is="req.type === 'SUMMON' ? Target : req.type === 'QUEUE' ? Clock : Activity"
              class="w-5 h-5"
              :style="{ color: req.status === 'PENDING' ? '#ca8a04' : req.status === 'APPROVED' ? '#16a34a' : req.status === 'REJECTED' ? '#dc2626' : '#6b7280' }" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-sm font-bold text-gray-800">{{ req.employee_name }}</p>
              <span class="text-[10px] text-gray-400">{{ req.employee_rank }}</span>
              <span class="text-[10px] text-gray-300">·</span>
              <span class="text-[10px] text-gray-400">{{ req.department }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-1">{{ req.message }}</p>
            <div class="flex items-center gap-2 text-[10px] text-gray-400">
              <span>{{ req.requested_by_name }} · {{ new Date(req.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
              <span v-if="req.preferred_lane">· {{ isUz ? "Yo'lak" : 'Дорожка' }} {{ req.preferred_lane }}</span>
              <span v-if="req.preferred_date">· {{ req.preferred_date }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span v-if="req.status !== 'PENDING'" class="text-[10px] font-medium px-2 py-1 rounded-full"
              :class="req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'">
              {{ req.status === 'APPROVED' ? (isUz ? 'Tasdiqlandi' : 'Одобрено') : req.status === 'REJECTED' ? (isUz ? 'Rad etildi' : 'Отклонено') : req.status === 'COMPLETED' ? (isUz ? 'Yakunlandi' : 'Завершено') : (isUz ? 'Bekor' : 'Отменён') }}
            </span>
            <template v-if="req.status === 'PENDING'">
              <button @click="approveRequest(req.id)" class="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition">
                <Check class="w-4 h-4" />
              </button>
              <button @click="rejectRequest(req.id)" class="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition">
                <X class="w-4 h-4" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ BOOKING MODAL ═══ -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showBookingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showBookingModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-sm font-bold text-gray-900">{{ isUz ? "Yo'lakni band qilish" : 'Бронирование дорожки' }}</h3>
              <button @click="showBookingModal = false" class="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X class="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-5 space-y-4">
              <!-- Lane & Date -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? "Yo'lak" : 'Дорожка' }}</label>
                  <select v-model="bookingForm.lane" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400">
                    <option v-for="l in LANES" :key="l" :value="l">{{ isUz ? "Yo'lak" : 'Дорожка' }} {{ l }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? 'Sana' : 'Дата' }}</label>
                  <input v-model="bookingForm.date" type="date" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>

              <!-- Time -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? 'Boshlanish' : 'Начало' }}</label>
                  <select v-model="bookingForm.startTime" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400">
                    <option value="" disabled>{{ isUz ? 'Tanlang' : 'Выберите' }}</option>
                    <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? "Davomiylik (min)" : 'Длительность (мин)' }}</label>
                  <select v-model="bookingForm.duration" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400">
                    <option :value="30">30</option>
                    <option :value="60">60</option>
                    <option :value="90">90</option>
                    <option :value="120">120</option>
                  </select>
                </div>
              </div>

              <!-- Employee search with region/district/battalion -->
              <div>
                <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? 'Xodim qidirish' : 'Поиск сотрудника' }}</label>
                <input v-model="empSearchQuery" type="text"
                  :placeholder="isUz ? 'Ism, tuman, bo\\u02bblinma...' : 'Имя, район, подразделение...'"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400 mb-2" />
                <div class="max-h-40 overflow-y-auto space-y-1">
                  <div v-for="emp in filteredEmployees" :key="emp.id" @click="selectEmployee(emp)"
                    class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition border"
                    :class="bookingForm.employeeId === emp.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'">
                    <div class="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {{ emp.full_name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-gray-800 truncate">{{ emp.full_name }}</p>
                      <p class="text-[9px] text-gray-400 truncate">
                        {{ emp.rank }} · {{ emp.department }}
                        <span v-if="emp.region"> · {{ emp.region }}</span>
                        <span v-if="emp.district"> · {{ emp.district }}</span>
                      </p>
                    </div>
                    <Check v-if="bookingForm.employeeId === emp.id" class="w-4 h-4 text-brand-600" />
                  </div>
                </div>
              </div>

              <!-- Weapon -->
              <div>
                <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? 'Qurol' : 'Оружие' }}</label>
                <select v-model="bookingForm.weapon" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400">
                  <option value="">-</option>
                  <option value="АК-12">АК-12</option>
                  <option value="СВД">СВД</option>
                  <option value="ПК">ПК</option>
                  <option value="ПМ">ПМ</option>
                  <option value="РПК">РПК</option>
                </select>
              </div>

              <!-- Notes -->
              <div>
                <label class="text-[11px] font-medium text-gray-500 mb-1.5 block">{{ isUz ? 'Izoh' : 'Заметка' }}</label>
                <input v-model="bookingForm.notes" type="text" :placeholder="isUz ? 'Izoh...' : 'Заметка...'"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-400" />
              </div>

              <!-- Conflict warning -->
              <div v-if="bookingError" class="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ bookingError }}</span>
              </div>
            </div>

            <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button @click="showBookingModal = false" class="btn-secondary">{{ isUz ? 'Bekor' : 'Отмена' }}</button>
              <button @click="submitBooking" class="btn-primary">{{ isUz ? 'Band qilish' : 'Забронировать' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

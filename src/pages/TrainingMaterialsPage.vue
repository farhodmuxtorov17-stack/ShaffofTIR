<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useI18n } from '@/i18n'
import { Shield, BookOpen, AlertTriangle, CheckCircle2, XCircle, Lock, ChevronRight, ChevronLeft, Award, RefreshCw, Eye, Target, Crosshair, Radio, Zap, HardHat } from 'lucide-vue-next'

const auth = useAuthStore()
const masterStore = useMasterStore()
const { locale } = useI18n()
const loading = ref(true)

// Role-based view
const userRole = computed(() => auth.user?.role || "EMPLOYEE")
const isLearner = computed(() => userRole.value === "EMPLOYEE")
const canManageMaterials = computed(() => userRole.value === "SUPER_ADMIN" || userRole.value === "INSTRUCTOR")
const canMonitor = computed(() => userRole.value === "SUPER_ADMIN" || userRole.value === "MANAGER" || userRole.value === "INSTRUCTOR")

// Employee training progress for monitoring
const employeeProgress = computed(() => {
  return masterStore.employees.map(e => ({
    id: e.id,
    name: e.full_name,
    rank: e.rank,
    department: e.department,
    qualified: e.shooting_qualified,
    totalSessions: e.total_sessions,
    avgAccuracy: e.avg_accuracy,
    tbPassed: e.tb_test_passed !== false,
  }))
})
const searchQuery = ref("")
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employeeProgress.value
  const q = searchQuery.value.toLowerCase()
  return employeeProgress.value.filter(e => e.name.toLowerCase().includes(q))
})
const isUz = computed(() => locale.value === 'uz')

type Phase = 'overview' | 'reading' | 'test' | 'result'
const phase = ref<Phase>('overview')

// Progress tracking
const currentSection = ref(0)
const completedSections = ref<number[]>([])
const testAnswers = ref<Record<number, number>>({})
const testResult = ref<{ score: number; passed: boolean } | null>(null)

// Load from localStorage
const STORAGE_KEY = 'shaffoftir_tb_progress'
const loadProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      completedSections.value = parsed.completedSections || []
      if (parsed.passed) {
        testResult.value = { score: 100, passed: true }
      }
    }
  } catch { /* ignore */ }
}
const saveProgress = (passed = false) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completedSections: completedSections.value,
      passed,
    }))
    // Update employee record in master store
    if (passed && auth.user?.full_name) {
      const emp = masterStore.employees.find(e => e.full_name === auth.user?.full_name)
      if (emp && !emp.tb_test_passed) {
        masterStore.updateEmployee(emp.id, { tb_test_passed: true })
      }
    }
  } catch { /* ignore */ }
}

// TB Course sections
const sections = computed(() => [
  {
    id: 0,
    icon: Shield,
    title_ru: 'Общие правила безопасности',
    title_uz: 'Umumiy xavfsizlik qoidalari',
    color: '#16a34a',
    content_ru: [
      'Стрелковая подготовка проводится только на специально оборудованном полигоне под руководством инструктора.',
      'К стрельбе допускаются лица, прошедшие медицинский осмотр и сдавшие тест по технике безопасности (не менее 100%).',
      'На территории полигона запрещается использование мобильных телефонов и других отвлекающих устройств во время стрельбы.',
      'Стрелок обязан выполнять все команды инструктора немедленно и без возражений.',
      'Каждый участник обязан находиться в защитной экипировке: шлем, бронежилет, наушники, защитные очки.',
    ],
    content_uz: [
      'O\u02BBq otish tayyorgarligi faqat maxsus jihozlangan poligonda instruktor rahbarligida o\u02BBtkaziladi.',
      'Otishga tibbiy ko\u02BBrikdan o\u02BBtgan va texnika xavfsizligi bo\u02BByicha testdan o\u02BBtgan (kamida 100%) shaxslar ruxsat etiladi.',
      'Poligon hududida otish paytida mobil telefon va boshqa chalg\u02BBituvchi qurilmalarni ishlatish ta\u02BBqiqlanadi.',
      'Otchi instruktorning barcha buyruqlarini darhol va e\u02BBtirozsiz bajarishi shart.',
      'Har bir ishtirokchi himoya jihozlarida bo\u02BBlishi shart: dubulg\u02BBa, bronekamulet, quloqchin, himoya ko\u02BBzoynak.',
    ],
  },
  {
    id: 1,
    icon: AlertTriangle,
    title_ru: 'Обращение с оружием',
    title_uz: 'Qurol bilan ishlash',
    color: '#f59e0b',
    content_ru: [
      'Оружие всегда должно быть направлено в безопасном направлении - в сторону мишеней или вверх по команде инструктора.',
      'Запрещается брать оружие без разрешения инструктора.',
      'Палец на спусковом крючке должен находиться только после команды «Огонь». В остальных случаях - на предохранителе.',
      'Перед передачей оружия другому лицу необходимо извлечь магазин и проверить патронник.',
      'Запрещается заряжать оружие вне огневого рубежа.',
    ],
    content_uz: [
      'Qurol doimo xavfsiz yo\u02BBnalishda - nishonlar tomon yoki instruktoring buyrug\u02BBi bo\u02BByicha yuqoriga qaratilgan bo\u02BBlishi kerak.',
      'Instruktorga ruxsatisiz qurol olish ta\u02BBqiqlanadi.',
      'Barmoq tetikchada faqat "Olov" buyrug\u02BBidan keyin bo\u02BBlishi kerak. Boshqa paytda - sug\u02BBuruvchida.',
      'Boshqa shaxsga qurol topshirishdan oldin do\u02BBkonni olib tashlash va patronxona tekshiriladi.',
      'O\u02BBq otish chizig\u02BBidan tashqarida qurolni o\u02BBqlash ta\u02BBqiqlanadi.',
    ],
  },
  {
    id: 2,
    icon: Zap,
    title_ru: 'Правила на огневом рубеже',
    title_uz: 'O\u02BBq otish chizig\u02BBidagi qoidalar',
    color: '#3b82f6',
    content_ru: [
      'На огневой рубеж выходить только по команде инструктора «К огневому рубежу, шагом марш».',
      'Запрещается пересекать огневой рубеж без команды «К бою» или «Огонь».',
      'При остановке стрельбы оружие ставится на предохранитель и кладётся на стол стволом в сторону мишеней.',
      'Команду «Стой, прекратить огонь» стрелок выполняет немедленно, независимо от остатка боеприпасов.',
      'При осечке не открывать затвор немедленно - выдержать 10 секунд, затем доложить инструктору.',
    ],
    content_uz: [
      'O\u02BBq otish chizig\u02BBiga faqat instruktoring "O\u02BBq otish chizig\u02BBiga, qadam yo\u02BBl" buyrug\u02BBi bo\u02BByicha chiqiladi.',
      'O\u02BBq otish chizig\u02BBini "Jangga" yoki "Olov" buyrug\u02BBisiz kesib o\u02BBtish ta\u02BBqiqlanadi.',
      'Otish to\u02BBxtatilganda qurol sug\u02BBuruvchiga qo\u02BByiladi va nishonlar tomon stvol bilan stolga qo\u02BByiladi.',
      '"To\u02BBxta, o\u02BBq otishni to\u02BBxtating" buyrug\u02BBini otchi darhol bajarmoqda, o\u02BBq-dorilar qolganiidan qat\u02BBi nazar.',
      'O\u02BBqslashda zotvor darhol ochilmaydi - 10 soniya kutib, instruktorga xabar beriladi.',
    ],
  },
  {
    id: 3,
    icon: Crosshair,
    title_ru: 'Чрезвычайные ситуации',
    title_uz: 'Favqulodda vaziyatlar',
    color: '#ef4444',
    content_ru: [
      'При обнаружении неразорвавшегося боеприпаса немедленно доложить инструктору, зону обозначить и эвакуировать людей.',
      'При ранении немедленно подать сигнал «Стоп» и оказать первую помощь до прибытия медперсонала.',
      'При пожаре на полигоне прекратить стрельбу, обесточить оборудование, использовать огнетушители.',
      'Запрещается самостоятельно устранять неисправности оружия - доложить инструктору.',
      'Каждый стрелок должен знать расположение аптечки, огнетушителя и эвакуационного маршрута.',
    ],
    content_uz: [
      'Portlamagan o\u02BBq-dorini topganda darhol instruktorga xabar berish, zonani belgilash va odamlarni evakuatsiya qilish.',
      'Jarohatlanganda darhol "Stop" signalini berish va tibbiyot xodimlari kelgunicha birinchi yordam ko\u02BBrsatish.',
      'Poligonda yong\u02BBin bo\u02BBlganda otishni to\u02BBxtatish, uskunalarni o\u02BBchirish, o\u02BBt o\u02BBchirgichdan foydalanish.',
      'Qurol nosozliklarini mustaqil ravishda tuzatish ta\u02BBqiqlanadi - instruktorga xabar berish.',
      'Har bir otchi dori-darmon qutisi, o\u02BBt o\u02BBchirgich va evakuatsiya marshruti joylashishini bilishi shart.',
    ],
  },
])

// Test questions
const testQuestions = computed(() => [
  {
    id: 0,
    question_ru: 'Кто допускается к стрельбе на полигоне?',
    question_uz: 'Poligonda o\u02BBq otishga kim ruxsat etiladi?',
    options_ru: ['Любой сотрудник', 'Прошедший медосмотр и сдавший ТБ-тест на 100%', 'Только офицеры', 'Имеющий личное оружие'],
    options_uz: ['Har qanday xodim', 'Tibbiy ko\u02BBrikdan o\u02BBtgan va TB testidan 100% o\u02BBtgan', 'Faqat ofitserlar', 'Shaxsiy qurolga ega'],
    correct: 1,
  },
  {
    id: 1,
    question_ru: 'Когда можно класть палец на спусковой крючок?',
    question_uz: 'Barmoqni tetikchaga qachon qo\u02BByish mumkin?',
    options_ru: ['В любой момент', 'После команды «Огонь»', 'Только при заряжании', 'На огневом рубеже'],
    options_uz: ['Har qanday paytda', '"Olov" buyrug\u02BBidan keyin', 'Faqat o\u02BBqolashda', 'O\u02BBq otish chizig\u02BBida'],
    correct: 1,
  },
  {
    id: 2,
    question_ru: 'Что делать при осечке?',
    question_uz: 'O\u02BBqlashda nima qilish kerak?',
    options_ru: ['Открыть затвор сразу', 'Выдержать 10 секунд, затем доложить инструктору', 'Продолжить стрельбу', 'Уйти с рубежа'],
    options_uz: ['Zotvorni darhol ochish', '10 soniya kutib, instruktorga xabar berish', 'Otishni davom ettirish', 'Chiziqdan ketish'],
    correct: 1,
  },
  {
    id: 3,
    question_ru: 'Куда должно быть направлено оружие?',
    question_uz: 'Qurol qaysi tomonga qaratilgan bo\u02BBlishi kerak?',
    options_ru: ['В любую сторону', 'В безопасном направлении - к мишеням или вверх', 'В сторону людей', 'Не имеет значения'],
    options_uz: ['Har qanday tomonga', 'Xavfsiz yo\u02BBnalishda - nishonlarga yoki yuqoriga', 'Odamlar tomonga', 'Ahamiyatsiz'],
    correct: 1,
  },
  {
    id: 4,
    question_ru: 'Что делать при команде «Стой, прекратить огонь»?',
    question_uz: '"To\u02BBxta, o\u02BBq otishni to\u02BBxtating" buyrug\u02BBi bo\u02BByicha nima qilish kerak?',
    options_ru: ['Д закончить патроны', 'Немедленно прекратить стрельбу', 'Переспросить команду', 'Сделать ещё один выстрел'],
    options_uz: ['O\u02BBq-dorilarni tugatish', 'Darhol otishni to\u02BBxtatish', 'Buyruqni qayta so\x02BSBrash', 'Yana bir otish otish'],
    correct: 1,
  },
  {
    id: 5,
    question_ru: 'Какая защитная экипировка обязательна?',
    question_uz: 'Qaysi himoya jirozlari majburiy?',
    options_ru: ['Только шлем', 'Шлем, бронежилет, наушники, очки', 'Только очки', 'На усмотрение стрелка'],
    options_uz: ['Faqat dubulg\u02BBa', 'Dubulg\u02BBa, bronekamulet, quloqchin, ko\u02BBzoynak', 'Faqat ko\u02BBzoynak', 'Otchining ixtiyoriga ko\u02BBra'],
    correct: 1,
  },
  {
    id: 6,
    question_ru: 'Где запрещается заряжать оружие?',
    question_uz: 'Qurolni qayerda o\u02BBqlash ta\u02BBqiqlangan?',
    options_ru: ['В любом месте', 'Вне огневого рубежа', 'На полигоне', 'В казарме'],
    options_uz: ['Har qanday joyda', 'O\u02BBq otish chizig\u02BBidan tashqarida', 'Poligonda', 'Kazarmada'],
    correct: 1,
  },
  {
    id: 7,
    question_ru: 'Что делать при обнаружении неразорвавшегося боеприпаса?',
    question_uz: 'Portlamagan o\u02BBq-dorini topganda nima qilish kerak?',
    options_ru: ['Подобрать и убрать', 'Доложить инструктору, эвакуировать людей', 'Продолжить стрельбу', 'Уничтожить самостоятельно'],
    options_uz: ['Olib, o\u02BBchirish', 'Instruktorga xabar berish, odamlarni evakuatsiya qilish', 'Otishni davom ettirish', 'Mustaqil ravishda yo\u02BBq qilish'],
    correct: 1,
  },
  {
    id: 8,
    question_ru: 'Запрещается на территории полигона во время стрельбы?',
    question_uz: 'Poligon hududida otish paytida nima ta\u02BBqiqlanadi?',
    options_ru: ['Разговаривать', 'Использовать мобильные телефоны', 'Стоять', 'Дышать'],
    options_uz: ['Gaplashish', 'Mobil telefondan foydalanish', 'Turish', 'Nafas olish'],
    correct: 1,
  },
  {
    id: 9,
    question_ru: 'Каждый стрелок должен знать расположение:',
    question_uz: 'Har bir otchi joylashishini bilishi shart:',
    options_ru: ['Выхода', 'Аптечки, огнетушителя и эвакуационного маршрута', 'Столовой', 'Туалета'],
    options_uz: ['Chiqishini', 'Dori-darmon qutisi, o\u02BBt o\u02BBchirgich va evakuatsiya marshruti', 'Oshxona', 'Hojatxona'],
    correct: 1,
  },
])

onMounted(() => {
  loadProgress()
  setTimeout(() => { loading.value = false }, 300)
})

// Navigation
function startCourse() {
  phase.value = 'reading'
  currentSection.value = 0
}

function nextSection() {
  if (!completedSections.value.includes(currentSection.value)) {
    completedSections.value.push(currentSection.value)
  }
  if (currentSection.value < sections.value.length - 1) {
    currentSection.value++
  } else {
    // All sections done → go to test
    phase.value = 'test'
    testAnswers.value = {}
    testResult.value = null
  }
  saveProgress()
}

function prevSection() {
  if (currentSection.value > 0) {
    currentSection.value--
  }
}

function selectAnswer(qId: number, optionIndex: number) {
  testAnswers.value[qId] = optionIndex
}

function submitTest() {
  let correct = 0
  testQuestions.value.forEach(q => {
    if (testAnswers.value[q.id] === q.correct) correct++
  })
  const score = Math.round((correct / testQuestions.value.length) * 100)
  testResult.value = { score, passed: score === 100 }
  if (score === 100) {
    saveProgress(true)
  }
  phase.value = 'result'
}

function resetTest() {
  testAnswers.value = {}
  testResult.value = null
  phase.value = 'test'
}

function backToOverview() {
  phase.value = 'overview'
}

const allSectionsRead = computed(() => completedSections.value.length === sections.value.length)
const progressPercent = computed(() => Math.round((completedSections.value.length / sections.value.length) * 100))
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="p-6 max-w-6xl mx-auto space-y-6">

    <!-- Manager/Admin/Instructor: Monitor employees -->
    <template v-if="!isLearner">
      <div>
        <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
          {{ isUz ? "Oʻquv materiallari" : "Учебные материалы" }}
        </h1>
        <p class="text-sm text-gray-400 mt-1">{{ isUz ? "Xodimlar oʻquv natijalari monitoringi" : "Мониторинг результатов сотрудников" }}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4"><div class="text-xs text-gray-500 mb-1">{{ isUz ? "Jami xodimlar" : "Всего сотр." }}</div><p class="text-2xl font-bold text-gray-900">{{ employeeProgress.length }}</p></div>
        <div class="card p-4"><div class="text-xs text-gray-500 mb-1">{{ isUz ? "TB oʻtgan" : "ТБ сдали" }}</div><p class="text-2xl font-bold text-green-600">{{ employeeProgress.filter(e => e.tbPassed).length }}</p></div>
        <div class="card p-4"><div class="text-xs text-gray-500 mb-1">{{ isUz ? "Malakali" : "Квалиф." }}</div><p class="text-2xl font-bold text-blue-600">{{ employeeProgress.filter(e => e.qualified).length }}</p></div>
        <div class="card p-4"><div class="text-xs text-gray-500 mb-1">{{ isUz ? "Oʻrtacha aniqlik" : "Ср. точн." }}</div><p class="text-2xl font-bold text-amber-600">{{ employeeProgress.length > 0 ? Math.round(employeeProgress.reduce((s, e) => s + e.avgAccuracy, 0) / employeeProgress.length) : 0 }}%</p></div>
      </div>

      <div class="flex items-center gap-3">
        <input v-model="searchQuery" type="text" :placeholder="isUz ? 'Qidirish...' : 'Поиск...'" class="input flex-1" />
      </div>

      <div class="card p-0 overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>{{ isUz ? "Xodim" : "Сотрудник" }}</th>
              <th>{{ isUz ? "Lavozim" : "Звание" }}</th>
              <th>{{ isUz ? "Boʻlinma" : "Подразд." }}</th>
              <th>{{ isUz ? "Sessiyalar" : "Сессий" }}</th>
              <th>{{ isUz ? "Aniqlik" : "Точн." }}</th>
              <th>{{ isUz ? "TB test" : "ТБ тест" }}</th>
              <th>{{ isUz ? "Malaka" : "Квал." }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td><div class="flex items-center gap-2.5"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold">{{ emp.name.charAt(0) }}</div><p class="text-sm font-bold text-gray-800">{{ emp.name }}</p></div></td>
              <td class="text-sm text-gray-600">{{ emp.rank }}</td>
              <td class="text-sm text-gray-600">{{ emp.department }}</td>
              <td class="text-sm text-gray-600">{{ emp.totalSessions }}</td>
              <td><div class="flex items-center gap-2"><div class="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full" :class="emp.avgAccuracy >= 70 ? 'bg-brand-500' : emp.avgAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-400'" :style="`width: ${emp.avgAccuracy}%`"></div></div><span class="text-xs font-bold text-gray-600">{{ emp.avgAccuracy }}%</span></div></td>
              <td><span class="badge" :class="emp.tbPassed ? 'badge-success' : 'badge-warning'">{{ emp.tbPassed ? (isUz ? "Oʻtgan" : "Сдал") : (isUz ? "Oʻtmagan" : "Не сдал") }}</span></td>
              <td><span class="badge" :class="emp.qualified ? 'badge-success' : 'badge-neutral'">{{ emp.qualified ? (isUz ? "Malakali" : "Да") : (isUz ? "Emas" : "Нет") }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card p-5">
        <h3 class="text-sm font-bold text-gray-800 mb-3">{{ isUz ? "TB kursi tarkibi" : "Содержание курса ТБ" }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="s in sections" :key="s.id" class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" :style="`background: ${s.color}15`"><component :is="s.icon" class="w-4 h-4" :style="`color: ${s.color}`" /></div>
            <div><p class="text-sm font-medium text-gray-700">{{ isUz ? s.title_uz : s.title_ru }}</p><p class="text-[10px] text-gray-400">{{ (isUz ? s.content_uz : s.content_ru).length }} {{ isUz ? "qoida" : "пунктов" }}</p></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Employee: Learning mode -->
    <template v-if="isLearner">
    <!-- Overview Phase -->
    <template v-if="phase === 'overview'">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             :class="testResult?.passed ? 'bg-green-100' : 'bg-blue-100'">
          <Shield v-if="!testResult?.passed" class="w-8 h-8 text-blue-600" />
          <Award v-else class="w-8 h-8 text-green-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isUz ? "Texnika xavfsizligi kursi" : "Курс техники безопасности" }}
        </h1>
        <p class="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          {{ isUz
            ? "Poligonga ruxsat olish uchun o\u02BBq otish tayyorgarligi bo\u02BByicha TB kursidan o\u02BBting va testdan 100% o\u02BBting"
            : "Пройдите курс ТБ по огневой подготовке и сдайте тест на 100% для допуска на полигон" }}
        </p>
      </div>

      <!-- Status banner -->
      <div v-if="testResult?.passed"
           class="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 class="font-semibold text-green-900">
            {{ isUz ? "TB testidan o\u02BBtdingiz! ✓" : "Вы сдали ТБ-тест! ✓" }}
          </h3>
          <p class="text-sm text-green-700 mt-0.5">
            {{ isUz ? "Poligonga ruxsat berildi" : "Допуск на полигон получен" }}
          </p>
        </div>
      </div>

      <!-- Progress -->
      <div v-if="!testResult?.passed" class="bg-white rounded-2xl border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700">
            {{ isUz ? "Kurs progressi" : "Прогресс курса" }}
          </span>
          <span class="text-sm font-bold text-gray-900">{{ progressPercent }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-green-500 h-2 rounded-full transition-all duration-300" :style="{ width: progressPercent + '%' }" />
        </div>
        <p class="text-xs text-gray-400 mt-2">
          {{ isUz ? `${completedSections.length} / ${sections.length} bo\u02BBlim o\u02BBqildi` : `${completedSections.length} / ${sections.length} разделов прочитано` }}
        </p>
      </div>

      <!-- Sections list -->
      <div class="space-y-3">
        <div v-for="(s, i) in sections" :key="s.id"
             @click="currentSection = i; phase = 'reading'"
             class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               :style="{ background: s.color + '15' }">
            <component :is="s.icon" class="w-6 h-6" :style="{ color: s.color }" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">
              {{ isUz ? s.title_uz : s.title_ru }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ isUz ? `${s.content_uz.length} ta qoida` : `${s.content_ru.length} правил` }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 v-if="completedSections.includes(i)" class="w-5 h-5 text-green-500" />
            <ChevronRight v-else class="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </div>

      <!-- Start button -->
      <div v-if="!testResult?.passed" class="flex justify-center pt-2">
        <button @click="startCourse"
                class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20">
          <BookOpen class="w-4 h-4" />
          {{ allSectionsRead
            ? (isUz ? "Testni boshlash" : "Начать тест")
            : (isUz ? "Kursni boshlash" : "Начать курс") }}
        </button>
      </div>
    </template>

    <!-- Reading Phase -->
    <template v-if="phase === 'reading'">
      <div class="space-y-5">
        <!-- Section header -->
        <div class="flex items-center gap-3">
          <button @click="backToOverview" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft class="w-5 h-5 text-gray-500" />
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 :style="{ background: sections[currentSection].color + '15' }">
              <component :is="sections[currentSection].icon" class="w-5 h-5" :style="{ color: sections[currentSection].color }" />
            </div>
            <div>
              <p class="text-xs text-gray-400">
                {{ isUz ? `Bo\u02BBlim ${currentSection + 1} / ${sections.length}` : `Раздел ${currentSection + 1} / ${sections.length}` }}
              </p>
              <h2 class="text-lg font-bold text-gray-900">
                {{ isUz ? sections[currentSection].title_uz : sections[currentSection].title_ru }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div class="h-1.5 rounded-full transition-all duration-300"
               :style="{
                 width: ((currentSection + 1) / sections.length * 100) + '%',
                 background: sections[currentSection].color
               }" />
        </div>

        <!-- Content -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div v-for="(point, idx) in (isUz ? sections[currentSection].content_uz : sections[currentSection].content_ru)" :key="idx"
               class="flex gap-3">
            <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                 :style="{ background: sections[currentSection].color + '15', color: sections[currentSection].color }">
              {{ idx + 1 }}
            </div>
            <p class="text-sm text-gray-700 leading-relaxed">{{ point }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <button v-if="currentSection > 0" @click="prevSection"
                  class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
            <ChevronLeft class="w-4 h-4" />
            {{ isUz ? "Oldingi" : "Назад" }}
          </button>
          <div v-else></div>

          <button @click="nextSection"
                  class="px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors text-white"
                  :style="{ background: sections[currentSection].color }">
            {{ currentSection === sections.length - 1
              ? (isUz ? "Testga o\u02BBtish" : "К тесту")
              : (isUz ? "Keyingi" : "Далее") }}
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>

    <!-- Test Phase -->
    <template v-if="phase === 'test'">
      <div class="space-y-5">
        <!-- Test header -->
        <div class="flex items-center gap-3">
          <button @click="backToOverview" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft class="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              {{ isUz ? "TB testi" : "ТБ-тест" }}
            </h2>
            <p class="text-xs text-gray-400">
              {{ isUz ? "10 ta savol · 100% to\u02BBg\u02BBri javob kerak" : "10 вопросов · требуется 100% правильных ответов" }}
            </p>
          </div>
        </div>

        <!-- Questions -->
        <div class="space-y-4">
          <div v-for="(q, qi) in testQuestions" :key="q.id"
               class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex gap-3 mb-4">
              <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ qi + 1 }}
              </span>
              <h3 class="text-sm font-medium text-gray-900 pt-0.5">
                {{ isUz ? q.question_uz : q.question_ru }}
              </h3>
            </div>
            <div class="space-y-2 ml-10">
              <button v-for="(opt, oi) in (isUz ? q.options_uz : q.options_ru)" :key="oi" @click="selectAnswer(q.id, oi)"
                      class="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border"
                      :class="testAnswers[q.id] === oi
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-100 hover:border-gray-200 text-gray-700'">
                <span class="font-medium mr-2">{{ String.fromCharCode(97 + oi) }})</span>
                {{ opt }}
              </button>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-center pt-2">
          <button @click="submitTest"
                  :disabled="Object.keys(testAnswers).length < testQuestions.length"
                  class="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20 disabled:shadow-none">
            <CheckCircle2 class="w-4 h-4" />
            {{ isUz ? "Testni topshirish" : "Сдать тест" }}
          </button>
        </div>
        <p v-if="Object.keys(testAnswers).length < testQuestions.length" class="text-center text-xs text-gray-400">
          {{ isUz ? `${testQuestions.length - Object.keys(testAnswers).length} ta savol javobsiz` : `${testQuestions.length - Object.keys(testAnswers).length} вопросов без ответа` }}
        </p>
      </div>
    </template>

    <!-- Result Phase -->
    <template v-if="phase === 'result' && testResult">
      <div class="text-center py-8 space-y-6">
        <!-- Score circle -->
        <div class="inline-flex items-center justify-center w-32 h-32 rounded-full"
             :class="testResult.passed ? 'bg-green-50' : 'bg-red-50'">
          <div class="w-24 h-24 rounded-full flex items-center justify-center"
               :class="testResult.passed ? 'bg-green-100' : 'bg-red-100'">
            <div class="text-center">
              <p class="text-3xl font-bold" :class="testResult.passed ? 'text-green-600' : 'text-red-600'">
                {{ testResult.score }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Result text -->
        <div>
          <h2 class="text-xl font-bold" :class="testResult.passed ? 'text-green-900' : 'text-red-900'">
            {{ testResult.passed
              ? (isUz ? "Tabriklaymiz! ✓" : "Поздравляем! ✓")
              : (isUz ? "Testdan o\u02BBtmadi ✗" : "Тест не сдан ✗") }}
          </h2>
          <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            {{ testResult.passed
              ? (isUz ? "Siz poligonga ruxsat oldingiz. Endi o\u02BBq otish sessiyalarida qatnashishingiz mumkin."
                      : "Вы получили допуск на полигон. Теперь можете участвовать в стрельбах.")
              : (isUz ? "Poligonga ruxsat olish uchun 100% to\u02BBg\u02BBri javob kerak. Qayta urinib ko\u02BBring."
                      : "Для допуска на полигон требуется 100% правильных ответов. Попробуйте снова.") }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center gap-3">
          <button v-if="!testResult.passed" @click="resetTest"
                  class="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
            <RefreshCw class="w-4 h-4" />
            {{ isUz ? "Qayta topshirish" : "Пересдать" }}
          </button>
          <button @click="backToOverview"
                  class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
            {{ isUz ? "Bosh sahifa" : "На главную" }}
          </button>
        </div>

        <!-- Answer review -->
        <div v-if="!testResult.passed" class="text-left space-y-3 pt-4 max-w-2xl mx-auto">
          <h3 class="text-sm font-medium text-gray-700">
            {{ isUz ? "Noto\u02BBg\u02BBri javoblar:" : "Неправильные ответы:" }}
          </h3>
          <div v-for="q in testQuestions" :key="q.id"
               v-show="testAnswers[q.id] !== q.correct"
               class="bg-red-50 border border-red-100 rounded-xl p-4">
            <p class="text-sm font-medium text-gray-900 mb-2">
              {{ isUz ? q.question_uz : q.question_ru }}
            </p>
            <p class="text-xs text-red-600">
              {{ isUz ? "To\u02BBg\u02BBri:" : "Правильно:" }}
              {{ isUz ? q.options_uz[q.correct] : q.options_ru[q.correct] }}
            </p>
          </div>
        </div>
      </div>
    </template>
    </template>

  </div>
</template>

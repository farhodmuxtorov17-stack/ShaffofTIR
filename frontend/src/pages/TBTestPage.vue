<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { http } from '@/api/client'
import { useAuth } from '@/composables/useAuth'

const { state } = useAuth()

interface TBTest {
  id: string
  employee_name: string
  score: number
  passed: boolean
  questions_total: number
  questions_correct: number
  test_date: string
  instructor_name?: string
}

const tests = ref<TBTest[]>([])
const loading = ref(true)
const showTestModal = ref(false)
const currentQuestion = ref(0)
const answers = ref<Record<number, number>>({})
const submitting = ref(false)

const questions = [
  { q: 'Можно ли направлять оружие на людей, даже если оно разряжено?', options: ['Да, можно', 'Нет, категорически запрещено'], correct: 1 },
  { q: 'Где должен находиться стрелок во время стрельбы соседа?', options: ['За огневым рубежом', 'На линии огня'], correct: 0 },
  { q: 'Что нужно сделать перед началом стрельбы?', options: ['Проверить оружие', 'Сразу начать стрелять'], correct: 0 },
  { q: 'Можно ли браться за оружие без команды инструктора?', options: ['Нет, запрещено', 'Да, если уверен в себе'], correct: 0 },
  { q: 'Что делать при осечке?', options: ['Опустить оружие и доложить инструктору', 'Продолжать стрелять'], correct: 0 },
  { q: 'Можно ли заряжать оружие за пределами огневого рубежа?', options: ['Нет, категорически запрещено', 'Да, это удобно'], correct: 0 },
  { q: 'Где должен находиться посторонний во время стрельбы?', options: ['В безопасной зоне', 'На линии огня'], correct: 0 },
  { q: 'Что нужно сделать по команде «Стой»?', options: ['Немедленно прекратить огонь', 'Докончит патроны'], correct: 0 },
  { q: 'Можно ли оставлять заряженное оружие без присмотра?', options: ['Нет, категорически запрещено', 'Да, ненадолго'], correct: 0 },
  { q: 'Кто даёт команду на открытие огня?', options: ['Только инструктор', 'Любой сотрудник'], correct: 0 },
]

const progress = computed(() => Math.round(((currentQuestion.value + 1) / questions.length) * 100))
const allAnswered = computed(() => Object.keys(answers.value).length === questions.length)
const correctCount = computed(() => questions.filter((_, i) => answers.value[i] === questions[i].correct).length)

async function loadTests() {
  loading.value = true
  try {
    tests.value = await http.get('/tb-tests/')
  } catch { tests.value = [] }
  finally { loading.value = false }
}

function startTest() {
  showTestModal.value = true
  currentQuestion.value = 0
  answers.value = {}
}

function answer(idx: number, optionIdx: number) {
  answers.value[idx] = optionIdx
  if (currentQuestion.value < questions.length - 1) currentQuestion.value++
}

async function submitTest() {
  submitting.value = true
  const correct = correctCount.value
  try {
    await http.post('/tb-tests/', {
      employee_name: state.user?.full_name || state.user?.email || 'Unknown',
      questions_total: questions.length,
      questions_correct: correct,
      instructor_name: state.user?.full_name || '',
    })
    showTestModal.value = false
    await loadTests()
  } catch { /* ignore */ }
  finally { submitting.value = false }
}

onMounted(loadTests)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Тест на ТБ</h1>
        <p class="text-slate-400 text-sm mt-1">Техника безопасности — допуск к стрельбе (100%)</p>
      </div>
      <button class="btn-primary" @click="startTest">Пройти тест</button>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400">Загрузка...</div>

    <div v-else-if="tests.length === 0" class="text-center py-12">
      <p class="text-slate-400">Нет результатов тестов</p>
      <button class="btn-primary mt-4" @click="startTest">Пройти первый тест</button>
    </div>

    <div v-else class="space-y-3">
      <div v-for="t in tests" :key="t.id" class="card flex items-center justify-between">
        <div>
          <p class="font-semibold text-slate-100">{{ t.employee_name }}</p>
          <p class="text-sm text-slate-400">{{ new Date(t.test_date).toLocaleDateString('ru-RU') }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-2xl font-bold" :class="t.passed ? 'text-emerald-400' : 'text-red-400'">{{ t.score }}%</p>
            <p class="text-xs text-slate-400">{{ t.questions_correct }}/{{ t.questions_total }}</p>
          </div>
          <span class="badge" :class="t.passed ? 'badge-green' : 'badge-red'">{{ t.passed ? 'Сдан' : 'Не сдан' }}</span>
        </div>
      </div>
    </div>

    <div v-if="showTestModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click.self="showTestModal = false">
      <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-2xl mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-100">Тест ТБ — Вопрос {{ currentQuestion + 1 }}/{{ questions.length }}</h2>
          <div class="w-32 bg-slate-700 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div v-if="currentQuestion < questions.length">
          <p class="text-lg text-slate-200 mb-4">{{ questions[currentQuestion].q }}</p>
          <div class="space-y-2">
            <button
              v-for="(opt, idx) in questions[currentQuestion].options"
              :key="idx"
              class="w-full text-left p-3 rounded-lg border transition-colors"
              :class="answers[currentQuestion] === idx
                ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'"
              @click="answer(currentQuestion, idx)"
            >{{ opt }}</button>
          </div>
        </div>

        <div v-else class="text-center">
          <p class="text-lg text-slate-200 mb-2">Правильных ответов: {{ correctCount }}/{{ questions.length }}</p>
          <p class="text-3xl font-bold mb-4" :class="correctCount === questions.length ? 'text-emerald-400' : 'text-red-400'">
            {{ Math.round(correctCount / questions.length * 100) }}%
          </p>
          <p v-if="correctCount < questions.length" class="text-red-400 mb-4">Нужен 100% результат для допуска</p>
          <p v-else class="text-emerald-400 mb-4">Тест сдан! Допуск к стрельбе разрешён.</p>
          <button class="btn-primary" :disabled="submitting" @click="submitTest">
            {{ submitting ? 'Сохранение...' : 'Завершить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, CheckSquare, AlertCircle, Check, X, MessageSquare, User,
  Lock, Archive
} from 'lucide-vue-next'
import { useSessionStore } from '@/stores/session'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { calculateTotalScore } from '@/api/scoring.api'
import TargetViewer from '@/components/target/TargetViewer.vue'
import ShotTable from '@/components/session/ShotTable.vue'
import KPICard from '@/components/ui/KPICard.vue'
import { resolveImageUrl } from '@/api/imageUrl'
import LoadingState from '@/components/ui/LoadingState.vue'

const loading = ref(false)
const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const uiStore = useUiStore()
const { locale, t } = useI18n()

const reviewId = computed(() => route.params.id as string)

const comments = ref<{ author: string; text: string; timestamp: string }[]>([])
const reasons = ref<{ reviewer: string; reason: string; soldierSeq: number }[]>([])
const newComment = ref('')
const newReason = ref('')
const reasonSoldierSeq = ref<number>(1)
const showReasonForm = ref(false)

const allShots = computed(() => sessionStore.soldiers.flatMap(s => s.shots || []))
const totalScore = computed(() => calculateTotalScore(allShots.value))

// Zero-edit policy: once APPROVED or ARCHIVED, results are locked
const isLocked = computed(() => {
  return sessionStore.sessionStatus === 'APPROVED' || sessionStore.sessionStatus === 'ARCHIVED'
})

const canApprove = computed(() => {
  if (isLocked.value) return false
  return sessionStore.sessionStatus === 'MAIN_COMPLETED' || sessionStore.sessionStatus === 'TEST_COMPLETED'
})

const lastResultImage = computed(() => {
  return sessionStore.lastProcessResult?.result_image_url
    ? resolveImageUrl(sessionStore.lastProcessResult.result_image_url)
    : ''
})

function addComment() {
  if (isLocked.value) return
  if (!newComment.value.trim()) return
  comments.value.push({
    author: 'Operator',
    text: newComment.value,
    timestamp: new Date().toISOString(),
  })
  newComment.value = ''
}

function addReason() {
  if (isLocked.value) return
  if (!newReason.value.trim()) return
  reasons.value.push({
    reviewer: 'Operator',
    reason: newReason.value,
    soldierSeq: reasonSoldierSeq.value,
  })
  newReason.value = ''
  showReasonForm.value = false
}

async function handleApprove() {
  if (isLocked.value) return
  try {
    if (sessionStore.sessionStatus !== 'REVIEW') {
      sessionStore.moveToReview()
    }
    sessionStore.approveSession()
    uiStore.showToast('success',
      locale.value === 'uz' ? 'Tasdiqlandi' : 'Утверждено',
      locale.value === 'uz' ? 'Sessiya tasdiqlandi va qulflandi' : 'Сессия утверждена и заблокирована')
  } catch (err: any) {
    uiStore.showToast('error', locale.value === 'uz' ? 'Xatolik' : 'Ошибка', err.message)
  }
}

function handleReject() {
  if (isLocked.value) return
  if (confirm(locale.value === 'uz'
    ? "Sessiyani rad qilasizmi? Barcha natijalar bekor qilinadi."
    : 'Отклонить сессию? Все результаты будут аннулированы.')) {
    sessionStore.resetSession()
    router.push('/sessions')
  }
}
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="router.push('/sessions')">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            {{ locale === 'uz' ? 'Tekshiruv' : 'Проверка' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ locale === 'uz' ? 'Sessiya natijalarini tasdiqlash' : 'Утверждение результатов сессии' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Zero-edit: hide action buttons when locked -->
        <template v-if="!isLocked">
          <button class="btn-danger text-xs" @click="handleReject">
            <X class="w-3.5 h-3.5" />
            {{ locale === 'uz' ? 'Rad etish' : 'Отклонить' }}
          </button>
          <button v-if="canApprove" class="btn-primary text-xs" @click="handleApprove">
            <Check class="w-3.5 h-3.5" />
            {{ locale === 'uz' ? 'Tasdiqlash' : 'Утвердить' }}
          </button>
        </template>
        <!-- Locked badge -->
        <div v-else class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200">
          <Lock class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-medium text-gray-600">
            {{ locale === 'uz' ? "Oʻzgartirib boʻlmaydi" : 'Изменения запрещены' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Zero-edit policy banner -->
    <div v-if="isLocked" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
      <Archive class="w-5 h-5 text-amber-600 shrink-0" />
      <div>
        <p class="text-sm font-medium text-amber-800">
          {{ locale === 'uz' ? "Natijalar qulflangan - o'zgartirish mumkin emas" : 'Результаты заблокированы - изменения невозможны' }}
        </p>
        <p class="text-xs text-amber-600 mt-0.5">
          {{ locale === 'uz'
            ? "Tasdiqlangan natijalar tarixiy yozuv sifatida saqlanadi (Zero-edit policy)"
            : 'Утверждённые результаты сохраняются как историческая запись (Zero-edit policy)' }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <KPICard
        :title="locale === 'uz' ? 'Holat' : 'Статус'"
        :value="sessionStore.sessionStatus.replace(/_/g, ' ')"
        accent="neutral"
      />
      <KPICard
        :title="locale === 'uz' ? 'Oʻqlar' : 'Выстрелы'"
        :value="allShots.length"
        accent="neutral"
      />
      <KPICard
        :title="locale === 'uz' ? 'Ball' : 'Балл'"
        :value="totalScore"
        accent="brand"
      />
    </div>

    <div v-if="lastResultImage" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 class="text-sm font-bold text-gray-700 mb-3">
          {{ locale === 'uz' ? 'Natija rasmi' : 'Фото результата' }}
        </h2>
        <TargetViewer :image-url="lastResultImage" :shots="allShots" />
      </div>
      <div>
        <h2 class="text-sm font-bold text-gray-700 mb-3">
          {{ locale === 'uz' ? 'Oʻqlar' : 'Выстрелы' }}
        </h2>
        <ShotTable :shots="allShots" :show-pagination="true" :page-size="10" :readonly="isLocked" />
      </div>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-gray-500" />
          <h2 class="text-sm font-bold text-gray-700">
            {{ locale === 'uz' ? 'Koʻrib chiqish sabablari' : 'Причины проверки' }}
          </h2>
        </div>
        <button
          v-if="!showReasonForm && !isLocked"
          class="btn-secondary text-xs py-1.5 px-3"
          @click="showReasonForm = true"
        >
          {{ locale === 'uz' ? 'Sabab qo\'shish' : 'Добавить причину' }}
        </button>
      </div>

      <div v-if="showReasonForm && !isLocked" class="border border-shell-border rounded-btn p-3 space-y-2 bg-gray-50/50">
        <input v-model.number="reasonSoldierSeq" type="number" min="1" class="input text-sm" :placeholder="locale === 'uz' ? 'Askar №' : 'Сотрудник №'" />
        <textarea v-model="newReason" class="input text-sm" rows="2" :placeholder="locale === 'uz' ? 'Sababni yozing...' : 'Опишите причину...'" />
        <button class="btn-primary text-xs py-2" @click="addReason">
          {{ locale === 'uz' ? 'Qo\'shish' : 'Добавить' }}
        </button>
      </div>

      <div v-if="reasons.length > 0" class="space-y-2">
        <div v-for="(r, idx) in reasons" :key="idx" class="border border-amber-200 bg-amber-50/30 rounded-btn px-4 py-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-amber-700">
              {{ locale === 'uz' ? `Askar №${r.soldierSeq}` : `Сотрудник №${r.soldierSeq}` }}
            </span>
            <span class="text-xs text-gray-400">{{ r.reviewer }}</span>
          </div>
          <p class="text-sm text-gray-700">{{ r.reason }}</p>
        </div>
      </div>
      <p v-else-if="!showReasonForm" class="text-xs text-gray-400">
        {{ locale === 'uz' ? 'Sabablar yo\'q' : 'Причин нет' }}
      </p>
    </div>

    <div class="card space-y-4">
      <div class="flex items-center gap-2">
        <MessageSquare class="w-4 h-4 text-gray-500" />
        <h2 class="text-sm font-bold text-gray-700">
          {{ locale === 'uz' ? 'Izohlar' : 'Комментарии' }}
        </h2>
      </div>
      <!-- Zero-edit: disable comment input when locked -->
      <div v-if="!isLocked" class="flex gap-2">
        <input v-model="newComment" class="input text-sm flex-1" :placeholder="locale === 'uz' ? 'Izoh yozing...' : 'Напишите комментарий...'" @keydown.enter="addComment" />
        <button class="btn-primary text-xs py-2 px-4" @click="addComment">
          {{ locale === 'uz' ? 'Yuborish' : 'Отправить' }}
        </button>
      </div>
      <div v-if="comments.length > 0" class="space-y-2">
        <div v-for="(c, idx) in comments" :key="idx" class="border border-shell-border rounded-btn px-4 py-3 bg-gray-50/30">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
              <User class="w-3.5 h-3.5 text-brand-600" />
            </div>
            <span class="text-xs font-semibold text-gray-700">{{ c.author }}</span>
            <span class="text-xs text-gray-400">{{ new Date(c.timestamp).toLocaleTimeString() }}</span>
          </div>
          <p class="text-sm text-gray-600 pl-8">{{ c.text }}</p>
        </div>
      </div>
      <p v-else class="text-xs text-gray-400">
        {{ locale === 'uz' ? 'Izohlar yo\'q' : 'Комментариев нет' }}
      </p>
    </div>
  </div>
</template>

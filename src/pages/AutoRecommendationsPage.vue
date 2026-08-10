<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useSessionsHistoryStore } from '@/stores/sessionsHistory'
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Award, Zap, BookOpen, CheckCircle } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'
import KPICard from '@/components/ui/KPICard.vue'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')
const authStore = useAuthStore()
const historyStore = useSessionsHistoryStore()
const loading = ref(true)

const userName = computed(() => authStore.user?.full_name || '')

const mySessions = computed(() => {
  const firstName = userName.value.split(' ')[0] || ''
  return historyStore.sessions.filter(s =>
    s.employee_name.includes(firstName) || s.employee_name === userName.value
  )
})

const avgAccuracy = computed(() => {
  if (!mySessions.value.length) return 0
  return Math.round(mySessions.value.reduce((sum, s) => sum + s.accuracy, 0) / mySessions.value.length)
})

const trend = computed(() => {
  if (mySessions.value.length < 2) return 0
  const recent = mySessions.value.slice(0, 3)
  const older = mySessions.value.slice(3, 6)
  if (!older.length) return 0
  const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length
  const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length
  return Math.round(recentAvg - olderAvg)
})

const worstAccuracy = computed(() => {
  if (!mySessions.value.length) return 0
  return Math.min(...mySessions.value.map(s => s.accuracy))
})

const bestAccuracy = computed(() => {
  if (!mySessions.value.length) return 0
  return Math.max(...mySessions.value.map(s => s.accuracy))
})

const passRate = computed(() => {
  if (!mySessions.value.length) return 0
  return Math.round(mySessions.value.filter(s => s.accuracy >= 60).length / mySessions.value.length * 100)
})

interface Recommendation {
  id: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  icon: any
  title_ru: string
  title_uz: string
  desc_ru: string
  desc_uz: string
  action_ru: string
  action_uz: string
}

const recommendations = computed<Recommendation[]>(() => {
  const recs: Recommendation[] = []

  if (avgAccuracy.value < 60) {
    recs.push({
      id: 'r1', priority: 'HIGH', icon: AlertTriangle,
      title_ru: '\u041D\u0438\u0437\u043A\u0430\u044F \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C',
      title_uz: 'Past aniqlik',
      desc_ru: '\u0412\u0430\u0448\u0430 \u0441\u0440\u0435\u0434\u043D\u044F\u044F \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C ' + avgAccuracy.value + '%. \u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u0430 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0431\u0430\u0437\u043E\u0432\u044B\u043C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F\u043C.',
      desc_uz: "Sizning o'rtacha aniqlikingiz " + avgAccuracy.value + "%. Asosiy mashqlar bo'yicha qo'shimcha mashg'ulot kerak.",
      action_ru: '\u041D\u0430\u0447\u0430\u0442\u044C \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0443',
      action_uz: "Mashg'ulotni boshlash",
    })
  }

  if (trend.value < 0) {
    recs.push({
      id: 'r2', priority: 'HIGH', icon: TrendingDown,
      title_ru: '\u041F\u0430\u0434\u0430\u044E\u0449\u0430\u044F \u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0430',
      title_uz: "Tushib borayotgan dinamika",
      desc_ru: '\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0441\u043D\u0438\u0437\u0438\u043B\u0430\u0441\u044C \u043D\u0430 ' + Math.abs(trend.value) + '% \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0441\u0435\u0441\u0441\u0438\u0438. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0448\u0438\u0431\u043A\u0438 \u0438 \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0443.',
      desc_uz: "Aniqlik so'nggi sessiyalarda " + Math.abs(trend.value) + "% ga tushdi. Xatolarni tahlil qilish va jismoniy tayyorgarlikni oshirish tavsiya etiladi.",
      action_ru: '\u041F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C',
      action_uz: "Tahlil qilish",
    })
  }

  if (worstAccuracy.value < 40 && mySessions.value.length > 0) {
    recs.push({
      id: 'r3', priority: 'MEDIUM', icon: Target,
      title_ru: '\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0441 \u043F\u0440\u0438\u0446\u0435\u043B\u0438\u0432\u0430\u043D\u0438\u0435\u043C',
      title_uz: "Nishonga olish muammosi",
      desc_ru: '\u0425\u0443\u0434\u0448\u0430\u044F \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C ' + worstAccuracy.value + '%. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u0441\u0442\u0440\u0435\u043B\u044C\u0431\u044B \u043F\u043E \u043D\u0435\u043F\u043E\u0434\u0432\u0438\u0436\u043D\u044B\u043C \u043C\u0438\u0448\u0435\u043D\u044F\u043C \u043D\u0430 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0439 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0438.',
      desc_uz: "Eng past aniqlik " + worstAccuracy.value + "%. Qisqa masofada statsionar nishonlarga otish mashqi tavsiya etiladi.",
      action_ru: '\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u043C\u0438\u0448\u0435\u043D\u0438',
      action_uz: "Nishon mashqi",
    })
  }

  if (trend.value > 0) {
    recs.push({
      id: 'r4', priority: 'LOW', icon: TrendingUp,
      title_ru: '\u041F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0430',
      title_uz: "Ijobiy dinamika",
      desc_ru: '\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0432\u044B\u0440\u043E\u0441\u043B\u0430 \u043D\u0430 ' + trend.value + '%! \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439\u0442\u0435 \u0432 \u0442\u043E\u043C \u0436\u0435 \u0440\u0438\u0442\u043C\u0435. \u0420\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F.',
      desc_uz: "Aniqlik " + trend.value + "% ga o'sdi! Shu ritmda davom eting. Malaka darajasini oshirishni ko'rib chiqing.",
      action_ru: '\u041F\u043E\u0432\u044B\u0441\u0438\u0442\u044C \u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044E',
      action_uz: "Malakani oshirish",
    })
  }

  if (passRate.value === 100 && mySessions.value.length >= 3) {
    recs.push({
      id: 'r5', priority: 'LOW', icon: Award,
      title_ru: '\u041E\u0442\u043B\u0438\u0447\u043D\u044B\u0435 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B',
      title_uz: "Ajoyib natijalar",
      desc_ru: '\u0412\u044B \u0441\u0434\u0430\u043B\u0438 100% \u0441\u0435\u0441\u0441\u0438\u0439! \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0431\u043E\u043B\u0435\u0435 \u0441\u043B\u043E\u0436\u043D\u044B\u043C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F\u043C \u0438 \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044E \u043A\u043B\u0430\u0441\u0441\u0430.',
      desc_uz: "Barcha sessiyalarni muvaffaqiyatli topshirdingiz! Murakkabroq mashqlarga va sinf ko'tarishga o'tish tavsiya etiladi.",
      action_ru: '\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C',
      action_uz: "Keyingi darajaga o'tish",
    })
  }

  if (recs.length === 0) {
    recs.push({
      id: 'r0', priority: 'LOW', icon: CheckCircle,
      title_ru: '\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C',
      title_uz: "Yaxshi daraja",
      desc_ru: '\u0412\u0430\u0448\u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B. \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439\u0442\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 \u0434\u043B\u044F \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043C\u0430\u0441\u0442\u0435\u0440\u0441\u0442\u0432\u0430.',
      desc_uz: "Natijalaringiz barqaror. Mahoratni oshirish uchun mashg'ulotlarni davom ettiring.",
      action_ru: '\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C',
      action_uz: "Davom etish",
    })
  }

  return recs
})

const priorityConfig: Record<string, { bg: string; text: string; border: string; label_ru: string; label_uz: string }> = {
  HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500', label_ru: '\u0412\u044B\u0441\u043E\u043A\u0438\u0439', label_uz: 'Yuqori' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-500', label_ru: '\u0421\u0440\u0435\u0434\u043D\u0438\u0439', label_uz: "O'rta" },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500', label_ru: '\u041D\u0438\u0437\u043A\u0438\u0439', label_uz: 'Past' },
}

onMounted(() => { setTimeout(() => { loading.value = false }, 300) })
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else class="space-y-5">
    <div>
      <h1 class="text-xl font-extrabold text-gray-900" style="letter-spacing: -0.02em;">
        {{ isUz ? "Tavsiyalar" : "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438" }}
      </h1>
      <p class="text-sm text-gray-400 mt-1">
        {{ isUz ? "Sizning natijalaringiz asosida shaxsiy tavsiyalar" : "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0432\u0430\u0448\u0438\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432" }}
      </p>
    </div>

    <!-- Personal stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard :title="isUz ? 'Mening aniqlikim' : '\u041C\u043E\u044F \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C'" :value="avgAccuracy + '%'" :icon="Target" accent="brand" />
      <KPICard :title="isUz ? 'Sessiyalar' : '\u0421\u0435\u0441\u0441\u0438\u0439'" :value="mySessions.length" :icon="Zap" accent="blue" />
      <KPICard :title="isUz ? 'Trend' : '\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430'" :value="(trend >= 0 ? '+' : '') + trend + '%'" :icon="trend >= 0 ? TrendingUp : TrendingDown" :accent="trend >= 0 ? 'brand' : 'red'" />
      <KPICard :title="isUz ? 'Topshirish' : '\u0421\u0434\u0430\u0447\u0430'" :value="passRate + '%'" :icon="Award" accent="amber" />
    </div>

    <!-- Recommendations -->
    <div class="space-y-3">
      <div v-for="rec in recommendations" :key="rec.id" class="card p-5 border-l-4" :class="priorityConfig[rec.priority].border">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="priorityConfig[rec.priority].bg">
            <component :is="rec.icon" class="w-5 h-5" :class="priorityConfig[rec.priority].text" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-bold text-gray-900">{{ isUz ? rec.title_uz : rec.title_ru }}</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="priorityConfig[rec.priority].bg + ' ' + priorityConfig[rec.priority].text">
                {{ isUz ? priorityConfig[rec.priority].label_uz : priorityConfig[rec.priority].label_ru }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ isUz ? rec.desc_uz : rec.desc_ru }}</p>
            <button class="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <BookOpen class="w-3.5 h-3.5" /> {{ isUz ? rec.action_uz : rec.action_ru }} →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Training tip -->
    <div class="card p-5 bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100">
      <div class="flex items-start gap-3">
        <Sparkles class="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-gray-800 mb-1">{{ isUz ? "Maslahat" : "\u0421\u043E\u0432\u0435\u0442" }}</p>
          <p class="text-sm text-gray-600">{{ isUz ? "Tavsiyalar sizning otish natijalaringiz asosida avtomatik tarzda shakllanadi. Qancha ko\u02BBp mashq qilsangiz, tavsiyalar shuncha aniq bo\u02BBladi." : "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0432\u0430\u0448\u0438\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0441\u0442\u0440\u0435\u043B\u044C\u0431\u044B. \u0427\u0435\u043C \u0431\u043E\u043B\u044C\u0448\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043E\u043A, \u0442\u0435\u043C \u0442\u043E\u0447\u043D\u0435\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438." }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

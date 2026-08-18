<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/client'
import { useToast } from '@/composables/useToast'
import type { ShotAnalysis, DetectedHit } from '@/types'

const router = useRouter()
const toast = useToast()

const analysis = ref<ShotAnalysis | null>(null)
const loading = ref(false)

async function loadResults() {
  const params = new URLSearchParams(window.location.search)
  const entryId = params.get('entry')
  if (!entryId) return

  loading.value = true
  try {
    const analyses: any = await api.get('/shot-analyses/')
    const found = analyses.find((a: any) => a.queue_entry === entryId)
    if (found) {
      analysis.value = found
    } else {
      toast.warning('Результаты AI анализа не найдены')
    }
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/queue')
}

function createProtocol() {
  if (analysis.value) {
    router.push(`/protocols/create?analysis=${analysis.value.id}`)
  }
}

onMounted(loadResults)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-100">Результаты AI анализа</h1>
      <button @click="goBack" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm">
        ← Назад
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400">Загрузка...</div>

    <div v-else-if="analysis" class="space-y-6">
      <!-- Status -->
      <div class="flex items-center gap-3">
        <div :class="[
          'px-3 py-1.5 rounded-full text-xs font-medium',
          analysis.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
        ]">
          {{ analysis.status }}
        </div>
        <span class="text-slate-400 text-sm">AI уверенность: {{ Math.round(analysis.confidence * 100) }}%</span>
      </div>

      <!-- Score summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-3xl font-bold text-emerald-400">{{ analysis.hit_count }}</div>
          <div class="text-xs text-slate-400 mt-1">Попаданий</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-3xl font-bold text-red-400">{{ analysis.miss_count }}</div>
          <div class="text-xs text-slate-400 mt-1">Промахов</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-3xl font-bold text-blue-400">{{ analysis.total_score }}</div>
          <div class="text-xs text-slate-400 mt-1">Очков</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-3xl font-bold text-amber-400">{{ analysis.accuracy }}%</div>
          <div class="text-xs text-slate-400 mt-1">Точность</div>
        </div>
      </div>

      <!-- Before/After photos -->
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-sm text-slate-400 mb-2">Фото до стрельбы</div>
          <div class="aspect-square bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
            <img v-if="analysis.before_photo_url" :src="analysis.before_photo_url" class="rounded-lg w-full h-full object-cover" />
            <div v-else class="text-slate-600">Нет фото</div>
          </div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="text-sm text-slate-400 mb-2">Фото после стрельбы (AI разметка)</div>
          <div class="aspect-square bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 relative">
            <img v-if="analysis.annotated_photo_url" :src="analysis.annotated_photo_url" class="rounded-lg w-full h-full object-cover" />
            <img v-else-if="analysis.after_photo_url" :src="analysis.after_photo_url" class="rounded-lg w-full h-full object-cover" />
            <div v-else class="text-slate-600">Нет фото</div>
            <!-- Hit markers overlay -->
            <svg v-if="analysis.detected_hits.length > 0" class="absolute inset-0 w-full h-full pointer-events-none">
              <circle
                v-for="(hit, i) in analysis.detected_hits"
                :key="i"
                :cx="hit.x * 100 + '%'"
                :cy="hit.y * 100 + '%'"
                r="6"
                fill="none"
                stroke="#ef4444"
                stroke-width="2"
              />
              <text
                v-for="(hit, i) in analysis.detected_hits"
                :key="'t' + i"
                :x="hit.x * 100 + '%'"
                :y="hit.y * 100 - 3 + '%'"
                fill="#ef4444"
                font-size="12"
                text-anchor="middle"
              >{{ hit.score }}</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Hit list -->
      <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h3 class="text-sm font-medium text-slate-300 mb-3">Детализация выстрелов</h3>
        <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
          <div
            v-for="(hit, i) in [...analysis.detected_hits, ...analysis.detected_misses]"
            :key="i"
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm',
              hit.score > 0 ? 'bg-emerald-800 text-emerald-200' : 'bg-red-800 text-red-200'
            ]"
          >
            {{ hit.score }}
          </div>
        </div>
      </div>

      <!-- Create protocol button -->
      <button
        @click="createProtocol"
        class="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
      >
        Создать протокол
      </button>
    </div>

    <div v-else class="text-center py-16 text-slate-500">
      Нет данных для отображения
    </div>
  </div>
</template>

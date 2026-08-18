<script setup lang="ts">
import { computed } from 'vue'
import { HelpCircle, Book, ExternalLink, Mail } from 'lucide-vue-next'
import { useI18n } from '@/i18n'

const { locale } = useI18n()
const isUz = computed(() => locale.value === 'uz')

const helpTopics = computed(() => isUz.value ? [
  { title: "Sessiya qanday yaratiladi?", desc: "Sessiyalar → Yangi, jangchilar va kameralar sonini tanlang", icon: Book },
  { title: "Tahlil uchun rasm yuklash?", desc: "Yuklash → otish turini tanlang → rasmni tortib oling", icon: Book },
  { title: "Qurolni qanday tayinlash?", desc: "Qurollar → Tayinlash → qurol va xodimni tanlang", icon: Book },
  { title: "FaceID ro'yxatdan oʻtish", desc: "HR → FaceID → xodimni tanlang → skanerlash", icon: Book },
  { title: "Live kameralarni koʻrish", desc: "Kameralar → koʻrish uchun yoʻlakni tanlang", icon: Book },
  { title: "Protokollarni eksport qilish", desc: "Protokollar → protokolni oching → Chop etish", icon: Book },
] : [
  { title: 'Как создать сессию?', desc: 'Перейдите в Сессии → Новая, выберите количество бойцов и камеры', icon: Book },
  { title: 'Как загрузить фото для анализа?', desc: 'Загрузка → выберите тип стрельбы → перетащите фото', icon: Book },
  { title: 'Как назначить оружие?', desc: 'Оружие → Назначение → выберите оружие и сотрудника', icon: Book },
  { title: 'FaceID регистрация', desc: 'HR → FaceID → выберите сотрудника → сканировать', icon: Book },
  { title: 'Просмотр live камер', desc: 'Камеры → выберите дорожку для просмотра', icon: Book },
  { title: 'Экспорт протоколов', desc: 'Протоколы → откройте протокол → Печать', icon: Book },
])

const links = computed(() => isUz.value ? [
  { name: 'API hujjati', url: '/api/v1/', icon: ExternalLink },
  { name: 'Bilimlar bazasi', url: '#', icon: Book },
  { name: 'Yordam', url: 'mailto:support@shaffoftir.uz', icon: Mail },
] : [
  { name: 'API документация', url: '/api/v1/', icon: ExternalLink },
  { name: 'База знаний', url: '#', icon: Book },
  { name: 'Поддержка', url: 'mailto:support@shaffoftir.uz', icon: Mail },
])
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ isUz ? 'Yordam' : 'Помощь' }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ isUz ? "Yoʻriqnomalar va hujjatlar" : 'Инструкции и документация' }}</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="topic in helpTopics" :key="topic.title" class="card cursor-pointer hover:shadow-lg transition">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"><HelpCircle class="w-5 h-5 text-gray-500" /></div>
          <div><p class="text-sm font-bold text-gray-800">{{ topic.title }}</p><p class="text-xs text-gray-400 mt-1">{{ topic.desc }}</p></div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="text-sm font-bold text-gray-700 mb-3">{{ isUz ? 'Havolalar' : 'Ссылки' }}</h2>
      <div class="space-y-2">
        <a v-for="link in links" :key="link.name" :href="link.url" target="_blank" class="flex items-center gap-2 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition text-sm text-gray-700">
          <component :is="link.icon" class="w-4 h-4 text-gray-400" />{{ link.name }}
        </a>
      </div>
    </div>
  </div>
</template>

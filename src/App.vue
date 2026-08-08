<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const isPublicPage = computed(() => route.meta.public === true)

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center h-screen w-full bg-[#f6f7f6]">
    <div class="text-gray-400 text-sm">Загрузка...</div>
  </div>
  <router-view v-else-if="isPublicPage" />
  <AppShell v-else />
</template>

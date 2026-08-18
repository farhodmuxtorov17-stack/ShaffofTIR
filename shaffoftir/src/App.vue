<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import MobileAppShell from '@/components/layout/MobileAppShell.vue'
import { useAuthStore } from '@/stores/auth'
import CreativeLoader from '@/components/ui/CreativeLoader.vue'

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const isPublicPage = computed(() => route.meta.public === true)
const isMiniApp = computed(() => route.query.miniapp === '1')

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div v-if="loading" class="app-initial-loader">
    <CreativeLoader variant="radar" :size="64" message="" />
  </div>
  <router-view v-else-if="isPublicPage" />
  <MobileAppShell v-else-if="isMiniApp" />
  <AppShell v-else />
</template>

<style scoped>
.app-initial-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0a0f1a 0%, #0d1a14 100%);
}
</style>

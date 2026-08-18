<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

const mobileSidebarOpen = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) mobileSidebarOpen.value = false
}

function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-[#f6f7f6]">
    <!-- Desktop sidebar -->
    <AppSidebar v-if="!isMobile" />

    <!-- Mobile sidebar overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileSidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="closeMobileSidebar" />
    </Transition>

    <!-- Mobile sidebar drawer -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div v-if="mobileSidebarOpen" class="lg:hidden fixed left-0 top-0 bottom-0 z-50">
        <AppSidebar @navigate="closeMobileSidebar" />
      </div>
    </Transition>

    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
      <AppTopbar :is-mobile="isMobile" @toggle-sidebar="toggleMobileSidebar" />
      <main class="flex-1 overflow-y-auto px-4 lg:px-6 xl:px-8 py-4 lg:py-6">
        <router-view :key="$route.path" />
      </main>
    </div>
  </div>
</template>

<style scoped>
main::-webkit-scrollbar { width: 4px; }
main::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
main::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
main::-webkit-scrollbar-track { background: transparent; }
</style>

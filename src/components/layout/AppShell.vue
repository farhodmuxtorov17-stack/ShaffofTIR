<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-[#f6f7f6]">
    <AppSidebar />
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <AppTopbar />
      <main class="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
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

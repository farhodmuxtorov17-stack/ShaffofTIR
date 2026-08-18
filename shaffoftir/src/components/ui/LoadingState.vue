<script setup lang="ts">
import CreativeLoader from './CreativeLoader.vue'

withDefaults(
  defineProps<{
    message?: string
    type?: 'spinner' | 'skeleton' | 'dots' | 'page' | 'table' | 'cards' | 'grid'
    rows?: number
    cols?: number
  }>(),
  { message: '', type: 'page', rows: 4, cols: 3 }
)
</script>

<template>
  <!-- Full page loader -->
  <div v-if="type === 'page'" class="flex items-center justify-center min-h-[300px] w-full">
    <CreativeLoader :message="message" variant="crosshair" :size="56" />
  </div>

  <!-- Table skeleton -->
  <div v-else-if="type === 'table'" class="w-full space-y-3 animate-fade-in">
    <div v-for="r in rows" :key="r" class="flex items-center gap-3">
      <div class="skeleton-cell skeleton-cell-sm rounded-lg"></div>
      <div class="skeleton-cell rounded-lg flex-1"></div>
      <div class="skeleton-cell rounded-lg w-24"></div>
      <div class="skeleton-cell rounded-lg w-20"></div>
    </div>
  </div>

  <!-- Cards skeleton -->
  <div v-else-if="type === 'cards'" class="grid gap-4 animate-fade-in" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <div v-for="i in rows * cols" :key="i" class="skeleton-card">
      <div class="skeleton-card-header"></div>
      <div class="skeleton-card-line w-3/4"></div>
      <div class="skeleton-card-line w-1/2"></div>
      <div class="skeleton-card-line w-2/3"></div>
    </div>
  </div>

  <!-- Grid skeleton -->
  <div v-else-if="type === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
    <div v-for="i in rows * cols" :key="i" class="skeleton-grid-item">
      <div class="skeleton-grid-icon"></div>
      <div class="skeleton-grid-line w-3/4"></div>
      <div class="skeleton-grid-line w-1/2"></div>
    </div>
  </div>

  <!-- Default spinner -->
  <div v-else class="flex items-center justify-center min-h-[200px] w-full">
    <CreativeLoader :message="message" variant="radar" :size="48" />
  </div>
</template>

<style scoped>
.skeleton-cell {
  height: 36px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-cell-sm { width: 40px; }
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-card {
  border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0;
}
.skeleton-card-header {
  height: 32px; width: 32px; border-radius: 8px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite;
  margin-bottom: 14px;
}
.skeleton-card-line {
  height: 12px; border-radius: 6px; margin-bottom: 8px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-grid-item {
  border-radius: 14px; padding: 16px; border: 1px solid #f0f0f0;
}
.skeleton-grid-icon {
  height: 28px; width: 28px; border-radius: 8px; margin-bottom: 10px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-grid-line {
  height: 10px; border-radius: 5px; margin-bottom: 6px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite;
}
</style>

<script setup lang="ts">
import type { Component } from 'vue'
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    message?: string
    icon?: Component | any
  }>(),
  { icon: Inbox }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto my-8">
    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-400 mb-4 shrink-0 shadow-sm">
      <component :is="icon" class="w-7 h-7" />
    </div>
    <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
    <p v-if="message" class="text-sm text-gray-500 mt-1.5 leading-relaxed">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title: string
    value: string | number
    subtitle?: string
    icon?: Component | any
    accent?: 'brand' | 'neutral' | 'blue' | 'purple' | 'amber' | 'red'
    trend?: number
  }>(),
  {
    accent: 'neutral',
  }
)
</script>

<template>
  <div class="card-compact group cursor-default relative" style="overflow: visible;">
    <!-- Accent glow -->
    <div class="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      :class="{
        'bg-gradient-to-br from-brand-500/10 to-transparent': accent === 'brand',
        'bg-gradient-to-br from-blue-500/10 to-transparent': accent === 'blue',
        'bg-gradient-to-br from-purple-500/10 to-transparent': accent === 'purple',
        'bg-gradient-to-br from-amber-500/10 to-transparent': accent === 'amber',
        'bg-gradient-to-br from-red-500/10 to-transparent': accent === 'red',
        'bg-gradient-to-br from-gray-500/5 to-transparent': accent === 'neutral',
      }"></div>

    <div class="relative flex items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] truncate mb-1.5">
          {{ title }}
        </p>
        <h3 class="stat-3d text-gray-950">
          {{ value }}
        </h3>
        <p v-if="subtitle" class="text-[11px] text-gray-400 mt-1 truncate font-medium">
          {{ subtitle }}
        </p>
        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-1.5">
          <span class="text-[10px] font-bold" :class="trend >= 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
          </span>
        </div>
      </div>

      <div v-if="icon"
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
        style="box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.5);"
        :class="[
          accent === 'brand' ? 'bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 border border-brand-200/50' :
          accent === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50' :
          accent === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-700 border border-purple-200/50' :
          accent === 'amber' ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50' :
          accent === 'red' ? 'bg-gradient-to-br from-red-100 to-red-50 text-red-700 border border-red-200/50' :
          'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border border-gray-200/50'
        ]">
        <component :is="icon" class="w-[22px] h-[22px]" />
      </div>
    </div>
  </div>
</template>

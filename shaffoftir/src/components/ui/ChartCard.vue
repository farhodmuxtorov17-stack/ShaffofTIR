<script setup lang="ts">
import { computed } from 'vue'

interface ChartData {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  data: ChartData[]
  type?: 'bar' | 'line' | 'donut'
  height?: number
  showLabels?: boolean
  showValues?: boolean
  unit?: string
}>(), {
  type: 'bar',
  height: 200,
  showLabels: true,
  showValues: true,
  unit: '',
})

const colors = ['#16a34a', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const chartData = computed(() => {
  return props.data.map((d, i) => ({
    ...d,
    color: d.color || colors[i % colors.length],
  }))
})

const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value), 1))

// Bar chart
const barWidth = computed(() => {
  const count = chartData.value.length
  return count > 0 ? 100 / count : 0
})

// Donut chart
const donutSegments = computed(() => {
  const total = chartData.value.reduce((sum, d) => sum + d.value, 0) || 1
  let offset = 0
  return chartData.value.map(d => {
    const percent = (d.value / total) * 100
    const seg = {
      ...d,
      percent,
      dashArray: `${percent} ${100 - percent}`,
      dashOffset: -offset,
    }
    offset += percent
    return seg
  })
})

const donutTotal = computed(() => chartData.value.reduce((sum, d) => sum + d.value, 0))

// Line chart
const polylinePoints = computed(() => {
  const w = 100
  const h = 100
  const count = chartData.value.length
  if (count === 0) return ''
  return chartData.value.map((d, i) => {
    const x = count > 1 ? (i / (count - 1)) * w : 50
    const y = h - (d.value / maxValue.value) * h
    return `${x},${y}`
  }).join(' ')
})

const areaPath = computed(() => {
  const w = 100
  const h = 100
  const count = chartData.value.length
  if (count === 0) return ''
  const points = chartData.value.map((d, i) => {
    const x = count > 1 ? (i / (count - 1)) * w : 50
    const y = h - (d.value / maxValue.value) * h
    return `${x},${y}`
  })
  return `0,${h} ${points.join(' ')} ${w},${h}`
})
</script>

<template>
  <div class="w-full">
    <!-- Bar Chart - 3D -->
    <div v-if="type === 'bar'" class="flex items-end justify-between gap-2" :style="{ height: height + 'px' }">
      <div v-for="(d, i) in chartData" :key="i" class="flex-1 flex flex-col items-center gap-1.5 group">
        <div class="relative w-full flex items-end justify-center" :style="{ height: (height - 30) + 'px' }">
          <div
            class="chart-bar-3d w-full max-w-[40px]"
            :style="{
              height: ((d.value / maxValue) * 100) + '%',
              background: `linear-gradient(135deg, ${d.color} 0%, ${d.color}cc 100%)`,
              boxShadow: `0 6px 15px -5px ${d.color}44, inset 0 1px 0 0 rgba(255,255,255,0.25)`,
            }">
            <div class="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-white/40"></div>
            <span v-if="showValues" class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
              {{ d.value }}{{ unit }}
            </span>
          </div>
        </div>
        <span v-if="showLabels" class="text-[10px] text-gray-500 truncate max-w-full font-medium">{{ d.label }}</span>
      </div>
    </div>

    <!-- Line Chart - 3D glow -->
    <div v-else-if="type === 'line'" class="relative" :style="{ height: height + 'px' }">
      <svg :viewBox="'0 0 100 ' + height" preserveAspectRatio="none" class="w-full" :style="{ height: height + 'px' }">
        <defs>
          <linearGradient :id="'grad-' + height" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#16a34a" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#16a34a" stop-opacity="0" />
          </linearGradient>
          <filter :id="'glow-' + height">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <polygon :points="areaPath" :fill="'url(#grad-' + height + ')'" />
        <polyline :points="polylinePoints" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" :filter="'url(#glow-' + height + ')'" />
        <circle v-for="(d, i) in chartData" :key="i"
          :cx="chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50"
          :cy="height - (d.value / maxValue) * height"
          r="3" fill="white" stroke="#16a34a" stroke-width="2" class="transition-all" />
      </svg>
      <div class="flex justify-between mt-1.5">
        <span v-for="(d, i) in chartData" :key="i" class="text-[9px] text-gray-400 font-medium">{{ d.label }}</span>
      </div>
    </div>

    <!-- Donut Chart - 3D shadow -->
    <div v-else-if="type === 'donut'" class="flex items-center gap-6">
      <svg viewBox="0 0 42 42" class="w-32 h-32 -rotate-90" style="filter: drop-shadow(0 8px 12px rgba(0,0,0,0.08));">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f1f5f9" stroke-width="4.5" />
        <circle v-for="(seg, i) in donutSegments" :key="i"
          cx="21" cy="21" r="15.9" fill="none"
          :stroke="seg.color" stroke-width="4.5"
          :style="{ strokeDasharray: `${seg.percent} ${100 - seg.percent}`, strokeDashoffset: i === 0 ? 25 : 25 - donutSegments.slice(0, i).reduce((s, x) => s + x.percent, 0) }"
          class="transition-all duration-1000"
          style="stroke-linecap: round;"
        />
        <text x="21" y="21" class="rotate-90" transform-origin="21 21" text-anchor="middle" dy=".3em" font-size="7" font-weight="bold" fill="#333">
          {{ donutTotal }}{{ unit }}
        </text>
      </svg>
      <div class="flex-1 space-y-2">
        <div v-for="(d, i) in chartData" :key="i" class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-md" :style="{ background: d.color, boxShadow: `0 2px 4px ${d.color}44` }"></span>
          <span class="text-xs text-gray-600 flex-1 font-medium">{{ d.label }}</span>
          <span class="text-xs font-bold text-gray-800">{{ d.value }}{{ unit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

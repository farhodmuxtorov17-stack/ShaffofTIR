<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  document.title = 'DASHBOARD MOUNTED'
  // Add a visible marker to the body
  const marker = document.createElement('div')
  marker.id = 'test-dashboard-marker'
  marker.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:40px;background:#10b981;color:#fff;font-size:24px;z-index:99999'
  marker.textContent = 'TEST DASHBOARD COMPONENT MOUNTED'
  document.body.appendChild(marker)
})
</script>

<template>
  <div style="padding:40px;background:#fff">
    <h1 style="color:#10b981">Test Dashboard Works!</h1>
    <p>Mounted: {{ mounted }}</p>
  </div>
</template>

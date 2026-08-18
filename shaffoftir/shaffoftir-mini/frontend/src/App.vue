<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { authState } from '@/stores/auth'
import AppShell from '@/components/layout/AppShell.vue'

const route = useRoute()
const isLogin = computed(() => route.path === '/login')
const showShell = computed(() => !isLogin.value && authState.user)
</script>

<template>
  <AppShell v-if="showShell" />
  <router-view v-else />
</template>

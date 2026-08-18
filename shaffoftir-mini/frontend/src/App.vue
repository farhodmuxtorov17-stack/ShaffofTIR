<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppShell from '@/components/layout/AppShell.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()

const isLogin = computed(() => route.path === '/login')
const showShell = computed(() => !isLogin.value && isAuthenticated.value)
</script>

<template>
  <AppShell v-if="showShell" />
  <router-view v-else />
  <ToastContainer />
</template>

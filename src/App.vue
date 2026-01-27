<!-- src/App.vue -->
<template>
  <!-- Conditional Layout based on authentication status -->
  <BlankLayout v-if="!isAuthenticated">
    <RouterView />
  </BlankLayout>

  <DefaultLayout v-else>
    <RouterView />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BlankLayout from '@/layouts/BlankLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

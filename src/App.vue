<!-- src/App.vue -->
<template>
  <!-- ใช้ BlankLayout สำหรับ error pages + login -->
  <BlankLayout v-if="shouldUseBlankLayout">
    <RouterView />
  </BlankLayout>

  <!-- ใช้ DefaultLayout สำหรับหน้าที่ต้อง auth -->
  <DefaultLayout v-else>
    <RouterView />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BlankLayout from '@/layouts/BlankLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const authStore = useAuthStore()
const route = useRoute()

// ✅ ใช้ BlankLayout เมื่อ:
// 1. ยังไม่ login (เช่น หน้า /login)
// 2. เป็น error pages (meta.layout === 'blank')
const shouldUseBlankLayout = computed(() => {
  return !authStore.isAuthenticated || route.meta.layout === 'blank'
})
</script>

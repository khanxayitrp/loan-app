<!-- src/views/products/ProductManagement.vue -->
<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      {{ pageTitle }}
    </h1>
    <div class="divider"></div>

    <!-- Dynamic Component -->
    <component :is="currentComponent" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProductsList from '@/components/products/ProductsList.vue'
import ProductTypeList from '@/components/products/ProductTypeList.vue'

const route = useRoute()

// Get page type from route meta
const pageType = computed(() => {
  return route.meta.pageType as string || 'products'
})

// Determine which component to show
const currentComponent = computed(() => {
  return pageType.value === 'types' ? ProductTypeList : ProductsList
})

// Determine page title
const pageTitle = computed(() => {
  return pageType.value === 'types' ? 'ຈັດການປະເພດສິນຄ້າ' : 'ຈັດການສິນຄ້າ'
})
</script>

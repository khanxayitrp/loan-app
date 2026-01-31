<!-- src/views/shops/ShopManagement.vue -->
<template>
  <main class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">ຈັດການຮ້ານຄ້າ</h1>
    <div class="divider"></div>

    <!-- Loading -->
    <div v-if="shopStore.isLoading" class="text-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Force เปิด CreateShop เพื่อทดสอบ -->
    <!-- <CreateShop /> -->


    <!-- โหมดแก้ไขหรือสร้าง -->
    <CreateShop
      v-else-if="shopStore.isEditing || !shopStore.currentShop"
      :initial-data="shopStore.currentShop"
      @save="handleShopSaved"
      @cancel="shopStore.cancelEditing"
    />

    <!-- โหมดแสดงข้อมูล -->

    <ShopStatus
      v-else
      :shop="shopStore.currentShop"
      @edit="shopStore.startEditing"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useShopStore } from '@/stores/shop'
import CreateShop from '@/components/shops/CreateShop.vue'
import ShopStatus from '@/components/shops/ShopStatus.vue'

const shopStore = useShopStore()

onMounted(() => {
  shopStore.fetchShop()
})

// ✅ เพิ่มการ reload ข้อมูลหลังบันทึก
const handleShopSaved = async () => {
  console.log('Before reload - isEditing:', shopStore.isEditing)
  await shopStore.fetchShop()
  shopStore.cancelEditing()
  console.log('After reload - isEditing:', shopStore.isEditing)
  console.log('Current shop:', shopStore.currentShop)
}
</script>

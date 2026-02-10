<!-- src/views/shops/ShopManagement.vue -->
<template>
  <main class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">ຈັດການຮ້ານຄ້າ</h1>
    <div class="divider"></div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 text-gray-500">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- ไม่มีร้านค้า -->
      <template v-if="!hasShop">
        <!-- โหมดสร้างใหม่ -->
        <CreateShopForm
          v-if="isCreating"
          :initial-data="null"
          @save="handleShopSaved"
          @cancel="cancelCreating"
        />
        <!-- ปุ่มสร้าง -->
        <CreateShopButton
          v-else
          @create="startCreating"
        />
      </template>

      <!-- มีร้านค้า -->
      <template v-else>
        <!-- โหมดแก้ไข -->
        <CreateShopForm
          v-if="isEditing"
          :initial-data="currentShop"
          @save="handleShopSaved"
          @cancel="cancelEditing"
        />
        <!-- โหมดแสดงผล -->
        <ShopStatus
          v-else
          :shop="currentShop"
          @edit="startEditing"
        />
      </template>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useShopStore } from '@/stores/shop'
import CreateShopButton from '@/components/shops/CreateShopButton.vue'
import CreateShopForm from '@/components/shops/CreateShop.vue'
import ShopStatus from '@/components/shops/ShopStatus.vue'

const shopStore = useShopStore()
const isLoading = ref(false)

const hasShop = computed(() => {
  const shop = shopStore.currentShop
  // ✅ ตรวจสอบโครงสร้างข้อมูลที่ถูกต้อง
  if (!shop) return false
  // กรณี response เป็น { message: "...", shop: {...} }
  if (shop.shop && shop.shop.id) {
    return true
  }
  // กรณี response เป็น { id: ..., ... }
  if (shop.id) {
    return true
  }

  return false
})
const currentShop = computed(() => {
  const shop = shopStore.currentShopWithFullUrls
  if (!shop) return null

  // ✅ extract ข้อมูลร้านค้าให้ถูกต้อง
  if (shop.shop) {
    return shop.shop
  }
  return shop
})
const isEditing = computed(() => shopStore.isEditing)

// ✅ เพิ่ม computed สำหรับโหมดสร้างใหม่
const isCreating = computed(() => shopStore.isCreating)

onMounted(async () => {
  await loadShopData()
})

const loadShopData = async () => {
  isLoading.value = true
  try {
    await shopStore.fetchCurrentShop()
  } catch (error) {
    console.error('Failed to load shop ', error)
  } finally {
    isLoading.value = false
  }
}

// ✅ ฟังก์ชันสำหรับเริ่มโหมดสร้างใหม่
const startCreating = () => {
  shopStore.startCreating()
}

const startEditing = () => {
  shopStore.startEditing()
}

// ✅ ฟังก์ชันยกเลิกโหมดสร้างใหม่
const cancelCreating = () => {
  shopStore.cancelCreating()
}

const cancelEditing = () => {
  shopStore.cancelEditing()
}

const handleShopSaved = async () => {
  try {
    // await loadShopData()
    // ออกจากทั้งโหมดสร้างและแก้ไข
    shopStore.cancelCreating()
    shopStore.cancelEditing()
  } catch (error) {
    console.error('Error reloading shop ', error)
    alert('โหลดข้อมูลล้มเหลว กรุณาลองใหม่')
  }
}
</script>

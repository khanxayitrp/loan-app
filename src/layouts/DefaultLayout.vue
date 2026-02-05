<!-- src/layouts/DefaultLayout.vue -->
<template>
  <div class="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <!-- Navbar - เต็มความกว้างเสมอ -->
    <header class="sticky top-0 z-30 w-full bg-base-100 shadow-sm">
      <Nav :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />
    </header>

    <!-- Content Area: Sidebar + Main -->
    <div class="flex flex-1 relative">
      <!-- Sidebar -->
      <Sidebar
        ref="sidebarRef"
        :is-open="isSidebarOpen"
        :is-minified="isSidebarMinified"
        @close="closeSidebar"
        @minified-change="onMinifiedChange"
        class="z-50 lg:z-0"
      />

      <!-- Main + Footer wrapper (ยืดเต็มความสูง + ความกว้างควบคุมโดย sidebar) -->
      <div class="flex flex-col flex-1 min-w-0">
        <!-- Main content -->
        <main
          class="flex-grow p-4 lg:p-6 overflow-y-auto"
          :class="mainMarginClass"
        >
          <router-view />
        </main>

        <!-- Footer - เต็มความกว้างของ main area -->
        <Footer />
      </div>
    </div>

    <!-- Mobile Backdrop -->
    <transition name="fade">
      <div
        v-if="isMobileOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="closeSidebar"
      ></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import Nav from '@/components/common/Navbar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Footer from '@/components/common/Footer.vue'
import { useAuthStore } from '@/stores/auth'

const isSidebarOpen = ref(false)
const isSidebarMinified = ref(false)
const authStore = useAuthStore()
const isMobileOpen = ref(false) // ✅ ประกาศ reactive variable นี้
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)

// Margin ซ้ายให้ main ตามความกว้าง sidebar (เฉพาะ desktop)
const mainMarginClass = computed(() => {
  if (isSidebarMinified.value) {
    return 'lg:ml-20'  // w-20 = 80px
  }
  return 'lg:ml-66'    // w-66 ≈ 264px
})

// ป้องกัน body scroll เมื่อ mobile sidebar เปิด
watch(isSidebarOpen, (newVal) => {
  document.body.style.overflow = newVal ? 'hidden' : ''
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  isMobileOpen.value = isSidebarOpen.value // ✅ sync กับ isMobileOpen
}

const closeSidebar = () => {
  isSidebarOpen.value = false
  isMobileOpen.value = false // ✅ ปิดทั้งสอง state
}

const onMinifiedChange = (minified: boolean) => {
  isSidebarMinified.value = minified
  localStorage.setItem('sidebar-minified', minified.toString())
}

onMounted(() => {
  // โหลดสถานะ minified จาก localStorage (เฉพาะ desktop)
  const saved = localStorage.getItem('sidebar-minified')
  if (saved !== null && window.innerWidth >= 1024) {
    isSidebarMinified.value = saved === 'true'
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

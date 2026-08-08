<template>
  <header class="bg-slate-900 text-white p-6 shadow-lg">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-sky-400">INSEE <span class="text-white">DASHBOARD</span></h1>
        <p class="text-slate-400 text-sm">ລະບົບຕິດຕາມຂໍ້ມູນສິນເຊື່ອ ແລະ ສິນຄ້າແບບ Real-time</p>
      </div>
      <div class="flex gap-4 items-center">
        <!-- 🌟 ปุ่ม Force Refresh -->
        <button @click="store.fetchSummary(true)"
          class="btn btn-sm btn-outline text-white hover:bg-sky-500 hover:border-sky-500" :disabled="store.isLoading">
          <span v-if="store.isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--refresh] size-4"></span>
          ໂຫຼດຂໍ້ມູນໃໝ່
        </button>

        <div class="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span class="text-xs text-slate-500 block">ອັບເດດລ່າສຸດ</span>
          <span class="text-sm font-bold">{{ lastUpdatedText }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()

const lastUpdatedText = computed(() => {
  if (!store.lastFetched) return 'ຍັງບໍ່ມີຂໍ້ມູນ'
  const date = new Date(store.lastFetched)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
})
</script>

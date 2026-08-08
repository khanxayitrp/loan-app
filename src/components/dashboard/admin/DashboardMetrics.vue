<template>
  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div v-for="(metric, index) in displayMetrics" :key="index"
        :class="`bg-white rounded-[1.5rem] p-6 shadow-md transition-transform hover:-translate-y-1 border-b-4 ${metric.borderColor}`">
        <span class="text-3xl mb-2 block">{{ metric.icon }}</span>
        <span class="text-slate-500 text-xs font-bold uppercase">{{ metric.title }}</span>
        <span :class="`text-2xl font-black block mt-1 ${metric.textColor || 'text-slate-800'}`">
          {{ metric.value.toLocaleString() }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()

// 🌟 ผูกข้อมูลจาก Store กับ UI อัตโนมัติ
const displayMetrics = computed(() => {
  const m = store.metrics;
  return [
    { icon: '🏢', title: 'ຈຳນວນຮ້ານຄ້າ', value: m.totalShops, borderColor: 'border-sky-500' },
    { icon: '📦', title: 'ສິນຄ້າທັງໝົດ', value: m.totalProducts, borderColor: 'border-slate-300' },
    { icon: '✅', title: 'ສິນຄ້າທີ່ Active', value: m.activeProducts, borderColor: 'border-emerald-500', textColor: 'text-emerald-600' },
    { icon: '📄', title: 'ການຮ້ອງຂໍທັງໝົດ', value: m.totalRequests, borderColor: 'border-orange-500', textColor: 'text-orange-600' },
    { icon: '⏳', title: 'ພວມດຳເນີນການ', value: m.pendingRequests, borderColor: 'border-sky-500', textColor: 'text-sky-600' },
    { icon: '🏆', title: 'ສິນເຊື່ອທີ່ສຳເລັດ', value: m.completedLoans, borderColor: 'border-indigo-500', textColor: 'text-indigo-600' },
  ]
})
</script>

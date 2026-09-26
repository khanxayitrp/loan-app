<template>
  <div class="flex flex-col items-center justify-center">
    <!-- ສາມາດໃຊ້ ApexCharts, Chart.js ຫຼຶ CSS Donut Chart. ໃນນີ້ໃຊ້ Tailwind UI Design ເບື້ອງຕົ້ນ -->
    <div class="w-full space-y-3">
      <div v-for="(item, index) in healthData" :key="index" class="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full" :class="item.colorClass"></span>
          <span class="font-medium text-sm text-slate-700">{{ item.label }}</span>
        </div>
        <div class="text-right">
          <p class="font-bold text-slate-800">{{ formatCurrency(item.value) }}</p>
          <p class="text-xs text-slate-500">{{ item.percent }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
const { portfolioHealth: health } = storeToRefs(store)

const formatCurrency = (val: number) => new Intl.NumberFormat('lo-LA').format(val || 0) + ' ₭'

const healthData = computed(() => {
  const h = health.value || { current: 0, overdue1to30: 0, overdue31to90: 0, npl: 0 };
  const total = h.current + h.overdue1to30 + h.overdue31to90 + h.npl || 1;

  const calcPct = (val: number) => ((val / total) * 100).toFixed(1);

  return [
    { label: 'ສະຖານະປົກກະຕິ (Current)', value: h.current, percent: calcPct(h.current), colorClass: 'bg-emerald-500' },
    { label: 'ຄ້າງຊຳລະ 1-30 ມື້', value: h.overdue1to30, percent: calcPct(h.overdue1to30), colorClass: 'bg-yellow-400' },
    { label: 'ຄ້າງຊຳລະ 31-90 ມື້', value: h.overdue31to90, percent: calcPct(h.overdue31to90), colorClass: 'bg-orange-500' },
    { label: 'ໜີ້ເສຍ (NPL > 90 ມື້)', value: h.npl, percent: calcPct(h.npl), colorClass: 'bg-red-600' }
  ]
})
</script>
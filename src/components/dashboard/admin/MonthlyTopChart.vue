<template>
  <div class="flex flex-col gap-6">
    <div class="relative w-full h-[250px]">
      <canvas ref="monthlyChartCanvas"></canvas>
    </div>

    <div class="table-container overflow-y-auto max-h-[200px]">
      <table class="w-full text-left">
        <thead>
          <tr class="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <th class="pb-2">ຊື່ສິນຄ້າ</th>
            <th class="pb-2 text-right">ຂໍເດືອນນີ້ (ຄັ້ງ)</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-slate-50">
          <tr v-for="(item, index) in store.charts.topProductsMonth" :key="index">
            <td class="py-3 font-bold text-slate-700">{{ item.name }}</td>
            <td class="py-3 text-right font-black text-orange-600">{{ item.count.toLocaleString() }}</td>
          </tr>
          <tr v-if="store.charts.topProductsMonth.length === 0">
            <td colspan="2" class="text-center py-4 text-slate-400">ບໍ່ພົບຂໍ້ມູນໃນເດືອນນີ້</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, shallowRef, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
const monthlyChartCanvas = ref(null)
// 3. ระบุ Type ให้ chartInstance (ใช้ Chart | null)
const chartInstance = ref<Chart | null>(null);
// 2. ระบุ Type ให้ wrapLabels
const wrapLabels = (labels: string[]): string[] =>
  labels.map((label: string) => label.length > 15 ? label.substring(0, 15) + '...' : label);



const renderChart = () => {
  if (!monthlyChartCanvas.value) return;
  if (chartInstance.value) chartInstance.value.destroy();

  const data = store.charts.topProductsMonth || [];

  chartInstance.value = new Chart(monthlyChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: wrapLabels(data.map(d => d.name)),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 15
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 }, padding: 15 } }
      }
    }
  });
}

watch(() => store.charts.topProductsMonth, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  if (store.charts.topProductsMonth.length > 0) renderChart()
})
</script>

<style scoped>
.table-container {
  scrollbar-width: thin;
}

.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>

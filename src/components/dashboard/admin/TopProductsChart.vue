<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="relative w-full h-[300px]">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="table-container max-h-[300px] overflow-y-auto pr-2">
      <table class="w-full text-left">
        <thead class="sticky top-0 bg-white shadow-sm z-10">
          <tr class="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <th class="pb-3">ຊື່ສິນຄ້າ</th>
            <th class="pb-3 text-right">ຈຳນວນການຂໍ (ຄັ້ງ)</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-slate-50">
          <tr v-for="(item, index) in store.charts.topProductsOverall" :key="index">
            <td class="py-3 font-bold text-slate-700">{{ item.name }}</td>
            <td class="py-3 text-right font-black text-sky-600">{{ item.count.toLocaleString() }}</td>
          </tr>
          <tr v-if="store.charts.topProductsOverall.length === 0">
            <td colspan="2" class="text-center py-4 text-slate-400">ບໍ່ພົບຂໍ້ມູນ</td>
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
const chartCanvas = ref(null)
// 3. ระบุ Type ให้ chartInstance (ใช้ Chart | null)
const chartInstance = ref<Chart | null>(null);
// 2. ระบุ Type ให้ wrapLabels
const wrapLabels = (labels: string[]): string[] =>
  labels.map((label: string) => label.length > 15 ? label.substring(0, 15) + '...' : label);



const renderChart = () => {
  if (!chartCanvas.value) return;
  if (chartInstance.value) chartInstance.value.destroy();

  const data = store.charts.topProductsOverall || [];

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: wrapLabels(data.map(d => d.name)),
      datasets: [{
        label: 'ຈຳນວນການຂໍສິນເຊື່ອ',
        data: data.map(d => d.count),
        backgroundColor: '#0ea5e9',
        borderRadius: 8,
        hoverBackgroundColor: '#f59e0b'
      }]
    },
    options: {
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
      }
    }
  });
}

// 🌟 Reactivity: วาดกราฟใหม่เมื่อข้อมูลเปลี่ยน
watch(() => store.charts.topProductsOverall, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  if (store.charts.topProductsOverall.length > 0) renderChart()
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

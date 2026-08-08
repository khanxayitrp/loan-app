<template>
  <div class="flex flex-col h-full">
    <div class="flex-grow flex items-center relative w-full h-[250px]">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
      <span class="text-orange-600 font-bold text-3xl">{{ repeatPercentage }}%</span>
      <p class="text-xs text-orange-800 font-medium mt-1">ລູກຄ້າກັບມາໃຊ້ບໍລິການຊໍ້າ (Repeat Customers)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, shallowRef, onMounted, computed } from 'vue'
import Chart from 'chart.js/auto';
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
const chartCanvas = ref(null)
// 2. ระบุ Type ให้ chartInstance (ใช้ Chart | null)
const chartInstance = ref<Chart | null>(null);

const repeatPercentage = computed(() => {
  const { new: newCust, repeat } = store.charts.demographics;
  const total = newCust + repeat;
  if (total === 0) return 0;
  return Math.round((repeat / total) * 100);
})

const renderChart = () => {
  if (!chartCanvas.value) return;
  if (chartInstance.value) chartInstance.value.destroy();

  const { new: newCust, repeat } = store.charts.demographics;

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['ລູກຄ້າເກົ່າ (Repeat)', 'ລູກຄ້າໃໝ່ (New)'],
      datasets: [{
        data: [repeat, newCust],
        backgroundColor: ['#f59e0b', '#e2e8f0'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } }
    }
  });
}

watch(() => store.charts.demographics, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  renderChart() // วาดครั้งแรก (ถึงค่าเป็น 0 ก็วาดโครงไว้ก่อน)
})
</script>

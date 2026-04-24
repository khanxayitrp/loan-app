<template>
  <div class="flex-grow flex items-center relative w-full h-[250px]">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const chartCanvas = ref(null)

onMounted(() => {
  new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['ລູກຄ້າເກົ່າ (Repeat)', 'ລູກຄ້າໃໝ່ (New)'],
      datasets: [{
        data: [38, 62],
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
})
</script>

<template>
  <div class="relative w-full h-[300px]">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const chartCanvas = ref(null)

const wrapLabels = (labels) => {
  return labels.map(label => {
    if (label.length <= 16) return label;
    const words = label.split(' ');
    let result = []; let line = "";
    words.forEach(w => {
      if ((line + w).length > 16) { result.push(line.trim()); line = w + " "; }
      else { line += w + " "; }
    });
    result.push(line.trim());
    return result;
  });
};

onMounted(() => {
  new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: wrapLabels(['ລົດຈັກ Honda', 'ໂທລະສັບ Samsung', 'ຄຳແທ່ງ 99.99%', 'ເຄື່ອງໃຊ້ໄຟຟ້າ LG', 'ໂທລະສັບ iPhone']),
      datasets: [{
        label: 'ຈຳນວນ (ເດືອນນີ້)',
        data: [120, 95, 88, 65, 45],
        backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#f43f5e'],
        borderRadius: 12
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
    }
  });
})
</script>

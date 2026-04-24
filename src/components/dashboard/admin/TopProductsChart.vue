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
      labels: wrapLabels(['ລົດຈັກ Honda', 'ໂທລະສັບ Samsung', 'ຄຳແທ່ງ 99.99%', 'ເຄື່ອງໃຊ້ໄຟຟ້າ LG', 'ໂທລະສັບ iPhone', 'ລົດຈັກ Yamaha', 'ຄອມພິວເຕີ Dell', 'ເຄື່ອງປັບອາກາດ', 'Tablet Huawei', 'ເຄື່ອງຊັກຜ້າ']),
      datasets: [{
        label: 'ຈຳນວນການຂໍສິນເຊື່ອ',
        data: [850, 720, 610, 540, 480, 410, 320, 290, 210, 180],
        backgroundColor: '#0ea5e9',
        borderRadius: 8
      }]
    },
    options: {
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } }
    }
  });
})
</script>

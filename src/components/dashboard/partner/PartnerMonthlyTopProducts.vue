<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div class="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 border-t-8 border-orange-500">
      <h3 class="text-xl font-bold mb-8 text-slate-800 flex items-center gap-3">
        <span class="p-2 bg-orange-100 rounded-xl text-2xl">📊</span>
        Top 5 ສິນຄ້າ (ເດືອນນີ້)
      </h3>
      <div class="chart-container relative w-full h-[320px] max-h-[400px]">
        <canvas ref="monthlyChartCanvas"></canvas>
      </div>
    </div>

    <div class="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 border-t-8 border-sky-600 flex flex-col">
      <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
        <span class="p-2 bg-sky-100 rounded-xl text-2xl">📅</span>
        ລາຍການສິນຄ້າ ແລະ ຈຳນວນການຂໍ (ໃນ 1 ເດືອນ)
      </h3>
      <div class="table-container overflow-y-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <th class="pb-4">ຊື່ສິນຄ້າ</th>
              <th class="pb-4">ຍີ່ຫໍ້</th>
              <th class="pb-4 text-right">ຂໍເດືອນນີ້ (ຄັ້ງ)</th>
              <th class="pb-4 text-right">ການປ່ຽນແປງ</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-50">
            <tr v-for="(item, index) in monthlyProducts" :key="index">
              <td class="py-4 font-bold text-slate-700">{{ item.name }}</td>
              <td class="py-4 text-slate-500">{{ item.brand }}</td>
              <td class="py-4 text-right font-black text-orange-600">{{ item.count }}</td>
              <td class="py-4 text-right font-bold" :class="item.trend.includes('▲') ? 'text-emerald-500' : (item.trend.includes('▼') ? 'text-red-500' : 'text-slate-400')">
                {{ item.trend }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const monthlyChartCanvas = ref(null)

const monthlyProducts = ref([
  { name: 'Honda Wave 110i', brand: 'Honda', count: 120, trend: '▲ 15%' },
  { name: 'Galaxy S24 Ultra', brand: 'Samsung', count: 95, trend: '▲ 8%' },
  { name: 'Gold Bar 1 Baht', brand: 'Insee Gold', count: 88, trend: '▼ 2%' },
  { name: 'LG Inverter Air', brand: 'LG', count: 65, trend: '▲ 22%' },
  { name: 'iPhone 15 Pro', brand: 'Apple', count: 45, trend: '0%' },
])

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
  new Chart(monthlyChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: wrapLabels(['Honda Wave', 'Galaxy S24', 'Gold Bar', 'LG Air', 'iPhone 15']),
      datasets: [{
        data: [120, 95, 88, 65, 45],
        backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 15
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, padding: 15 } },
        tooltip: {
          callbacks: {
            title: (items) => {
              let label = items[0].chart.data.labels[items[0].dataIndex];
              return Array.isArray(label) ? label.join(' ') : label;
            }
          }
        }
      }
    }
  });
})
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  scrollbar-width: thin;
}
.table-container::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>

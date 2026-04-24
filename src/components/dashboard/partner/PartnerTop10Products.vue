<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div class="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
      <h3 class="text-xl font-bold mb-8 text-slate-800 flex items-center gap-3">
        <span class="p-2 bg-sky-100 rounded-xl text-2xl">🏆</span>
        Top 10 ສິນຄ້າທີ່ມີການຂໍສິນເຊື່ອສູງສຸດ
      </h3>
      <div class="chart-container relative w-full h-[320px] max-h-[400px]">
        <canvas ref="top10ChartCanvas"></canvas>
      </div>
    </div>

    <div class="lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col">
      <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
        <span class="p-2 bg-slate-100 rounded-xl text-2xl">📋</span>
        ລາຍການສິນຄ້າ ແລະ ຈຳນວນການຂໍ
      </h3>
      <div class="table-container flex-grow max-h-[340px] overflow-y-auto pr-2">
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-white shadow-sm z-10">
            <tr class="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <th class="pb-4">ຊື່ສິນຄ້າ (Model)</th>
              <th class="pb-4 text-center">ສະຖານະ</th>
              <th class="pb-4 text-right">ຈຳນວນ (ຄັ້ງ)</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-50">
            <tr v-for="(item, index) in productList" :key="index">
              <td class="py-4 font-bold text-slate-700">{{ item.name }}</td>
              <td class="py-4 text-center text-[10px]">
                <span v-if="item.status === 'ເປີດ'" class="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-bold">ເປີດ</span>
                <span v-else class="bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">ປິດ</span>
              </td>
              <td class="py-4 text-right font-black text-sky-600">{{ item.count }}</td>
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

const top10ChartCanvas = ref(null)

const productList = ref([
  { name: 'Honda Wave 110i 2024', status: 'ເປີດ', count: 452 },
  { name: 'Samsung Galaxy S24 Ultra', status: 'ເປີດ', count: 380 },
  { name: 'iPhone 15 Pro Max 256GB', status: 'ເປີດ', count: 310 },
  { name: 'LG Inverter Air 12k BTU', status: 'ປິດ', count: 245 },
  { name: 'Honda Click 160i ABS', status: 'ເປີດ', count: 210 },
  { name: 'Huawei MatePad Pro 11', status: 'ເປີດ', count: 185 },
  { name: 'Gold Bar 99.99% (1 Baht)', status: 'ເປີດ', count: 160 },
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
  new Chart(top10ChartCanvas.value, {
    type: 'bar',
    data: {
      labels: wrapLabels(['Honda Wave 110i', 'Galaxy S24 Ultra', 'iPhone 15 Pro Max', 'LG Air Inverter', 'Honda Click 160i', 'Huawei MatePad', 'Fazzio Hybrid', 'Dell Vostro Laptop', 'Gold Bar 1 Baht', 'Sharp Washer']),
      datasets: [{
        label: 'ຈຳນວນຂໍສິນເຊື່ອ',
        data: [452, 380, 310, 245, 210, 185, 160, 142, 130, 98],
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        hoverBackgroundColor: '#f59e0b'
      }]
    },
    options: {
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              let label = items[0].chart.data.labels[items[0].dataIndex];
              return Array.isArray(label) ? label.join(' ') : label;
            }
          }
        }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
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

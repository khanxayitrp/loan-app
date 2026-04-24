<template>
  <header class="bg-slate-900 text-white p-6 shadow-lg">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-sky-400">INSEE <span class="text-white">DASHBOARD</span></h1>
        <p class="text-slate-400 text-sm">ລະບົບຕິດຕາມຂໍ້ມູນສິນເຊື່ອ ແລະ ສິນຄ້າແບບ Real-time</p>
      </div>
      <div class="flex gap-4">
        <div class="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span class="text-xs text-slate-500 block">ວັນທີລາຍງານ</span>
          <span class="text-sm font-bold">{{ currentDate }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
// ສາມາດຂຽນ Logic ດຶງວັນທີປັດຈຸບັນມາໃສ່ໄດ້
const currentDate = ref('24 ເມສາ 2026')
</script>

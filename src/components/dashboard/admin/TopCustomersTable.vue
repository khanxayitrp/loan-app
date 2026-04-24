<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left">
      <thead>
        <tr class="text-slate-400 text-xs border-b border-slate-100">
          <th class="pb-4 font-bold uppercase tracking-wider">ລາຍຊື່ລູກຄ້າ</th>
          <th class="pb-4 font-bold uppercase tracking-wider text-right">ຈຳນວນສັນຍາ</th>
          <th class="pb-4 font-bold uppercase tracking-wider text-right">ຍອດລວມ</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        <tr v-for="(customer, index) in customers" :key="index" class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
          <td class="py-4 font-bold text-slate-700">{{ customer.name }}</td>
          <td class="py-4 text-right text-slate-600">{{ customer.contracts }}</td>
          <td class="py-4 text-right text-sky-600 font-bold">{{ customer.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const customers = ref([
  { name: 'ທ້າວ ສົມພອນ ໄຊຍະວົງ', contracts: 8, total: '120M LAK' },
  { name: 'ນາງ ຈັນທະມາລີ ສີຫາວົງ', contracts: 6, total: '85M LAK' },
  { name: 'ທ້າວ ອານຸສິດ ຈັນທະລາ', contracts: 5, total: '42M LAK' },
  { name: 'ທ້າວ ບຸນມີ ແກ້ວມະນີ', contracts: 4, total: '38M LAK' },
  { name: 'ນາງ ສຸກສະຫວັນ ພອນວິໄລ', contracts: 4, total: '35M LAK' },
])
</script>

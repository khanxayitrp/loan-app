<template>
  <div class="overflow-x-auto h-[350px]">
    <table class="w-full text-left">
      <thead class="sticky top-0 bg-white shadow-sm z-10">
        <tr class="text-slate-400 text-xs border-b border-slate-100">
          <th class="pb-4 font-bold uppercase tracking-wider">ລາຍຊື່ລູກຄ້າ</th>
          <th class="pb-4 font-bold uppercase tracking-wider text-right">ຈຳນວນສັນຍາ</th>
          <th class="pb-4 font-bold uppercase tracking-wider text-right">ຍອດລວມ</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        <tr v-for="(customer, index) in store.topCustomers" :key="index"
          class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
          <td class="py-4 font-bold text-slate-700">{{ customer.name }}</td>
          <td class="py-4 text-right text-slate-600 font-medium">{{ customer.contracts }}</td>
          <td class="py-4 text-right text-emerald-600 font-black">{{ customer.total }}</td>
        </tr>
        <tr v-if="store.topCustomers.length === 0">
          <td colspan="3" class="text-center py-8 text-slate-400">ບໍ່ພົບຂໍ້ມູນລູກຄ້າ</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
</script>

<style scoped>
div {
  scrollbar-width: thin;
}

div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>

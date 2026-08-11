<template>
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead class="bg-slate-50 text-slate-600">
        <tr>
          <th class="rounded-tl-xl">ເດືອນ (Month)</th>
          <th class="text-right">ຄຳຂໍທັງໝົດ (Requests)</th>
          <th class="text-right">ປ່ອຍສຳເລັດ (Disbursed)</th>
          <th class="text-right rounded-tr-xl w-1/3">ອັດຕາຄວາມສຳເລັດ (Success Rate)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in chartData" :key="index" class="hover:bg-slate-50 transition-colors border-b border-slate-100">
          <td class="font-bold text-slate-700">{{ formatMonth(row.month) }}</td>
          <td class="text-right font-medium">{{ row.requests.toLocaleString() }}</td>
          <td class="text-right font-bold text-emerald-600">{{ row.disbursed.toLocaleString() }}</td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-3">
              <span class="font-bold" :class="getRateColor(calculateRate(row.requests, row.disbursed))">
                {{ calculateRate(row.requests, row.disbursed) }}%
              </span>
              <!-- Visual Bar -->
              <div class="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" 
                     :class="getBarColor(calculateRate(row.requests, row.disbursed))"
                     :style="{ width: calculateRate(row.requests, row.disbursed) + '%' }">
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!chartData.length">
          <td colspan="4" class="text-center py-8 text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນໃນລະບົບ</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAdminDashboardStore } from '@/stores/admin_dashboard';

const store = useAdminDashboardStore();

// ดึงข้อมูลรายเดือนจาก Store (ต้องอัปเดต Store ให้รับ monthlyComparison ด้วย)
const chartData = computed(() => store.summary?.monthlyComparison || []);

// ฟังก์ชันคำนวณ %
const calculateRate = (requests: number, disbursed: number) => {
  if (!requests || requests === 0) return 0;
  return Number(((disbursed / requests) * 100).toFixed(1));
};

// ฟังก์ชันแปลเดือนเป็นภาษาลาว
// 🌟 FIX: Defensive Programming & Type Guard
const formatMonth = (monthYear: string) => {
  if (!monthYear || !monthYear.includes('-')) return monthYear || '-';
  
  const parts = monthYear.split('-');
  const year = parts[0];
  const month = parts[1];
  
  // ກວດສອບວ່າ month ມີຄ່າຈິງກ່ອນນຳໄປ parseInt
  if (!month) return year;
  
  const monthIndex = parseInt(month) - 1;
  const monthsLao = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
  
  // ປ້ອງກັນກໍລະນີ parseInt ໄດ້ຄ່າ NaN ຫຼື Out of bounds
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return monthYear;

  return `${monthsLao[monthIndex]} ${year}`;
};

// จัดการสีตามความสำเร็จ
const getRateColor = (rate: number) => {
  if (rate >= 80) return 'text-emerald-600';
  if (rate >= 50) return 'text-orange-500';
  return 'text-red-500';
};
const getBarColor = (rate: number) => {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 50) return 'bg-orange-400';
  return 'bg-red-500';
};
</script>
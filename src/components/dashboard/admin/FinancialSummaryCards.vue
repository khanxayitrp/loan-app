<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow relative overflow-hidden">
      <div class="absolute -right-4 -top-4 opacity-5"><span class="icon-[tabler--businessplan] size-32"></span></div>
      <div class="flex justify-between items-start relative z-10">
        <div>
          <p class="text-sm font-semibold text-slate-500 mb-1">ຍອດປ່ອຍກູ້ (Disbursed)</p>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatCurrency(financials?.totalDisbursed) }}</h3>
        </div>
        <div class="p-3 bg-blue-100 rounded-lg text-blue-600"><span class="icon-[tabler--businessplan] size-6"></span></div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-shadow relative overflow-hidden">
      <div class="absolute -right-4 -top-4 opacity-5"><span class="icon-[tabler--cash] size-32"></span></div>
      <div class="flex justify-between items-start relative z-10">
        <div>
          <p class="text-sm font-semibold text-slate-500 mb-1">ຍອດຮັບຊຳລະ (Repayment)</p>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatCurrency(financials?.totalRepayment) }}</h3>
        </div>
        <div class="p-3 bg-emerald-100 rounded-lg text-emerald-600"><span class="icon-[tabler--cash] size-6"></span></div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow relative overflow-hidden">
      <div class="absolute -right-4 -top-4 opacity-5"><span class="icon-[tabler--wallet] size-32"></span></div>
      <div class="flex justify-between items-start relative z-10">
        <div>
          <p class="text-sm font-semibold text-slate-500 mb-1">ຍອດໜີ້ຄົງຄ້າງ (Outstanding)</p>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatCurrency(financials?.totalOutstanding) }}</h3>
        </div>
        <div class="p-3 bg-purple-100 rounded-lg text-purple-600"><span class="icon-[tabler--wallet] size-6"></span></div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow relative overflow-hidden">
      <div class="absolute -right-4 -top-4 opacity-5"><span class="icon-[tabler--trending-down] size-32"></span></div>
      <div class="flex justify-between items-start relative z-10">
        <div>
          <p class="text-sm font-semibold text-slate-500 mb-1">ໜີ້ເສຍ / ຄ້າງຊຳລະ (NPL)</p>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatCurrency(financials?.totalOverdue) }}</h3>
          <p class="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
            <span class="icon-[tabler--alert-circle] size-3"></span> ອັດຕາໜີ້ເສຍ: {{ financials?.nplRatio || '0.00' }}%
          </p>
        </div>
        <div class="p-3 bg-red-100 rounded-lg text-red-600"><span class="icon-[tabler--trending-down] size-6"></span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

const store = useAdminDashboardStore()
const { financials } = storeToRefs(store) // 🌟 บังคับให้เป็น Reactive เสมอ

const formatCurrency = (value: number | string | undefined | null) => {
  const numValue = Number(value)
  if (!numValue || isNaN(numValue)) return '0 ₭'
  return new Intl.NumberFormat('lo-LA').format(numValue) + ' ₭'
}
</script>
<template>
  <div class="min-h-screen flex flex-col bg-slate-100 font-lao text-slate-800">
    <DashboardHeader />

    <main class="max-w-7xl mx-auto p-6 w-full space-y-8 relative">
      <div v-if="store.isLoading"
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl">
        <span class="loading loading-spinner loading-lg text-sky-500"></span>
      </div>

      <!-- 1. Operational Metrics (ຕົວຊີ້ວັດການປະຕິບັດງານເດີມ) -->
      <DashboardMetrics />

      <!-- 🌟 2. Financial Metrics (ຕົວຊີ້ວັດທາງການເງິນ) -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-blue-100 rounded-lg text-blue-600 text-sm">💰</span>
            ພາບລວມການເງິນ ແລະ ພອດສິນເຊື່ອ (Financial Overview)
          </h3>
        </div>
        <FinancialSummaryCards />
      </section>

      <!-- 🌟 3. Risk & Efficiency (ຄວາມສ່ຽງ ແລະ ປະສິດທິພາບ) -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Portfolio Health -->
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-red-500">
          <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-red-100 rounded-lg text-red-600 text-sm">🛡️</span>
            ຄຸນນະພາບພອດສິນເຊື່ອ (Portfolio Health & Aging)
          </h3>
          <PortfolioHealthChart />
        </div>

        <!-- Approval Funnel -->
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-blue-500">
          <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-blue-100 rounded-lg text-blue-600 text-sm">🎯</span>
            ປະສິດທິພາບການອະນຸມັດ (Approval Funnel)
          </h3>
          <ApprovalFunnel />
        </div>
      </section>

      <!-- 4. Analytical Charts (ກຣາຟວິເຄາະສິນຄ້າ ແລະ ລູກຄ້າ) -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl">
          <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-sky-100 rounded-lg text-sky-600 text-sm">📊</span>
            Top 10 ສິນຄ້າທີ່ມີການຂໍສິນເຊື່ອສູງສຸດ
          </h3>
          <TopProductsChart />
          <p class="mt-6 text-sm text-slate-500 leading-relaxed italic">
            ຂໍ້ມູນສະແດງການຈັດລຳດັບປະເພດສິນຄ້າທີ່ມີຄວາມຕ້ອງການສູງສຸດໃນລະບົບ ໂດຍອີງຕາມປະຫວັດການຂໍສິນເຊື່ອທັງໝົດ.
          </p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col">
          <h3 class="text-xl font-bold mb-6 text-slate-800">ອັດຕາການຂໍສິນເຊື່ອຊໍ້າ</h3>
          <RepeatRateChart />
        </div>
      </section>

      <!-- 5. Top Performance & Tables -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-sky-600">
          <h3 class="text-xl font-bold mb-6 text-slate-800">Top 5 ສິນຄ້າ (ເດືອນນີ້)</h3>
          <MonthlyTopChart />
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-orange-500">
          <h3 class="text-xl font-bold mb-6 text-slate-800">Top 5 ລູກຄ້າທີ່ມີການຂໍສິນເຊື່ອສູງສຸດ</h3>
          <TopCustomersTable />
        </div>
      </section>

      <!-- 6. Monthly Conversion Table -->
      <section class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-emerald-500">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-emerald-100 rounded-lg text-emerald-600 text-sm">📈</span>
            ອັດຕາຄວາມສຳເລັດການປ່ອຍສິນເຊື່ອ (Monthly Conversion Rate)
          </h3>
        </div>
        <MonthlyLoanComparisonTable />
        <p class="mt-4 text-sm text-slate-500 italic">
          * ຕາຕະລາງປຽບທຽບຍອດການຂໍສິນເຊື່ອທັງໝົດ ກັບ ຍອດທີ່ສາມາດປ່ອຍສິນເຊື່ອໄດ້ສຳເລັດ (Disbursed) ໃນແຕ່ລະເດືອນ (ຍ້ອນຫຼັງ 6 ເດືອນ).
        </p>
      </section>
    </main>
    <DashboardFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

import DashboardHeader from '@/components/dashboard/admin/DashboardHeader.vue'
import DashboardMetrics from '@/components/dashboard/admin/DashboardMetrics.vue'
import FinancialSummaryCards from '@/components/dashboard/admin/FinancialSummaryCards.vue'

// 🌟 Import 2 Components ใหม่เข้ามาตรงนี้ 🌟
import PortfolioHealthChart from '@/components/dashboard/admin/PortfolioHealthChart.vue'
import ApprovalFunnel from '@/components/dashboard/admin/ApprovalFunnel.vue'

import TopProductsChart from '@/components/dashboard/admin/TopProductsChart.vue'
import RepeatRateChart from '@/components/dashboard/admin/RepeatRateChart.vue'
import MonthlyTopChart from '@/components/dashboard/admin/MonthlyTopChart.vue'
import TopCustomersTable from '@/components/dashboard/admin/TopCustomersTable.vue'
import MonthlyLoanComparisonTable from '@/components/dashboard/admin/MonthlyLoanComparisonTable.vue'
import DashboardFooter from '@/components/dashboard/admin/DashboardFooter.vue'

const store = useAdminDashboardStore()

onMounted(() => {
  store.fetchSummary() 
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700&display=swap');
.font-lao { font-family: 'Noto Sans Lao', sans-serif; }
</style>
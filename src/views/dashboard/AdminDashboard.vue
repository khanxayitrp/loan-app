<template>
  <div class="min-h-screen flex flex-col bg-slate-100 font-lao text-slate-800">
    <DashboardHeader />

    <main class="max-w-7xl mx-auto p-6 w-full space-y-8">

      <DashboardMetrics />

      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl">
          <h3 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <span class="mr-3 p-2 bg-sky-100 rounded-lg text-sky-600 text-sm">📊</span>
            Top 10 ປະເພດສິນຄ້າທີ່ມີການຂໍສິນເຊື່ອ
          </h3>
          <TopProductsChart />
          <p class="mt-6 text-sm text-slate-500 leading-relaxed italic">
            ຂໍ້ມູນສະແດງການຈັດລຳດັບປະເພດສິນຄ້າທີ່ມີຄວາມຕ້ອງການສູງສຸດໃນລະບົບ ໂດຍສິນຄ້າປະເພດ "ລົດຈັກ" ແລະ "ໂທລະສັບ" ຍັງຄົງເປັນອັນດັບຕົ້ນໆ.
          </p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col">
          <h3 class="text-xl font-bold mb-6 text-slate-800">ອັດຕາການຂໍສິນເຊື່ອຊໍ້າ</h3>
          <RepeatRateChart />
          <div class="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
            <span class="text-orange-600 font-bold text-2xl">38%</span>
            <p class="text-xs text-orange-800">ລູກຄ້າກັບມາໃຊ້ບໍລິການຊໍ້າພາຍໃນ 1 ປີ</p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-sky-600">
          <h3 class="text-xl font-bold mb-6 text-slate-800">Top 5 ປະເພດສິນຄ້າ (ໃນ 1 ເດືອນ)</h3>
          <MonthlyTopChart />
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-orange-500">
          <h3 class="text-xl font-bold mb-6 text-slate-800">Top 5 ລູກຄ້າທີ່ມີການຂໍສິນເຊື່ອສູງສຸດ</h3>
          <TopCustomersTable />
        </div>

      </section>
    </main>

    <DashboardFooter />
  </div>
</template>

<script setup lang="ts">
// 🟢 Import Component ຍ່ອຍທັງໝົດຈາກໂຟນເດີ components/dashboard/
import DashboardHeader from '@/components/dashboard/admin/DashboardHeader.vue'
import DashboardMetrics from '@/components/dashboard/admin/DashboardMetrics.vue'
import TopProductsChart from '@/components/dashboard/admin/TopProductsChart.vue'
import RepeatRateChart from '@/components/dashboard/admin/RepeatRateChart.vue'
import MonthlyTopChart from '@/components/dashboard/admin/MonthlyTopChart.vue'
import TopCustomersTable from '@/components/dashboard/admin/TopCustomersTable.vue'
import DashboardFooter from '@/components/dashboard/admin/DashboardFooter.vue'
</script>

<style scoped>
/* 🟢 ນຳເຂົ້າ Font Noto Sans Lao ສະເພາະໜ້ານີ້ (ຖ້າໃນ App ຫຼັກຍັງບໍ່ມີ) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700&display=swap');

.font-lao {
  font-family: 'Noto Sans Lao', sans-serif;
}
</style>

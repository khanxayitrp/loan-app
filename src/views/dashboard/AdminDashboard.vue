<template>
  <div class="min-h-screen flex flex-col bg-slate-100 font-lao text-slate-800">
    <DashboardHeader />

    <main class="max-w-7xl mx-auto p-6 w-full space-y-8 relative">
      <!-- Loading Overlay -->
      <div v-if="store.isLoading"
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl">
        <span class="loading loading-spinner loading-lg text-sky-500"></span>
      </div>

      <DashboardMetrics />

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
    </main>
    <DashboardFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminDashboardStore } from '@/stores/admin_dashboard'

import DashboardHeader from '@/components/dashboard/admin/DashboardHeader.vue'
import DashboardMetrics from '@/components/dashboard/admin/DashboardMetrics.vue'
import TopProductsChart from '@/components/dashboard/admin/TopProductsChart.vue'
import RepeatRateChart from '@/components/dashboard/admin/RepeatRateChart.vue'
import MonthlyTopChart from '@/components/dashboard/admin/MonthlyTopChart.vue'
import TopCustomersTable from '@/components/dashboard/admin/TopCustomersTable.vue'
import DashboardFooter from '@/components/dashboard/admin/DashboardFooter.vue'

const store = useAdminDashboardStore()

onMounted(() => {
  store.fetchSummary() // ดึงข้อมูลเมื่อเปิดหน้าจอ
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700&display=swap');

.font-lao {
  font-family: 'Noto Sans Lao', sans-serif;
}
</style>

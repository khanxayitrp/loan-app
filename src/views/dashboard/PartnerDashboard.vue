<template>
  <div class="min-h-screen flex flex-col bg-slate-100 font-lao text-slate-800">

    <DashboardHeader />

    <main class="max-w-7xl mx-auto p-6 w-full space-y-8 flex-grow">

      <PartnerProductMetrics />

      <PartnerTop10Products />

      <PartnerMonthlyTopProducts />

    </main>

    <DashboardFooter />

  </div>
</template>

<script setup lang="ts">// 🟢 Import ພາກສ່ວນ Header ແລະ Footer (ດຶງມາຈາກໂຟນເດີ dashboard ຫຼັກ)
import DashboardHeader from '@/components/dashboard/admin/DashboardHeader.vue'
import DashboardFooter from '@/components/dashboard/admin/DashboardFooter.vue'

// 🟢 Import ພາກສ່ວນເນື້ອຫາຂອງ Partner (ດຶງມາຈາກໂຟນເດີ partner)
import PartnerProductMetrics from '@/components/dashboard/partner/PartnerProductMetrics.vue'
import PartnerTop10Products from '@/components/dashboard/partner/PartnerTop10Products.vue'
import PartnerMonthlyTopProducts from '@/components/dashboard/partner/PartnerMonthlyTopProducts.vue'
</script>

<style scoped>
/* ນຳເຂົ້າ Font Noto Sans Lao */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700&display=swap');

.font-lao {
  font-family: 'Noto Sans Lao', sans-serif;
}
</style>

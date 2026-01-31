<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">ຈັດການສິນເຊື່ອ</h1>
    <div class="divider"></div>

    <!-- <AllLoanStatus /> -->
     <!-- RouterView จะ render component ลูกตาม route -->
    <router-view />

  </main>
</template>

<script setup lang="ts">
// import AllLoanStatus from '@/components/loans/status/AllLoanStatusList.vue'
</script>

<style scoped>

</style>

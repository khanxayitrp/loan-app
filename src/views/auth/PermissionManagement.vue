<!-- UserManagement.vue -->
<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">ຈັດການສິດການນຳໃຊ້ລະບົບ</h1>
    <div class="divider"></div>

    <UserPermission />

  </main>
</template>

<script setup lang="ts">
import UserPermission from '@/components/users/UserPermission.vue'
</script>

<style scoped>

</style>

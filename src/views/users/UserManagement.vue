<!-- UserManagement.vue -->
<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">ຈັດການຜູ້ໃຊ້</h1>
    <div class="divider"></div>

    <ListUsers />

  </main>
</template>

<script setup lang="ts">
import ListUsers from '@/components/users/ListUsers.vue'
</script>


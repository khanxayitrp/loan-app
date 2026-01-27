<!-- UserManagement.vue -->
<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">ຈັດການຜູ້ໃຊ້</h1>
    <div class="divider"></div>



    <!-- แก้ชื่อ component ให้ตรงกัน: ListUsers (ตัว L ใหญ่) -->
    <ListUsers />

    <!-- หรือถ้าอยากใช้ชื่ออื่นใน template ก็ได้ แต่ต้อง alias -->
    <!-- <list-user-component /> -->
  </main>
</template>

<script setup lang="ts">
// แก้ import ให้ตรงกับชื่อไฟล์จริง (ListUsers.vue → ListUsers)
import ListUsers from '@/components/users/ListUsers.vue'


</script>

<style scoped>
/* สไตล์เฉพาะหน้า UserManagement */
</style>

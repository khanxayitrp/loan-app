<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    <div class="divider"></div>

    <!-- เนื้อหา dashboard สำหรับ staff -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card สำหรับ loans -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">ຈັດການກູ້ຢືມ</h2>
          <p>ເບິ່ງ ແລະ ຈັດການໃບສະຫມັກກູ້ຢືມ</p>
          <div class="card-actions justify-end">
            <router-link to="/dashboard/loans" class="btn btn-primary">ເຂົ້າເບິ່ງ</router-link>
          </div>
        </div>
      </div>

      <!-- Card อื่นๆ ตาม permission -->
      <div v-if="can('user_manage')" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">ຈັດການຜູ້ໃຊ້</h2>
          <p>ເບິ່ງ ແລະ ຈັດການຜູ້ໃຊ້ລະບົບ</p>
          <div class="card-actions justify-end">
            <router-link to="/users" class="btn btn-primary">ເຂົ້າເບິ່ງ</router-link>
          </div>
        </div>
      </div>

      <!-- เพิ่ม card อื่นๆ ตามต้องการ -->
    </div>
  </main>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { can } = usePermission()
</script>
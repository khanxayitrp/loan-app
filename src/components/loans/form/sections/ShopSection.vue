<template>
  <section class="form-section">
    <h3 class="section-title">IV. ຂໍ້ມູນຮ້ານຄ້າຕົວແທນ</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ຊື່ຮ້ານຄ້າຕົວແທນ:</span></label>
        <input v-model="data.name" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ສາຂາ:</span></label>
        <input v-model="data.branch" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
      <div class="form-control">
        <label class="label"><span class="label-text font-bold">ລະຫັດຮ້ານຄ້າ:</span></label>
        <input v-model="data.code" type="text" :readonly="!isEditing" class="input input-sm input-bordered w-full" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ data: any, isEditing: boolean }>()
</script>
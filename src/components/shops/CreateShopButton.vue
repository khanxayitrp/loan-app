<!-- src/components/shops/CreateShopButton.vue -->
<template>
  <div class="text-center py-12">
    <div class="flex justify-center mb-6">
      <div class="p-4 bg-primary/10 rounded-full">
        <span class="icon-[tabler--building-store] size-12 text-primary"></span>
      </div>
    </div>
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">ສ້າງຮ້ານໃໝ່</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
      ກົດປຸ່ມດ້ານລຸ່ມເພື່ອເລີ່ມຕົ້ນການສ້າງຂໍ້ມູນຮ້ານໃໝ່
    </p>
    <button
      class="btn btn-gradient btn-primary px-8 py-3 text-lg"
      @click="$emit('create')"
    >
      <span class="icon-[tabler--plus] size-5 mr-2"></span>
      ສ້າງຮ້ານໃໝ່
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  create: []
}>()
</script>

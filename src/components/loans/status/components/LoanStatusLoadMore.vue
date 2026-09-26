<template>
  <div class="flex flex-col items-center mt-6 mb-4 border-t pt-6 border-dashed dark:border-gray-700">
    <button
      v-if="canLoadMore"
      class="btn btn-primary btn-outline w-full max-w-xs"
      @click="emit('loadMore')"
      :disabled="isLoadingMore"
    >
      <span v-if="isLoadingMore" class="loading loading-spinner loading-sm"></span>
      <span v-else class="icon-[tabler--arrow-down-circle] size-5"></span>
      ໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນເພີ່ມເຕີມ
    </button>

    <p v-else class="text-sm text-gray-400 italic">
      <template v-if="totalRecords !== undefined">
        (ດຶງຂໍ້ມູນມາຄົບທັງໝົດ {{ totalRecords }} ລາຍການແລ້ວ)
      </template>
      <template v-else>
        (ດຶງຂໍ້ມູນມາຄົບທັງໝົດແລ້ວ)
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canLoadMore: boolean;
  isLoadingMore: boolean;
  totalRecords?: number;
}>();

const emit = defineEmits<{
  (e: 'loadMore'): void;
}>();
</script>

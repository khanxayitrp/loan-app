<template>
  <div v-if="totalFiltered > 0" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
    <div class="text-gray-500 dark:text-gray-400">
      ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທີ່ຄົ້ນຫາພົບ {{ totalFiltered }} ລາຍການ
    </div>

    <div class="flex items-center gap-2">
      <select :value="pageSize" @change="onPageSizeChange" class="select select-sm select-bordered">
        <option v-for="option in pageOptions" :key="option" :value="option">
          {{ option }} ຕໍ່ໜ້າ
        </option>
      </select>

      <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="emit('previousPage')">
        ກ່ອນໜ້າ
      </button>
      <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
      <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="emit('nextPage')">
        ຖັດໄປ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    currentPage: number;
    pageSize: number;
    totalFiltered: number;
    pageOptions?: number[];
  }>(),
  {
    pageOptions: () => [10, 25, 50, 100]
  }
);

const emit = defineEmits<{
  (e: 'update:pageSize', value: number): void;
  (e: 'previousPage'): void;
  (e: 'nextPage'): void;
}>();

const totalPages = computed(() => Math.ceil(props.totalFiltered / props.pageSize) || 1);
const startIndex = computed(() => (props.totalFiltered === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1));
const endIndex = computed(() => Math.min(props.currentPage * props.pageSize, props.totalFiltered));
const hasPreviousPage = computed(() => props.currentPage > 1);
const hasNextPage = computed(() => props.currentPage < totalPages.value);

const onPageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:pageSize', Number(target.value));
};
</script>

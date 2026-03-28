<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="font-bold text-lg mb-4">{{ product?.is_active ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}</h3>
        <p class="py-4 text-gray-700 dark:text-gray-300">
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ {{ product?.is_active ? 'ປິດ' : 'ເປີດ' }} ການຂາຍ "{{ product?.product_name }}" ?
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-soft btn-secondary" @click="close">ຍົກເລີກ</button>
          <button class="btn" :class="product?.is_active ? 'btn-error' : 'btn-success'" @click="confirm">
            {{ product?.is_active ? 'ປິດການຂາຍ' : 'ເປີດການຂາຍ' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { Product } from '@/types/product';

const props = defineProps<{ isOpen: boolean; product: Product | null; }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'confirm'): void; }>();

const close = () => emit('close');
const confirm = () => emit('confirm');
</script>

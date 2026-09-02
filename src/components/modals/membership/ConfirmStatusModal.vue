<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-6 text-center">
          <!-- 🟢 Icon (เปลี่ยนสีตามสถานะ) -->
          <div class="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5" :class="theme.bgClass">
            <span :class="[theme.iconClass, 'size-10']"></span>
          </div>

          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">ຢືນຢັນການດຳເນີນການ</h3>

          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            ທ່ານຕ້ອງການ <span class="font-bold" :class="theme.textClass">{{ theme.actionName }}</span>
            ສະມາຊິກຈຳນວນ <span class="font-bold text-gray-900 dark:text-white">{{ count }}</span> ລາຍການແທ້ບໍ່?
          </p>
        </div>

        <!-- 🟢 Footer Buttons -->
        <div class="flex border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button @click="$emit('close')" :disabled="isLoading"
            class="flex-1 py-4 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            ຍົກເລີກ
          </button>
          <div class="w-[1px] bg-gray-100 dark:bg-gray-700"></div>
          <button @click="$emit('confirm')" :disabled="isLoading"
            class="flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2"
            :class="theme.btnClass">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            <span v-else>ຢືນຢັນ</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  count: number;
  status: 'verified' | 'rejected' | 'expired' | '';
  isLoading?: boolean;
}>();

defineEmits(['close', 'confirm']);

// 🟢 Dynamic Theme ຕາມສະຖານະ
const theme = computed(() => {
  switch (props.status) {
    case 'verified':
      return {
        bgClass: 'bg-emerald-100 text-emerald-600',
        iconClass: 'icon-[tabler--check]',
        textClass: 'text-emerald-600',
        btnClass: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        actionName: 'ຢືນຢັນ'
      };
    case 'rejected':
      return {
        bgClass: 'bg-red-100 text-red-600',
        iconClass: 'icon-[tabler--x]',
        textClass: 'text-red-600',
        btnClass: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        actionName: 'ປະຕິເສດ'
      };
    case 'expired':
      return {
        bgClass: 'bg-orange-100 text-orange-600',
        iconClass: 'icon-[tabler--clock-off]',
        textClass: 'text-orange-600',
        btnClass: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
        actionName: 'ກຳນົດເປັນໝົດອາຍຸ'
      };
    default:
      return {
        bgClass: 'bg-gray-100 text-gray-600',
        iconClass: 'icon-[tabler--alert-circle]',
        textClass: 'text-gray-600',
        btnClass: 'text-gray-600 hover:bg-gray-200',
        actionName: 'ດຳເນີນການ'
      };
  }
});
</script>

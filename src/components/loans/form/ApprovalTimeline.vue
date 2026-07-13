<template>
  <div class="border-t pt-6 mt-4">
    <label class="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
      <span class="icon-[tabler--history] size-5 text-primary"></span> ປະຫວັດການກວດກາ ແລະ ຄວາມຄິດເຫັນ
    </label>

    <div class="space-y-4">
      <div v-for="(log, index) in logs" :key="index" class="flex gap-4">

        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
            {{ index + 1 }}
          </div>
          <div v-if="index !== logs.length - 1" class="w-px h-full bg-gray-200 dark:bg-gray-700 my-1"></div>
        </div>

        <div class="flex-1 pb-4">
          <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">

            <div class="flex justify-between items-start mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div class="flex items-center flex-wrap gap-1">
                <span class="text-xs text-gray-500">ດຳເນີນການໂດຍ:</span>
                <span class="font-bold text-gray-800 dark:text-white mx-1">
                  {{ log.performed_by_user?.full_name || log.performed_by_user?.username || 'ລະບົບ' }}
                </span>
                <span class="badge badge-sm badge-ghost text-xs border-gray-300 dark:border-gray-600">
                  {{ formatRoleName(log.performed_by_user?.staff_level) || 'System' }}
                </span>
              </div>

              <span class="text-xs text-gray-500 whitespace-nowrap mt-1 sm:mt-0">
                {{ formatDateTime(log.performed_at) }}
              </span>
            </div>

            <div class="flex items-center gap-2 mb-2 mt-2">
              <span class="text-xs font-medium text-gray-500">ປ່ຽນສະຖານະເປັນ:</span>
              <span class="badge badge-sm border-0 text-white shadow-sm" :class="getStatusBadgeClass(log.status_to)">
                {{ getStatusText(log.status_to) }}
              </span>
            </div>

            <div v-if="log.remarks" class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 relative mt-3">
              <span class="icon-[tabler--quote] absolute -top-2 -left-2 text-gray-300 dark:text-gray-600 size-5 bg-white dark:bg-gray-800 rounded-full"></span>
              {{ log.remarks }}
            </div>
            <div v-else class="text-xs text-gray-400 italic mt-2">
              * ບໍ່ມີຄວາມຄິດເຫັນເພີ່ມເຕີມ
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 🟢 Import ຟັງຊັນຈັດຮູບແບບ (ຢ່າລືມເພີ່ມ formatDateTime ໃນ utils/formatters.ts ກ່ອນແລ້ວ)
import { formatDateTime, getStatusBadgeClass, getStatusText } from '@/utils/formatters';

defineProps<{
  logs: any[];
}>();

// ຟັງຊັນແປງຊື່ຕຳແໜ່ງເປັນພາສາລາວເພື່ອໃຫ້ອ່ານງ່າຍຂຶ້ນ
const formatRoleName = (role: string) => {
  const roles: Record<string, string> = {
    'credit_officer': 'ພະນັກງານສິນເຊື່ອ',
    'sales': 'ພະນັກງານຂາຍ',
    'credit_manager': 'ຫົວໜ້າສິນເຊື່ອ',
    'approver': 'ຜູ້ອະນຸມັດ',
    'deputy_director': 'ຮອງຜູ້ອຳນວຍການ',
    'director': 'ຜູ້ອຳນວຍການ',
    'admin': 'ແອັດມິນ'
  };
  return roles[role] || role;
};
</script>

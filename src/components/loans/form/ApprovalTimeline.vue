<template>
  <div class="border-t pt-6 mt-4">
    <label class="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
      <span class="icon-[tabler--history] size-5 text-primary"></span> ປະຫວັດການກວດກາ ແລະ ຄວາມຄິດເຫັນ
    </label>

    <div class="space-y-4">
      <div v-for="(log, index) in logs" :key="index" class="flex gap-4">

        <!-- Timeline Line & Number -->
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
            {{ index + 1 }}
          </div>
          <div v-if="index !== logs.length - 1" class="w-px h-full bg-gray-200 dark:bg-gray-700 my-1"></div>
        </div>

        <!-- Log Content -->
        <div class="flex-1 pb-4">
          <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">

            <!-- Header -->
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

            <!-- 🌟 ส่วนที่เพิ่ม: กล่องอ้างอิงข้อความ (Quote Preview) 🌟 -->
            <div v-if="log.reply_to_id" class="mb-3 p-2.5 bg-indigo-50/70 dark:bg-indigo-900/20 border-l-4 border-indigo-400 rounded-r-lg text-sm">
              <div class="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                <span class="icon-[tabler--quote] size-3"></span> ຕອບກັບຂໍ້ຄວາມ:
              </div>
              <div class="italic text-gray-600 dark:text-gray-400 line-clamp-2 text-xs">
                "{{ getOriginalMessage(log.reply_to_id) }}"
              </div>
            </div>

            <!-- Status Change (ซ่อนถ้าเป็นแค่ Comment เฉยๆ) -->
            <div v-if="log.status_to" class="flex items-center gap-2 mb-2 mt-2">
              <span class="text-xs font-medium text-gray-500">ປ່ຽນສະຖານະເປັນ:</span>
              <span class="badge badge-sm border-0 text-white shadow-sm" :class="getStatusBadgeClass(log.status_to)">
                {{ getStatusText(log.status_to) }}
              </span>
            </div>
            <!-- หากไม่มีการเปลี่ยนสถานะ แต่เป็นการคอมเมนต์ -->
            <div v-else-if="log.action === 'commented'" class="flex items-center gap-2 mb-2 mt-2">
              <span class="badge badge-sm bg-indigo-100 text-indigo-700 border-0 shadow-sm font-medium">
                <span class="icon-[tabler--message-circle] size-3 mr-1"></span> ຄວາມຄິດເຫັນເພີ່ມເຕີມ
              </span>
            </div>

            <!-- Remarks -->
            <div v-if="log.remarks" class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 relative mt-3">
              <span class="icon-[tabler--quote] absolute -top-2 -left-2 text-gray-300 dark:text-gray-600 size-5 bg-white dark:bg-gray-800 rounded-full"></span>
              {{ log.remarks }}
            </div>
            <div v-else class="text-xs text-gray-400 italic mt-2">
              * ບໍ່ມີຄວາມຄິດເຫັນເພີ່ມເຕີມ
            </div>

            <!-- 🌟 ส่วนที่เพิ่ม: ปุ่มตอบกลับ (Reply Button) 🌟 -->
            <div class="mt-3 flex justify-end">
              <button 
                @click="$emit('reply', log)" 
                class="btn btn-xs btn-ghost text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                <span class="icon-[tabler--message-forward] size-4 mr-1"></span> ຕອບກັບ
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime, getStatusBadgeClass, getStatusText } from '@/utils/formatters';

const props = defineProps<{
  logs: any[];
}>();

// 🌟 ประกาศ Event ที่จะส่งให้ Component แม่
const emit = defineEmits(['reply']);

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

// 🌟 ฟังก์ชันหาข้อความต้นฉบับจาก ID 
const getOriginalMessage = (replyToId: number) => {
  const originalLog = props.logs.find((l: any) => l.id === replyToId);
  if (!originalLog) return 'ຂໍ້ຄວາມຖືກລຶບ ຫຼື ບໍ່ພົບຂໍ້ມູນ';
  
  // ถ้าคอมเมนต์ต้นทางไม่มี remarks ให้เอาชื่อ Action มาโชว์แทน
  return originalLog.remarks || `[ການອັບເດດສະຖານະ: ${getStatusText(originalLog.status_to) || originalLog.action}]`;
};
</script>
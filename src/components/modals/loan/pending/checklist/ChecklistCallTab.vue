<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
      <div>
        <h4 class="font-bold text-blue-800 dark:text-blue-300">ບັນທຶກການໂທຢືນຢັນ</h4>
        <p class="text-sm text-blue-600">ບັນທຶກການໂທຫາບຸກຄົນອ້າງອີງ, ບ່ອນເຮັດວຽກ ຫຼື ຜູ້ຄ້ຳປະກັນ</p>
      </div>
      <button v-if="canEdit" class="btn btn-primary btn-sm" @click="$emit('addCall')">
        <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມປະຫວັດການໂທ
      </button>
    </div>

    <div v-for="(call, index) in formCalls" :key="index" class="border rounded-lg p-4 relative bg-white dark:bg-base-100 shadow-sm">
      <button v-if="canEdit" class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error" @click="$emit('removeCall', index)">
        <span class="icon-[tabler--trash] size-4"></span>
      </button>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເປົ້າໝາຍການໂທ</span></label>
          <select v-model="call.call_target" class="select select-bordered select-sm" :disabled="!canEdit">
            <option value="workplace">ບ່ອນເຮັດວຽກ (HR/ໝູ່ຮ່ວມງານ)</option>
            <option value="home">ທາງບ້ານ / ຍາດພີ່ນ້ອງ</option>
            <option value="guarantor">ຜູ້ຄ້ຳປະກັນ</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບສາຍ</span></label>
          <input v-model="call.contact_name" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ເບີໂທຕິດຕໍ່</span></label>
          <input v-model="call.contact_phone" type="text" class="input input-bordered input-sm" :disabled="!canEdit" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ຄວາມສຳພັນ / ຕຳແໜ່ງ</span></label>
          <input v-model="call.relationship" type="text" placeholder="ເຊັ່ນ: ພໍ່, ຫົວໜ້າງານ" class="input input-bordered input-sm" :disabled="!canEdit" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ຂໍ້ມູນຕົງກັບທີ່ແຈ້ງບໍ?</span></label>
          <select v-model="call.is_info_matching" class="select select-bordered select-sm" :disabled="!canEdit">
            <option :value="true">ຕົງກັນ (Yes)</option>
            <option :value="false">ບໍ່ຕົງກັນ (No)</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ສະຖານະການໂທ</span></label>
          <select v-model="call.call_status" class="select select-bordered select-sm" :disabled="!canEdit">
            <option value="completed">ສຳເລັດ (ໂທຕິດ ແລະ ຄຸຍແລ້ວ)</option>
            <option value="no_answer">ບໍ່ຮັບສາຍ (No Answer)</option>
            <option value="pending_callback">ລໍຖ້າໂທກັບ (Pending Callback)</option>
          </select>
        </div>
        <div class="form-control md:col-span-3">
          <label class="label"><span class="label-text font-medium">ໝາຍເຫດ / ບົດສົນທະນາຫຍໍ້</span></label>
          <input v-model="call.remark" type="text" class="input input-bordered input-sm w-full" :disabled="!canEdit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  formCalls: Record<string, unknown>[];
  canEdit: boolean;
}>();

defineEmits<{
  (e: 'addCall'): void;
  (e: 'removeCall', index: number): void;
}>();
</script>

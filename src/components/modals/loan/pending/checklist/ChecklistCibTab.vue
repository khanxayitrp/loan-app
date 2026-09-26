<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex justify-between items-center shadow-sm">
      <div>
        <h4 class="font-bold text-indigo-800 dark:text-indigo-300">ປະຫວັດສິນເຊື່ອ (CIB History)</h4>
        <p class="text-sm text-indigo-600">ບັນທຶກປະຫວັດການກູ້ຢືມແຕ່ລະບັນຊີຈາກໃບລາຍງານ CIB</p>
      </div>
      <div class="flex gap-2">
        <button v-if="canEdit" class="btn btn-success btn-sm" @click="triggerFileInput">
          <span v-if="isImporting" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--file-upload] size-4"></span> ນຳເຂົ້າ PDF
        </button>
        <button v-if="canEdit" class="btn btn-primary btn-sm" @click="$emit('addCibDetail')">
          <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມບັນຊີ
        </button>
      </div>
    </div>

    <input type="file" ref="fileInputRef" accept=".pdf" class="hidden" @change="$emit('handleFileUpload', $event)" />

    <div v-for="(detail, index) in formCIBDetails" :key="index" class="border rounded-lg p-6 relative bg-white dark:bg-base-100 shadow-sm">
      <button v-if="canEdit" class="btn btn-ghost btn-xs btn-circle absolute top-2 right-2 text-error" @click="$emit('removeCibDetail', index)">
        <span class="icon-[tabler--trash] size-5"></span>
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">ສະຖາບັນການເງິນ *</span>
            <span v-if="detail.institution_name && (String(detail.institution_name).toLowerCase().includes('insee') || String(detail.institution_name).includes('ອິນຊີ'))"
                  class="badge badge-xs"
                  :class="checklistStore.incomeData.internal_active_installments > 0 ? 'badge-warning' : 'badge-info'">
              {{ checklistStore.incomeData.internal_active_installments > 0 ? 'ໜີ້ພາຍໃນ (ຈະບໍ່ຄຳນວນຊ້ຳ)' : 'ໜີ້ພາຍໃນເກົ່າ (ລວມໃນ CIB)' }}
            </span>
          </label>
          <input v-model="detail.institution_name" type="text" placeholder="ເຊັ່ນ: BCEL, JDB, INSEE..." class="input input-bordered w-full" :disabled="!canEdit" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold">ປະເພດສິນເຊື່ອ</span></label>
          <input v-model="detail.account_type" type="text" placeholder="ເຊັ່ນ: ບັດເຄຣດິດ, ສິນເຊື່ອລົດຈັກ" class="input input-bordered w-full" :disabled="!canEdit" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold text-primary">ສະຖານະການຊຳລະ *</span></label>
          <select v-model="detail.history_status" class="select select-bordered font-medium" :class="getCibStatusColor(String(detail.history_status))" :disabled="!canEdit">
            <option value="no_delay">ດີຫຼາຍ: ບໍ່ມີຊັກຊ້າ (20 ຄະແນນ)</option>
            <option value="delay_30_days">ດີ: ຊັກຊ້າບໍ່ເກີນ 30 ວັນ (15 ຄະແນນ)</option>
            <option value="delay_60_days">ປານກາງ: ຊັກຊ້າ 30-60 ວັນ (10 ຄະແນນ)</option>
            <option value="delay_90_days">ສ່ຽງສູງ: ຊັກຊ້າ 60-90 ວັນ (5 ຄະແນນ)</option>
            <option value="blacklist">ບໍ່ດີ: ຊັກຊ້າ 90 ວັນ+ / Blacklist (0 ຄະແນນ)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold text-gray-500">ວົງເງິນອະນຸມັດ</span></label>
            <input :value="formatPrice(Number(detail.approved_amount) || 0)" type="text"
              @focus="handleNumberFocus($event, Number(detail.approved_amount) || 0)"
              @input="updateCibNumberField(index, 'approved_amount', $event)"
              @blur="handleNumberBlur($event, Number(detail.approved_amount) || 0)"
              class="input input-bordered w-full text-right" :disabled="!canEdit" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold text-error">ຍອດໜີ້ເຫຼືອ (ກີບ)</span></label>
            <input :value="formatPrice(Number(detail.outstanding_balance) || 0)" type="text"
              @focus="handleNumberFocus($event, Number(detail.outstanding_balance) || 0)"
              @input="updateCibNumberField(index, 'outstanding_balance', $event)"
              @blur="handleNumberBlur($event, Number(detail.outstanding_balance) || 0)"
              class="input input-bordered w-full text-right font-bold text-error" :disabled="!canEdit" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="formCIBDetails.length === 0" class="alert alert-warning shadow-sm">
      <span class="icon-[tabler--alert-circle] size-6"></span>
      <span>ຍັງບໍ່ມີຂໍ້ມູນປະຫວັດ CIB. ກະລຸນາກົດປຸ່ມ "ເພີ່ມບັນຊີ" ເພື່ອບັນທຶກຂໍ້ມູນ, ຫຼືລະບຸວ່າບໍ່ເຄີຍມີປະຫວັດ.</span>
    </div>

    <div class="divider"></div>

    <div class="border rounded-lg p-6 bg-white dark:bg-base-100 shadow-sm">
      <h4 class="font-bold text-lg mb-4">ຂໍ້ມູນອື່ນໆ</h4>
      <div class="form-control">
        <label class="cursor-pointer label justify-start gap-4">
          <input type="checkbox" v-model="formCIB.is_existing_customer" class="toggle toggle-primary" :disabled="!canEdit" />
          <span class="font-bold">ເຄີຍເປັນລູກຄ້າເກົ່າຂອງ INSEE ມາກ່ອນບໍ?</span>
        </label>
      </div>

      <div v-if="formCIB.is_existing_customer" class="form-control mt-4">
        <label class="label"><span class="label-text">ສະຖານະໜີ້ເກົ່າຂອງ INSEE</span></label>
        <select v-model="formCIB.existing_customer_status" class="select select-bordered" :disabled="!canEdit">
          <option value="normal">ປົກກະຕິ (ຈ່າຍດີ)</option>
          <option value="late_payment">ຊັກຊ້າບາງງວດ</option>
          <option value="bad_debt">ໜີ້ເສຍ (NPL)</option>
        </select>
      </div>

      <div class="form-control mt-4">
        <label class="label"><span class="label-text">ໝາຍເຫດເພີ່ມເຕີມ</span></label>
        <textarea v-model="formCIB.remark" class="textarea textarea-bordered h-24" placeholder="ລາຍລະອຽດເພີ່ມເຕີມຈາກໃບລາຍງານ CIB..." :disabled="!canEdit"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatPrice } from '@/utils/formatters';
import { useChecklistStore } from '@/stores/checklist';

const props = defineProps<{
  formCIB: Record<string, unknown>;
  formCIBDetails: Record<string, unknown>[];
  canEdit: boolean;
  isImporting: boolean;
}>();

defineEmits<{
  (e: 'handleFileUpload', event: Event): void;
  (e: 'addCibDetail'): void;
  (e: 'removeCibDetail', index: number): void;
}>();

const checklistStore = useChecklistStore();
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const getCibStatusColor = (status: string) => {
  switch (status) {
    case 'no_delay': return 'text-success border-success';
    case 'delay_30_days': return 'text-info border-info';
    case 'delay_60_days': return 'text-warning border-warning';
    case 'delay_90_days': return 'text-orange-500 border-orange-500';
    case 'blacklist': return 'text-error border-error bg-error/10';
    default: return '';
  }
};

const parseNumberStr = (val: string) => {
  if (!val) return 0;
  const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const handleNumberFocus = (e: Event, val: number) => {
  const target = e.target as HTMLInputElement;
  if (target) target.value = val ? String(val) : '';
};

const handleNumberBlur = (e: Event, val: number) => {
  const target = e.target as HTMLInputElement;
  if (target) target.value = formatPrice(val);
};

const updateCibNumberField = (index: number, field: string, e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target && props.formCIBDetails[index]) {
    /* eslint-disable vue/no-mutating-props */
    props.formCIBDetails[index][field] = parseNumberStr(target.value);
    /* eslint-enable vue/no-mutating-props */
  }
};
</script>

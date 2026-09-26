<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- 🟢 ກ່ອງສີຂຽວ: ລາຍຮັບ -->
      <div class="border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10 shadow-sm">
        <h4 class="font-bold text-green-700 mb-4">1. ການປະເມີນລາຍຮັບ (ລາຍຮັບທີ່ພິສູດໄດ້)</h4>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label">
              <span class="label-text">ລາຍຮັບສະເລ່ຍ (ດຶງຈາກ Tab 1) (ກີບ)</span>
            </label>
            <input :value="formatPrice(checklistStore.incomeData.work_salary)" type="text"
              class="input input-bordered text-right font-bold text-green-600 bg-gray-100" readonly />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">ລາຍຮັບອື່ນໆທີ່ຢືນຢັນໄດ້ (ກີບ)</span></label>
            <input :value="formatPrice(checklistStore.incomeData.other_verified_income)" type="text"
              class="input input-bordered text-right font-bold text-green-600 bg-gray-100" readonly />
          </div>
          <div class="divider my-1"></div>
          <div class="flex justify-between items-center font-bold text-lg">
            <span>ລວມລາຍຮັບ (A)</span>
            <span class="text-green-600">{{ formatPrice(checklistStore.totalVerifiedIncome) }}</span>
          </div>
        </div>
      </div>

      <!-- 🟢 ກ່ອງສີແດງ: ພາລະໜີ້ສິນ -->
      <div class="border rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 shadow-sm">
        <h4 class="font-bold text-red-700 mb-4">2. ພາລະໜີ້ສິນ ແລະ ລາຍຈ່າຍ</h4>
        <div class="space-y-3">

          <div class="form-control">
            <label class="label"><span class="label-text">ຄ່າໃຊ້ຈ່າຍດຳລົງຊີວິດປະເມີນ (ກີບ)</span></label>
            <input :value="formatPrice(checklistStore.incomeData.estimated_living_expenses)" type="text"
              @focus="handleNumberFocus($event, checklistStore.incomeData.estimated_living_expenses)"
              @input="updateNumberField('estimated_living_expenses', $event)"
              @blur="handleNumberBlur($event, checklistStore.incomeData.estimated_living_expenses)"
              class="input input-bordered text-right" :disabled="!canEdit" />
          </div>

          <div class="form-control">
            <label class="label justify-between pb-1">
              <span class="label-text">ພາລະໜີ້ສິນເດີມ (ຈາກ CIB) (ກີບ)</span>
              <button v-if="canEdit" @click="$emit('calculateCibDebt')" type="button"
                class="btn btn-xs btn-outline btn-error text-[10px] h-6 min-h-6">
                <span class="icon-[tabler--refresh] size-3"></span> ຄິດໄລ່ຈາກ CIB
              </button>
            </label>
            <input :value="formatPrice(checklistStore.incomeData.existing_debt_payments)" type="text"
              @focus="handleNumberFocus($event, checklistStore.incomeData.existing_debt_payments)"
              @input="updateNumberField('existing_debt_payments', $event)"
              @blur="handleNumberBlur($event, checklistStore.incomeData.existing_debt_payments)"
              class="input input-bordered text-right text-red-500" :disabled="!canEdit" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">ພາລະໜີ້ສິນພາຍໃນ (INSEE) ທີ່ກຳລັງຜ່ອນ (ກີບ)</span>
            </label>
            <input :value="formatPrice(checklistStore.incomeData.internal_active_installments)" type="text"
              class="input input-bordered text-right text-orange-500 font-bold bg-gray-100" readonly />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold text-primary">ຄ່າງວດໃໝ່ທີ່ສະເໜີຂໍ (ກີບ)</span></label>
            <input :value="formatPrice(checklistStore.incomeData.proposed_installment)" type="text"
              @focus="handleNumberFocus($event, checklistStore.incomeData.proposed_installment)"
              @input="updateNumberField('proposed_installment', $event)"
              @blur="handleNumberBlur($event, checklistStore.incomeData.proposed_installment)"
              class="input input-bordered text-right font-bold text-primary border-primary"
              :disabled="!canEdit" />
          </div>

          <div class="divider my-1"></div>
          <div class="flex justify-between items-center font-bold text-lg">
            <span>ລວມພາລະໜີ້ໃໝ່+ເກົ່າ+ພາຍໃນ (B)</span>
            <span class="text-red-500">{{ formatPrice(checklistStore.totalDebtBurden) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border-2 border-primary rounded-lg p-6 text-center bg-white dark:bg-base-100 shadow-sm mt-6">
      <h3 class="text-xl font-bold mb-2">ອັດຕາສ່ວນໜີ້ສິນຕໍ່ລາຍຮັບ (DSR)</h3>
      <div class="text-5xl font-black mb-2"
        :class="checklistStore.dsrPercentage > 60 ? 'text-error' : (checklistStore.dsrPercentage > 40 ? 'text-warning' : 'text-success')">
        {{ checklistStore.dsrPercentage.toFixed(2) }}%
      </div>
      <p class="text-gray-500">ສູດຄິດໄລ່: (ລວມພາລະໜີ້ B ÷ ລວມລາຍຮັບ A) × 100</p>

      <div class="mt-4 pt-4 border-t">
        <div class="form-control max-w-md mx-auto">
          <label class="label"><span class="label-text font-bold">ວົງເງິນອະນຸມັດສູງສຸດທີ່ເປັນໄປໄດ້ (ກີບ)</span></label>
          <input :value="formatPrice(checklistStore.incomeData.max_approved_amount)" type="text"
            @focus="handleNumberFocus($event, checklistStore.incomeData.max_approved_amount)"
            @input="updateNumberField('max_approved_amount', $event)"
            @blur="handleNumberBlur($event, checklistStore.incomeData.max_approved_amount)"
            class="input input-bordered text-center text-xl font-bold text-primary"
            :disabled="!canEdit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters';
import { useChecklistStore } from '@/stores/checklist';

defineProps<{
  canEdit: boolean;
}>();

defineEmits<{
  (e: 'calculateCibDebt'): void;
}>();

const checklistStore = useChecklistStore();

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

const updateNumberField = (field: keyof typeof checklistStore.incomeData, e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    checklistStore.incomeData[field] = parseNumberStr(target.value);
  }
};
</script>

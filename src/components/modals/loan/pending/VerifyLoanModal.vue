<template>
  <teleport to="body">
    <div v-if="isOpen && loan"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200 overflow-hidden">

        <div class="bg-info/10 px-6 py-4 border-b border-info/20">
          <h3 class="font-bold text-xl text-info flex items-center gap-2">
            <span class="icon-[tabler--user-check] size-6"></span> ຢືນຢັນການກວດກາ (Verify)
          </h3>
        </div>

        <div class="p-6">
          <p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            ທ່ານໄດ້ກວດສອບເອກະສານ ແລະ ຂໍ້ມູນຂອງລູກຄ້າຊື່: <br>
            <strong class="text-lg text-primary">"{{ customerName }}"</strong><br>
            ຄົບຖ້ວນແລ້ວແມ່ນບໍ່?
          </p>

          <div
            class="form-control bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
            <label class="label pb-1">
              <span class="label-text font-bold text-gray-700 dark:text-gray-300">
                ກຳນົດວັນທີຊຳລະງວດທຳອິດ (First Due Date)
              </span>
            </label>

            <div class="flex flex-col gap-2 mt-2 mb-3">
              <label class="cursor-pointer flex items-center gap-2">
                <input type="radio" v-model="paymentDateOption" value="keep" class="radio radio-info radio-sm"
                  :disabled="!loan?.payment_day" />
                <span class="text-sm text-gray-700 dark:text-gray-300" :class="{ 'opacity-50': !loan?.payment_day }">
                  ຮັກສາວັນທີຊຳລະເດີມ <span v-if="loan?.payment_day">(ທຸກໆວັນທີ {{ loan.payment_day }})</span>
                </span>
              </label>
              <label class="cursor-pointer flex items-center gap-2">
                <input type="radio" v-model="paymentDateOption" value="change" class="radio radio-info radio-sm" />
                <span class="text-sm text-gray-700 dark:text-gray-300">ກຳນົດວັນທີຊຳລະໃໝ່ (ເລືອກວັນທີ, ເດືອນ, ປີ)</span>
              </label>
            </div>

            <!-- 🌟 ປ່ຽນມາໃຊ້ type="date" ເພື່ອໃຫ້ເລືອກໄດ້ທັງ ເດືອນ ແລະ ປີ -->
            <div class="relative">
              <input v-model="firstPaymentDate" type="date"
                class="input input-bordered w-full bg-white dark:bg-gray-800 focus:border-info focus:ring-1 focus:ring-info disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 cursor-pointer"
                :disabled="paymentDateOption === 'keep'" />
            </div>
          </div>

          <div
            class="form-control bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <label class="label pb-1">
              <span class="label-text font-bold text-gray-700 dark:text-gray-300">
                ຄວາມເຫັນຂອງຜູ້ກວດກາ (Checker's Remark)
              </span>
            </label>
            <p class="text-xs text-gray-500 mb-3">ສາມາດລະບຸຄວາມເຫັນເພີ່ມເຕີມເພື່ອໃຫ້ຜູ້ບໍລິຫານພິຈາລະນາ.</p>

            <textarea v-model="verifyRemark"
              class="textarea textarea-bordered w-full h-24 bg-white dark:bg-gray-800 focus:border-info focus:ring-1 focus:ring-info"
              placeholder="ເຊັ່ນ: ເອກະສານຄົບຖ້ວນ, ລູກຄ້າມີກຳລັງຊຳລະດີ ເຫັນຄວນພິຈາລະນາອະນຸມັດ..."></textarea>
          </div>
        </div>

        <div
          class="px-6 py-4 bg-gray-50 dark:bg-gray-900/80 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
          <button class="btn btn-ghost" @click="close">ຍົກເລີກ</button>
          <button class="btn btn-info text-white shadow-sm hover:shadow-md" @click="submit" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--check] size-5 mr-1"></span> ຢືນຢັນການກວດກາ
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLoanApplicationStore } from '@/stores/loanApplication';
import { useAuthStore } from '@/stores/auth';
import { LoanApplicationStatus } from '@/types/loanApplication';
import { alert } from '@/utils/alert';

const props = defineProps<{ isOpen: boolean; loan: any }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>();

const loanApplicationStore = useLoanApplicationStore();
const authStore = useAuthStore();

const verifyRemark = ref('');
const paymentDateOption = ref<'keep' | 'change'>('keep');

// 🌟 ປ່ຽນຈາກການເກັບແຕ່ຕົວເລກ ມາເກັບເປັນ String Date (YYYY-MM-DD)
const firstPaymentDate = ref<string>('');
const isLoading = ref(false);

watch(() => props.loan, (newVal) => {
  if (newVal && newVal.payment_day) {
    paymentDateOption.value = 'keep';
    firstPaymentDate.value = '';
  } else {
    paymentDateOption.value = 'change';
    firstPaymentDate.value = '';
  }
}, { immediate: true });

const customerName = computed(() => {
  if (!props.loan?.customer) return '-';
  return `${props.loan.customer.first_name || ''} ${props.loan.customer.last_name || ''}`.trim();
});

const close = () => {
  verifyRemark.value = '';
  firstPaymentDate.value = '';
  emit('close');
};

const submit = async () => {
  if (!props.loan) return;

  // 🟢 ກວດສອບຄວາມຖືກຕ້ອງ ຖ້າເລືອກ "ກຳນົດວັນທີໃໝ່" ຕ້ອງມີການເລືອກວັນທີ
  if (paymentDateOption.value === 'change' && !firstPaymentDate.value) {
    alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ກະລຸນາເລືອກວັນທີຊຳລະງວດທຳອິດໃນປະຕິທິນ');
    return;
  }

  isLoading.value = true;

  try {
    const updateData: any = {
      status: LoanApplicationStatus.VERIFIED,
      approver_id: authStore.user?.id
    };

    // 🟢 ສົ່ງຄ່າ Payment Date ແລະ Payment Day ໄປໃຫ້ Backend
    if (paymentDateOption.value === 'change' && firstPaymentDate.value) {
      const selectedDate = new Date(firstPaymentDate.value);

      // ສົ່ງວັນທີເຕັມ (YYYY-MM-DD) ໄປໃຫ້ Backend ເພື່ອໃຊ້ສ້າງຕາຕະລາງເລີ່ມຕົ້ນທີ່ເດືອນໃດກໍໄດ້
      updateData.first_due_date = firstPaymentDate.value;

      // ແຍກເອົາສະເພາະ "ວັນທີ" (1-31) ສົ່ງໄປນຳ ເພື່ອໃຫ້ Backend ເອົາໄປອັບເດດໃນຖັນ payment_day
      updateData.payment_day = selectedDate.getDate();

    } else if (paymentDateOption.value === 'keep' && props.loan.payment_day) {
      updateData.payment_day = props.loan.payment_day;
    }

    if (verifyRemark.value.trim()) {
      updateData.remarks = verifyRemark.value.trim();
    }

    await loanApplicationStore.updateLoanApplication(props.loan.id, updateData);
    alert.success('ກວດກາສຳເລັດ!', 'ຂໍ້ມູນຖືກສົ່ງຕໍ່ໃຫ້ຜູ້ບໍລິຫານອະນຸມັດແລ້ວ');

    emit('success');
    close();
  } catch (error: any) {
    console.error("Error verifying loan:", error);
    alert.error('ເກີດຂໍ້ຜິດພາດ!', error.response?.data?.message || 'ບໍ່ສາມາດຢືນຢັນການກວດກາໄດ້');
  } finally {
    isLoading.value = false;
  }
};
</script>

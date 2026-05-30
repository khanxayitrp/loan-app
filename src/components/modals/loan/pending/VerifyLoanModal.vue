<template>
  <teleport to="body">
    <div v-if="isOpen && loan" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200 overflow-hidden">

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

          <div class="form-control bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
            <label class="label pb-1">
              <span class="label-text font-bold text-gray-700 dark:text-gray-300">
                ກຳນົດວັນທີຊຳລະເງິນ (Payment Day)
              </span>
            </label>

            <div class="flex flex-col gap-2 mt-2 mb-3">
              <label class="cursor-pointer flex items-center gap-2">
                <input type="radio" v-model="paymentDayOption" value="keep" class="radio radio-info radio-sm" :disabled="!loan?.payment_day" />
                <span class="text-sm text-gray-700 dark:text-gray-300" :class="{ 'opacity-50': !loan?.payment_day }">
                  ຮັກສາວັນທີຊຳລະເດີມ <span v-if="loan?.payment_day">(ວັນທີ {{ loan.payment_day }})</span>
                </span>
              </label>
              <label class="cursor-pointer flex items-center gap-2">
                <input type="radio" v-model="paymentDayOption" value="change" class="radio radio-info radio-sm" />
                <span class="text-sm text-gray-700 dark:text-gray-300">ກຳນົດວັນທີຊຳລະໃໝ່</span>
              </label>
            </div>

            <input 
              v-model.number="paymentDay" 
              type="number" 
              min="1" 
              max="31" 
              class="input input-bordered w-full bg-white dark:bg-gray-800 focus:border-info focus:ring-1 focus:ring-info disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300" 
              placeholder="ລະບຸວັນທີ 1-31" 
              :disabled="paymentDayOption === 'keep'"
            />
          </div>


          <div class="form-control bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <label class="label pb-1">
              <span class="label-text font-bold text-gray-700 dark:text-gray-300">
                ຄວາມເຫັນຂອງຜູ້ກວດກາ (Checker's Remark)
              </span>
            </label>
            <p class="text-xs text-gray-500 mb-3">ສາມາດລະບຸຄວາມເຫັນເພີ່ມເຕີມເພື່ອໃຫ້ຜູ້ບໍລິຫານພິຈາລະນາ.</p>

            <textarea
              v-model="verifyRemark"
              class="textarea textarea-bordered w-full h-24 bg-white dark:bg-gray-800 focus:border-info focus:ring-1 focus:ring-info"
              placeholder="ເຊັ່ນ: ເອກະສານຄົບຖ້ວນ, ລູກຄ້າມີກຳລັງຊຳລະດີ ເຫັນຄວນພິຈາລະນາອະນຸມັດ..."
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/80 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
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
// 🟢 ເພີ່ມຕົວແປສຳລັບເກັບຄ່າຕົວເລືອກ Radio
const paymentDayOption = ref<'keep' | 'change'>('keep');
const paymentDay = ref<number | null>(null);

watch(() => props.loan, (newVal) => {
  if (newVal && newVal.payment_day) {
    paymentDay.value = Number(newVal.payment_day);
    paymentDayOption.value = 'keep'; // ຄ່າເລີ່ມຕົ້ນໃຫ້ຮັກສາອັນເກົ່າ
  } else {
    paymentDay.value = null;
    paymentDayOption.value = 'change'; // ຖ້າບໍ່ມີຄ່າເກົ່າເລີຍ ໃຫ້ບັງຄັບເປັນກຳນົດໃໝ່
  }
}, { immediate: true });

const isLoading = ref(false);

const customerName = computed(() => {
  if (!props.loan?.customer) return '-';
  return `${props.loan.customer.first_name || ''} ${props.loan.customer.last_name || ''}`.trim();
});

const close = () => {
  verifyRemark.value = '';
  paymentDay.value = null;
  emit('close');
};

const submit = async () => {
  if (!props.loan) return;

  // 🟢 ກວດສອບຄວາມຖືກຕ້ອງ ຖ້າເລືອກ "ກຳນົດວັນທີໃໝ່"
  if (paymentDayOption.value === 'change') {
    if (!paymentDay.value || paymentDay.value < 1 || paymentDay.value > 31) {
      alert.error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ', 'ກະລຸນາລະບຸວັນທີຊຳລະເງິນລະຫວ່າງວັນທີ 1 ເຖິງ 31');
      return;
    }
  }

  isLoading.value = true;

  try {
    const updateData: any = {
      status: LoanApplicationStatus.VERIFIED,
      approver_id: authStore.user?.id
    };

    // 🟢 ສົ່ງຄ່າ Payment Day ຕາມຕົວເລືອກ
    if (paymentDayOption.value === 'change' && paymentDay.value !== null) {
      updateData.payment_day = paymentDay.value;
    } else if (paymentDayOption.value === 'keep' && props.loan.payment_day) {
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
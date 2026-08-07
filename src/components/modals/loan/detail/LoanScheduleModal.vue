<template>
  <teleport to="body">
    <div v-if="show && loan" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <span class="icon-[tabler--calendar-stats] size-6 text-primary"></span>
            ຕາຕະລາງການຜ່ອນຊຳລະ
          </h3>
          <button @click="closeModal" class="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-error">
            <span class="icon-[tabler--x] size-6"></span>
          </button>
        </div>

        <div v-if="hasScheduleConflict"
          class="alert alert-warning shadow-sm mb-4 flex-row items-start p-4 border border-warning/50">
          <span class="icon-[tabler--alert-triangle] size-6 shrink-0 mt-0.5"></span>
          <div class="w-full">
            <h3 class="font-bold text-base">⚠️ ຕາຕະລາງຜ່ອນຊຳລະບໍ່ກົງກັບຂໍ້ມູນໃບຄຳຂໍຫຼ້າສຸດ!</h3>
            <div class="text-sm mt-2 grid grid-cols-1 gap-y-2">
              <template v-for="(diff, key) in scheduleDifferences" :key="key">
                <div class="flex flex-col sm:flex-row sm:justify-between border-b border-warning/20 border-dashed pb-1">
                  <span class="font-medium">{{ diff.label }}:</span>
                  <span class="mt-1 sm:mt-0">
                    <span class="line-through text-error opacity-70 mr-2">ຕາຕະລາງເກົ່າ: {{ formatPrice(diff.schedVal)
                      }}</span>
                    <span class="font-bold text-success">👉 ໃບຄຳຂໍປັດຈຸບັນ: {{ formatPrice(diff.appVal) }}</span>
                  </span>
                </div>
              </template>
            </div>

            <div v-if="canEditSchedule" class="mt-3 text-sm font-semibold text-error bg-error/10 p-2 rounded">
              * ກະລຸນາກົດປຸ່ມ <span class="badge badge-warning badge-sm"><span
                  class="icon-[tabler--refresh] mr-1"></span>ຣີເຊັດຄ່າເລີ່ມຕົ້ນ</span> ເພື່ອສ້າງຕາຕະລາງໃໝ່ໃຫ້ກົງກັນ,
              ແລ້ວກົດບັນທຶກ.
            </div>
            <div v-else class="mt-3 text-sm font-semibold text-error bg-error/10 p-2 rounded">
              * ຕາຕະລາງນີ້ຍອດເງິນບໍ່ກົງກັບໃບຄຳຂໍປັດຈຸບັນ ກະລຸນາແຈ້ງພະນັກງານໃຫ້ຣີເຊັດຕາຕະລາງກ່ອນອະນຸມັດ!
            </div>
          </div>
        </div>

        <div class="space-y-4 printable-section">
          <div class="flex justify-between items-center bg-primary/10 p-4 rounded-lg border border-primary/20 no-print">
            <div>
              <h4 class="font-bold text-primary text-lg flex items-center gap-2">
                <span class="icon-[tabler--info-circle] size-5"></span> ຂໍ້ມູນຕາຕະລາງຜ່ອນ
                <span v-if="!isScheduleSaved" class="badge badge-warning badge-sm ml-2">ຍັງບໍ່ໄດ້ບັນທຶກ</span>
                <span v-else class="badge badge-success text-white badge-sm ml-2">ບັນທຶກແລ້ວ</span>
              </h4>
              <p class="text-sm text-gray-600 mt-1">
                ຍອດຈັດ (ຕົ້ນທຶນ): <span class="font-medium text-black">{{ formatPrice(Number(loan?.total_amount || 0) -
                  Number(loan?.down_payment || 0)) }}</span> |
                ດອກເບ້ຍ: <span class="font-medium text-black">{{ loan?.interest_rate_at_apply }}% {{
                  loan?.interest_rate_type === 'yearly' ? '(ຕໍ່ປີ)' : '(ຕໍ່ເດືອນ)' }}</span>
              </p>
            </div>
            <div class="flex gap-2">
              <button v-if="!isScheduleSaved && canEditSchedule" class="btn btn-warning btn-sm"
                @click="generateSchedule">
                <span class="icon-[tabler--refresh] size-4 mr-1"></span> ຣີເຊັດຄ່າເລີ່ມຕົ້ນ
              </button>

              <button v-if="isScheduleSaved" class="btn btn-outline btn-primary btn-sm" @click="printSchedule">
                <span class="icon-[tabler--printer] size-4 mr-1"></span> ພິມຕາຕະລາງ
              </button>
            </div>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded-lg">
            <table class="table table-sm w-full table-fixed">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-center w-16 align-middle">ລຳດັບ</th>
                  <th class="w-40 align-middle">ວັນທີຈ່າຍ</th>
                  <th class="align-middle text-right">ຕົ້ນທຶນ (ກີບ)</th>
                  <th class="align-middle text-right">ດອກເບ້ຍ (ກີບ)</th>
                  <th class="text-right align-middle">ລວມທັງໝົດ (ກີບ)</th>
                  <th class="text-right align-middle">ຍອດເຫຼືອໜີ້ (ກີບ)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-base-200/50 font-medium">
                  <td class="text-center align-middle">-</td>
                  <td class="align-middle">ມື້ເຮັດສັນຍາ</td>
                  <td colspan="3" class="text-right align-middle">ຍອດໜີ້ຕັ້ງຕົ້ນ:</td>
                  <td class="text-right text-primary text-lg align-middle">
                    {{ formatPrice(Number(loan?.total_amount || 0) - Number(loan?.down_payment || 0)) }}
                  </td>
                </tr>
                <tr v-for="(row, index) in scheduleRows" :key="index" class="hover:bg-base-200/30 transition-colors">
                  <td class="text-center align-middle font-medium">{{ row.installment_number }}</td>
                  <td class="align-middle relative">
                    <input type="text" :value="formatDateToDDMMYYYY(row.due_date)" readonly placeholder="dd/mm/yyyy"
                      class="input input-sm input-bordered w-full pr-8 cursor-pointer"
                      :class="!canEditSchedule ? 'bg-gray-50' : 'bg-white'"
                      :disabled="!canEditSchedule || (isScheduleSaved && loan?.status !== 'pending' && loan?.status !== 'verifying')"
                      @click="triggerRowDatePicker($event)" />

                    <input type="date" v-model="row.due_date"
                      class="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none"
                      :disabled="!canEditSchedule || (isScheduleSaved && loan?.status !== 'pending' && loan?.status !== 'verifying')"
                      @change="recalculateDatesFromIndex(index)" />

                    <span
                      class="icon-[tabler--calendar] absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none size-4"></span>
                  </td>
                  <td class="align-middle text-right">
                    <input type="text" :value="formatCurrencyInput(row.principal)"
                      @input="handleScheduleInput(row, 'principal', $event)"
                      class="input input-sm input-bordered w-full text-right"
                      :class="!canEditSchedule ? 'bg-gray-50' : 'bg-white'"
                      :disabled="!canEditSchedule || (isScheduleSaved && loan?.status !== 'pending' && loan?.status !== 'verifying')" />
                  </td>
                  <td class="align-middle text-right">
                    <input type="text" :value="formatCurrencyInput(row.interest)"
                      @input="handleScheduleInput(row, 'interest', $event)"
                      class="input input-sm input-bordered w-full text-right font-medium text-error"
                      :class="!canEditSchedule ? 'bg-gray-50' : 'bg-white'"
                      :disabled="!canEditSchedule || (isScheduleSaved && loan?.status !== 'pending' && loan?.status !== 'verifying')" />
                  </td>
                  <td class="text-right align-middle font-bold bg-gray-50 text-success">{{ formatPrice(row.total_amount)
                    }}</td>
                  <td class="text-right align-middle font-bold"
                    :class="row.remaining_balance <= 0 ? 'text-success' : 'text-primary'">
                    {{ formatPrice(row.remaining_balance) }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-primary/5 font-bold text-base">
                <tr>
                  <td colspan="2" class="text-right align-middle">ລວມທັງໝົດ:</td>
                  <td class="text-right text-primary align-middle">{{ formatPrice(totalSchedulePrincipal) }}</td>
                  <td class="text-right text-error align-middle">{{ formatPrice(totalScheduleInterest) }}</td>
                  <td class="text-right text-success align-middle">{{ formatPrice(totalSchedulePrincipal +
                    totalScheduleInterest) }}</td>
                  <td class="text-right align-middle">
                    <span v-if="Math.abs(totalScheduleRemaining) > 10" class="text-error text-sm">(ຍອດບໍ່ລົງຕົວ {{
                      formatPrice(totalScheduleRemaining) }})</span>
                    <span v-else class="text-success text-sm">(ລົງຕົວ)</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button class="btn btn-soft btn-secondary" @click="closeModal">ປິດ</button>

          <button v-if="canEditSchedule" class="btn btn-success text-white" @click="saveSchedule" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-4 mr-1"></span> ບັນທຶກຕາຕະລາງ
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useLoanContractStore } from '@/stores/loanContract'
import { usePermissionStore } from '@/stores/permission' // 🌟 1. Import Permission Store
import apiClient from '@/api/apiclient'
import { formatPrice, formatCurrencyInput, formatDateToDDMMYYYY } from '@/utils/formatters'
import { alert } from '@/utils/alert'

const props = defineProps<{
  show: boolean,
  loan: any | null,
  viewOnly?: boolean
}>()

const emit = defineEmits(['close'])

const loanApplicationStore = useLoanApplicationStore()
const loanContractStore = useLoanContractStore()
const permissionStore = usePermissionStore() // 🌟 2. ປະກາດໃຊ້ Store

const isSaving = ref(false)

const isScheduleSaved = ref(false)
const hasScheduleConflict = ref(false)
const scheduleDifferences = reactive<Record<string, any>>({})
const scheduleRows = ref<any[]>([])

// 🌟 3. Computed Property ສຳລັບກວດສອບສິດການແກ້ໄຂ
const canEditSchedule = computed(() => {
  // ຖ້າຖືກບັງຄັບ View Only ມາຈາກ Prop ກໍຫ້າມແກ້
  if (props.viewOnly) return false;

  // ຖ້າບໍ່ໄດ້ຖືກບັງຄັບ ແຕ່ມີສິດໃດສິດໜຶ່ງໃນນີ້ ກໍສາມາດແກ້ໄດ້ (ເພີ່ມ loan_approve ໃຫ້ພິຈາລະນານຳ)
  return permissionStore.hasPermission('loan_edit') ||
    permissionStore.hasPermission('loan_create') ||
    permissionStore.hasPermission('loan_approve');
});

const triggerRowDatePicker = (e: Event) => {
  const textInput = e.currentTarget as HTMLInputElement;
  const hiddenDateInput = textInput.nextElementSibling as HTMLInputElement;
  if (!textInput.disabled && hiddenDateInput && hiddenDateInput.showPicker) {
    hiddenDateInput.showPicker();
  }
}

const recalculateDatesFromIndex = (changedIndex: number) => {
  if (!canEditSchedule.value) return; // 🌟 ເຊັກສິດ

  const changedDateStr = scheduleRows.value[changedIndex].due_date;
  if (!changedDateStr) return;

  const baseDate = new Date(changedDateStr);
  const targetDay = baseDate.getDate();
  let currentYear = baseDate.getFullYear();
  let currentMonth = baseDate.getMonth();

  for (let i = changedIndex + 1; i < scheduleRows.value.length; i++) {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    const maxDaysInTargetMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const actualDay = Math.min(targetDay, maxDaysInTargetMonth);

    const yearStr = currentYear.toString();
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(actualDay).padStart(2, '0');

    scheduleRows.value[i].due_date = `${yearStr}-${monthStr}-${dayStr}`;
  }
}

const closeModal = () => {
  emit('close');
  scheduleRows.value = [];
  isScheduleSaved.value = false;
  hasScheduleConflict.value = false;
}

watch(() => props.show, async (newVal) => {
  if (newVal && props.loan) {
    await fetchSavedSchedule();
  }
})

const fetchSavedSchedule = async () => {
  if (!props.loan) return;
  try {
    const savedData = await loanApplicationStore.fetchRepaymentSchedule(props.loan.id);

    if (savedData && savedData.length > 0) {
      const tempRows = savedData.map((r: any) => ({
        installment_number: r.installment_no || r.installment_number,
        due_date: r.due_date ? r.due_date.split('T')[0] : '',
        principal: Number(r.principal_amount ?? r.principal ?? 0),
        interest: Number(r.interest_amount ?? r.interest ?? 0),
        total_amount: Number(r.total_due ?? r.total_amount ?? 0),
        remaining_balance: Number(r.remaining_principal ?? r.remaining_balance ?? 0)
      }));

      const loan = props.loan;
      const firstRow = tempRows[0];

      const appPrincipal = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
      const appMonthlyPay = Number(loan.monthly_pay || 0);
      const appTerm = Number(loan.loan_period || 0);

      const schedPrincipal = Number(firstRow.principal) + Number(firstRow.remaining_balance);
      const schedMonthlyPay = Number(firstRow.total_amount);
      const schedTerm = tempRows.length;

      const diffPrincipal = Math.abs(appPrincipal - schedPrincipal);
      const diffMonthlyPay = Math.abs(appMonthlyPay - schedMonthlyPay);
      const diffTerm = appTerm !== schedTerm;

      const isConflict = diffPrincipal > 10 || diffMonthlyPay > 10 || diffTerm;

      for (let k in scheduleDifferences) delete scheduleDifferences[k];

      if (isConflict) {
        if (diffPrincipal > 10) scheduleDifferences['principal'] = { label: 'ຍອດຈັດ (ຕົ້ນທຶນ)', schedVal: schedPrincipal, appVal: appPrincipal };
        if (diffMonthlyPay > 10) scheduleDifferences['monthly'] = { label: 'ຄ່າງວດຕໍ່ເດືອນ', schedVal: schedMonthlyPay, appVal: appMonthlyPay };
        if (diffTerm) scheduleDifferences['term'] = { label: 'ຈຳນວນງວດ (ເດືອນ)', schedVal: schedTerm, appVal: appTerm };

        // 🌟 ຖ້າບໍ່ມີສິດແກ້ ໃຫ້ໂຊຂອງເກົ່າ
        if (!canEditSchedule.value) {
          scheduleRows.value = tempRows;
        } else {
          generateSchedule();
        }
        hasScheduleConflict.value = true;
        isScheduleSaved.value = false;
      } else {
        scheduleRows.value = tempRows;
        isScheduleSaved.value = true;
        hasScheduleConflict.value = false;
      }
    } else {
      generateSchedule();
    }
  } catch (error) {
    generateSchedule();
  }
}

const generateSchedule = () => {
  scheduleRows.value = [];
  isScheduleSaved.value = false;
  hasScheduleConflict.value = false;
  if (!props.loan) return;

  const loan = props.loan;
  const principal = Number(loan.total_amount || 0) - Number(loan.down_payment || 0);
  const term = Number(loan.loan_period || 1);
  const interestRate = Number(loan.interest_rate_at_apply || 0);
  const interestType = loan.interest_type || 'flat_rate';
  const rateType = loan.interest_rate_type || 'monthly';
  const paymentDay = Number(loan.payment_day || new Date().getDate());
  const ratePerMonth = rateType === 'yearly' ? (interestRate / 12) / 100 : interestRate / 100;

  let startDate = new Date();
  let accumulatedPrincipal = 0;
  let accumulatedInterest = 0;

  const expectedTotalInterest = principal * ratePerMonth * term;
  const effectivePmt = ratePerMonth > 0
    ? (principal * ratePerMonth * Math.pow(1 + ratePerMonth, term)) / (Math.pow(1 + ratePerMonth, term) - 1)
    : principal / term;

  let currentBalanceForEffective = principal;

  for (let i = 1; i <= term; i++) {
    let rowPrincipalRounded = 0;
    let rowInterestRounded = 0;

    let targetYear = startDate.getFullYear();
    let targetMonth = startDate.getMonth() + i;
    let maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    let actualDay = Math.min(paymentDay, maxDaysInTargetMonth);
    let dueDate = new Date(targetYear, targetMonth, actualDay);

    if (i === term) {
      rowPrincipalRounded = principal - accumulatedPrincipal;

      if (interestType === 'flat_rate') {
        rowInterestRounded = Math.round(expectedTotalInterest) - accumulatedInterest;
      } else {
        rowInterestRounded = Math.round(currentBalanceForEffective * ratePerMonth);
        rowPrincipalRounded = Math.round(currentBalanceForEffective);
      }
    } else {
      if (interestType === 'flat_rate') {
        rowPrincipalRounded = Math.round(principal / term);
        rowInterestRounded = Math.round(principal * ratePerMonth);
      } else {
        let exactInterest = currentBalanceForEffective * ratePerMonth;
        let exactPrincipal = effectivePmt - exactInterest;
        rowPrincipalRounded = Math.round(exactPrincipal);
        rowInterestRounded = Math.round(exactInterest);
        currentBalanceForEffective -= exactPrincipal;
      }
    }

    accumulatedPrincipal += rowPrincipalRounded;
    accumulatedInterest += rowInterestRounded;

    let totalAmountRounded = rowPrincipalRounded + rowInterestRounded;

    scheduleRows.value.push({
      installment_number: i,
      due_date: dueDate.toISOString().split('T')[0] || '',
      principal: rowPrincipalRounded,
      interest: rowInterestRounded,
      total_amount: totalAmountRounded,
      remaining_balance: principal - accumulatedPrincipal
    });
  }
}

const handleScheduleInput = (row: any, field: 'principal' | 'interest', event: Event) => {
  if (!canEditSchedule.value) return; // 🌟 ເຊັກສິດ
  const target = event.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  const numericValue = Number(rawValue);
  if (!isNaN(numericValue)) row[field] = numericValue; else if (rawValue === '') row[field] = 0;
  target.value = formatCurrencyInput(row[field]);
  recalculateSchedule();
};

const recalculateSchedule = () => {
  if (!props.loan) return;
  const initialPrincipal = Number(props.loan.total_amount) - Number(props.loan.down_payment || 0);
  let currentBalance = initialPrincipal;
  for (let i = 0; i < scheduleRows.value.length; i++) {
    let row = scheduleRows.value[i];
    row.principal = Number(row.principal) || 0; row.interest = Number(row.interest) || 0;
    row.total_amount = row.principal + row.interest;
    currentBalance -= row.principal;
    row.remaining_balance = Math.round(currentBalance);
  }
}

const totalSchedulePrincipal = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.principal), 0))
const totalScheduleInterest = computed(() => scheduleRows.value.reduce((sum, row) => sum + Number(row.interest), 0))
const totalScheduleRemaining = computed(() => {
  if (!props.loan) return 0;
  return (Number(props.loan.total_amount) - Number(props.loan.down_payment || 0)) - totalSchedulePrincipal.value;
})

const saveSchedule = async () => {
  if (!props.loan || scheduleRows.value.length === 0 || !canEditSchedule.value) return; // 🌟 ເຊັກສິດ
  isSaving.value = true;
  try {
    const firstRowDate = new Date(scheduleRows.value[0].due_date);
    const newPaymentDay = firstRowDate.getDate();

    await loanApplicationStore.saveRepaymentSchedule(props.loan.id, scheduleRows.value);

    await loanApplicationStore.updateLoanApplication(props.loan.id, {
      payment_day: newPaymentDay
    });

    await loanContractStore.updateContract(props.loan.id, {
      paymentDay: newPaymentDay,
      payment_day: newPaymentDay
    } as any);

    if (props.loan) {
      props.loan.payment_day = newPaymentDay;
    }

    alert.success('ບັນທຶກຕາຕະລາງສຳເລັດ!');
    isScheduleSaved.value = true;
    hasScheduleConflict.value = false;
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ: ' + (error.response?.data?.message || error.message));
  } finally {
    isSaving.value = false;
  }
}

const printSchedule = async () => {
  if (!isScheduleSaved.value) { alert.error('ກະລຸນາບັນທຶກຕາຕະລາງກ່ອນພິມ'); return; }
  isSaving.value = true;
  alert.info('ກຳລັງສ້າງເອກະສານ PDF...');
  try {
    const response = await apiClient.post('/pdf/generate-repayment-schedule', {
      loanData: props.loan, scheduleRows: scheduleRows.value,
      totals: { principal: totalSchedulePrincipal.value, interest: totalScheduleInterest.value, amount: totalSchedulePrincipal.value + totalScheduleInterest.value }
    }, { responseType: 'blob', timeout: 60000 });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
  } catch (error) { alert.error('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF ຕາຕະລາງ'); } finally { isSaving.value = false; }
}
</script>

<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຊຳລະສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500">ລາຍການສິນເຊື່ອທີ່ອະນຸມັດ ແລະ ມອບຮັບສິນຄ້າສຳເລັດແລ້ວ</p>
      </div>
      <button @click="fetchLoans" class="btn btn-outline btn-sm">
        <span class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl">
      <div class="form-control">
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາເລກທີສັນຍາ, ຊື່, ເບີໂທ..." class="input input-bordered w-full" />
      </div>
      <div class="form-control">
        <select v-model="statusFilter" class="select select-bordered w-full">
          <option value="active">ກຳລັງຜ່ອນຊຳລະ (Active)</option>
          <option value="completed">ປິດບັນຊີແລ້ວ (Completed)</option>
          <option value="late">ຊັກຊ້າ (Late)</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-10">
      <span class="loading loading-spinner text-primary"></span>
    </div>

    <div v-else class="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full">
        <thead class="bg-base-200">
          <tr>
            <th>ເລກທີສັນຍາ</th>
            <th>ລູກຄ້າ</th>
            <th>ຍອດຈັດສິນເຊື່ອ</th>
            <th>ຄ່າຜ່ອນ/ງວດ</th>
            <th>ສະຖານະສັນຍາ</th>
            <th class="text-center">ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in filteredLoans" :key="loan.id">
            <td class="font-medium text-primary">#{{ loan.loan_id || loan.id }}</td>
            <td>
              <div class="font-medium">{{ getCustomerName(loan) }}</div>
              <div class="text-xs text-gray-500">{{ loan.customer?.phone || '-' }}</div>
            </td>
            <td>{{ formatPrice((loan.total_amount || 0) - (loan.down_payment || 0)) }}</td>
            <td class="font-semibold text-blue-600">{{ formatPrice(loan.monthly_pay) }}</td>
            <td>
              <span class="badge badge-sm badge-info">ກຳລັງຜ່ອນຊຳລະ</span>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-primary btn-soft" @click="openRepaymentHub(loan)">
                <span class="icon-[tabler--wallet] size-4 mr-1"></span> ຈັດການຊຳລະ
              </button>
            </td>
          </tr>
          <tr v-if="!filteredLoans.length">
            <td colspan="6" class="text-center py-8 text-gray-500">ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ຕ້ອງຊຳລະ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog class="modal" :class="{ 'modal-open': showRepaymentHub }">
      <div class="modal-box w-11/12 max-w-5xl max-h-[90vh] flex flex-col">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeRepaymentHub">✕</button>
        <h3 class="font-bold text-xl mb-4 border-b pb-2">ຂໍ້ມູນການຜ່ອນຊຳລະ - #{{ selectedLoan?.loan_id || selectedLoan?.id }}</h3>

        <div v-if="isScheduleLoading" class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>

        <div v-else-if="selectedLoan" class="flex-1 overflow-y-auto space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p class="text-sm text-blue-600">ຍອດໜີ້ທັງໝົດລວມດອກເບ້ຍ</p>
              <p class="text-xl font-bold">{{ formatPrice(summary.totalPayable) }}</p>
            </div>
            <div class="p-4 rounded-lg bg-green-50 border border-green-100">
              <p class="text-sm text-green-600">ຈ່າຍແລ້ວທັງໝົດ</p>
              <p class="text-xl font-bold">{{ formatPrice(summary.totalPaid) }}</p>
            </div>
            <div class="p-4 rounded-lg bg-red-50 border border-red-100">
              <p class="text-sm text-red-600">ຍອດໜີ້ຍັງເຫຼືອ</p>
              <p class="text-xl font-bold text-red-600">{{ formatPrice(summary.remainingBalance) }}</p>
            </div>
            <div class="flex items-center">
               <button v-if="summary.remainingBalance > 0" class="btn btn-error text-white w-full h-full shadow-sm" @click="openPaymentModal(null, true)">
                 <span class="icon-[tabler--cash-banknote] size-5"></span> ປິດບັນຊີກ່ອນກຳນົດ
               </button>
               <div v-else class="text-success font-bold flex items-center justify-center w-full gap-2">
                 <span class="icon-[tabler--circle-check-filled] size-6"></span> ປິດບັນຊີແລ້ວ
               </div>
            </div>
          </div>

          <div class="border rounded-lg overflow-x-auto">
            <table class="table table-sm table-zebra w-full">
              <thead class="bg-base-200">
                <tr>
                  <th class="text-center">ງວດທີ</th>
                  <th>ກຳນົດຈ່າຍ</th>
                  <th>ຕົ້ນທຶນ</th>
                  <th>ດອກເບ້ຍ</th>
                  <th>ຍອດຕ້ອງຈ່າຍລວມ</th>
                  <th>ສະຖານະ</th>
                  <th class="text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sch in currentSchedules" :key="sch.id" :class="{'bg-green-50/30': sch.status === 'paid'}">
                  <td class="font-medium text-center">{{ sch.installment_number }}</td>
                  <td>{{ formatDate(sch.due_date) }}</td>
                  <td class="text-gray-500">{{ formatPrice(sch.principal) }}</td>
                  <td class="text-gray-500">{{ formatPrice(sch.interest) }}</td>
                  <td class="font-bold">{{ formatPrice(sch.total_amount) }}</td>
                  <td>
                    <span class="badge badge-sm" :class="statusConfig[sch.status]?.class || 'badge-ghost'">
                      {{ statusConfig[sch.status]?.text || sch.status }}
                    </span>
                    <div v-if="sch.paid_date" class="text-[10px] text-gray-500 mt-1">ຈ່າຍ: {{ formatDate(sch.paid_date) }}</div>
                  </td>
                  <td class="text-right">
                    <button v-if="sch.status !== 'paid'" class="btn btn-xs btn-success text-white" @click="openPaymentModal(sch, false)">
                      ຊຳລະງວດນີ້
                    </button>
                    <button v-else class="btn btn-xs btn-ghost text-primary">
                      <span class="icon-[tabler--receipt] size-4"></span> ເບິ່ງໃບບິນ
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button @click="closeRepaymentHub">close</button></form>
    </dialog>

    <dialog class="modal" :class="{ 'modal-open': showPaymentModal }">
      <div class="modal-box max-w-md">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="showPaymentModal = false">✕</button>
        <h3 class="font-bold text-xl mb-4 text-success border-b pb-2 flex items-center gap-2">
          <span class="icon-[tabler--receipt-2] size-6"></span>
          {{ isEarlyPayoff ? 'ປິດບັນຊີກ່ອນກຳນົດ (Pay Off)' : `ຊຳລະຄ່າງວດທີ ${paymentForm.installment_number}` }}
        </h3>

        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg border text-center">
            <p class="text-sm text-gray-500">ຍອດທີ່ຕ້ອງຊຳລະທັງໝົດ</p>
            <p class="text-3xl font-bold text-primary">{{ formatPrice(paymentForm.amount_to_pay) }}</p>
            <p v-if="isEarlyPayoff" class="text-xs text-error mt-1">* ອາດມີການຄຳນວນສ່ວນຫຼຸດ ຫຼື ຄ່າທຳນຽມເພີ່ມເຕີມ</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ຈຳນວນເງິນທີ່ຮັບ (ກີບ) *</span></label>
            <input type="text" :value="formatCurrencyInput(paymentForm.amount_received)" @input="handleCurrencyInput" class="input input-bordered w-full text-lg font-bold" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ຊ່ອງທາງການຊຳລະ *</span></label>
              <select v-model="paymentForm.payment_method" class="select select-bordered w-full">
                <option value="cash">ເງິນສົດ</option>
                <option value="transfer">ໂອນເງິນ</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ວັນທີຊຳລະ *</span></label>
              <input type="date" v-model="paymentForm.payment_date" class="input input-bordered w-full" required />
            </div>
          </div>

          <div class="form-control" v-if="paymentForm.payment_method === 'transfer'">
            <label class="label"><span class="label-text font-medium">ເລກອ້າງອີງ / Ref No.</span></label>
            <input type="text" v-model="paymentForm.reference_number" placeholder="ຕົວຢ່າງ: BCEL 0012..." class="input input-bordered w-full" />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">ໝາຍເຫດ</span></label>
            <textarea v-model="paymentForm.remarks" class="textarea textarea-bordered" placeholder="ລາຍລະອຽດການຊຳລະ..."></textarea>
          </div>
        </div>

        <div class="modal-action mt-6">
          <button class="btn btn-ghost" @click="showPaymentModal = false" :disabled="isProcessing">ຍົກເລີກ</button>
          <button class="btn btn-success text-white" @click="submitPayment" :disabled="isProcessing || paymentForm.amount_received < paymentForm.amount_to_pay">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            <span v-else>ຢືນຢັນການຊຳລະ</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button @click="showPaymentModal = false">close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { alert } from '@/utils/alert'
import apiClient from '@/api/apiclient' // 🟢 ເພີ່ມເພື່ອນຳໃຊ້ຍິງ API ຈ່າຍເງິນ

// ນຳໃຊ້ Store ທີ່ມີຢູ່
import { useLoanApplicationStore } from '@/stores/loanApplication'
import type { LoanApplication } from '@/types/loanApplication'
import { LoanApplicationStatus } from '@/types/loanApplication'

const loanAppStore = useLoanApplicationStore()

// ==========================================
// 1. State Management
// ==========================================
const isLoading = computed(() => loanAppStore.isLoading)
const isScheduleLoading = ref(false)
const isProcessing = ref(false)

const searchQuery = ref('')
const statusFilter = ref('active') // active, completed, late

const currentSchedules = ref<any[]>([]) // ເກັບຕາຕະລາງຂອງສັນຍາທີ່ກົດເຂົ້າເບິ່ງ

// Modals
const showRepaymentHub = ref(false)
const showPaymentModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const selectedSchedule = ref<any | null>(null)
const isEarlyPayoff = ref(false)

// Payment Form Reactive
const paymentForm = reactive({
  amount_to_pay: 0,
  amount_received: 0,
  payment_method: 'cash',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  remarks: '',
  installment_number: 0
})

// ==========================================
// 2. Formatters & Configs
// ==========================================
const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'badge-success text-white', text: 'ຊຳລະແລ້ວ' },
  pending: { class: 'badge-warning', text: 'ລໍຖ້າຊຳລະ' },
  late: { class: 'badge-error text-white', text: 'ກາຍກຳນົດ' }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const formatCurrencyInput = (val: number) => val ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';
const handleCurrencyInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  paymentForm.amount_received = Number(rawValue) || 0;
  target.value = formatCurrencyInput(paymentForm.amount_received);
};

const getCustomerName = (loan: LoanApplication) => {
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'ບໍ່ມີຊື່';
}

// ==========================================
// 3. Computed (Logic ກັ່ນຕອງຂໍ້ມູນ)
// ==========================================
const filteredLoans = computed(() => {
  let loans = loanAppStore.loanApplications || [];

  // 🟢 1. ກັ່ນຕອງເອົາສະເພາະ Loan ທີ່ຖືກ "ມອບຮັບສິນຄ້າສຳເລັດ (delivery_receipt=approved)"
  loans = loans.filter((loan: any) => {
    // ກວດສອບຈາກ Array delivery_receipts ທີ່ຕິດມາກັບ payload ຂອງ loan
    const hasApprovedDelivery = loan.delivery_receipts && loan.delivery_receipts.some((receipt: any) => receipt.status === 'approved');
    return hasApprovedDelivery;
  });

  // 2. ຄົ້ນຫາຕາມຊື່, ເບີໂທ, ເລກທີສັນຍາ
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    loans = loans.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(q) ||
      (loan.customer?.phone || '').includes(q) ||
      (loan.loan_id || loan.id.toString()).toLowerCase().includes(q)
    );
  }

  // TODO: ຖ້າຢາກ Filter ຕາມ Active/Completed ຕ້ອງມີ Field repayment_status ມາຈາກ Backend.
  // ປັດຈຸບັນສະແດງທັງໝົດທີ່ມອບລົດແລ້ວກ່ອນ.

  return loans;
});

// ຄຳນວນຍອດໜີ້ອັດຕະໂນມັດຈາກຕາຕະລາງທີ່ໂຫຼດມາ
const summary = computed(() => {
  let totalPayable = 0;
  let totalPaid = 0;

  currentSchedules.value.forEach(sch => {
    totalPayable += Number(sch.total_amount) || 0;
    if (sch.status === 'paid') {
      totalPaid += Number(sch.total_amount) || 0;
    }
  });

  return {
    totalPayable,
    totalPaid,
    remainingBalance: totalPayable - totalPaid
  };
});

// ==========================================
// 4. Actions
// ==========================================
const fetchLoans = async () => {
  try {
    // ດຶງຂໍ້ມູນສິນເຊື່ອທີ່ "ອະນຸມັດແລ້ວ" (approved)
    await loanAppStore.fetchLoanApplications({
      is_confirmed: 1,
      status: LoanApplicationStatus.Approved,
      limit: 100 // ດຶງມາເຜື່ອໄວ້ (ແນະນຳໃຫ້ Backend ສ້າງ Endpoint ສະເພາະ Repayment ຈະດີທີ່ສຸດ)
    });
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
}

// ເປີດ Modal ລາຍລະອຽດການຜ່ອນ
const openRepaymentHub = async (loan: LoanApplication) => {
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    // 🟢 ໃຊ້ Store ທີ່ມີຢູ່ ດຶງ Schedule
    const res = await loanAppStore.fetchRepaymentSchedule(loan.id);
    currentSchedules.value = res.data || res;
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຕາຕະລາງການຜ່ອນຊຳລະໄດ້');
  } finally {
    isScheduleLoading.value = false;
  }
}

const closeRepaymentHub = () => {
  showRepaymentHub.value = false;
  selectedLoan.value = null;
  currentSchedules.value = [];
}

const openPaymentModal = (schedule: any | null, earlyPayoff = false) => {
  isEarlyPayoff.value = earlyPayoff;
  selectedSchedule.value = schedule;

  const amountToPay = earlyPayoff ? summary.value.remainingBalance : schedule.total_amount;

  Object.assign(paymentForm, {
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    remarks: '',
    amount_to_pay: amountToPay,
    amount_received: amountToPay,
    installment_number: earlyPayoff ? 0 : schedule.installment_number
  });

  showPaymentModal.value = true;
}

// 🟢 ບັນທຶກການຊຳລະເງິນ
const submitPayment = async () => {
  isProcessing.value = true;
  try {
    const payload = {
      loan_id: selectedLoan.value?.id,
      schedule_id: selectedSchedule.value?.id || null, // null ໝາຍເຖິງປິດບັນຊີ
      is_early_payoff: isEarlyPayoff.value,
      amount_paid: paymentForm.amount_received,
      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference_number: paymentForm.reference_number,
      remarks: paymentForm.remarks
    };

    // 🟢 ຍິງ API ໄປຫາ Backend ເພື່ອບັນທຶກການຊຳລະເງິນ
    // (ເນື່ອງຈາກໃນ loanAppStore ຍັງບໍ່ມີ Action ໂຕນີ້, ດັ່ງນັ້ນຈຶ່ງໃຊ້ apiClient ຍິງກົງໄປຫາ Route ທີ່ກ່ຽວຂ້ອງ)
    await apiClient.post('/repayments/pay', payload);

    alert.success('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ!');
    showPaymentModal.value = false;

    // ໂຫຼດຕາຕະລາງງວດໃໝ່ ເພື່ອອັບເດດສະຖານະເປັນ Paid
    if (selectedLoan.value) {
      await openRepaymentHub(selectedLoan.value);
    }
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການຊຳລະ', error.response?.data?.message || error.message);
  } finally {
    isProcessing.value = false;
  }
}

onMounted( async () => {
  fetchLoans();
});
</script>

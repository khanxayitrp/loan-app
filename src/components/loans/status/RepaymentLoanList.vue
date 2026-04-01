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

    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
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
            <td>{{ formatPrice((Number(loan.total_amount) || 0) - (Number(loan.down_payment) || 0)) }}</td>
            <td class="font-semibold text-blue-600">{{ formatPrice(loan.monthly_pay) }}</td>
            <td>
              <span class="badge badge-sm badge-success text-white">ອະນຸມັດແລ້ວ</span>
            </td>
            <td class="text-center">
              <button v-if="hasApprovedDelivery(loan)" class="btn btn-sm btn-primary btn-soft" @click="openRepaymentHub(loan)">
                <span class="icon-[tabler--wallet] size-4 mr-1"></span> ຈັດການຊຳລະ
              </button>
              <span v-else class="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded">
                ລໍຖ້າມອບຮັບສິນຄ້າ
              </span>
            </td>
          </tr>
          <tr v-if="!filteredLoans.length">
            <td colspan="6" class="text-center py-8 text-gray-500">ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <teleport to="body">
      <div v-if="showRepaymentHub" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] flex flex-col relative">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="closeRepaymentHub">✕</button>

          <h3 class="font-bold text-xl mb-4 border-b pb-2 pr-8">ຂໍ້ມູນການຜ່ອນຊຳລະ - #{{ selectedLoan?.loan_id || selectedLoan?.id }}</h3>

          <div v-if="isScheduleLoading" class="flex justify-center py-10"><span class="loading loading-spinner loading-lg text-primary"></span></div>

          <div v-else-if="selectedLoan" class="flex-1 overflow-y-auto space-y-6 pr-2">
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
                  <tr v-for="sch in currentSchedules" :key="sch.id" :class="{'bg-green-50/50 dark:bg-green-900/20': sch.payment_status === 'paid'}">
                    <td class="font-medium text-center">{{ sch.installment_no }}</td>
                    <td>{{ formatDate(sch.due_date) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.principal_amount) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.interest_amount) }}</td>
                    <td class="font-bold">{{ formatPrice(sch.total_due) }}</td>
                    <td>
                      <span class="badge badge-sm" :class="statusConfig[sch.payment_status]?.class || 'badge-ghost'">
                        {{ statusConfig[sch.payment_status]?.text || sch.payment_status }}
                      </span>
                      <div v-if="sch.paid_at" class="text-[10px] text-gray-500 mt-1">ຈ່າຍ: {{ formatDate(sch.paid_at) }}</div>
                    </td>
                    <td class="text-right">
                      <button v-if="sch.payment_status !== 'paid'" class="btn btn-xs btn-success text-white" @click="openPaymentModal(sch, false)">
                        ຊຳລະງວດນີ້
                      </button>
                      <button v-else class="btn btn-xs btn-ghost text-primary">
                        <span class="icon-[tabler--receipt] size-4"></span> ເບິ່ງໃບບິນ
                      </button>
                    </td>
                  </tr>
                  <tr v-if="currentSchedules.length === 0">
                    <td colspan="7" class="text-center py-6 text-gray-500">ຍັງບໍ່ມີຕາຕະລາງການຜ່ອນຊຳລະ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto relative max-h-[95vh] overflow-y-auto">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="showPaymentModal = false">✕</button>

          <h3 class="font-bold text-xl mb-4 text-success border-b pb-2 flex items-center gap-2 pr-8">
            <span class="icon-[tabler--receipt-2] size-6"></span>
            {{ isEarlyPayoff ? 'ປິດບັນຊີກ່ອນກຳນົດ (Pay Off)' : `ຊຳລະຄ່າງວດທີ ${paymentForm.installment_number}` }}
          </h3>

          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border text-center relative overflow-hidden">
              <div v-if="isEarlyPayoff" class="absolute top-0 left-0 w-full h-1 bg-warning"></div>
              <div v-if="paymentForm.expected_penalty > 0" class="absolute top-0 left-0 w-full h-1 bg-error"></div>

              <p class="text-sm text-gray-500 dark:text-gray-400">ຍອດທີ່ຕ້ອງຊຳລະທັງໝົດ</p>
              <p class="text-3xl font-bold text-primary">{{ formatPrice(calculatedTotalExpected) }}</p>

              <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-600 dark:text-gray-300">
                 <span>ຕົ້ນທຶນ: <strong>{{ formatPrice(paymentForm.expected_principal) }}</strong></span>
                 <span>ດອກເບ້ຍ: <strong>{{ formatPrice(paymentForm.expected_interest) }}</strong></span>
                 <span v-if="paymentForm.expected_penalty > 0" class="text-error">
                   ຄ່າປັບໃໝ: <strong>+{{ formatPrice(paymentForm.expected_penalty) }}</strong>
                 </span>
                 <span v-if="paymentForm.discount_given > 0" class="text-success">
                   ສ່ວນຫຼຸດ: <strong>-{{ formatPrice(paymentForm.discount_given) }}</strong>
                 </span>
              </div>
            </div>

            <div v-if="isEarlyPayoff" class="form-control bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200">
              <label class="label pb-1"><span class="label-text font-medium text-green-700">ມອບສ່ວນຫຼຸດດອກເບ້ຍ (ກີບ)</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.discount_given)" @input="handleDiscountInput" class="input input-sm input-bordered w-full font-bold text-success" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ຊຳລະຕົ້ນທຶນ *</span></label>
                <input type="text" :value="formatCurrencyInput(paymentForm.principal_paid)" @input="handlePrincipalInput" class="input input-bordered w-full font-bold text-blue-600" required />
              </div>
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ຊຳລະດອກເບ້ຍ *</span></label>
                <input type="text" :value="formatCurrencyInput(paymentForm.interest_paid)" @input="handleInterestInput" class="input input-bordered w-full font-bold text-orange-500" required />
              </div>
            </div>

            <div class="form-control" v-if="paymentForm.expected_penalty > 0 || selectedSchedule?.payment_status === 'late'">
              <label class="label pb-1"><span class="label-text font-medium text-error">ຊຳລະຄ່າປັບໃໝຊັກຊ້າ *</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.penalty_paid)" @input="handlePenaltyInput" class="input input-bordered input-error w-full font-bold text-error" />
            </div>

            <div class="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 mt-2">
              <span class="font-medium text-blue-800 dark:text-blue-400">ລວມເງິນທີ່ຮັບຕົວຈິງ:</span>
              <span class="text-xl font-bold" :class="calculatedTotalReceived >= calculatedTotalExpected ? 'text-success' : 'text-error'">
                {{ formatPrice(calculatedTotalReceived) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ຊ່ອງທາງ *</span></label>
                <select v-model="paymentForm.payment_method" class="select select-bordered w-full">
                  <option value="cash">ເງິນສົດ</option>
                  <option value="transfer">ໂອນເງິນ</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label pb-1"><span class="label-text font-medium">ວັນທີຊຳລະ *</span></label>
                <input type="date" v-model="paymentForm.payment_date" class="input input-bordered w-full" required />
              </div>
            </div>

            <div class="form-control" v-if="paymentForm.payment_method === 'transfer'">
              <label class="label pb-1"><span class="label-text font-medium">ເລກອ້າງອີງ / Ref No.</span></label>
              <input type="text" v-model="paymentForm.reference_number" placeholder="ຕົວຢ່າງ: BCEL 0012..." class="input input-bordered w-full" />
            </div>

            <div class="form-control">
              <label class="label pb-1"><span class="label-text font-medium">ໝາຍເຫດ</span></label>
              <textarea v-model="paymentForm.remarks" class="textarea textarea-bordered h-20" placeholder="ລາຍລະອຽດການຊຳລະ..."></textarea>
            </div>
          </div>

          <div class="modal-action mt-6">
            <button class="btn btn-ghost" @click="showPaymentModal = false" :disabled="isProcessing">ຍົກເລີກ</button>
            <button class="btn btn-success text-white" @click="submitPayment" :disabled="isProcessing || calculatedTotalReceived <= 0">
              <span v-if="isProcessing" class="loading loading-spinner"></span>
              <span v-else>ຢືນຢັນການຊຳລະ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { alert } from '@/utils/alert'
import apiClient from '@/api/apiclient'

import { useLoanApplicationStore } from '@/stores/loanApplication'
import type { LoanApplication } from '@/types/loanApplication'

const loanAppStore = useLoanApplicationStore()

// ==========================================
// 1. State Management
// ==========================================
const isLoading = computed(() => loanAppStore.isLoading)
const isScheduleLoading = ref(false)
const isProcessing = ref(false)

const searchQuery = ref('')
const statusFilter = ref('active')

const currentSchedules = ref<any[]>([])

// Modals
const showRepaymentHub = ref(false)
const showPaymentModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const selectedSchedule = ref<any | null>(null)
const isEarlyPayoff = ref(false)

// 🟢 เพิ่มตัวแปร penalty และ discount ลงใน form
const paymentForm = reactive({
  expected_principal: 0,
  expected_interest: 0,
  expected_penalty: 0,

  principal_paid: 0,
  interest_paid: 0,
  penalty_paid: 0,
  discount_given: 0,

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
  unpaid: { class: 'badge-warning', text: 'ລໍຖ້າຊຳລະ' }, // 🟢 รับค่า unpaid จาก API
  late: { class: 'badge-error text-white', text: 'ກາຍກຳນົດ' }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const formatCurrencyInput = (val: number) => val ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';

// 🟢 Computed คำนวณยอดที่ควรจ่าย (รวมค่าปรับ หักส่วนลด)
const calculatedTotalExpected = computed(() => {
  return (paymentForm.expected_principal + paymentForm.expected_interest + paymentForm.expected_penalty) - paymentForm.discount_given;
});

// 🟢 Computed คำนวณยอดรับจริง (ต้น + ดอก + ค่าปรับ)
const calculatedTotalReceived = computed(() => {
  return paymentForm.principal_paid + paymentForm.interest_paid + paymentForm.penalty_paid;
});

// Input Handlers
const handleCurrencyInputGeneric = (field: keyof typeof paymentForm, e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  (paymentForm as any)[field] = Number(rawValue) || 0;
  target.value = formatCurrencyInput((paymentForm as any)[field]);
};

const handlePrincipalInput = (e: Event) => handleCurrencyInputGeneric('principal_paid', e);
const handleInterestInput = (e: Event) => handleCurrencyInputGeneric('interest_paid', e);
const handlePenaltyInput = (e: Event) => handleCurrencyInputGeneric('penalty_paid', e);
const handleDiscountInput = (e: Event) => {
  handleCurrencyInputGeneric('discount_given', e);
  // ถ้าให้ส่วนลด ดอกเบี้ยที่จ่ายจริงต้องลดลงตาม (ตัวอย่าง UX ที่ดี)
  const newExpectedInterest = Math.max(0, paymentForm.expected_interest - paymentForm.discount_given);
  paymentForm.interest_paid = newExpectedInterest;
};

const getCustomerName = (loan: LoanApplication) => {
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'ບໍ່ມີຊື່';
}

const hasApprovedDelivery = (loan: any): boolean => {
  if (Array.isArray(loan.delivery_receipt)) {
    return loan.delivery_receipt.some((receipt: any) => receipt.status === 'approved');
  }
  if (Array.isArray(loan.delivery_receipts)) {
    return loan.delivery_receipts.some((receipt: any) => receipt.status === 'approved');
  }
  if (loan.delivery_receipt && typeof loan.delivery_receipt === 'object') {
    return loan.delivery_receipt.status === 'approved';
  }
  if (loan.delivery_receipts && typeof loan.delivery_receipts === 'object') {
    return loan.delivery_receipts.status === 'approved';
  }
  return false;
}

// ==========================================
// 3. Computed (Logic ກັ່ນຕອງຂໍ້ມູນ)
// ==========================================
const filteredLoans = computed(() => {
  let loans = loanAppStore.loanApplications || [];

  loans = loans.filter((loan: any) => loan.status === 'approved');

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    loans = loans.filter((loan: any) =>
      getCustomerName(loan).toLowerCase().includes(q) ||
      (loan.customer?.phone || '').includes(q) ||
      (loan.loan_id || loan.id?.toString()).toLowerCase().includes(q)
    );
  }

  return loans;
});

// ຄຳນວນຍອດໜີ້ອັດຕະໂນມັດຈາກຕາຕະລາງທີ່ໂຫຼດມາ
const summary = computed(() => {
  let totalPayable = 0;
  let totalPaid = 0;

  if (Array.isArray(currentSchedules.value)) {
    currentSchedules.value.forEach(sch => {
      totalPayable += Number(sch.total_due) || 0; // 🟢 ใช้ key จาก API
      if (sch.payment_status === 'paid') {        // 🟢 ใช้ key จาก API
        totalPaid += Number(sch.total_due) || 0;
      }
    });
  }

  return {
    totalPayable,
    totalPaid,
    remainingBalance: Math.max(0, totalPayable - totalPaid)
  };
});

// ==========================================
// 4. Actions
// ==========================================
const fetchLoans = async () => {
  try {
    await loanAppStore.fetchLoanApplications({
      is_confirmed: 1,
      status: 'approved' as any,
      limit: 100
    });
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
}

const openRepaymentHub = async (loan: LoanApplication) => {
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    const res = await loanAppStore.fetchRepaymentSchedule(loan.id);
    const data = res?.data || res || [];
    currentSchedules.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຕາຕະລາງການຜ່ອນຊຳລະໄດ້');
    currentSchedules.value = [];
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

  // 🟢 ดึงยอดตามจริงจาก API
  const expectedPrincipal = earlyPayoff ? summary.value.remainingBalance : Number(schedule.principal_amount);
  const expectedInterest = earlyPayoff ? 0 : Number(schedule.interest_amount);
  const expectedPenalty = schedule ? Number(schedule.penalty || 0) : 0; // 🟢 ดึงค่าปรับจาก Backend (ถ้ามี)

  Object.assign(paymentForm, {
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    remarks: '',

    expected_principal: expectedPrincipal,
    expected_interest: expectedInterest,
    expected_penalty: expectedPenalty,

    principal_paid: expectedPrincipal,
    interest_paid: expectedInterest,
    penalty_paid: expectedPenalty,
    discount_given: 0,

    installment_number: earlyPayoff ? 0 : schedule.installment_no
  });

  showPaymentModal.value = true;
}

// 🟢 ບັນທຶກການຊຳລະເງິນ
const submitPayment = async () => {
  isProcessing.value = true;
  try {
    const payload = {
      loan_id: selectedLoan.value?.id,
      schedule_id: selectedSchedule.value?.id || null,
      is_early_payoff: isEarlyPayoff.value,

      // 🟢 ส่งข้อมูลทางการเงินแบบแยกละเอียดไปให้ Backend
      paid_principal: paymentForm.principal_paid,
      paid_interest: paymentForm.interest_paid,
      paid_penalty: paymentForm.penalty_paid,
      discount_amount: paymentForm.discount_given,
      total_paid: calculatedTotalReceived.value, // ยอดรับรวม

      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference_number: paymentForm.reference_number,
      remarks: paymentForm.remarks
    };

    await apiClient.post('/repayments/pay', payload);

    alert.success('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ!');
    showPaymentModal.value = false;

    if (selectedLoan.value) {
      await openRepaymentHub(selectedLoan.value);
    }
  } catch (error: any) {
    alert.error('ເກີດຂໍ້ຜິດພາດໃນການຊຳລະ', error.response?.data?.message || error.message);
  } finally {
    isProcessing.value = false;
  }
}

onMounted(() => {
  fetchLoans();
});
</script>

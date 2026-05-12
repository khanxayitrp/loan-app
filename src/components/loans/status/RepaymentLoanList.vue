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
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາເລກທີສັນຍາ, ຊື່, ເບີໂທ..."
          class="input input-bordered w-full" />
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
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ລູກຄ້າ</th>
            <th>ຍອດຈັດສິນເຊື່ອ</th>
            <th>ຄ່າຜ່ອນ/ງວດ</th>
            <th>ສະຖານະ</th>
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
            <td><span class="badge badge-sm badge-success text-white">ອະນຸມັດແລ້ວ</span></td>
            
            <!-- 🌟 🟢 ແກ້ໄຂຈຸດນີ້: ເປີດໃຫ້ກົດຊຳລະໄດ້ຕະຫຼອດ ແຕ່ເຕືອນຖ້າຍັງບໍ່ມອບຮັບ -->
            <td class="text-center">
              <div class="flex flex-col items-center justify-center gap-1">
                <button class="btn btn-sm btn-primary btn-soft" @click="openRepaymentHub(loan)">
                  <span class="icon-[tabler--wallet] size-4 mr-1"></span> ຈັດການຊຳລະ
                </button>
                <div v-if="!hasApprovedDelivery(loan)" class="text-[10px] font-medium text-warning flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded">
                  <span class="icon-[tabler--alert-circle] size-3"></span> ຍັງບໍ່ມອບຮັບ
                </div>
              </div>
            </td>

          </tr>
          <tr v-if="!filteredLoans.length">
            <td colspan="6" class="text-center py-8 text-gray-500">ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <teleport to="body">
      <div v-if="showRepaymentHub"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] flex flex-col relative">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="closeRepaymentHub">✕</button>
          <h3 class="font-bold text-xl mb-4 border-b pb-2 pr-8">ຂໍ້ມູນການຜ່ອນຊຳລະ - #{{ selectedLoan?.loan_id ||
            selectedLoan?.id }}</h3>

          <div v-if="isScheduleLoading" class="flex justify-center py-10"><span
              class="loading loading-spinner loading-lg text-primary"></span></div>
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
                <button v-if="summary.remainingBalance > 0" class="btn btn-error text-white w-full h-full shadow-sm"
                  @click="openPaymentModal(null, true)">
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
                  <tr v-for="sch in currentSchedules" :key="sch.id"
                    :class="{ 'bg-green-50/50 dark:bg-green-900/20': sch.payment_status === 'paid' }">
                    <td class="font-medium text-center">{{ sch.installment_no }}</td>
                    <td>{{ formatDate(sch.due_date) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.principal_amount) }}</td>
                    <td class="text-gray-500">{{ formatPrice(sch.interest_amount) }}</td>
                    <td class="font-bold">{{ formatPrice(sch.total_due) }}</td>
                    <td>
                      <span class="badge badge-sm" :class="statusConfig[sch.payment_status]?.class || 'badge-ghost'">
                        {{ statusConfig[sch.payment_status]?.text || sch.payment_status }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button v-if="sch.payment_status !== 'paid'" class="btn btn-xs btn-success text-white"
                        @click="openPaymentModal(sch, false)">
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
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showPaymentModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto relative max-h-[95vh] overflow-y-auto">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            @click="showPaymentModal = false">✕</button>

          <h3 class="font-bold text-xl mb-4 text-success border-b pb-2 flex items-center gap-2 pr-8">
            <span class="icon-[tabler--receipt-2] size-6"></span>
            {{ isEarlyPayoff ? 'ປິດບັນຊີກ່ອນກຳນົດ (Pay Off)' : `ຊຳລະຄ່າງວດທີ ${paymentForm.installment_number}` }}
          </h3>

          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border text-center relative overflow-hidden">
              <div v-if="isEarlyPayoff" class="absolute top-0 left-0 w-full h-1 bg-warning"></div>

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

            <!-- 🌟 🟢 ເພີ່ມໃໝ່: Dropdown ເລືອກຈຳນວນເດືອນດອກເບ້ຍສຳລັບປິດກ່ອນກຳນົດ -->
            <div v-if="isEarlyPayoff" class="form-control bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
              <label class="label pb-1">
                <span class="label-text font-medium text-blue-800">ຈຳນວນເດືອນດອກເບ້ຍທີ່ຕ້ອງຈ່າຍ (ເງື່ອນໄຂປິດກ່ອນ)</span>
              </label>
              <select v-model.number="paymentForm.payoff_months_to_charge" @change="recalculatePayoffInterest" class="select select-sm select-bordered w-full font-bold text-blue-700">
                <option v-for="n in 12" :key="n" :value="n">ຈ່າຍດອກເບ້ຍ {{ n }} ເດືອນ</option>
                <option :value="0">ຍົກເວັ້ນດອກເບ້ຍ (0 ເດືອນ)</option>
              </select>
              <p class="text-xs text-blue-600 mt-1">
                * ຖ້າງວດຍັງເຫຼືອຫຼາຍກວ່າ 6 ງວດ, ລະບົບຈະຕັ້ງຄ່າເລີ່ມຕົ້ນໃຫ້ເກັບດອກເບ້ຍລ່ວງໜ້າ 5 ເດືອນ
              </p>
            </div>

            <div v-if="isEarlyPayoff" class="form-control bg-green-50 p-3 rounded-lg border border-green-200">
              <label class="label pb-1"><span class="label-text font-medium text-green-700">ມອບສ່ວນຫຼຸດ
                  (ກີບ)</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.discount_given)" @input="handleDiscountInput"
                class="input input-sm input-bordered w-full font-bold text-success" />
            </div>

            <div class="form-control mt-4">
              <label class="label pb-1"><span class="label-text font-bold text-lg text-blue-700">ຍອດເງິນທີ່ຮັບຈາກລູກຄ້າ
                  (ກີບ) *</span></label>
              <input type="text" :value="formatCurrencyInput(paymentForm.amount_received)" @input="handleAmountInput"
                class="input input-lg input-bordered w-full font-bold text-2xl text-primary bg-blue-50/50"
                placeholder="0" required />
            </div>

            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border">
              <p class="text-xs text-gray-500 mb-2 font-medium">ລະບົບຈະຈັດສັນເງິນອັດຕະໂນມັດ (Auto-Waterfall):</p>
              <div class="grid grid-cols-3 gap-2 text-sm text-center">
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ຄ່າປັບໃໝ</span>
                  <span class="font-bold text-error">{{ formatPrice(waterfallPreview.penalty) }}</span>
                </div>
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ດອກເບ້ຍ</span>
                  <span class="font-bold text-orange-500">{{ formatPrice(waterfallPreview.interest) }}</span>
                </div>
                <div class="flex flex-col p-1 bg-white rounded border">
                  <span class="text-xs text-gray-500">ຕົ້ນທຶນ</span>
                  <span class="font-bold text-blue-600">{{ formatPrice(waterfallPreview.principal) }}</span>
                </div>
              </div>

              <div v-if="waterfallPreview.overpay > 0" class="mt-2 pt-2 border-t flex justify-between text-success">
                <span class="font-medium">ເງິນທອນ / ຈ່າຍເກີນໄປງວດໜ້າ:</span>
                <span class="font-bold">+{{ formatPrice(waterfallPreview.overpay) }}</span>
              </div>
              <div v-else-if="paymentForm.amount_received > 0 && paymentForm.amount_received < calculatedTotalExpected"
                class="mt-2 pt-2 border-t flex justify-between text-warning">
                <span class="font-medium">ຍອດຍັງຄ້າງ (ໜີ້ຍົກໄປ):</span>
                <span class="font-bold">{{ formatPrice(calculatedTotalExpected - paymentForm.amount_received) }}</span>
              </div>
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
              <input type="text" v-model="paymentForm.reference_number" placeholder="ຕົວຢ່າງ: BCEL 0012..."
                class="input input-bordered w-full" />
            </div>

            <div class="form-control mt-4" v-if="paymentForm.payment_method === 'transfer'">
              <label class="label pb-1"><span class="label-text font-medium text-blue-700">ຫຼັກຖານການໂອນ (Slip)
                  *</span></label>

              <div class="flex items-start gap-4">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 w-full md:w-1/2 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all"
                  @click="triggerSlipUpload">
                  <input ref="slipInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                    @change="handleSlipUpload" />
                  <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                  <p class="text-sm text-gray-500 font-medium">ອັບໂຫຼດຮູບສະລິບ</p>
                </div>

                <div v-if="paymentForm.slip_preview"
                  class="relative w-24 h-32 rounded-lg border shadow-sm overflow-hidden">
                  <img :src="paymentForm.slip_preview" class="w-full h-full object-cover" />
                  <button type="button" class="btn btn-circle btn-error btn-xs absolute top-1 right-1"
                    @click.stop="removeSlip">
                    <span class="icon-[tabler--x] size-3"></span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label pb-1"><span class="label-text font-medium">ໝາຍເຫດ</span></label>
              <textarea v-model="paymentForm.remarks" class="textarea textarea-bordered h-16"
                placeholder="ລາຍລະອຽດການຊຳລະ..."></textarea>
            </div>
          </div>

          <div class="modal-action mt-6">
            <button class="btn btn-ghost" @click="showPaymentModal = false" :disabled="isProcessing">ຍົກເລີກ</button>
            <button class="btn btn-success text-white w-32" @click="submitPayment"
              :disabled="isProcessing || paymentForm.amount_received <= 0">
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
import { ref, reactive, computed, onMounted, toRaw } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { alert } from '@/utils/alert'
import apiClient from '@/api/apiclient'

import { useLoanApplicationStore } from '@/stores/loanApplication'
import type { LoanApplication } from '@/types/loanApplication'
import { LoanApplicationStatus } from '@/types/loanApplication';

const loanAppStore = useLoanApplicationStore()

// State Management
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

// 🌟 ເພີ່ມ ref ສຳລັບ input file
const slipInput = ref<HTMLInputElement | null>(null);

// 🌟 ການປ່ຽນແປງຫຼັກ: Payment Form 🌟
const paymentForm = reactive({
  expected_principal: 0,
  expected_interest: 0,
  expected_penalty: 0,

  // 🌟 ເພີ່ມ 2 ຕົວແປນີ້ເຂົ້າໄປ
  payoff_months_to_charge: 5, 
  base_monthly_interest: 0,

  amount_received: 0, // ປ້ອນພຽງຊ່ອງດຽວ
  discount_given: 0,

  payment_method: 'cash',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  remarks: '',
  installment_number: 0,

  // 🌟 ຂໍ້ມູນສຳລັບອັບໂຫຼດຮູບ
  slip_file: null as File | null,
  slip_preview: '' as string
})

// Formatters
const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'badge-success text-white', text: 'ຊຳລະແລ້ວ' },
  unpaid: { class: 'badge-warning', text: 'ລໍຖ້າຊຳລະ' },
  partial: { class: 'badge-info', text: 'ຈ່າຍບາງສ່ວນ' },
  overdue: { class: 'badge-error text-white', text: 'ກາຍກຳນົດ' }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const formatCurrencyInput = (val: number) => val ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';

const triggerSlipUpload = () => {
  if (slipInput.value) slipInput.value.click();
}

// 🌟 ຟັງຊັນຄຳນວນຍອດໃໝ່ເມື່ອມີການປ່ຽນ Dropdown
const recalculatePayoffInterest = () => {
  paymentForm.expected_interest = paymentForm.base_monthly_interest * paymentForm.payoff_months_to_charge;
  
  // ອັບເດດຍອດທີ່ຕ້ອງຮັບຈາກລູກຄ້າໃໝ່
  paymentForm.amount_received = paymentForm.expected_principal + paymentForm.expected_interest + paymentForm.expected_penalty;
}

const handleSlipUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB');
      return;
    }

    paymentForm.slip_file = file; // ເກັບ File Object ໄວ້ສົ່ງ API
    paymentForm.slip_preview = URL.createObjectURL(file); // ສ້າງ Preview ລໍຖ້າ
  }
}

const removeSlip = () => {
  paymentForm.slip_file = null;
  paymentForm.slip_preview = '';
  if (slipInput.value) slipInput.value.value = '';
}

// 🌟 Computed: ຄຳນວນຍອດທີ່ຕ້ອງຈ່າຍ (ຫຼັງຫັກສ່ວນຫຼຸດ) 🌟
const calculatedTotalExpected = computed(() => {
  return Math.max(0, (paymentForm.expected_principal + paymentForm.expected_interest + paymentForm.expected_penalty) - paymentForm.discount_given);
});

// 🌟 Computed: ຈຳລອງການຕັດນ້ຳຕົກ (Auto Waterfall Preview) 🌟
const waterfallPreview = computed(() => {
  let remainingCash = paymentForm.amount_received || 0;

  // 1. ຫັກສ່ວນຫຼຸດອອກຈາກຄ່າປັບໃໝກ່ອນ (ຖ້າເຫຼືອຄ່ອຍໄປລົບດອກເບ້ຍ)
  let actualPenalty = Math.max(0, paymentForm.expected_penalty - paymentForm.discount_given);
  let remainingDiscount = Math.max(0, paymentForm.discount_given - paymentForm.expected_penalty);
  let actualInterest = Math.max(0, paymentForm.expected_interest - remainingDiscount);

  // 2. ນ້ຳຕົກຂັ້ນທີ 1: ຕັດຄ່າປັບໃໝ
  const penaltyAllocated = Math.min(remainingCash, actualPenalty);
  remainingCash -= penaltyAllocated;

  // 3. ນ້ຳຕົກຂັ້ນທີ 2: ຕັດດອກເບ້ຍ
  const interestAllocated = Math.min(remainingCash, actualInterest);
  remainingCash -= interestAllocated;

  // 4. ນ້ຳຕົກຂັ້ນທີ 3: ຕັດຕົ້ນທຶນ
  const principalAllocated = Math.min(remainingCash, paymentForm.expected_principal);
  remainingCash -= principalAllocated;

  return {
    penalty: penaltyAllocated,
    interest: interestAllocated,
    principal: principalAllocated,
    overpay: remainingCash // ເງິນທອນ ຫຼື ຈ່າຍເກີນໄປງວດໜ້າ
  };
});

// Input Handlers
const handleCurrencyInputGeneric = (field: keyof typeof paymentForm, e: Event) => {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/,/g, '').replace(/[^\d]/g, '');
  (paymentForm as any)[field] = Number(rawValue) || 0;
  target.value = formatCurrencyInput((paymentForm as any)[field]);
};

const handleAmountInput = (e: Event) => handleCurrencyInputGeneric('amount_received', e);
const handleDiscountInput = (e: Event) => handleCurrencyInputGeneric('discount_given', e);

const getCustomerName = (loan: LoanApplication) => {
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'ບໍ່ມີຊື່';
}

// 🌟 ຟັງຊັນກວດສອບການມອບຮັບສິນຄ້າ (ຍຶດ document_signatures ເປັນຫຼັກ)
const hasApprovedDelivery = (loan: any): boolean => {
  if (!loan) return false;

  // 1. ຖ້າ Backend ສົ່ງ `document_signatures` ມາ (ເຖິງຈະເປັນ Array ວ່າງເປົ່າກໍຕາມ)
  // ໃຫ້ຍຶດຕາຕະລາງນີ້ເປັນ "ຄວາມຈິງສູງສຸດ (Single Source of Truth)" ທັນທີ
  if (loan.document_signatures !== undefined) {
    if (Array.isArray(loan.document_signatures)) {
      return loan.document_signatures.some((sig: any) => 
        sig.document_type === 'delivery_note' && sig.status === 'signed'
      );
    }
    return false; // ຖ້າມີ Field ນີ້ ແຕ່ບໍ່ມີຄົນເຊັນ (Array ວ່າງເປົ່າ) ຖືວ່າຍັງບໍ່ມອບຮັບ!
  }

  // 2. Fallback: ຈະເຮັດວຽກກໍຕໍ່ເມື່ອ Backend ບໍ່ໄດ້ include `document_signatures` ມາໃຫ້ເທົ່ານັ້ນ
  if (loan.delivery_receipt) {
    if (Array.isArray(loan.delivery_receipt)) {
      return loan.delivery_receipt.some((receipt: any) => receipt.status === 'approved');
    } else if (typeof loan.delivery_receipt === 'object') {
      return loan.delivery_receipt.status === 'approved';
    }
  }

  if (loan.delivery_receipts) {
    if (Array.isArray(loan.delivery_receipts)) {
      return loan.delivery_receipts.some((receipt: any) => receipt.status === 'approved');
    } else if (typeof loan.delivery_receipts === 'object') {
      return loan.delivery_receipts.status === 'approved';
    }
  }

  return false;
}

// Filters & Summary
const filteredLoans = computed(() => {
  let loans = loanAppStore.loanApplications || [];
  // loans = loans.filter((loan: any) => loan.status === 'approved' || loan.status === 'disbursed'); // 🟢 ແກ້ໄຂເພີ່ມ disbursed ເຂົ້າໄປເພື່ອໃຫ້ເຫັນຂໍ້ມູນແນ່ນອນ
  loans = loans.filter((loan: any) => {
      // เอาเฉพาะสินเชื่อที่ถูกปล่อยแล้ว (disbursed) หรือ สถานะ active (ถ้ามีการส่งมาจาก Backend แบบนี้)
      return loan.status === 'disbursed' || loan.status === 'active'; 
  });
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

const summary = computed(() => {
  let totalPayable = 0;
  let totalPaid = 0;
  if (Array.isArray(currentSchedules.value)) {
    currentSchedules.value.forEach(sch => {
      totalPayable += Number(sch.total_due) || 0;
      if (sch.payment_status === 'paid') {
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

// Actions
const fetchLoans = async () => {
  try {
    await loanAppStore.fetchLoanApplications({ is_confirmed: 1, status: LoanApplicationStatus.DISBURSED, limit: 100 });
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message);
  }
}

const openRepaymentHub = async (loan: LoanApplication) => {
  currentSchedules.value = [];
  selectedSchedule.value = null;
  isEarlyPayoff.value = false;
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

const openPaymentModal = async (schedule: any | null, earlyPayoff = false) => {
  isEarlyPayoff.value = earlyPayoff;
  selectedSchedule.value = schedule;

  if (earlyPayoff) {
    try {
      isProcessing.value = true;
      const res = await apiClient.get(`repayments/early-payoff/${selectedLoan.value?.id}`);
      const payoffData = res.data.data;

      // const totalOwed = Number(payoffData.remaining_principal) + Number(payoffData.calculated_interest) + Number(payoffData.total_penalty);

      // Object.assign(paymentForm, {
      //   payment_date: new Date().toISOString().split('T')[0],
      //   payment_method: 'cash',
      //   reference_number: '',
      //   remarks: 'ປິດບັນຊີກ່ອນກຳນົດ (Early Payoff)',

      //   expected_principal: Number(payoffData.remaining_principal),
      //   expected_interest: Number(payoffData.calculated_interest),
      //   expected_penalty: Number(payoffData.total_penalty),

      //   amount_received: totalOwed, // 🌟 ຕັ້ງຄ່າ Default ໃຫ້ເທົ່າກັບຍອດໜີ້
      //   discount_given: 0,
      //   installment_number: 0
      // });

      // 🌟 🟢 Logic ໃໝ່: ນັບຈຳນວນງວດທີ່ເຫຼືອ ແລະ ດຶງຄ່າດອກເບ້ຍຕໍ່ເດືອນ
      const unpaidSchedules = currentSchedules.value.filter(s => s.payment_status !== 'paid');
      const remainingCount = unpaidSchedules.length;
      const monthlyInt = Number(unpaidSchedules[0]?.interest_amount || 0);

      // ເງື່ອນໄຂ: ຖ້າເຫຼືອ > 6 ງວດ ໃຫ້ເກັບ 5 ເດືອນ. ຖ້າເຫຼືອໜ້ອຍກວ່ານັ້ນ ໃຫ້ເກັບຕາມຈຳນວນທີ່ເຫຼືອຈິງ
      let defaultChargeMonths = remainingCount > 6 ? 5 : remainingCount;

      Object.assign(paymentForm, {
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        remarks: 'ປິດບັນຊີກ່ອນກຳນົດ (Early Payoff)',

        expected_principal: Number(payoffData.remaining_principal),
        expected_penalty: Number(payoffData.total_penalty),
        
        // 🌟 ອັບເດດຄ່າເລີ່ມຕົ້ນໃໝ່
        base_monthly_interest: monthlyInt,
        payoff_months_to_charge: defaultChargeMonths,
        
        discount_given: 0,
        installment_number: 0
      });

      // 🌟 ຄຳນວນຍອດດອກເບ້ຍ ແລະ ຍອດລວມທີ່ຕ້ອງຈ່າຍເບື້ອງຕົ້ນ
      recalculatePayoffInterest();

      showPaymentModal.value = true;
    } catch (error: any) {
      alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດຄຳນວນຍອດປິດບັນຊີໄດ້');
    } finally {
      isProcessing.value = false;
    }

  } else {
    // ກໍລະນີຈ່າຍປົກກະຕິ
    const expectedPrincipal = (Number(schedule.principal_amount) || 0) - (Number(schedule.paid_principal) || 0);
    const expectedInterest = (Number(schedule.interest_amount) || 0) - (Number(schedule.paid_interest) || 0);
    const expectedPenalty = (Number(schedule.penalty) || 0) - (Number(schedule.paid_penalty) || 0); // ✅ เพิ่มการลบ paid_penalty
    const totalOwed = expectedPrincipal + expectedInterest + expectedPenalty;

    Object.assign(paymentForm, {
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      remarks: '',

      expected_principal: Math.max(0, expectedPrincipal),
      expected_interest: Math.max(0, expectedInterest),
      expected_penalty: Math.max(0, expectedPenalty),

      amount_received: totalOwed, // 🌟 ຕັ້ງຄ່າ Default ໃຫ້ເທົ່າກັບຍອດໜີ້ຂອງງວດນີ້
      discount_given: 0,
      installment_number: schedule.installment_no
    });

    showPaymentModal.value = true;
  }
}

// 🌟 ການປ່ຽນແປງຫຼັກ: ປັບ Payload ສົ່ງໄປ API 🌟
const submitPayment = async () => {
  // ກວດສອບກ່ອນວ່າ ຖ້າໂອນເງິນ ຕ້ອງມີຮູບສະລິບ
  if (paymentForm.payment_method === 'transfer' && !paymentForm.slip_file) {
    alert.error('ກະລຸນາແນບຮູບຫຼັກຖານການໂອນເງິນ (Slip)');
    return;
  }
  isProcessing.value = true;
  try {
    const payload = {
      application_id: selectedLoan.value?.id,
      schedule_id: selectedSchedule.value?.id || null,
      is_early_payoff: isEarlyPayoff.value,

      // 🌟 ສົ່ງຈຳນວນເດືອນດອກເບ້ຍໄປໃຫ້ Backend ຄຳນວນຄວາມຖືກຕ້ອງ
      payoff_interest_months: isEarlyPayoff.value ? paymentForm.payoff_months_to_charge : null,

      // ສົ່ງແຄ່ຍອດລວມທີ່ຮັບມາ ໃຫ້ Backend ເປັນຄົນຈຳແນກເອງ (Source of Truth)
      amount_paid: paymentForm.amount_received,
      discount_amount: paymentForm.discount_given,

      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference_number: paymentForm.reference_number,
      remarks: paymentForm.remarks
    };

    const response = await apiClient.post('/repayments/pay', payload);

    // ສົມມຸດວ່າ Backend ສົ່ງ transaction_id ກັບຄືນມາຫຼັງຈາກບັນທຶກສຳເລັດ
    // ເຊັ່ນ: res.data.data.transaction_id
    const transactionId = response.data?.data?.receipt?.id;

    // ==========================================
    // 🟢 Step 2: ອັບໂຫຼດຮູບສະລິບ
    // ==========================================
    if (paymentForm.payment_method === 'transfer' && paymentForm.slip_file && transactionId) {
      try {
        const formData = new FormData();
        formData.append('file', toRaw(paymentForm.slip_file)); // 🌟 แก้ชื่อ key ให้ตรงกับ middleware (uploadPaymentProof.single('file'))

        // 🌟 ยิง API ไปที่ Endpoint ของ Upload Controller
        await apiClient.post(`/upload/payment/${transactionId}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (uploadErr) {
        console.error('Failed to upload slip:', uploadErr);
        alert.error('ຕັດຍອດສຳເລັດ! ແຕ່ການອັບໂຫຼດຮູບສະລິບຂັດຂ້ອງ. ກະລຸນາອັບໂຫຼດໃໝ່ພາຍຫຼັງ.');
      }
    }

    // ==========================================
    // 🟢 Step 3: ແຈ້ງເຕືອນສຳເລັດ ແລະ ໂຫຼດຂໍ້ມູນໃໝ່
    // ==========================================
    if (response.data?.data?.change > 0) {
      alert.info(`ບັນທຶກສຳເລັດ! ມີເງິນທອນຄືນລູກຄ້າ: ${formatPrice(response.data.data.change)} ກີບ`);
    } else {
      alert.success('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ!');
    }

    // Reset ຟອມຮູບພາບ
    removeSlip();

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
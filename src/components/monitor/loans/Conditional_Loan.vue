<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອອະນຸມັດແບບມີເງື່ອນໄຂ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ລາຍການສິນເຊື່ອທີ່ອະນຸມັດ ແຕ່ມີຄະແນນປະເມີນລະຫວ່າງ 65 - 79</p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchLoans" class="btn btn-outline btn-sm">
          <span class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap"
          :disabled="isLoading || displayedLoans.length === 0">
          <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
        </button>
        <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success"
          :disabled="isLoading || displayedLoans.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ຄົ້ນຫາ</span>
        </label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full" @input="debounceSearch" />
      </div>

      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະການຈ່າຍເງິນ</span>
        </label>
        <select v-model="disbursementFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending_disbursement">ຍັງບໍ່ໄດ້ຈ່າຍເງິນ (Approved)</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ (Disbursed)</option>
        </select>
      </div>

      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ວັນທີ່ອະນຸມັດ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="text-gray-500 mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-base-200">
          <tr>
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ເລກທີ່ສັນຍາ</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ລາຄາສິນຄ້າ</th>
            <th>ເງິນວາງດາວ</th>
            <th>ຈຳນວນຍອດຈັດ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ຄະແນນ</th>
            <th>ສະຖານະການຈ່າຍ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ອະນຸມັດ</th>
            <th class="w-24 text-center">ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id" class="hover:bg-base-200 transition-colors">
            <td class="font-mono text-primary font-medium">#{{ loan.loan_id || loan.id }}</td>
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ getContractNumber(loan) }}</td>
            <td class="font-medium">{{ getCustomerName(loan) }}</td>
            <td>{{ getCustomerPhone(loan) }}</td>
            <td class="font-medium text-blue-600">
              {{ formatPrice(Number(loan.total_amount || 0)) }}
            </td>
            <td class="font-medium text-blue-600">
              {{ formatPrice(Number(loan.down_payment || 0)) }}
            </td>
            <td class="font-medium text-blue-600">
              {{ formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)) }}
            </td>
            <td>{{ loan.interest_rate_at_apply }}%</td>
            <td>{{ loan.loan_period }} ເດືອນ</td>
            <td>
              <span class="badge badge-warning font-bold text-white">
                {{ loan.credit_score || 0 }}
              </span>
            </td>
            <td>
              <span class="badge badge-sm text-white" :class="getDisbursementBadgeClass(loan)">
                {{ getDisbursementStatusText(loan) }}
              </span>
            </td>
            <td>{{ loan.approver?.username || '-' }}</td>
            <td>{{ formatDate(loan.approved_at || loan.updatedAt || loan.createdAt) }}</td>
            <td>
              <div class="flex justify-center gap-2">
                <button class="btn btn-circle btn-soft btn-info btn-sm" @click="viewLoanDetails(loan)"
                  aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <!-- <button v-if="hasContract(loan)" class="btn btn-circle btn-soft btn-primary btn-sm"
                  @click="openSignatureModal(loan)" aria-label="Manage signatures">
                  <span class="icon-[tabler--signature] size-4"></span>
                </button> -->

                <button v-if="loan.status === 'disbursed'" class="btn btn-circle btn-soft btn-warning btn-sm"
                  @click="openRepaymentHub(loan)" aria-label="View Repayment">
                  <span class="icon-[tabler--calendar-stats] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="11" class="text-center py-10 text-gray-500">
              <span class="icon-[tabler--database-off] size-8 block mx-auto mb-2 opacity-50"></span>
              ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທັງໝົດ {{ totalLoans }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-info] text-primary size-6"></span> ລາຍລະອຽດສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
            </h3>
            <button @click="closeDetailsModal" class="btn btn-ghost btn-circle btn-sm">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono font-bold text-primary">{{ selectedLoan.loan_id || '-' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ສະຖານະ</label>
                <span class="badge badge-sm"
                  :class="selectedLoan.status === 'disbursed' ? 'badge-success text-white' : 'badge-info text-white'">
                  {{ selectedLoan.status === 'disbursed' ? 'ຈ່າຍເງິນແລ້ວ' : 'ອະນຸມັດແລ້ວ' }}
                </span>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຊື່ລູກຄ້າ</label>
                <p class="font-medium">{{ getCustomerName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ເບີໂທ</label>
                <p class="font-medium">{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຊື່ສິນຄ້າ</label>
                <p class="font-medium">{{ selectedLoan.product?.product_name || '-' }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຍອດຈັດສິນເຊື່ອຈິງ</label>
                <p class="font-bold text-blue-600">{{ formatPrice(Number(selectedLoan.total_amount || 0) -
                  Number(selectedLoan.down_payment || 0)) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ດອກເບ້ຍ</label>
                <p class="font-medium">{{ selectedLoan.interest_rate_at_apply }}%</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ໄລຍະເວລາ</label>
                <p class="font-medium">{{ selectedLoan.loan_period }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຄະແນນການປະເມີນ</label>
                <p class="font-bold" :class="(selectedLoan.credit_score || 0) >= 80 ? 'text-success' : 'text-warning'">
                  {{ selectedLoan.credit_score || 0 }} ຄະແນນ
                </p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p class="font-medium">{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <label class="text-xs text-gray-500 block mb-1">ທີ່ຢູ່ປັດຈຸບັນ</label>
              <p class="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{{ selectedLoan.customer?.address ||
                'ບໍ່ມີຂໍ້ມູນທີ່ຢູ່' }}</p>
            </div>

            <div v-if="(selectedLoan as any).delivery_receipt" class="border-t pt-4">
              <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100">
                <h4 class="font-bold text-blue-800 flex items-center gap-2 mb-3">
                  <span class="icon-[tabler--file-invoice] size-5"></span> ຂໍ້ມູນໃບມອບຮັບສິນຄ້າ
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label class="text-blue-600/80 block text-xs">ເລກທີ່ໃບມອບຮັບ</label>
                    <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receipts_id }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ຊື່ຜູ້ຮັບສິນຄ້າ</label>
                    <p class="font-medium">{{ (selectedLoan as any).delivery_receipt.receiver_name }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ວັນທີມອບຮັບ</label>
                    <p class="font-medium">{{ formatDate((selectedLoan as any).delivery_receipt.delivery_date) }}</p>
                  </div>
                  <div>
                    <label class="text-blue-600/80 block text-xs">ສະຖານະມອບຮັບ</label>
                    <span class="badge badge-sm mt-1"
                      :class="(selectedLoan as any).delivery_receipt.status === 'approved' ? 'badge-success text-white' : 'badge-warning'">
                      {{ (selectedLoan as any).delivery_receipt.status === 'approved' ? 'ອະນຸມັດແລ້ວ' :
                        'ລໍຖ້າການອະນຸມັດ' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="border-t pt-4">
              <div class="alert alert-warning shadow-sm py-2">
                <span class="icon-[tabler--alert-circle] size-5"></span>
                <span class="text-sm">ຍັງບໍ່ມີຂໍ້ມູນການມອບຮັບສິນຄ້າ</span>
              </div>
            </div>

            <p class="text-xs text-gray-400 text-right mt-2">
              ອະນຸມັດເມື່ອ: {{ formatDate(selectedLoan.approved_at || selectedLoan.updatedAt || selectedLoan.createdAt)
              }}
            </p>
          </div>

          <div class="flex flex-wrap justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-outline btn-warning" @click="openScheduleModal(selectedLoan)">
              <span class="icon-[tabler--calendar-stats] size-4 mr-1"></span> ເບິ່ງຕາຕະລາງຜ່ອນ
            </button>
            <button class="btn btn-outline btn-info" @click="openDraftContractModal">
              <span class="icon-[tabler--file-certificate] size-4 mr-1"></span> ເບິ່ງຮ່າງສັນຍາ
            </button>
            <button class="btn btn-soft btn-secondary w-full sm:w-auto" @click="closeDetailsModal">
              ປິດໜ້າຈໍ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showContractModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-certificate] text-info size-6"></span> ຮ່າງສັນຍາກູ້ຢືມ
            </h3>
            <button @click="showContractModal = false"
              class="btn btn-circle btn-ghost btn-sm bg-gray-100 hover:bg-gray-200">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <LoanContractForm v-if="selectedContract" :loan-contract-id="selectedLoan?.id"
            :loan-application="selectedLoan" :loan-contract="selectedContract" :is-editing="false" :view-only="true"
            @cancel-edit="showContractModal = false" />
          <div v-else class="text-center py-10 text-gray-500">
            <div class="loading loading-spinner loading-lg text-primary"></div>
            <p class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນສັນຍາ...</p>
          </div>
        </div>
      </div>
    </teleport>

    <LoanScheduleModal :show="showScheduleModal" :loan="loanForSchedule" :view-only="true"
      @close="showScheduleModal = false; loanForSchedule = null" />

    <ExternalSignatureModal :is-open="showSignatureModal" :loan-id="loanForSignature?.id ?? null"
      @close="showSignatureModal = false; loanForSignature = null" @updated="fetchLoans" />

  </div>
  <teleport to="body">
    <div v-if="showRepaymentHub"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="closeRepaymentHub">✕</button>

        <h3 class="font-bold text-xl mb-4 border-b pb-2 pr-8 flex items-center gap-2">
          <span class="icon-[tabler--calendar-stats] text-warning size-6"></span>
          ຂໍ້ມູນການຜ່ອນຊຳລະ - ເລກທີ່ສັນຍາ: {{ getContractNumber(selectedLoan) }}
        </h3>

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
            <div class="flex items-center justify-center bg-gray-50 border rounded-lg p-4">
              <div v-if="summary.remainingBalance > 0" class="text-warning font-bold flex items-center gap-2">
                <span class="icon-[tabler--clock] size-6"></span> ກຳລັງຜ່ອນຊຳລະ
              </div>
              <div v-else class="text-success font-bold flex items-center gap-2">
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
                </tr>
                <tr v-if="!currentSchedules.length">
                  <td colspan="6" class="text-center py-6 text-gray-500">ບໍ່ພົບຕາຕະລາງການຜ່ອນຊຳລະ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { alert } from '@/utils/alert'
import { formatPrice } from '@/utils/formatters'
import { storeToRefs } from 'pinia'

// 🟢 ດຶງ Store
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useLoanContractStore } from '@/stores/loanContract'
import { LoanApplicationStatus, type LoanApplication } from '@/types/loanApplication'

// 🟢 ດຶງ Component
import LoanContractForm from '@/components/loans/form/LoanContractForm.vue'
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue'
import ExternalSignatureModal from '@/components/modals/loan/pending/ExternalSignatureModal.vue'

// --- Stores Setup ---
const loanAppStore = useLoanApplicationStore()
const loanContractStore = useLoanContractStore()
const { loanApplications, isLoading } = storeToRefs(loanAppStore)

// --- Reactive State (Pagination & Filters) ---
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const disbursementFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')


// --- 🌟 ເພີ່ມ State ສຳລັບ Repayment Hub ---
const showRepaymentHub = ref(false)
const isScheduleLoading = ref(false)
const currentSchedules = ref<any[]>([])

// --- Modal States ---
const showDetailsModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)

const showScheduleModal = ref(false);
const loanForSchedule = ref<any>(null);

const showContractModal = ref(false);
const selectedContract = ref<any>(null);

const showSignatureModal = ref(false);
const loanForSignature = ref<LoanApplication | null>(null);

// --- 🌟 ເພີ່ມ Status Config ສຳລັບການຈ່າຍເງິນ ---
const statusConfig: Record<string, { class: string, text: string }> = {
  paid: { class: 'badge-success text-white', text: 'ຊຳລະແລ້ວ' },
  unpaid: { class: 'badge-warning', text: 'ລໍຖ້າຊຳລະ' },
  partial: { class: 'badge-info', text: 'ຈ່າຍບາງສ່ວນ' },
  overdue: { class: 'badge-error text-white', text: 'ກາຍກຳນົດ' }
}

// --- Helpers ---
const getContractNumber = (loan: any): string => {
  if (loan && loan.loan_contracts && loan.loan_contracts.length > 0) {
    return loan.loan_contracts[0].loan_contract_number || '-';
  }
  return '-';
};

const getCustomerName = (loan: LoanApplication): string => {
  return `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'ບໍ່ລະບຸ';
}

const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

const hasContract = (loan: any): boolean => {
  return !!(loan.loan_contracts && loan.loan_contracts.length > 0);
};

const getDisbursementBadgeClass = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'bg-success'
  return 'bg-warning'
}

const getDisbursementStatusText = (loan: any): string => {
  if (['disbursed', 'completed', 'closed'].includes(loan.status)) return 'ຈ່າຍເງິນແລ້ວ (Disbursed)'
  return 'ຍັງບໍ່ຈ່າຍເງິນ (Approved)'
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// --- 🌟 ເພີ່ມ Computed ສຳລັບສະຫຼຸບຍອດ ---
const summary = computed(() => {
  let totalPayable = 0;
  let totalPaid = 0;
  if (Array.isArray(currentSchedules.value)) {
    currentSchedules.value.forEach(sch => {
      totalPayable += Number(sch.total_due) || 0;
      if (sch.payment_status === 'paid') totalPaid += Number(sch.total_due) || 0;
    });
  }
  return { totalPayable, totalPaid, remainingBalance: Math.max(0, totalPayable - totalPaid) };
});

// --- Pagination Logic ---
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

const applyDateFilter = () => {
  currentPage.value = 1
}

const filteredLoans = computed(() => {
  let filtered = loanApplications.value

  // Search
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(q) ||
      getCustomerPhone(loan).includes(q) ||
      (loan.loan_id ?? '').toLowerCase().includes(q) ||
      getContractNumber(loan).toLowerCase().includes(q)
    )
  }

  // Status Filter
  if (disbursementFilter.value === 'disbursed') {
    filtered = filtered.filter(loan => ['disbursed', 'completed', 'closed'].includes(loan.status));
  } else if (disbursementFilter.value === 'pending_disbursement') {
    filtered = filtered.filter(loan => loan.status === 'approved');
  }

  // Date Filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const targetDate = loan.approved_at || loan.updatedAt || loan.createdAt;
      if (!targetDate) return false;

      // 🌟 ເພີ່ມ : string ເຂົ້າໄປບ່ອນນີ້ ເພື່ອບອກ TypeScript ໃຫ້ຊັດເຈນ
      const loanDate: string = new Date(targetDate).toISOString().split('T')[0] || '';

      const from = dateFrom.value || '1970-01-01';
      const to = dateTo.value || '9999-12-31';

      return loanDate >= from && loanDate <= to;
    })
  }
  // 🟢 ບັງຄັບກັ່ນຕອງສະເພາະຄະແນນ 65 ຫາ 79 ໃນຝັ່ງ Client ອີກຮອບ
  filtered = filtered.filter(loan => {
    const score = loan.credit_score || 0;
    return score >= 65 && score < 80;
  });

  return filtered
})

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }

watch(pageSize, () => { currentPage.value = 1 })

// --- 🌟 ເພີ່ມ Function ເປີດ ແລະ ປິດ Modal ---
const openRepaymentHub = async (loan: LoanApplication) => {
  currentSchedules.value = [];
  selectedLoan.value = loan;
  showRepaymentHub.value = true;
  isScheduleLoading.value = true;

  try {
    // ດຶງຂໍ້ມູນຕາຕະລາງຜ່ອນຈາກ Store
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

// --- Modal Actions ---
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    const fullDetails = await loanAppStore.fetchLoanApplicationById(loan.id)
    selectedLoan.value = fullDetails || loan
  } catch (error) {
    console.error("Error fetching full loan details", error)
    selectedLoan.value = loan
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
}

const openSignatureModal = (loan: LoanApplication) => {
  loanForSignature.value = loan;
  showSignatureModal.value = true;
};

const openDraftContractModal = async () => {
  if (!selectedLoan.value) return;
  try {
    showContractModal.value = true;
    selectedContract.value = null;

    const contractRes = await loanContractStore.fetchContract(selectedLoan.value.id);
    const contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;

    if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
      throw new Error("No Contract");
    }
    selectedContract.value = contractData;

  } catch (error) {
    showContractModal.value = false;
    alert.error('ບໍ່ພົບຂໍ້ມູນ', 'ຍັງບໍ່ມີການສ້າງຮ່າງສັນຍາສຳລັບສິນເຊື່ອນີ້');
  }
};

const openScheduleModal = async (loan: any) => {
  try {
    let contractData = null;
    try {
      const contractRes = await loanContractStore.fetchContract(loan.id);
      contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
      if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
        throw new Error("Contract is empty");
      }
    } catch (e) {
      alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ກ່ອນ!');
      return;
    }

    const fullLoan = await loanAppStore.fetchLoanApplicationById(loan.id);
    loanForSchedule.value = fullLoan;
    showScheduleModal.value = true;
  } catch (error) {
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້');
  }
};

// --- Exports ---
const exportToCSV = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const csvData = filteredLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
    'ເລກທີ່ສັນຍາ': getContractNumber(loan),
    'ຊື່ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '0',
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '0',
    'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '')
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `approved_loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const exportToExcel = () => {
  if (!filteredLoans.value.length) {
    alert.warning('ບໍ່ມີຂໍ້ມູນ', 'ບໍ່ມີຂໍ້ມູນສຳລັບ Export');
    return;
  }
  const excelData = filteredLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
    'ເລກທີ່ສັນຍາ': getContractNumber(loan),
    'ຊື່ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '0',
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '0',
    'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '')
  }))
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Approved Loans')
  XLSX.writeFile(workbook, `approved_loans_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// --- Fetch Data ---
const fetchLoans = async () => {
  try {
    // 🟢 ດຶງສະເພາະສິນເຊື່ອທີ່ ອະນຸມັດ (approved) ແລະ ປ່ອຍແລ້ວ (disbursed)
    await loanAppStore.fetchLoanApplications({
      status: [LoanApplicationStatus.APPROVED, LoanApplicationStatus.DISBURSED] as any,
      is_confirmed: 1,
      limit: 1000,
      minScore: 65,
      maxScore: 80,
    } as any)
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', error.message)
  }
}

onMounted(() => {
  fetchLoans()
})

onUnmounted(() => {
  loanAppStore.resetFilters();
});
</script>

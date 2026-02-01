<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການສິນເຊື່ອທີ່ໄດ້ຮັບການອະນຸມັດແລ້ວ</p>
      </div>

      <!-- Export Button -->
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span>
        Export CSV
      </button>
    </div>

    <!-- Filter Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Search Input -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ຄົ້ນຫາ</span>
        </label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full" @input="debounceSearch" />
      </div>

      <!-- Status Filter (for disbursement status) -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະການຈ່າຍເງິນ</span>
        </label>
        <select v-model="disbursementFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending_disbursement">ຍັງບໍ່ໄດ້ຈ່າຍເງິນ</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ</option>
        </select>
      </div>

      <!-- Date Range Filter -->
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

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <!-- Table -->
    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>ເລກທີ່</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ສະຖານະການຈ່າຍ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ອະນຸມັດ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <!-- Loan Number -->
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ loan.loan_number }}</td>

            <!-- Customer Name -->
            <td class="font-medium">{{ loan.customer_name }}</td>

            <!-- Phone -->
            <td>{{ loan.phone }}</td>

            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(loan.amount) }}</td>

            <!-- Interest Rate -->
            <td>{{ loan.interest_rate }}%</td>

            <!-- Term -->
            <td>{{ loan.term }} ເດືອນ</td>

            <!-- Disbursement Status -->
            <td>
              <span class="badge badge-soft" :class="getDisbursementBadgeClass(loan.disbursement_status)">
                {{ getDisbursementStatusText(loan.disbursement_status) }}
              </span>
            </td>

            <!-- Approved By -->
            <td>{{ loan.approved_by }}</td>

            <!-- Approved At -->
            <td>{{ formatDate(loan.approved_at) }}</td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <!-- Create/View Delivery Note -->
                <button class="btn btn-circle btn-text btn-sm" @click="openDeliveryNoteModal(loan)"
                  aria-label="Manage delivery note">
                  <span class="icon-[tabler--file-invoice] size-4"></span>
                </button>

                <!-- Disburse Payment (only if not disbursed yet) -->
                <button v-if="loan.disbursement_status === 'pending_disbursement' && loan.delivery_note_approved"
                  class="btn btn-circle btn-text btn-sm text-primary" @click="disburseLoan(loan)"
                  aria-label="Disburse payment">
                  <span class="icon-[tabler--currency-dollar] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalLoans }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">
          ກ່ອນໜ້າ
        </button>

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- Loan Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ລາຍລະອຽດສິນເຊື່ອ</h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono">{{ selectedLoan.loan_number }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                <span class="badge badge-soft badge-info">ອະນຸມັດແລ້ວ</span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                <p>{{ selectedLoan.customer_name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                <p>{{ selectedLoan.phone }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium">{{ formatPrice(selectedLoan.amount) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedLoan.interest_rate }}%</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedLoan.term }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p>{{ selectedLoan.approved_by }}</p>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.address }}</p>
            </div>

            <!-- Delivery Note Info -->
            <div v-if="selectedLoan.delivery_note">
              <div class="border-t pt-4">
                <h4 class="font-medium mb-2">ຂໍ້ມູນໃບມອບຮັບສິນຄ້າ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label class="text-gray-500">ເລກທີ່ໃບມອບຮັບ</label>
                    <p>{{ selectedLoan.delivery_note.note_number }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ຜູ້ຮັບ</label>
                    <p>{{ selectedLoan.delivery_note.recipient_name }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ເບີໂທຜູ້ຮັບ</label>
                    <p>{{ selectedLoan.delivery_note.recipient_phone }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ທີ່ຢູ່ຈັດສົ່ງ</label>
                    <p>{{ selectedLoan.delivery_note.delivery_address }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ວັນທີ່ສ້າງ</label>
                    <p>{{ formatDate(selectedLoan.delivery_note.created_at) }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ສະຖານະ</label>
                    <span class="badge badge-soft"
                      :class="selectedLoan.delivery_note_approved ? 'badge-success' : 'badge-warning'">
                      {{ selectedLoan.delivery_note_approved ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າການອະນຸມັດ' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Disbursement Info -->
            <div v-if="selectedLoan.disbursement_status === 'disbursed'">
              <div class="border-t pt-4">
                <h4 class="font-medium mb-2">ຂໍ້ມູນການຈ່າຍເງິນ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label class="text-gray-500">ວັນທີ່ຈ່າຍເງິນ</label>
                    <p>{{ formatDate(selectedLoan.disbursed_at) }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ຈ່າຍໃຫ້</label>
                    <p>{{ selectedLoan.disbursement_recipient }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ເບີບັນຊີ</label>
                    <p>{{ selectedLoan.disbursement_account }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ອະນຸມັດເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.approved_at) }}</p>
              </div>
              <div v-if="selectedLoan.disbursed_at">
                <label class="text-sm font-medium text-gray-500">ຈ່າຍເງິນເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.disbursed_at) }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              ປິດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delivery Note Modal -->
    <!-- Delivery Note Modal -->
<teleport to="body">
  <div v-if="showDeliveryNoteModal && loanForDeliveryNote" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold">
          {{ loanForDeliveryNote.delivery_note ? 'ຈັດການໃບມອບຮັບສິນຄ້າ' : 'ສ້າງໃບມອບຮັບສິນຄ້າ' }}
        </h3>
        <button @click="closeDeliveryNoteModal" class="text-gray-400 hover:text-gray-600">
          <span class="icon-[tabler--x] size-5"></span>
        </button>
      </div>

      <form @submit.prevent="saveDeliveryNote" class="space-y-4">
        <!-- Note Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເລກທີ່ໃບມອບຮັບ *</span>
          </label>
          <input
            v-model="deliveryNoteForm.note_number"
            type="text"
            placeholder="ປ້ອນເລກທີ່ໃບມອບຮັບ"
            class="input input-bordered w-full"
            :disabled="isEditingDisabled"
            required
          />
        </div>

        <!-- Recipient Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ຜູ້ຮັບ *</span>
          </label>
          <input
            v-model="deliveryNoteForm.recipient_name"
            type="text"
            placeholder="ປ້ອນຊື່ຜູ້ຮັບ"
            class="input input-bordered w-full"
            :disabled="isEditingDisabled"
            required
          />
        </div>

        <!-- Recipient Phone -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເບີໂທຜູ້ຮັບ *</span>
          </label>
          <input
            v-model="deliveryNoteForm.recipient_phone"
            type="tel"
            placeholder="ປ້ອນເບີໂທຜູ້ຮັບ"
            class="input input-bordered w-full"
            :disabled="isEditingDisabled"
            required
          />
        </div>

        <!-- Delivery Address -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ທີ່ຢູ່ຈັດສົ່ງ *</span>
          </label>
          <textarea
            v-model="deliveryNoteForm.delivery_address"
            placeholder="ປ້ອນທີ່ຢູ່ຈັດສົ່ງ"
            class="textarea textarea-bordered w-full min-h-24"
            :disabled="isEditingDisabled"
            required
          ></textarea>
        </div>

        <!-- Approve Checkbox (enable only when delivery note exists and not approved) -->
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              v-model="deliveryNoteForm.approved"
              class="checkbox checkbox-primary"
              :disabled="!canApproveDeliveryNote"
            />
            <span class="label-text font-medium">ອະນຸມັດໃບມອບຮັບສິນຄ້າ</span>
          </label>
          <p v-if="!canApproveDeliveryNote" class="text-xs text-gray-500 mt-1">
            {{ approvalDisabledMessage }}
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn btn-soft btn-secondary"
            @click="closeDeliveryNoteModal"
          >
            ຍົກເລີກ
          </button>

          <!-- Print Button (show when delivery note exists, regardless of approval status) -->
          <button
            v-if="hasDeliveryNote"
            type="button"
            class="btn btn-outline btn-primary"
            @click="printDeliveryNote"
          >
            <span class="icon-[tabler--printer] size-4 mr-1"></span>
            ພິມໃບມອບຮັບ
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSavingDeliveryNote || isSaveDisabled"
          >
            <span v-if="isSavingDeliveryNote" class="loading loading-spinner loading-xs"></span>
            <span v-else>
              {{ loanForDeliveryNote.delivery_note ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງໃບມອບຮັບ' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</teleport>

    <!-- Disburse Payment Modal -->
    <teleport to="body">
      <div v-if="showDisburseModal && loanToDisburse"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-primary">ຈ່າຍເງິນສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຈ່າຍເງິນ {{ formatPrice(loanToDisburse.amount) }}
            ໃຫ້ "{{ loanToDisburse.disbursement_recipient }}" ?
          </p>

          <!-- Disbursement Details -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">ເລກບັນຊີ:</span>
              <span>{{ loanToDisburse.disbursement_account }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">ທະນາຄານ:</span>
              <span>{{ loanToDisburse.disbursement_bank }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showDisburseModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" @click="confirmDisburseLoan">
              ຈ່າຍເງິນ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Papa from 'papaparse'

// Types
interface DeliveryNote {
  note_number: string
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  created_at: string
}

interface Loan {
  id: number
  loan_number: string
  customer_name: string
  phone: string
  address: string
  amount: number
  interest_rate: number
  term: number
  status: 'approved'
  approved_by: string
  approved_at: string
  disbursement_status: 'pending_disbursement' | 'disbursed'
  disbursement_recipient: string
  disbursement_account: string
  disbursement_bank: string
  disbursed_at: string | null
  delivery_note: DeliveryNote | null
  delivery_note_approved: boolean
  created_at: string
}

// Reactive state
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const disbursementFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showDeliveryNoteModal = ref(false)
const showDisburseModal = ref(false)
const selectedLoan = ref<Loan | null>(null)
const loanForDeliveryNote = ref<Loan | null>(null)
const loanToDisburse = ref<Loan | null>(null)

// Delivery note form
const deliveryNoteForm = reactive({
  note_number: '',
  recipient_name: '',
  recipient_phone: '',
  delivery_address: '',
  approved: false
})

const isSavingDeliveryNote = ref(false)

// Mock data (only approved loans)
const mockLoans: Loan[] = [
  {
    id: 1,
    loan_number: 'LN2024002',
    customer_name: 'ສົມສິງ ດຳດີ',
    phone: '020 8765 4321',
    address: 'ບ້ານ ສີໂມກ, ເມືອງ ປາກເຊ, ຈຳປາສັກ',
    amount: 10000000,
    interest_rate: 4.75,
    term: 24,
    status: 'approved',
    approved_by: 'ອຸດົມ ສີສົມບັດ',
    approved_at: '2024-01-20T14:15:00Z',
    disbursement_status: 'pending_disbursement',
    disbursement_recipient: 'ຮ້ານ A',
    disbursement_account: '123456789',
    disbursement_bank: 'ທະນາຄານ BCEL',
    disbursed_at: null,
    delivery_note: {
      note_number: 'DN2024001',
      recipient_name: 'ສົມສິງ ດຳດີ',
      recipient_phone: '020 8765 4321',
      delivery_address: 'ບ້ານ ສີໂມກ, ເມືອງ ປາກເຊ, ຈຳປາສັກ',
      created_at: '2024-01-22T10:30:00Z'
    },
    delivery_note_approved: true,
    created_at: '2024-01-18T09:45:00Z'
  },
  {
    id: 2,
    loan_number: 'LN2024008',
    customer_name: 'ບຸນເຊີຍ ສຸກສົມ',
    phone: '020 9988 7766',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 5000000,
    interest_rate: 5.25,
    term: 12,
    status: 'approved',
    approved_by: 'ສົມບຸນ ພົນສຸກ',
    approved_at: '2024-02-05T11:20:00Z',
    disbursement_status: 'pending_disbursement',
    disbursement_recipient: 'ຮ້ານ B',
    disbursement_account: '987654321',
    disbursement_bank: 'ທະນາຄານ LDB',
    disbursed_at: null,
    delivery_note: null,
    delivery_note_approved: false,
    created_at: '2024-02-01T15:30:00Z'
  },
  {
    id: 3,
    loan_number: 'LN2024009',
    customer_name: 'ວິໄລ ສີສົມ',
    phone: '020 1122 3344',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 7500000,
    interest_rate: 4.5,
    term: 18,
    status: 'approved',
    approved_by: 'ອຸດົມ ສີສົມບັດ',
    approved_at: '2024-02-10T09:15:00Z',
    disbursement_status: 'disbursed',
    disbursement_recipient: 'ຮ້ານ C',
    disbursement_account: '456789123',
    disbursement_bank: 'ທະນາຄານ BIC',
    disbursed_at: '2024-02-12T14:20:00Z',
    delivery_note: {
      note_number: 'DN2024002',
      recipient_name: 'ວິໄລ ສີສົມ',
      recipient_phone: '020 1122 3344',
      delivery_address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
      created_at: '2024-02-11T16:45:00Z'
    },
    delivery_note_approved: true,
    created_at: '2024-02-08T11:45:00Z'
  }
]

// Debounce search
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = ref('')

const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

// Apply date filter
const applyDateFilter = () => {
  currentPage.value = 1
}

// Filtered loans (only approved)
const filteredLoans = computed(() => {
  let filtered = mockLoans.filter(loan => loan.status === 'approved')

  // Search filter
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      loan.customer_name.toLowerCase().includes(query) ||
      loan.phone.includes(query) ||
      loan.loan_number.toLowerCase().includes(query)
    )
  }

  // Disbursement status filter
  if (disbursementFilter.value) {
    if (disbursementFilter.value === 'pending_disbursement') {
      filtered = filtered.filter(loan => loan.disbursement_status === 'pending_disbursement')
    } else if (disbursementFilter.value === 'disbursed') {
      filtered = filtered.filter(loan => loan.disbursement_status === 'disbursed')
    }
  }

  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = new Date(loan.approved_at).toISOString().split('T')[0]
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
    })
  }

  return filtered
})

// Paginated loans
const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

// Pagination computed
const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}

const getDisbursementBadgeClass = (status: string): string => {
  switch (status) {
    case 'disbursed': return 'badge-success'
    case 'pending_disbursement': return 'badge-warning'
    default: return 'badge-neutral'
  }
}

const getDisbursementStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'disbursed': 'ຈ່າຍເງິນແລ້ວ',
    'pending_disbursement': 'ຍັງບໍ່ໄດ້ຈ່າຍເງິນ'
  }
  return statusMap[status] || status
}

// Action handlers
const viewLoanDetails = (loan: Loan) => {
  selectedLoan.value = loan
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
}

// Computed properties for modal logic
const hasDeliveryNote = computed(() => {
  return !!loanForDeliveryNote.value?.delivery_note
})

const isEditingDisabled = computed(() => {
  // ปิดการแก้ไขเมื่อได้รับการอนุมัติแล้ว
  return loanForDeliveryNote.value?.delivery_note_approved === true
})

const canApproveDeliveryNote = computed(() => {
  // สามารถอนุมัติได้เมื่อมีใบมอบรับและยังไม่อนุมัติ
  return loanForDeliveryNote.value?.delivery_note &&
         !loanForDeliveryNote.value?.delivery_note_approved
})

const isSaveDisabled = computed(() => {
  // ปิดปุ่มบันทึกเมื่อ:
  // 1. อยู่ในโหมดดู (ได้รับการอนุมัติแล้ว)
  // 2. ไม่มีการเปลี่ยนแปลง
  if (isEditingDisabled.value) {
    return true
  }
  if (loanForDeliveryNote.value?.delivery_note && !hasChanges()) {
    return true
  }
  return false
})

const approvalDisabledMessage = computed(() => {
  if (!loanForDeliveryNote.value?.delivery_note) {
    return 'ຕ້ອງສ້າງໃບມອບຮັບກ່ອນຈຶ່ງຈະສາມາດອະນຸມັດໄດ້'
  }
  if (loanForDeliveryNote.value?.delivery_note_approved) {
    return 'ໃບມອບຮັບນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ'
  }
  return ''
})

// เพิ่ม reactive state สำหรับตรวจสอบการเปลี่ยนแปลง
const originalDeliveryNoteData = ref<DeliveryNote | null>(null)
const originalApprovedStatus = ref(false)

// const openDeliveryNoteModal = (loan: Loan) => {
//   loanForDeliveryNote.value = loan

//   if (loan.delivery_note) {
//     // Fill form with existing delivery note
//     deliveryNoteForm.note_number = loan.delivery_note.note_number
//     deliveryNoteForm.recipient_name = loan.delivery_note.recipient_name
//     deliveryNoteForm.recipient_phone = loan.delivery_note.recipient_phone
//     deliveryNoteForm.delivery_address = loan.delivery_note.delivery_address
//     deliveryNoteForm.approved = loan.delivery_note_approved
//   } else {
//     // Clear form for new delivery note
//     deliveryNoteForm.note_number = ''
//     deliveryNoteForm.recipient_name = loan.customer_name
//     deliveryNoteForm.recipient_phone = loan.phone
//     deliveryNoteForm.delivery_address = loan.address
//     deliveryNoteForm.approved = false
//   }

//   showDeliveryNoteModal.value = true
// }

// อัปเดตฟังก์ชัน openDeliveryNoteModal
// อัปเดตฟังก์ชัน openDeliveryNoteModal
const openDeliveryNoteModal = (loan: Loan) => {
  loanForDeliveryNote.value = loan

  if (loan.delivery_note) {
    // Fill form with existing delivery note
    deliveryNoteForm.note_number = loan.delivery_note.note_number
    deliveryNoteForm.recipient_name = loan.delivery_note.recipient_name
    deliveryNoteForm.recipient_phone = loan.delivery_note.recipient_phone
    deliveryNoteForm.delivery_address = loan.delivery_note.delivery_address
    deliveryNoteForm.approved = loan.delivery_note_approved

    // Store original data for change detection
    originalDeliveryNoteData.value = { ...loan.delivery_note }
    originalApprovedStatus.value = loan.delivery_note_approved
  } else {
    // Clear form for new delivery note
    deliveryNoteForm.note_number = ''
    deliveryNoteForm.recipient_name = loan.customer_name
    deliveryNoteForm.recipient_phone = loan.phone
    deliveryNoteForm.delivery_address = loan.address
    deliveryNoteForm.approved = false

    originalDeliveryNoteData.value = null
    originalApprovedStatus.value = false
  }

  showDeliveryNoteModal.value = true
}

const closeDeliveryNoteModal = () => {
  showDeliveryNoteModal.value = false
  loanForDeliveryNote.value = null
}

// ฟังก์ชันตรวจสอบการเปลี่ยนแปลง
const hasChanges = (): boolean => {
  if (!loanForDeliveryNote.value?.delivery_note) return false

  const currentData = {
    note_number: deliveryNoteForm.note_number,
    recipient_name: deliveryNoteForm.recipient_name,
    recipient_phone: deliveryNoteForm.recipient_phone,
    delivery_address: deliveryNoteForm.delivery_address
  }

  const hasDataChanges = JSON.stringify(currentData) !== JSON.stringify(originalDeliveryNoteData.value)
  const hasApprovalChanged = deliveryNoteForm.approved !== originalApprovedStatus.value

  return hasDataChanges || hasApprovalChanged
}

// ฟังก์ชันพิมพ์ใบมอบรับ
// ฟังก์ชันพิมพ์ใบมอบรับ (อัปเดตให้แสดงข้อมูลครบถ้วน)
const printDeliveryNote = () => {
  if (!loanForDeliveryNote.value?.delivery_note) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const loan = loanForDeliveryNote.value
  const note = loan.delivery_note!

  // สร้าง HTML สำหรับพิมพ์
  const printContent = `
    <!DOCTYPE html>
    <html lang="lo">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ໃບມອບຮັບສິນຄ້າ - ${note.note_number}</title>
      <style>
        body {
          font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
          padding: 20px;
          line-height: 1.6;
          background: white;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          margin: 0 0 10px 0;
          color: #000;
        }
        .header p {
          font-size: 16px;
          margin: 0;
          color: #666;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #000;
          border-left: 4px solid #007bff;
          padding-left: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .info-value {
          color: #000;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature-line {
          width: 250px;
          margin: 20px auto;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        @media print {
          .container { max-width: 100%; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ໃບມອບຮັບສິນຄ້າ</h1>
          <p>ເລກທີ່ເອກະສານ: ${note.note_number}</p>
        </div>

        <div class="section">
          <div class="section-title">ຂໍ້ມູນຜູ້ຮັບ</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ຊື່ຜູ້ຮັບ:</span>
              <span class="info-value">${note.recipient_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ເບີໂທ:</span>
              <span class="info-value">${note.recipient_phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ທີ່ຢູ່ຈັດສົ່ງ:</span>
              <span class="info-value">${note.delivery_address}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ຂໍ້ມູນສິນເຊື່ອ</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ເລກທີ່ສິນເຊື່ອ:</span>
              <span class="info-value">${loan.loan_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ຊື່ລູກຄ້າ:</span>
              <span class="info-value">${loan.customer_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ຈຳນວນເງິນ:</span>
              <span class="info-value">${formatPrice(loan.amount)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ດອກເບ້ຍ:</span>
              <span class="info-value">${loan.interest_rate}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">ໄລຍະເວລາ:</span>
              <span class="info-value">${loan.term} ເດືອນ</span>
            </div>
            <div class="info-item">
              <span class="info-label">ວັນທີ່ສ້າງສິນເຊື່ອ:</span>
              <span class="info-value">${formatDate(loan.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ວັນທີ່ອະນຸມັດ:</span>
              <span class="info-value">${formatDate(loan.approved_at)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ຂໍ້ມູນໃບມອບຮັບ</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ວັນທີ່ສ້າງໃບມອບຮັບ:</span>
              <span class="info-value">${formatDate(note.created_at)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ສະຖານະ:</span>
              <span class="info-value" style="background: #d4edda; color: #155724;">
                ໄດ້ຮັບການອະນຸມັດແລ້ວ
              </span>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="signature-line"></div>
          <p>ລົງນາມຜູ້ຮັບ: _________________________</p>
          <p>ວັນທີ່: _________________________</p>
        </div>
      </div>

      <script>
        window.addEventListener('load', function() {
          window.print();
        });
      <\/script>
</body>

</html>
`

  printWindow.document.write(printContent)
  printWindow.document.close()
}

// const saveDeliveryNote = async () => {
// if (!loanForDeliveryNote.value) return

// isSavingDeliveryNote.value = true
// try {
// // Simulate API call
// await new Promise(resolve => setTimeout(resolve, 1000))

// // Update loan data
// const index = mockLoans.findIndex(l => l.id === loanForDeliveryNote.value!.id)
// if (index !== -1) {
// if (!mockLoans[index].delivery_note) {
// // Create new delivery note
// mockLoans[index].delivery_note = {
// note_number: deliveryNoteForm.note_number,
// recipient_name: deliveryNoteForm.recipient_name,
// recipient_phone: deliveryNoteForm.recipient_phone,
// delivery_address: deliveryNoteForm.delivery_address,
// created_at: new Date().toISOString()
// }
// alert('ສ້າງໃບມອບຮັບສິນຄ້າສຳເລັດ!')
// } else {
// // Update approval status
// mockLoans[index].delivery_note_approved = deliveryNoteForm.approved
// alert('ອັບເດດສະຖານະໃບມອບຮັບສຳເລັດ!')
// }
// }

// closeDeliveryNoteModal()

// } catch (error) {
// console.error('Error saving delivery note:', error)
// alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກໃບມອບຮັບ')
// } finally {
// isSavingDeliveryNote.value = false
// }
// }


// อัปเดตฟังก์ชัน saveDeliveryNote
const saveDeliveryNote = async () => {
  if (!loanForDeliveryNote.value) return

  isSavingDeliveryNote.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const index = mockLoans.findIndex(l => l.id === loanForDeliveryNote.value!.id)
    if (index !== -1) {
      if (!mockLoans[index].delivery_note) {
        // Create new delivery note
        mockLoans[index].delivery_note = {
          note_number: deliveryNoteForm.note_number,
          recipient_name: deliveryNoteForm.recipient_name,
          recipient_phone: deliveryNoteForm.recipient_phone,
          delivery_address: deliveryNoteForm.delivery_address,
          created_at: new Date().toISOString()
        }
        mockLoans[index].delivery_note_approved = false // Initially not approved
        alert('ສ້າງໃບມອບຮັບສິນຄ້າສຳເລັດ!')
      } else {
        // Update approval status (data fields are disabled when editing existing note)
        mockLoans[index].delivery_note_approved = deliveryNoteForm.approved
        alert('ອັບເດດສະຖານະໃບມອບຮັບສຳເລັດ!')
      }
    }

    closeDeliveryNoteModal()

  } catch (error) {
    console.error('Error saving delivery note:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກໃບມອບຮັບ')
  } finally {
    isSavingDeliveryNote.value = false
  }
}

const disburseLoan = (loan: Loan) => {
  loanToDisburse.value = loan
  showDisburseModal.value = true
}

const confirmDisburseLoan = async () => {
  if (loanToDisburse.value) {
    // Update mock data
    const index = mockLoans.findIndex(l => l.id === loanToDisburse.value!.id)
    if (index !== -1) {
      mockLoans[index].disbursement_status = 'disbursed'
      mockLoans[index].disbursed_at = new Date().toISOString()
    }
    alert('ຈ່າຍເງິນສິນເຊື່ອສຳເລັດ!')
  }

  showDisburseModal.value = false
  loanToDisburse.value = null
}

// Export CSV
const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_number,
    'ຊື່ລູກຄ້າ': loan.customer_name,
    'ເບີໂທ': loan.phone,
    'ຈຳນວນເງິນ': formatPrice(loan.amount),
    'ດອກເບ້ຍ (%)': loan.interest_rate,
    'ໄລຍະເວລາ (ເດືອນ)': loan.term,
    'ສະຖານະການຈ່າຍ': getDisbursementStatusText(loan.disbursement_status),
    'ຜູ້ອະນຸມັດ': loan.approved_by,
    'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `approved_loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Pagination methods
const previousPage = () => {
  if (hasPreviousPage.value) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
  }
}

watch(pageSize, () => {
  currentPage.value = 1
})
</script>

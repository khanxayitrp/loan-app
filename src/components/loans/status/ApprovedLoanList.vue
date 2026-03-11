<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການສິນເຊື່ອທີ່ໄດ້ຮັບການອະນຸມັດແລ້ວ</p>
      </div>

      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span>
        Export CSV
      </button>
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
          <option value="pending_disbursement">ຍັງບໍ່ໄດ້ຈ່າຍເງິນ</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ</option>
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

    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

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
            <td class="font-mono text-gray-600 dark:text-gray-400">{{ loan.loan_id }}</td>

            <td class="font-medium">{{ getCustomerName(loan) }}</td>

            <td>{{ getCustomerPhone(loan) }}</td>

            <td class="font-medium text-primary">{{ formatPrice(Number(loan.total_amount) || 0) }}</td>

            <td>{{ loan.interest_rate_at_apply }}%</td>

            <td>{{ loan.loan_period }} ເດືອນ</td>

            <td>
              <span class="badge badge-soft" :class="getDisbursementBadgeClass((loan as any).disbursement_status)">
                {{ getDisbursementStatusText((loan as any).disbursement_status) }}
              </span>
            </td>

            <td>{{ loan.approver?.username || '-' }}</td>

            <td>{{ formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '') }}</td>

            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewLoanDetails(loan)" aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm" @click="openDeliveryNoteModal(loan)"
                  aria-label="Manage delivery note">
                  <span class="icon-[tabler--file-invoice] size-4"></span>
                </button>

                <button
                  v-if="(loan as any).disbursement_status === 'pending_disbursement' && (loan as any).delivery_note_approved"
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

    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ລາຍລະອຽດສິນເຊື່ອທີ່ອະນຸມັດແລ້ວ</h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono">{{ selectedLoan.loan_id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label><br>
                <span class="badge badge-soft badge-info mt-1">ອະນຸມັດແລ້ວ</span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                <p>{{ getCustomerName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                <p>{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ສິນຄ້າ</label>
                <p class="font-medium">{{ selectedLoan.product?.product_name || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium text-primary">{{ formatPrice(Number(selectedLoan.total_amount) || 0) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedLoan.interest_rate_at_apply }}%</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedLoan.loan_period }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຄະແນນສິນເຊື່ອ</label>
                <p class="font-bold text-info">{{ selectedLoan.credit_score || 'ຍັງບໍ່ໄດ້ຄຳນວນ' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p>{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.customer?.address || '-' }}</p>
            </div>

            <div v-if="(selectedLoan as any).delivery_note">
              <div class="border-t pt-4">
                <h4 class="font-medium mb-2">ຂໍ້ມູນໃບມອບຮັບສິນຄ້າ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label class="text-gray-500">ເລກທີ່ໃບມອບຮັບ</label>
                    <p>{{ (selectedLoan as any).delivery_note.note_number }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ຜູ້ຮັບ</label>
                    <p>{{ (selectedLoan as any).delivery_note.recipient_name }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ເບີໂທຜູ້ຮັບ</label>
                    <p>{{ (selectedLoan as any).delivery_note.recipient_phone }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ທີ່ຢູ່ຈັດສົ່ງ</label>
                    <p>{{ (selectedLoan as any).delivery_note.delivery_address }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ວັນທີ່ສ້າງ</label>
                    <p>{{ formatDate((selectedLoan as any).delivery_note.createdAt) }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ສະຖານະ</label>
                    <br>
                    <span class="badge badge-soft mt-1"
                      :class="(selectedLoan as any).delivery_note_approved ? 'badge-success' : 'badge-warning'">
                      {{ (selectedLoan as any).delivery_note_approved ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າການອະນຸມັດ' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="(selectedLoan as any).disbursement_status === 'disbursed'">
              <div class="border-t pt-4">
                <h4 class="font-medium mb-2">ຂໍ້ມູນການຈ່າຍເງິນ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label class="text-gray-500">ວັນທີ່ຈ່າຍເງິນ</label>
                    <p>{{ formatDate((selectedLoan as any).disbursed_at) }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ຈ່າຍໃຫ້</label>
                    <p>{{ (selectedLoan as any).disbursement_recipient }}</p>
                  </div>
                  <div>
                    <label class="text-gray-500">ເບີບັນຊີ</label>
                    <p>{{ (selectedLoan as any).disbursement_account }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ອະນຸມັດເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.approved_at || selectedLoan.updated_at || '') }}</p>
              </div>
              <div v-if="(selectedLoan as any).disbursed_at">
                <label class="text-sm font-medium text-gray-500">ຈ່າຍເງິນເມື່ອ</label>
                <p>{{ formatDate((selectedLoan as any).disbursed_at) }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-soft btn-secondary w-full sm:w-auto" @click="closeDetailsModal">
              ປິດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showDeliveryNoteModal && loanForDeliveryNote"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ (loanForDeliveryNote as any).delivery_note ? 'ຈັດການໃບມອບຮັບສິນຄ້າ' : 'ສ້າງໃບມອບຮັບສິນຄ້າ' }}
            </h3>
            <button @click="closeDeliveryNoteModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <form @submit.prevent="saveDeliveryNote" class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ເລກທີ່ໃບມອບຮັບ *</span></label>
              <input v-model="deliveryNoteForm.note_number" type="text" placeholder="ປ້ອນເລກທີ່ໃບມອບຮັບ"
                class="input input-bordered w-full" :disabled="isEditingDisabled" required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ຊື່ຜູ້ຮັບ *</span></label>
              <input v-model="deliveryNoteForm.recipient_name" type="text" placeholder="ປ້ອນຊື່ຜູ້ຮັບ"
                class="input input-bordered w-full" :disabled="isEditingDisabled" required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ເບີໂທຜູ້ຮັບ *</span></label>
              <input v-model="deliveryNoteForm.recipient_phone" type="tel" placeholder="ປ້ອນເບີໂທຜູ້ຮັບ"
                class="input input-bordered w-full" :disabled="isEditingDisabled" required />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ທີ່ຢູ່ຈັດສົ່ງ *</span></label>
              <textarea v-model="deliveryNoteForm.delivery_address" placeholder="ປ້ອນທີ່ຢູ່ຈັດສົ່ງ"
                class="textarea textarea-bordered w-full min-h-24" :disabled="isEditingDisabled" required></textarea>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-4">
                <input type="checkbox" v-model="deliveryNoteForm.approved" class="checkbox checkbox-primary"
                  :disabled="!canApproveDeliveryNote" />
                <span class="label-text font-medium">ອະນຸມັດໃບມອບຮັບສິນຄ້າ</span>
              </label>
              <p v-if="!canApproveDeliveryNote" class="text-xs text-gray-500 mt-1">
                {{ approvalDisabledMessage }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
              <button type="button" class="btn btn-soft btn-secondary" @click="closeDeliveryNoteModal">
                ຍົກເລີກ
              </button>

              <button v-if="hasDeliveryNote" type="button" class="btn btn-outline btn-primary"
                @click="printDeliveryNote">
                <span class="icon-[tabler--printer] size-4 mr-1"></span>
                ພິມໃບມອບຮັບ
              </button>

              <button type="submit" class="btn btn-primary" :disabled="isSavingDeliveryNote || isSaveDisabled">
                <span v-if="isSavingDeliveryNote" class="loading loading-spinner loading-xs"></span>
                <span v-else>
                  {{ (loanForDeliveryNote as any).delivery_note ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງໃບມອບຮັບ' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showDisburseModal && loanToDisburse"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <h3 class="font-bold text-lg mb-4 text-primary flex items-center gap-2">
            <span class="icon-[tabler--currency-dollar] size-6"></span> ຈ່າຍເງິນສິນເຊື່ອ
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຈ່າຍເງິນ <strong class="text-primary">{{
              formatPrice(Number(loanToDisburse.total_amount) || 0) }}</strong>
            ໃຫ້ "{{ (loanToDisburse as any).disbursement_recipient || getCustomerName(loanToDisburse) }}" ?
          </p>

          <div class="space-y-2 mb-4 bg-base-200 p-3 rounded-lg border">
            <div class="flex justify-between">
              <span class="text-gray-600">ເລກບັນຊີ:</span>
              <span class="font-medium">{{ (loanToDisburse as any).disbursement_account || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">ທະນາຄານ:</span>
              <span class="font-medium">{{ (loanToDisburse as any).disbursement_bank || '-' }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 border-t pt-4">
            <button class="btn btn-soft btn-secondary" @click="showDisburseModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" @click="confirmDisburseLoan">
              ຍືນຍັນການຈ່າຍເງິນ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
import { ref, reactive, computed, watch, onMounted } from 'vue'
// ✅ ປ່ຽນມາໃຊ້ useLoanApplicationStore
import { useLoanApplicationStore } from '@/stores/loanApplication'
import type { LoanApplication } from '@/types/loanApplication'
import { LoanApplicationStatus } from '@/types/loanApplication'
import Papa from 'papaparse'
import { alert } from '@/utils/alert'

const loanApplicationStore = useLoanApplicationStore()

interface DeliveryNote {
  note_number: string
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  created_at: string
}

// Reactive state
const isLoading = computed(() => loanApplicationStore.isLoading)
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
const selectedLoan = ref<LoanApplication | null>(null)
const loanForDeliveryNote = ref<LoanApplication | null>(null)
const loanToDisburse = ref<LoanApplication | null>(null)

// Delivery note form
const deliveryNoteForm = reactive({
  note_number: '',
  recipient_name: '',
  recipient_phone: '',
  delivery_address: '',
  approved: false
})

const isSavingDeliveryNote = ref(false)

// Helpers ສຳລັບດຶງຊື່ ແລະ ເບີໂທ
const getCustomerName = (loan: LoanApplication): string => {
  if (!loan.customer) return '-'
  return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim()
}
const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

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

const applyDateFilter = () => {
  currentPage.value = 1
}

// ✅ Filtered loans (ໃຊ້ loanApplicationStore)
const filteredLoans = computed(() => {
  let filtered = loanApplicationStore.loanApplications

  // Search filter
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      getCustomerName(loan).toLowerCase().includes(query) ||
      getCustomerPhone(loan).includes(query) ||
      loan.loan_id?.toLowerCase().includes(query)
    )
  }

  // Disbursement status filter (Mock property `disbursement_status`)
  if (disbursementFilter.value) {
    filtered = filtered.filter(loan => (loan as any).disbursement_status === disbursementFilter.value)
  }

  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const dateTarget = loan.approved_at || loan.updated_at || loan.created_at || '';
      if (!dateTarget) return false;

      // 🟢 ແກ້ໄຂ: ຕື່ມ || '' ເພື່ອຮັບປະກັນວ່າຈະເປັນ String ສະເໝີ
      const loanDate = new Date(dateTarget).toISOString().split('T')[0] || '';
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
    })
  }

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

// Utility functions


const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
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
  return statusMap[status] || status || 'ລໍຖ້າຈ່າຍເງິນ' // Default text
}

// Action handlers
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    const fullDetails = await loanApplicationStore.fetchLoanApplicationById(loan.id)
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

const hasDeliveryNote = computed(() => {
  return !!(loanForDeliveryNote.value as any)?.delivery_note
})

const isEditingDisabled = computed(() => {
  return (loanForDeliveryNote.value as any)?.delivery_note_approved === true
})

const canApproveDeliveryNote = computed(() => {
  return (loanForDeliveryNote.value as any)?.delivery_note &&
    !(loanForDeliveryNote.value as any)?.delivery_note_approved
})

const isSaveDisabled = computed(() => {
  if (isEditingDisabled.value) {
    return true
  }
  if ((loanForDeliveryNote.value as any)?.delivery_note && !hasChanges()) {
    return true
  }
  return false
})

const approvalDisabledMessage = computed(() => {
  if (!(loanForDeliveryNote.value as any)?.delivery_note) {
    return 'ຕ້ອງສ້າງໃບມອບຮັບກ່ອນຈຶ່ງຈະສາມາດອະນຸມັດໄດ້'
  }
  if ((loanForDeliveryNote.value as any)?.delivery_note_approved) {
    return 'ໃບມອບຮັບນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ'
  }
  return ''
})

const originalDeliveryNoteData = ref<DeliveryNote | null>(null)
const originalApprovedStatus = ref(false)

const openDeliveryNoteModal = (loan: LoanApplication) => {
  loanForDeliveryNote.value = loan
  const note = (loan as any).delivery_note;

  if (note) {
    deliveryNoteForm.note_number = note.note_number
    deliveryNoteForm.recipient_name = note.recipient_name
    deliveryNoteForm.recipient_phone = note.recipient_phone
    deliveryNoteForm.delivery_address = note.delivery_address
    deliveryNoteForm.approved = (loan as any).delivery_note_approved

    originalDeliveryNoteData.value = { ...note }
    originalApprovedStatus.value = (loan as any).delivery_note_approved
  } else {
    deliveryNoteForm.note_number = ''
    deliveryNoteForm.recipient_name = getCustomerName(loan)
    deliveryNoteForm.recipient_phone = getCustomerPhone(loan)
    deliveryNoteForm.delivery_address = loan.customer?.address || ''
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

const hasChanges = (): boolean => {
  if (!(loanForDeliveryNote.value as any)?.delivery_note) return false

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

const printDeliveryNote = () => {
  if (!(loanForDeliveryNote.value as any)?.delivery_note) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const loan = loanForDeliveryNote.value
  const note = (loan as any).delivery_note!

  const printContent = `
    <!DOCTYPE html>
    <html lang="lo">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ໃບມອບຮັບສິນຄ້າ - ${note.note_number}</title>
      <style>
        body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; line-height: 1.6; background: white; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .header h1 { font-size: 28px; margin: 0 0 10px 0; color: #000; }
        .header p { font-size: 16px; margin: 0; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #000; border-left: 4px solid #007bff; padding-left: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .info-item { display: flex; flex-direction: column; }
        .info-label { font-weight: bold; color: #333; margin-bottom: 5px; }
        .info-value { color: #000; padding: 8px; background: #f8f9fa; border-radius: 4px; }
        .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd; }
        .signature-line { width: 250px; margin: 20px auto; border-top: 1px solid #000; padding-top: 5px; }
        @media print { .container { max-width: 100%; } body { padding: 0; } }
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
              <span class="info-value">${loan?.loan_id}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ຊື່ລູກຄ້າ:</span>
              <span class="info-value">${getCustomerName(loan!)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ຈຳນວນເງິນ:</span>
              <span class="info-value">${formatPrice(Number(loan?.total_amount) || 0)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ດອກເບ້ຍ:</span>
              <span class="info-value">${loan?.interest_rate_at_apply}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">ໄລຍະເວລາ:</span>
              <span class="info-value">${loan?.loan_period} ເດືອນ</span>
            </div>
            <div class="info-item">
              <span class="info-label">ວັນທີ່ອະນຸມັດ:</span>
              <span class="info-value">${formatDate(loan?.approved_at || loan?.updated_at || '')}</span>
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

const saveDeliveryNote = async () => {
  if (!loanForDeliveryNote.value) return
  isSavingDeliveryNote.value = true
  console.log("Saving delivery note:", deliveryNoteForm);
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSavingDeliveryNote.value = false
  closeDeliveryNoteModal()
  alert.info('ແຈ້ງເຕືອນ', 'ການບັນທຶກໃບມອບຮັບຕ້ອງເຊື່ອມຕໍ່ກັບ API.')
}

const disburseLoan = (loan: LoanApplication) => {
  loanToDisburse.value = loan
  showDisburseModal.value = true
}

const confirmDisburseLoan = async () => {
  if (loanToDisburse.value) {
    console.log("Disbursing loan:", loanToDisburse.value.id)
    alert.info('ແຈ້ງເຕືອນ', 'ການຈ່າຍເງິນສິນເຊື່ອຕ້ອງເຊື່ອມຕໍ່ກັບ API.')
  }

  showDisburseModal.value = false
  loanToDisburse.value = null
}

// ✅ Export CSV (ໃຊ້ field ຂອງ LoanApplication)
const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id,
    'ຊື່ລູກຄ້າ': getCustomerName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount) || 0),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period,
    'ສະຖານະການຈ່າຍ': getDisbursementStatusText((loan as any).disbursement_status),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ອະນຸມັດ': formatDate(loan.approved_at || loan.updatedAt || loan.createdAt || '')
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `approved_loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

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

onMounted(() => {
  // ✅ ເອີ້ນໃຊ້ API ດຶງສະເພາະສິນເຊື່ອທີ່ 'approved'
  loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.APPROVED, is_confirmed: 1 });
})
</script>

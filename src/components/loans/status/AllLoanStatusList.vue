<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ການຈັດການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຕິດຕາມ ແລະ ຈັດການຄຳຂໍສິນເຊື່ອຂອງລູກຄ້າທັງໝົດ</p>
      </div>

      <!-- Export Button -->
      <button
        @click="exportToCSV"
        class="btn btn-outline btn-sm whitespace-nowrap"
      >
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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
          class="input input-bordered w-full"
          @input="debounceSearch"
        />
      </div>

      <!-- Status Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະ</span>
        </label>
        <select
          v-model="statusFilter"
          class="select select-bordered w-full"
        >
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending">ລໍຖ້າການອະນຸມັດ</option>
          <option value="approved">ອະນຸມັດ既แล้ว</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="disbursed">ຈ່າຍເງິນ既แล้ว</option>
          <option value="closed">ປິດສິນເຊື່ອ</option>
        </select>
      </div>

      <!-- Date Range Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ວັນທີ່ສ້າງ</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model="dateFrom"
            type="date"
            class="input input-bordered w-full"
            @change="applyDateFilter"
          />
          <input
            v-model="dateTo"
            type="date"
            class="input input-bordered w-full"
            @change="applyDateFilter"
          />
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
            <th>ສະຖານະ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <!-- <th class="w-24">Actions</th> -->
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

            <!-- Status -->
            <td>
              <span
                class="badge badge-soft"
                :class="getStatusBadgeClass(loan.status)"
              >
                {{ getStatusText(loan.status) }}
              </span>
            </td>

            <!-- Approved By -->
            <td>
              <span v-if="loan.approved_by">
                {{ loan.approved_by }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>

            <!-- Created At -->
            <td>{{ formatDate(loan.created_at) }}</td>

            <!-- Actions -->
            
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນການຂໍສິນເຊື່ອ
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
        <select
          v-model.number="pageSize"
          class="select select-sm select-bordered"
        >
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button
          class="btn btn-sm"
          :disabled="!hasPreviousPage"
          @click="previousPage"
        >
          ກ່ອນໜ້າ
        </button>

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="btn btn-sm"
          :disabled="!hasNextPage"
          @click="nextPage"
        >
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- Loan Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                <span
                  class="badge badge-soft"
                  :class="getStatusBadgeClass(selectedLoan.status)"
                >
                  {{ getStatusText(selectedLoan.status) }}
                </span>
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
                <p>{{ selectedLoan.approved_by || '-' }}</p>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.address }}</p>
            </div>

            <!-- Notes -->
            <div v-if="selectedLoan.notes">
              <label class="text-sm font-medium text-gray-500">ໝາຍເຫດ</label>
              <p>{{ selectedLoan.notes }}</p>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.created_at) }}</p>
              </div>
              <div v-if="selectedLoan.approved_at">
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
            <button
              class="btn btn-soft btn-secondary"
              @click="closeDetailsModal"
            >
              ປິດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Action Confirmation Modals -->

    <!-- Approve Modal -->
    <teleport to="body">
      <div v-if="showApproveModal && loanToAction" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ອະນຸມັດສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດສິນເຊື່ອຂອງ "{{ loanToAction.customer_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="btn btn-soft btn-secondary"
              @click="showApproveModal = false"
            >
              ຍົກເລີກ
            </button>
            <button
              class="btn btn-success"
              @click="confirmApproveLoan"
            >
              ອະນຸມັດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Reject Modal -->
    <teleport to="body">
      <div v-if="showRejectModal && loanToAction" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-error">ປະຕິເສດສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປະຕິເສດສິນເຊື່ອຂອງ "{{ loanToAction.customer_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="btn btn-soft btn-secondary"
              @click="showRejectModal = false"
            >
              ຍົກເລີກ
            </button>
            <button
              class="btn btn-error"
              @click="confirmRejectLoan"
            >
              ປະຕິເສດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Disburse Modal -->
    <teleport to="body">
      <div v-if="showDisburseModal && loanToAction" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-primary">ຈ່າຍເງິນສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຈ່າຍເງິນສິນເຊື່ອ {{ formatPrice(loanToAction.amount) }} ໃຫ້ "{{ loanToAction.customer_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="btn btn-soft btn-secondary"
              @click="showDisburseModal = false"
            >
              ຍົກເລີກ
            </button>
            <button
              class="btn btn-primary"
              @click="confirmDisburseLoan"
            >
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
interface Loan {
  id: number
  loan_number: string
  customer_name: string
  phone: string
  address: string
  amount: number
  interest_rate: number
  term: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed'
  approved_by: string | null
  approved_at: string | null
  disbursed_at: string | null
  notes: string | null
  created_at: string
}

// Reactive state
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showDisburseModal = ref(false)
const selectedLoan = ref<Loan | null>(null)
const loanToAction = ref<Loan | null>(null)

// Mock data
const mockLoans: Loan[] = [
  {
    id: 1,
    loan_number: 'LN2024001',
    customer_name: 'ສົມຊາຍ ພົນສຸກ',
    phone: '020 1234 5678',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 5000000,
    interest_rate: 5.5,
    term: 12,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    disbursed_at: null,
    notes: 'ລູກຄ້າໃໝ່, ຕ້ອງການກວດສອບເພີ່ມເຕີມ',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
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
    disbursed_at: null,
    notes: 'ອະນຸມັດໂດຍຜູ້ຈັດການ',
    created_at: '2024-01-18T09:45:00Z'
  },
  {
    id: 3,
    loan_number: 'LN2024003',
    customer_name: 'ອຸດົມ ສີສົມບັດ',
    phone: '020 1122 3344',
    address: 'ບ້ານ ກະສີ, ເມືອງ ສະຫວັນນະເຂດ, ສະຫວັນນະເຂດ',
    amount: 3000000,
    interest_rate: 6.0,
    term: 6,
    status: 'disbursed',
    approved_by: 'ບຸນເຊີຍ ສຸກສົມ',
    approved_at: '2024-01-25T11:20:00Z',
    disbursed_at: '2024-01-26T16:30:00Z',
    notes: 'ຈ່າຍເງິນແລ້ວ',
    created_at: '2024-01-22T13:10:00Z'
  },
  {
    id: 4,
    loan_number: 'LN2024004',
    customer_name: 'ຈັນດາ ວົງສີ',
    phone: '020 5566 7788',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 2000000,
    interest_rate: 5.25,
    term: 12,
    status: 'rejected',
    approved_by: 'ສົມບຸນ ພົນສຸກ',
    approved_at: '2024-01-30T10:45:00Z',
    disbursed_at: null,
    notes: 'ບໍ່ຜ່ານການກວດສອບຄວາມສາມາດການຈ່າຍຄືນ',
    created_at: '2024-01-28T15:30:00Z'
  },
  {
    id: 5,
    loan_number: 'LN2024005',
    customer_name: 'ບຸນເຊີຍ ສຸກສົມ',
    phone: '020 9988 7766',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 7500000,
    interest_rate: 4.5,
    term: 18,
    status: 'closed',
    approved_by: 'ອຸດົມ ສີສົມບັດ',
    approved_at: '2024-02-05T09:15:00Z',
    disbursed_at: '2024-02-06T14:20:00Z',
    notes: 'ປິດສິນເຊື່ອແລ້ວ',
    created_at: '2024-02-01T11:45:00Z'
  }
]

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
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

// Filtered loans
const filteredLoans = computed(() => {
  let filtered = mockLoans

  // Search filter
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      loan.customer_name.toLowerCase().includes(query) ||
      loan.phone.includes(query) ||
      loan.loan_number.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(loan => loan.status === statusFilter.value)
  }

  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = new Date(loan.created_at).toISOString().split('T')[0]
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
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'pending': return 'badge-warning'
    case 'approved': return 'badge-info'
    case 'rejected': return 'badge-error'
    case 'disbursed': return 'badge-success'
    case 'closed': return 'badge-neutral'
    default: return 'badge-neutral'
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'ລໍຖ້າການອະນຸມັດ',
    'approved': 'ອະນຸມັດແລ້ວ',
    'rejected': 'ປະຕິເສດ',
    'disbursed': 'ຈ່າຍເງິນແລ້ວ',
    'closed': 'ປິດສິນເຊື່ອ'
  }
  return statusMap[status] || status
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
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

const approveLoan = (loan: Loan) => {
  loanToAction.value = loan
  showApproveModal.value = true
}

const confirmApproveLoan = async () => {
  if (loanToAction.value) {
    // Update mock data
    const index = mockLoans.findIndex(l => l.id === loanToAction.value!.id)
    if (index !== -1) {
      mockLoans[index].status = 'approved'
      mockLoans[index].approved_by = 'ຜູ້ໃຊ້ປັດຈຸບັນ'
      mockLoans[index].approved_at = new Date().toISOString()
    }
    alert('ອະນຸມັດສິນເຊື່ອສຳເລັດ!')
  }

  showApproveModal.value = false
  loanToAction.value = null
}

const rejectLoan = (loan: Loan) => {
  loanToAction.value = loan
  showRejectModal.value = true
}

const confirmRejectLoan = async () => {
  if (loanToAction.value) {
    // Update mock data
    const index = mockLoans.findIndex(l => l.id === loanToAction.value!.id)
    if (index !== -1) {
      mockLoans[index].status = 'rejected'
      mockLoans[index].approved_by = 'ຜູ້ໃຊ້ປັດຈຸບັນ'
      mockLoans[index].approved_at = new Date().toISOString()
    }
    alert('ປະຕິເສດສິນເຊື່ອສຳເລັດ!')
  }

  showRejectModal.value = false
  loanToAction.value = null
}

const disburseLoan = (loan: Loan) => {
  loanToAction.value = loan
  showDisburseModal.value = true
}

const confirmDisburseLoan = async () => {
  if (loanToAction.value) {
    // Update mock data
    const index = mockLoans.findIndex(l => l.id === loanToAction.value!.id)
    if (index !== -1) {
      mockLoans[index].status = 'disbursed'
      mockLoans[index].disbursed_at = new Date().toISOString()
    }
    alert('ຈ່າຍເງິນສິນເຊື່ອສຳເລັດ!')
  }

  showDisburseModal.value = false
  loanToAction.value = null
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
    'ສະຖານະ': getStatusText(loan.status),
    'ຜູ້ອະນຸມັດ': loan.approved_by || '-',
    'ວັນທີ່ສ້າງ': formatDate(loan.created_at)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loans_${new Date().toISOString().split('T')[0]}.csv`
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

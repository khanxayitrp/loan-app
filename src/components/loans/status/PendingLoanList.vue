<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອລໍຖ້າການອະນຸມັດ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ</p>
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            <th>ຄະແນນສິນເຊື່ອ</th>
            <th>ວັນທີ່ສ້າງ</th>
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

            <!-- Credit Score -->
            <td>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ loan.credit_score || '-' }}</span>
                <button
                  class="btn btn-circle btn-text btn-xs"
                  @click="openCreditScoreModal(loan)"
                  aria-label="Calculate credit score"
                >
                  <span class="icon-[tabler--calculator] size-3"></span>
                </button>
              </div>
            </td>

            <!-- Created At -->
            <td>{{ formatDate(loan.created_at) }}</td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button
                  class="btn btn-circle btn-text btn-sm"
                  @click="viewLoanDetails(loan)"
                  aria-label="View details"
                >
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button
                  class="btn btn-circle btn-text btn-sm text-success"
                  @click="approveLoan(loan)"
                  aria-label="Approve loan"
                >
                  <span class="icon-[tabler--check] size-4"></span>
                </button>

                <button
                  class="btn btn-circle btn-text btn-sm text-error"
                  @click="rejectLoan(loan)"
                  aria-label="Reject loan"
                >
                  <span class="icon-[tabler--x] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="9" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນການຂໍສິນເຊື່ອທີ່ລໍຖ້າການອະນຸມັດ
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
                <span class="badge badge-soft badge-warning">
                  ລໍຖ້າການອະນຸມັດ
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
                <label class="text-sm font-medium text-gray-500">ຄະແນນສິນເຊື່ອ</label>
                <p>{{ selectedLoan.credit_score || 'ຍັງບໍ່ໄດ້ຄຳນວນ' }}</p>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.address }}</p>
            </div>

            <!-- Income Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                <p>{{ formatPrice(selectedLoan.monthly_income) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                <p>{{ formatPrice(selectedLoan.other_debts) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ອາຍຸ</label>
                <p>{{ selectedLoan.age }} ປີ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະການເຮັດວຽກ</label>
                <p>{{ selectedLoan.employment_status }}</p>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="selectedLoan.notes">
              <label class="text-sm font-medium text-gray-500">ໝາຍເຫດ</label>
              <p>{{ selectedLoan.notes }}</p>
            </div>

            <!-- Timestamps -->
            <div>
              <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
              <p>{{ formatDate(selectedLoan.created_at) }}</p>
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

    <!-- Credit Score Calculator Modal -->
    <teleport to="body">
      <div v-if="showCreditScoreModal && loanForCreditScore" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">ຄຳນວນຄະແນນສິນເຊື່ອ</h3>
            <button @click="closeCreditScoreModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <form @submit.prevent="calculateCreditScore" class="space-y-4">
            <!-- Monthly Income -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ລາຍຮັບຕໍ່ເດືອນ (ກີບ) *</span>
              </label>
              <input
                v-model.number="creditScoreForm.monthly_income"
                type="number"
                placeholder="ປ້ອນລາຍຮັບຕໍ່ເດືອນ"
                class="input input-bordered w-full"
                required
              />
            </div>

            <!-- Other Debts -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ໜີ້ສິນອື່ນໆ (ກີບ) *</span>
              </label>
              <input
                v-model.number="creditScoreForm.other_debts"
                type="number"
                placeholder="ປ້ອນຈຳນວນໜີ້ສິນອື່ນໆ"
                class="input input-bordered w-full"
                required
              />
            </div>

            <!-- Age -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ອາຍຸ (ປີ) *</span>
              </label>
              <input
                v-model.number="creditScoreForm.age"
                type="number"
                placeholder="ປ້ອນອາຍຸ"
                class="input input-bordered w-full"
                min="18"
                max="100"
                required
              />
            </div>

            <!-- Employment Status -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ສະຖານະການເຮັດວຽກ *</span>
              </label>
              <select
                v-model="creditScoreForm.employment_status"
                class="select select-bordered w-full"
                required
              >
                <option value="" disabled selected>ເລືອກສະຖານະການເຮັດວຽກ</option>
                <option value="employed">ມີວຽກເຮັດງານທຳ</option>
                <option value="self-employed">ເຮັດວຽກເອງ</option>
                <option value="unemployed">ບໍ່ມີວຽກເຮັດງານທຳ</option>
                <option value="retired">ພັກເຊົາ</option>
              </select>
            </div>

            <!-- Credit Score Result -->
            <div v-if="creditScoreResult" class="p-4 bg-base-100 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">ຄະແນນສິນເຊື່ອ:</span>
                <span class="text-2xl font-bold" :class="getScoreColorClass(creditScoreResult.score)">
                  {{ creditScoreResult.score }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ creditScoreResult.grade }} - {{ creditScoreResult.description }}
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="btn btn-soft btn-secondary"
                @click="closeCreditScoreModal"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isCalculating"
              >
                <span v-if="isCalculating" class="loading loading-spinner loading-xs"></span>
                <span v-else>ຄຳນວນຄະແນນ</span>
              </button>
            </div>
          </form>
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
  status: 'pending'
  monthly_income: number
  other_debts: number
  age: number
  employment_status: string
  credit_score: number | null
  notes: string | null
  created_at: string
}

// Reactive state
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showCreditScoreModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedLoan = ref<Loan | null>(null)
const loanForCreditScore = ref<Loan | null>(null)
const loanToAction = ref<Loan | null>(null)

// Credit score form
const creditScoreForm = reactive({
  monthly_income: 0,
  other_debts: 0,
  age: 0,
  employment_status: ''
})

const creditScoreResult = ref<{
  score: number
  grade: string
  description: string
} | null>(null)

const isCalculating = ref(false)

// Mock data (only pending loans)
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
    monthly_income: 3000000,
    other_debts: 500000,
    age: 35,
    employment_status: 'employed',
    credit_score: null,
    notes: 'ລູກຄ້າໃໝ່, ຕ້ອງການກວດສອບເພີ່ມເຕີມ',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    loan_number: 'LN2024006',
    customer_name: 'ນາງ ພົນທອງ',
    phone: '020 2233 4455',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 2500000,
    interest_rate: 6.0,
    term: 6,
    status: 'pending',
    monthly_income: 2000000,
    other_debts: 300000,
    age: 28,
    employment_status: 'employed',
    credit_score: 720,
    notes: 'ມີປະວັດການຈ່າຍຄືນດີ',
    created_at: '2024-02-10T14:20:00Z'
  },
  {
    id: 3,
    loan_number: 'LN2024007',
    customer_name: 'ໄຊສົມບັດ ສີຫາວ',
    phone: '020 3344 5566',
    address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    amount: 8000000,
    interest_rate: 5.0,
    term: 24,
    status: 'pending',
    monthly_income: 5000000,
    other_debts: 1000000,
    age: 42,
    employment_status: 'self-employed',
    credit_score: null,
    notes: 'ເຈົ້າຂອງທຸລະກິດຂະໜາດນ້ອຍ',
    created_at: '2024-02-15T09:45:00Z'
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

// Filtered loans (only pending)
const filteredLoans = computed(() => {
  let filtered = mockLoans.filter(loan => loan.status === 'pending')

  // Search filter
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan =>
      loan.customer_name.toLowerCase().includes(query) ||
      loan.phone.includes(query) ||
      loan.loan_number.toLowerCase().includes(query)
    )
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
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}

const getScoreColorClass = (score: number): string => {
  if (score >= 750) return 'text-success'
  if (score >= 650) return 'text-info'
  if (score >= 550) return 'text-warning'
  return 'text-error'
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

const openCreditScoreModal = (loan: Loan) => {
  loanForCreditScore.value = loan
  // Fill form with existing data
  creditScoreForm.monthly_income = loan.monthly_income
  creditScoreForm.other_debts = loan.other_debts
  creditScoreForm.age = loan.age
  creditScoreForm.employment_status = loan.employment_status
  creditScoreResult.value = loan.credit_score ? {
    score: loan.credit_score,
    grade: getGradeFromScore(loan.credit_score),
    description: getDescriptionFromScore(loan.credit_score)
  } : null
  showCreditScoreModal.value = true
}

const closeCreditScoreModal = () => {
  showCreditScoreModal.value = false
  loanForCreditScore.value = null
  creditScoreResult.value = null
}

const calculateCreditScore = async () => {
  if (!loanForCreditScore.value) return

  isCalculating.value = true
  try {
    // Simulate credit score calculation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simple credit score algorithm
    let score = 300 // Base score

    // Income factor (higher income = higher score)
    if (creditScoreForm.monthly_income >= 5000000) score += 200
    else if (creditScoreForm.monthly_income >= 3000000) score += 150
    else if (creditScoreForm.monthly_income >= 2000000) score += 100
    else if (creditScoreForm.monthly_income >= 1000000) score += 50

    // Debt-to-income ratio (lower ratio = higher score)
    const dti = creditScoreForm.other_debts / creditScoreForm.monthly_income
    if (dti <= 0.2) score += 100
    else if (dti <= 0.3) score += 75
    else if (dti <= 0.4) score += 50
    else if (dti <= 0.5) score += 25

    // Age factor (older = more stable)
    if (creditScoreForm.age >= 40) score += 50
    else if (creditScoreForm.age >= 30) score += 30
    else if (creditScoreForm.age >= 25) score += 20

    // Employment status
    if (creditScoreForm.employment_status === 'employed') score += 75
    else if (creditScoreForm.employment_status === 'self-employed') score += 50
    else if (creditScoreForm.employment_status === 'retired') score += 25

    // Ensure score is within range
    score = Math.max(300, Math.min(850, score))

    creditScoreResult.value = {
      score: Math.round(score),
      grade: getGradeFromScore(score),
      description: getDescriptionFromScore(score)
    }

    // Update loan data
    const index = mockLoans.findIndex(l => l.id === loanForCreditScore.value!.id)
    if (index !== -1) {
      mockLoans[index].monthly_income = creditScoreForm.monthly_income
      mockLoans[index].other_debts = creditScoreForm.other_debts
      mockLoans[index].age = creditScoreForm.age
      mockLoans[index].employment_status = creditScoreForm.employment_status
      mockLoans[index].credit_score = Math.round(score)
    }

  } catch (error) {
    console.error('Error calculating credit score:', error)
    alert('ເກີດຂໍ້ຜິດພາດການຄຳນວນຄະແນນສິນເຊື່ອ')
  } finally {
    isCalculating.value = false
  }
}

const getGradeFromScore = (score: number): string => {
  if (score >= 750) return 'A'
  if (score >= 700) return 'B'
  if (score >= 650) return 'C'
  if (score >= 600) return 'D'
  return 'F'
}

const getDescriptionFromScore = (score: number): string => {
  if (score >= 750) return 'ດີເລີດ'
  if (score >= 700) return 'ດີ'
  if (score >= 650) return 'ປານກາງ'
  if (score >= 600) return 'ຕ່ຳ'
  return 'ຕ່ຳຫຼາຍ'
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
      mockLoans[index].status = 'approved' as any
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
      mockLoans[index].status = 'rejected' as any
      mockLoans[index].approved_by = 'ຜູ້ໃຊ້ປັດຈຸບັນ'
      mockLoans[index].approved_at = new Date().toISOString()
    }
    alert('ປະຕິເສດສິນເຊື່ອສຳເລັດ!')
  }

  showRejectModal.value = false
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
    'ຄະແນນສິນເຊື່ອ': loan.credit_score || '-',
    'ວັນທີ່ສ້າງ': formatDate(loan.created_at)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `pending_loans_${new Date().toISOString().split('T')[0]}.csv`
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

<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ການຈັດການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ຕິດຕາມ ແລະ ຈັດການຄຳຂໍສິນເຊື່ອຂອງລູກຄ້າທັງໝົດ
          <span v-if="totalLoans > 0" class="ml-2 text-primary">
            ({{ totalLoans }} ລາຍການ)
          </span>
        </p>
      </div>

      <!-- Export Button -->
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap"
        :disabled="isLoading || displayedLoans.length === 0">
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

      <!-- Status Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ສະຖານະ</span>
        </label>
        <select v-model="statusFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending">ລໍຖ້າການອະນຸມັດ</option>
          <option value="verifying">ກຳລັງກວດສອບ</option>
          <option value="approved">ອະນຸມັດແລ້ວ</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="completed">ສຳເລັດ</option>
          <option value="draft">ຮ່າງ</option>
        </select>
      </div>

      <!-- Date Range Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ວັນທີ່ສ້າງ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <!-- Saving State -->
    <div v-if="isSaving" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div class="loading loading-spinner loading-lg"></div>
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
          <tr v-for="loan in displayedLoans" :key="loan.id" @click="viewLoanDetails(loan)"
            class="cursor-pointer hover:bg-base-200">
            <!-- Loan Number -->
            <td class="font-mono text-gray-600 dark:text-gray-400">
              {{ loan.loan_id || '-' }}
            </td>

            <!-- Customer Name -->
            <td class="font-medium">
              {{ getCustomerFullName(loan) }}
            </td>

            <!-- Phone -->
            <td>{{ getCustomerPhone(loan) }}</td>

            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(loan.total_amount) }}</td>

            <!-- Interest Rate -->
            <td>{{ loan.interest_rate_at_apply || '-' }}%</td>

            <!-- Term -->
            <td>{{ loan.loan_period || '-' }} ເດືອນ</td>

            <!-- Status -->
            <td>
              <span class="badge badge-soft" :class="getStatusBadgeClass(loan.status)">
                {{ getStatusText(loan.status) }}
              </span>
            </td>

            <!-- Approved By -->
            <td>
              <span v-if="loan.approver?.username">
                {{ loan.approver.username }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>

            <!-- Created At -->
            <td>{{ formatDate(loan.createdAt) }}</td>

            <!-- Actions -->
            <!-- <td @click.stop>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-xs">
                  <span class="icon-[tabler--dots-vertical] size-4"></span>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                  <li>
                    <a @click="viewLoanDetails(loan)">
                      <span class="icon-[tabler--eye] size-4"></span>
                      ເບິ່ງລາຍລະອຽດ
                    </a>
                  </li>
                  <li v-if="loan.status === 'pending'">
                    <a @click="approveLoan(loan)" class="text-success">
                      <span class="icon-[tabler--check] size-4"></span>
                      ອະນຸມັດ
                    </a>
                  </li>
                  <li v-if="loan.status === 'pending'">
                    <a @click="rejectLoan(loan)" class="text-error">
                      <span class="icon-[tabler--x] size-4"></span>
                      ປະຕິເສດ
                    </a>
                  </li>
                  <li v-if="loan.status === 'approved'">
                    <a @click="disburseLoan(loan)" class="text-primary">
                      <span class="icon-[tabler--cash] size-4"></span>
                      ຈ່າຍເງິນ
                    </a>
                  </li>
                </ul>
              </div>
            </td> -->
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-8 text-base-content/60">
              <div class="flex flex-col items-center gap-2">
                <span class="icon-[tabler--database-off] size-8"></span>
                <p>ບໍ່ພົບຂໍ້ມູນການຂໍສິນເຊື່ອ</p>
              </div>
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
                <p class="font-mono">{{ selectedLoan.loan_id || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ສະຖານະ</label>
                <span class="badge badge-soft" :class="getStatusBadgeClass(selectedLoan.status)">
                  {{ getStatusText(selectedLoan.status) }}
                </span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                <p>{{ getCustomerFullName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                <p>{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-medium">{{ formatPrice(selectedLoan.total_amount) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                <p>{{ selectedLoan.interest_rate_at_apply || '-' }}%</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                <p>{{ selectedLoan.loan_period || '-' }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p>{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <!-- Customer Address -->
            <div v-if="selectedLoan.customer?.address">
              <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
              <p class="whitespace-pre-line">{{ selectedLoan.customer.address }}</p>
            </div>

            <!-- Remarks/Notes -->
            <div v-if="selectedLoan.remarks">
              <label class="text-sm font-medium text-gray-500">ໝາຍເຫດ</label>
              <p>{{ selectedLoan.remarks }}</p>
            </div>

            <!-- Documents -->
            <div v-if="currentDocuments.length > 0">
              <label class="text-sm font-medium text-gray-500 mb-2 block">ເອກະສານ</label>
              <div class="flex flex-wrap gap-2">
                <div v-for="doc in currentDocuments" :key="doc.id" class="badge badge-outline gap-1">
                  <span class="icon-[tabler--file-text] size-3"></span>
                  {{ doc.document_type || 'ເອກະສານ' }}
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
              ປິດ
            </button>
            <button v-if="selectedLoan.status === 'pending'" class="btn btn-success" @click="approveLoan(selectedLoan)">
              ອະນຸມັດ
            </button>
            <button v-if="selectedLoan.status === 'pending'" class="btn btn-error" @click="rejectLoan(selectedLoan)">
              ປະຕິເສດ
            </button>
            <button v-if="selectedLoan.status === 'approved'" class="btn btn-primary"
              @click="disburseLoan(selectedLoan)">
              ຈ່າຍເງິນ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Action Confirmation Modals (Approve, Reject, Disburse) -->
    <!-- ใช้โครงสร้างเดิมจากโค้ดก่อนหน้า -->
    <teleport to="body">
      <div v-if="showApproveModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ອະນຸມັດສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດສິນເຊື່ອຂອງ "{{ getCustomerFullName(loanToAction) }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showApproveModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-success" @click="confirmApproveLoan" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              ອະນຸມັດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showRejectModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-error">ປະຕິເສດສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປະຕິເສດສິນເຊື່ອຂອງ "{{ getCustomerFullName(loanToAction) }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showRejectModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-error" @click="confirmRejectLoan" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              ປະຕິເສດ
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showDisburseModal && loanToAction"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-primary">ຈ່າຍເງິນສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຈ່າຍເງິນສິນເຊື່ອ {{ formatPrice(loanToAction.total_amount) }} ໃຫ້ "{{
              getCustomerFullName(loanToAction) }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showDisburseModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" @click="confirmDisburseLoan" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              ຈ່າຍເງິນ
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { LoanApplicationStatus, type LoanApplication, type LoanApplicationFilters } from '@/types/loanApplication'

// 📦 ใช้ Pinia Store
const loanStore = useLoanApplicationStore()
const {
  loanApplications,
  currentLoanApplication,
  isLoading,
  isSaving,
  currentDocuments,
  customer
} = storeToRefs(loanStore)

// 🔍 Reactive state สำหรับ UI
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref<LoanApplicationStatus | ''>('')
const dateFrom = ref('')
const dateTo = ref('')

// 💰 Amount filter
const amountMin = ref<number | undefined>(undefined)
const amountMax = ref<number | undefined>(undefined)

// 🪟 Modal states
const showDetailsModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showDisburseModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)
const loanToAction = ref<LoanApplication | null>(null)

// 📄 Pagination
const debouncedSearch = ref('')
let debounceTimer: NodeJS.Timeout | null = null

// ⏱️ Debounce search
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
    fetchLoans()
  }, 300)
}

// 📅 Apply date filter
const applyDateFilter = () => {
  currentPage.value = 1
  fetchLoans()
}

// 🔄 Fetch Loans จาก Store
const fetchLoans = async () => {
  try {
    const filters: LoanApplicationFilters = {
      is_confirmed: 1,
      status: statusFilter.value || undefined,
      min: amountMin.value,
      max: amountMax.value,
      // ✅ เพิ่ม CustomerId ถ้ามีการค้นหา
      CustomerId: customer.value?.id || undefined
    }

    await loanStore.fetchLoanApplications(filters)
  } catch (error) {
    console.error('Failed to fetch loans:', error)
  }
}

// 📊 Filtered loans (ใช้ข้อมูลจาก Store)
const filteredLoans = computed(() => {
  let filtered = loanApplications.value

  // 🔍 Search filter (client-side สำหรับ search ทั่วไป)
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(loan => {
      const customerName = `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.toLowerCase()
      const phone = loan.customer?.phone || ''
      const loanId = loan.loan_id || ''

      return customerName.includes(query) ||
        phone.includes(query) ||
        loanId.toLowerCase().includes(query)
    })
  }

  // 📅 Date filter (client-side)
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = loan.createdAt ? new Date(loan.createdAt).toISOString().split('T')[0] : undefined;
      if (!loanDate) return false;;
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';
      return loanDate >= fromDate && loanDate <= toDate;
    })
  }

  return filtered
})

// 📄 Paginated loans
const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

// 📈 Pagination computed
const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// 🏷️ Status Badge Class
const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'badge-warning',
    'verifying': 'badge-info',
    'verified': 'badge-primary',
    'approved': 'badge-success',
    'rejected': 'badge-error',
    'completed': 'badge-neutral',
    'draft': 'badge-ghost'
  }
  return map[status] || 'badge-neutral'
}

// 📝 Status Text (Lao)
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'ລໍຖ້າການກວດສອບ',
    'verifying': 'ກຳລັງກວດສອບ',
    'verified': 'ກວດສອບແລ້ວ',
    'approved': 'ອະນຸມັດແລ້ວ',
    'rejected': 'ປະຕິເສດ',
    'completed': 'ສຳເລັດ',
    'draft': 'ຮ່າງ'
  }
  return map[status] || status
}

// 💰 Format Price


// 📅 Format Date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 👤 Get Customer Full Name
const getCustomerFullName = (loan: LoanApplication): string => {
  if (loan.customer) {
    return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() || 'ไม່ຮູ້ຊື່'
  }
  return 'ไม່ຮູ້ຊື່'
}

// 📞 Get Customer Phone
const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

// 🎯 Action Handlers

// 📋 View Details
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    selectedLoan.value = loan
    await loanStore.fetchLoanApplicationById(loan.id)
    if (loanStore.currentLoanApplication) {
      selectedLoan.value = loanStore.currentLoanApplication
      // 📄 Fetch documents
      await loanStore.fetchDocuments(loan.id)
    }
  } catch (error) {
    console.error('Failed to load loan details:', error)
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
}

// ✅ Approve
const approveLoan = (loan: LoanApplication) => {
  loanToAction.value = loan
  showApproveModal.value = true
}

const confirmApproveLoan = async () => {
  if (!loanToAction.value) return

  try {
    await loanStore.changeStatus(loanToAction.value.id, {
      status: LoanApplicationStatus.APPROVED,
      remarks: 'ອະນຸມັດໂດຍຜູ້ໃຊ້'
    })
    alert('ອະນຸມັດສິນເຊື່ອສຳເລັດ!')
    await fetchLoans()
  } catch (error: any) {
    alert('ອະນຸມັດລົ້ມເຫຼວ: ' + (error.message || 'Unknown error'))
  } finally {
    showApproveModal.value = false
    loanToAction.value = null
  }
}

// ❌ Reject
const rejectLoan = (loan: LoanApplication) => {
  loanToAction.value = loan
  showRejectModal.value = true
}

const confirmRejectLoan = async () => {
  if (!loanToAction.value) return

  try {
    await loanStore.changeStatus(loanToAction.value.id, {
      status: LoanApplicationStatus.REJECTED,
      remarks: 'ປະຕິເສດໂດຍຜູ້ໃຊ້'
    })
    alert('ປະຕິເສດສິນເຊື່ອສຳເລັດ!')
    await fetchLoans()
  } catch (error: any) {
    alert('ປະຕິເສດລົ້ມເຫຼວ: ' + (error.message || 'Unknown error'))
  } finally {
    showRejectModal.value = false
    loanToAction.value = null
  }
}

// 💸 Disburse
const disburseLoan = (loan: LoanApplication) => {
  loanToAction.value = loan
  showDisburseModal.value = true
}

const confirmDisburseLoan = async () => {
  if (!loanToAction.value) return

  try {
    await loanStore.changeStatus(loanToAction.value.id, {
      status: LoanApplicationStatus.COMPLETED,
      remarks: 'ຈ່າຍເງິນແລ້ວ'
    })
    alert('ຈ່າຍເງິນສິນເຊື່ອສຳເລັດ!')
    await fetchLoans()
  } catch (error: any) {
    alert('ຈ່າຍເງິນລົ້ມເຫຼວ: ' + (error.message || 'Unknown error'))
  } finally {
    showDisburseModal.value = false
    loanToAction.value = null
  }
}

// 📥 Export CSV
const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
    'ຊື່ລູກຄ້າ': getCustomerFullName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount)),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '-',
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '-',
    'ສະຖານະ': getStatusText(loan.status),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ສ້າງ': formatDate(loan.createdAt)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// 📄 Pagination
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

// 🔍 Search Customer by Phone (ใช้ Store)
const searchCustomer = async (phone: string) => {
  if (!phone || phone.length < 9) return

  try {
    await loanStore.fetchCustomerByPhone(phone)
    if (loanStore.customer) {
      console.log('Customer found:', loanStore.customer)
    }
  } catch (error) {
    console.error('Customer not found:', error)
  }
}

// 🔄 Watchers
watch(pageSize, () => {
  currentPage.value = 1
})

watch(statusFilter, () => {
  currentPage.value = 1
  fetchLoans()
})

// 🚀 Load on mount
onMounted(() => {
  fetchLoans()
})
</script>

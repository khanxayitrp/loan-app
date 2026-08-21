<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ການຈັດການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ຕິດຕາມ ແລະ ຈັດການຄຳຂໍສິນເຊື່ອຂອງລູກຄ້າທັງໝົດ
          <span class="ml-1 text-primary font-medium">
            (ທັງໝົດ {{ totalFiltered }} ລາຍການ)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchLoans" class="btn btn-outline btn-sm">
          <span class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap"
          :disabled="isLoading || filteredLoans.length === 0">
          <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
        </button>
        <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success"
          :disabled="isLoading || filteredLoans.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <!-- Search Input (Filter เฉพาะข้อมูลที่โหลดมาแล้ว) -->
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ
            (ໃນລາຍການທີ່ໂຫຼດມາ)</span>
        </label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ເລກທີ່..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ສະຖານະ</span>
        </label>
        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending">ລໍຖ້າການອະນຸມັດ</option>
          <option value="verifying">ກຳລັງກວດສອບ</option>
          <option value="verified">ກວດສອບແລ້ວ</option>
          <option value="approved">ອະນຸມັດແລ້ວ</option>
          <option value="disbursed">ປ່ອຍສິນເຊື່ອແລ້ວ</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="completed">ສຳເລັດ (ປິດບັນຊີ)</option>
          <option value="draft">ຮ່າງ</option>
        </select>
      </div>

      <!-- Date Range Filter -->
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ວັນທີ່ສ້າງ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full"
            @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && loanApplications.length === 0" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <!-- Table -->
    <div v-else
      class="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            <th>ເລກທີ່ສິນເຊື່ອ</th>
            <th>ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ໄລຍະເວລາ</th>
            <th>ສະຖານະ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີ່ສ້າງ</th>
          </tr>
        </thead>
        <tbody>
          <!-- 🟢 ປ່ຽນມານຳໃຊ້ displayedLoans ສຳລັບ Client-Side Pagination -->
          <tr v-for="loan in displayedLoans" :key="loan.id" @click="viewLoanDetails(loan)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">

            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">
              {{ loan.loan_id || '-' }}
            </td>
            <td>
              <div class="font-bold text-indigo-600 dark:text-indigo-400">{{ getCustomerFullName(loan) }}</div>
            </td>
            <td>
              <div class="text-sm text-gray-500 flex items-center gap-1">
                <span class="icon-[tabler--phone] size-3"></span> {{ getCustomerPhone(loan) }}
              </div>
            </td>
            <td>
              <div class="font-bold text-emerald-600">
                {{ formatPrice(Number(loan.total_amount || 0) - Number(loan.down_payment || 0)) }}
              </div>
            </td>
            <td class="text-sm">{{ loan.interest_rate_at_apply || '-' }}%</td>
            <td class="text-sm">{{ loan.loan_period || '-' }} ເດືອນ</td>
            <td>
              <span class="badge badge-sm border-0 font-medium text-white shadow-sm"
                :class="getStatusBadgeClass(loan.status)">
                {{ getStatusText(loan.status) }}
              </span>
            </td>
            <td class="text-sm text-gray-600">
              <span v-if="loan.approver?.username">{{ loan.approver.username }}</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(loan.createdAt) }}</td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="9" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--file-search] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບການຄົ້ນຫາ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 🟢 ລະບົບແບ່ງໜ້າແບບ Local Pagination -->
    <div v-if="!isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທີ່ຄົ້ນຫາພົບ {{ totalFiltered }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered" @change="resetPage">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
          <option :value="100">100 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <!-- 🟢 ປຸ່ມ Load More ດຶງຂໍ້ມູນຈາກ Server ຖ້າຄົ້ນຫາບໍ່ເຈີ -->
    <div v-if="!isLoading"
      class="flex flex-col items-center mt-6 mb-4 border-t pt-6 border-dashed dark:border-gray-700">
      <button v-if="loanStore.canLoadMore" class="btn btn-primary btn-outline w-full max-w-xs" @click="loadMore"
        :disabled="loanStore.isLoadingMore">
        <span v-if="loanStore.isLoadingMore" class="loading loading-spinner loading-sm"></span>
        <span v-else class="icon-[tabler--arrow-down-circle] size-5"></span>
        ໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນເພີ່ມເຕີມ
      </button>

      <p v-else class="text-sm text-gray-400 italic">
        (ດຶງຂໍ້ມູນມາຄົບທັງໝົດແລ້ວ)
      </p>
    </div>

    <!-- Loan Details Modal (Read-Only) -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <span class="icon-[tabler--file-info] text-primary size-6"></span> ລາຍລະອຽດສິນເຊື່ອ
            </h3>
            <button @click="closeDetailsModal" class="btn btn-ghost btn-circle btn-sm">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ເລກທີ່ສິນເຊື່ອ</label>
                <p class="font-mono font-bold text-primary">{{ selectedLoan.loan_id || '-' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border">
                <label class="text-xs text-gray-500 block mb-1">ສະຖານະ</label>
                <span class="badge badge-sm border-0 font-medium text-white shadow-sm"
                  :class="getStatusBadgeClass(selectedLoan.status)">
                  {{ getStatusText(selectedLoan.status) }}
                </span>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຊື່ລູກຄ້າ</label>
                <p class="font-medium">{{ getCustomerFullName(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ເບີໂທ</label>
                <p class="font-medium">{{ getCustomerPhone(selectedLoan) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຈຳນວນເງິນ</label>
                <p class="font-bold text-emerald-600">{{ formatPrice(Number(selectedLoan.total_amount || 0) -
                  Number(selectedLoan.down_payment || 0)) }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ດອກເບ້ຍ</label>
                <p class="font-medium">{{ selectedLoan.interest_rate_at_apply || '-' }}%</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ໄລຍະເວລາ</label>
                <p class="font-medium">{{ selectedLoan.loan_period || '-' }} ເດືອນ</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">ຜູ້ອະນຸມັດ</label>
                <p class="font-medium">{{ selectedLoan.approver?.username || '-' }}</p>
              </div>
            </div>

            <!-- Customer Address -->
            <div v-if="selectedLoan.customer?.address" class="border-t pt-4">
              <label class="text-xs text-gray-500 block mb-1">ທີ່ຢູ່</label>
              <p class="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">{{ selectedLoan.customer.address }}
              </p>
            </div>

            <!-- Remarks/Notes -->
            <div v-if="selectedLoan.remarks" class="border-t pt-4">
              <label class="text-xs text-gray-500 block mb-1">ໝາຍເຫດ</label>
              <p class="text-sm bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 text-amber-800">
                {{ selectedLoan.remarks }}</p>
            </div>

            <!-- Documents -->
            <div v-if="currentDocuments.length > 0" class="border-t pt-4">
              <label class="text-xs text-gray-500 mb-2 block">ເອກະສານແນບ</label>
              <div class="flex flex-wrap gap-2">
                <div v-for="doc in currentDocuments" :key="doc.id" class="badge badge-outline gap-1 p-3">
                  <span class="icon-[tabler--file-text] size-4"></span>
                  {{ doc.document_type || 'ເອກະສານ' }}
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 text-xs text-gray-400 text-right">
              <div>
                <label class="mr-1">ສ້າງເມື່ອ:</label>
                <span>{{ formatDate(selectedLoan.createdAt) }}</span>
              </div>
              <div>
                <label class="mr-1">ອັບເດດຫຼ້າສຸດ:</label>
                <span>{{ formatDate(selectedLoan.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6 border-t pt-4">
            <button class="btn btn-neutral w-full sm:w-auto" @click="closeDetailsModal">
              ປິດໜ້າຈໍ
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
import * as XLSX from 'xlsx'
import { storeToRefs } from 'pinia'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { LoanApplicationStatus, type LoanApplication, type LoanApplicationFilters } from '@/types/loanApplication'

// 📦 ใช้ Pinia Store
const loanStore = useLoanApplicationStore()
const {
  loanApplications,
  isLoading,
  currentDocuments,
  customer
} = storeToRefs(loanStore)

// 🟢 Pagination States (Local)
const currentPage = ref(1)
const pageSize = ref(25)

// 🔍 Reactive state สำหรับ UI
const searchQuery = ref('')
const statusFilter = ref<LoanApplicationStatus | string>('')
const dateFrom = ref('')
const dateTo = ref('')

// 💰 Amount filter
const amountMin = ref<number | undefined>(undefined)
const amountMax = ref<number | undefined>(undefined)

// 🪟 Modal states
const showDetailsModal = ref(false)
const selectedLoan = ref<LoanApplication | null>(null)

// 📄 Pagination Search
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// ⏱️ Debounce search
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    resetPage()
  }, 300)
}

const resetPage = () => {
  currentPage.value = 1
}

// 📅 Apply date filter
const applyDateFilter = () => {
  resetPage()
}

// 🔄 1. Fetch Loans ครั้งแรก (ดึงแบบ Limit เยอะๆ ไว้ทำ Local Pagination)
const fetchLoans = async () => {
  try {
    const filters: LoanApplicationFilters = {
      is_confirmed: 1,
      status: statusFilter.value ? (statusFilter.value as any) : undefined,
      min: amountMin.value,
      max: amountMax.value,
      CustomerId: customer.value?.id || undefined,
      limit: 100, // 🟢 ดึงมาก้อนใหญ่ก่อน (1000 รายการ) เพื่อลดภาระ Backend
      cursor: undefined // รีเซ็ตการดึงข้อมูลกลับไปอันล่าสุด
    }

    await loanStore.fetchLoanApplications(filters)
  } catch (error) {
    console.error('Failed to fetch loans:', error)
  }
}

// 🔄 2. โหลดข้อมูลเพิ่ม (Load More / Append จาก Server)
const loadMore = async () => {
  await loanStore.loadMoreLoanApplications();
}

// 📊 Filtered loans (ใช้ข้อมูลจาก Store มา Filter ฝั่ง Client)
const filteredLoans = computed(() => {
  let filtered = loanApplications.value

  // 🔍 Search filter
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

  // 📅 Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = loan.createdAt ? new Date(loan.createdAt).toISOString().split('T')[0] : undefined;
      if (!loanDate) return false;
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';
      return loanDate >= fromDate && loanDate <= toDate;
    })
  }

  return filtered
})

// 🟢 Local Pagination Computed
const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

const totalFiltered = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value) || 1)
const startIndex = computed(() => totalFiltered.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalFiltered.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }

// 🏷️ Status Badge Class
const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'bg-slate-400',
    'verifying': 'bg-amber-500',
    'verified': 'bg-blue-500',
    'approved': 'bg-emerald-500',
    'disbursed': 'bg-indigo-600',
    'rejected': 'bg-rose-500',
    'cancelled': 'bg-gray-600',
    'completed': 'bg-gray-800',
    'draft': 'bg-gray-300 text-gray-800'
  }
  return map[status] || 'bg-gray-400'
}

// 📝 Status Text (Lao)
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'ຄຳຂໍໃໝ່',
    'verifying': 'ກຳລັງກວດສອບ',
    'verified': 'ລໍຖ້າອະນຸມັດ',
    'approved': 'ອະນຸມັດແລ້ວ',
    'disbursed': 'ປ່ອຍສິນເຊື່ອແລ້ວ',
    'rejected': 'ປະຕິເສດ',
    'cancelled': 'ຍົກເລີກ',
    'completed': 'ປິດບັນຊີ (ສຳເລັດ)',
    'draft': 'ຮ່າງ'
  }
  return map[status] || status
}

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
    return `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() || 'ບໍ່ຮູ້ຊື່'
  }
  return 'ບໍ່ຮູ້ຊື່'
}

// 📞 Get Customer Phone
const getCustomerPhone = (loan: LoanApplication): string => {
  return loan.customer?.phone || '-'
}

// 📋 View Details (Read Only)
const viewLoanDetails = async (loan: LoanApplication) => {
  try {
    selectedLoan.value = loan
    await loanStore.fetchLoanApplicationById(loan.id)
    if (loanStore.currentLoanApplication) {
      selectedLoan.value = loanStore.currentLoanApplication
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

// 📥 Export CSV
const exportToCSV = () => {
  if (!filteredLoans.value.length) return

  const csvData = filteredLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
    'ຊື່ລູກຄ້າ': getCustomerFullName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ': formatPrice(Number(loan.total_amount) - Number(loan.down_payment)),
    'ດອກເບ້ຍ (%)': loan.interest_rate_at_apply || '-',
    'ໄລຍະເວລາ (ເດືອນ)': loan.loan_period || '-',
    'ສະຖານະ': getStatusText(loan.status),
    'ຜູ້ອະນຸມັດ': loan.approver?.username || '-',
    'ວັນທີ່ສ້າງ': formatDate(loan.createdAt)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `all_loans_history_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const exportToExcel = () => {
  if (!filteredLoans.value.length) return

  const worksheetData = filteredLoans.value.map(loan => ({
    'ເລກທີ່ສິນເຊື່ອ': loan.loan_id || '-',
    'ຊື່ລູກຄ້າ': getCustomerFullName(loan),
    'ເບີໂທ': getCustomerPhone(loan),
    'ຈຳນວນເງິນ (ກີບ)': Number(loan.total_amount || 0) - Number(loan.down_payment || 0), // 🟢 ເປັນ Number
    'ດອກເບ້ຍ (%)': Number(loan.interest_rate_at_apply || 0), // 🟢 ເປັນ Number
    'ໄລຍະເວລາ (ເດືອນ)': Number(loan.loan_period || 0), // 🟢 ເປັນ Number
    'ສະຖານະ': getStatusText(loan.status),
    'ຜູ້ອະນຸມາ': loan.approver?.username || '-',
    'createdAt': formatDate(loan.createdAt)
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans')
  XLSX.writeFile(workbook, `all_loans_history_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// 🔄 Watchers
watch(statusFilter, () => {
  resetPage()
  fetchLoans() // 🌟 ເມື່ອປ່ຽນສະຖານະ ໃຫ້ຍິງ API ໃໝ່ (ເພາະອາດຢາກດຶງກ້ອນໃໝ່ 1000 ໃບສຳລັບສະຖານະນັ້ນ)
})

watch(pageSize, () => {
  resetPage()
})

// 🚀 Load on mount
onMounted(() => {
  fetchLoans()
})
</script>

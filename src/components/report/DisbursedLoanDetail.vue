<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍງານສິນເຊື່ອທີ່ປ່ອຍແລ້ວ (Disbursed Loans)</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ລາຍງານລາຍລະອຽດສິນເຊື່ອທີ່ປ່ອຍແລ້ວ
          <span class="ml-1 text-primary font-medium">
            (ພົບທັງໝົດ {{ totalFiltered }} ລາຍການ)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchReport" class="btn btn-outline btn-sm" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToExcel" class="btn btn-success btn-sm whitespace-nowrap text-white"
          :disabled="isLoading || displayedLoans.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <!-- Date Filter -->
      <div>
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຊ່ວງວັນທີອະນຸມັດ /
            ປ່ອຍສິນເຊື່ອ</span>
        </label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full" @change="applyFilters" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" @change="applyFilters" />
        </div>
      </div>

      <!-- General Search Input -->
      <div class="lg:col-span-2">
        <label class="label pb-1">
          <span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ (ຊື່ລູກຄ້າ, ເລກທີ່ສັນຍາ,
            ເບີໂທ...)</span>
        </label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ພິມຄຳຄົ້ນຫາ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-sm">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...</p>
    </div>

    <!-- Table -->
    <div v-else
      class="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs">
          <tr>
            <th>ລຳດັບ</th>
            <th>ເລກທີ່ສັນຍາ</th>
            <th>ຊື່ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ປະເພດສິນຄ້າ</th>
            <th>ວົງເງິນອະນຸມັດ</th>
            <th>ດອກເບ້ຍ</th>
            <th>ໄລຍະເວລາ</th>
            <th>ຜູ້ອະນຸມັດ</th>
            <th>ວັນທີອະນຸມັດ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(loan, index) in displayedLoans" :key="loan.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="text-sm">{{ startIndex + index }}</td>
            <td class="font-mono text-gray-600 dark:text-gray-400 text-sm">{{ getContractNumber(loan) }}</td>
            <td>
              <div class="font-bold text-indigo-600 dark:text-indigo-400">{{ getCustomerFullName(loan) }}</div>
            </td>
            <td class="text-sm">{{ loan.customer?.phone || '-' }}</td>
            <td class="text-sm">{{ getProductTypeName(loan.product?.productType_id) }}</td>
            <td>
              <div class="font-bold text-emerald-600">{{ formatPrice(Number(loan.total_amount || 0) -
                Number(loan.down_payment || 0)) }}</div>
            </td>
            <td class="text-sm">{{ loan.interest_rate_at_apply || 0 }}%</td>
            <td class="text-sm">{{ loan.loan_period || 0 }} ເດືອນ</td>
            <td class="text-sm">{{ loan.approver?.full_name || loan.approver?.username || '-' }}</td>
            <td class="text-sm text-gray-600">{{ formatDisplayDate(loan.approved_at || loan.createdAt) }}</td>
          </tr>
          <tr v-if="displayedLoans.length === 0">
            <td colspan="10" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--database-off] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalFiltered }} ລາຍການ</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/report'
import {
  formatPrice,
  formatYMD,
  formatDateOnly,
  getCustomerFullName,
  getFirstInstallment,
  getLastInstallment,
  calculateAge,
  formatDisplayDate
} from '@/utils/formatters'
import type { DisbursedLoanReportRow } from '@/types/report'

const reportStore = useReportStore()
const { disbursedLoans, isLoading } = storeToRefs(reportStore)

const currentPage = ref(1)
const pageSize = ref(25)

const now = new Date()
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const dateFrom = ref(formatYMD(firstDayOfMonth))
const dateTo = ref(formatYMD(lastDayOfMonth))
const searchQuery = ref('')
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value.toLowerCase()
    resetPage()
  }, 300)
}

const applyFilters = () => {
  resetPage()
  fetchReport()
}

const resetPage = () => { currentPage.value = 1 }

const fetchReport = async () => {
  try {
    await reportStore.fetchDisbursedLoans({
      startDate: dateFrom.value,
      endDate: dateTo.value
    })
  } catch (error) {
    console.error('Failed to fetch report:', error)
  }
}

const getProductTypeName = (typeId?: number | string | null): string => {
  if (!typeId) return 'ທົ່ວໄປ'
  switch (Number(typeId)) {
    case 8: return 'ສິນຄ້າຄຳ'
    case 13: return 'ສິນຄ້າລົດຈັກ'
    case 15: return 'ລົດຖີບ'
    case 16: return 'ສິນຄ້າທົ່ວໄປ'
    default: return 'ສິນຄ້າທົ່ວໄປ'
  }
}

const getContractNumber = (loan: DisbursedLoanReportRow) => {
  // 🟢 ໃຊ້ Optional Chaining ເພື່ອປ້ອງກັນ Object is possibly 'undefined'
  return loan.loan_contracts?.[0]?.loan_contract_number || loan.loan_id || '-'
}

const getCustomerGender = (loan: DisbursedLoanReportRow) => {
  // 🟢 ໃຊ້ Optional Chaining ເຊັ່ນດຽວກັນ
  return loan.loan_contracts?.[0]?.cus_sex || loan.customer?.gender || '-'
}

const filteredLoans = computed(() => {
  if (!debouncedSearch.value) return disbursedLoans.value
  const q = debouncedSearch.value
  return disbursedLoans.value.filter(loan => {
    const contractNo = getContractNumber(loan)
    const searchStr = `${contractNo} ${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''} ${loan.customer?.phone || ''}`.toLowerCase()
    return searchStr.includes(q)
  })
})

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLoans.value.slice(start, start + pageSize.value)
})

const totalFiltered = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value) || 1)
const startIndex = computed(() => totalFiltered.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalFiltered.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }

// 🟢 Export Excel
const exportToExcel = () => {
  if (!filteredLoans.value.length) return

  const worksheetData = filteredLoans.value.map((loan, index) => {
    const workInfo = loan.customer?.customer_work_infos?.[0] || null
    const productPrice = Number(loan.total_amount || 0)
    const downPayment = Number(loan.down_payment || 0)
    const approvedAmount = productPrice - downPayment

    return {
      'ລຳດັບ': index + 1,
      'ຊື່ ແລະ ນາມສະກຸນລູກຄ້າ': getCustomerFullName(loan),
      'ເລກທີ່ສັນຍາ': getContractNumber(loan),
      'ເບີໂທ': loan.customer?.phone || '-',
      'ເພດ': getCustomerGender(loan) === 'Male' ? 'ຊາຍ' : (getCustomerGender(loan) === 'Female' ? 'ຍິງ' : getCustomerGender(loan)),
      'ອາຍຸ': calculateAge(loan.customer?.date_of_birth),
      'ເງິນເດືອນ': Number(workInfo?.salary || 0),
      'ປີການເຮັດວຽກ': Number(workInfo?.duration_years || 0),
      'ວັນທີອະນຸມັດ': formatDisplayDate(loan.approved_at || loan.createdAt), // 👈 แก้ตรงนี้
      'ລາຄາສິນຄ້າ': productPrice,
      'ລາຄ່າວາງດາວ': downPayment,
      'ວົງເງິນອະນຸມັດ': approvedAmount,
      'ອັດຕາດອກເບ້ຍ': Number(loan.interest_rate_at_apply || 0),
      'ໄລຍະເວລາຜ່ອນ': Number(loan.loan_period || 0),
      'ຄ່າທຳນຽມ(CIB)': Number(loan.fee || 0),
      'ປະເພດສິນຄ້າ': getProductTypeName(loan.product?.productType_id),
      'ວັນທີ່ ເດືອນປີ ເລີ່ມຈ່າຍຄ່າງວດ': formatDisplayDate(getFirstInstallment(loan)), // 👈 แก้ตรงนี้
      'ວັນທີ່ ເດືອນປີ ສິນສຸດສັນຍາຈ່າຍຄ່າງວດ': formatDisplayDate(getLastInstallment(loan)), // 👈 แก้ตรงนี้
      'ຊື່ພະນັກງານຂາຍ': loan.requester?.full_name || loan.requester?.username || '-',
      'ພະນັກງານປະເມີນ': loan.assessor?.full_name || loan.assessor?.username || 'ຕິ່ງລີ້ ຫຼວງກຳນັນ',
      'ຜູ້ອະນຸມັດ': loan.approver?.full_name || loan.approver?.username || '-'
    }
  })

  // 🟢 ແກ້ໄຂ Error ທີ 5: ເພີ່ມ || {} ເພື່ອປ້ອງກັນ TypeScript ມອງວ່າ array[0] ອາດຈະເປັນ undefined
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const wscols = Object.keys(worksheetData[0] || {}).map(() => ({ wch: 20 }))
  worksheet['!cols'] = wscols

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Disbursed Loans')
  XLSX.writeFile(workbook, `Report_Disbursed_Loans_${formatYMD(now)}.xlsx`)
}

onMounted(() => {
  fetchReport()
})
</script>

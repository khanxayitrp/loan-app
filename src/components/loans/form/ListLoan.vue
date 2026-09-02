<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອ</p>
      </div>
      <div class="flex items-center gap-2">
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

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div>
        <label class="label pb-1"><span
            class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ</span></label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ລະຫັດສິນເຊື່ອ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
      <div>
        <label class="label pb-1"><span
            class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ສະຖານະ</span></label>
        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="">ທັງໝົດສະຖານະ</option>
          <option value="pending">ລໍຖ້າ</option>
          <option value="verifying">ກຳລັງກວດ</option>
          <option value="approved">ອະນຸມັດ</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="disbursed">ຈ່າຍເງິນແລ້ວ</option>
          <option value="closed">ປິດສິນເຊື່ອ</option>
        </select>
      </div>
      <div>
        <label class="label pb-1"><span
            class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ວັນທີ່ສ້າງ</span></label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full"
            @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner text-primary"></div>
    </div>
    <div v-else
      class="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            <th>ລູກຄ້າ</th>
            <th>ສິນຄ້າ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ເຈົ້າໜ້າທີ່</th>
            <th>ສະຖານະ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <th class="w-32 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td>
              <div class="font-bold text-indigo-600 dark:text-indigo-400">{{ getCustomerName(loan) }}</div>
              <div class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <span class="icon-[tabler--phone] size-3"></span> {{ getCustomerPhone(loan) }}
              </div>
            </td>
            <td>
              <div class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]"
                :title="getProductName(loan)">{{ getProductName(loan) }}</div>
              <div class="text-xs text-gray-500 mt-0.5">ID: {{ loan.product_id }}</div>
            </td>
            <td>
              <div class="font-bold text-emerald-600">{{ formatPrice(Number(loan.total_amount || 0) -
                Number(loan.down_payment || 0)) }} ₭</div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center">
                    <span class="text-xs">{{ getRequesterName(loan).charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ getRequesterName(loan) }}</span>
              </div>
            </td>
            <td>
              <span class="badge badge-sm" :class="getStatusBadgeClass(loan.status)">{{ getStatusText(loan.status)
              }}</span>
            </td>
            <td class="text-sm text-gray-600 dark:text-gray-400">
              {{ (loan.created_at || loan.createdAt) ? formatDate((loan.created_at || loan.createdAt) || '') : '-' }}
            </td>
            <td>
              <div class="flex justify-center gap-1">
                <button
                  v-if="permissionStore.hasPermission('loan_view_all') || permissionStore.hasPermission('loan_view_assigned')"
                  class="btn btn-square btn-ghost btn-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600"
                  @click="openDetails(loan.id, false)" title="ລາຍລະອຽດ">
                  <span class="icon-[tabler--eye] size-5"></span>
                </button>

                <button
                  v-if="permissionStore.hasPermission('loan_view_all') || permissionStore.hasPermission('loan_view_assigned')"
                  class="btn btn-square btn-ghost btn-sm text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  @click="openSchedule(loan)" title="ຕາຕະລາງຜ່ອນຊຳລະ">
                  <span class="icon-[tabler--calendar-stats] size-5"></span>
                </button>

                <button
                  v-if="loan.status !== 'closed' && loan.status !== 'disbursed' && (permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_create'))"
                  class="btn btn-square btn-ghost btn-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  @click="openDetails(loan.id, true)" title="ແກ້ໄຂ">
                  <span class="icon-[tabler--edit] size-5"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedLoans.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400">
              <div class="flex flex-col items-center">
                <span class="icon-[tabler--file-search] size-12 mb-2 opacity-50"></span>
                <span>ບໍ່ມີຂໍ້ມູນຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalLoans }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2"> ໜ້າ {{ currentPage }} / {{ totalPages }} </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <LoanDetailsModal :show="showDetailsModal" :loan-id="selectedLoanId" :open-in-edit="isEditMode"
      @close="showDetailsModal = false" @refresh="fetchData" />

    <LoanScheduleModal :show="showScheduleModal" :loan="selectedScheduleLoan" @close="showScheduleModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address'
import { useLoanContractStore } from '@/stores/loanContract'
import { usePermissionStore } from '@/stores/permission'
import { LoanApplicationStatus } from '@/types/loanApplication'
import { alert } from '@/utils/alert'
import { formatPrice, getStatusBadgeClass, getStatusText } from '@/utils/formatters'

import LoanDetailsModal from '@/components/modals/loan/detail/LoanDetailsModal.vue'
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue'

const loanApplicationStore = useLoanApplicationStore()
const loanContractStore = useLoanContractStore()
const productStore = useProductStore()
const shopStore = useShopStore()
const addressStore = useAddressStore()
const permissionStore = usePermissionStore()

const isLoading = computed(() => loanApplicationStore.isLoading)

const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

const showDetailsModal = ref(false)
const selectedLoanId = ref<number | null>(null)
const isEditMode = ref(false)

const openDetails = (id: number, edit: boolean) => {
  selectedLoanId.value = id
  isEditMode.value = edit
  showDetailsModal.value = true
}

const showScheduleModal = ref(false)
const selectedScheduleLoan = ref<any | null>(null)

const openSchedule = async (loan: any) => {
  try {
    let contractData = null;
    try {
      const contractRes = await loanContractStore.fetchContract(loan.id);
      contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;

      if (!contractData || Object.keys(contractData).length === 0 || (!contractData.id && !contractData.loan_id)) {
        throw new Error("Contract is empty");
      }
    } catch (e) {
      alert.error('ບໍ່ສາມາດເປີດຕາຕະລາງໄດ້', 'ກະລຸນາສ້າງ "ສັນຍາກູ້ຢືມ" ໃຫ້ລູກຄ້າຮັບຮູ້ເງື່ອນໄຂກ່ອນ!');
      return;
    }

    const fullLoan = await loanApplicationStore.fetchLoanApplicationById(loan.id);
    const appPrincipal = Number(fullLoan.total_amount || 0) - Number(fullLoan.down_payment || 0);
    const appMonthlyPay = Number(fullLoan.monthly_pay || 0);
    const appTerm = Number(fullLoan.loan_period || 0);

    const contractPrincipal = Number(contractData.totalAmount || contractData.total_amount || 0);
    const contractMonthlyPay = Number(contractData.monthlyPay || contractData.monthly_pay || 0);
    const contractTerm = Number(contractData.loanPeriod || contractData.loan_period || 0);

    const isConflict = Math.abs(appPrincipal - contractPrincipal) > 10 || Math.abs(appMonthlyPay - contractMonthlyPay) > 10 || appTerm !== contractTerm;

    if (isConflict) {
      alert.error('ຂໍ້ມູນສັນຍາບໍ່ອັບເດດ! ⚠️', 'ຂໍ້ມູນສິນເຊື່ອມີການປ່ຽນແປງຫຼັງຈາກສ້າງສັນຍາໄປແລ້ວ.\n\n👉 ກະລຸນາກົດເຂົ້າ "ລາຍລະອຽດສິນເຊື່ອ" > ແຖບ "ສັນຍາກູ້ຢືມ" > ກົດແກ້ໄຂ ແລະ ກົດ "ອັບເດດຂໍ້ມູນຕາມໃບຄຳຂໍ" ກ່ອນ.');
      return;
    }

    selectedScheduleLoan.value = fullLoan;
    showScheduleModal.value = true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້';
    alert.error('ເກີດຂໍ້ຜິດພາດ', errorMsg);
  }
}

const isConfirmed = (v: any) => v === true || v === 1 || v === 'true' || v === '1'
const getCustomerName = (loan: any) => loan.customer?.full_name || `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || '-'
const getCustomerPhone = (loan: any) => loan.customer?.phone || '-'
const getProductName = (loan: any) => loan.product?.product_name || '-'
const getProductType = (loan: any) => productStore.productTypeMap[loan.product?.productType_id || loan.productType_id] || '-'
const getRequesterName = (loan: any) => loan.requester?.full_name || loan.requester?.name || '-'
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('lo-LA') : '-'

const filteredLoans = computed(() => {
  let list = loanApplicationStore.loanApplications.filter(app => isConfirmed(app.is_confirmed))

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(d =>
      d.customer?.first_name?.toLowerCase().includes(q) ||
      d.customer?.phone?.includes(q) ||
      d.loan_id?.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value) {
    list = list.filter(d => d.status === statusFilter.value)
  }

  if (dateFrom.value || dateTo.value) {
    list = list.filter((loan: any) => {
      const dateString = loan.created_at || loan.createdAt;
      if (!dateString) return false;

      const date = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';

      return date >= fromDate && date <= toDate;
    });
  }

  return list;
})

watch([searchQuery, statusFilter, dateFrom, dateTo, pageSize], () => {
  currentPage.value = 1
})

const displayedLoans = computed(() => filteredLoans.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }

let debounceTimer: any = null
const debounceSearch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => currentPage.value = 1, 300) }
const applyDateFilter = () => currentPage.value = 1

const fetchData = async () => {
  try {
    await loanApplicationStore.fetchLoanApplications({
      status: [
        LoanApplicationStatus.PENDING,
        LoanApplicationStatus.VERIFYING,
        LoanApplicationStatus.VERIFIED,
        LoanApplicationStatus.APPROVED,
        // LoanApplicationStatus.REJECTED,
        LoanApplicationStatus.DISBURSED,
        // LoanApplicationStatus.CLOSED
      ] as any,
      is_confirmed: 1,
      limit: 250
    })
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍການສິນເຊື່ອໄດ້';
    alert.error('ໂຫຼດຂໍ້ມູນລົ້ມເຫຼວ', errorMsg);
  }
}

const exportToCSV = () => {
  const csvData = filteredLoans.value.map(d => ({
    'Loan ID': d.loan_id,
    'ລູກຄ້າ': getCustomerName(d),
    'ເບີໂທ': getCustomerPhone(d),
    'ສິນຄ້າ': getProductName(d),
    'ປະເພດ': getProductType(d),
    'ຈຳນວນເງິນ': formatPrice(Number(d.total_amount || 0) - Number(d.down_payment || 0)),
    'ດອກເບ້ຍ (%)': d.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': d.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(d),
    'ສະຖານະ': getStatusText(d.status),
    'ວັນທີ່ສ້າງ': (d.created_at || d.createdAt) ? formatDate((d.created_at || d.createdAt) as string) : '-'
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Loans_Export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const exportToExcel = () => {
  const excelData = filteredLoans.value.map(d => ({
    'Loan ID': d.loan_id,
    'ລູກຄ້າ': getCustomerName(d),
    'ເບີໂທ': getCustomerPhone(d),
    'ສິນຄ້າ': getProductName(d),
    'ປະເພດ': getProductType(d),
    'ຈຳນວນເງິນ (ຍອດຈັດ)': Number(d.total_amount || 0) - Number(d.down_payment || 0),
    'ດອກເບ້ຍ (%)': d.interest_rate_at_apply,
    'ໄລຍະເວລາ (ເດືອນ)': d.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(d),
    'ສະຖານະ': getStatusText(d.status),
    'ວັນທີ່ສ້າງ': (d.created_at || d.createdAt) ? formatDate((d.created_at || d.createdAt) as string) : '-'
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  worksheet['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
    { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 },
    { wch: 20 }, { wch: 15 }, { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loan List")
  XLSX.writeFile(workbook, `Loan_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  await Promise.all([
    fetchData(),
    productStore.fetchProductTypes(),
    shopStore.fetchAllShop(),
    addressStore.fetchProvinces()
  ])
})
</script>

<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອ</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
          <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
        </button>
        <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label"><span class="label-text text-sm font-medium">ຄົ້ນຫາ</span></label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..." class="input input-bordered w-full" @input="debounceSearch" />
      </div>
      <div>
        <label class="label"><span class="label-text text-sm font-medium">ສະຖານະ</span></label>
        <select v-model="statusFilter" class="select select-bordered w-full">
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
        <label class="label"><span class="label-text text-sm font-medium">ວັນທີ່ສ້າງ</span></label>
        <div class="flex gap-2">
          <input v-model="dateFrom" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
          <input v-model="dateTo" type="date" class="input input-bordered w-full" @change="applyDateFilter" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8"><div class="loading loading-spinner"></div></div>
    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>ລູກຄ້າ</th><th>ສິນຄ້າ</th><th>ຈຳນວນເງິນ</th><th>ເຈົ້າໜ້າທີ່</th><th>ສະຖານະ</th><th>ວັນທີ່ສ້າງ</th><th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <td class="font-medium">
              <div>{{ getCustomerName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getCustomerPhone(loan) }}</div>
            </td>
            <td>
              <div>{{ getProductName(loan) }}</div>
              <div class="text-sm text-gray-500">{{ getProductType(loan) }}</div>
            </td>
            <td class="font-medium">{{ formatPrice(loan.total_amount) }}</td>
            <td>{{ getRequesterName(loan) }}</td>
            <td><span class="badge badge-soft" :class="getStatusBadgeClass(loan.status)">{{ getStatusText(loan.status) }}</span></td>
            <td>{{ (loan.created_at || loan.createdAt) ? formatDate((loan.created_at || loan.createdAt) || '') : '-' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="openDetails(loan.id, false)" title="ລາຍລະອຽດ">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-info" @click="openSchedule(loan)" title="ຕາຕະລາງຜ່ອນຊຳລະ">
                  <span class="icon-[tabler--calendar-stats] size-4"></span>
                </button>

                <button v-if="loan.status !== 'closed' && loan.status !== 'disbursed'"
                  class="btn btn-circle btn-text btn-sm" @click="openDetails(loan.id, true)" title="ແກ້ໄຂ">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
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
          <option :value="10">10 ຕໍ່ໜ້າ</option><option :value="25">25 ຕໍ່ໜ້າ</option><option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2"> ໜ້າ {{ currentPage }} / {{ totalPages }} </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <LoanDetailsModal 
      :show="showDetailsModal" 
      :loan-id="selectedLoanId" 
      :open-in-edit="isEditMode"
      @close="showDetailsModal = false" 
      @refresh="fetchData" 
    />

    <LoanScheduleModal 
      :show="showScheduleModal" 
      :loan="selectedScheduleLoan" 
      @close="showScheduleModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx' // 🟢 ເພີ່ມແຖວນີ້
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address'
import { useLoanContractStore } from '@/stores/loanContract' // 🟢 ເພີ່ມແຖວນີ້
import { LoanApplicationStatus } from '@/types/loanApplication'
import Papa from 'papaparse'
import { alert } from '@/utils/alert'
import { formatPrice, getStatusBadgeClass, getStatusText } from '@/utils/formatters'

// 🟢 Import Modal
import LoanDetailsModal from '@/components/modals/loan/detail/LoanDetailsModal.vue'
// 🟢 Import Schedule Modal ເພີ່ມ
import LoanScheduleModal from '@/components/modals/loan/detail/LoanScheduleModal.vue'

const loanApplicationStore = useLoanApplicationStore()
const loanContractStore = useLoanContractStore() // 🟢 ເພີ່ມແຖວນີ້
const productStore = useProductStore()
const shopStore = useShopStore()
const addressStore = useAddressStore()

const isLoading = computed(() => loanApplicationStore.isLoading)

const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

// --- State ສຳລັບ Modal ລາຍລະອຽດ ---
const showDetailsModal = ref(false)
const selectedLoanId = ref<number | null>(null)
const isEditMode = ref(false)

const openDetails = (id: number, edit: boolean) => {
  selectedLoanId.value = id
  isEditMode.value = edit
  showDetailsModal.value = true
}

// --- State ສຳລັບ Modal ຕາຕະລາງຜ່ອນ ---
const showScheduleModal = ref(false)
const selectedScheduleLoan = ref<any | null>(null)

const openSchedule = async (loan: any) => {
  try {
    let contractData = null;
    try {
      const contractRes = await loanContractStore.fetchContract(loan.id);
      contractData = (contractRes as any)?.data?.data || (contractRes as any)?.data || contractRes;
      
      // 🟢 ປັບປຸງເງື່ອນໄຂ: ຖ້າ Object ວ່າງເປົ່າ ຫຼື ບໍ່ມີ ID ສະແດງວ່າບໍ່ມີສັນຍາແທ້ໆ
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

    // 🟢 ຮອງຮັບທັງ CamelCase (totalAmount) ແລະ SnakeCase (total_amount)
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
  } catch (error) {
    alert.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕາຕະລາງໄດ້');
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
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d => d.customer?.first_name?.toLowerCase().includes(q) || d.customer?.phone?.includes(q) || d.loan_id?.toLowerCase().includes(q))
  }
  
  if (statusFilter.value) list = list.filter(d => d.status === statusFilter.value)
  
  if (dateFrom.value || dateTo.value) {
    // 🟢 ແກ້ໄຂຈຸດນີ້: ປ່ຽນຈາກ filtered = filtered.filter(...) ມາເປັນ list = list.filter(...)
    // 🟢 ແລະ ເພີ່ມ (loan: any) ເພື່ອປ້ອງກັນ TypeScript Error
    list = list.filter((loan: any) => {
      // 1. ດຶງຄ່າວັນທີ (ຮອງຮັບທັງສອງຊື່ Field ທີ່ Backend ອາດຈະສົ່ງມາ)
      const dateString = loan.created_at || loan.createdAt;
      
      // 2. ຖ້າບໍ່ມີວັນທີສ້າງ ໃຫ້ຂ້າມການສະແດງຜົນລາຍການນີ້ (ຫຼື return true ຖ້າຢາກໃຫ້ສະແດງ)
      if (!dateString) return false;

      // 3. ບັງຄັບໃຫ້ date ເປັນ String ທີ່ປອດໄພ
      const date = dateString.includes('T') ? dateString.split('T')[0] : dateString;

      // 4. ປຽບທຽບ
      const fromDate = dateFrom.value || '1970-01-01';
      const toDate = dateTo.value || '9999-12-31';

      return date >= fromDate && date <= toDate;
    });
  }
  return list; // 🟢 ສົ່ງ list ກັບຄືນ
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
watch(pageSize, () => currentPage.value = 1)

let debounceTimer: any = null
const debounceSearch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => currentPage.value = 1, 300) }
const applyDateFilter = () => currentPage.value = 1

const fetchData = async () => {
  await loanApplicationStore.fetchLoanApplications({ status: [LoanApplicationStatus.PENDING, LoanApplicationStatus.VERIFYING, LoanApplicationStatus.VERIFIED] as any, is_confirmed: 1, limit: 1000 })
}

const viewLoanDetails = (id: number) => {
  selectedLoanId.value = id
  showDetailsModal.value = true
}

const exportToCSV = () => {
  const csvData = displayedLoans.value.map(d => ({
    'Loan ID': d.loan_id, 'ລູກຄ້າ': getCustomerName(d), 'ເບີໂທ': getCustomerPhone(d),
    'ສິນຄ້າ': getProductName(d), 'ປະເພດ': getProductType(d), 'ຈຳນວນເງິນ': formatPrice(d.total_amount), 
    'ດອກເບ້ຍ (%)': d.interest_rate_at_apply, 'ໄລຍະເວລາ': d.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(d), 'ສະຖານະ': getStatusText(d.status), 'ວັນທີ່ສ້າງ': d.createdAt ? formatDate(d.createdAt) : '-'
  }))
  const csv = Papa.unparse(csvData)
  // 🟢 เติม \uFEFF (UTF-8 BOM) นำหน้า csv data
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loans_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// 🟢 ฟังก์ชัน Export To Excel (แทนที่ exportToCSV)
const exportToExcel = () => {
  // 1. เตรียมข้อมูล
  const excelData = displayedLoans.value.map(d => ({
    'Loan ID': d.loan_id, 
    'ລູກຄ້າ': getCustomerName(d), 
    'ເບີໂທ': getCustomerPhone(d), // xlsx จัดการ String ได้ดี ไม่ตัดเลข 0
    'ສິນຄ້າ': getProductName(d), 
    'ປະເພດ': getProductType(d), 
    'ຈຳນວນເງິນ': Number(d.total_amount || 0), // ใส่เป็น Number ให้ Excel ค้นหา/คำนวณต่อได้
    'ດອກເບ້ຍ (%)': d.interest_rate_at_apply, 
    'ໄລຍະເວລາ (ເດືອນ)': d.loan_period,
    'ເຈົ້າໜ້າທີ່': getRequesterName(d), 
    'ສະຖານະ': getStatusText(d.status), 
    'ວັນທີ່ສ້າງ': (d.created_at || d.createdAt) ? formatDate((d.created_at || d.createdAt) as string) : '-'
  }))

  // 2. สร้าง Worksheet จาก JSON
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // 3. ปรับความกว้างของคอลัมน์ให้อ่านง่าย (Optional)
  const wscols = [
    { wch: 15 }, // Loan ID
    { wch: 25 }, // ลູກຄ້ๅ
    { wch: 15 }, // เບີໂທ
    { wch: 25 }, // ສິນຄ້ๅ
    { wch: 15 }, // ປະເພດ
    { wch: 15 }, // ຈຳນວນเງິນ
    { wch: 10 }, // ດອກเບ້ຍ
    { wch: 15 }, // ໄລຍະเวລๅ
    { wch: 20 }, // เจ້ົๅໜ້ๅທີ່
    { wch: 15 }, // ສະຖๅນະ
    { wch: 15 }, // วັນທີ່ສ้ๅງ
  ];
  worksheet['!cols'] = wscols;

  // 4. สร้าง Workbook และแนบ Worksheet เข้าไป
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loan List")

  // 5. สั่งดาวน์โหลดไฟล์
  XLSX.writeFile(workbook, `Loan_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  await Promise.all([ fetchData(), productStore.fetchProductTypes(), shopStore.fetchAllShop(), addressStore.fetchProvinces() ])
})
</script>
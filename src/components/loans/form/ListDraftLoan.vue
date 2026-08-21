<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຮ່າງສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ຈັດການຮ່າງຄຳຂໍສິນເຊື່ອທີ່ຍັງບໍ່ໄດ້ສົ່ງ
          <span class="ml-1 text-primary font-medium">
            (ທັງໝົດ {{ totalFiltered }} ລາຍການ)
          </span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="fetchData" class="btn btn-outline btn-sm">
          <span class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap"
          :disabled="isLoading || filteredDrafts.length === 0">
          <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
        </button>
        <button @click="exportToExcel" class="btn btn-outline btn-sm whitespace-nowrap btn-success"
          :disabled="isLoading || filteredDrafts.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ຄົ້ນຫາ
            (ໃນລາຍການທີ່ໂຫຼດມາ)</span></label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ, ລະຫັດສິນເຊື່ອ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
      <div>
        <label class="label pb-1"><span
            class="label-text text-sm font-medium text-gray-700 dark:text-gray-300">ເຈົ້າໜ້າທີ່</span></label>
        <select v-model="staffFilter" class="select select-sm select-bordered w-full" @change="resetPage">
          <option value="">ທັງໝົດເຈົ້າໜ້າທີ່</option>
          <option v-for="staff in staffList" :key="staff.id" :value="staff.id">{{ staff.name }}</option>
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

    <div v-if="isLoading && loanApplicationStore.loanApplications.length === 0" class="flex justify-center py-12">
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
          <!-- 🟢 Use displayedDrafts for Client-Side Pagination -->
          <tr v-for="draft in displayedDrafts" :key="draft.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td>
              <div class="font-bold text-indigo-600 dark:text-indigo-400">{{ getDraftDisplayName(draft) || `Loan
                #${draft.loan_id}` }}</div>
              <div class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <span class="icon-[tabler--phone] size-3"></span> {{ getDraftPhone(draft) }}
              </div>
            </td>
            <td>
              <div class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]"
                :title="getProductName(draft)">{{ getProductName(draft) }}</div>
              <div class="text-xs text-gray-500 mt-0.5">ID: {{ draft.product_id }}</div>
            </td>
            <td>
              <div class="font-bold text-emerald-600">
                {{ formatPrice(Number(draft.total_amount || 0) - Number(draft.down_payment || 0)) }} ₭
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center">
                    <span class="text-xs">{{ getRequesterName(draft).charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ getRequesterName(draft) || `ID:
                  ${draft.requester_id || '-'}` }}</span>
              </div>
            </td>
            <td>
              <span class="badge badge-sm border-0 text-white" :class="getStatusBadgeClass(draft.status)">{{
                getStatusText(draft.status)
              }}</span>
            </td>
            <td class="text-sm text-gray-600 dark:text-gray-400">{{ draft.createdAt ? formatDate(draft.createdAt) : '-'
            }}</td>
            <td>
              <div class="flex justify-center gap-1">
                <button
                  class="btn btn-square btn-ghost btn-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600"
                  @click="viewDraftDetails(draft.id)" title="ເບິ່ງລາຍລະອຽດ">
                  <span class="icon-[tabler--eye] size-5"></span>
                </button>

                <button v-if="isDraft(draft) && permissionStore.hasPermission('loan_create')"
                  class="btn btn-square btn-ghost btn-sm text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  @click="confirmSubmitDraft(draft)" title="ສົ່ງຄຳຂໍ">
                  <span class="icon-[tabler--send] size-5"></span>
                </button>

                <button
                  v-if="isDraft(draft) && (permissionStore.hasPermission('loan_edit') || permissionStore.hasPermission('loan_create'))"
                  class="btn btn-square btn-ghost btn-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  @click="deleteDraft(draft.id)" title="ລຶບຮ່າງ">
                  <span class="icon-[tabler--trash] size-5"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedDrafts.length === 0">
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

    <!-- 🟢 Local Pagination Controls -->
    <div v-if="!isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກທີ່ຄົ້ນຫາພົບ {{ totalFiltered }} ລາຍການ
      </div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered" @change="resetPage">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2 font-medium"> ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <!-- 🟢 Load More Button -->
    <div v-if="!isLoading"
      class="flex flex-col items-center mt-6 mb-4 border-t pt-6 border-dashed dark:border-gray-700">
      <button v-if="loanApplicationStore.canLoadMore" class="btn btn-primary btn-outline w-full max-w-xs"
        @click="loadMore" :disabled="loanApplicationStore.isLoadingMore">
        <span v-if="loanApplicationStore.isLoadingMore" class="loading loading-spinner loading-sm"></span>
        <span v-else class="icon-[tabler--arrow-down-circle] size-5"></span>
        ໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນເພີ່ມເຕີມ
      </button>

      <p v-else class="text-sm text-gray-400 italic">
        (ດຶງຂໍ້ມູນມາຄົບທັງໝົດແລ້ວ)
      </p>
    </div>

    <DraftDetailsModal :show="showDetailsModal" :draft-id="selectedDraftId" @close="showDetailsModal = false"
      @refresh="fetchData" />

    <teleport to="body">
      <div v-if="showSubmitModal && draftToSubmit"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-base-100 rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
          <div class="p-6 text-center">
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="icon-[tabler--send] size-8 text-success"></span>
            </div>
            <h3 class="font-bold text-xl mb-2 text-gray-800 dark:text-white">ຢືນຢັນການສົ່ງຄຳຂໍສິນເຊື່ອ</h3>
            <p class="text-gray-500">
              ທ່ານຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອເລກທີ <span class="font-bold text-primary">{{ draftToSubmit.loan_id }}</span>
              ເຂົ້າສູ່ລະບົບການພິຈາລະນາແທ້ຫຼືບໍ່?
            </p>
          </div>
          <div class="bg-base-200/50 px-6 py-4 flex justify-end gap-3">
            <button class="btn btn-ghost" @click="showSubmitModal = false" :disabled="isVerifying">ຍົກເລີກ</button>
            <button class="btn btn-success text-white px-6" @click="submitDraft" :disabled="isVerifying">
              <span v-if="isVerifying" class="loading loading-spinner loading-sm"></span>
              <span v-else>ຢືນຢັນການສົ່ງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address'
import { usePermissionStore } from '@/stores/permission'
import { LoanApplicationStatus } from '@/types/loanApplication'
import { alert } from '@/utils/alert'
import { formatPrice, getStatusBadgeClass, getStatusText } from '@/utils/formatters'
import DraftDetailsModal from '@/components/modals/loan/draft/DraftDetailsModal.vue'

const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const shopStore = useShopStore()
const addressStore = useAddressStore()
const permissionStore = usePermissionStore()

const isLoading = computed(() => loanApplicationStore.isLoading)
const isVerifying = ref(false)

const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const staffFilter = ref('')

// 🟢 Pagination States
const currentPage = ref(1)
const pageSize = ref(10)

const showDetailsModal = ref(false)
const selectedDraftId = ref<number | null>(null)
const showSubmitModal = ref(false)
const draftToSubmit = ref<any>(null)

const getDraftDisplayName = (draft: any) => draft.customer ? `${draft.customer.first_name || ''} ${draft.customer.last_name || ''}`.trim() : '-'
const getDraftPhone = (draft: any) => draft.customer?.phone || '-'
const getProductName = (draft: any) => draft.product?.product_name || '-'
const getRequesterName = (draft: any) => (draft.requester as any)?.full_name || '-'
const formatDate = (d: string) => new Date(d).toLocaleDateString('lo-LA')
const isDraft = (draft: any) => draft.is_confirmed === 0 || !draft.is_confirmed

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = ref('');

const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value;
    resetPage();
  }, 300);
};

const resetPage = () => {
  currentPage.value = 1;
};

const applyDateFilter = () => {
  resetPage();
};

const staffList = computed(() => {
  const map = new Map();
  (loanApplicationStore.loanApplications || []).forEach(d => {
    if (d.requester_id) map.set(d.requester_id, getRequesterName(d))
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

// 🌟 Local Filtering
const filteredDrafts = computed(() => {
  let list = loanApplicationStore.loanApplications || []

  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase().trim()
    list = list.filter(d =>
      d.customer?.first_name?.toLowerCase().includes(q) ||
      d.customer?.phone?.includes(q) ||
      (d.loan_id || '').toLowerCase().includes(q)
    )
  }

  if (staffFilter.value) {
    list = list.filter(d => d.requester_id === parseInt(staffFilter.value))
  }

  if (dateFrom.value || dateTo.value) {
    list = list.filter(d => {
      const targetDate = d.createdAt || d.updatedAt;
      if (!targetDate) return false
      const dateString = new Date(targetDate).toISOString().split('T')[0]
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return !!dateString && dateString >= fromDate && dateString <= toDate;
    })
  }

  return list
})

// 🌟 Computed properties for Local Pagination
const displayedDrafts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredDrafts.value.slice(start, start + pageSize.value);
});

const totalFiltered = computed(() => filteredDrafts.value.length);
const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value) || 1);
const startIndex = computed(() => totalFiltered.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalFiltered.value));
const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const previousPage = () => { if (hasPreviousPage.value) currentPage.value--; };
const nextPage = () => { if (hasNextPage.value) currentPage.value++; };

// 🌟 Fetch Initial Data from API
const fetchData = async () => {
  await loanApplicationStore.fetchLoanApplications({
    status: LoanApplicationStatus.PENDING,
    is_confirmed: 0,
    limit: 250, // 🟢 ดึงข้อมูลก้อนใหญ่เพื่อใช้กับ Local Filter
    cursor: undefined
  } as any)
}

// 🌟 Load More Data from API
const loadMore = async () => {
  await loanApplicationStore.loadMoreLoanApplications();
}

const viewDraftDetails = (id: number) => {
  selectedDraftId.value = id
  showDetailsModal.value = true
}

const deleteDraft = async (id: number) => {
  if (!await alert.confirm('ລຶບຮ່າງສິນເຊື່ອ', 'ທ່ານຕ້ອງການລຶບຮ່າງສິນເຊື່ອນີ້ຖິ້ມແມ່ນບໍ່? (ບໍ່ສາມາດກູ້ຄືນໄດ້)')) return
  try {
    await loanApplicationStore.updateLoanApplication(id, { status: LoanApplicationStatus.REJECTED, remarks: 'ລຶບຮ່າງ' } as any)
    alert.success('ລຶບຮ່າງສຳເລັດແລ້ວ!')
    await fetchData()
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ບໍ່ສາມາດລຶບຮ່າງໄດ້'
    alert.error('ເກີດຂໍ້ຜິດພາດ', errorMsg)
  }
}

const confirmSubmitDraft = (draft: any) => {
  draftToSubmit.value = draft
  showSubmitModal.value = true
}

const submitDraft = async () => {
  if (!draftToSubmit.value) return
  isVerifying.value = true
  try {
    await loanApplicationStore.ApplyDraft(draftToSubmit.value.id, { is_confirmed: 1, status: LoanApplicationStatus.PENDING } as any)
    alert.success('ສົ່ງຄຳຂໍສຳເລັດ!')
    showSubmitModal.value = false
    await fetchData()
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສົ່ງຄຳຂໍ'
    alert.error('ສົ່ງຄຳຂໍລົ້ມເຫຼວ', errorMsg)
  } finally {
    isVerifying.value = false
  }
}

const exportToCSV = () => {
  const csvData = filteredDrafts.value.map(d => ({
    'Loan ID': d.loan_id || '-',
    'ລູກຄ້າ': getDraftDisplayName(d),
    'ເບີໂທ': getDraftPhone(d),
    'ສິນຄ້າ': getProductName(d),
    'ຈຳນວນເງິນ': formatPrice(Number(d.total_amount || 0) - Number(d.down_payment || 0)),
    'ສະຖານະ': getStatusText(d.status),
    'ວັນທີ່ສ້າງ': d.createdAt ? formatDate(d.createdAt) : '-'
  }))
  const csv = Papa.unparse(csvData)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Draft_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const exportToExcel = () => {
  const excelData = filteredDrafts.value.map(d => {
    const netAmount = Number(d.total_amount || 0) - Number(d.down_payment || 0);
    return {
      'Loan ID': d.loan_id || '-',
      'ລູກຄ້າ': getDraftDisplayName(d),
      'ເບີໂທ': getDraftPhone(d),
      'ສິນຄ້າ': getProductName(d),
      'ຈຳນວນເງິນ (ກີບ)': netAmount, // 🟢 ส่งเป็น Number ให้ Excel
      'ສະຖານະ': getStatusText(d.status),
      'ວັນທີ່ສ້າງ': d.createdAt ? formatDate(d.createdAt) : '-'
    }
  })
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Draft Loans')
  XLSX.writeFile(workbook, `Draft_Loans_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  await Promise.all([
    fetchData(),
    productStore.fetchProductTypes(),
    shopStore.fetchAllShop(),
    addressStore.fetchProvinces()
  ])
})

onUnmounted(() => {
  loanApplicationStore.resetFilters();
});
</script>

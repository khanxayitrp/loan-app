<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຮ່າງສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຮ່າງຄຳຂໍສິນເຊື່ອທີ່ຍັງບໍ່ໄດ້ສົ່ງ</p>
      </div>
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
        <span class="icon-[tabler--file-export] size-4 mr-1"></span> Export CSV
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label"><span class="label-text text-sm font-medium">ຄົ້ນຫາ</span></label>
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..." class="input input-bordered w-full" @input="debounceSearch" />
      </div>
      <div>
        <label class="label"><span class="label-text text-sm font-medium">ເຈົ້າໜ້າທີ່</span></label>
        <select v-model="staffFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດເຈົ້າໜ້າທີ່</option>
          <option v-for="staff in staffList" :key="staff.id" :value="staff.id">{{ staff.name }}</option>
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
          <tr v-for="draft in displayedDrafts" :key="draft.id">
            <td class="font-medium">
              <div>{{ getDraftDisplayName(draft) || `Loan #${draft.loan_id}` }}</div>
              <div class="text-sm text-gray-500">{{ getDraftPhone(draft) }}</div>
            </td>
            <td>
              <div>{{ getProductName(draft) }}</div>
              <div class="text-sm text-gray-500">ID: {{ draft.product_id }}</div>
            </td>
            <td class="font-medium">{{ formatPrice(draft.total_amount) }}</td>
            <td>{{ getRequesterName(draft) || `ID: ${draft.requester_id || '-'}` }}</td>
            <td><span class="badge badge-soft" :class="getStatusBadgeClass(draft.status)">{{ getStatusText(draft.status) }}</span></td>
            <td>{{ draft.createdAt ? formatDate(draft.createdAt) : '-' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewDraftDetails(draft.id)"><span class="icon-[tabler--eye] size-4"></span></button>
                <button v-if="isDraft(draft)" class="btn btn-circle btn-text btn-sm text-error" @click="deleteDraft(draft.id)"><span class="icon-[tabler--trash] size-4"></span></button>
                <button v-if="isDraft(draft)" class="btn btn-circle btn-text btn-sm text-success" @click="confirmSubmitDraft(draft)"><span class="icon-[tabler--check] size-4"></span></button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedDrafts.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">{{ isLoading ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ມີຂໍ້ມູນ' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalDrafts }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option><option :value="25">25 ຕໍ່ໜ້າ</option><option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-2"> ໜ້າ {{ currentPage }} / {{ totalPages }} </span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <DraftDetailsModal 
      :show="showDetailsModal" 
      :draft-id="selectedDraftId" 
      @close="showDetailsModal = false" 
      @refresh="fetchData" 
    />

    <teleport to="body">
      <div v-if="showSubmitModal && draftToSubmit" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4 text-success">ຢືນຢັນການສົ່ງຄຳຂໍສິນເຊື່ອ</h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອເລກທີ <strong>{{ draftToSubmit.loan_id }}</strong> ເຂົ້າສູ່ລະບົບການພິຈາລະນາເລີຍບໍ່?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showSubmitModal = false" :disabled="isVerifying">ຍົກເລີກ</button>
            <button class="btn btn-success text-white" @click="submitDraft" :disabled="isVerifying">
              <span v-if="isVerifying" class="loading loading-spinner loading-xs"></span><span v-else>ຢືນຢັນການສົ່ງ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLoanApplicationStore } from '@/stores/loanApplication'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { useAddressStore } from '@/stores/address'
import { LoanApplicationStatus } from '@/types/loanApplication'
import Papa from 'papaparse'
import { alert } from '@/utils/alert'
import { formatPrice, getStatusBadgeClass, getStatusText } from '@/utils/formatters'

import DraftDetailsModal from '@/components/modals/loan/draft/DraftDetailsModal.vue'

const loanApplicationStore = useLoanApplicationStore()
const productStore = useProductStore()
const shopStore = useShopStore()
const addressStore = useAddressStore() // 🟢 ໂຫຼດ Store ກຽມໄວ້

const isLoading = computed(() => loanApplicationStore.isLoading)
const isVerifying = ref(false)

const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const staffFilter = ref('')

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

const staffList = computed(() => {
  const map = new Map();
  (loanApplicationStore.loanApplications || []).forEach(d => {
    if (d.requester_id) map.set(d.requester_id, getRequesterName(d))
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

const filteredDrafts = computed(() => {
  let list = loanApplicationStore.loanApplications || []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d => d.customer?.first_name?.toLowerCase().includes(q) || d.customer?.phone?.includes(q) || d.loan_id?.toLowerCase().includes(q))
  }
  if (staffFilter.value) list = list.filter(d => d.requester_id === parseInt(staffFilter.value))
  
  if (dateFrom.value || dateTo.value) {
    list = list.filter((d: any) => { // 🟢 ໃສ່ (d: any) ເພື່ອປ້ອງກັນ Implicit any
      if (!d.createdAt) return false;
      
      // 🟢 ບັງຄັບໃຫ້ເປັນ String ແບບ 100% ດ້ວຍ String() ແລະ ໃສ່ || '' ກວມອີກຊັ້ນ
      const dateString = String(d.createdAt);
      const date: string = (dateString.includes('T') ? dateString.split('T')[0] : dateString) || '';

      // 🟢 ບັງຄັບ Type ໃຫ້ fromDate ແລະ toDate ເປັນ String ແນ່ນອນ
      const fromDate: string = dateFrom.value || '1970-01-01';
      const toDate: string = dateTo.value || '9999-12-31';

      return date >= fromDate && date <= toDate;
    });
  }
  return list
})

const displayedDrafts = computed(() => filteredDrafts.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const totalDrafts = computed(() => filteredDrafts.value.length)
const totalPages = computed(() => Math.ceil(totalDrafts.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalDrafts.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

const previousPage = () => { if (hasPreviousPage.value) currentPage.value-- }
const nextPage = () => { if (hasNextPage.value) currentPage.value++ }
watch(pageSize, () => currentPage.value = 1)

let debounceTimer: any = null
const debounceSearch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => currentPage.value = 1, 300) }
const applyDateFilter = () => currentPage.value = 1

const fetchData = async () => {
  await loanApplicationStore.fetchLoanApplications({ status: LoanApplicationStatus.PENDING, is_confirmed: 0 })
}

const viewDraftDetails = (id: number) => {
  selectedDraftId.value = id
  showDetailsModal.value = true
}

const deleteDraft = async (id: number) => {
  if (!await alert.confirm('ຕ້ອງການລຶບຮ່າງສິນເຊື່ອນີ້ບໍ?')) return
  try {
    await loanApplicationStore.updateLoanApplication(id, { status: LoanApplicationStatus.REJECTED, remarks: 'ລຶບຮ່າງ' } as any)
    alert.success('ລຶບສຳເລັດ!')
    await fetchData()
  } catch (error: any) { alert.error('ເກີດຂໍ້ຜິດພາດ', error.message) }
}

const confirmSubmitDraft = async (draft: any) => {
  draftToSubmit.value = draft
  showSubmitModal.value = true
}

const submitDraft = async () => {
  isVerifying.value = true
  try {
    await loanApplicationStore.ApplyDraft(draftToSubmit.value.id, { is_confirmed: 1, status: LoanApplicationStatus.PENDING } as any)
    alert.success('ສົ່ງຄຳຂໍສຳເລັດ!')
    showSubmitModal.value = false
    await fetchData()
  } catch (error: any) { alert.error('ສົ່ງຄຳຂໍລົ້ມເຫຼວ', error.message) }
  isVerifying.value = false
}

const exportToCSV = () => {
  const csvData = displayedDrafts.value.map(d => ({
    'Loan ID': d.loan_id, 'ລູກຄ້າ': getDraftDisplayName(d), 'ເບີໂທ': getDraftPhone(d),
    'ສິນຄ້າ': getProductName(d), 'ຈຳນວນເງິນ': formatPrice(d.total_amount), 'ວັນທີ່ສ້າງ': d.createdAt ? formatDate(d.createdAt) : '-'
  }))
  const csv = Papa.unparse(csvData)
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv]))
  link.download = `drafts_${new Date().toISOString().split('T')[0]}.csv`; link.click()
}

onMounted(async () => {
  // 🟢 ໂຫຼດຂໍ້ມູນແຂວງມາກຽມພ້ອມ
  await Promise.all([ fetchData(), productStore.fetchProductTypes(), shopStore.fetchAllShop(), addressStore.fetchProvinces() ])
})
</script>
<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍງານລາຍລະອຽດໜີ້ຄ້າງຊຳລະ (Portfolio Aging Details)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ກວດສອບສະຖານະສິນເຊື່ອ ແລະ ອາຍຸໜີ້ຄ້າງຊຳລະ
          <span class="ml-1 text-primary font-medium">(ພົບທັງໝົດ {{ totalRecords }} ລາຍການ)</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="fetchReport" class="btn btn-outline btn-sm" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດໃໝ່
        </button>
        <button @click="exportToExcel" class="btn btn-success btn-sm text-white"
          :disabled="isLoading || records.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200">
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ສະຖານະໜີ້ (DPD Bucket)</span></label>
        <select v-model="filters.dpdBucket" class="select select-sm select-bordered w-full" @change="applyFilters">
          <option value="">-- ທັງໝົດ (All Active) --</option>
          <option value="current">ປົກກະຕິ (Current: 0 ມື້)</option>
          <option value="1-30">ຄ້າງຊຳລະ (1-30 ມື້)</option>
          <option value="31-90">ຄ້າງຊຳລະ (31-90 ມື້)</option>
          <option value="npl">ໜີ້ເສຍ (NPL > 90 ມື້)</option>
        </select>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ຊ່ວງວັນທີປ່ອຍສິນເຊື່ອ</span></label>
        <div class="flex gap-2">
          <input v-model="filters.startDate" type="date" class="input input-sm input-bordered w-full"
            @change="applyFilters" />
        </div>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ເຖິງວັນທີ</span></label>
        <div class="flex gap-2">
          <input v-model="filters.endDate" type="date" class="input input-sm input-bordered w-full"
            @change="applyFilters" />
        </div>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ຄົ້ນຫາ (ເລກສັນຍາ/ຊື່)</span></label>
        <input v-model="filters.search" type="text" placeholder="ພິມຄຳຄົ້ນຫາ..."
          class="input input-sm input-bordered w-full" @input="debounceSearch" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 bg-white rounded-xl shadow-sm">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Table -->
    <div v-else class="w-full overflow-x-auto rounded-lg border shadow-sm bg-white">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 text-gray-600 text-xs">
          <tr>
            <th>ເລກທີ່ສັນຍາ</th>
            <th>ຊື່ລູກຄ້າ</th>
            <th>ເບີໂທ</th>
            <th>ວົງເງິນອະນຸມັດ</th>
            <th>ຍອດຕົ້ນທຶນຄົງຄ້າງ</th>
            <th>ມື້ຊັກຊ້າ (DPD)</th>
            <th>ສະຖານະຈັດຊັ້ນໜີ້</th>
            <th>ວັນທີປ່ອຍ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in records" :key="loan.id">
            <td class="font-mono text-sm">{{ loan.contract_number }}</td>
            <td class="font-bold text-indigo-600">{{ loan.customer_name }}</td>
            <td class="text-sm">{{ loan.phone }}</td>
            <td>{{ formatPrice(loan.approved_amount) }}</td>
            <td class="font-bold text-error">{{ formatPrice(loan.outstanding_principal) }}</td>
            <td>
              <span class="badge" :class="getDpdBadge(loan.max_dpd)">{{ loan.max_dpd }} ມື້</span>
            </td>
            <td class="text-sm font-medium">{{ getBucketName(loan.max_dpd) }}</td>
            <td class="text-sm text-gray-600">{{ formatDate(loan.disbursed_at) }}</td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="8" class="text-center py-8">ບໍ່ພົບຂໍ້ມູນໜີ້ໃນກຸ່ມນີ້</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Server-Side Pagination -->
    <div v-if="!isLoading && totalRecords > 0" class="flex justify-between items-center mt-6 text-sm">
      <div>ສະແດງ {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit,
        totalRecords) }} ຈາກ {{ totalRecords }}</div>
      <div class="flex items-center gap-2">
        <select v-model="pagination.limit" class="select select-sm select-bordered" @change="fetchReport">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="20">20 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
          <option :value="100">100 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm btn-outline" :disabled="pagination.page <= 1" @click="changePage(-1)">ກ່ອນໜ້າ</button>
        <button class="btn btn-sm btn-outline" :disabled="pagination.page >= totalPages"
          @click="changePage(1)">ຖັດໄປ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { reportApi } from '@/api/report'
import { formatPrice } from '@/utils/formatters'

// 🌟 Local State for Server-Side Pagination
const isLoading = ref(false)
const records = ref<any[]>([])
const totalRecords = ref(0)
const pagination = ref({ page: 1, limit: 10 })

const filters = ref({ dpdBucket: '', startDate: '', endDate: '', search: '' })
let debounceTimer: any = null

const totalPages = computed(() => Math.ceil(totalRecords.value / pagination.value.limit) || 1)

const debounceSearch = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(fetchReport, 500); }
const applyFilters = () => { pagination.value.page = 1; fetchReport(); }
const changePage = (step: number) => { pagination.value.page += step; fetchReport(); }

const fetchReport = async () => {
  isLoading.value = true
  try {
    const res = await reportApi.getPortfolioHealthDetails({
      dpdBucket: filters.value.dpdBucket,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      search: filters.value.search,
      page: pagination.value.page,
      limit: pagination.value.limit
    })

    // 🌟 ແກ້ໄຂຈຸດນີ້: ອ່ານຄ່າຈາກ res.data ແລະ res.meta ໂດຍກົງ
    // ພ້ອມໃສ່ Fallback || [] ເພື່ອປ້ອງກັນ undefined ທີ່ເຮັດໃຫ້ Template Error
    records.value = res.data || []
    totalRecords.value = res.meta?.total || 0

  } catch (error) {
    console.error('Fetch Error:', error)
    records.value = []
    totalRecords.value = 0
  } finally {
    isLoading.value = false
  }
}

const getDpdBadge = (dpd: number) => {
  if (dpd === 0) return 'badge-success text-white'
  if (dpd <= 30) return 'badge-warning'
  if (dpd <= 90) return 'badge-error'
  return 'bg-red-800 text-white' // NPL
}
const getBucketName = (dpd: number) => {
  if (dpd === 0) return 'Current'
  if (dpd <= 30) return '1-30 Days'
  if (dpd <= 90) return '31-90 Days'
  return 'NPL'
}
const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('lo-LA') : '-'

const exportToExcel = () => {
  const data = records.value.map((r, i) => ({
    'ລຳດັບ': i + 1, 'ເລກສັນຍາ': r.contract_number, 'ຊື່ລູກຄ້າ': r.customer_name, 'ເບີໂທ': r.phone,
    'ວົງເງິນອະນຸມັດ': r.approved_amount, 'ຕົ້ນທຶນຄົງຄ້າງ': r.outstanding_principal,
    'ມື້ຊັກຊ້າ (DPD)': r.max_dpd, 'ສະຖານະ': getBucketName(r.max_dpd), 'ວັນທີປ່ອຍ': formatDate(r.disbursed_at)
  }))
  const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Portfolio Health'); XLSX.writeFile(wb, `Portfolio_Health.xlsx`);
}

onMounted(() => fetchReport())
</script>

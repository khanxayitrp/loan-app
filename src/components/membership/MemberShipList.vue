<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ການຈັດການສະມາຊິກ (Membership)</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ກວດສອບ, ແກ້ໄຂ ແລະ ຄຸ້ມຄອງຂໍ້ມູນສະມາຊິກທັງໝົດ
          <span class="ml-1 text-primary font-medium">
            (ພົບທັງໝົດ {{ totalFiltered }} ລາຍການ ຈາກລະບົບ {{ customerStore.totalRecords }})
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link to="/membership/create" class="btn btn-primary btn-sm">
          <span class="icon-[tabler--user-plus] size-4 mr-1"></span> ສ້າງສະມາຊິກໃໝ່
        </router-link>

        <button @click="fetchData" class="btn btn-outline btn-sm" :disabled="customerStore.isLoading">
          <span v-if="customerStore.isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
        <button @click="exportToExcel" class="btn btn-success btn-sm whitespace-nowrap text-white"
          :disabled="customerStore.isLoading || displayedMembers.length === 0">
          <span class="icon-[tabler--file-spreadsheet] size-4 mr-1"></span> Export Excel
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm">
      <div class="lg:col-span-2">
        <label class="label pb-1"><span class="label-text text-sm font-medium">ຄົ້ນຫາ (ຊື່, ນາມສະກຸນ, ເບີໂທ,
            ບັດປະຈຳຕົວ)</span></label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ພິມຄຳຄົ້ນຫາ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ສະຖານະ KYC</span></label>
        <select v-model="statusFilter" class="select select-sm select-bordered w-full">
          <option value="">ທັງໝົດ</option>
          <option value="unverified">ລໍຖ້າການກວດສອບ</option>
          <option value="verified">ຜ່ານການຢືນຢັນ</option>
          <option value="rejected">ປະຕິເສດ</option>
          <option value="expired">ໝົດອາຍຸ</option>
        </select>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ວັນທີລົງທະບຽນ</span></label>
        <div class="flex gap-1">
          <input v-model="dateFrom" type="date" class="input input-sm input-bordered w-full" />
          <input v-model="dateTo" type="date" class="input input-sm input-bordered w-full" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-if="customerStore.isLoading && customerStore.customers.length === 0"
      class="text-center py-12 bg-white rounded-xl border">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else class="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table class="table table-zebra w-full min-w-max">
        <thead class="bg-gray-50 text-gray-600 text-sm">
          <tr>
            <th class="w-12 text-center">
              <input type="checkbox" class="checkbox checkbox-sm" :checked="isAllSelected" @change="toggleSelectAll"
                :disabled="availableMembersForSelection.length === 0" />
            </th>
            <th>ໂປຣໄຟລ໌</th>
            <th>ຂໍ້ມູນລູກຄ້າ</th>
            <th>ເບີໂທລະສັບ</th>
            <th>ວັນເດືອນປີເກີດ</th>
            <th>ສະຖານະ KYC</th>
            <th>ວັນທີລົງທະບຽນ</th>
            <th class="text-center min-w-[150px]">ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in displayedMembers" :key="member.id" class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-indigo-50/50': selectedIds.includes(member.id) }">
            <td class="text-center">
              <input type="checkbox" class="checkbox checkbox-sm" :value="member.id" v-model="selectedIds"
                :disabled="selectedStatusGroup !== null && selectedStatusGroup !== member.kyc_status" />
            </td>
            <td>
              <div class="avatar">
                <div class="w-10 h-10 rounded-full bg-gray-200 border">
                  <img v-if="member.profile_image_url" :src="member.profile_image_url"
                    class="object-cover w-full h-full" />
                  <span v-else class="icon-[tabler--user] size-6 text-gray-400 mt-2 ml-2"></span>
                </div>
              </div>
            </td>
            <td>
              <div class="font-bold text-indigo-600">{{ member.first_name }} {{ member.last_name || '' }}</div>
              <div class="text-xs text-gray-500 mt-0.5">ID: {{ member.identity_number || '-' }}</div>
            </td>
            <td class="text-sm font-medium">{{ member.phone }}</td>
            <td class="text-sm">{{ formatDateOnly(member.date_of_birth) }}</td>
            <td>
              <span class="badge badge-sm border-0 text-white shadow-sm" :class="getKycBadgeClass(member.kyc_status)">
                {{ getKycStatusText(member.kyc_status) }}
              </span>
            </td>
            <td class="text-sm text-gray-500">{{ formatDateTime(member.created_at || member.createdAt) }}</td>
            <td>
              <div class="flex justify-center gap-1">
                <div class="tooltip tooltip-top" data-tip="ແກ້ໄຂ / ລາຍລະອຽດ">
                  <button class="btn btn-square btn-ghost btn-sm text-slate-600 hover:bg-slate-200"
                    @click="openMemberDetails(member.id)">
                    <span class="icon-[tabler--edit] size-5"></span>
                  </button>
                </div>

                <!-- 🟢 เปลี่ยนจาก updateStatus เป็น promptUpdateStatus (เปิด Modal) -->
                <div v-if="member.kyc_status === 'unverified' || member.kyc_status === 'rejected'"
                  class="tooltip tooltip-top" data-tip="ຢືນຢັນ KYC">
                  <button class="btn btn-square btn-ghost btn-sm text-emerald-600 hover:bg-emerald-100"
                    @click="promptUpdateStatus([member.id], 'verified')">
                    <span class="icon-[tabler--check] size-5"></span>
                  </button>
                </div>

                <div v-if="member.kyc_status === 'unverified'" class="tooltip tooltip-top" data-tip="ປະຕິເສດ KYC">
                  <button class="btn btn-square btn-ghost btn-sm text-red-600 hover:bg-red-100"
                    @click="promptUpdateStatus([member.id], 'rejected')">
                    <span class="icon-[tabler--x] size-5"></span>
                  </button>
                </div>

                <div v-if="member.kyc_status === 'verified'" class="tooltip tooltip-top" data-tip="ກຳນົດເປັນໝົດອາຍຸ">
                  <button class="btn btn-square btn-ghost btn-sm text-orange-600 hover:bg-orange-100"
                    @click="promptUpdateStatus([member.id], 'expired')">
                    <span class="icon-[tabler--clock-off] size-5"></span>
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="displayedMembers.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400">
              <span class="icon-[tabler--users-x] size-12 mb-2 opacity-50 block mx-auto"></span>
              ບໍ່ພົບຂໍ້ມູນສະມາຊິກ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk Action Bar -->
    <div v-if="selectedIds.length > 0"
      class="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <span class="text-indigo-800 font-medium text-sm">
        <span class="icon-[tabler--checkbox] size-4 inline-block mr-1 align-middle"></span>
        ເລືອກແລ້ວ {{ selectedIds.length }} ລາຍການ
        <span class="text-indigo-500 font-normal">(ສະຖານະປັດຈຸບັນ: {{ getKycStatusText(selectedStatusGroup) }})</span>
      </span>

      <div class="flex flex-wrap items-center gap-2">
        <!-- 🟢 เปลี่ยนมาใช้ promptUpdateStatus เช่นกัน -->
        <template v-if="selectedStatusGroup === 'unverified' || selectedStatusGroup === 'rejected'">
          <button class="btn btn-sm btn-success text-white border-0 shadow-sm"
            @click="promptUpdateStatus(selectedIds, 'verified')">
            <span class="icon-[tabler--check] size-4"></span> ຢືນຢັນທີ່ເລືອກ
          </button>
        </template>

        <template v-if="selectedStatusGroup === 'unverified'">
          <button class="btn btn-sm btn-error text-white border-0 shadow-sm"
            @click="promptUpdateStatus(selectedIds, 'rejected')">
            <span class="icon-[tabler--x] size-4"></span> ປະຕິເສດທີ່ເລືອກ
          </button>
        </template>

        <template v-if="selectedStatusGroup === 'verified'">
          <button class="btn btn-sm btn-warning text-white border-0 shadow-sm"
            @click="promptUpdateStatus(selectedIds, 'expired')">
            <span class="icon-[tabler--clock-off] size-4"></span> ກຳນົດເປັນໝົດອາຍຸ
          </button>
        </template>

        <button class="btn btn-sm btn-ghost text-slate-500" @click="selectedIds = []">ຍົກເລີກ</button>
      </div>
    </div>

    <!-- Local Pagination -->
    <div v-if="!customerStore.isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalFiltered }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered" @change="resetPage">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <!-- Load More Backend Data -->
    <div v-if="!customerStore.isLoading" class="flex flex-col items-center mt-6 border-t pt-6 border-dashed">
      <button v-if="customerStore.canLoadMore" class="btn btn-primary btn-outline w-full max-w-xs" @click="loadMore"
        :disabled="customerStore.isLoadingMore">
        <span v-if="customerStore.isLoadingMore" class="loading loading-spinner loading-sm"></span>
        <span v-else class="icon-[tabler--arrow-down-circle] size-5"></span>
        ໂຫຼດຂໍ້ມູນຈາກຖານຂໍ້ມູນເພີ່ມເຕີມ
      </button>
      <p v-else-if="customerStore.customers.length > 0" class="text-sm text-gray-400 italic">(ດຶງຂໍ້ມູນມາຄົບທັງໝົດແລ້ວ)
      </p>
    </div>

    <!-- 🟢 Modals -->
    <MemberDetailsModal :show="showModal" :customer-id="selectedCustomerId" @close="showModal = false"
      @refresh="fetchData" />

    <ConfirmStatusModal :show="showConfirmModal" :count="confirmTargetIds.length" :status="confirmTargetStatus"
      :is-loading="isUpdatingStatus" @close="closeConfirmModal" @confirm="executeStatusUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import { alert } from '@/utils/alert';
import { formatDateOnly } from '@/utils/formatters';
import MemberDetailsModal from '@/components/modals/membership/MemberDetailsModal.vue';
import ConfirmStatusModal from '@/components/modals/membership/ConfirmStatusModal.vue'; // 👈 นำเข้า Modal ใหม่
import { useCustomerStore } from '@/stores/customer';

const customerStore = useCustomerStore();

// Pagination & Filter State
const currentPage = ref(1);
const pageSize = ref(25);
const searchQuery = ref('');
const debouncedSearch = ref('');
const statusFilter = ref('');

const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const dateFrom = ref(firstDayOfMonth.toISOString().split('T')[0]);
const dateTo = ref('');

// Modals State
const showModal = ref(false);
const selectedCustomerId = ref<number | null>(null);

// 🟢 Status Confirm Modal State
const showConfirmModal = ref(false);
const confirmTargetIds = ref<number[]>([]);
const confirmTargetStatus = ref<'verified' | 'rejected' | 'expired' | ''>('');
const isUpdatingStatus = ref(false);

const selectedIds = ref<number[]>([]);

const selectedStatusGroup = computed(() => {
  if (selectedIds.value.length === 0) return null;
  const firstSelected = customerStore.customers.find(c => c.id === selectedIds.value[0]);
  return firstSelected ? firstSelected.kyc_status : null;
});

// Helper Functions
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-'; const d = new Date(dateString); return isNaN(d.getTime()) ? '-' : d.toLocaleString('lo-LA');
};

const getKycBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'bg-emerald-500';
    case 'unverified': return 'bg-warning text-gray-800';
    case 'rejected': return 'bg-error';
    case 'expired': return 'bg-slate-400';
    default: return 'bg-gray-400';
  }
};
const getKycStatusText = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'ຢືນຢັນແລ້ວ';
    case 'unverified': return 'ລໍຖ້າກວດສອບ';
    case 'rejected': return 'ຖືກປະຕິເສດ';
    case 'expired': return 'ໝົດອາຍຸ';
    default: return 'ບໍ່ລະບຸ';
  }
};

// Data Fetching
const fetchData = async () => {
  resetPage();
  const filters: any = { limit: 100 };
  if (debouncedSearch.value) filters.search = debouncedSearch.value;
  if (statusFilter.value) filters.status = statusFilter.value;
  if (dateFrom.value) filters.startDate = dateFrom.value;
  if (dateTo.value) filters.endDate = dateTo.value;

  try {
    await customerStore.fetchCustomers(filters);
  } catch (error) {
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້');
  }
};

const loadMore = async () => { await customerStore.loadMoreCustomers(); };

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value.trim();
    fetchData();
  }, 500);
};

// Computed
const filteredMembers = computed(() => {
  let filtered = customerStore.customers;
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase();
    filtered = filtered.filter(m => (m.first_name || '').toLowerCase().includes(q) || (m.last_name || '').toLowerCase().includes(q) || (m.phone || '').includes(q) || (m.identity_number || '').includes(q));
  }
  if (statusFilter.value) filtered = filtered.filter(m => m.kyc_status === statusFilter.value);
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(m => {
      const targetDate = m.created_at || m.createdAt;
      if (!targetDate) return false;
      const mDate = new Date(targetDate).toISOString().split('T')[0] || '';
      return mDate >= (dateFrom.value || '1970-01-01') && mDate <= (dateTo.value || '9999-12-31');
    });
  }
  return filtered;
});

const displayedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredMembers.value.slice(start, start + pageSize.value);
});

const totalFiltered = computed(() => filteredMembers.value.length);
const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value) || 1);
const startIndex = computed(() => totalFiltered.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalFiltered.value));
const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const resetPage = () => { currentPage.value = 1; selectedIds.value = []; };
const previousPage = () => { if (hasPreviousPage.value) { currentPage.value--; selectedIds.value = []; } };
const nextPage = () => { if (hasNextPage.value) { currentPage.value++; selectedIds.value = []; } };

// Checkbox Logic
const availableMembersForSelection = computed(() => {
  if (selectedStatusGroup.value === null) return displayedMembers.value;
  return displayedMembers.value.filter(m => m.kyc_status === selectedStatusGroup.value);
});

const isAllSelected = computed(() => {
  if (availableMembersForSelection.value.length === 0) return false;
  return availableMembersForSelection.value.every(m => selectedIds.value.includes(m.id));
});

const toggleSelectAll = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.checked) {
    const targetStatus = selectedStatusGroup.value || (displayedMembers.value[0]?.kyc_status);
    if (!targetStatus) return;
    const newIds = displayedMembers.value.filter(m => m.kyc_status === targetStatus && !selectedIds.value.includes(m.id)).map(m => m.id);
    selectedIds.value.push(...newIds);
  } else {
    const displayedIds = displayedMembers.value.map(m => m.id);
    selectedIds.value = selectedIds.value.filter(id => !displayedIds.includes(id));
  }
};

// 🟢 1. เตรียมเปิด Modal เพื่อรอรับคำยืนยัน
const promptUpdateStatus = (ids: number[], status: 'verified' | 'rejected' | 'expired') => {
  confirmTargetIds.value = ids;
  confirmTargetStatus.value = status;
  showConfirmModal.value = true;
};

// 🟢 2. ปิด Modal หรือยกเลิก
const closeConfirmModal = () => {
  showConfirmModal.value = false;
  confirmTargetIds.value = [];
  confirmTargetStatus.value = '';
};

// 🟢 3. ยิง API เมื่อกดปุ่มยืนยันจากใน Modal
const executeStatusUpdate = async () => {
  isUpdatingStatus.value = true;
  const statusLaoText = confirmTargetStatus.value === 'verified' ? 'ຢືນຢັນ' : confirmTargetStatus.value === 'rejected' ? 'ປະຕິເສດ' : 'ກຳນົດເປັນໝົດອາຍຸ';

  try {
    await customerStore.updateKycStatus(confirmTargetIds.value, confirmTargetStatus.value as any);
    alert.success(`ອັບເດດສະຖານະເປັນ ${statusLaoText} ສຳເລັດແລ້ວ`);

    // สำเร็จ: เคลียร์ค่าทั้งหมด
    selectedIds.value = [];
    closeConfirmModal();
    fetchData(); // ดึงข้อมูลใหม่
  } catch (error: any) {
    alert.error('ບໍ່ສາມາດອັບເດດໄດ້', error.response?.data?.message || 'ອາດມີບາງລາຍການທີ່ມີສະຖານະບໍ່ຖືກຕ້ອງຕາມເງື່ອນໄຂ');
    closeConfirmModal();
  } finally {
    isUpdatingStatus.value = false;
  }
};

// Watchers
watch([statusFilter, dateFrom, dateTo], () => { fetchData(); });

const openMemberDetails = (id: number) => { selectedCustomerId.value = id; showModal.value = true; };

const exportToExcel = () => {
  if (!filteredMembers.value.length) return;
  const excelData = filteredMembers.value.map((m, i) => ({
    'ລຳດັບ': i + 1, 'ຊື່': m.first_name || '', 'ນາມສະກຸນ': m.last_name || '',
    'ເບີໂທລະສັບ': m.phone || '-', 'ເລກບັດປະຈຳຕົວ': m.identity_number || '-',
    'ເພດ': m.gender === 'Male' ? 'ຊາຍ' : (m.gender === 'Female' ? 'ຍິງ' : '-'),
    'ວັນເດືອນປີເກີດ': formatDateOnly(m.date_of_birth), 'ສະຖານະ KYC': getKycStatusText(m.kyc_status),
    'ວັນທີລົງທະບຽນ': formatDateTime(m.created_at || m.createdAt)
  }));
  const ws = XLSX.utils.json_to_sheet(excelData);
  ws['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Members');
  XLSX.writeFile(wb, `Membership_List_${new Date().toISOString().split('T')[0]}.xlsx`);
};

onMounted(() => { fetchData(); });
</script>

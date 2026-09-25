
<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ອອກບັດສະມາຊິກ (Issue Member Card)</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ລາຍຊື່ລູກຄ້າທີ່ຜ່ານການອະນຸມັດ KYC ແລ້ວ ແລະ ລໍຖ້າການພິມບັດ
          <span class="ml-1 text-primary font-medium">
            (ພົບທັງໝົດ {{ totalFiltered }} ລາຍການ)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="fetchData" class="btn btn-outline btn-sm" :disabled="customerStore.isLoading">
          <span v-if="customerStore.isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--refresh] size-4 mr-1"></span> ໂຫຼດຂໍ້ມູນໃໝ່
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm">
      <div class="md:col-span-2">
        <label class="label pb-1"><span class="label-text text-sm font-medium">ຄົ້ນຫາລູກຄ້າ</span></label>
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາດ້ວຍຊື່, ເບີໂທ, ຫຼື ລະຫັດສະມາຊິກ..."
            class="input input-sm input-bordered w-full pl-9" @input="debounceSearch" />
          <span class="icon-[tabler--search] size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
      <div>
        <label class="label pb-1"><span class="label-text text-sm font-medium">ສະຖານະການອອກບັດ</span></label>
        <select v-model="cardStatusFilter" class="select select-sm select-bordered w-full">
          <option value="all">ທັງໝົດ</option>
          <option value="has_code">ມີລະຫັດສະມາຊິກແລ້ວ</option>
          <option value="no_code">ຍັງບໍ່ມີລະຫັດ</option>
        </select>
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
            <th class="w-16 text-center">ລ/ດ</th>
            <th>ໂປຣໄຟລ໌ລູກຄ້າ</th>
            <th>ລະຫັດສະມາຊິກ (Member Code)</th>
            <th>ເບີໂທລະສັບ</th>
            <th>ສະຖານະ KYC</th>
            <th class="text-center min-w-[120px]">ການຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(member, index) in displayedMembers" :key="member.id" class="hover:bg-gray-50 transition-colors">
            <td class="text-center">{{ startIndex + index }}</td>
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-10 h-10 rounded-full bg-gray-200 border">
                    <img v-if="member.profile_image_url" :src="member.profile_image_url"
                      class="object-cover w-full h-full" />
                    <span v-else class="icon-[tabler--user] size-6 text-gray-400 mt-2 ml-2"></span>
                  </div>
                </div>
                <div>
                  <div class="font-bold text-indigo-600">{{ member.first_name }} {{ member.last_name || '' }}</div>
                  <div class="text-xs text-gray-500">ID: {{ member.identity_number || '-' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div v-if="member.member_code">
                <span class="font-mono font-bold text-emerald-600">{{ member.member_code }}</span>
              </div>
              <span v-else class="badge badge-sm badge-ghost">ຍັງບໍ່ມີລະຫັດ</span>
            </td>
            <td class="text-sm font-medium">{{ member.phone }}</td>
            <td>
              <span class="badge badge-sm border-0 bg-emerald-500 text-white shadow-sm">
                ຢືນຢັນແລ້ວ
              </span>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-primary" :disabled="!member.member_code || isFetchingCard"
                @click="openPrintCard(member.id)">
                <span v-if="isFetchingCard && selectedCardId === member.id"
                  class="loading loading-spinner loading-xs"></span>
                <span v-else class="icon-[tabler--id-badge-2] size-4 mr-1"></span> ພິມບັດ
              </button>
            </td>
          </tr>
          <tr v-if="displayedMembers.length === 0">
            <td colspan="6" class="text-center py-12 text-gray-400">
              <span class="icon-[tabler--id] size-12 mb-2 opacity-50 block mx-auto"></span>
              ບໍ່ພົບລູກຄ້າທີ່ລໍຖ້າອອກບັດ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Local Pagination -->
    <div v-if="!customerStore.isLoading && totalFiltered > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div class="text-gray-500">ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalFiltered }} ລາຍການ</div>
      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered" @change="resetPage">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
        </select>
        <button class="btn btn-sm btn-outline" :disabled="!hasPreviousPage" @click="previousPage">ກ່ອນໜ້າ</button>
        <span class="px-3 font-medium">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-outline" :disabled="!hasNextPage" @click="nextPage">ຖັດໄປ</button>
      </div>
    </div>

    <!-- 🟢 Member Card Modal -->
    <MemberCardModal :is-open="showCardModal" :member-data="cardData" @close="showCardModal = false" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { alert } from '@/utils/alert';
import MemberCardModal from '@/components/modals/membership/MemberCardModal.vue';
import { useCustomerStore } from '@/stores/customer';

const customerStore = useCustomerStore();

// States
const currentPage = ref(1);
const pageSize = ref(25);
const searchQuery = ref('');
const debouncedSearch = ref('');
const cardStatusFilter = ref('all');

// Card Modal States
const showCardModal = ref(false);
const isFetchingCard = ref(false);
const selectedCardId = ref<number | null>(null);
const cardData = ref<any>(null);

// ດຶງຂໍ້ມູນສະເພາະກຸ່ມທີ່ Verified ແລ້ວ
const fetchData = async () => {
  resetPage();
  const filters: any = { limit: 100, status: 'verified' };

  if (debouncedSearch.value) filters.search = debouncedSearch.value;

  try {
    await customerStore.fetchCustomers(filters);
  } catch (error) {
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້');
  }
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value.trim();
    fetchData();
  }, 500);
};

// Client-side Filter
const filteredMembers = computed(() => {
  let filtered = customerStore.customers;

  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase();
    filtered = filtered.filter(m =>
      (m.first_name || '').toLowerCase().includes(q) ||
      (m.last_name || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.member_code || '').toLowerCase().includes(q)
    );
  }

  if (cardStatusFilter.value === 'has_code') {
    filtered = filtered.filter(m => m.member_code != null && m.member_code !== '');
  } else if (cardStatusFilter.value === 'no_code') {
    filtered = filtered.filter(m => m.member_code == null || m.member_code === '');
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

const resetPage = () => { currentPage.value = 1; };
const previousPage = () => { if (hasPreviousPage.value) currentPage.value--; };
const nextPage = () => { if (hasNextPage.value) currentPage.value++; };

// ເປີດ Modal ພິມບັດ
const openPrintCard = async (id: number) => {
  selectedCardId.value = id;
  isFetchingCard.value = true;
  try {
    const responseData = await customerStore.fetchMemberCardInfo(id);
    cardData.value = responseData;
    showCardModal.value = true;
  } catch (error) {
    alert.error('ບໍ່ສາມາດດຶງຂໍ້ມູນບັດໄດ້', 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ');
  } finally {
    isFetchingCard.value = false;
    selectedCardId.value = null;
  }
};

watch(cardStatusFilter, () => {
  resetPage();
});

onMounted(() => { fetchData(); });
</script>


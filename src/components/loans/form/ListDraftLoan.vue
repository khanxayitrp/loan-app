<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ລາຍການຮ່າງສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຮ່າງຄຳຂໍສິນເຊື່ອທີ່ຍັງບໍ່ໄດ້ສົ່ງ</p>
      </div>

      <!-- Export Button -->
      <button @click="exportToCSV" class="btn btn-outline btn-sm whitespace-nowrap">
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
        <input v-model="searchQuery" type="text" placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..." class="input input-bordered w-full"
          @input="debounceSearch" />
      </div>

      <!-- Staff Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ເຈົ້າໜ້າທີ່</span>
        </label>
        <select v-model="staffFilter" class="select select-bordered w-full">
          <option value="">ທັງໝົດເຈົ້າໜ້າທີ່</option>
          <option v-for="staff in staffList" :key="staff.id" :value="staff.id.toString()">
            {{ staff.name }}
          </option>
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
      <div class="loading loading-spinner"></div>
    </div>

    <!-- Table -->
    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>ລູກຄ້າ</th>
            <th>ສິນຄ້າ</th>
            <th>ຈຳນວນເງິນ</th>
            <th>ເຈົ້າໜ້າທີ່</th>
            <th>ສະຖານະ</th>
            <th>ວັນທີ່ສ້າງ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="draft in displayedDrafts" :key="draft.id">
            <!-- Customer Name -->
            <td class="font-medium">
              <div>{{ draft.customer_name }}</div>
              <div class="text-sm text-gray-500">{{ draft.customer_phone }}</div>
            </td>

            <!-- Product -->
            <td>
              <div>{{ draft.product_name }}</div>
              <div class="text-sm text-gray-500">{{ draft.product_type }}</div>
            </td>

            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(draft.amount) }}</td>

            <!-- Staff -->
            <td>{{ draft.staff_name }}</td>

            <!-- Status -->
            <td>
              <span class="badge badge-soft badge-warning">ຮ່າງ</span>
            </td>

            <!-- Created At -->
            <td>{{ formatDate(draft.created_at) }}</td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="viewDraftDetails(draft)"
                  aria-label="View details">
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-error" @click="deleteDraft(draft.id)"
                  aria-label="Delete draft">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>

                <button class="btn btn-circle btn-text btn-sm text-success" @click="confirmSubmitDraft(draft)"
                  aria-label="Submit draft">
                  <span class="icon-[tabler--check] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedDrafts.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">
              ບໍ່ມີຮ່າງສິນເຊື່ອ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalDrafts }} ລາຍການ
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

    <!-- Draft Details Modal -->
    <!-- Draft Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedDraft"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂຮ່າງສິນເຊື່ອ' : 'ລາຍລະອຽດຮ່າງສິນເຊື່ອ' }}
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="tabs tabs-boxed mb-6">
            <button class="tab" :class="{ 'tab-active': activeTab === 'details' }" :disabled="!isEditingInModal"
              @click="activeTab = 'details'">
              ລາຍລະອຽດ
            </button>
            <button class="tab" :class="{ 'tab-active': activeTab === 'documents' }" :disabled="!isEditingInModal"
              @click="activeTab = 'documents'">
              ເອກະສານ
            </button>
          </div>

          <!-- Tab Content -->

 <!-- Tab Content -->
      <div v-if="activeTab === 'details'" class="space-y-6">
        <!-- View Mode -->
        <div v-if="!isEditingInModal" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">ລູກຄ້າ</label>
              <p class="font-medium">{{ selectedDraft.customer_name || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
              <p>{{ selectedDraft.customer_phone || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ສິນຄ້າ</label>
              <p>{{ selectedDraft.product_name || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
              <p>{{ selectedDraft.product_type || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
              <p class="font-medium">{{ formatPrice(selectedDraft.amount) || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
              <p>{{ selectedDraft.interest_rate ? selectedDraft.interest_rate + '%' : '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
              <p>{{ selectedDraft.term ? selectedDraft.term + ' ເດືອນ' : '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່</label>
              <p>{{ selectedDraft.staff_name || '-' }}</p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
            <p class="whitespace-pre-line">{{ selectedDraft.customer_address || '-' }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
              <p>{{ formatPrice(selectedDraft.monthly_income) || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
              <p>{{ formatPrice(selectedDraft.other_debts) || '-' }}</p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
            <p>{{ formatDate(selectedDraft.created_at) || '-' }}</p>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ *</label>
              <input v-model="modalDraftForm.customer_name" type="text" class="input input-bordered w-full" required />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ເບີໂທ *</label>
              <input v-model="modalDraftForm.customer_phone" type="tel" class="input input-bordered w-full" required />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ສິນຄ້າ *</label>
              <input v-model="modalDraftForm.product_name" type="text" class="input input-bordered w-full" required />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
              <input v-model="modalDraftForm.product_type" type="text" class="input input-bordered w-full" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ *</label>
              <input v-model.number="modalDraftForm.amount" type="number" class="input input-bordered w-full" required min="0" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ (%)</label>
              <input v-model.number="modalDraftForm.interest_rate" type="number" class="input input-bordered w-full" min="0" max="100" step="0.01" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ (ເດືອນ)</label>
              <input v-model.number="modalDraftForm.term" type="number" class="input input-bordered w-full" min="1" max="60" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
              <input v-model.number="modalDraftForm.monthly_income" type="number" class="input input-bordered w-full" min="0" />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
            <textarea v-model="modalDraftForm.customer_address" class="textarea textarea-bordered w-full min-h-24"></textarea>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
            <input v-model.number="modalDraftForm.other_debts" type="number" class="input input-bordered w-full" min="0" />
          </div>
        </div>
      </div>

  <!-- Documents Tab -->
  <div v-else-if="activeTab === 'documents'">
    <div v-if="!isEditingInModal" class="text-center py-8 text-gray-500">
      ກະລຸນາກົດ "ແກ້ໄຂ" ເພື່ອຈັດການເອກະສານ
    </div>

    <div v-else class="space-y-4">
      <!-- Required Documents -->
      <div>
        <h4 class="font-medium mb-3">ເອກະສານທີ່ຕ້ອງການ</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(doc, index) in draftDocuments" :key="index"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h5 class="font-medium">{{ doc.name }}</h5>
                <p class="text-xs text-gray-500">{{ doc.description }}</p>
              </div>
              <span class="badge badge-soft badge-error text-xs">ຕ້ອງການ</span>
            </div>

            <div v-if="doc.file" class="mt-2">
              <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <img :src="doc.preview" alt="Document preview" class="w-full h-full object-contain" />
                <button type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  @click="removeDocument(index)">
                  ×
                </button>
              </div>
            </div>

            <div v-else class="mt-2">
              <label
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                <p class="text-sm text-gray-500">ອັບໂຫຼດ</p>
              </label>
              <input type="file" class="hidden" @change="(event) => handleDocumentUpload(index, event)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Optional Documents -->
      <div>
        <h4 class="font-medium mb-3">ເອກະສານເພີ່ມເຕີມ</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(doc, index) in optionalDocuments" :key="index + draftDocuments.length"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h5 class="font-medium">{{ doc.name }}</h5>
                <p class="text-xs text-gray-500">{{ doc.description }}</p>
              </div>
            </div>

            <div v-if="doc.file" class="mt-2">
              <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <img :src="doc.preview" alt="Document preview" class="w-full h-full object-contain" />
                <button type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  @click="removeDocument(index + draftDocuments.length)">
                  ×
                </button>
              </div>
            </div>

            <div v-else class="mt-2">
              <label
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                <p class="text-sm text-gray-500">ອັບໂຫຼດ</p>
              </label>
              <input type="file" class="hidden"
                @change="(event) => handleDocumentUpload(index + draftDocuments.length, event)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Actions -->
  <div class="flex justify-end gap-3 mt-6">
    <button class="btn btn-soft btn-secondary" @click="closeDetailsModal">
      {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
    </button>

    <!-- Edit button (only in view mode) -->
    <button v-if="!isEditingInModal" class="btn btn-primary" @click="startEditInModal">
      ແກ້ໄຂ
    </button>

    <!-- Save button (only in edit mode) -->
    <button v-else class="btn btn-success" @click="saveDraftFromModal" :disabled="isSaving">
      <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
      <span v-else>ບັນທຶກການປ່ຽນແປງ</span>
    </button>
  </div>
  </div>
  </div>
  </teleport>

  <!-- Submit Confirmation Modal -->
  <teleport to="body">
    <div v-if="showSubmitModal && draftToSubmit"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="font-bold text-lg mb-4 text-success">ສົ່ງຮ່າງສິນເຊື່ອ</h3>
        <p class="py-4 text-gray-700 dark:text-gray-300">
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສົ່ງຮ່າງສິນເຊື່ອຂອງ "{{ draftToSubmit.customer_name }}" ?
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-soft btn-secondary" @click="showSubmitModal = false">
            ຍົກເລີກ
          </button>
          <button class="btn btn-success" @click="submitDraft">
            ສົ່ງຮ່າງ
          </button>
        </div>
      </div>
    </div>
  </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Papa from 'papaparse'

// Types
interface DraftLoan {
  id: number
  customer_name: string
  customer_phone: string
  customer_address: string
  product_name: string
  product_type: string
  amount: number
  interest_rate: number
  term: number
  monthly_income: number
  other_debts: number
  staff_id: number
  staff_name: string
  created_at: string
}

interface Staff {
  id: number
  name: string
}

// Reactive state
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const staffFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Modal states
const showDetailsModal = ref(false)
const showSubmitModal = ref(false)
const selectedDraft = ref<DraftLoan | null>(null)
const draftToSubmit = ref<DraftLoan | null>(null)
// Reactive state
const activeTab = ref<'details' | 'documents'>('details')
const isEditingInModal = ref(false)
const isSaving = ref(false)

// Mock data
const mockStaffList: Staff[] = [
  { id: 1, name: 'ສົມຊາຍ ພົນສຸກ' },
  { id: 2, name: 'ສົມສິງ ດຳດີ' },
  { id: 3, name: 'ອຸດົມ ສີສົມບັດ' }
]


// Document types
interface Document {
  id: string
  name: string
  description: string
  required: boolean
  file: File | null
  preview: string | null
}

// Mock documents
const draftDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'household', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])

const optionalDocuments = ref<Document[]>([
  { id: 'income', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])

const mockDraftLoans: DraftLoan[] = [
  {
    id: 1,
    customer_name: 'ຈັນດາ ວົງສີ',
    customer_phone: '020 1234 5678',
    customer_address: 'ບ້ານ ນາມວົງ, ເມືອງ ໄຊເຊດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    product_name: 'ໂທລະສັບມືຖື iPhone 15',
    product_type: 'ເຄື່ອງໃຊ້ໄຟຟ້າ',
    amount: 15000000,
    interest_rate: 5.5,
    term: 12,
    monthly_income: 3000000,
    other_debts: 500000,
    staff_id: 1,
    staff_name: 'ສົມຊາຍ ພົນສຸກ',
    created_at: '2024-04-15T10:30:00Z'
  },
  {
    id: 2,
    customer_name: 'ບຸນເຊີຍ ສຸກສົມ',
    customer_phone: '020 8765 4321',
    customer_address: 'ບ້ານ ສີໂມກ, ເມືອງ ປາກເຊ, ຈຳປາສັກ',
    product_name: 'ເສື້ອຍືນ Levi\'s',
    product_type: 'ເຄື່ອງນຸ່ງ',
    amount: 350000,
    interest_rate: 3.25,
    term: 6,
    monthly_income: 2000000,
    other_debts: 300000,
    staff_id: 2,
    staff_name: 'ສົມສິງ ດຳດີ',
    created_at: '2024-04-16T14:15:00Z'
  },
  {
    id: 3,
    customer_name: 'ວິໄລ ສີສົມ',
    customer_phone: '020 1122 3344',
    customer_address: 'ບ້ານ ກະສີ, ເມືອງ ສະຫວັນນະເຂດ, ສະຫວັນນະເຂດ',
    product_name: 'ທີວີ Samsung 55"',
    product_type: 'ເຄື່ອງໃຊ້ໄຟຟ້າ',
    amount: 8000000,
    interest_rate: 4.75,
    term: 24,
    monthly_income: 5000000,
    other_debts: 1000000,
    staff_id: 3,
    staff_name: 'ອຸດົມ ສີສົມບັດ',
    created_at: '2024-04-17T09:45:00Z'
  }
]

// Document handlers
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
      return
    }

    if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF')
      return
    }

    const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
    const reader = new FileReader()
    reader.onload = (e) => {
      allDocs[index].file = file
      allDocs[index].preview = e.target?.result as string

      if (index < draftDocuments.value.length) {
        draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
      } else {
        optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeDocument = (index: number) => {
  const allDocs = [...draftDocuments.value, ...optionalDocuments.value]
  allDocs[index].file = null
  allDocs[index].preview = null

  if (index < draftDocuments.value.length) {
    draftDocuments.value = [...allDocs.slice(0, draftDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(draftDocuments.value.length)]
  }
}

// Form for editing in modal
const modalDraftForm = reactive({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  product_name: '',
  product_type: '',
  amount: 0,
  interest_rate: 0,
  term: 0,
  monthly_income: 0,
  other_debts: 0
})

// const saveDraftFromModal = async () => {
//   if (!selectedDraft.value) return

//   isSaving.value = true
//   try {
//     // Update mock data
//     const index = mockDraftLoans.findIndex(d => d.id === selectedDraft.value!.id)
//     if (index !== -1) {
//       mockDraftLoans[index] = {
//         ...mockDraftLoans[index],
//         ...modalDraftForm,
//         // Add document data if needed
//       }
//     }

//     alert('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
//     isEditingInModal.value = false

//   } catch (error) {
//     console.error('Error saving draft:', error)
//     alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກ')
//   } finally {
//     isSaving.value = false
//   }
// }

// Computed properties
const staffList = computed(() => mockStaffList)

const filteredDrafts = computed(() => {
  let filtered = mockDraftLoans

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(draft =>
      draft.customer_name.toLowerCase().includes(query) ||
      draft.customer_phone.includes(query)
    )
  }

  // Staff filter
  if (staffFilter.value) {
    const staffId = parseInt(staffFilter.value)
    filtered = filtered.filter(draft => draft.staff_id === staffId)
  }

  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(draft => {
      const draftDate = new Date(draft.created_at).toISOString().split('T')[0]
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return draftDate >= fromDate && draftDate <= toDate
    })
  }

  return filtered
})

const displayedDrafts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDrafts.value.slice(start, end)
})

const totalDrafts = computed(() => filteredDrafts.value.length)
const totalPages = computed(() => Math.ceil(totalDrafts.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalDrafts.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

// Apply date filter
const applyDateFilter = () => {
  currentPage.value = 1
}

// Action handlers
const viewDraftDetails = (draft: DraftLoan) => {
  selectedDraft.value = draft
  showDetailsModal.value = true
  isEditingInModal.value = false
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDraft.value = null
  isEditingInModal.value = false
  isSaving.value = false
}

const startEditInModal = () => {
  if (!selectedDraft.value) return

  // Load data into form
  modalDraftForm.customer_name = selectedDraft.value.customer_name
  modalDraftForm.customer_phone = selectedDraft.value.customer_phone
  modalDraftForm.customer_address = selectedDraft.value.customer_address
  modalDraftForm.product_name = selectedDraft.value.product_name
  modalDraftForm.product_type = selectedDraft.value.product_type
  modalDraftForm.amount = selectedDraft.value.amount
  modalDraftForm.interest_rate = selectedDraft.value.interest_rate
  modalDraftForm.term = selectedDraft.value.term
  modalDraftForm.monthly_income = selectedDraft.value.monthly_income
  modalDraftForm.other_debts = selectedDraft.value.other_debts

  isEditingInModal.value = true
  activeTab.value = 'details' // Start with details tab
}

const saveDraftFromModal = async () => {
  if (!selectedDraft.value) return

  isSaving.value = true
  try {
    // Update mock data
    const index = mockDraftLoans.findIndex(d => d.id === selectedDraft.value!.id)
    if (index !== -1) {
      mockDraftLoans[index] = {
        ...mockDraftLoans[index],
        ...modalDraftForm
      }
    }

    alert('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false

  } catch (error) {
    console.error('Error saving draft:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກ')
  } finally {
    isSaving.value = false
  }
}

const deleteDraft = (draftId: number) => {
  if (confirm('ຕ້ອງການລຶບຮ່າງສິນເຊື່ອນີ້ບໍ?')) {
    const index = mockDraftLoans.findIndex(d => d.id === draftId)
    if (index !== -1) {
      mockDraftLoans.splice(index, 1)
      alert('ລຶບຮ່າງສິນເຊື່ອສຳເລັດ!')

      // Close modal if deleting current draft
      if (selectedDraft.value?.id === draftId) {
        closeDetailsModal()
      }
    }
  }
}

const confirmSubmitDraft = (draft: DraftLoan) => {
  draftToSubmit.value = draft
  showSubmitModal.value = true
}

const submitDraft = async () => {
  if (!draftToSubmit.value) return

  isLoading.value = true
  try {
    // Simulate API call to submit draft
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Remove from drafts
    const index = mockDraftLoans.findIndex(d => d.id === draftToSubmit.value!.id)
    if (index !== -1) {
      mockDraftLoans.splice(index, 1)
    }

    alert('ສົ່ງຮ່າງສິນເຊື່ອສຳເລັດ!')
    showSubmitModal.value = false

    // Close modal if submitting current draft
    if (selectedDraft.value?.id === draftToSubmit.value.id) {
      closeDetailsModal()
    }

  } catch (error) {
    console.error('Error submitting draft:', error)
    alert('ເກີດຂໍ້ຜິດພາດການສົ່ງຮ່າງສິນເຊື່ອ')
  } finally {
    isLoading.value = false
  }
}

// Export CSV
const exportToCSV = () => {
  if (!displayedDrafts.value.length) return

  const csvData = displayedDrafts.value.map(draft => ({
    'ລູກຄ້າ': draft.customer_name,
    'ເບີໂທ': draft.customer_phone,
    'ສິນຄ້າ': draft.product_name,
    'ປະເພດ': draft.product_type,
    'ຈຳນວນເງິນ': formatPrice(draft.amount),
    'ດອກເບ້ຍ (%)': draft.interest_rate,
    'ໄລຍະເວລາ (ເດືອນ)': draft.term,
    'ເຈົ້າໜ້າທີ່': draft.staff_name,
    'ວັນທີ່ສ້າງ': formatDate(draft.created_at)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `draft_loans_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Pagination methods
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

watch(pageSize, () => {
  currentPage.value = 1
})
</script>

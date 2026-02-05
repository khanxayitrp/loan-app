<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ສິນເຊື່ອ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຄຳຂໍສິນເຊື່ອທີ່ສົ່ງແລ້ວ</p>
      </div>

      <!-- Export Button -->
      <button
        @click="exportToCSV"
        class="btn btn-outline btn-sm whitespace-nowrap"
      >
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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ຊື່ລູກຄ້າ, ເບີໂທ..."
          class="input input-bordered w-full"
          @input="debounceSearch"
        />
      </div>

      <!-- Staff Filter -->
      <div>
        <label class="label">
          <span class="label-text text-sm font-medium">ເຈົ້າໜ້າທີ່</span>
        </label>
        <select
          v-model="staffFilter"
          class="select select-bordered w-full"
        >
          <option value="">ທັງໝົດເຈົ້າໜ້າທີ່</option>
          <option
            v-for="staff in staffList"
            :key="staff.id"
            :value="staff.id.toString()"
          >
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
          <input
            v-model="dateFrom"
            type="date"
            class="input input-bordered w-full"
            @change="applyDateFilter"
          />
          <input
            v-model="dateTo"
            type="date"
            class="input input-bordered w-full"
            @change="applyDateFilter"
          />
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
          <tr v-for="loan in displayedLoans" :key="loan.id">
            <!-- Customer Name -->
            <td class="font-medium">
              <div>{{ loan.customer_name }}</div>
              <div class="text-sm text-gray-500">{{ loan.customer_phone }}</div>
            </td>

            <!-- Product -->
            <td>
              <div>{{ loan.product_name }}</div>
              <div class="text-sm text-gray-500">{{ loan.product_type }}</div>
            </td>

            <!-- Amount -->
            <td class="font-medium">{{ formatPrice(loan.amount) }}</td>

            <!-- Staff -->
            <td>{{ loan.staff_name }}</td>

            <!-- Status -->
            <td>
              <span
                class="badge badge-soft"
                :class="getStatusBadgeClass(loan.status)"
              >
                {{ getStatusText(loan.status) }}
              </span>
            </td>

            <!-- Created At -->
            <td>{{ formatDate(loan.created_at) }}</td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button
                  class="btn btn-circle btn-text btn-sm"
                  @click="viewLoanDetails(loan)"
                  aria-label="View details"
                >
                  <span class="icon-[tabler--eye] size-4"></span>
                </button>

                <button
                  class="btn btn-circle btn-text btn-sm"
                  @click="editLoan(loan)"
                  aria-label="Edit loan"
                >
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedLoans.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">
              ບໍ່ມີຂໍ້ມູນສິນເຊື່ອ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalLoans }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model.number="pageSize"
          class="select select-sm select-bordered"
        >
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button
          class="btn btn-sm"
          :disabled="!hasPreviousPage"
          @click="previousPage"
        >
          ກ່ອນໜ້າ
        </button>

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="btn btn-sm"
          :disabled="!hasNextPage"
          @click="nextPage"
        >
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- Loan Details Modal -->
    <teleport to="body">
      <div v-if="showDetailsModal && selectedLoan" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ isEditingInModal ? 'ແກ້ໄຂສິນເຊື່ອ' : 'ລາຍລະອຽດສິນເຊື່ອ' }}
            </h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="tabs tabs-boxed mb-6">
            <button
              class="tab"
              :class="{ 'tab-active': activeTab === 'details' }"
              :disabled="!isEditingInModal"
              @click="activeTab = 'details'"
            >
              ລາຍລະອຽດ
            </button>
            <button
              class="tab"
              :class="{ 'tab-active': activeTab === 'documents' }"
              :disabled="!isEditingInModal"
              @click="activeTab = 'documents'"
            >
              ເອກະສານ
            </button>
          </div>

          <!-- Tab Content -->

          <!-- Details Tab -->
          <div v-if="activeTab === 'details'">
            <!-- View Mode -->
            <div v-if="!isEditingInModal" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">ລູກຄ້າ</label>
                  <p class="font-medium">{{ selectedLoan.customer_name }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                  <p>{{ selectedLoan.customer_phone }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສິນຄ້າ</label>
                  <p>{{ selectedLoan.product_name }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
                  <p>{{ selectedLoan.product_type }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                  <p class="font-medium">{{ formatPrice(selectedLoan.amount) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ</label>
                  <p>{{ selectedLoan.interest_rate }}%</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ</label>
                  <p>{{ selectedLoan.term }} ເດືອນ</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເຈົ້າໜ້າທີ່</label>
                  <p>{{ selectedLoan.staff_name }}</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                <p class="whitespace-pre-line">{{ selectedLoan.customer_address }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                  <p>{{ formatPrice(selectedLoan.monthly_income) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                  <p>{{ formatPrice(selectedLoan.other_debts) }}</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-500">ສ້າງເມື່ອ</label>
                <p>{{ formatDate(selectedLoan.created_at) }}</p>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">ຊື່ລູກຄ້າ</label>
                  <input
                    v-model="modalLoanForm.customer_name"
                    type="text"
                    class="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ເບີໂທ</label>
                  <input
                    v-model="modalLoanForm.customer_phone"
                    type="tel"
                    class="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ສິນຄ້າ</label>
                  <input
                    v-model="modalLoanForm.product_name"
                    type="text"
                    class="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ປະເພດ</label>
                  <input
                    v-model="modalLoanForm.product_type"
                    type="text"
                    class="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ຈຳນວນເງິນ</label>
                  <input
                    v-model.number="modalLoanForm.amount"
                    type="number"
                    class="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ດອກເບ້ຍ (%)</label>
                  <input
                    v-model.number="modalLoanForm.interest_rate"
                    type="number"
                    class="input input-bordered w-full"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ໄລຍະເວລາ (ເດືອນ)</label>
                  <input
                    v-model.number="modalLoanForm.term"
                    type="number"
                    class="input input-bordered w-full"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">ລາຍຮັບຕໍ່ເດືອນ</label>
                  <input
                    v-model.number="modalLoanForm.monthly_income"
                    type="number"
                    class="input input-bordered w-full"
                  />
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-500">ທີ່ຢູ່</label>
                <textarea
                  v-model="modalLoanForm.customer_address"
                  class="textarea textarea-bordered w-full min-h-24"
                ></textarea>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-500">ໜີ້ສິນອື່ນໆ</label>
                <input
                  v-model.number="modalLoanForm.other_debts"
                  type="number"
                  class="input input-bordered w-full"
                />
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
                  <div
                    v-for="(doc, index) in loanDocuments"
                    :key="index"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <h5 class="font-medium">{{ doc.name }}</h5>
                        <p class="text-xs text-gray-500">{{ doc.description }}</p>
                      </div>
                      <span class="badge badge-soft badge-error text-xs">ຕ້ອງການ</span>
                    </div>

                    <div v-if="doc.file" class="mt-2">
                      <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <img
                          :src="doc.preview"
                          alt="Document preview"
                          class="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          @click="removeDocument(index)"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div v-else class="mt-2">
                      <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                        <p class="text-sm text-gray-500">ອັບໂຫຼດ</p>
                      </label>
                      <input
                        type="file"
                        class="hidden"
                        @change="(event) => handleDocumentUpload(index, event)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Optional Documents -->
              <div>
                <h4 class="font-medium mb-3">ເອກະສານເພີ່ມເຕີມ</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="(doc, index) in optionalDocuments"
                    :key="index + loanDocuments.length"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <h5 class="font-medium">{{ doc.name }}</h5>
                        <p class="text-xs text-gray-500">{{ doc.description }}</p>
                      </div>
                    </div>

                    <div v-if="doc.file" class="mt-2">
                      <div class="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <img
                          :src="doc.preview"
                          alt="Document preview"
                          class="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          @click="removeDocument(index + loanDocuments.length)"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div v-else class="mt-2">
                      <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                        <p class="text-sm text-gray-500">ອັບໂຫຼດ</p>
                      </label>
                      <input
                        type="file"
                        class="hidden"
                        @change="(event) => handleDocumentUpload(index + loanDocuments.length, event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="btn btn-soft btn-secondary"
              @click="closeDetailsModal"
            >
              {{ isEditingInModal ? 'ຍົກເລີກ' : 'ປິດ' }}
            </button>

            <!-- Edit button (only in view mode) -->
            <button
              v-if="!isEditingInModal"
              class="btn btn-primary"
              @click="startEditInModal"
            >
              ແກ້ໄຂ
            </button>

            <!-- Save button (only in edit mode) -->
            <button
              v-else
              class="btn btn-success"
              @click="saveLoanFromModal"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
              <span v-else>ບັນທຶກການປ່ຽນແປງ</span>
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
interface Loan {
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
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed'
  created_at: string
}

interface Staff {
  id: number
  name: string
}

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  file: File | null
  preview: string | null
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
const selectedLoan = ref<Loan | null>(null)
const isEditingInModal = ref(false)
const isSaving = ref(false)
const activeTab = ref<'details' | 'documents'>('details')

// Mock data
const mockStaffList: Staff[] = [
  { id: 1, name: 'ສົມຊາຍ ພົນສຸກ' },
  { id: 2, name: 'ສົມສິງ ດຳດີ' },
  { id: 3, name: 'ອຸດົມ ສີສົມບັດ' }
]

const mockLoans: Loan[] = [
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
    status: 'pending',
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
    status: 'pending',
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
  ,
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
    status: 'pending',
    created_at: '2024-04-17T09:45:00Z'
  }
]

// Form for editing in modal
const modalLoanForm = reactive({
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

// Documents
const loanDocuments = ref<Document[]>([
  { id: 'id_card', name: 'ບັດປະຈຳຕົວ', description: 'ຮູບຖ່າຍບັດປະຈຳຕົວທັງໜ້າ-ຫຼັງ', required: true, file: null, preview: null },
  { id: 'household', name: 'ໃບຄອບຄົວ', description: 'ໃບຄອບຄົວຫຼືເອກະສານຢືນຢັນທີ່ຢູ່', required: true, file: null, preview: null }
])

const optionalDocuments = ref<Document[]>([
  { id: 'income', name: 'ຫຼັກຖານລາຍຮັບ', description: 'ໃບເງິນເດືອນ ຫຼື ໃບຮັບລາຍຮັບ', required: false, file: null, preview: null },
  { id: 'other', name: 'ເອກະສານອື່ນໆ', description: 'ເອກະສານອື່ນໆທີ່ກ່ຽວຂ້ອງ', required: false, file: null, preview: null }
])

// Computed properties
const staffList = computed(() => mockStaffList)

const filteredLoans = computed(() => {
  let filtered = mockLoans

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(loan =>
      loan.customer_name.toLowerCase().includes(query) ||
      loan.customer_phone.includes(query)
    )
  }

  // Staff filter
  if (staffFilter.value) {
    const staffId = parseInt(staffFilter.value)
    filtered = filtered.filter(loan => loan.staff_id === staffId)
  }

  // Date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(loan => {
      const loanDate = new Date(loan.created_at).toISOString().split('T')[0]
      const fromDate = dateFrom.value || '1970-01-01'
      const toDate = dateTo.value || '9999-12-31'
      return loanDate >= fromDate && loanDate <= toDate
    })
  }

  return filtered
})

const displayedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoans.value.slice(start, end)
})

const totalLoans = computed(() => filteredLoans.value.length)
const totalPages = computed(() => Math.ceil(totalLoans.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalLoans.value))
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

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'pending': return 'badge-warning'
    case 'approved': return 'badge-info'
    case 'rejected': return 'badge-error'
    case 'disbursed': return 'badge-success'
    case 'closed': return 'badge-neutral'
    default: return 'badge-neutral'
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'ລໍຖ້າການອະນຸມັດ',
    'approved': 'ອະນຸມັດແລ້ວ',
    'rejected': 'ປະຕິເສດ',
    'disbursed': 'ຈ່າຍເງິນແລ້ວ',
    'closed': 'ປິດສິນເຊື່ອ'
  }
  return statusMap[status] || status
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
const viewLoanDetails = (loan: Loan) => {
  selectedLoan.value = loan
  showDetailsModal.value = true
  isEditingInModal.value = false
  activeTab.value = 'details'
}

const editLoan = (loan: Loan) => {
  selectedLoan.value = loan
  showDetailsModal.value = true
  startEditInModal()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLoan.value = null
  isEditingInModal.value = false
  isSaving.value = false
  activeTab.value = 'details'
}

const startEditInModal = () => {
  if (!selectedLoan.value) return

  // Load data into form
  modalLoanForm.customer_name = selectedLoan.value.customer_name
  modalLoanForm.customer_phone = selectedLoan.value.customer_phone
  modalLoanForm.customer_address = selectedLoan.value.customer_address
  modalLoanForm.product_name = selectedLoan.value.product_name
  modalLoanForm.product_type = selectedLoan.value.product_type
  modalLoanForm.amount = selectedLoan.value.amount
  modalLoanForm.interest_rate = selectedLoan.value.interest_rate
  modalLoanForm.term = selectedLoan.value.term
  modalLoanForm.monthly_income = selectedLoan.value.monthly_income
  modalLoanForm.other_debts = selectedLoan.value.other_debts

  isEditingInModal.value = true
  activeTab.value = 'details'
}

const saveLoanFromModal = async () => {
  if (!selectedLoan.value) return

  isSaving.value = true
  try {
    // Update mock data
    const index = mockLoans.findIndex(l => l.id === selectedLoan.value!.id)
    if (index !== -1) {
      mockLoans[index] = {
        ...mockLoans[index],
        ...modalLoanForm
      }
    }

    alert('ບັນທຶກການປ່ຽນແປງສຳເລັດ!')
    isEditingInModal.value = false

  } catch (error) {
    console.error('Error saving loan:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກ')
  } finally {
    isSaving.value = false
  }
}

// Document handlers
const handleDocumentUpload = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 5MB')
      return
    }

    if (!file.type.match(/^(image\/.*|application\/pdf)$/)) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ ຫຼື PDF')
      return
    }

    const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
    const reader = new FileReader()
    reader.onload = (e) => {
      allDocs[index].file = file
      allDocs[index].preview = e.target?.result as string

      if (index < loanDocuments.value.length) {
        loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
      } else {
        optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeDocument = (index: number) => {
  const allDocs = [...loanDocuments.value, ...optionalDocuments.value]
  allDocs[index].file = null
  allDocs[index].preview = null

  if (index < loanDocuments.value.length) {
    loanDocuments.value = [...allDocs.slice(0, loanDocuments.value.length)]
  } else {
    optionalDocuments.value = [...allDocs.slice(loanDocuments.value.length)]
  }
}

// Export CSV
const exportToCSV = () => {
  if (!displayedLoans.value.length) return

  const csvData = displayedLoans.value.map(loan => ({
    'ລູກຄ້າ': loan.customer_name,
    'ເບີໂທ': loan.customer_phone,
    'ສິນຄ້າ': loan.product_name,
    'ປະເພດ': loan.product_type,
    'ຈຳນວນເງິນ': formatPrice(loan.amount),
    'ດອກເບ້ຍ (%)': loan.interest_rate,
    'ໄລຍະເວລາ (ເດືອນ)': loan.term,
    'ເຈົ້າໜ້າທີ່': loan.staff_name,
    'ສະຖານະ': getStatusText(loan.status),
    'ວັນທີ່ສ້າງ': formatDate(loan.created_at)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `loans_${new Date().toISOString().split('T')[0]}.csv`
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

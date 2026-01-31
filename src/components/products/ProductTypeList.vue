<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການປະເພດສິນຄ້າ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຂໍ້ມູນປະເພດສິນຄ້າທັງໝົດ</p>
      </div>

      <button
        @click="openAddProductTypeModal"
        class="btn btn-gradient btn-primary whitespace-nowrap"
      >
        <span class="icon-[tabler--plus] size-5 mr-1"></span>
        ເພີ່ມປະເພດໃໝ່
      </button>
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
            <th>ຊື່ປະເພດ</th>
            <th>ຄຳອະທິບາຍ</th>
            <th>ສະຖານະ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productType in displayedProductTypes" :key="productType.id">
            <!-- Type Name -->
            <td class="font-medium">{{ productType.type_name }}</td>

            <!-- Description -->
            <td>{{ productType.description || '-' }}</td>

            <!-- Status -->
            <td>
              <span
                class="badge badge-soft"
                :class="productType.is_active ? 'badge-success' : 'badge-error'"
              >
                {{ productType.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button
                  class="btn btn-circle btn-text btn-sm"
                  @click="openEditProductTypeModal(productType)"
                  aria-label="Edit product type"
                >
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <button
                  class="btn btn-circle btn-text btn-sm text-error"
                  @click="deleteProductType(productType.id)"
                  aria-label="Delete product type"
                >
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedProductTypes.length === 0">
            <td colspan="4" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນປະເພດສິນຄ້າ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalProductTypes }} ລາຍການ
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

    <!-- Add/Edit Product Type Modal -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ editingProductType ? 'ແກ້ໄຂປະເພດສິນຄ້າ' : 'ເພີ່ມປະເພດໃໝ່' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <form @submit.prevent="saveProductType" class="space-y-6">
            <!-- Type Name -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຊື່ປະເພດ *</span>
              </label>
              <input
                v-model="form.type_name"
                type="text"
                placeholder="ປ້ອນຊື່ປະເພດສິນຄ້າ"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.type_name }"
                required
              />
              <label v-if="errors.type_name" class="label text-error">
                <span class="label-text-alt">{{ errors.type_name }}</span>
              </label>
            </div>

            <!-- Description -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຄຳອະທິບາຍ</span>
              </label>
              <textarea
                v-model="form.description"
                placeholder="ປ້ອນຄຳອະທິບາຍປະເພດສິນຄ້າ"
                class="textarea textarea-bordered w-full min-h-24"
              ></textarea>
            </div>

            <!-- Status -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  v-model="form.is_active"
                  :true-value="1"
                  :false-value="0"
                  class="toggle toggle-primary"
                />
                <span class="label-text font-medium">ສະຖານະ (Active/Inactive)</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-soft btn-secondary"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                <span v-else>{{ editingProductType ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມປະເພດ' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// Types based on your DB schema (without partner_id)
interface ProductType {
  id: number
  type_name: string
  description: string | null
  is_active: number
  created_at: string
}

// Reactive state
const isLoading = ref(false)
const showModal = ref(false)
const editingProductType = ref<ProductType | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// Mock product types data (without partner_id)
const mockProductTypes: ProductType[] = [
  {
    id: 1,
    type_name: 'ເຄື່ອງໃຊ້ໄຟຟ້າ',
    description: 'ສິນຄ້າເຄື່ອງໃຊ້ໄຟຟ້າທັງໝົດ',
    is_active: 1,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    type_name: 'ເຄື່ອງນຸ່ງ',
    description: 'ເຄື່ອງນຸ່ງຜູ້ໃຫຍ່',
    is_active: 1,
    created_at: '2024-02-20T14:15:00Z'
  },
  {
    id: 3,
    type_name: 'ອາຫານ',
    description: 'ອາຫານແລະເຄື່ອງດື່ມ',
    is_active: 0,
    created_at: '2024-03-10T09:45:00Z'
  },
  {
    id: 4,
    type_name: 'ຄວາມງາມ',
    description: 'ເຄື່ອງສຳອາງ ແລະ ການດູແລຕົນເອງ',
    is_active: 1,
    created_at: '2024-03-25T11:20:00Z'
  },
  {
    id: 5,
    type_name: 'ບ້ານ',
    description: 'ເຄື່ອງໃຊ້ໃນບ້ານ',
    is_active: 1,
    created_at: '2024-04-05T16:30:00Z'
  }
]

// Form state (matches DB schema without partner_id)
const form = reactive({
  type_name: '',
  description: '',
  is_active: 1
})

const errors = reactive({
  type_name: ''
})

// Computed properties
const filteredProductTypes = computed(() => mockProductTypes)
const displayedProductTypes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProductTypes.value.slice(start, end)
})

const totalProductTypes = computed(() => filteredProductTypes.value.length)
const totalPages = computed(() => Math.ceil(totalProductTypes.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalProductTypes.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Validation
const validateForm = (): boolean => {
  errors.type_name = ''

  if (!form.type_name.trim()) {
    errors.type_name = 'ກະລຸນາປ້ອນຊື່ປະເພດສິນຄ້າ'
    return false
  }

  return true
}

// Modal functions
const openAddProductTypeModal = () => {
  editingProductType.value = null
  resetForm()
  showModal.value = true
}

const openEditProductTypeModal = (productType: ProductType) => {
  editingProductType.value = productType
  form.type_name = productType.type_name
  form.description = productType.description || ''
  form.is_active = productType.is_active
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProductType.value = null
}

const resetForm = () => {
  form.type_name = ''
  form.description = ''
  form.is_active = 1
}

// Save product type
const saveProductType = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  try {
    if (editingProductType.value) {
      // Edit mode
      const index = mockProductTypes.findIndex(pt => pt.id === editingProductType.value!.id)
      if (index !== -1) {
        mockProductTypes[index] = {
          ...editingProductType.value,
          type_name: form.type_name,
          description: form.description || null,
          is_active: form.is_active,
          created_at: editingProductType.value.created_at
        }
      }
      alert('ແກ້ໄຂປະເພດສິນຄ້າສຳເລັດ!')
    } else {
      // Create mode
      const newProductType: ProductType = {
        id: mockProductTypes.length + 1,
        type_name: form.type_name,
        description: form.description || null,
        is_active: form.is_active,
        created_at: new Date().toISOString()
      }
      mockProductTypes.unshift(newProductType)
      alert('ເພີ່ມປະເພດສິນຄ້າສຳເລັດ!')
    }

    closeModal()

  } catch (error) {
    console.error('Error saving product type:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກປະເພດສິນຄ້າ')
  } finally {
    isLoading.value = false
  }
}

// Delete product type
const deleteProductType = (productTypeId: number) => {
  if (confirm('ຕ້ອງການລຶບປະເພດສິນຄ້ານີ້ບໍ?')) {
    const index = mockProductTypes.findIndex(pt => pt.id === productTypeId)
    if (index !== -1) {
      mockProductTypes.splice(index, 1)
      alert('ລຶບປະເພດສິນຄ້າສຳເລັດ!')
    }
  }
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

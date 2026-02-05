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
        <span class="icon-[tabler--category-plus] size-5 mr-1"></span>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useProductTypeStore } from '@/stores/productType'

// Types
interface ProductTypeForm {
  type_name: string
  description: string | null
  is_active: number
}

// Store
const productTypeStore = useProductTypeStore()

// Modal state
const showModal = ref(false)
const editingProductType = ref<ProductType | null>(null)

// Form state
const form = reactive({
  type_name: '',
  description: '',
  is_active: 1
})

const errors = reactive({
  type_name: ''
})

// Computed properties (get from store)
const isLoading = computed(() => productTypeStore.isLoading)
const displayedProductTypes = computed(() => productTypeStore.displayedProductTypes)
const totalProductTypes = computed(() => productTypeStore.total)
const totalPages = computed(() => productTypeStore.totalPages)
const startIndex = computed(() => productTypeStore.startIndex)
const endIndex = computed(() => productTypeStore.endIndex)
const hasPreviousPage = computed(() => productTypeStore.hasPreviousPage)
const hasNextPage = computed(() => productTypeStore.hasNextPage)
const currentPage = computed(() => productTypeStore.currentPage)
const pageSize = computed(() => productTypeStore.pageSize)

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
  if (!validateForm()) return

  try {
    if (editingProductType.value) {
      // Edit mode
      await productTypeStore.updateProductType(editingProductType.value.id, {
        type_name: form.type_name,
        description: form.description || null,
        is_active: form.is_active
      })
      alert('ແກ້ໄຂປະເພດສິນຄ້າສຳເລັດ!')
    } else {
      // Create mode
      await productTypeStore.createProductType({
        type_name: form.type_name,
        description: form.description || null,
        is_active: form.is_active
      })
      alert('ເພີ່ມປະເພດສິນຄ້າສຳເລັດ!')
    }
    closeModal()
  } catch (error) {
    console.error('Error saving product type:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກປະເພດສິນຄ້າ')
  }
}

// Delete product type
const deleteProductType = async (productTypeId: number) => {
  if (confirm('ຕ້ອງການລຶບປະເພດສິນຄ້ານີ້ບໍ?')) {
    try {
      await productTypeStore.deleteProductType(productTypeId)
      alert('ລຶບປະເພດສິນຄ້າສຳເລັດ!')
    } catch (error) {
      console.error('Error deleting product type:', error)
      alert('ເກີດຂໍ້ຜິດພາດການລຶບປະເພດສິນຄ້າ')
    }
  }
}

// Pagination methods
const previousPage = () => {
  if (hasPreviousPage.value) {
    productTypeStore.changePage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    productTypeStore.changePage(currentPage.value + 1)
  }
}

const handlePageSizeChange = (newSize: number) => {
  productTypeStore.changePageSize(newSize)
}

// Initial fetch
onMounted(() => {
  productTypeStore.fetchProductTypes()
})
</script>

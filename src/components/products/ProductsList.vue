<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການສິນຄ້າ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຂໍ້ມູນສິນຄ້າທັງໝົດ</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto relative">
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
          class="input input-bordered w-full max-w-xs pr-10" @input="debounceSearch" />

        <button v-if="searchQuery" @click="clearSearch"
          class="btn btn-circle btn-ghost btn-sm absolute right-[140px] top-1/2 transform -translate-y-1/2"
          aria-label="ລ້າງການຄົ້ນຫາ">
          <span class="icon-[tabler--x] size-4"></span>
        </button>

        <button @click="openAddProductModal" class="btn btn-gradient btn-primary whitespace-nowrap">
          <span class="icon-[tabler--shopping-bag-plus] size-5 mr-1"></span>
          ເພີ່ມສິນຄ້າໃໝ່
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <select v-model="statusFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດສະຖານະ</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <select v-model="typeFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດປະເພດ</option>
        <option v-for="type in productTypes" :key="type.id" :value="type.id.toString()">
          {{ type.type_name }}
        </option>
      </select>

      <select v-model.number="localPageSize" class="select select-bordered w-full sm:w-auto" @change="changePageSize">
        <option :value="10">10 ຕໍ່ໜ້າ</option>
        <option :value="25">25 ຕໍ່ໜ້າ</option>
        <option :value="50">50 ຕໍ່ໜ້າ</option>
      </select>
    </div>

    <div v-if="selectedRows.length > 0" class="flex gap-2 mb-4 text-sm bg-base-200 p-2 rounded-lg items-center">
      <span class="text-gray-600 font-medium ml-2 mr-4">
        ເລືອກ {{ selectedRows.length }} ລາຍການ:
      </span>

      <button v-if="hasInactiveSelected" class="btn btn-sm btn-success" @click="confirmBulkToggle(true)">
        <span class="icon-[tabler--check] size-4"></span> ເປີດໃຊ້ງານທີ່ເລືອກ
      </button>

      <button v-if="hasActiveSelected" class="btn btn-sm btn-error" @click="confirmBulkToggle(false)">
        <span class="icon-[tabler--x] size-4"></span> ປິດໃຊ້ງານທີ່ເລືອກ
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th class="w-10">
              <input type="checkbox" class="checkbox" :checked="allRowsSelected" :indeterminate.prop="someRowsSelected"
                @change="toggleAllRows" />
            </th>
            <th>ຮູບພາບ</th>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ປະເພດສິນຄ້າ</th>
            <th>ລາຄາ</th>
            <th>ດອກເບ້ຍ (%)</th>
            <th>ສະຖານະ</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in displayedProducts" :key="product.id">
            <td class="w-10">
              <input type="checkbox" class="checkbox" :checked="selectedRows.includes(product.id)"
                @change="toggleRow(product.id)" />
            </td>

            <td class="text-center">
              <div v-if="product.image_url"
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img :src="product.image_url" alt="Product image" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span class="icon-[tabler--box] size-6 text-gray-400"></span>
              </div>
            </td>

            <td class="font-medium">{{ product.product_name }}</td>

            <td>
              <span class="badge badge-soft badge-primary text-xs">
                {{ getProductTypeName(product.productType_id) }}
              </span>
            </td>

            <td class="font-medium">{{ formatPrice(product.price) }}</td>

            <td>{{ product.interest_rate }}%</td>

            <td>
              <span class="badge badge-soft" :class="product.is_active ? 'badge-success' : 'badge-error'">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="openEditProductModal(product as any)"
                  aria-label="Edit product">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <button class="btn btn-circle btn-text btn-sm"
                  :class="product.is_active ? 'text-error' : 'text-success'" @click="toggleProductStatus(product as any)"
                  aria-label="Toggle status">
                  <span :class="product.is_active ? 'icon-[tabler--toggle-left]' : 'icon-[tabler--toggle-right]'"
                    class="size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedProducts.length === 0">
            <td colspan="8" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນສິນຄ້າ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalProducts }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
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

      <div v-if="selectedRows.length > 0" class="text-primary font-medium">
      </div>
    </div>

    <teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4">
            {{ productToToggle?.is_active ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ
            {{ productToToggle?.is_active ? 'ປິດ' : 'ເປີດ' }}
            ການຂາຍ "{{ productToToggle?.product_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showStatusModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn" :class="productToToggle?.is_active ? 'btn-error' : 'btn-success'"
              @click="confirmToggleStatus">
              {{ productToToggle?.is_active ? 'ປິດການຂາຍ' : 'ເປີດການຂາຍ' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">
              {{ editingProduct ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <form @submit.prevent="saveProduct" class="space-y-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຮູບພາບຫຼັກ *</span>
              </label>
              <div class="flex flex-col sm:flex-row gap-6">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full sm:w-48 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  @click="triggerFileInput">
                  <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"
                    class="hidden" @change="handleFileUpload" />

                  <div v-if="!form.image_url" class="text-center">
                    <span class="icon-[tabler--photo] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-400 mt-1">JPG, PNG (ສູງສຸດ 2MB)</p>
                  </div>

                  <img v-else :src="form.image_url" alt="Product preview"
                    class="w-full h-full object-contain rounded" />
                </div>

                <div class="flex-1">
                  <div class="space-y-2">
                    <p class="text-sm font-medium">ຂໍ້ມູນໄຟລ໌:</p>
                    <div v-if="imageFileInfo.name" class="text-sm text-gray-600 dark:text-gray-400">
                      <p>✓ ອັບໂຫຼດສຳເລັດ</p>
                      <p>ປະເພດ: {{ imageFileInfo.type || '-' }}</p>
                      <p>ຂະໜາດ: {{ formatFileSize(imageFileInfo.size || 0) }}</p>
                      <button type="button" class="text-error text-sm mt-2 hover:underline" @click="removeImage">
                        ລຶບອອກ
                      </button>
                    </div>
                    <p v-else class="text-sm text-gray-500">
                      ບໍ່ມີໄຟລ໌ຮູບພາບ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຊື່ສິນຄ້າ *</span>
              </label>
              <input v-model="form.product_name" type="text" placeholder="ປ້ອນຊື່ສິນຄ້າ"
                class="input input-bordered w-full" :class="{ 'input-error': errors.product_name }" required />
              <label v-if="errors.product_name" class="label text-error">
                <span class="label-text-alt">{{ errors.product_name }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ປະເພດສິນຄ້າ *</span>
              </label>
              <select v-model="form.productType_id" class="select select-bordered w-full"
                :class="{ 'select-error': errors.productType_id }" required>
                <option value="0" disabled selected>ເລືອກປະເພດສິນຄ້າ</option>
                <option v-for="type in productTypes" :key="type.id" :value="type.id">
                  {{ type.type_name }}
                </option>
              </select>
              <label v-if="errors.productType_id" class="label text-error">
                <span class="label-text-alt">{{ errors.productType_id }}</span>
              </label>
            </div>

            <div class="form-control">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex-1 space-y-2">
                  <label class="label">
                    <span class="label-text font-medium">ຍີ່ຫໍ້ *</span>
                  </label>
                  <input v-model="form.product_brand" type="text" placeholder="ປ້ອນຊື່ຍີ່ຫໍ້"
                    class="input input-bordered w-full" :class="{ 'input-error': errors.product_brand }" required />
                  <label v-if="errors.product_brand" class="label text-error">
                    <span class="label-text-alt">{{ errors.product_brand }}</span>
                  </label>
                </div>

                <div class="flex-1 space-y-2">
                  <label class="label">
                    <span class="label-text font-medium">ລຸ້ນສິນຄ້າ *</span>
                  </label>
                  <input v-model="form.product_model" type="text" placeholder="ປ້ອນລຸ້ນສິນຄ້າ"
                    class="input input-bordered w-full" :class="{ 'input-error': errors.product_model }" required />
                  <label v-if="errors.product_model" class="label text-error">
                    <span class="label-text-alt">{{ errors.product_model }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ລາຄາ (ກີບ) *</span>
              </label>
              <input v-model.number="form.price" type="number" placeholder="ປ້ອນລາຄາ"
                class="input input-bordered w-full" :class="{ 'input-error': errors.price }" min="0" step="0.01"
                required />
              <label v-if="errors.price" class="label text-error">
                <span class="label-text-alt">{{ errors.price }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ດອກເບ້ຍ (%) *</span>
              </label>
              <input v-model.number="form.interest_rate" type="number" placeholder="ປ້ອນດອກເບ້ຍ"
                class="input input-bordered w-full" :class="{ 'input-error': errors.interest_rate }" min="0" max="100"
                step="0.01" required />
              <label v-if="errors.interest_rate" class="label text-error">
                <span class="label-text-alt">{{ errors.interest_rate }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຮູບພາບເພີ່ມເຕີມ</span>
              </label>

              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 min-h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                @dragover.prevent @dragenter.prevent @drop.prevent="handleGalleryDrop" @click="triggerGalleryInput">
                <input ref="galleryInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden"
                  @change="handleGalleryUpload" />

                <div class="text-center">
                  <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                  <p class="text-sm text-gray-500">ລາກແລະວາງໄຟລ໌ ຫຼື ຄລິກເພື່ອເລືອກ</p>
                  <p class="text-xs text-gray-400 mt-1">JPG, PNG (ສູງສຸດ 2MB ຕໍ່ໄຟລ໌)</p>
                </div>
              </div>

              <div v-if="form.gallery.length > 0" class="mt-4">
                <div class="flex flex-wrap gap-3">
                  <div v-for="(image, index) in form.gallery" :key="index"
                    class="relative w-24 h-24 rounded border border-gray-300 overflow-hidden group">
                    <img :src="getGalleryImageUrl(image)" :alt="`Gallery ${index + 1}`"
                      class="w-full h-full object-cover" @error="handleImageError">
                    <button type="button"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="removeGalleryImage(index)">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-4">
                <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0"
                  class="toggle toggle-primary" />
                <span class="label-text font-medium">ສະຖານະສິນຄ້າ (Active/Inactive)</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" @click="closeModal" class="btn btn-soft btn-secondary">
                ຍົກເລີກ
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                <span v-else>{{ editingProduct ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/utils/formatters'
import { ref, reactive, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { getFullImageUrl } from '@/utils/url'
import { alert } from '@/utils/alert'
import type { Product, ProductType } from '@/types/product'

interface ImageFileInfo {
  name: string
  type: string
  size: number
}

// Stores
const productStore = useProductStore()
const shopStore = useShopStore()

// Modal state
const showModal = ref(false)
const showStatusModal = ref(false)
const editingProduct = ref<Product | null>(null)
const productToToggle = ref<Product | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

// Filter states
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const localPageSize = ref(10)

// Form state
const form = reactive({
  product_name: '',
  product_brand: '',
  product_model: '',
  productType_id: 0,
  price: 0,
  interest_rate: 0,
  image_url: '',
  gallery: [] as string[],
  is_active: 1
})

const errors = reactive({
  product_name: '',
  product_brand: '',
  product_model: '',
  productType_id: '',
  price: '',
  interest_rate: ''
})

const imageFileInfo = reactive<ImageFileInfo>({
  name: '',
  type: '',
  size: 0
})

// =====================================
// 🟢 SECTION: Checkbox & Multi Selection
// =====================================
const selectedRows = ref<number[]>([])

const allRowsSelected = computed(() => {
  return displayedProducts.value.length > 0 &&
    displayedProducts.value.every(product => selectedRows.value.includes(product.id))
})

const someRowsSelected = computed(() => {
  return selectedRows.value.length > 0 && !allRowsSelected.value
})

const hasInactiveSelected = computed(() => {
  return selectedRows.value.some(id => {
    const product = displayedProducts.value.find(p => p.id === id);
    // 🟢 ແກ້ໄຂ: ປຽບທຽບກັບ 0 ເທົ່ານັ້ນ
    return product && product.is_active === 0;
  });
});

const hasActiveSelected = computed(() => {
  return selectedRows.value.some(id => {
    const product = displayedProducts.value.find(p => p.id === id);
    // 🟢 ແກ້ໄຂ: ປຽບທຽບກັບ 1 ເທົ່ານັ້ນ
    return product && product.is_active === 1;
  });
});

const toggleAllRows = () => {
  if (allRowsSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      id => !displayedProducts.value.some(product => product.id === id)
    )
  } else {
    const newSelections = displayedProducts.value.map(product => product.id)
    selectedRows.value = [...new Set([...selectedRows.value, ...newSelections])]
  }
}

const toggleRow = (productId: number) => {
  const index = selectedRows.value.indexOf(productId)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(productId)
  }
}

// Computed properties (get from store)
const isLoading = computed(() => productStore.isLoading)
const displayedProducts = computed(() => productStore.displayedProductsWithFullUrls)
const totalProducts = computed(() => productStore.total)
const totalPages = computed(() => productStore.totalPages)
const startIndex = computed(() => productStore.startIndex)
const endIndex = computed(() => productStore.endIndex)
const hasPreviousPage = computed(() => productStore.hasPreviousPage)
const hasNextPage = computed(() => productStore.hasNextPage)
const currentPage = computed(() => productStore.currentPage)
const pageSize = computed(() => productStore.pageSize)
const productTypes = computed(() => productStore.productTypes)

// =====================================
// 🟢 SECTION: Utilities
// =====================================
const isBase64 = (str: string): boolean => {
  return str.startsWith('data:') || str.startsWith('data:image/')
}

const getGalleryImageUrl = (url: string): string => {
  if (!url) return ''
  if (isBase64(url)) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return getFullImageUrl(url) || ''
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (!isBase64(target.src)) {
    target.src = '/images/placeholder.png'
  }
}

const getProductTypeName = (productTypeId: number): string => {
  const type = productTypes.value.find(t => t.id === Number(productTypeId))
  return type ? type.type_name : `Type ID: ${productTypeId}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  let isValid = true

  if (!form.product_name.trim()) { errors.product_name = 'ກະລຸນາປ້ອນຊື່ສິນຄ້າ'; isValid = false }
  if (!form.product_brand.trim()) { errors.product_brand = 'ກະລຸນາປ້ອນຊື່ຍີ່ຫໍ້'; isValid = false }
  if (!form.product_model.trim()) { errors.product_model = 'ກະລຸນາປ້ອນລຸ້ນສິນຄ້າ'; isValid = false }
  if (form.productType_id <= 0) { errors.productType_id = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'; isValid = false }
  if (form.price <= 0) { errors.price = 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }
  if (form.interest_rate < 0 || form.interest_rate > 100) { errors.interest_rate = 'ດອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'; isValid = false }

  return isValid
}

// =====================================
// 🟢 SECTION: Filters & Pagination (ແກ້ໄຂໃໝ່)
// =====================================
const applyFilters = () => {
  selectedRows.value = [] // ລ້າງການເລືອກເມື່ອມີການ Filter
  productStore.changePage(1)

  // ✅ FIX: Get currentShop from the store directly
  const currentShopId = shopStore.currentShop?.id;

  if (!currentShopId) {
     alert.error('Error', 'Shop not found. Please refresh the page.');
     return;
  }

  productStore.fetchProducts({
    shop_id: currentShopId,
    page: 1,
    limit: localPageSize.value,
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

const changePageSize = () => {
  selectedRows.value = [] // ລ້າງການເລືອກ
  productStore.changePageSize(localPageSize.value)

  // ✅ FIX: Get currentShop from the store directly
  const currentShopId = shopStore.currentShop?.id;

  if (!currentShopId) {
     alert.error('Error', 'Shop not found. Please refresh the page.');
     return;
  }

  productStore.fetchProducts({
    shop_id: currentShopId,
    page: 1,
    limit: localPageSize.value,
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  applyFilters()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    applyFilters()
  }, 300)
}

const previousPage = () => {
  if (hasPreviousPage.value) {
    selectedRows.value = [] // ລ້າງການເລືອກ
    productStore.changePage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    selectedRows.value = [] // ລ້າງການເລືອກ
    productStore.changePage(currentPage.value + 1)
  }
}


// =====================================
// 🟢 SECTION: Modals & Actions
// =====================================
const openAddProductModal = () => {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

const openEditProductModal = async (product: Product) => {
  editingProduct.value = product
  try {
    const gallery = await productStore.fetchProductGallery(product.id)
    form.product_name = product.product_name
    form.product_brand = product.brand
    form.product_model = product.model
    form.productType_id = product.productType_id
    form.price = Number(product.price)
    form.interest_rate = Number(product.interest_rate)
    form.image_url = product.image_url || ''
    form.gallery = gallery.map((item: any) => item.image_url) || []
    form.is_active = product.is_active ? 1 : 0 // Ensure number for checkbox

    if (product.image_url) {
      imageFileInfo.name = 'product-image.jpg'
      imageFileInfo.type = 'image/jpeg'
      imageFileInfo.size = 0
    }
  } catch (error) {
    console.error('❌ Error loading gallery:', error)
    form.product_name = product.product_name
    form.product_brand = product.brand
    form.product_model = product.model
    form.productType_id = product.productType_id
    form.price = Number(product.price)
    form.interest_rate = Number(product.interest_rate)
    form.image_url = product.image_url || ''
    form.gallery = (product.gallery?.map(item => item.image_url)) || []
    form.is_active = product.is_active ? 1 : 0
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const resetForm = () => {
  form.product_name = ''
  form.product_brand = ''
  form.product_model = ''
  form.productType_id = 0
  form.price = 0
  form.interest_rate = 0
  form.image_url = ''
  form.gallery = []
  form.is_active = 1

  imageFileInfo.name = ''
  imageFileInfo.type = ''
  imageFileInfo.size = 0

  if (fileInput.value) fileInput.value.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
}

const toggleProductStatus = (product: Product) => {
  productToToggle.value = product
  showStatusModal.value = true
}

const confirmToggleStatus = async () => {
  if (productToToggle.value) {
    // 🟢 ແກ້ໄຂ: ທຽບກັບ 1
    const isDeactivating = productToToggle.value.is_active === 1;
    try {
      const newStatus = isDeactivating ? 0 : 1;
      const newStatusBool = !isDeactivating; // Convert to boolean for the store method
      await productStore.toggleProductStatus(productToToggle.value.id, newStatusBool)
      alert.success('ປ່ຽນສະຖານະສຳເລັດ!')
      productToToggle.value.is_active = newStatus as any
      await applyFilters() // ດຶງຂໍ້ມູນໃໝ່ຫຼັງຈາກປ່ຽນສຳເລັດ
    } catch (error: any) {
      alert.error('ເກີດຂໍ້ຜິດພາດການປ່ຽນສະຖານະ')
    }
  }
  showStatusModal.value = false
  productToToggle.value = null
}

const confirmBulkToggle = async (isActive: boolean) => {
  const actionText = isActive ? 'ເປີດການໃຊ້ງານ' : 'ປິດການໃຊ້ງານ'

  const confirm = await alert.confirm(
    `ຢືນຢັນການ${actionText}`,
    `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ${actionText}ສິນຄ້າທີ່ເລືອກໄວ້ຈຳນວນ ${selectedRows.value.length} ລາຍການ?`,
    'ຢືນຢັນ',
    'ຍົກເລີກ'
  )

  if (confirm) {
    try {
      await productStore.toggleMultipleStatus(selectedRows.value, isActive)
      alert.success(`${actionText}ສຳເລັດ!`)
      applyFilters() // ດຶງຂໍ້ມູນໃໝ່ ແລະ ລ້າງ selectedRows ອັດຕະໂນມັດໃນ applyFilters
    } catch (error) {
      alert.error(`ເກີດຂໍ້ຜິດພາດໃນການ${actionText}`)
    }
  }
}

const saveProduct = async () => {
  if (!validateForm()) return
  loading.value = true

  try {
    let productId: number

    const currentShopId = shopStore.currentShop?.id;
    if(!currentShopId) throw new Error("Shop ID not found");

    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, {
        product_name: form.product_name,
        brand: form.product_brand,
        model: form.product_model,
        productType_id: form.productType_id,
        price: form.price,
        interest_rate: form.interest_rate,
        is_active: form.is_active
      })
      productId = editingProduct.value.id
    } else {
      const newProduct = await productStore.createProduct({
        product_name: form.product_name,
        brand: form.product_brand,
        model: form.product_model,
        productType_id: form.productType_id,
        price: form.price,
        interest_rate: form.interest_rate,
        is_active: form.is_active,
        shop_id: currentShopId // ✅ Make sure shop_id is passed when creating
      } as any)
      productId = newProduct.id
    }

    if (form.image_url && !form.image_url.startsWith('http')) {
      try {
        const base64Response = await fetch(form.image_url)
        const blob = await base64Response.blob()
        if (blob.size < 1024) throw new Error('Image file too small')
        const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' })
        await productStore.uploadProductImage(productId, file)
      } catch (error) {
        console.error('Error uploading main image:', error)
      }
    }

    const newGalleryImages = form.gallery.filter(img => !img.startsWith('http'))
    if (newGalleryImages.length > 0) {
      try {
        const galleryFiles = await Promise.all(
          newGalleryImages.map(async (img, index) => {
            const response = await fetch(img)
            const blob = await response.blob()
            if (blob.size < 1024) throw new Error(`Image ${index} too small`)
            const timestamp = Date.now()
            const filename = `gallery-${timestamp}-${index}.jpg`
            return new File([blob], filename, { type: 'image/jpeg' })
          })
        )
        const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)
        if (uploadGalleryResp.success) {
          const uploadedUrls = uploadGalleryResp.data.uploaded || []
          if (uploadedUrls.length > 0) {
            const existingUrls = form.gallery.filter(img => img.startsWith('http'))
            const allGalleryUrls = [
              ...existingUrls.map(url => ({ file_url: url })),
              ...uploadedUrls.map((img: any) => ({ file_url: img.file_url }))
            ]
            await productStore.addProductGallery(productId, allGalleryUrls)
          }
        }
      } catch (error: any) {
        console.error('❌ Error in gallery upload:', error)
      }
    } else if (form.gallery.length > 0) {
      try {
        const existingUrls = form.gallery.filter(img => img.startsWith('http')).map(url => ({ file_url: url }))
        if (existingUrls.length > 0) {
          await productStore.addProductGallery(productId, existingUrls)
        }
      } catch (error) {
        console.error('Error syncing existing gallery:', error)
      }
    }

    const message = editingProduct.value ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!' : 'ເພີ້ມສິນຄ້າສຳເລັດ!'
    alert.success(message)
    closeModal()
    await applyFilters() // ດຶງຂໍ້ມູນໃໝ່ຫຼັງຈາກບັນທຶກ

  } catch (error) {
    console.error('Error saving product:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກສິນຄ້າ')
  } finally {
    loading.value = false
  }
}

// File upload handlers
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      target.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
      target.value = ''
      return
    }
    if (file.size < 1024) {
      alert.error('ໄຟລ໌ມີຂະໜາດນ້ອຍເກີນໄປ ອາດເປັນໄຟລ໌ເສຍ')
      target.value = ''
      return
    }
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (!result.startsWith('data:image/')) {
          alert.error('ໄຟລ໌ບໍ່ແມ່ນຮູບພາບທີ່ຖືກຕ້ອງ')
          target.value = ''
          return
        }
        form.image_url = result
        imageFileInfo.name = file.name
        imageFileInfo.type = file.type
        imageFileInfo.size = file.size
      }
      reader.onerror = () => {
        alert.error('ເກີດຂໍ້ຜິດພາດໃນການອ່ານໄຟລ໌')
        target.value = ''
      }
      reader.readAsDataURL(file)
    } catch (error) {
      alert.error('ເກີດຂໍ້ຜິດພາດໃນການອ່ານໄຟລ໌')
      target.value = ''
    }
  }
}

const removeImage = () => {
  form.image_url = ''
  imageFileInfo.name = ''
  imageFileInfo.type = ''
  imageFileInfo.size = 0
  if (fileInput.value) fileInput.value.value = ''
}

// Gallery handlers
const triggerGalleryInput = () => {
  if (galleryInput.value) galleryInput.value.click()
}

const handleGalleryUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processGalleryFiles(files)
}

const handleGalleryDrop = async (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || [])
  await processGalleryFiles(files)
}

const processGalleryFiles = async (files: File[]) => {
  const validImages: string[] = []
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) {
      alert.error(`ໄຟລ໌ ${file.name} ຂະໜາດໃຫຍ່ກວ່າ 2MB`)
      continue
    }
    if (!file.type.startsWith('image/')) {
      alert.error(`ໄຟລ໌ ${file.name} ບໍ່ແມ່ນໄຟລ໌ຮູບພາບ`)
      continue
    }
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          if (!result.startsWith('data:image/')) {
            reject(new Error('Not a valid image'))
            return
          }
          resolve(result)
        }
        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsDataURL(file)
      })
      validImages.push(base64)
    } catch (error) {
      alert.error(`ໄຟລ໌ ${file.name} ບໍ່ສາມາດອ່ານໄດ້`)
    }
  }
  form.gallery.push(...validImages)
  if (galleryInput.value) {
    galleryInput.value.value = ''
  }
}

const removeGalleryImage = (index: number) => {
  form.gallery.splice(index, 1)
}

onMounted(async () => {
  try {
    // ✅ ขั้น 1: โหลดข้อมูลร้านค้าปัจจุบันก่อน
    await shopStore.fetchCurrentShop()

    const currentShop = shopStore.currentShop

    if (!currentShop || !currentShop.id) {
      alert.error('ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າ', 'ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ')
      console.error('❌ No current shop available')
      return
    }

    console.log('✅ Current shop loaded:', {
      id: currentShop.id,
      name: currentShop.shop_name
    })

    // ✅ ขั้น 2: โหลดสินค้าของร้านค้านั้น โดยใช้ shop_id
    await Promise.all([
      productStore.fetchProducts({
        shop_id: currentShop.id,
        page: 1,
        limit: localPageSize.value
      }),
      productStore.fetchProductTypes()
    ])

  } catch (error) {
    console.error('Error initializing product page:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດບໍໂຫຼດຂໍ້ມູນໄດ້')
  }
})
</script>

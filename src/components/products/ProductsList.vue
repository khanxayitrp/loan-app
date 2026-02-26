<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການສິນຄ້າ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການຂໍ້ມູນສິນຄ້າທັງໝົດ</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
          class="input input-bordered w-full max-w-xs" @input="debounceSearch" />
        <!-- ✅ ปุ่มล้างการค้นหา -->
        <button v-if="searchQuery" @click="clearSearch" class="btn btn-circle btn-ghost btn-sm"
          aria-label="ล้างการค้นหา">
          <span class="icon-[tabler--x] size-4"></span>
        </button>
        <button @click="openAddProductModal" class="btn btn-gradient btn-primary whitespace-nowrap">
          <span class="icon-[tabler--shopping-bag-plus] size-5 mr-1"></span>
          ເພີ່ມສິນຄ້າໃໝ່
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- Status Filter -->
      <select v-model="statusFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດສະຖານະ</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <!-- Product Type Filter -->
      <select v-model="typeFilter" class="select select-bordered w-full sm:w-auto" @change="applyFilters">
        <option value="">ທັງໝົດປະເພດ</option>
        <option v-for="type in productTypes" :key="type.id" :value="type.id.toString()">
          {{ type.type_name }}
        </option>
      </select>

      <!-- ✅ Page Size Selector -->
      <select v-model.number="localPageSize" class="select select-bordered w-full sm:w-auto" @change="changePageSize">
        <option :value="10">10 ຕໍ່ໜ້າ</option>
        <option :value="25">25 ຕໍ່ໜ້າ</option>
        <option :value="50">50 ຕໍ່ໜ້າ</option>
      </select>
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
            <!-- Image -->
            <td class="text-center">
              <div v-if="product.image_url"
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img :src="product.image_url" alt="Product image" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span class="icon-[tabler--box] size-6 text-gray-400"></span>
              </div>
            </td>

            <!-- Product Name -->
            <td class="font-medium">{{ product.product_name }}</td>

            <!-- Product Type -->
            <td>
              <span class="badge badge-soft badge-primary text-xs">
                {{ getProductTypeName(product.productType_id) }}
              </span>
            </td>

            <!-- Price -->
            <td class="font-medium">{{ formatPrice(product.price) }}</td>

            <!-- Interest Rate -->
            <td>{{ product.interest_rate }}%</td>

            <!-- Status -->
            <td>
              <span class="badge badge-soft" :class="product.is_active ? 'badge-success' : 'badge-error'">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="openEditProductModal(product)"
                  aria-label="Edit product">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <!-- Toggle Status Button -->
                <button class="btn btn-circle btn-text btn-sm"
                  :class="product.is_active ? 'text-error' : 'text-success'" @click="toggleProductStatus(product)"
                  aria-label="Toggle status">
                  <span :class="product.is_active ? 'icon-[tabler--toggle-left]' : 'icon-[tabler--toggle-right]'"
                    class="size-4"></span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="displayedProducts.length === 0">
            <td colspan="7" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນສິນຄ້າ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
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
    </div>

    <!-- Status Toggle Modal -->
    <teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4">
            {{ productToToggle?.is_active === true ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ
            {{ productToToggle?.is_active === true ? 'ປິດ' : 'ເປີດ' }}
            ການຂາຍ "{{ productToToggle?.product_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-soft btn-secondary" @click="showStatusModal = false">
              ຍົກເລີກ
            </button>
            <button class="btn" :class="productToToggle?.is_active === true ? 'btn-error' : 'btn-success'"
              @click="confirmToggleStatus">
              {{ productToToggle?.is_active === true ? 'ປິດການຂາຍ' : 'ເປີດການຂາຍ' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Add/Edit Product Modal -->
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
            <!-- Main Image Upload -->
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

            <!-- Product Name -->
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

            <!-- Product Type Selection -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ປະເພດສິນຄ້າ *</span>
              </label>
              <select v-model="form.productType_id" class="select select-bordered w-full"
                :class="{ 'select-error': errors.productType_id }" required>
                <option value="" disabled selected>ເລືອກປະເພດສິນຄ້າ</option>
                <option v-for="type in productTypes" :key="type.id" :value="type.id">
                  {{ type.type_name }}
                </option>
              </select>
              <label v-if="errors.productType_id" class="label text-error">
                <span class="label-text-alt">{{ errors.productType_id }}</span>
              </label>
            </div>

            <!-- Brand & Model -->
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

            <!-- Price -->
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

            <!-- Interest Rate -->
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

            <!-- Gallery Images (Drag & Drop) -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ຮູບພາບເພີ່ມເຕີມ</span>
              </label>

              <!-- Drag & Drop Area -->
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

              <!-- Gallery Preview -->
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

            <!-- Status -->
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { getFullImageUrl } from '@/utils/url'

// ✅ เพิ่ม Type Import
interface Product {
  id: number
  product_name: string
  brand: string
  model: string
  productType_id: number
  price: number
  interest_rate: number
  image_url: string
  is_active: boolean | number
  gallery?: string[]
}

interface ProductType {
  id: number
  type_name: string
}

interface ImageFileInfo {
  name: string
  type: string
  size: number
}

// Store
const productStore = useProductStore()

// Modal state
const showModal = ref(false)
const showStatusModal = ref(false)
const editingProduct = ref<Product | null>(null)
const productToToggle = ref<Product | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

// Filter states
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const localPageSize = ref(10) // ✅ เปลี่ยนจาก computed เป็น ref

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

// ✅ Image File Info
const imageFileInfo = reactive<ImageFileInfo>({
  name: '',
  type: '',
  size: 0
})

// Loading state
const loading = ref(false)

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

// ✅ ตรวจสอบ Base64
const isBase64 = (str: string): boolean => {
  return str.startsWith('data:') || str.startsWith('data:image/')
}

// ✅ แสดงรูปภาพ Gallery
const getGalleryImageUrl = (url: string): string => {
  if (!url) return ''
  if (isBase64(url)) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return getFullImageUrl(url)
}

// ✅ จัดการรูปภาพ Error
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (!isBase64(target.src)) {
    target.src = '/images/placeholder.png'
  }
}

// Utility functions
const getProductTypeName = (productTypeId: number): string => {
  const type = productTypes.value.find(t => t.id === productTypeId)
  return type ? type.type_name : `Type ID: ${productTypeId}`
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'currency',
    currency: 'LAK'
  }).format(price)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validation
const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.product_name.trim()) {
    errors.product_name = 'ກະລຸນາປ້ອນຊື່ສິນຄ້າ'
    isValid = false
  }

  if (!form.product_brand.trim()) {
    errors.product_brand = 'ກະລຸນາປ້ອນຊື່ຍີ່ຫໍ້'
    isValid = false
  }

  if (!form.product_model.trim()) {
    errors.product_model = 'ກະລຸນາປ້ອນລຸ້ນສິນຄ້າ'
    isValid = false
  }

  if (form.productType_id <= 0) {
    errors.productType_id = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'
    isValid = false
  }

  if (form.price <= 0) {
    errors.price = 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0'
    isValid = false
  }

  if (form.interest_rate < 0 || form.interest_rate > 100) {
    errors.interest_rate = 'ດອກເບ້ຍຕ້ອງຢູ່ລະຫວ່າງ 0-100%'
    isValid = false
  }

  return isValid
}

// Modal functions
const openAddProductModal = () => {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

const openEditProductModal = async (product: Product) => {
  editingProduct.value = product
  try {
    const gallery = await productStore.fetchProductGallery(product.id)
    console.log('📸 Gallery loaded:', gallery)

    form.product_name = product.product_name
    form.product_brand = product.brand
    form.product_model = product.model
    form.productType_id = product.productType_id
    form.price = product.price
    form.interest_rate = product.interest_rate
    form.image_url = product.image_url || ''
    form.gallery = gallery.map((item: any) => item.image_url) || []
    form.is_active = product.is_active

    // ✅ ตั้งค่า imageFileInfo ถ้ามีรูป
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
    form.price = product.price
    form.interest_rate = product.interest_rate
    form.image_url = product.image_url || ''
    form.gallery = product.gallery || []
    form.is_active = product.is_active
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

  // ✅ Reset imageFileInfo
  imageFileInfo.name = ''
  imageFileInfo.type = ''
  imageFileInfo.size = 0

  if (fileInput.value) fileInput.value.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
}

// Status toggle functions
const toggleProductStatus = (product: Product) => {
  productToToggle.value = product
  showStatusModal.value = true
}

const confirmToggleStatus = async () => {
  if (productToToggle.value) {
    try {
      console.log("before change ", productToToggle.value.is_active)
      const newStatus = productToToggle.value.is_active === true || productToToggle.value.is_active === 1 ? 0 : 1
      console.log("after change ", newStatus)

      await productStore.toggleProductStatus(
        productToToggle.value.id,
        newStatus
      )

      await productStore.fetchProducts({
        page: currentPage.value,
        limit: pageSize.value
      })

      alert('ປ່ຽນສະຖານະສຳເລັດ!')
      productToToggle.value.is_active = newStatus
    } catch (error) {
      alert('ເກີດຂໍ້ຜິດພາດການປ່ຽນສະຖານະ')
    }
  }
  showStatusModal.value = false
  productToToggle.value = null
}

// File upload handlers
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // ✅ ตั้งค่า imageFileInfo

    // ✅ 1. ตรวจสอบขนาดไฟล์ (สูงสุด 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      target.value = '' // ✅ รีเซ็ต input
      return
    }

    // ✅ 2. ตรวจสอบ MIME Type
    if (!file.type.startsWith('image/')) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
      target.value = '' // ✅ รีเซ็ต input
      return
    }

    // ✅ 3. ตรวจสอบขนาดไฟล์ขั้นต่ำ (ต้องมากกว่า 1KB)
    if (file.size < 1024) {
      alert('ໄຟລ໌ມີຂະໜາດນ້ອຍເກີນໄປ ອາດເປັນໄຟລ໌ເສຍ')
      target.value = '' // ✅ รีเซ็ต input
      return
    }
    // ✅ 4. อ่านไฟล์ด้วย FileReader
    try {
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string

        // ✅ 5. ตรวจสอบว่าเป็น Base64 Image จริง
        if (!result.startsWith('data:image/')) {
          alert('ໄຟລ໌ບໍ່ແມ່ນຮູບພາບທີ່ຖືກຕ້ອງ')
          target.value = ''
          return
        }

        // ✅ 6. ตั้งค่า form และ imageFileInfo
        form.image_url = result
        imageFileInfo.name = file.name
        imageFileInfo.type = file.type
        imageFileInfo.size = file.size

        console.log('✅ Image loaded successfully:', {
          name: file.name,
          type: file.type,
          size: file.size
        })
      }

      reader.onerror = () => {
        alert('ເກີດຂໍ້ຜິດພາດໃນການອ່ານໄຟລ໌')
        target.value = ''
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading file:', error)
      alert('ເກີດຂໍ້ຜິດພາດໃນການອ່ານໄຟລ໌')
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
      alert(`ໄຟລ໌ ${file.name} ຂະໜາດໃຫຍ່ກວ່າ 2MB`)
      continue
    }

    if (!file.type.startsWith('image/')) {
      alert(`ໄຟລ໌ ${file.name} ບໍ່ແມ່ນໄຟລ໌ຮູບພາບ`)
      continue
    }

    // ✅ 4. อ่านไฟล์
    try {
      const reader = new FileReader()

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string

          // ✅ 5. ตรวจสอบว่าเป็น Base64 Image จริง
          if (!result.startsWith('data:image/')) {
            reject(new Error('Not a valid image'))
            return
          }

          resolve(result)
        }

        reader.onerror = () => {
          reject(new Error('Error reading file'))
        }

        reader.readAsDataURL(file)
      })

      validImages.push(base64)
      console.log('✅ Gallery image added:', file.name)
    } catch (error) {
      console.error('Error processing gallery image:', file.name, error)
      alert(`ໄຟລ໌ ${file.name} ບໍ່ສາມາດອ່ານໄດ້`)
    }
  }

  form.gallery.push(...validImages)

  // ✅ รีเซ็ต input หลังประมวลผล
  if (galleryInput.value) {
    galleryInput.value.value = ''
  }
}

const removeGalleryImage = (index: number) => {
  form.gallery.splice(index, 1)
}

// ✅ Apply Filters
const applyFilters = () => {
  productStore.fetchProducts({
    page: 1,
    limit: localPageSize.value,
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

// ✅ Change Page Size
const changePageSize = () => {
  productStore.changePageSize(localPageSize.value)
}

// Save product
const saveProduct = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    let productId: number

    if (editingProduct.value) {
      // Edit mode
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
      // Create mode
      const newProduct = await productStore.createProduct({
        product_name: form.product_name,
        brand: form.product_brand,
        model: form.product_model,
        productType_id: form.productType_id,
        price: form.price,
        interest_rate: form.interest_rate,
        is_active: form.is_active
      })
      productId = newProduct.id
    }

    // 2. Handle main image upload
    if (form.image_url && !form.image_url.startsWith('http')) {
      try {
        const base64Response = await fetch(form.image_url)
        const blob = await base64Response.blob()
        // ✅ ตรวจสอบ Blob Size
        if (blob.size < 1024) {
          throw new Error('Image file too small')
        }
        const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' })

        const uploadResp = await productStore.uploadProductImage(productId, file)

        if (uploadResp.success && uploadResp.data?.file_url) {
          await productStore.updateProduct(productId, {
            image_url: uploadResp.data.file_url
          })
        } else {
          console.warn('⚠️ Image upload failed:', uploadResp)
        }
      } catch (error) {
        console.error('Error uploading main image:', error)
      }
    }

    // 3. Handle gallery uploads
    const newGalleryImages = form.gallery.filter(img => !img.startsWith('http'))

    if (newGalleryImages.length > 0) {
      try {
        console.log('📤 Processing new gallery images:', newGalleryImages.length)

        const galleryFiles = await Promise.all(
          newGalleryImages.map(async (img, index) => {
            const response = await fetch(img)
            const blob = await response.blob()

            // ✅ ตรวจสอบ Blob Size
            if (blob.size < 1024) {
              throw new Error(`Image ${index} too small`)
            }
            const timestamp = Date.now()
            const filename = `gallery-${timestamp}-${index}.jpg`
            return new File([blob], filename, { type: 'image/jpeg' })
          })
        )

        console.log('📤 Uploading', galleryFiles.length, 'gallery files')

        const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)

        console.log('📥 Gallery upload response:', uploadGalleryResp)

        if (uploadGalleryResp.success) {
          const uploadedUrls = uploadGalleryResp.data.uploaded || []

          console.log('✅ Uploaded:', uploadedUrls.length, 'files')

          if (uploadGalleryResp.data.failed && uploadGalleryResp.data.failed.length > 0) {
            console.warn('⚠️ Failed uploads:', uploadGalleryResp.data.failed)
            alert(`คำเตือน: ${uploadGalleryResp.data.failed.length} ไฟล์อัพโหลดไม่สำเร็จ`)
          }

          if (uploadedUrls.length > 0) {
            const existingUrls = form.gallery.filter(img => img.startsWith('http'))

            const allGalleryUrls = [
              ...existingUrls.map(url => ({ file_url: url })),
              ...uploadedUrls.map(img => ({ file_url: img.file_url }))
            ]

            console.log('🔄 Syncing total:', allGalleryUrls.length, 'gallery images')
            await productStore.addProductGallery(productId, allGalleryUrls)
            console.log('✅ save Gallery completed')
          }
        } else {
          console.error('❌ Gallery upload failed:', uploadGalleryResp)
          alert('เกิดข้อผิดพลาดในการอัพโหลดรูปแกลเลอรี่')
        }

      } catch (error: any) {
        console.error('❌ Error in gallery upload:', error)
        alert(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถอัพโหลดรูปแกลเลอรี่ได้'}`)
      }
    } else if (form.gallery.length > 0) {
      // ถ้าไม่มีรูปใหม่ แต่มีรูปเก่าอยู่
      try {
        const existingUrls = form.gallery
          .filter(img => img.startsWith('http'))
          .map(url => ({ file_url: url }))

        if (existingUrls.length > 0) {
          console.log('🔄 Syncing existing gallery:', existingUrls.length, 'images')
          await productStore.addProductGallery(productId, existingUrls)
        }
      } catch (error) {
        console.error('Error syncing existing gallery:', error)
      }
    }

    // ✅ ดึงข้อมูลใหม่หลังจากบันทึกสำเร็จ
    await productStore.fetchProducts({
      page: 1,
      limit: localPageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      type: typeFilter.value
    })

    const message = editingProduct.value
      ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!'
      : 'ເພີ້ມສິນຄ້າສຳເລັດ!'

    alert(message)
    closeModal()

  } catch (error) {
    console.error('Error saving product:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກສິນຄ້າ')
  } finally {
    loading.value = false
  }
}

// Pagination methods
const previousPage = () => {
  if (hasPreviousPage.value) {
    productStore.changePage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    productStore.changePage(currentPage.value + 1)
  }
}

// ✅ ล้างการค้นหา
const clearSearch = () => {
  searchQuery.value = ''
  productStore.fetchProducts({
    page: 1,
    limit: localPageSize.value,
    status: statusFilter.value,
    type: typeFilter.value
  })
}

// Search debounce
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    productStore.changePage(1)
    productStore.fetchProducts({
      search: searchQuery.value,
      status: statusFilter.value,
      type: typeFilter.value,
      page: 1,
      limit: localPageSize.value
    })
  }, 300)
}

// Watch filters
watch([searchQuery, statusFilter, typeFilter], () => {
  debounceSearch()
})

// Initial fetch
onMounted(async () => {
  try {
    await Promise.all([
      productStore.fetchProducts(),
      productStore.fetchProductTypes()
    ])
  } catch (error) {
    console.error('Error initializing product page:', error)
  }
})
</script>

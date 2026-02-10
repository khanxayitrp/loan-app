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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
          class="input input-bordered w-full max-w-xs"
          @input="debounceSearch"
        />

        <button
          @click="openAddProductModal"
          class="btn btn-gradient btn-primary whitespace-nowrap"
        >
          <span class="icon-[tabler--shopping-bag-plus] size-5 mr-1"></span>
          ເພີ່ມສິນຄ້າໃໝ່
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- Status Filter -->
      <select
        v-model="statusFilter"
        class="select select-bordered w-full sm:w-auto"
      >
        <option value="">ທັງໝົດສະຖານະ</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <!-- Product Type Filter -->
      <select
        v-model="typeFilter"
        class="select select-bordered w-full sm:w-auto"
      >
        <option value="">ທັງໝົດປະເພດ</option>
        <option
          v-for="type in productTypes"
          :key="type.id"
          :value="type.id.toString()"
        >
          {{ type.type_name }}
        </option>
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
              <div
                v-if="product.image_url"
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
              >
                <img
                  :src="product.image_url"
                  alt="Product image"
                  class="w-full h-full object-contain"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
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
              <span
                class="badge badge-soft"
                :class="product.is_active ? 'badge-success' : 'badge-error'"
              >
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Actions -->
            <td>
              <div class="flex gap-2">
                <button
                  class="btn btn-circle btn-text btn-sm"
                  @click="openEditProductModal(product)"
                  aria-label="Edit product"
                >
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <!-- Toggle Status Button -->
                <button
                  class="btn btn-circle btn-text btn-sm"
                  :class="product.is_active ? 'text-error' : 'text-success'"
                  @click="toggleProductStatus(product)"
                  aria-label="Toggle status"
                >
                  <span
                    :class="product.is_active ? 'icon-[tabler--toggle-left]' : 'icon-[tabler--toggle-right]'"
                    class="size-4"
                  ></span>
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

    <!-- Status Toggle Modal -->
    <teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="font-bold text-lg mb-4">
            {{ productToToggle?.is_active === 1 ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}
          </h3>
          <p class="py-4 text-gray-700 dark:text-gray-300">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ
            {{ productToToggle?.is_active === 1 ? 'ປິດ' : 'ເປີດ' }}
            ການຂາຍ "{{ productToToggle?.product_name }}" ?
          </p>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="btn btn-soft btn-secondary"
              @click="showStatusModal = false"
            >
              ຍົກເລີກ
            </button>
            <button
              class="btn"
              :class="productToToggle?.is_active === 1 ? 'btn-error' : 'btn-success'"
              @click="confirmToggleStatus"
            >
              {{ productToToggle?.is_active === 1 ? 'ປິດການຂາຍ' : 'ເປີດການຂາຍ' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Add/Edit Product Modal -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                  @click="triggerFileInput"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileUpload"
                  />

                  <div v-if="!form.image_url" class="text-center">
                    <span class="icon-[tabler--photo] size-8 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                    <p class="text-xs text-gray-400 mt-1">JPG, PNG (ສູງສຸດ 2MB)</p>
                  </div>

                  <img
                    v-else
                    :src="form.image_url"
                    alt="Product preview"
                    class="w-full h-full object-contain rounded"
                  />
                </div>

                <div class="flex-1">
                  <div class="space-y-2">
                    <p class="text-sm font-medium">ຂໍ້ມູນໄຟລ໌:</p>
                    <div v-if="form.image_url" class="text-sm text-gray-600 dark:text-gray-400">
                      <p>✓ ອັບໂຫຼດສຳເລັດ</p>
                      <p>ປະເພດ: {{ imageFileInfo?.type || '-' }}</p>
                      <p>ຂະໜາດ: {{ formatFileSize(imageFileInfo?.size || 0) }}</p>
                      <button
                        type="button"
                        class="text-error text-sm mt-2 hover:underline"
                        @click="removeImage"
                      >
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
              <input
                v-model="form.product_name"
                type="text"
                placeholder="ປ້ອນຊື່ສິນຄ້າ"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.product_name }"
                required
              />
              <label v-if="errors.product_name" class="label text-error">
                <span class="label-text-alt">{{ errors.product_name }}</span>
              </label>
            </div>

            <!-- Product Type Selection -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ປະເພດສິນຄ້າ *</span>
              </label>
              <select
                v-model="form.productType_id"
                class="select select-bordered w-full"
                :class="{ 'select-error': errors.productType_id }"
                required
              >
                <option value="" disabled selected>ເລືອກປະເພດສິນຄ້າ</option>
                <option
                  v-for="type in productTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.type_name }}
                </option>
              </select>
              <label v-if="errors.productType_id" class="label text-error">
                <span class="label-text-alt">{{ errors.productType_id }}</span>
              </label>
            </div>

            <!-- Price -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ລາຄາ (ກີບ) *</span>
              </label>
              <input
                v-model.number="form.price"
                type="number"
                placeholder="ປ້ອນລາຄາ"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.price }"
                min="0"
                step="0.01"
                required
              />
              <label v-if="errors.price" class="label text-error">
                <span class="label-text-alt">{{ errors.price }}</span>
              </label>
            </div>

            <!-- Interest Rate -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ດອກເບ້ຍ (%) *</span>
              </label>
              <input
                v-model.number="form.interest_rate"
                type="number"
                placeholder="ປ້ອນດອກເບ້ຍ"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.interest_rate }"
                min="0"
                max="100"
                step="0.01"
                required
              />
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
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="handleGalleryDrop"
                @click="triggerGalleryInput"
              >
                <input
                  ref="galleryInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleGalleryUpload"
                />

                <div class="text-center">
                  <span class="icon-[tabler--upload] size-8 text-gray-400 mb-2"></span>
                  <p class="text-sm text-gray-500">ລາກແລະວາງໄຟລ໌ ຫຼື ຄລິກເພື່ອເລືອກ</p>
                  <p class="text-xs text-gray-400 mt-1">JPG, PNG (ສູງສຸດ 2MB ຕໍ່ໄຟລ໌)</p>
                </div>
              </div>

              <!-- Gallery Preview -->
              <div v-if="form.gallery.length > 0" class="mt-4">
                <div class="flex flex-wrap gap-3">
                  <div
                    v-for="(image, index) in form.gallery"
                    :key="index"
                    class="relative w-24 h-24 rounded border border-gray-300 overflow-hidden group"
                  >
                    <img :src="image" alt="Gallery image" class="w-full h-full object-cover">
                    <button
                      type="button"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="removeGalleryImage(index)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
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
                <span class="label-text font-medium">ສະຖານະສິນຄ້າ (Active/Inactive)</span>
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

// ในส่วน types
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

// Form state
const form = reactive({
  product_name: '',
  productType_id: 0,
  price: 0,
  interest_rate: 0,
  image_url: '',
  gallery: [] as string[],
  is_active: 1
})

const errors = reactive({
  product_name: '',
  productType_id: '',
  price: '',
  interest_rate: ''
})

// ✅ เพิ่มบรรทัดนี้: ประกาศ imageFileInfo ให้เป็น reactive
const imageFileInfo = reactive<ImageFileInfo>({
  name: '',
  type: '',
  size: 0
})

// Computed properties (get from store)
const isLoading = computed(() => productStore.isLoading)
const displayedProducts = computed(() => productStore.displayedProducts)
const totalProducts = computed(() => productStore.total)
const totalPages = computed(() => productStore.totalPages)
const startIndex = computed(() => productStore.startIndex)
const endIndex = computed(() => productStore.endIndex)
const hasPreviousPage = computed(() => productStore.hasPreviousPage)
const hasNextPage = computed(() => productStore.hasNextPage)
const currentPage = computed(() => productStore.currentPage)
const pageSize = computed(() => productStore.pageSize)
const productTypes = computed(() => productStore.productTypes)

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

const openEditProductModal = (product: Product) => {
  editingProduct.value = product
  form.product_name = product.product_name
  form.productType_id = product.productType_id
  form.price = product.price
  form.interest_rate = product.interest_rate
  form.image_url = product.image_url || ''
  form.gallery = product.gallery || []
  form.is_active = product.is_active
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const resetForm = () => {
  form.product_name = ''
  form.productType_id = 0
  form.price = 0
  form.interest_rate = 0
  form.image_url = ''
  form.gallery = []
  form.is_active = 1

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
      await productStore.toggleProductStatus(
        productToToggle.value.id,
        productToToggle.value.is_active === 0
      )
      alert('ປ່ຽນສະຖານະສຳເລັດ!')
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
  imageFileInfo.name = file.name  // ✅ ต้องมีการประกาศก่อนใช้
  imageFileInfo.type = file.type
  imageFileInfo.size = file.size
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
      return
    }

    try {
      // แสดง preview
      const reader = new FileReader()
      reader.onload = (e) => {
        form.image_url = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }
}

const removeImage = () => {
  form.image_url = ''
    imageFileInfo.name = ''  // ✅ ต้องมีการประกาศก่อนใช้
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

    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    validImages.push(base64)
  }

  form.gallery.push(...validImages)
}

const removeGalleryImage = (index: number) => {
  form.gallery.splice(index, 1)
}

// Save product
const saveProduct = async () => {
  if (!validateForm()) return

  try {
    let productId: number
    if (editingProduct.value) {
      // Edit mode
      await productStore.updateProduct(editingProduct.value.id, {
        product_name: form.product_name,
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
        productType_id: form.productType_id,
        price: form.price,
        interest_rate: form.interest_rate,
        is_active: form.is_active
      })
      productId = newProduct.data.id

    }

     // 2. Handle main image upload
    if (form.image_url && !form.image_url.startsWith('http')) {
      try {
        const base64Response = await fetch(form.image_url)
        const blob = await base64Response.blob()
        const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' })

        const uploadResp = await productStore.uploadProductImage(productId, file)

        if (uploadResp.success && uploadResp.data?.file_url) {
          await productStore.updateProduct(productId, {
            image_url: uploadResp.data.file_url
          })
        }
      } catch (error) {
        console.error('Error uploading main image:', error)
      }
    }

    //   // Handle gallery uploads
    //   const newGalleryImages = form.gallery.filter(img => !img.startsWith('http'))
    //   if (newGalleryImages.length > 0) {
    //     const galleryFiles = await Promise.all(
    //       newGalleryImages.map(async (img) => {
    //         const response = await fetch(img)
    //         const blob = await response.blob()
    //         return new File([blob], 'gallery-image.jpg', { type: 'image/jpeg' })
    //       })
    //     )
    //     const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)

    //     if (uploadGalleryResp.success && uploadGalleryResp.data.uploaded.length > 0) {
    //     // 2. ເອົາລາຍການ URL ທັງໝົດ ໄປບັນທຶກລົງ Table product_gallery (Bulk Insert)
    //     // ໝາຍເຫດ: ຄວນສົ່ງທັງຮູບເກົ່າ (http) ແລະ ຮູບໃໝ່ທີ່ຫາກໍ່ອັບສຳເລັດໄປພ້ອມກັນ
    //     const allGalleryUrls = [
    //       ...form.gallery.filter(img => img.startsWith('http')), // ຮູບເກົ່າທີ່ບໍ່ໄດ້ປ່ຽນ
    //       ...uploadGalleryResp.data.uploaded.map(img => img.file_url) // ຮູບໃໝ່
    //     ].map(url => ({ file_url: url }))

    //     await productStore.syncProductGallery(productId, allGalleryUrls)
    //   }
    //   }

    //   alert(editingProduct.value ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!' : 'ເພີ້ມສິນຄ້າສຳເລັດ!')

    // closeModal()
    // 3. Handle gallery uploads
    const newGalleryImages = form.gallery.filter(img => !img.startsWith('http'))

    if (newGalleryImages.length > 0) {
      try {
        console.log('📤 Processing new gallery images:', newGalleryImages.length)

        // Convert base64 to File objects with unique names
        const galleryFiles = await Promise.all(
          newGalleryImages.map(async (img, index) => {
            const response = await fetch(img)
            const blob = await response.blob()

            // Generate unique filename
            const timestamp = Date.now()
            const filename = `gallery-${timestamp}-${index}.jpg`

            return new File([blob], filename, { type: 'image/jpeg' })
          })
        )

        console.log('📤 Uploading', galleryFiles.length, 'gallery files')

        // Upload gallery images
        const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)

        console.log('📥 Gallery upload response:', uploadGalleryResp)

        // ✅ Check if upload was successful
        if (uploadGalleryResp.success) {

          // Get uploaded file URLs
          const uploadedUrls = uploadGalleryResp.data.uploaded || []

          console.log('✅ Uploaded:', uploadedUrls.length, 'files')

          // Show failed uploads if any
          if (uploadGalleryResp.data.failed && uploadGalleryResp.data.failed.length > 0) {
            console.warn('⚠️ Failed uploads:', uploadGalleryResp.data.failed)
            alert(`คำเตือน: ${uploadGalleryResp.data.failed.length} ไฟล์อัพโหลดไม่สำเร็จ\n${uploadGalleryResp.data.failed.join('\n')}`)
          }

          // Combine old and new gallery URLs
          if (uploadedUrls.length > 0) {
            // Get existing gallery URLs (URLs that start with http/https)
            const existingUrls = form.gallery.filter(img => img.startsWith('http'))

            console.log('🔄 Existing gallery URLs:', existingUrls.length)
            console.log('🔄 New gallery URLs:', uploadedUrls.length)

            // Combine all gallery URLs
            const allGalleryUrls = [
              ...existingUrls.map(url => ({ file_url: url })),
              ...uploadedUrls.map(img => ({ file_url: img.file_url }))
            ]

            console.log('🔄 Syncing total:', allGalleryUrls.length, 'gallery images')

            // save to product_gallery table
            await productStore.addProductGallery(productId, uploadGalleryResp)

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
      // ถ้าไม่มีรูปใหม่ แต่มีรูปเก่าอยู่ (กรณีแก้ไขแล้วไม่ได้เพิ่มรูปใหม่)
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

    // Success message
    const message = editingProduct.value
      ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!'
      : 'ເພີ້ມສິນຄ້າສຳເລັດ!'

    alert(message)
    closeModal()

  } catch (error) {
    console.error('Error saving product:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກສິນຄ້າ')
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

const handlePageSizeChange = (newSize: number) => {
  productStore.changePageSize(newSize)
}

// Search debounce
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    productStore.fetchProducts({
      search: searchQuery.value,
      status: statusFilter.value,
      type: typeFilter.value
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
    if (!imageFileInfo) {
    console.error('imageFileInfo is not defined!')
  }
    await Promise.all([
      productStore.fetchProducts(),
      productStore.fetchProductTypes()
    ])
  } catch (error) {
    console.error('Error initializing product page:', error)
  }
})
</script>

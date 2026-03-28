<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-auto relative flex flex-col max-h-[90vh]">

        <div class="flex justify-between items-center p-6 border-b border-base-200 shrink-0">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">
            {{ editingProduct ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່' }}
          </h3>
          <button @click="closeModal" class="btn btn-circle btn-ghost btn-sm">
            <span class="icon-[tabler--x] size-5"></span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="productForm" @submit.prevent="saveProduct" class="space-y-8">

            <div class="form-control">
              <label class="label"><span class="label-text font-bold text-base">ຮູບພາບຫຼັກ *</span></label>
              <div class="flex flex-col sm:flex-row gap-6">
                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-2 w-full sm:w-48 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all" @click="triggerFileInput">
                  <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleFileUpload" />
                  <div v-if="!form.image_url" class="text-center">
                    <span class="icon-[tabler--photo-plus] size-10 text-gray-400 mb-2"></span>
                    <p class="text-sm text-gray-500 font-medium">ອັບໂຫຼດຮູບພາບ</p>
                    <p class="text-xs text-gray-400 mt-1">JPG, PNG &lt; 2MB</p>
                  </div>
                  <img v-else :src="getProductImageUrl(form.image_url)" class="w-full h-full object-cover rounded-lg shadow-sm" />
                </div>
                <div class="flex-1 flex flex-col justify-center">
                  <div v-if="imageFileInfo.name" class="bg-base-200 p-4 rounded-xl">
                    <p class="text-sm font-bold mb-1">ໄຟລ໌ທີ່ເລືອກ:</p>
                    <p class="text-sm text-gray-600 truncate">{{ imageFileInfo.name }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(imageFileInfo.size) }}</p>
                    <button type="button" class="btn btn-xs btn-error btn-outline mt-3" @click.stop="removeImage">ລຶບຮູບພາບ</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider">ຂໍ້ມູນທົ່ວໄປ</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ຊື່ສິນຄ້າ *</span></label>
                <input v-model="form.product_name" type="text" placeholder="ປ້ອນຊື່ສິນຄ້າ" class="input input-bordered w-full" :class="{ 'input-error': errors.product_name }" required />
                <label v-if="errors.product_name" class="label text-error"><span class="label-text-alt">{{ errors.product_name }}</span></label>
              </div>

              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ປະເພດສິນຄ້າຂອງຮ້ານ *</span></label>
                <select v-model="form.productType_id" class="select select-bordered w-full" required>
                  <option value="0" disabled>ເລືອກປະເພດສິນຄ້າ</option>
                  <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.type_name }}</option>
                </select>
              </div>

              <div class="form-control border-l-4 border-info pl-3 bg-info/5 rounded-r-lg">
                <label class="label">
                  <span class="label-text font-bold text-info">ໝວດໝູ່ເທິງແອັບກາງ (Global Category) *</span>
                </label>
                <select v-model="form.global_category_id" class="select select-bordered w-full border-info focus:ring-info" required>
                  <option :value="null" disabled>-- ເລືອກໝວດໝູ່ເທິງແອັບ --</option>
                  <option v-for="gCat in globalCategories" :key="gCat.id" :value="gCat.id">{{ gCat.category_name }}</option>
                </select>
                <label class="label"><span class="label-text-alt text-gray-500">ໃຊ້ສຳລັບສະແດງສິນຄ້າໃນໜ້າແອັບຫຼັກ</span></label>
              </div>

              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ຍີ່ຫໍ້ (Brand)</span></label>
                <input v-model="form.product_brand" type="text" placeholder="ເຊັ່ນ: Apple, Samsung" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ລຸ້ນ (Model)</span></label>
                <input v-model="form.product_model" type="text" placeholder="ເຊັ່ນ: iPhone 15 Pro" class="input input-bordered w-full" />
              </div>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">ລາຍລະອຽດສິນຄ້າ</span></label>
              <textarea v-model="form.description" class="textarea textarea-bordered h-24" placeholder="ອະທິບາຍຄຸນສົມບັດຂອງສິນຄ້າ..."></textarea>
            </div>

            <div class="divider">ລາຄາ ແລະ ການຂາຍ</div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-base-200/50 p-4 rounded-xl border border-base-200">
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ລາຄາຂາຍ (ກີບ) *</span></label>
                <input v-model.number="form.price" type="number" class="input input-bordered w-full" min="0" :disabled="form.has_variants" />
                <label v-if="form.has_variants" class="label"><span class="label-text-alt text-info">ລາຄາຈະຖືກອ້າງອີງຈາກຕາຕະລາງລຸ່ມນີ້</span></label>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">ຈຳນວນສະຕັອກ *</span></label>
                <input v-model.number="form.stock_quantity" type="number" class="input input-bordered w-full" min="0" :disabled="form.has_variants" />
                <label v-if="form.has_variants" class="label"><span class="label-text-alt text-info">ສະຕັອກຈະຖືກລວມຈາກຕາຕະລາງອັດຕະໂນມັດ</span></label>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-medium">SKU ຮ້ານຄ້າ (ຫຼັກ)</span></label>
                <input v-model="form.merchant_sku" type="text" class="input input-bordered w-full" placeholder="ເຊັ່ນ: P-001" />
              </div>
              <div class="form-control md:col-span-3">
                <label class="label"><span class="label-text font-medium">ປະເພດການຜ່ອນຊຳລະ</span></label>
                <select v-model="form.allowed_loan_type" class="select select-bordered w-full max-w-xs">
                  <option value="both">ອະນຸຍາດທັງໝົດ (Both)</option>
                  <option value="single_item">ຜ່ອນສິນຄ້າດ່ຽວ (Single Item ເທົ່ານັ້ນ)</option>
                  <option value="bnpl_cart">ຜ່ອນແບບລວມກະຕ່າ (BNPL Cart ເທົ່ານັ້ນ)</option>
                </select>
              </div>
            </div>

            <div class="form-control border-2 border-primary/20 rounded-2xl p-5 bg-primary/5">
              <label class="label cursor-pointer justify-start gap-4 mb-2">
                <input type="checkbox" v-model="form.has_variants" class="toggle toggle-primary toggle-lg" @change="generateVariantMatrix" />
                <div>
                  <span class="label-text font-bold text-lg text-primary">ສິນຄ້າມີຫຼາຍຕົວເລືອກ (ມີສີ, ມີໄຊສ໌)</span>
                  <p class="text-xs text-gray-500 mt-1">ເປີດໃຊ້ງານຖ້າສິນຄ້າຂອງທ່ານມີຫຼາຍສີ ຫຼື ຫຼາຍຂະໜາດທີ່ລາຄາຕ່າງກັນ</p>
                </div>
              </label>

              <div v-if="form.has_variants" class="mt-4 space-y-5 animate-fade-in">
                <div v-for="(opt, optIndex) in variantOptions" :key="opt.id" class="p-4 border border-dashed border-primary/30 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                  <div class="flex justify-between items-center mb-3">
                    <input v-model="opt.name" type="text" class="input input-sm input-bordered font-bold w-48 text-primary" placeholder="ເຊັ່ນ: ສີ, ຂະໜາດ" @input="generateVariantMatrix" />
                    <button type="button" @click="removeVariantOption(optIndex)" class="btn btn-ghost btn-sm text-error">
                      <span class="icon-[tabler--trash] size-4"></span> ລຶບຫົວຂໍ້
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <div v-for="(val, valIndex) in opt.values" :key="valIndex" class="flex items-center gap-1">
                      <input v-model="opt.values[valIndex]" type="text" class="input input-sm input-bordered w-32 focus:border-primary" placeholder="ເຊັ່ນ: ສີແດງ, XL" @input="generateVariantMatrix" />
                      <button type="button" @click="removeVariantValue(optIndex, valIndex)" class="btn btn-circle btn-ghost btn-xs text-gray-400 hover:text-error">
                        <span class="icon-[tabler--x] size-4"></span>
                      </button>
                    </div>
                    <button type="button" @click="addVariantValue(optIndex)" class="btn btn-sm btn-outline btn-primary border-dashed">+ ເພີ່ມຕົວເລືອກ</button>
                  </div>
                </div>

                <button v-if="variantOptions.length < 2" type="button" @click="addVariantOption" class="btn btn-sm btn-block btn-outline btn-primary border-dashed">
                  <span class="icon-[tabler--plus] size-4"></span> ເພີ່ມຫົວຂໍ້ຕົວເລືອກທີ 2
                </button>

                <div v-if="form.variants.length > 0" class="overflow-x-auto mt-6 border border-base-300 rounded-xl shadow-inner bg-white dark:bg-base-100">
                  <table class="table table-zebra w-full">
                    <thead class="bg-base-200/60 text-gray-700">
                      <tr>
                        <th v-if="variantOptions.some(o => o.name.includes('ສີ') || o.name.includes('Color'))">ສີ (Color)</th>
                        <th v-if="variantOptions.some(o => o.name.includes('ຂະໜາດ') || o.name.includes('Size'))">ຂະໜາດ (Size)</th>
                        <th class="text-center w-32">ຮູບພາບ</th>
                        <th>ລາຄາ (ກີບ) *</th>
                        <th>ສະຕັອກ *</th>
                        <th>SKU ຍ່ອຍ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(v, index) in form.variants" :key="index" class="hover:bg-base-200/30">
                        <td v-if="v.color" class="font-bold text-primary">{{ v.color }}</td>
                        <td v-if="v.size_or_capacity" class="font-bold text-secondary">{{ v.size_or_capacity }}</td>
                        <td class="align-middle">
                          <div class="flex flex-col gap-2 items-center justify-center">
                            <div class="w-12 h-12 bg-base-200 rounded-lg border flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary shrink-0 shadow-sm" @click="triggerVariantImage(index)" title="ຄລິກເພື່ອອັບໂຫຼດຮູບພາບ">
                              <img v-if="v.image_url" :src="getProductImageUrl(v.image_url)" class="w-full h-full object-cover" @error="handleImageError" />
                              <span v-else class="icon-[tabler--photo-plus] text-gray-400 size-5"></span>
                            </div>
                            <input type="file" :id="`variant-img-${index}`" class="hidden" accept="image/jpeg,image/png,image/webp" @change="handleVariantImageUpload($event, index)" />
                            <input v-model="v.image_url" type="text" class="input input-xs input-bordered w-full text-center text-[10px]" placeholder="ວາງ Link..." />
                          </div>
                        </td>
                        <td><input v-model.number="v.price" type="number" class="input input-sm input-bordered w-28" min="0" required /></td>
                        <td><input v-model.number="v.stock_quantity" type="number" class="input input-sm input-bordered w-20 text-center" min="0" required /></td>
                        <td><input v-model="v.merchant_sku" type="text" class="input input-sm input-bordered w-full" placeholder="SKU" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="divider">ຮູບພາບເພີ່ມເຕີມ (Gallery)</div>

            <div class="form-control">
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-base-100" @dragover.prevent @dragenter.prevent @drop.prevent="handleGalleryDrop" @click="triggerGalleryInput">
                <input ref="galleryInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="handleGalleryUpload" />
                <div class="text-center">
                  <div class="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="icon-[tabler--upload] size-8 text-gray-500"></span>
                  </div>
                  <p class="text-base font-medium text-gray-700">ລາກແລະວາງໄຟລ໌ ຫຼື ຄລິກເພື່ອເລືອກ</p>
                  <p class="text-xs text-gray-400 mt-2">JPG, PNG (ສູງສຸດ 2MB ຕໍ່ໄຟລ໌)</p>
                </div>
              </div>

              <div v-if="form.gallery.length > 0" class="mt-6 bg-base-200/50 p-4 rounded-xl border border-base-200">
                <p class="text-sm font-medium mb-3">ຮູບພາບທີ່ເລືອກ ({{ form.gallery.length }} ຮູບ):</p>
                <div class="flex flex-wrap gap-4">
                  <div v-for="(image, index) in form.gallery" :key="index" class="relative w-24 h-24 rounded-lg border border-gray-300 overflow-hidden group shadow-sm bg-white">
                    <img :src="getGalleryImageUrl(image)" :alt="`Gallery ${index + 1}`" class="w-full h-full object-cover transition-transform group-hover:scale-110" @error="handleImageError">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" class="btn btn-circle btn-error btn-sm" @click.stop="removeGalleryImage(index)">
                        <span class="icon-[tabler--trash] size-4"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-control bg-base-200 p-4 rounded-xl mt-4">
              <label class="label cursor-pointer justify-start gap-4">
                <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0" class="toggle toggle-success" />
                <span class="label-text font-bold">ເປີດສະຖານະພ້ອມຂາຍ (Active)</span>
              </label>
            </div>

          </form>
        </div>

        <div class="p-6 border-t border-base-200 bg-base-100 shrink-0 rounded-b-2xl">
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeModal" class="btn btn-ghost">ຍົກເລີກ</button>
            <button type="submit" form="productForm" class="btn btn-primary min-w-[120px]" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner size-5"></span>
              <span v-else class="flex items-center gap-2">
                <span class="icon-[tabler--device-floppy] size-5"></span>
                {{ editingProduct ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ' }}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { useProductStore } from '@/stores/product'
import { useShopStore } from '@/stores/shop'
import { useGlobalCategoryStore } from '@/stores/global_categories'
import { getFullImageUrl } from '@/utils/url'
import { alert } from '@/utils/alert'
import { uploadVariantImage } from '@/api/upload'
import type { Product } from '@/types/product'

const props = defineProps<{ isOpen: boolean; editingProduct: Product | null; }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void; }>();

const productStore = useProductStore()
const shopStore = useShopStore()
const globalCategoryStore = useGlobalCategoryStore()

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

const productTypes = computed(() => productStore.productTypes)
const globalCategories = computed(() => globalCategoryStore.activeCategories)
const imageFileInfo = reactive({ name: '', type: '', size: 0 })

const form = reactive({
  product_name: '', description: '', product_brand: '', product_model: '',
  productType_id: 0, price: 0, image_url: '', gallery: [] as string[],
  is_active: 1, global_category_id: null as number | null, merchant_sku: '',
  stock_quantity: 0, allowed_loan_type: 'both' as 'single_item' | 'bnpl_cart' | 'both',
  has_variants: false, variants: [] as any[]
})

const errors = reactive({ product_name: '', product_brand: '', product_model: '', productType_id: '', price: '' })
const variantOptions = ref([{ id: 1, name: 'ສີ (Color)', values: [''] }])

const isBase64 = (str: any) => typeof str === 'string' && (str.startsWith('data:') || str.startsWith('blob:'))
const getProductImageUrl = (url: any) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (isBase64(url)) return url;
  if (url.startsWith('http')) return url;
  return getFullImageUrl(url) || '';
}
const getGalleryImageUrl = (url: any) => getProductImageUrl(url)
const handleImageError = (e: Event) => { const target = e.target as HTMLImageElement; if (!isBase64(target.src)) target.src = '/images/placeholder.png' }
const formatFileSize = (bytes: number) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i] }

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    if (props.editingProduct) {
      loading.value = true;
      try {
        const fullProduct = await productStore.fetchProductById(props.editingProduct.id);

        form.product_name = fullProduct.product_name || ''
        form.description = fullProduct.description || ''
        form.product_brand = fullProduct.brand || ''
        form.product_model = fullProduct.model || ''
        form.productType_id = fullProduct.productType_id || 0
        form.global_category_id = fullProduct.global_category_id || null
        form.merchant_sku = fullProduct.merchant_sku || ''
        form.allowed_loan_type = fullProduct.allowed_loan_type || 'both'
        form.price = Number(fullProduct.price) || 0
        form.stock_quantity = Number(fullProduct.stock_quantity) || 0
        form.is_active = fullProduct.is_active ? 1 : 0
        form.image_url = fullProduct.image_url || ''

        if (fullProduct.image_url) {
          imageFileInfo.name = 'product-image.jpg'
          imageFileInfo.type = 'image/jpeg'
          imageFileInfo.size = 0
        } else {
          removeImage()
        }

        let parsedGallery: string[] = [];
        const rawGallery = fullProduct.gallery || fullProduct.product_galleries || fullProduct.galleries || [];
        if (Array.isArray(rawGallery)) {
          parsedGallery = rawGallery.map((item: any) => {
            if (typeof item === 'string') return item;
            return item.image_url || item.file_url || item.url || '';
          }).filter(Boolean);
        }
        form.gallery = parsedGallery;

        const variants = fullProduct.product_variants || []
        if (variants.length > 0) {
          form.has_variants = true
          form.variants = variants.map((v: any) => ({
            id: v.id, color: v.color || '', size_or_capacity: v.size_or_capacity || '',
            merchant_sku: v.merchant_sku || '', price: Number(v.price) || 0,
            stock_quantity: Number(v.stock_quantity) || 0, weight_gram: Number(v.weight_gram) || 0,
            image_url: v.image_url || '', file: null
          }))

          const uniqueColors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[]
          const uniqueSizes = [...new Set(variants.map((v: any) => v.size_or_capacity).filter(Boolean))] as string[]
          const rebuiltOptions = []
          if (uniqueColors.length > 0) rebuiltOptions.push({ id: 1, name: 'ສີ (Color)', values: uniqueColors })
          if (uniqueSizes.length > 0) rebuiltOptions.push({ id: 2, name: 'ຂະໜາດ (Size)', values: uniqueSizes })

          variantOptions.value = rebuiltOptions.length > 0 ? rebuiltOptions : [{ id: 1, name: 'ສີ (Color)', values: [''] }]
        } else {
          form.has_variants = false
          form.variants = []
          variantOptions.value = [{ id: 1, name: 'ສີ (Color)', values: [''] }]
        }
      } catch (error) {
        alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດດຶງຂໍ້ມູນສິນຄ້າໄດ້')
        closeModal()
      } finally {
        loading.value = false;
      }
    } else {
      resetForm();
    }
  }
});

const closeModal = () => emit('close')
const resetForm = () => {
  Object.assign(form, {
    product_name: '', description: '', product_brand: '', product_model: '', productType_id: 0,
    price: 0, image_url: '', gallery: [], is_active: 1, global_category_id: null, merchant_sku: '',
    stock_quantity: 0, allowed_loan_type: 'both', has_variants: false, variants: []
  });
  variantOptions.value = [{ id: 1, name: 'ສີ (Color)', values: [''] }]
  Object.assign(imageFileInfo, { name: '', type: '', size: 0 });
  if (fileInput.value) fileInput.value.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
}

const addVariantOption = () => { if (variantOptions.value.length < 2) variantOptions.value.push({ id: Date.now(), name: 'ຂະໜາດ (Size)', values: [''] }) }
const removeVariantOption = (index: number) => { variantOptions.value.splice(index, 1); generateVariantMatrix() }
const addVariantValue = (optIndex: number) => { variantOptions.value[optIndex].values.push('') }
const removeVariantValue = (optIndex: number, valIndex: number) => {
  variantOptions.value[optIndex].values.splice(valIndex, 1)
  if (variantOptions.value[optIndex].values.length === 0) variantOptions.value[optIndex].values.push('')
  generateVariantMatrix()
}

const generateVariantMatrix = () => {
  if (!form.has_variants) { form.variants = []; return; }
  const validOptions = variantOptions.value.map(opt => ({ name: opt.name, values: opt.values.filter(v => v.trim() !== '') })).filter(opt => opt.values.length > 0)
  if (validOptions.length === 0) { form.variants = []; return; }

  let matrix: any[] = [{}]
  validOptions.forEach(option => {
    const newMatrix: any[] = []
    matrix.forEach(existingRow => {
      option.values.forEach(value => {
        const isColor = option.name.includes('ສີ') || option.name.toLowerCase().includes('color')
        newMatrix.push({ ...existingRow, [isColor ? 'color' : 'size_or_capacity']: value })
      })
    })
    matrix = newMatrix
  })

  form.variants = matrix.map((row, index) => {
    const existing = form.variants.find(v => v.color === row.color && v.size_or_capacity === row.size_or_capacity)
    return {
      id: existing?.id || undefined, color: row.color || '', size_or_capacity: row.size_or_capacity || '',
      merchant_sku: existing?.merchant_sku || `${form.merchant_sku || 'SKU'}-${index + 1}`,
      price: existing?.price || form.price || 0, stock_quantity: existing?.stock_quantity || 0,
      weight_gram: existing?.weight_gram || 0, image_url: existing?.image_url || '', file: existing?.file || null
    }
  })
}

const triggerFileInput = () => fileInput.value?.click()
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) return alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
    if (!file.type.startsWith('image/')) return alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
    const reader = new FileReader()
    reader.onload = (e) => { form.image_url = e.target?.result as string; Object.assign(imageFileInfo, { name: file.name, type: file.type, size: file.size }) }
    reader.readAsDataURL(file)
  }
}
const removeImage = () => { form.image_url = ''; Object.assign(imageFileInfo, { name: '', type: '', size: 0 }); if (fileInput.value) fileInput.value.value = '' }

const triggerVariantImage = (index: number) => document.getElementById(`variant-img-${index}`)?.click()
const handleVariantImageUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) return alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
    form.variants[index].file = file;
    form.variants[index].image_url = URL.createObjectURL(file);
  }
}

const triggerGalleryInput = () => galleryInput.value?.click()
const handleGalleryUpload = async (event: Event) => await processGalleryFiles(Array.from((event.target as HTMLInputElement).files || []))
const handleGalleryDrop = async (event: DragEvent) => await processGalleryFiles(Array.from(event.dataTransfer?.files || []))
const processGalleryFiles = async (files: File[]) => {
  const validImages: string[] = []
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024 || !file.type.startsWith('image/')) continue
    const base64 = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file); })
    validImages.push(base64)
  }
  form.gallery.push(...validImages); if (galleryInput.value) galleryInput.value.value = ''
}
const removeGalleryImage = (index: number) => form.gallery.splice(index, 1)

const validateForm = () => {
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
  let isValid = true
  if (!form.product_name.trim()) { errors.product_name = 'ກະລຸນາປ້ອນຊື່ສິນຄ້າ'; isValid = false }
  if (form.productType_id <= 0) { errors.productType_id = 'ກະລຸນາເລືອກປະເພດສິນຄ້າ'; isValid = false }
  if (!form.has_variants && form.price <= 0) { errors.price = 'ລາຄາຕ້ອງຫຼາຍກວ່າ 0'; isValid = false }
  return isValid
}

const saveProduct = async () => {
  if (!validateForm()) return
  loading.value = true

  try {
    let productId: number
    const currentShopId = shopStore.currentShop?.id;
    if (!currentShopId) throw new Error("Shop ID not found");

    if (form.has_variants && form.variants.length > 0) {
      for (let i = 0; i < form.variants.length; i++) {
        if (form.variants[i].file) {
          try {
            const rawFile = toRaw(form.variants[i].file);
            const uploadRes = await uploadVariantImage(rawFile);
            const realUrl = uploadRes.file_url || uploadRes.fileUrl || uploadRes.data?.file_url || uploadRes.data?.fileUrl;
            if (realUrl) { form.variants[i].image_url = realUrl; form.variants[i].file = null; }
          } catch (error) {
            alert.error('ເກີດຂໍ້ຜິດພາດ', 'ບໍ່ສາມາດອັບໂຫຼດຮູບພາບຕົວເລືອກໄດ້')
            loading.value = false; return;
          }
        }
        const currentUrl = form.variants[i].image_url;
        if (currentUrl && (currentUrl.startsWith('blob:') || currentUrl.startsWith('data:'))) form.variants[i].image_url = '';
      }
    }

    const payload = {
      product_name: form.product_name, description: form.description, brand: form.product_brand, model: form.product_model,
      productType_id: form.productType_id, global_category_id: form.global_category_id, merchant_sku: form.merchant_sku,
      allowed_loan_type: form.allowed_loan_type, is_active: form.is_active,
      price: form.has_variants && form.variants.length > 0 ? form.variants[0].price : form.price,
      stock_quantity: form.has_variants ? form.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) : form.stock_quantity,
      variants: form.has_variants ? form.variants.map(v => ({ id: v.id, color: v.color, size_or_capacity: v.size_or_capacity, merchant_sku: v.merchant_sku, price: v.price, stock_quantity: v.stock_quantity, weight_gram: v.weight_gram, image_url: v.image_url })) : []
    };

    if (props.editingProduct) {
      await productStore.updateProduct(props.editingProduct.id, payload)
      productId = props.editingProduct.id
    } else {
      const newProduct = await productStore.createProduct({ ...payload, shop_id: currentShopId } as any)
      productId = newProduct.id
    }

    if (form.image_url && typeof form.image_url === 'string' && form.image_url.startsWith('data:image/')) {
      try {
        const blob = await (await fetch(form.image_url)).blob()
        if (blob.size >= 1024) {
          const uploadResp = await productStore.uploadProductImage(productId, new File([blob], 'main-image.jpg', { type: 'image/jpeg' }))
          if (uploadResp.success) await productStore.updateProduct(productId, { image_url: uploadResp.data?.file_url || uploadResp.file_url })
        }
      } catch (error) {}
    }

    const newGalleryImages = form.gallery.filter(img => typeof img === 'string' && isBase64(img));
    const existingUrls = form.gallery.filter(img => typeof img === 'string' && !isBase64(img)).map(url => ({ file_url: url }));

    if (newGalleryImages.length > 0) {
      try {
        const galleryFiles = await Promise.all(newGalleryImages.map(async (img, index) => new File([await (await fetch(img)).blob()], `gallery-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' })))
        const uploadGalleryResp = await productStore.uploadProductGallery(productId, galleryFiles)

        if (uploadGalleryResp.success) {
          const uploadedUrls = uploadGalleryResp.data?.uploaded || uploadGalleryResp.uploaded || []
          if (uploadedUrls.length > 0) {
            const allGalleryUrls = [...existingUrls, ...uploadedUrls.map((img: any) => ({ file_url: img.file_url }))];
            await productStore.addProductGallery(productId, allGalleryUrls as any)
          }
        }
      } catch (error: any) { console.error('Gallery error:', error) }
    } else if (existingUrls.length > 0 || props.editingProduct) {
      try {
        await productStore.addProductGallery(productId, existingUrls as any)
      } catch (error) {}
    }

    alert.success(props.editingProduct ? 'ແກ້ໄຂສິນຄ້າສຳເລັດ!' : 'ເພີ່ມສິນຄ້າສຳເລັດ!')
    emit('success');
    closeModal();

  } catch (error) {
    console.error('Error saving product:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກສິນຄ້າ')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
</style>

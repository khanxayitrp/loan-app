<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--building-store] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ isEditMode ? 'ແກ້ໄຂຂໍ້ມູນຮ້ານ' : 'ສ້າງຮ້ານໃໝ່' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ isEditMode ? 'ປ້ອນຂໍ້ມູນທີ່ຕ້ອງການແກ້ໄຂ' : 'ກະລຸນາປ້ອນຂໍ້ມູນລາຍລະອຽດຂອງຮ້ານ' }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="p-6 space-y-8" novalidate>
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ໂລໂກ້ຮ້ານ</span>
        </label>
        <div class="flex flex-col sm:flex-row gap-6">
          <label for="shop-logo-input"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full sm:w-64 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">

            <input id="shop-logo-input" ref="fileInput" type="file" accept="image/*" class="hidden"
              @change="handleFileUpload" />

            <div v-if="!previewImageUrl" class="text-center">
              <span class="icon-[tabler--photo] size-8 text-gray-400 mb-2"></span>
              <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF (ສູງສຸດ 2MB)</p>
            </div>

            <img v-else :src="previewImageUrl" alt="Logo preview" class="w-full h-full object-contain rounded"
              @error="handleImageError" />
          </label>

          <div class="flex-1">
            <div class="space-y-2">
              <p class="text-sm font-medium">ຂໍ້ມູນໄຟລ໌:</p>

              <div v-if="previewImageUrl" class="text-sm text-gray-600 dark:text-gray-400">
                <p v-if="form.logo">✓ ອັບໂຫຼດສຳເລັດ (ຕົວຢ່າງ)</p>
                <p v-else-if="form.shop_logo_url">✓ ມີໂລໂກ້ຢູ່ແລ້ວ</p>

                <p v-if="logoFileInfo.name">ຊື່ໄຟລ໌: {{ logoFileInfo.name }}</p>
                <p v-else-if="form.shop_logo_url">
                  ລິ້ງ: {{ extractFileName(form.shop_logo_url) }}
                </p>

                <p v-if="logoFileInfo.type">
                  ປະເພດ: {{ logoFileInfo.type.split('/')[1]?.toUpperCase() }}
                </p>

                <p v-if="logoFileInfo.size > 0">
                  ຂະໜາດ: {{ formatFileSize(logoFileInfo.size) }}
                </p>
                <p v-else-if="form.shop_logo_url">ຂະໜາດ: ບໍ່ສາມາດກວດສອບໄດ້</p>

                <button type="button" class="text-error text-sm mt-2 hover:underline" @click="removeLogo">
                  ລຶບອອກ
                </button>
              </div>

              <p v-else class="text-sm text-gray-500">
                ບໍ່ມີໄຟລ໌ໂລໂກ້
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_name" type="text" placeholder="ປ້ອນຊື່ຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_name }" />
            <span class="icon-[tabler--building] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_name" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_name }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະຫັດຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_id" type="text" placeholder="ປ້ອນລະຫັດຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_id }" />
            <span class="icon-[tabler--hash] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_id" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_id }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ເຈົ້າຂອງຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_owner" type="text" placeholder="ປ້ອນຊື່ເຈົ້າຂອງຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_owner }" />
            <span class="icon-[tabler--user] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_owner" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_owner }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
          </label>
          <div class="relative">
            <input v-model="form.contact_number" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.contact_number }" />
            <span class="icon-[tabler--phone] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.contact_number" class="label text-error">
            <span class="label-text-alt">{{ errors.contact_number }}</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ແຂວງ *</span>
          </label>
          <select v-model="form.province_id" class="select select-bordered w-full"
            :class="{ 'select-error': errors.province_id }" @change="handleProvinceChange">
            <option value="" disabled>-- ເລືອກແຂວງ --</option>
            <option v-for="p in addressStore.provinces" :key="p.province_id" :value="p.province_id">
              {{ p.province_name }}
            </option>
          </select>
          <label v-if="errors.province_id" class="label text-error">
            <span class="label-text-alt">{{ errors.province_id }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເມືອງ *</span>
          </label>
          <select v-model="form.district_id" class="select select-bordered w-full"
            :disabled="!form.province_id || addressStore.loading" :class="{ 'select-error': errors.district_id }">
            <option value="" disabled>{{ addressStore.loading ? 'ກຳລັງໂຫຼດ...' : '-- ເລືອກເມືອງ --' }}</option>
            <option v-for="d in addressStore.districts" :key="d.district_id" :value="d.district_id">
              {{ d.district_name }}
            </option>
          </select>
          <label v-if="errors.district_id" class="label text-error">
            <span class="label-text-alt">{{ errors.district_id }}</span>
          </label>
        </div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ບ້ານ / ໜ່ວຍ / ຮ່ອມ (ລາຍລະອຽດ) *</span>
        </label>
        <textarea v-model="form.address" placeholder="ຕົວຢ່າງ: ບ້ານໂພນໄຊ, ໜ່ວຍ 15..."
          class="textarea textarea-bordered w-full min-h-24" :class="{ 'textarea-error': errors.address }"></textarea>
        <label v-if="errors.address" class="label text-error">
          <span class="label-text-alt">{{ errors.address }}</span>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ປະເພດທຸລະກິດ *</span>
          </label>
          <select v-model="form.business_type" class="select select-bordered w-full"
            :class="{ 'select-error': errors.business_type }">
            <option value="" disabled selected>ເລືອກປະເພດທຸລະກິດ</option>
            <option value="retail">ຮ້ານຄ້າປົກກະຕິ</option>
            <option value="wholesale">ຜູ້ຈັດຈໍາໜ່າຍ</option>
            <option value="restaurant">ຮ້ານອາຫານ</option>
            <option value="service">ບໍລິການ</option>
            <option value="manufacturing">ຜະລິດ</option>
            <option value="other">ອື່ນໆ</option>
          </select>
          <label v-if="errors.business_type" class="label text-error">
            <span class="label-text-alt">{{ errors.business_type }}</span>
          </label>
        </div>

        <div class="form-control flex items-end">
          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0"
              class="toggle toggle-primary" />
            <span class="label-text font-medium">ສະຖານະຮ້ານ (Active/Inactive)</span>
          </label>
        </div>
      </div>

      <div class="divider"></div>

      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button type="button" @click="$emit('cancel')" class="btn btn-soft btn-secondary">
          {{ isEditMode ? 'ຍົກເລີກ' : 'ກັບຄືນ' }}
        </button>
        <button type="submit" class="btn btn-primary flex items-center gap-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--device-floppy] size-5"></span>
          {{ isEditMode ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງຮ້ານໃໝ່' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue' 
import { useShopStore } from '@/stores/shop'
import { useAuthStore } from '@/stores/auth'
import { useAddressStore } from '@/stores/address' 
import apiClient from '@/api/apiclient'
import { getFullImageUrl } from '@/utils/url'
import { alert } from '@/utils/alert'

interface Shop {
  id: number
  shop_name: string
  shop_id: string
  shop_owner: string
  contact_number: string
  address: string
  province_id?: string | number 
  district_id?: string | number 
  business_type: string
  is_active: number
  logo: string | null
  shop_logo?: string
  shop_logo_url?: string
  created_at: string
}

const props = defineProps<{
  initialData?: Shop | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const shopStore = useShopStore()
const authStore = useAuthStore()
const addressStore = useAddressStore() 

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const isEditMode = computed(() => !!props.initialData)

const previewImageUrl = computed(() => {
  if (form.logo) return form.logo
  if (form.shop_logo_url) return getFullImageUrl(form.shop_logo_url)
  return ''
})

const form = reactive({
  shop_name: '',
  shop_id: '',
  shop_owner: '',
  contact_number: '',
  address: '',
  province_id: '' as string | number, 
  district_id: '' as string | number, 
  business_type: '',
  is_active: 1,
  logo: '',
  shop_logo_url: ''
})

const logoFileInfo = reactive({
  name: '',
  type: '',
  size: 0
})

const errors = reactive({
  shop_name: '',
  shop_id: '',
  shop_owner: '',
  contact_number: '',
  address: '',
  province_id: '', 
  district_id: '', 
  business_type: ''
})

const resetForm = () => {
  form.shop_name = ''
  form.shop_id = ''
  form.shop_owner = ''
  form.contact_number = ''
  form.address = ''
  form.province_id = '' 
  form.district_id = '' 
  form.business_type = ''
  form.is_active = 1
  form.logo = ''
  form.shop_logo_url = ''

  logoFileInfo.name = ''
  logoFileInfo.type = ''
  logoFileInfo.size = 0
}

const extractFileName = (url: string): string => {
  if (!url) return ''
  const parts = url.split('/')
  const fileName = parts[parts.length - 1] || ''
  return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName
}

const handleProvinceChange = async () => {
  form.district_id = '';
  if (form.province_id) {
    await addressStore.fetchDistricts(String(form.province_id));
  } else {
    addressStore.districts = [];
  }
};

watch(() => props.initialData, async (newData) => {
  if (newData) {
    form.shop_name = newData.shop_name || ''
    form.shop_id = newData.shop_id || ''
    form.shop_owner = newData.shop_owner || ''
    form.contact_number = newData.contact_number || ''
    form.address = newData.address || ''
    
    form.province_id = newData.province_id || ''
    if (form.province_id) {
      await addressStore.fetchDistricts(String(form.province_id));
    }
    form.district_id = newData.district_id || ''
    
    form.business_type = newData.business_type || ''
    form.is_active = newData.is_active ?? 1

    form.logo = ''
    const logoUrl = newData.shop_logo_url || newData.shop_logo || newData.logo || ''
    form.shop_logo_url = logoUrl

    if (logoUrl) {
      const urlParts = logoUrl.split('/')
      logoFileInfo.name = urlParts[urlParts.length - 1] || 'logo.jpg'

      const extension = logoUrl.toLowerCase().split('.').pop() || ''
      logoFileInfo.type = extension === 'png' ? 'image/png'
        : extension === 'webp' ? 'image/webp'
          : extension === 'gif' ? 'image/gif'
            : 'image/jpeg'
      logoFileInfo.size = 0
    } else {
      logoFileInfo.name = ''
      logoFileInfo.type = ''
      logoFileInfo.size = 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 🟢 ແກ້ໄຂຟັງຊັນ Validate ໃຫ້ປອດໄພ 100% ປ້ອງກັນ Error
const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // แปลงให้เป็น String ก่อน Trim ป้องกัน Error
  if (!String(form.shop_name || '').trim()) { errors.shop_name = 'ກະລຸນາປ້ອນຊື່ຮ້ານ'; isValid = false }
  if (!String(form.shop_id || '').trim()) { errors.shop_id = 'ກະລຸນາປ້ອນລະຫັດຮ້ານ'; isValid = false }
  if (!String(form.shop_owner || '').trim()) { errors.shop_owner = 'ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງຮ້ານ'; isValid = false }

  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  const contactNum = String(form.contact_number || '').trim()
  if (!contactNum) {
    errors.contact_number = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(contactNum)) {
    errors.contact_number = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }

  // ກວດສອບແຂວງ ແລະ ເມືອງ (ຮອງຮັບທັງກໍລະນີເປັນ String ແລະ ຕົວເລກ)
  if (form.province_id === '' || form.province_id === null || form.province_id === undefined) { errors.province_id = 'ກະລຸນາເລືອກແຂວງ'; isValid = false }
  if (form.district_id === '' || form.district_id === null || form.district_id === undefined) { errors.district_id = 'ກະລຸນາເລືອກເມືອງ'; isValid = false }
  
  if (!String(form.address || '').trim()) { errors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່ຮ້ານ'; isValid = false }
  if (!form.business_type) { errors.business_type = 'ກະລຸນາເລືອກປະເພດທຸລະກິດ'; isValid = false }

  return isValid
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/image/placeholder-shop.avif'
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert.error('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
    return
  }

  if (!file.type.startsWith('image/')) {
    alert.error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
    return
  }

  logoFileInfo.name = file.name
  logoFileInfo.type = file.type
  logoFileInfo.size = file.size

  const reader = new FileReader()
  reader.onload = (e) => {
    form.logo = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeLogo = async () => {
  if (isEditMode.value && form.shop_logo_url) {
    if (!await alert.confirm('ທ່ານຕ້ອງການລຶບໂລໂກ້ຮ້ານອອກຈາກລະບົບ?')) {
      return
    }

    if (props.initialData?.id) {
      shopStore.updateShop(props.initialData.id, { shop_logo_url: null } as any)
        .then(() => {
          form.shop_logo_url = ''
        })
    }
  }

  form.logo = ''
  logoFileInfo.name = ''
  logoFileInfo.type = ''
  logoFileInfo.size = 0

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (!authStore.currentUser?.id && !isEditMode.value) {
    alert.error('ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ ລະບົບຈະບໍ່ສາມາດສ້າງຮ້ານໄດ້');
    return;
  }
  
  const logoDataToUpload = form.logo;
  loading.value = true
  try {
    let response

    if (isEditMode.value && props.initialData) {
      response = await shopStore.updateShop(props.initialData.id, {
        shop_name: form.shop_name,
        shop_id: form.shop_id,
        shop_owner: form.shop_owner,
        contact_number: form.contact_number,
        address: form.address,
        province_id: form.province_id,
        district_id: form.district_id,
        business_type: form.business_type,
        is_active: form.is_active
      } as any)
      
      if (logoDataToUpload) {
        const targetId = response?.id || props.initialData.id;
        await uploadLogo(targetId, logoDataToUpload)
      }

    } else {
      response = await shopStore.saveShop({
        user_id: authStore.currentUser!.id,
        shop_name: form.shop_name,
        shop_id: form.shop_id,
        shop_owner: form.shop_owner,
        contact_number: form.contact_number,
        address: form.address,
        province_id: form.province_id,
        district_id: form.district_id,
        business_type: form.business_type,
        is_active: form.is_active
      } as any)
      
      if (logoDataToUpload) {
        await uploadLogo(response.id, logoDataToUpload)
      }
    }

    alert.success(isEditMode.value ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດ!' : 'ສ້າງຮ້ານສຳເລັດ!')
    emit('save')

  } catch (error: any) {
    if (error.response?.data?.errors) {
      const apiErrors = error.response.data.errors
      if (apiErrors.shop_name) errors.shop_name = apiErrors.shop_name[0]
      if (apiErrors.shop_id) errors.shop_id = apiErrors.shop_id[0]
      if (apiErrors.shop_owner) errors.shop_owner = apiErrors.shop_owner[0]
      if (apiErrors.contact_number) errors.contact_number = apiErrors.contact_number[0]
      if (apiErrors.address) errors.address = apiErrors.address[0]
      if (apiErrors.province_id) errors.province_id = apiErrors.province_id[0] 
      if (apiErrors.district_id) errors.district_id = apiErrors.district_id[0] 
      if (apiErrors.business_type) errors.business_type = apiErrors.business_type[0]
    } else {
      alert.error('ເກີດຂໍ້ຜິດພາດການບັນທຶກຂໍ້ມູນ. ກະລຸນາລອງໃໝ່.')
    }
  } finally {
    loading.value = false
  }
}

const uploadLogo = async (partner_id: number, base64Data: string) => {
  if (!base64Data) return

  const base64Response = await fetch(base64Data)
  const blob = await base64Response.blob()

  const formData = new FormData()
  const fileExtension = logoFileInfo.type.split('/')[1] || 'png'
  const fileName = `shop_${partner_id}_logo.${fileExtension}`
  const file = new File([blob], fileName, { type: logoFileInfo.type })

  formData.append('file', file)

  try {
    const response = await apiClient.post(`/upload/shop/${partner_id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const newLogoUrl = response.data?.data?.file_url;
    if (newLogoUrl) {
      form.shop_logo_url = newLogoUrl
      await shopStore.updateShop(partner_id, { shop_logo_url: newLogoUrl } as any);
    }
  } catch (error) {
    throw new Error('Failed to upload shop logo')
  }
}

onMounted(async () => {
  try {
    await addressStore.fetchProvinces()
  } catch (e) {
    console.error('Failed to load provinces:', e)
  }
})
</script>
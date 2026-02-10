<!-- src/components/shops/CreateShop.vue -->
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

    <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
      <!-- Logo Upload Section -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ໂລໂກ້ຮ້ານ</span>
        </label>
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Upload Area -->
          <label
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full sm:w-64 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            @click="triggerFileInput">
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />

            <div v-if="!form.shop_logo_url" class="text-center">
              <span class="icon-[tabler--photo] size-8 text-gray-400 mb-2"></span>
              <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF (ສູງສຸດ 2MB)</p>
            </div>

            <img v-else :src="form.shop_logo_url" alt="Logo preview" class="w-full h-full object-contain rounded" />
          </label>

          <!-- Preview Info -->
          <div class="flex-1">
            <div class="space-y-2">
              <p class="text-sm font-medium">ຂໍ້ມູນໄຟລ໌:</p>
              <div v-if="form.logo" class="text-sm text-gray-600 dark:text-gray-400">
                <p>✓ ອັບໂຫຼດສຳເລັດ</p>
                <p>ປະເພດ: {{ logoFileInfo.type }}</p>
                <p>ຂະໜາດ: {{ formatFileSize(logoFileInfo.size) }}</p>
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

      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Shop Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_name" type="text" placeholder="ປ້ອນຊື່ຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_name }" required />
            <span class="icon-[tabler--building] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_name" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_name }}</span>
          </label>
        </div>

        <!-- Shop Code -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະຫັດຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_id" type="text" placeholder="ປ້ອນລະຫັດຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_id }" required />
            <span class="icon-[tabler--hash] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_id" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_id }}</span>
          </label>
        </div>

        <!-- Owner Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ເຈົ້າຂອງຮ້ານ *</span>
          </label>
          <div class="relative">
            <input v-model="form.shop_owner" type="text" placeholder="ປ້ອນຊື່ເຈົ້າຂອງຮ້ານ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.shop_owner }" required />
            <span class="icon-[tabler--user] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.shop_owner" class="label text-error">
            <span class="label-text-alt">{{ errors.shop_owner }}</span>
          </label>
        </div>

        <!-- Phone Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
          </label>
          <div class="relative">
            <input v-model="form.contact_number" type="tel" placeholder="ປ້ອນເບີໂທລະສັບ"
              class="input input-bordered w-full pl-10" :class="{ 'input-error': errors.contact_number }" required />
            <span class="icon-[tabler--phone] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.contact_number" class="label text-error">
            <span class="label-text-alt">{{ errors.contact_number }}</span>
          </label>
        </div>
      </div>

      <!-- Address Section -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ທີ່ຢູ່ຮ້ານ *</span>
        </label>
        <textarea v-model="form.address" placeholder="ປ້ອນທີ່ຢູ່ຮ້ານຢ່າງລະອຽດ"
          class="textarea textarea-bordered w-full min-h-24" :class="{ 'textarea-error': errors.address }"
          required></textarea>
        <label v-if="errors.address" class="label text-error">
          <span class="label-text-alt">{{ errors.address }}</span>
        </label>
      </div>

      <!-- Location Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Province -->
        <!-- <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ແຂວງ *</span>
          </label>
          <select v-model="form.province" class="select select-bordered w-full"
            :class="{ 'select-error': errors.province }" required>
            <option value="" disabled selected>ເລືອກແຂວງ</option>
            <option value="Vientiane">ນະຄອນຫຼວງວຽງຈັນ</option>
            <option value="Champasak">ຈຳປາສັກ</option>
            <option value="Savannakhet">ສະຫວັນນະເຂດ</option>
            <option value="Luang Prabang">ຫຼວງພະບາງ</option>
            <option value="Bokeo">ບໍ່ແກ້ວ</option>
            <option value="Bolikhamxai">ບໍລິຄໍາໄຊ</option>
            <option value="Houaphanh">ຫົວພັນ</option>
            <option value="Khammouane">ຄໍາມ່ວນ</option>
            <option value="Oudomxay">ອຸດົມໄຊ</option>
            <option value="Phongsaly">ຜົ້ງສາລີ</option>
            <option value="Salavan">ສາລະວັນ</option>
            <option value="Sekong">ເຊກອງ</option>
            <option value="Vientiane Province">ວຽງຈັນ</option>
            <option value="Xayaboury">ໄຊຍະບູລີ</option>
            <option value="Xiangkhouang">ຊຽງຂວາງ</option>
          </select>
          <label v-if="errors.province" class="label text-error">
            <span class="label-text-alt">{{ errors.province }}</span>
          </label>
        </div> -->

        <!-- District -->
        <!-- <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເມືອງ *</span>
          </label>
          <input v-model="form.district" type="text" placeholder="ປ້ອນເມືອງ" class="input input-bordered w-full"
            :class="{ 'input-error': errors.district }" required />
          <label v-if="errors.district" class="label text-error">
            <span class="label-text-alt">{{ errors.district }}</span>
          </label>
        </div> -->

        <!-- Village -->
        <!-- <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ບ້ານ</span>
          </label>
          <input v-model="form.village" type="text" placeholder="ປ້ອນບ້ານ" class="input input-bordered w-full" />
        </div> -->
      </div>

      <!-- Business Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Business Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ປະເພດທຸລະກິດ *</span>
          </label>
          <select v-model="form.business_type" class="select select-bordered w-full"
            :class="{ 'select-error': errors.business_type }" required>
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

        <!-- Status -->
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useShopStore } from '@/stores/shop'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/apiClient'

interface Shop {
  id: number
  shop_name: string
  shop_id: string
  shop_owner: string
  contact_number: string
  address: string
  // province: string
  // district: string
  // village: string | null
  business_type: string
  is_active: number
  logo: string | null
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

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// ✅ Computed property สำหรับโหมด
const isEditMode = computed(() => !!props.initialData)

// Form state
const form = reactive({
  shop_name: '',
  shop_id: '',
  shop_owner: '',
  contact_number: '',
  address: '',
  // province: '',
  // district: '',
  // village: '',
  business_type: '',
  is_active: 1,
  logo: '' // Base64 string for logo
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
  // province: '',
  // district: '',
  business_type: ''
})



const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'is_active') {
      form[key as keyof typeof form] = 1
    } else {
      form[key as keyof typeof form] = ''
    }
  })
}

// ✅ Initialize form when props change
watch(() => props.initialData, (newData) => {
  if (newData) {
    // Edit mode
    Object.assign(form, newData)
  } else {
    // Create mode
    resetForm()
  }
}, { immediate: true })

// Validation function
const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.shop_name.trim()) {
    errors.shop_name = 'ກະລຸນາປ້ອນຊື່ຮ້ານ'
    isValid = false
  }

  if (!form.shop_id.trim()) {
    errors.shop_id = 'ກະລຸນາປ້ອນລະຫັດຮ້ານ'
    isValid = false
  }

  if (!form.shop_owner.trim()) {
    errors.shop_owner = 'ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງຮ້ານ'
    isValid = false
  }

  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!form.contact_number.trim()) {
    errors.contact_number = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(form.contact_number)) {
    errors.contact_number = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }

  if (!form.address.trim()) {
    errors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່ຮ້ານ'
    isValid = false
  }

  // if (!form.province) {
  //   errors.province = 'ກະລຸນາເລືອກແຂວງ'
  //   isValid = false
  // }

  // if (!form.district.trim()) {
  //   errors.district = 'ກະລຸນາປ້ອນເມືອງ'
  //   isValid = false
  // }

  if (!form.business_type) {
    errors.business_type = 'ກະລຸນາເລືອກປະເພດທຸລະກິດ'
    isValid = false
  }

  return isValid
}

// File upload handlers
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ')
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
}

const removeLogo = () => {
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

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    let response

    if (isEditMode.value && props.initialData) {
      // Edit mode
      response = await shopStore.updateShop(props.initialData.id, {
        shop_name: form.shop_name,
        shop_id: form.shop_id,
        shop_owner: form.shop_owner,
        contact_number: form.contact_number,
        address: form.address,
        // province: form.province,
        // district: form.district,
        // village: form.village || null,
        business_type: form.business_type,
        is_active: form.is_active
      })

      // Handle logo upload
      if (form.logo) {
        await uploadLogo(response.shop.id)
      }

    } else {
      // Create mode
      response = await shopStore.saveShop({
        user_id: authStore.currentUser.id,
        shop_name: form.shop_name,
        shop_id: form.shop_id,
        shop_owner: form.shop_owner,
        contact_number: form.contact_number,
        address: form.address,
        // province: form.province,
        // district: form.district,
        // village: form.village || null,
        business_type: form.business_type,
        is_active: form.is_active
      })
      console.log('this response is', response)
      // Handle logo upload
      if (form.logo) {
        await uploadLogo(response.shop.id)
      }
    }
    // ✅ ตรวจสอบว่า store มี currentShop แล้ว
    console.log('After save - currentShop:', shopStore.currentShop)

    alert(isEditMode.value ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດ!' : 'ສ້າງຮ້ານສຳເລັດ!')
    emit('save')

  } catch (error: any) {
    console.error('Error saving shop:', error)

    if (error.response?.data?.errors) {
      const apiErrors = error.response.data.errors
      if (apiErrors.shop_name) errors.shop_name = apiErrors.shop_name[0]
      if (apiErrors.shop_id) errors.shop_id = apiErrors.shop_id[0]
      if (apiErrors.shop_owner) errors.shop_owner = apiErrors.shop_owner[0]
      if (apiErrors.contact_number) errors.contact_number = apiErrors.contact_number[0]
      if (apiErrors.address) errors.address = apiErrors.address[0]
      // if (apiErrors.province) errors.province = apiErrors.province[0]
      // if (apiErrors.district) errors.district = apiErrors.district[0]
      if (apiErrors.business_type) errors.business_type = apiErrors.business_type[0]
    } else {
      alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກຂໍ້ມູນ. ກະລຸນາລອງໃໝ່.')
    }
  } finally {
    loading.value = false
  }
}

const uploadLogo = async (partner_id: number) => {
  if (!form.logo) return

  const base64Response = await fetch(form.logo)
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

    console.log('file upload for update partner shop_logo_url', response)

    // จาก response ตัวอย่างของคุณ → ใช้ path นี้
    const newLogoUrl = response.data?.data?.file_url;

    if (newLogoUrl) {
      console.log('this id is', partner_id)
      await shopStore.updateShop(partner_id, { shop_logo_url: newLogoUrl });
      // ถ้ามี preview URL สร้างจาก createObjectURL อยู่ → revoke ได้ที่นี่
      // URL.revokeObjectURL(form.logo); // ถ้าเคยสร้างไว้
    } else {
      console.warn('No file_url returned from server');
    }

   // return newLogoUrl; // optional: return url ใหม่ให้ใช้ต่อ

  } catch (error) {
    console.error('Failed to upload logo:', error)
    throw new Error('Failed to upload shop logo')
  }
}
</script>

<!-- src/components/shops/CreateShop.vue -->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- ปุ่มสร้างร้านค้า (แสดงเมื่อยังไม่ได้กด และไม่อยู่ในโหมดแก้ไข) -->
    <div v-if="!showForm && !props.initialData" class="text-center py-12">
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-primary/10 rounded-full">
          <span class="icon-[tabler--building-store] size-12 text-primary"></span>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">ສ້າງຮ້ານໃໝ່</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        ກົດປຸ່ມດ້ານລຸ່ມເພື່ອເລີ່ມຕົ້ນການສ້າງຂໍ້ມູນຮ້ານໃໝ່
      </p>
      <button
        class="btn btn-gradient btn-primary px-8 py-3 text-lg"
        @click="showForm = true"
      >
        <span class="icon-[tabler--plus] size-5 mr-2"></span>
        ສ້າງຮ້ານໃໝ່
      </button>
    </div>

    <!-- ฟอร์มป้อนข้อมูล (แสดงเมื่อกดปุ่มแล้ว หรืออยู่ในโหมดแก้ไข) -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="p-2 bg-primary/10 rounded-lg">
          <span class="icon-[tabler--building-store] size-6 text-primary"></span>
        </div>
        <div>
          <!-- เปลี่ยนข้อความตามโหมด -->
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">
            {{ props.initialData ? 'ແກ້ໄຂຂໍ້ມູນຮ້ານ' : 'ສ້າງຮ້ານໃໝ່' }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ props.initialData ? 'ປ້ອນຂໍ້ມູນທີ່ຕ້ອງການແກ້ໄຂ' : 'ກະລຸນາປ້ອນຂໍ້ມູນລາຍລະອຽດຂອງຮ້ານ' }}
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
            <div
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full sm:w-64 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload"
              />

              <div v-if="!form.logo" class="text-center">
                <span class="icon-[tabler--photo] size-8 text-gray-400 mb-2"></span>
                <p class="text-sm text-gray-500">ຄລິກເພື່ອອັບໂຫຼດ</p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF (ສູງສຸດ 2MB)</p>
              </div>

              <img
                v-else
                :src="form.logo"
                alt="Logo preview"
                class="w-full h-full object-contain rounded"
              />
            </div>

            <!-- Preview Info -->
            <div class="flex-1">
              <div class="space-y-2">
                <p class="text-sm font-medium">ຂໍ້ມູນໄຟລ໌:</p>
                <div v-if="form.logo" class="text-sm text-gray-600 dark:text-gray-400">
                  <p>✓ ອັບໂຫຼດສຳເລັດ</p>
                  <p>ປະເພດ: {{ logoFileInfo.type }}</p>
                  <p>ຂະໜາດ: {{ formatFileSize(logoFileInfo.size) }}</p>
                  <button
                    type="button"
                    class="text-error text-sm mt-2 hover:underline"
                    @click="removeLogo"
                  >
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
              <input
                v-model="form.shop_name"
                type="text"
                placeholder="ປ້ອນຊື່ຮ້ານ"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.shop_name }"
                required
              />
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
              <input
                v-model="form.shop_code"
                type="text"
                placeholder="ປ້ອນລະຫັດຮ້ານ"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.shop_code }"
                required
              />
              <span class="icon-[tabler--hash] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
            </div>
            <label v-if="errors.shop_code" class="label text-error">
              <span class="label-text-alt">{{ errors.shop_code }}</span>
            </label>
          </div>

          <!-- Owner Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ຊື່ເຈົ້າຂອງຮ້ານ *</span>
            </label>
            <div class="relative">
              <input
                v-model="form.owner_name"
                type="text"
                placeholder="ປ້ອນຊື່ເຈົ້າຂອງຮ້ານ"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.owner_name }"
                required
              />
              <span class="icon-[tabler--user] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
            </div>
            <label v-if="errors.owner_name" class="label text-error">
              <span class="label-text-alt">{{ errors.owner_name }}</span>
            </label>
          </div>

          <!-- Phone Number -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເບີໂທລະສັບ *</span>
            </label>
            <div class="relative">
              <input
                v-model="form.phone"
                type="tel"
                placeholder="ປ້ອນເບີໂທລະສັບ"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.phone }"
                required
              />
              <span class="icon-[tabler--phone] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
            </div>
            <label v-if="errors.phone" class="label text-error">
              <span class="label-text-alt">{{ errors.phone }}</span>
            </label>
          </div>
        </div>

        <!-- Address Section -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ທີ່ຢູ່ຮ້ານ *</span>
          </label>
          <textarea
            v-model="form.address"
            placeholder="ປ້ອນທີ່ຢູ່ຮ້ານຢ່າງລະອຽດ"
            class="textarea textarea-bordered w-full min-h-24"
            :class="{ 'textarea-error': errors.address }"
            required
          ></textarea>
          <label v-if="errors.address" class="label text-error">
            <span class="label-text-alt">{{ errors.address }}</span>
          </label>
        </div>

        <!-- Location Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Province -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ແຂວງ *</span>
            </label>
            <select
              v-model="form.province"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.province }"
              required
            >
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
          </div>

          <!-- District -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ເມືອງ *</span>
            </label>
            <input
              v-model="form.district"
              type="text"
              placeholder="ປ້ອນເມືອງ"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.district }"
              required
            />
            <label v-if="errors.district" class="label text-error">
              <span class="label-text-alt">{{ errors.district }}</span>
            </label>
          </div>

          <!-- Village -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ບ້ານ</span>
            </label>
            <input
              v-model="form.village"
              type="text"
              placeholder="ປ້ອນບ້ານ"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <!-- Business Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Business Type -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">ປະເພດທຸລະກິດ *</span>
            </label>
            <select
              v-model="form.business_type"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.business_type }"
              required
            >
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
              <input
                type="checkbox"
                v-model="form.is_active"
                :true-value="1"
                :false-value="0"
                class="toggle toggle-primary"
              />
              <span class="label-text font-medium">ສະຖານະຮ້ານ (Active/Inactive)</span>
            </label>
          </div>
        </div>

        <div class="divider"></div>

        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-soft btn-secondary"
          >
            <!-- เปลี่ยนข้อความปุ่มตามโหมด -->
            {{ props.initialData ? 'ຍົກເລີກ' : 'ກັບຄືນ' }}
          </button>
          <button
            type="submit"
            class="btn btn-primary flex items-center gap-2"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else class="icon-[tabler--device-floppy] size-5"></span>
            <!-- เปลี่ยนข้อความปุ่มตามโหมด -->
            {{ props.initialData ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງຮ້ານໃໝ່' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Shop } from '@/stores/shop'

// เพิ่ม props สำหรับรับข้อมูลเริ่มต้น
const props = defineProps<{
  initialData?: Shop | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const router = useRouter()
const loading = ref(false)
const showForm = ref(false) // จะเป็น true อัตโนมัติถ้าอยู่ในโหมดแก้ไข
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  shop_name: '',
  shop_code: '',
  owner_name: '',
  phone: '',
  address: '',
  province: '',
  district: '',
  village: '',
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
  shop_code: '',
  owner_name: '',
  phone: '',
  address: '',
  province: '',
  district: '',
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
// Initialize form when component is created
watch(() => props.initialData, (newData) => {
  if (newData) {
    // Fill form with existing data (edit mode)
    Object.assign(form, newData)
    showForm.value = true // เปิดฟอร์มทันทีเมื่ออยู่ในโหมดแก้ไข
  } else {
    // Clear form for create mode
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

  if (!form.shop_code.trim()) {
    errors.shop_code = 'ກະລຸນາປ້ອນລະຫັດຮ້ານ'
    isValid = false
  }

  if (!form.owner_name.trim()) {
    errors.owner_name = 'ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງຮ້ານ'
    isValid = false
  }

  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!form.phone.trim()) {
    errors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }

  if (!form.address.trim()) {
    errors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່ຮ້ານ'
    isValid = false
  }

  if (!form.province) {
    errors.province = 'ກະລຸນາເລືອກແຂວງ'
    isValid = false
  }

  if (!form.district.trim()) {
    errors.district = 'ກະລຸນາປ້ອນເມືອງ'
    isValid = false
  }

  if (!form.business_type) {
    errors.business_type = 'ກະລຸນາເລືອກປະເພດທຸລະກິດ'
    isValid = false
  }

  return isValid
}

// File upload handlers
const triggerFileInput = () => {
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

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    const formData = { ...form }
    console.log(props.initialData ? 'Updating shop:' : 'Creating shop:', formData)

    // ✅ เรียก saveShop จาก store แทนการจำลอง
    // await shopStore.saveShop(formData)
    // จำลอง API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    alert(props.initialData ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດ!' : 'ສ້າງຮ້ານສຳເລັດ!')

    // ✅ emit save event
    emit('save')

  } catch (error) {
    console.error('Error saving shop:', error)
    alert('ເກີດຂໍ້ຜິດພາດການບັນທຶກຂໍ້ມູນ. ກະລຸນາລອງໃໝ່.')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (props.initialData) {
    // ในโหมดแก้ไข: emit cancel event
    emit('cancel')
  } else {
    // ในโหมดสร้าง: กลับไปหน้าปุ่ม
    showForm.value = false
  }
}
</script>

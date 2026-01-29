<template>
  <div class="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--building-store] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ສ້າງຮ້ານໃໝ່</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ກະລຸນາປ້ອນຂໍ້ມູນລາຍລະອຽດຂອງຮ້ານ</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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

        <!-- License Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ເລກທີ່ໃບອະນຸຍາດ</span>
          </label>
          <input
            v-model="form.license_number"
            type="text"
            placeholder="ປ້ອນເລກທີ່ໃບອະນຸຍາດ"
            class="input input-bordered w-full"
          />
        </div>
      </div>

      <!-- Status and Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <span class="label-text font-medium">ສະຖານະຮ້ານ (Active/Inactive)</span>
          </label>
        </div>

        <!-- Notes -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ໝາຍເຫດ</span>
          </label>
          <textarea
            v-model="form.notes"
            placeholder="ປ້ອນໝາຍເຫດເພີ່ມເຕີມ"
            class="textarea textarea-bordered w-full min-h-20"
          ></textarea>
        </div>
      </div>

      <div class="divider"></div>

      <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8">
        <button
          type="button"
          @click="$router.back()"
          class="btn btn-soft btn-secondary order-2 sm:order-1"
        >
          ຍົກເລີກ
        </button>
        <button
          type="submit"
          class="btn btn-primary order-1 sm:order-2 flex items-center gap-2"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--device-floppy] size-5"></span>
          ບັນທຶກຂໍ້ມູນຮ້ານ
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

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
  license_number: '',
  is_active: 1,
  notes: ''
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

// Validation function
const validateForm = (): boolean => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Validate shop name
  if (!form.shop_name.trim()) {
    errors.shop_name = 'ກະລຸນາປ້ອນຊື່ຮ້ານ'
    isValid = false
  }

  // Validate shop code
  if (!form.shop_code.trim()) {
    errors.shop_code = 'ກະລຸນາປ້ອນລະຫັດຮ້ານ'
    isValid = false
  }

  // Validate owner name
  if (!form.owner_name.trim()) {
    errors.owner_name = 'ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງຮ້ານ'
    isValid = false
  }

  // Validate phone
  const phoneRegex = /^[\d\-\+\(\)\s]{8,15}$/
  if (!form.phone.trim()) {
    errors.phone = 'ກະລຸນາປ້ອນເບີໂທລະສັບ'
    isValid = false
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    isValid = false
  }

  // Validate address
  if (!form.address.trim()) {
    errors.address = 'ກະລຸນາປ້ອນທີ່ຢູ່ຮ້ານ'
    isValid = false
  }

  // Validate province
  if (!form.province) {
    errors.province = 'ກະລຸນາເລືອກແຂວງ'
    isValid = false
  }

  // Validate district
  if (!form.district.trim()) {
    errors.district = 'ກະລຸນາປ້ອນເມືອງ'
    isValid = false
  }

  // Validate business type
  if (!form.business_type) {
    errors.business_type = 'ກະລຸນາເລືອກປະເພດທຸລະກິດ'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    // Simulate API call
    console.log('Creating shop:', form)

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Show success message
    alert('ສ້າງຮ້ານສຳເລັດ!')

    // Redirect to shop list
    router.push({ name: 'ShopManagement' })

  } catch (error) {
    console.error('Error creating shop:', error)
    alert('ເກີດຂໍ້ຜິດພາດການສ້າງຮ້ານ. ກະລຸນາລອງໃໝ່.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>

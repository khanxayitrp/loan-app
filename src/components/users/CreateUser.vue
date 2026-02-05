<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--user-plus] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ isEditMode ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ isEditMode ? 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ທີ່ເລືອກ' : 'ກະລຸນາປ້ອນຂໍ້ມູນລຸ່ມນີ້ເພື່ອສ້າງບັນຊີຜູ້ໃຊ້ໃໝ່' }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Full Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ ແລະ ນາມສະກຸນ</span>
          </label>
          <div class="relative">
            <input
              v-model="form.full_name"
              type="text"
              placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              class="input input-bordered w-full pl-10"
              :class="{ 'input-error': errors.full_name }"
              required
            />
            <span class="icon-[tabler--user] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.full_name" class="label text-error">
            <span class="label-text-alt">{{ errors.full_name }}</span>
          </label>
        </div>

        <!-- Username -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ຜູ້ໃຊ້ (Username)</span>
          </label>
          <div class="relative">
            <input
              v-model="form.username"
              type="text"
              placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              class="input input-bordered w-full pl-10"
              :class="{ 'input-error': errors.username }"
              required
            />
            <span class="icon-[tabler--at] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.username" class="label text-error">
            <span class="label-text-alt">{{ errors.username }}</span>
          </label>
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະຫັດຜ່ານ</span>
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input input-bordered w-full pl-10"
              :class="{ 'input-error': errors.password }"
              :required="!isEditMode"
            />
            <span class="icon-[tabler--lock] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span :class="showPassword ? 'icon-[tabler--eye-off]' : 'icon-[tabler--eye]'"></span>
            </button>
          </div>
          <label v-if="errors.password" class="label text-error">
            <span class="label-text-alt">{{ errors.password }}</span>
          </label>
        </div>

         <!-- Role -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ບົດບາດ (Role)</span>
          </label>
          <div class="relative">
            <select
              v-model="form.role"
              class="select select-bordered w-full pl-10"
              :class="{ 'select-error': errors.role }"
              required
              @change="handleRoleChange"
            >
              <option value="" disabled selected>ເລືອກບົດບາດ</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="partner">Partner</option>
              <option value="customer">Customer</option>
            </select>
            <span class="icon-[tabler--shield-check] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.role" class="label text-error">
            <span class="label-text-alt">{{ errors.role }}</span>
          </label>
        </div>

        <!-- Staff Level (Show only if role is staff) -->
        <div v-if="form.role === 'staff'" class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະດັບພະນັກງານ</span>
          </label>
          <div class="relative">
            <select
              v-model="form.staff_level"
              class="select select-bordered w-full pl-10"
              :class="{ 'select-error': errors.staff_level }"
              required
            >
              <option value="none">ທົ່ວໄປ</option>
              <option value="requester">ຜູ້ຮ້ອງຂໍ (Requester)</option>
              <option value="approver">ຜູ້ອະນຸມັດ (Approver)</option>
            </select>
            <span class="icon-[tabler--hierarchy] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
          <label v-if="errors.staff_level" class="label text-error">
            <span class="label-text-alt">{{ errors.staff_level }}</span>
          </label>
        </div>

        <!-- Is Active Toggle -->
        <div class="form-control col-span-1 md:col-span-2">
          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0"
              class="toggle toggle-primary" />
            <span class="label-text font-medium">ສະຖານະຜູ້ໃຊ້ (Active/Inactive)</span>
          </label>
        </div>

      </div>

      <div class="divider"></div>

      <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8">
        <button type="button" @click="handleCancel" class="btn btn-soft btn-secondary order-2 sm:order-1">
          ຍົກເລີກ
        </button>
        <button type="submit" class="btn btn-primary order-1 sm:order-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--device-floppy] size-5"></span>
          {{ isEditMode ? 'ອັບເດດຂໍ້ມູນ' : 'ບັນທຶກຂໍ້ມູນ' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import type { User } from '@/types/auth'

const props = defineProps<{
  initialUser?: User | null
}>()
const emit = defineEmits(['save', 'cancel'])

const loading = ref(false)
const showPassword = ref(false)

// Validation errors
const errors = reactive({
  full_name: '',
  username: '',
  password: '',
  role: '',
  staff_level: ''
})

// สถานะโหมด Edit/Add
const isEditMode = computed(() => !!props.initialUser)

const form = reactive({
  full_name: '',
  username: '',
  password: '',
  role: '' as 'admin' | 'staff' | 'partner' | 'customer',
  staff_level: 'none' as 'requester' | 'approver' | 'none',
  is_active: 1,
  created_at: ''
})

// โหลดข้อมูลเก่าเมื่อ props เปลี่ยน (โหมด Edit)
watch(() => props.initialUser, (user) => {
  if (user) {
    Object.assign(form, {
      ...user,
      password: '' // ไม่โหลด password เก่า
    })
  } else {
    // โหมด Add → reset form
    Object.assign(form, {
      full_name: '',
      username: '',
      password: '',
      role: '',
      staff_level: 'none',
      is_active: 1,
      created_at: ''
    })
  }
}, { immediate: true })

// Validation function
const validateForm = (): boolean => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.full_name.trim()) {
    errors.full_name = 'ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ'
    isValid = false
  }

  if (!form.username.trim()) {
    errors.username = 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້'
    isValid = false
  }

  if (!isEditMode.value && !form.password.trim()) {
    errors.password = 'ກະລຸນາປ້ອນລະຫັດຜ່ານ'
    isValid = false
  }

  if (!form.role) {
    errors.role = 'ກະລຸນາເລືອກບົດບາດ'
    isValid = false
  }

  if (form.role === 'staff' && !form.staff_level) {
    errors.staff_level = 'ກະລຸນາເລືອກລະດັບພະນັກງານ'
    isValid = false
  }

  return isValid
}

const handleRoleChange = () => {
  // Reset staff_level เมื่อเปลี่ยน role
  if (form.role !== 'staff') {
    form.staff_level = 'none'
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleSubmit = async () => {
  // ✅ ป้องกันการ submit ซ้ำ
  if (loading.value) {
    console.log('[CreateUser] Already submitting, ignoring...')
    return
  }

  // Validate form
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // ✅ เตรียมข้อมูลที่จะส่ง
    const userData = {
      full_name: form.full_name.trim(),
      username: form.username.trim(),
      role: form.role,
      staff_level: form.role === 'staff' ? form.staff_level : 'none',
      is_active: form.is_active,
      ...(form.password && { password: form.password }) // ส่ง password ถ้ามี
    }

    console.log('[CreateUser] Emitting save with data:', userData)

    // ✅ ส่งข้อมูลกลับไปให้ parent จัดการ (ไม่เรียก API ที่นี่)
    emit('save', {
      ...userData,
      id: props.initialUser?.id // ส่ง id ไปด้วยถ้าเป็นโหมด edit
    })

  } catch (error: any) {
    console.error('[CreateUser] Error:', error)

    // Handle validation errors
    if (error.response?.data?.errors) {
      const apiErrors = error.response.data.errors
      if (apiErrors.full_name) errors.full_name = apiErrors.full_name[0]
      if (apiErrors.username) errors.username = apiErrors.username[0]
      if (apiErrors.password) errors.password = apiErrors.password[0]
      if (apiErrors.role) errors.role = apiErrors.role[0]
      if (apiErrors.staff_level) errors.staff_level = apiErrors.staff_level[0]
    } else {
      alert(error.message || 'ເກີດຂໍ້ຜິດພາດການບັນທຶກຂໍ້ມູນຜູ້ໃຊ້')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('[CreateUser] mounted, initialUser:', props.initialUser)
})
</script>

<style scoped>
/* Custom style if needed */
</style>

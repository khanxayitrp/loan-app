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
            <input v-model="form.full_name" type="text" placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              class="input input-bordered w-full pl-10" required />
            <span class="icon-[tabler--user] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
        </div>

        <!-- Username -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ຊື່ຜູ້ໃຊ້ (Username)</span>
          </label>
          <div class="relative">
            <input v-model="form.username" type="text" placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              class="input input-bordered w-full pl-10" required />
            <span class="icon-[tabler--at] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະຫັດຜ່ານ</span>
          </label>
          <div class="relative">
            <input v-model="form.password" type="password" placeholder="••••••••"
              class="input input-bordered w-full pl-10" required />
            <span class="icon-[tabler--lock] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
        </div>

        <!-- Role -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">ບົດບາດ (Role)</span>
          </label>
          <div class="relative">
            <select v-model="form.role" class="select select-bordered w-full pl-10" required>
              <option value="" disabled selected>ເລືອກບົດບາດ</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="partner">Partner</option>
              <option value="customer">Customer</option>
            </select>
            <span
              class="icon-[tabler--shield-check] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
        </div>

        <!-- Staff Level (Show only if role is staff) -->
        <div v-if="form.role === 'staff'" class="form-control">
          <label class="label">
            <span class="label-text font-medium">ລະດັບພະນັກງານ</span>
          </label>
          <div class="relative">
            <select v-model="form.staff_level" class="select select-bordered w-full pl-10">
              <option value="none">ທົ່ວໄປ</option>
              <option value="requester">ຜູ້ຮ້ອງຂໍ (Requester)</option>
              <option value="approver">ຜູ້ອະນຸມັດ (Approver)</option>
            </select>
            <span class="icon-[tabler--hierarchy] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          </div>
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

const props = defineProps<{
  initialUser?: User | null
}>()
const emit = defineEmits(['save', 'cancel'])

const loading = ref(false)

// สถานะโหมด Edit/Add
const isEditMode = computed(() => !!props.initialUser)

const form = reactive({
  full_name: '',
  username: '',
  password: '',
  role: '',
  staff_level: 'none',
  is_active: 1,
  created_at: ''
})
// โหลดข้อมูลเก่าเมื่อ props เปลี่ยน (โหมด Edit)
watch(() => props.initialUser, (user) => {
  if (user) {
    // Copy ข้อมูลเก่ามาเติม form
    Object.assign(form, {
      ...user,
      password: '' // ไม่โหลด password เก่าเพื่อความปลอดภัย
    })
  } else {
    // โหมด Add → reset form
    Object.assign(form, {
      id: 0,
      full_name: '',
      username: '',
      password: '',
      role: '',
      staff_level: 'none',
      is_active: 1,
      created_at: ''
    })
  }
}, { immediate: true, deep: true }) // deep เพื่อดูการเปลี่ยนแปลงภายใน object

const handleCancel = () => {
  emit('cancel') // ส่ง event cancel ไปให้ parent รีโหลด
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // จิตนาการว่าเรียก API ที่นี่
    console.log('Saving user:', form)

    // จำลองการโหลด
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('save', { ...form })

    // Reset form หรือทำอย่างอื่นต่อ
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    loading.value = false
  }
}

// Optional: ถ้าต้องการ log หรือ init เพิ่มเติม
onMounted(() => {
  console.log('CreateUser mounted, initialUser:', props.initialUser)
})

</script>

<style scoped>
/* Custom style if needed */
</style>

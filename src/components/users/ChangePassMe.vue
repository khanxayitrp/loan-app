<template>
  <div
    class="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--password] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ປ່ຽນລະຫັດຜ່ານ</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ປ່ຽນລະຫັດຜ່ານຂອງທ່ານ</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">

      <!-- Current Password -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ລະຫັດຜ່ານປັດຈຸບັນ</span>
        </label>
        <div class="relative">
          <input v-model="form.currentPassword" :type="showCurrentPassword ? 'text' : 'password'"
            placeholder="ປ້ອນລະຫັດຜ່ານປັດຈຸບັນ" class="input input-bordered w-full pl-10 pr-12" required />
          <span class="icon-[tabler--lock] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showCurrentPassword = !showCurrentPassword">
            <span v-if="showCurrentPassword" class="icon-[tabler--eye-off] size-5"></span>
            <span v-else class="icon-[tabler--eye] size-5"></span>
          </button>
        </div>
      </div>

      <!-- New Password -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ລະຫັດຜ່ານໃໝ່</span>
        </label>
        <div class="relative">
          <input v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່"
            class="input input-bordered w-full pl-10 pr-12" :class="{ 'input-error': errors.newPassword }" required />
          <span class="icon-[tabler--lock-plus] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showNewPassword = !showNewPassword">
            <span v-if="showNewPassword" class="icon-[tabler--eye-off] size-5"></span>
            <span v-else class="icon-[tabler--eye] size-5"></span>
          </button>
        </div>
        <label v-if="errors.newPassword" class="label text-error">
          <span class="label-text-alt">{{ errors.newPassword }}</span>
        </label>
      </div>

      <!-- Confirm New Password -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ຢືນຍັນລະຫັດຜ່ານໃໝ່</span>
        </label>
        <div class="relative">
          <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ" class="input input-bordered w-full pl-10 pr-12"
            :class="{ 'input-error': errors.confirmPassword }" required />
          <span class="icon-[tabler--lock-check] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5"></span>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showConfirmPassword = !showConfirmPassword">
            <span v-if="showConfirmPassword" class="icon-[tabler--eye-off] size-5"></span>
            <span v-else class="icon-[tabler--eye] size-5"></span>
          </button>
        </div>
        <label v-if="errors.confirmPassword" class="label text-error">
          <span class="label-text-alt">{{ errors.confirmPassword }}</span>
        </label>
      </div>

      <!-- Password Requirements -->
      <div class="bg-base-100 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">ຂໍ້ກຳນົດລະຫັດຜ່ານ:</h3>
        <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li class="flex items-center gap-2">
            <span class="icon-[tabler--check] size-4 text-success"></span>
            ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ
          </li>
          <li class="flex items-center gap-2">
            <span class="icon-[tabler--check] size-4 text-success"></span>
            ມີຕົວພິມໃຫຍ່ ແລະ ຕົວພິມນ້ອຍ
          </li>
          <li class="flex items-center gap-2">
            <span class="icon-[tabler--check] size-4 text-success"></span>
            ມີຕົວເລກຢ່າງໜ້ອຍ 1 ຕົວ
          </li>
          <li class="flex items-center gap-2">
            <span class="icon-[tabler--check] size-4 text-success"></span>
            ມີສັນຍາລັກພິເສດ (!@#$%^&*)
          </li>
        </ul>
      </div>

      <div class="divider"></div>

      <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8">
        <button type="button" @click="$router.back()" class="btn btn-soft btn-secondary order-2 sm:order-1">
          ກັບຄືນ
        </button>
        <button type="submit" class="btn btn-primary order-1 sm:order-2 flex items-center gap-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--device-floppy] size-5"></span>
          ບັນທຶກການປ່ຽນແປງ
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { alert } from '@/utils/alert' // Import the alert utility

// Reactive state
const router = useRouter()
// ... existing code ...
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await changePassword({
      oldPassword: form.currentPassword,
      newPassword: form.newPassword
    })

    await alert.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ!', 'ກະລຸນາເຂົ້າสู่ລະບົບໃໝ່.')
    await authStore.signOut()
    router.push('/login')

  } catch (error: any) {
    console.error('Error changing password:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || 'ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້')
  } finally {
    loading.value = false
  }
}
</script>

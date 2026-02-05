<template>
  <div
    class="flex h-auto min-h-screen items-center justify-center overflow-x-hidden bg-[url('https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/auth/auth-background-2.png')] bg-cover bg-center bg-no-repeat py-10"
  >
    <div class="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <!-- SVG background (เหมือนเดิม) -->

      <div class="bg-base-100 shadow-base-300/20 z-1 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
        <div class="flex items-center gap-3">
          <!-- ✅ แก้ไข path รูปภาพ -->
          <img src="/image/LOGO INSEE.png" class="size-8" alt="brand-logo" />
          <h2 class="text-base-content text-xl font-bold">ສະຖາບັນການເງິນຈຸລະພາກທີ່ບໍ່ຮັບເງິນຝາກອິນຊີ</h2>
        </div>

        <div>
          <h3 class="text-base-content mb-1.5 text-2xl font-semibold">ເຂົ້າສູ່ລະບົບ InSee Loan</h3>
        </div>

        <!-- แสดง error จาก API หรือ validation -->
        <div v-if="errorMessage" class="alert alert-error shadow-lg">
          <span>{{ errorMessage }}</span>
        </div>

        <form class="mb-4 space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="label-text" for="userName">ຊື່ຜູ້ໃຊ້ *</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              class="input input-bordered w-full"
              id="userName"
              required
              :disabled="loading"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="label-text" for="userPassword">ລະຫັດຜ່ານ *</label>
            <div class="input input-bordered flex items-center gap-2">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="ປ້ອນລະຫັດຜ່ານ"
                required
                :disabled="loading"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="btn btn-ghost btn-xs"
                tabindex="-1"
              >
                <span
                  :class="showPassword ? 'icon-[tabler--eye-off]' : 'icon-[tabler--eye]'"
                  class="size-5"
                ></span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-y-2">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-primary"
                id="rememberMe"
                v-model="form.rememberMe"
              />
              <label class="label-text text-base-content/80 p-0 text-base" for="rememberMe">
                ຈື່ຂ້ອຍໄວ້
              </label>
            </div>
            <a href="#" class="link link-animated link-primary font-normal">ລືມລະຫັດຜ່ານ?</a>
          </div>

          <button
            type="submit"
            class="btn btn-lg btn-primary btn-gradient btn-block"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else>ເຂົ້າສູ່ລະບົບ INSEE LOAN</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'  // ← เพิ่ม nextTick ที่นี่
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Reactive form state
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const success = await authStore.signIn({
      username: form.username.trim(),
      password: form.password
    })

    if (!success) {
      errorMessage.value = 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
      return
    }

    // รอ Pinia state อัปเดตสักครู่ (ป้องกัน user เป็น null ทันที)
    // await nextTick()
      // 2. ✅ Verify & reload permissions from cookies
    await authStore.checkAuth()

    const user = authStore.currentUser
    console.log('User after login:', user) // debug เพื่อดู role จริง ๆ

    if (!user || !user.role) {
      errorMessage.value = 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ ກະລຸນາລອງໃໝ່'
      return
    }

    // 3. ✅ ตรวจสอบว่ามี redirect query หรือไม่
    const redirect = router.currentRoute.value.query.redirect as string | undefined

    if (redirect) {
      // ถ้า guard redirect มา → กลับไปหน้าเดิม
      router.push(redirect)
    } else {
      // ถ้าไม่มี → redirect ตาม role
      switch (user.role.toLowerCase()) {
        case 'admin':
        case 'staff':
          router.push({ name: 'UserManagement' })
          break

        case 'partner':
          router.push({ name: 'Stores' })
          break

        case 'customer':
          router.push({ name: 'PendingLoans' })
          break

        default:
          console.warn('Role ไม่รู้จัก:', user.role)
          router.push({ name: 'LoanListAll' }) // fallback
          errorMessage.value = `ບົດບາດບໍ່ຮອງຮັບ: ${user.role}`
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

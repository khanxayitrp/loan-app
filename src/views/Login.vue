<template>
  <div
    class="flex h-auto min-h-screen items-center justify-center overflow-x-hidden bg-[url('https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/auth/auth-background-2.png')] bg-cover bg-center bg-no-repeat py-10">
    <div class="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="bg-base-100 shadow-base-300/20 z-1 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
        <div class="flex items-center gap-3">
          <img src="/image/LOGO INSEE.png" class="size-8" alt="brand-logo" />
          <h2 class="text-base-content text-xl font-bold">ສະຖາບັນການເງິນຈຸລະພາກທີ່ບໍ່ຮັບເງິນຝາກອິນຊີ</h2>
        </div>

        <div>
          <h3 class="text-base-content mb-1.5 text-2xl font-semibold">ເຂົ້າສູ່ລະບົບ InSee Loan</h3>
        </div>

        <div v-if="errorMessage" class="alert alert-error shadow-lg">
          <span>{{ errorMessage }}</span>
        </div>

        <form class="mb-4 space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="label-text" for="userName">ຊື່ຜູ້ໃຊ້ *</label>
            <input v-model="form.username" type="text" placeholder="ປ້ອນຊື່ຜູ້ໃຊ້" class="input input-bordered w-full"
              id="userName" required :disabled="loading" autocomplete="username" />
          </div>

          <div>
            <label class="label-text" for="userPassword">ລະຫັດຜ່ານ *</label>
            <div class="input input-bordered flex items-center gap-2">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="ປ້ອນລະຫັດຜ່ານ"
                required :disabled="loading" autocomplete="current-password" />
              <button type="button" @click="showPassword = !showPassword" class="btn btn-ghost btn-xs" tabindex="-1">
                <span :class="showPassword ? 'icon-[tabler--eye-off]' : 'icon-[tabler--eye]'" class="size-5"></span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" class="checkbox checkbox-primary" id="rememberMe" v-model="form.rememberMe" />
              <label class="label-text text-base-content/80 p-0 text-base" for="rememberMe">
                ຈື່ຂ້ອຍໄວ້
              </label>
            </div>
            <a href="#" class="link link-animated link-primary font-normal">ລືມລະຫັດຜ່ານ?</a>
          </div>

          <button type="submit" class="btn btn-lg btn-primary btn-gradient btn-block" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else>ເຂົ້າສູ່ລະບົບ INSEE LOAN</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

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
const permissionStore = usePermissionStore()

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

    // 2. ໂຫຼດຂໍ້ມູນ Auth ຄືນໃໝ່ໃຫ້ໝັ້ນໃຈ
    await authStore.checkAuth()
    const user = authStore.currentUser

    if (!user || !user.role) {
      errorMessage.value = 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ ກະລຸນາລອງໃໝ່'
      return
    }

    // 3. 🛡️ ຖ້າເປັນການລັອກອິນຄັ້ງທຳອິດ -> ບັງຄັບປ່ຽນລະຫັດ
    const loginCount = await authStore.checkFirstLogin()
    if (loginCount === 0 || loginCount === 1) {
       router.replace({ name: 'ChangeMyPassword' }) // ⚡️ ໃຊ້ replace
       return
    }

    // 4. ✅ ກວດສອບ Redirect Query ຫຼື Redirect ຕາມ Role
    const redirect = router.currentRoute.value.query.redirect as string | undefined

    if (redirect) {
      router.replace(redirect) // ⚡️ ໃຊ້ replace
    } else {
      // Logic ການ Redirect ຕາມ Role
      const role = user.role.toLowerCase()

      if (role === 'admin') {
        router.replace({ name: 'DashboardHome' })
      } else if (role === 'partner') {
      router.replace({ name: 'PartnerDashboard' }); // 👈 Partner ໄປ Partner Dashboard
    } else if (role === 'staff') {
        // 👈 ສຳລັບ Staff ເຊັກຕາມສິດທີ່ພວກເຂົາມີ
      if (permissionStore.hasPermission('view_admin_dashboard')) {
        router.replace({ name: 'DashboardHome' });
      } else if (permissionStore.hasPermission('loan_view_all')) {
        router.replace({ name: 'LoanListAll' });
      } else if (permissionStore.hasPermission('loan_view_assigned')) {
        router.replace({ name: 'ListLoans' });
      } else {
        router.replace({ name: 'PendingLoans' }); // ຄ່າເລີ່ມຕົ້ນຂອງ Staff
      }
      }  else {
        router.replace({ name: 'PendingLoans' })
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ'
  } finally {
    loading.value = false
  }
}
</script>

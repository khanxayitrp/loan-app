<template>
  <div
    class="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-primary/10 rounded-lg">
        <span class="icon-[tabler--password] size-6 text-primary"></span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">ປ່ຽນລະຫັດຜ່ານ</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">ກະລຸນາເລືອກຜູ້ໃຊ້ ແລະ ປ້ອນລະຫັດຜ່ານໃໝ່</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- User Search ComboBox -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">ເລືອກຜູ້ໃຊ້</span>
        </label>
        <div class="relative" data-combo-box='{
            "groupingType": "default",
            "preventSelection": false,
            "isOpenOnFocus": true,
            "dropdownClasses": "max-h-60 overflow-y-auto"
          }'>
          <div class="relative">
            <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ ຫຼື ຊື່ຜູ້ໃຊ້..."
              class="input input-bordered w-full pl-10 pr-4" role="combobox" aria-expanded="false"
              @input="debounceSearch" @focus="handleFocus" />
            <span
              class="icon-[tabler--search] text-base-content absolute start-3 top-1/2 size-4 shrink-0 -translate-y-1/2"></span>
          </div>

          <!-- Dropdown Results -->
          <div v-if="showDropdown && searchResults.length > 0"
            class="bg-white dark:bg-gray-800 rounded-box p-2 shadow-lg border border-gray-200 dark:border-gray-700 mt-1 max-h-60 overflow-y-auto"
            style="position: absolute; z-index: 1000; width: 100%; top: 100%; left: 0;">
            <div v-for="user in searchResults" :key="user.id"
              class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
              @click="selectUser(user)">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {{ (user.full_name || user.username).charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-800 dark:text-white">{{ user.full_name || user.username }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">@{{ user.username }}</div>
              </div>
              <span v-if="selectedUser?.id === user.id" class="icon-[tabler--check] text-primary size-4"></span>
            </div>
          </div>

          <!-- No results -->
          <div v-else-if="showDropdown && searchResults.length === 0 && searchQuery"
            class="bg-white dark:bg-gray-800 rounded-box p-2 shadow-lg border border-gray-200 dark:border-gray-700 mt-1"
            style="position: absolute; z-index: 1000; width: 100%; top: 100%; left: 0;">
            <div class="px-3 py-2 text-gray-500 dark:text-gray-400">
              ບໍ່ພົບຜູ້ໃຊ້
            </div>
          </div>
        </div>

        <!-- Selected User Display -->
        <div v-if="selectedUser" class="mt-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {{ (selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-800 dark:text-white">{{ selectedUser.full_name || selectedUser.username }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">@{{ selectedUser.username }}</div>
          </div>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="clearSelection">
            <span class="icon-[tabler--x] size-4"></span>
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
        <button type="submit" class="btn btn-primary order-1 sm:order-2 flex items-center gap-2"
          :disabled="loading || !selectedUser">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else class="icon-[tabler--device-floppy] size-5"></span>
          ບັນທຶກການປ່ຽນແປງ
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth' // Use real type
import { alert } from '@/utils/alert'

// Reactive state
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedUser = ref<User | null>(null)

const form = reactive({
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  newPassword: '',
  confirmPassword: ''
})

// Search results
const searchResults = ref<User[]>([])

// Load users on mount
onMounted(async () => {
  if (authStore.allUsers.length === 0) {
    await authStore.fetchAllUsers()
  }
})

// Debounce search
let debounceTimer: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    performSearch()
  }, 300)
}

// Perform search
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = authStore.allUsers.filter(user =>
    (user.full_name?.toLowerCase().includes(query) || false) ||
    user.username.toLowerCase().includes(query)
  )
}

// Handle focus
const handleFocus = () => {
  showDropdown.value = true
  if (searchQuery.value) {
    performSearch()
  } else {
    // Show all users (limit to 20 for performance if list is long)
    searchResults.value = authStore.allUsers.slice(0, 20)
  }
}

// Select user
const selectUser = (user: User) => {
  selectedUser.value = user
  searchQuery.value = user.full_name || user.username
  showDropdown.value = false
}

// Clear selection
const clearSelection = () => {
  selectedUser.value = null
  searchQuery.value = ''
  searchResults.value = []
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const comboBox = document.querySelector('[data-combo-box]')
  if (comboBox && !comboBox.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

// Validation
const validateForm = (): boolean => {
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!selectedUser.value) {
    return false
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  if (!form.newPassword) {
    errors.newPassword = 'ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່'
    return false
  }

  if (!passwordRegex.test(form.newPassword)) {
    errors.newPassword = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ, ຕົວພິມໃຫຍ່, ຕົວພິມນ້ອຍ, ຕົວເລກ, ແລະ ສັນຍາລັກພິເສດ'
    return false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'ກະລຸນາຢືນຍັນລະຫັດຜ່ານໃໝ່'
    return false
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'ລະຫັດຜ່ານໃໝ່ບໍ່ກົງກັນ'
    return false
  }

  return true
}

// Submit handler
const handleSubmit = async () => {
  if (!validateForm() || !selectedUser.value) {
    return
  }

  loading.value = true
  try {
    // Call store action to update user password
    await authStore.updateUser(selectedUser.value.id, {
      password: form.newPassword
    })

    alert.success('ສຳເລັດ', `ປ່ຽນລະຫັດຜ່ານຂອງຜູ້ໃຊ້ "${selectedUser.value.full_name || selectedUser.value.username}" ສຳເລັດ!`)
    router.back()

  } catch (error: any) {
    console.error('Error changing password:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.response?.data?.message || error.message || 'ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້')
  } finally {
    loading.value = false
  }
}

// Watch for clicks outside
watch(showDropdown, (newVal) => {
  if (newVal) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

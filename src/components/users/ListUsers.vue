<template>
  <div class="p-6">
    <!-- Toolbar: Search + Export + Add Button -->
    <div v-if="!isCreatingUser && !showStatusModal"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <!-- Search -->
      <input v-model="searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ເຕັມ ຫຼື ຊື່ຜູ້ໃຊ້..."
        class="input input-bordered w-full max-w-xs" />

      <!-- Actions -->
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" @click="exportToCSV">
          <span class="icon-[tabler--file-export] size-4"></span> Export CSV
        </button>
        <button class="btn btn-gradient btn-primary" @click="openCreateUser">
          <span class="icon-[tabler--user-plus] size-5"></span> ເພີ່ມຜູ້ໃຊ້
        </button>
      </div>
    </div>

    <!-- Create User Form -->
    <CreateUser v-if="isCreatingUser" :initial-user="editingUser" @save="handleSaveUser"
      @cancel="handleCancelCreateUser" />

    <!-- Modal ยืนยันเปิด/ปิดสถานะ -->
    <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="font-bold text-lg mb-4">
          {{ userToToggle?.is_active === true ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}
        </h3>
        <p class="py-4 text-gray-700 dark:text-gray-300">
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ
          {{ userToToggle?.is_active === true ? 'ປິດ' : 'ເປີດ' }}
          ການໃຊ້ງານຂອງ "{{ userToToggle?.full_name }}" ?
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-soft btn-secondary" @click="showStatusModal = false">
            ຍົກເລີກ
          </button>
          <button class="btn" :class="userToToggle?.is_active === true ? 'btn-error' : 'btn-success'"
            @click="confirmToggleStatus">
            {{ userToToggle?.is_active === true ? 'ປິດການໃຊ້ງານ' : 'ເປີດການໃຊ້ງານ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !isCreatingUser" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <!-- Table -->
    <div v-if="!isCreatingUser && !showStatusModal && !isLoading"
      class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th class="w-10">
              <input type="checkbox" class="checkbox" :checked="allRowsSelected" :indeterminate.prop="someRowsSelected"
                @change="toggleAllRows" />
            </th>
            <th>
              <button @click="toggleSort('full_name')" class="flex items-center gap-1 hover:text-primary">
                ຊື່ ແລະ ນາມສະກຸນ
                <span v-if="sortColumn === 'full_name'" class="icon-[tabler--arrows-sort] size-4"
                  :class="sortDirection === 'asc' ? 'rotate-180' : ''"></span>
              </button>
            </th>
            <th>
              <button @click="toggleSort('username')" class="flex items-center gap-1 hover:text-primary">
                ຊື່ຜູ້ໃຊ້
                <span v-if="sortColumn === 'username'" class="icon-[tabler--arrows-sort] size-4"
                  :class="sortDirection === 'asc' ? 'rotate-180' : ''"></span>
              </button>
            </th>
            <th>ບົດບາດ</th>
            <th>ລະດັບພະນັກງານ</th>
            <th>ສະຖານະ</th>
            <th>
              <button @click="toggleSort('created_at')" class="flex items-center gap-1 hover:text-primary">
                ວັນທີສ້າງ
                <span v-if="sortColumn === 'created_at'" class="icon-[tabler--arrows-sort] size-4"
                  :class="sortDirection === 'asc' ? 'rotate-180' : ''"></span>
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in displayedUsers" :key="user.id">
            <td class="w-10">
              <input type="checkbox" class="checkbox" :checked="selectedRows.includes(user.id)"
                @change="toggleRow(user.id)" />
            </td>
            <td>{{ user.full_name }}</td>
            <td>{{ user.username }}</td>
            <td>
              <span class="badge badge-soft" :class="getRoleBadgeClass(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td>{{ user.staff_level || 'N/A' }}</td>
            <td>
              <span class="badge badge-soft" :class="getIsActiveBadgeClass(user.is_active)">
                {{ user.is_active === true ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="flex gap-1">
                <button class="btn btn-circle btn-text btn-sm" @click="editUser(user)" aria-label="Edit">
                  <span class="icon-[tabler--pencil] size-4"></span>
                </button>
                <button class="btn btn-circle btn-text btn-sm text-error" @click="deleteUser(user.id)"
                  aria-label="Delete">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
                <div class="dropdown dropdown-end">
                  <button tabindex="0" title="Click Active/Inactive" class="btn btn-circle btn-text btn-sm"
                    @click.prevent.stop="toggleUserStatus(user)">
                    <span class="icon-[tabler--dots-vertical] size-5"></span>
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="displayedUsers.length === 0">
            <td colspan="8" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="!isCreatingUser && !showStatusModal && !isLoading"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
      <div>
        ສະແດງ {{ startIndex }} - {{ endIndex }} ຈາກ {{ totalUsers }} ລາຍການ
      </div>

      <div class="flex items-center gap-2">
        <select v-model.number="pageSize" class="select select-sm select-bordered">
          <option :value="10">10 ຕໍ່ໜ້າ</option>
          <option :value="25">25 ຕໍ່ໜ້າ</option>
          <option :value="50">50 ຕໍ່ໜ້າ</option>
        </select>

        <button class="btn btn-sm" :disabled="!hasPreviousPage" @click="previousPage">
          ກ່ອນໜ້າ
        </button>

        <span class="px-2">
          ໜ້າ {{ currentPage }} / {{ totalPages }}
        </span>

        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>

      <div v-if="selectedRows.length > 0">
        ເລືອກ {{ selectedRows.length }} ລາຍການ
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Papa from 'papaparse'
import type { User } from '@/types/auth'
import CreateUser from './CreateUser.vue'
import { useAuthStore } from '@/stores/auth'

// ✅ ใช้ auth store
const authStore = useAuthStore()

// Reactive state
const isCreatingUser = ref(false)
const editingUser = ref<User | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref<number[]>([])
const isLoading = ref(false)
const sortColumn = ref<keyof User | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Modal state
const showStatusModal = ref(false)
const userToToggle = ref<User | null>(null)

// ✅ ดึงข้อมูล users จาก store
const users = computed(() => authStore.allUsers)


// ✅ Fetch users จาก API เมื่อ component โหลด
const fetchUsers = async () => {
  isLoading.value = true
  try {
    await authStore.fetchAllUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
    alert('ເກີດຂໍ້ຜິດພາດການດຶງຂໍ້ມູນຜູ້ໃຊ້')
  } finally {
    isLoading.value = false
  }
}

// ✅ เรียกครั้งแรกเมื่อ component mount
onMounted(() => {
  fetchUsers()
 console.log('ListUsers component mounted, fetching users...', users.value)
 console.log('Current user from store:', useAuthStore.allUsers) // debug เพื่อดูข้อมูล users ที่ได้จาก store

})

// ฟังก์ชันเปิด modal เปิด/ปิดสถานະ
const toggleUserStatus = (user: User) => {
  console.log('toggleUserStatus called with user:', user)
  userToToggle.value = { ...user }
  showStatusModal.value = true
}

// ยืนยันการเปิด/ปิดสถานะ
const confirmToggleStatus = async () => {
  if (!userToToggle.value) return

  try {
    const newStatus = userToToggle.value.is_active === true ? 0 : 1

    // ✅ เรียก API update user status
    await authStore.updateUserStatus(userToToggle.value.id, newStatus)

    // ✅ Refresh data
    await fetchUsers()

    showStatusModal.value = false
    userToToggle.value = null
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ')
  }
}

// เปิดฟอร์มเพิ่มผู้ใช้ใหม่
const openCreateUser = () => {
  editingUser.value = null
  isCreatingUser.value = true
}

// Action handlers
const editUser = (user: User) => {
  console.log('Edit user:', user)
  editingUser.value = { ...user }
  isCreatingUser.value = true
}

// // เมื่อบันทึก (ทั้ง add และ edit)
// const handleSaveUser = async (updatedUser: User) => {
//   try {
//     if (editingUser.value) {
//       // โหมดแก้ไข
//       await authStore.updateUser(updatedUser.id, updatedUser)
//     } else {
//       // โหมดเพิ่มใหม่
//       await authStore.createUser(updatedUser)
//     }

//     // ✅ Refresh data
//     await fetchUsers()

//     isCreatingUser.value = false
//     editingUser.value = null
//   } catch (error) {
//     console.error('Error saving user:', error)
//     alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ')
//   }
// }

// เมื่อบันทึก (ทั้ง add และ edit)
const handleSaveUser = async (userData: any) => {
  // ✅ ป้องกันการเรียก API ซ้ำ
  if (isLoading.value) {
    console.log('[ListUsers] Already processing, ignoring...')
    return
  }

  isLoading.value = true

  try {
    console.log('[ListUsers] Received user data:', userData)

    if (editingUser.value && userData.id) {
      // โหมดแก้ไข
      console.log('[ListUsers] Updating user:', userData.id)
      await authStore.updateUser(userData.id, userData)
    } else {
      // โหมดเพิ่มใหม่
      console.log('[ListUsers] Creating new user')
      await authStore.createUser(userData)
    }

    // ✅ Refresh data
    await fetchUsers()

    // ปิดฟอร์ม
    isCreatingUser.value = false
    editingUser.value = null

    console.log('[ListUsers] User saved successfully')
  } catch (error: any) {
    console.error('[ListUsers] Error saving user:', error)
    alert(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ')
  } finally {
    isLoading.value = false
  }
}

const handleCancelCreateUser = () => {
  isCreatingUser.value = false
  editingUser.value = null
}

// Debounced search query
const debouncedSearch = ref('')
let debounceTimer: NodeJS.Timeout | null = null

watch(searchQuery, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newValue
    currentPage.value = 1
  }, 300)
})

// Filter users based on search
const filteredUsers = computed(() => {
  if (!debouncedSearch.value) {
    return users.value
  }

  const search = debouncedSearch.value.toLowerCase()
  return users.value.filter(user =>
    user.full_name.toLowerCase().includes(search) ||
    user.username.toLowerCase().includes(search) ||
    user.role.toLowerCase().includes(search) ||
    (user.staff_level && user.staff_level.toLowerCase().includes(search)) ||
    user.created_at?.toLowerCase().includes(search)
  )
})

// Sort users
const sortedUsers = computed(() => {
  if (!sortColumn.value) {
    return filteredUsers.value
  }

  const sorted = [...filteredUsers.value].sort((a, b) => {
    const aVal = a[sortColumn.value!] ?? ''
    const bVal = b[sortColumn.value!] ?? ''

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return sorted
})

// Paginated data
const displayedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedUsers.value.slice(start, end)
})

// Total counts
const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value) || 1)
const startIndex = computed(() => {
  if (totalUsers.value === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalUsers.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Selected rows logic
const allRowsSelected = computed(() => {
  return displayedUsers.value.length > 0 &&
    displayedUsers.value.every(user => selectedRows.value.includes(user.id))
})

const someRowsSelected = computed(() => {
  return selectedRows.value.length > 0 && !allRowsSelected.value
})

const toggleAllRows = () => {
  if (allRowsSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      id => !displayedUsers.value.some(user => user.id === id)
    )
  } else {
    const newSelections = displayedUsers.value.map(user => user.id)
    selectedRows.value = [...new Set([...selectedRows.value, ...newSelections])]
  }
}

const toggleRow = (userId: number) => {
  const index = selectedRows.value.indexOf(userId)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(userId)
  }
}

// Sorting
const toggleSort = (column: keyof User) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Pagination methods
const previousPage = () => {
  if (hasPreviousPage.value) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
  }
}

// Watch page size changes
watch(pageSize, () => {
  currentPage.value = 1
})

// Watch total pages to ensure current page is valid
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = Math.max(1, newTotal)
  }
})

// Utility functions
const getIsActiveBadgeClass = (isActive: boolean | undefined) => {
  switch (isActive) {
    case true: return 'badge-success'
    case false: return 'badge-error'
    default: return 'badge-info'
  }
}

const getRoleBadgeClass = (role: User['role']) => {
  switch (role) {
    case 'admin': return 'badge-primary'
    case 'staff': return 'badge-info'
    case 'partner': return 'badge-warning'
    case 'customer': return 'badge-secondary'
    default: return 'badge-neutral'
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('lo-LA')
}

const deleteUser = async (userId: number) => {
  if (confirm('ຕ້ອງການລຶບຜູ້ໃຊ້ນີ້ບໍ?')) {
    try {
      // TODO: เรียก API delete user
      // await authStore.deleteUser(userId)

      // ✅ Refresh data
      await fetchUsers()

      selectedRows.value = selectedRows.value.filter(id => id !== userId)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບຜູ້ໃຊ້')
    }
  }
}

// Export CSV
const exportToCSV = () => {
  if (!displayedUsers.value.length) return

  const csvData = displayedUsers.value.map(user => ({
    ID: user.id,
    'ຊື່ ແລະ ນາມສະກຸນ': user.full_name,
    'ຊື່ຜູ້ໃຊ້': user.username,
    'ບົດບາດ': user.role,
    'ລະດັບພະນັກງານ': user.staff_level || 'N/A',
    'ສະຖານະ': user.is_active === true ? 'Active' : 'Inactive',
    'ວັນທີສ້າງ': formatDate(user.createdAt)
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `users_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

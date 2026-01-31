<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການສິດທິ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການສິດທິການເຂົ້າເຖິງຂອງຜູ້ໃຊ້</p>
      </div>
      <button class="btn btn-gradient btn-primary" @click="openAddPermissionModal">
        <span class="icon-[tabler--shield-plus] size-5"></span> ເພີ່ມສິດທິ
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="loading loading-spinner"></div>
    </div>

    <!-- Table -->
    <div v-else class="w-full overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>ຜູ້ໃຊ້</th>
            <th>ບົດບາດ</th>
            <th>ສິດທິທັງໝົດ</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="userPermission in displayedUserPermissions" :key="userPermission.user.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {{ userPermission.user.full_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium">{{ userPermission.user.full_name }}</div>
                  <div class="text-sm text-gray-500">@{{ userPermission.user.username }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="badge badge-soft" :class="getRoleBadgeClass(userPermission.user.role)">
                {{ userPermission.user.role }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1 max-w-xs">
                <span v-for="permission in userPermission.permissions" :key="permission.feature_id"
                  class="badge badge-soft badge-primary text-xs">
                  {{ permission.feature.feature_name }}
                </span>
                <span v-if="userPermission.permissions.length === 0" class="text-gray-400 text-sm">
                  ບໍ່ມີສິດທິ
                </span>
              </div>
            </td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-circle btn-text btn-sm" @click="openEditPermissionModal(userPermission)"
                  aria-label="Edit permissions">
                  <span class="icon-[tabler--edit] size-4"></span>
                </button>
                <button class="btn btn-circle btn-text btn-sm text-error"
                  @click="deleteAllPermissions(userPermission.user.id)" aria-label="Delete all permissions">
                  <span class="icon-[tabler--trash] size-4"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedUserPermissions.length === 0">
            <td colspan="4" class="text-center py-8 text-base-content/60">
              ບໍ່ພົບຂໍ້ມູນ
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
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
        <span class="px-2">ໜ້າ {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="nextPage">
          ຖັດໄປ
        </button>
      </div>
    </div>

    <!-- Add Permission Modal -->
    <!-- Add Permission Modal (อัปเดตแล้ว) -->
    <teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">ເພີ່ມສິດທິໃຫ້ຜູ້ໃຊ້</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- User Search - โครงสร้างเหมือน ChangePassword -->
          <div class="form-control mb-4">
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
                <input v-model="addModal.searchQuery" type="text" placeholder="ຄົ້ນຫາຊື່ ຫຼື ຊື່ຜູ້ໃຊ້..."
                  class="input input-bordered w-full pl-10 pr-4" role="combobox" aria-expanded="false"
                  @input="debounceAddSearch" @focus="handleAddFocus" />
                <span
                  class="icon-[tabler--search] text-base-content absolute start-3 top-1/2 size-4 shrink-0 -translate-y-1/2"></span>
              </div>

              <!-- Dropdown Results -->
              <div v-if="addModal.showDropdown && addModal.searchResults.length > 0"
                class="bg-white dark:bg-gray-800 rounded-box p-2 shadow-lg border border-gray-200 dark:border-gray-700 mt-1 max-h-60 overflow-y-auto"
                style="position: absolute; z-index: 1000; width: 100%; top: 100%; left: 0;">
                <div v-for="user in addModal.searchResults" :key="user.id"
                  class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                  @click="selectAddUser(user)">
                  <div
                    class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {{ user.full_name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800 dark:text-white">{{ user.full_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">@{{ user.username }}</div>
                  </div>
                  <span v-if="addModal.selectedUser?.id === user.id"
                    class="icon-[tabler--check] text-primary size-4"></span>
                </div>
              </div>

              <!-- No results -->
              <div v-else-if="addModal.showDropdown && addModal.searchResults.length === 0 && addModal.searchQuery"
                class="bg-white dark:bg-gray-800 rounded-box p-2 shadow-lg border border-gray-200 dark:border-gray-700 mt-1"
                style="position: absolute; z-index: 1000; width: 100%; top: 100%; left: 0;">
                <div class="px-3 py-2 text-gray-500 dark:text-gray-400">
                  ບໍ່ພົບຜູ້ໃຊ້
                </div>
              </div>
            </div>

            <!-- Selected User Display -->
            <div v-if="addModal.selectedUser"
              class="mt-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {{ addModal.selectedUser.full_name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-800 dark:text-white">{{ addModal.selectedUser.full_name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">@{{ addModal.selectedUser.username }}</div>
              </div>
              <button type="button" class="text-gray-400 hover:text-gray-600" @click="clearAddSelection">
                <span class="icon-[tabler--x] size-4"></span>
              </button>
            </div>
          </div>

          <!-- Permissions Selection -->
          <div class="mb-6">
            <label class="label">
              <span class="label-text font-medium">ເລືອກສິດທິ</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              <div v-for="feature in allFeatures" :key="feature.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                @click="toggleAddPermission(feature.id)">
                <input type="checkbox" :checked="addModal.selectedPermissions.includes(feature.id)"
                  class="checkbox checkbox-primary" @click.stop />
                <span class="text-sm">{{ feature.feature_name }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button class="btn btn-soft btn-secondary" @click="closeAddModal">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary"
              :disabled="!addModal.selectedUser || addModal.selectedPermissions.length === 0 || addModal.loading"
              @click="saveAddPermissions">
              <span v-if="addModal.loading" class="loading loading-spinner loading-xs"></span>
              <span v-else>ບັນທຶກ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Edit Permission Modal -->
    <teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">ແກ້ໄຂສິດທິ</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- User Info -->
          <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {{ editModal.user?.full_name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ editModal.user?.full_name }}</div>
                <div class="text-sm text-gray-500">@{{ editModal.user?.username }}</div>
              </div>
            </div>
          </div>

          <!-- Permissions Selection -->
          <div class="mb-6">
            <label class="label">
              <span class="label-text font-medium">ສິດທິທີ່ມີຢູ່</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              <div v-for="feature in allFeatures" :key="feature.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                @click="toggleEditPermission(feature.id)">
                <input type="checkbox" :checked="editModal.selectedPermissions.includes(feature.id)"
                  class="checkbox checkbox-primary" @click.stop />
                <span class="text-sm">{{ feature.feature_name }}</span>
                <!-- 👇 เพิ่ม debug info -->
    <span class="text-xs text-gray-400 ml-2">
      {{ editModal.selectedPermissions.includes(feature.id) ? '✓' : '✗' }}
    </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button class="btn btn-soft btn-secondary" @click="closeEditModal">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" :disabled="editModal.loading" @click="saveEditPermissions">
              <span v-if="editModal.loading" class="loading loading-spinner loading-xs"></span>
              <span v-else>ບັນທຶກ</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'

// Types
interface User {
  id: number
  full_name: string
  username: string
  role: string
}

interface Feature {
  id: number
  feature_name: string
  description: string | null
}

interface UserPermission {
  user_id: number
  feature_id: number
  can_access: number
  feature: Feature
}

interface UserWithPermissions {
  user: User
  permissions: UserPermission[]
}

// Reactive state
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// Mock data (replace with API calls)
const mockUsers: User[] = [
  { id: 1, full_name: 'ສົມຊາຍ ພົນສຸກ', username: 'somchai', role: 'admin' },
  { id: 2, full_name: 'ສົມສິງ ດຳດີ', username: 'somsing', role: 'staff' },
  { id: 3, full_name: 'ອຸດົມ ສີສົມບັດ', username: 'udom', role: 'partner' },
  { id: 4, full_name: 'ຈັນດາ ວົງສີ', username: 'chanda', role: 'customer' },
  { id: 5, full_name: 'ບຸນເຊີຍ ສຸກສົມ', username: 'bunsouy', role: 'staff' }
]

const mockFeatures: Feature[] = [
  { id: 1, feature_name: 'view_dashboard', description: 'ເບິ່ງแดຊບອດ' },
  { id: 2, feature_name: 'create_loan', description: 'ສ້າງສິນເຊື່ອ' },
  { id: 3, feature_name: 'approve_loan', description: 'ອະນຸມັດສິນເຊື່ອ' },
  { id: 4, feature_name: 'manage_users', description: 'ຈັດການຜູ້ໃຊ້' },
  { id: 5, feature_name: 'view_reports', description: 'ເບິ່ງລາຍງານ' },
  { id: 6, feature_name: 'export_data', description: 'ສົ່ງອອກຂໍ້ມູນ' }
]

const userPermissionsData = ref<UserWithPermissions[]>([
  {
    user: mockUsers[0],
    permissions: [
      { user_id: 1, feature_id: 1, can_access: 1, feature: mockFeatures[0] },
      { user_id: 1, feature_id: 2, can_access: 1, feature: mockFeatures[1] },
      { user_id: 1, feature_id: 3, can_access: 1, feature: mockFeatures[2] },
      { user_id: 1, feature_id: 4, can_access: 1, feature: mockFeatures[3] },
      { user_id: 1, feature_id: 5, can_access: 1, feature: mockFeatures[4] }
    ]
  },
  {
    user: mockUsers[1],
    permissions: [
      { user_id: 2, feature_id: 1, can_access: 1, feature: mockFeatures[0] },
      { user_id: 2, feature_id: 2, can_access: 1, feature: mockFeatures[1] }
    ]
  },
  {
    user: mockUsers[2],
    permissions: [
      { user_id: 3, feature_id: 1, can_access: 1, feature: mockFeatures[0] },
      { user_id: 3, feature_id: 5, can_access: 1, feature: mockFeatures[4] }
    ]
  }
])

// Computed properties
const displayedUserPermissions = computed(() => {
  console.log('Recomputing with data length:', userPermissionsData.value.length)
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return userPermissionsData.value.slice(start, end)
})

const totalUsers = computed(() => userPermissionsData.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalUsers.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)

// Add Modal state
// Add Modal state (อัปเดตให้เหมือน ChangePassword)
const addModal = reactive({
  searchQuery: '',
  showDropdown: false, // 👈 เพิ่ม showDropdown
  searchResults: [] as User[],
  selectedUser: null as User | null,
  selectedPermissions: [] as number[],
  loading: false
})

// Edit Modal state
const editModal = reactive({
  user: null as User | null,
  selectedPermissions: [] as number[],
  loading: false
})

// All features (for permission selection)
const allFeatures = ref<Feature[]>(mockFeatures)

// Utility functions
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'badge-primary'
    case 'staff': return 'badge-info'
    case 'partner': return 'badge-warning'
    case 'customer': return 'badge-secondary'
    default: return 'badge-neutral'
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
watch(pageSize, () => {
  currentPage.value = 1
})

// Add Modal methods
let addDebounceTimer: NodeJS.Timeout | null = null
const debounceAddSearch = () => {
  if (addDebounceTimer) {
    clearTimeout(addDebounceTimer)
  }
  addDebounceTimer = setTimeout(() => {
    performAddSearch()
  }, 300)
}

const performAddSearch = () => {
  if (!addModal.searchQuery.trim()) {
    addModal.searchResults = []
    return
  }

  const query = addModal.searchQuery.toLowerCase()
  // Filter users that don't already have permissions
  const existingUserIds = userPermissionsData.value.map(up => up.user.id)
  addModal.searchResults = mockUsers
    .filter(user => !existingUserIds.includes(user.id))
    .filter(user =>
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
}

// Handle focus (เหมือน ChangePassword)
const handleAddFocus = () => {
  addModal.showDropdown = true
  if (addModal.searchQuery) {
    performAddSearch()
  } else {
    // Show all available users (not already having permissions)
    const existingUserIds = userPermissionsData.value.map(up => up.user.id)
    addModal.searchResults = mockUsers.filter(user => !existingUserIds.includes(user.id))
  }
}

const selectAddUser = (user: User) => {
  addModal.selectedUser = user
  addModal.searchQuery = user.full_name
  addModal.showDropdown = false
}

const clearAddSelection = () => {
  addModal.selectedUser = null
  addModal.searchQuery = ''
  addModal.searchResults = []
  addModal.selectedPermissions = []
}

const toggleAddPermission = (featureId: number) => {
  const index = addModal.selectedPermissions.indexOf(featureId)
  if (index > -1) {
    addModal.selectedPermissions.splice(index, 1)
  } else {
    addModal.selectedPermissions.push(featureId)
  }
}

const openAddPermissionModal = () => {
  showAddModal.value = true
  addModal.searchQuery = ''
  addModal.searchResults = []
  addModal.selectedUser = null
  addModal.selectedPermissions = []
}

const closeAddModal = () => {
  showAddModal.value = false
}

// เพิ่มฟังก์ชันนี้ใน script setup
const refreshUsers = () => {
  isLoading.value = true
  // จำลองการโหลดข้อมูลใหม่ (ในกรณีใช้ API จริงให้เรียก API ที่นี่)
  setTimeout(() => {
    // สำหรับ mock data: แค่ copy array ใหม่เพื่อ trigger reactivity
    // mockUserPermissions.length = 0
    // mockUserPermissions.push(...mockUserPermissions)

    // const newMockData = [...mockUserPermissions]
    // mockUserPermissions.splice(0, mockUserPermissions.length, ...newMockData)

    // ✅ สร้าง deep copy ใหม่ทั้งหมด
    const newMockData = JSON.parse(JSON.stringify(userPermissionsData.value))
    userPermissionsData.value.splice(0, userPermissionsData.value.length, ...newMockData)
    currentPage.value = 1 // รีเซ็ตกลับไปหน้าแรก
    isLoading.value = false
    console.log('ManagePermissions: รีโหลดข้อมูลใหม่เรียบร้อย')
  }, 500)
}

const saveAddPermissions = async () => {
  if (!addModal.selectedUser) return

  addModal.loading = true
  try {
    // Simulate API call
    console.log('Adding permissions:', {
      userId: addModal.selectedUser.id,
      permissions: addModal.selectedPermissions
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add to mock data
    const newUserPermission: UserWithPermissions = {
      user: addModal.selectedUser,
      permissions: addModal.selectedPermissions.map(featureId => ({
        user_id: addModal.selectedUser!.id,
        feature_id: featureId,
        can_access: 1,
        feature: mockFeatures.find(f => f.id === featureId)!
      }))
    }

    userPermissionsData.value.push(newUserPermission)

    // Close modal and reset
    closeAddModal()
    alert('ເພີ່ມສິດທິສຳເລັດ!')

    // 👇 เพิ่มบรรทัดนี้
    refreshUsers()

  } catch (error) {
    console.error('Error adding permissions:', error)
    alert('ເກີດຂໍ້ຜິດພາດການເພີ່ມສິດທິ')
  } finally {
    addModal.loading = false
  }
}

// Edit Modal methods
const openEditPermissionModal = (userPermission: UserWithPermissions) => {
  showEditModal.value = true
  editModal.user = userPermission.user
  editModal.selectedPermissions = userPermission.permissions.map(p => p.feature_id)

  // 👇 เพิ่ม debug log
  console.log('Opening edit modal for user:', userPermission.user.full_name)
  console.log('Current permissions:', editModal.selectedPermissions)
}

const closeEditModal = () => {
  showEditModal.value = false
}

const toggleEditPermission = (featureId: number) => {
  const index = editModal.selectedPermissions.indexOf(featureId)
  if (index > -1) {
    editModal.selectedPermissions.splice(index, 1)
  } else {
    editModal.selectedPermissions.push(featureId)
  }
}

const saveEditPermissions = async () => {
  if (!editModal.user) return

  editModal.loading = true
  try {
    console.log('Updating permissions:', {
      userId: editModal.user.id,
      permissions: editModal.selectedPermissions
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    const userIndex = userPermissionsData.value.findIndex(up => up.user.id === editModal.user!.id)

    if (userIndex !== -1) {
      // ✅ สร้าง permissions ใหม่ทั้งหมด
      const newPermissions = editModal.selectedPermissions.map(featureId => ({
        user_id: editModal.user!.id,
        feature_id: featureId,
        can_access: 1,
        feature: mockFeatures.find(f => f.id === featureId)!
      }))

      // ✅ สร้าง user permission object ใหม่ทั้งหมด
      const updatedUserPermission = {
        ...userPermissionsData.value[userIndex],
        permissions: newPermissions
      }

      // ✅ สร้าง array ใหม่ทั้งหมดด้วย spread operator
      const newArray = [...userPermissionsData.value]
      newArray[userIndex] = updatedUserPermission

      // ✅ อัปเดตด้วยการ assign ใหม่ทั้งหมด
      userPermissionsData.value = newArray

      console.log('Successfully updated permissions')
    }

    closeEditModal()
    alert('ແກ້ໄຂສິດທິສຳເລັດ!')
    refreshUsers()

  } catch (error) {
    console.error('Error updating permissions:', error)
    alert('ເກີດຂໍ້ຜິດພາດການແກ້ໄຂສິດທິ')
  } finally {
    editModal.loading = false
  }
}

// Delete all permissions
const deleteAllPermissions = (userId: number) => {
  if (confirm('ຕ້ອງການລຶບສິດທິທັງໝົດຂອງຜູ້ໃຊ້ນີ້ບໍ?')) {
    const userIndex = userPermissionsData.value.findIndex(up => up.user.id === userId)
    if (userIndex !== -1) {
      userPermissionsData.value.splice(userIndex, 1)
      alert('ລຶບສິດທິສຳເລັດ!')

      refreshUsers()
    }
  }
}

// Close dropdowns when clicking outside
// Close dropdown when clicking outside (เหมือน ChangePassword)
const handleClickOutside = (event: MouseEvent) => {
  const comboBox = document.querySelector('[data-combo-box]')
  if (comboBox && !comboBox.contains(event.target as Node)) {
    addModal.showDropdown = false
  }
}

watch(() => addModal.showDropdown, (newVal) => {
  if (newVal) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">ຈັດການສິດທິ</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">ຈັດການສິດທິການເຂົ້າເຖິງຂອງຜູ້ໃຊ້</p>
      </div>
      <!-- <button class="btn btn-gradient btn-primary" @click="openAddPermissionModal">
        <span class="icon-[tabler--shield-plus] size-5"></span> ເພີ່ມສິດທິ
      </button> -->
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
                  {{ getFeatureDisplayName(permission.feature.feature_name) }}
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
    <teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">ເພີ່ມສິດທິໃຫ້ຜູ້ໃຊ້</h3>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- User Search -->
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
              <label v-for="feature in allFeatures" :key="feature.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" :checked="addModal.selectedPermissions.includes(feature.id)" :value="feature.id"
                  @change="toggleAddPermission(feature.id)" class="checkbox checkbox-primary" />
                <span class="text-sm">{{ getFeatureDisplayName(feature.feature_name) }}</span>
              </label>
            </div>
          </div>

          <!-- ✅ Debug Panel -->
          <!-- <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            <div class="font-bold mb-2">🔍 Debug Info:</div>
            <div>Selected User: {{ addModal.selectedUser?.username || 'None' }}</div>
            <div>Selected Count: {{ addModal.selectedPermissions.length }}</div>
            <div>Selected IDs: {{ addModal.selectedPermissions.join(', ') || 'None' }}</div>
            <div class="mt-2">
              <div class="font-semibold">Selected Features:</div>
              <div v-for="id in addModal.selectedPermissions" :key="id" class="ml-2">
                - {{allFeatures.find(f => f.id === id)?.feature_name || `Unknown(${id})`}}
              </div>
            </div>
          </div> -->

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
              <label v-for="feature in allFeatures" :key="feature.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" :checked="editModal.selectedPermissions.includes(feature.id)" :value="feature.id"
                  @change="toggleEditPermission(feature.id)" class="checkbox checkbox-primary" />
                <span class="text-sm">{{ getFeatureDisplayName(feature.feature_name) }}</span>
              </label>
            </div>
          </div>

          <!-- ✅ Debug Panel -->
          <!-- <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            <div class="font-bold mb-2">🔍 Debug Info:</div>
            <div>User: {{ editModal.user?.username || 'None' }}</div>
            <div>Selected Count: {{ editModal.selectedPermissions.length }}</div>
            <div>Selected IDs: {{ editModal.selectedPermissions.join(', ') || 'None' }}</div>
            <div class="mt-2">
              <div class="font-semibold">Selected Features:</div>
              <div v-for="id in editModal.selectedPermissions" :key="id" class="ml-2">
                - {{allFeatures.find(f => f.id === id)?.feature_name || `Unknown(${id})`}}
              </div>
            </div>
          </div> -->

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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { alert } from '@/utils/alert'

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

// Stores
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

// Comment out mock data
/*
const mockUsers: User[] = [
  { id: 1, full_name: 'ສົມຊາຍ ພົນສຸກ', username: 'somchai', role: 'admin' },
  { id: 2, full_name: 'ສົມສິງ ດຳດີ', username: 'somsing', role: 'staff' },
  { id: 3, full_name: 'ອຸດົມ ສີສົມບັດ', username: 'udom', role: 'partner' },
  { id: 4, full_name: 'ຈັນດາ ວົງສີ', username: 'chanda', role: 'customer' },
  { id: 5, full_name: 'ບຸນເຊີຍ ສຸກສົມ', username: 'bunsouy', role: 'staff' }
]

// ✅ อัปเดต mockFeatures ตามข้อมูลจริงจากตาราง
const mockFeatures: Feature[] = [
  { id: 1, feature_name: 'user_view', description: 'ດູລາຍຊື່ຜູ້ໃຊ້ງານໃນລະບົບ' },
  { id: 2, feature_name: 'user_manage', description: 'ຈັດການສ້າງ/ແກ້ໄຂ/ລະງັບ User' },
  { id: 3, feature_name: 'permission_manage', description: 'ຈັດການສິດທິການໃຊ້ງານ (Permissions)' },
  { id: 4, feature_name: 'loan_view_all', description: 'ດູຄຳຂໍສິນເຊື່ອທັງໝົດໃນລະບົບ' },
  { id: 5, feature_name: 'loan_view_assigned', description: 'ດູຄຳຂໍສິນເຊື່ອທີ່ຕົນເອງຮັບຜິດຊອບ' },
  { id: 6, feature_name: 'loan_create', description: 'ສ້າງຄຳຂໍສິນເຊື່ອໃໝ່' },
  { id: 7, feature_name: 'loan_edit', description: 'ແກ້ໄຂລາຍລະອຽດຄຳຂໍສິນເຊື່ອ' },
  { id: 8, feature_name: 'loan_approve', description: 'ອະນຸມັດຄຳຂໍສິນເຊື່ອ (Approver Only)' },
  { id: 9, feature_name: 'loan_reject', description: 'ປະຕິເສດຄຳຂໍສິນເຊື່ອ' },
  { id: 10, feature_name: 'doc_upload', description: 'ອັບໂຫຼດເອກະສານປະກອບຄຳຂໍ' },
  { id: 11, feature_name: 'doc_view', description: 'ດູໄຟລ໌ເອກະສານແນບ' },
  { id: 12, feature_name: 'doc_delete', description: 'ລຶບໄຟລ໌ເອກະສານ' },
  { id: 13, feature_name: 'partner_manage', description: 'ຈັດການຂໍ້ມູນ Partner ແລະຮ້ານຄ້າ' },
  { id: 14, feature_name: 'shop_view_report', description: 'ດູລາຍງານຍອດຂາຍ ແລະຄ່າຄອມມິດຊັ່ນ' },
  { id: 15, feature_name: 'cust_profile_view', description: 'ດູຂໍ້ມູນໂປຣໄຟລ໌ສ່ວນຕົວ' },
  { id: 16, feature_name: 'cust_loan_history', description: 'ດູປະວັດການຂໍສິນເຊື່ອຂອງຕົນເອງ' },
  { id: 17, feature_name: 'payment_proof_upload', description: 'ສົ່ງຫຼັກຖານການຊຳລະເງິນ' },
  { id: 18, feature_name: 'user_create', description: 'ສິດທິໃນການສ້າງບັນຊີຜູ້ໃຊ້ງານໃໝ່ (Staff/Partner/customer)' },
  { id: 19, feature_name: 'payment_view', description: 'ດູປະວັດການຊຳລະເງິນ' },
  { id: 20, feature_name: 'payment_create', description: 'ບັນທຶກການຊຳລະເງິນໃໝ່' },
  { id: 21, feature_name: 'payment_verify', description: 'ກວດສອບ ແລະ ຢືນຢັນສລິບໂອນເງິນ' }
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
*/

// Use store data instead of mock data
// แปลงโครงสร้างข้อมูลให้ตรงกับที่ใช้ใน template
const userPermissionsData = computed(() => {
  const users = authStore.allUsers
  if (!Array.isArray(users)) return []

  // ✅ แปลงเป็นโครงสร้างที่ template ใช้
  return users.map((user: any) => {
    // 🟢 ตรวจสอบหาว่า Backend ส่งข้อมูลสิทธิ์มาในชื่ออะไร (features หรือ user_permissions)
    const rawPermissions = user.features || user.user_permissions || [];
    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role
      },
      permissions: rawPermissions.map((item: any) => {
        // 🟢 กรณีดึงจาก user.features (จาก Log มี dataValues ซ้อนอยู่)
        if (item.feature_name || item.dataValues?.feature_name) {
          const fData = item.dataValues || item; // ถ้ามี dataValues ให้ใช้ก้อนนั้น
          return {
            user_id: user.id,
            feature_id: fData.id,
            can_access: item.can_access ? 1 : 0,
            feature: {
              id: fData.id,
              feature_name: fData.feature_name,
              description: fData.description
            }
          };
        }

        // 🟢 กรณีดึงจาก user.user_permissions (Fallback เผื่อไว้)
        return {
          user_id: user.id,
          feature_id: item.feature_id,
          can_access: item.can_access ? 1 : 0,
          feature: {
            id: item.feature?.id || item.feature_id,
            feature_name: item.feature?.feature_name || 'Unknown',
            description: item.feature?.description || ''
          }
        };
      })
    };
  });
})

// Computed properties
const displayedUserPermissions = computed(() => {
  const data = userPermissionsData.value
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// const totalUsers = computed(() => userPermissionsData.value.length)
const totalUsers = computed(() => {
  const data = userPermissionsData.value
  return Array.isArray(data) ? data.length : 0
})
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalUsers.value))
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => currentPage.value < totalPages.value)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)

// // Add Modal state
// const addModal = reactive({
//   searchQuery: '',
//   showDropdown: false,
//   searchResults: [] as User[],
//   selectedUser: null as User | null,
//   selectedPermissions: [] as number[],
//   loading: false
// })

// // Edit Modal state
// const editModal = reactive({
//   user: null as User | null,
//   selectedPermissions: [] as number[],
//   loading: false
// })
// ✅ ใช้ ref แทน reactive สำหรับ modal state
const addModal = ref({
  searchQuery: '',
  showDropdown: false,
  searchResults: [] as User[],
  selectedUser: null as User | null,
  selectedPermissions: [] as number[], // ✅ เป็น array ธรรมดา
  loading: false
})

const editModal = ref({
  user: null as User | null,
  selectedPermissions: [] as number[], // ✅ เป็น array ธรรมดา
  loading: false
})

// // ✅ เพิ่ม computed function
// const isFeatureSelected = (featureId: number): boolean => {
//   return editModal.value.selectedPermissions.includes(featureId)
// }

// // ✅ Helper functions สำหรับจัดการ permissions
// const togglePermission = (permissions: number[], featureId: number): number[] => {
//   const index = permissions.indexOf(featureId)
//   if (index > -1) {
//     return permissions.filter((_, i) => i !== index)
//   } else {
//     return [...permissions, featureId]
//   }
// }

// All features (from store)
const allFeatures = computed(() => permissionStore.features)

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

// ✅ เพิ่มฟังก์ชันแสดงชื่อสิทธิ์เป็นภาษาลาว
const getFeatureDisplayName = (featureName: string): string => {
  const displayNames: Record<string, string> = {
    'user_view': 'ເບີ່ງລາຍຊື່ຜູ້ໃຊ້',
    'user_manage': 'ຈັດການຜູ້ໃຊ້',
    'permission_manage': 'ຈັດການສິດທິ',
    'loan_view_all': 'ເບີ່ງສິນເຊື່ອທັງໝົດ',
    'loan_view_assigned': 'ເບີ່ງສິນເຊື່ອທີ່ຮັບຜິດຊອບ',
    'loan_create': 'ສ້າງສິນເຊື່ອ',
    'loan_edit': 'ແກ້ໄຂສິນເຊື່ອ',
    'loan_approve': 'ອະນຸມັດສິນເຊື່ອ',
    'loan_reject': 'ປະຕິເສດສິນເຊື່ອ',
    'doc_upload': 'ອັບໂຫຼດເອກະສານ',
    'doc_view': 'ເບີ່ງເອກະສານ',
    'doc_delete': 'ລຶບເອກະສານ',
    'partner_manage': 'ຈັດການຮ້ານຄ້າ',
    'shop_view_report': 'ເບີ່ງລາຍງານ',
    'cust_profile_view': 'ເບີ່ງໂປຣໄຟລ໌',
    'cust_loan_history': 'ເບີ່ງປະວັດສິນເຊື່ອ',
    'payment_proof_upload': 'ສົ່ງຫຼັກຖານຊຳລະ',
    'user_create': 'ສ້າງຜູ້ໃຊ້ໃໝ່',
    'payment_view': 'ເບີ່ງການຊຳລະ',
    'payment_create': 'ບັນທຶກການຊຳລະ',
    'payment_verify': 'ກວດສອບການຊຳລະ',
    'user_changepass': 'ປ່ຽນລະຫັດຜ່ານ',
    'view_admin_dashboard': 'ເບີ່ງແຜງຄວບຄຸມ Admin',
    'view_partner_dashboard': 'ເບີ່ງແຜງຄວບຄຸມ Partner',
    'loan_override': 'ສິດທິພິເສດ (IT Support) ໃນການແກ້ໄຂຂໍ້ມູນສິນເຊື່ອສຸກເສີນຫຼັງອະນຸມັດ',
    'loan_print': 'ພິມເອກະສານສິນເຊື່ອ'
  }

  return displayNames[featureName] || featureName
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

// Fetch data on mount
onMounted(async () => {
  isLoading.value = true
  try {

    await Promise.all([
      authStore.fetchAllUsers(),
      permissionStore.fetchFeatures()
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການດຶງຂໍ້ມູນ')
  } finally {
    isLoading.value = false
  }
})

// Add Modal methods
let addDebounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceAddSearch = () => {
  if (addDebounceTimer) {
    clearTimeout(addDebounceTimer)
  }
  addDebounceTimer = setTimeout(() => {
    performAddSearch()
  }, 300)
}

const performAddSearch = () => {
  if (!addModal.value.searchQuery.trim()) {
    addModal.value.searchResults = []
    return
  }

  const query = addModal.value.searchQuery.toLowerCase()
  // Filter users that don't already have permissions
  // ✅ ดึง ID ของผู้ใช้ที่มีสิทธิ์แล้ว (จาก user_permissions)
  const existingUserIds = userPermissionsData.value
    .filter(user => user.permissions && user.permissions.length > 0)
    .map(user => user.user.id)

  // ✅ กรองผู้ใช้ที่ยังไม่มีสิทธิ์ + ค้นหา
  addModal.value.searchResults = authStore.users
    .filter(user => !existingUserIds.includes(user.id))
    .filter(user =>
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
}

const handleAddFocus = () => {
  addModal.value.showDropdown = true
  if (addModal.value.searchQuery) {
    performAddSearch()
  } else {
    // Show all available users (not already having permissions)
    // ✅ แสดงผู้ใช้ที่ยังไม่มีสิทธิ์ทั้งหมด
    const existingUserIds = userPermissionsData.value
      .filter(user => user.permissions && user.permissions.length > 0)
      .map(user => user.user.id)
    addModal.value.searchResults = authStore.users.filter(user => !existingUserIds.includes(user.id))
  }
}

const selectAddUser = (user: User) => {
  addModal.value.selectedUser = user
  addModal.value.searchQuery = user.full_name
  addModal.value.showDropdown = false
}

const clearAddSelection = () => {
  addModal.value.selectedUser = null
  addModal.value.searchQuery = ''
  addModal.value.searchResults = []
  addModal.value.selectedPermissions = []
}

const toggleAddPermission = (featureId: number) => {
  console.log('━━━ Toggle Add Permission ━━━')
  console.log('Feature ID:', featureId)
  console.log('Before:', JSON.stringify(addModal.value.selectedPermissions))

  // ✅ สร้าง array ใหม่ทุกครั้งเพื่อให้ Vue reactive ทำงาน
  const currentPermissions = [...addModal.value.selectedPermissions]
  const index = currentPermissions.indexOf(featureId)

  if (index > -1) {
    console.log('Action: REMOVE')
    // ลบออก
    currentPermissions.splice(index, 1)
  } else {
    console.log('Action: ADD')
    // เพิ่มเข้าไป
    currentPermissions.push(featureId)
  }

  // ✅ Assign array ใหม่เพื่อ trigger reactivity
  addModal.value.selectedPermissions = currentPermissions

  console.log('After:', JSON.stringify(addModal.value.selectedPermissions))
  console.log('Feature:', allFeatures.value.find(f => f.id === featureId)?.feature_name)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

const openAddPermissionModal = () => {
  showAddModal.value = true
  addModal.value.searchQuery = ''
  addModal.value.searchResults = []
  addModal.value.selectedUser = null
  addModal.value.selectedPermissions = []
}

const closeAddModal = () => {
  showAddModal.value = false
}

const refreshUsers = async () => {
  isLoading.value = true
  try {
    // ✅ ตรวจสอบว่าฟังก์ชันมีอยู่จริง
    if (typeof authStore.fetchAllUsers !== 'function') {
      throw new Error('authStore.fetchAllUsers is not available')
    }
    await authStore.fetchAllUsers()
    currentPage.value = 1
  } catch (error) {
    console.error('Error refreshing users:', error)
  } finally {
    isLoading.value = false
  }
}

const saveAddPermissions = async () => {
  if (!addModal.value.selectedUser) return

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💾 [SAVE ADD] Starting save process...')
  console.log('User:', {
    id: addModal.value.selectedUser.id,
    username: addModal.value.selectedUser.username
  })
  console.log('Selected Permissions:', JSON.stringify(addModal.value.selectedPermissions))

  addModal.value.loading = true
  try {
    // const permissionsData = addModal.selectedPermissions.map(featureId => ({
    //   user_id: addModal.selectedUser!.id,
    //   feature_id: featureId,
    //   can_access: 1
    // }))
    // ✅ ถูกต้อง: ส่งแค่ array ของ feature IDs
    // ✅ ลบค่าซ้ำ และ sort
    const featureIds = [...new Set(addModal.value.selectedPermissions)].sort((a, b) => a - b)

    console.log('Feature IDs (cleaned):', featureIds)
    console.log('Feature Details:', featureIds.map(id => {
      const feature = allFeatures.value.find(f => f.id === id)
      return {
        id,
        name: feature?.feature_name || 'Unknown'
      }
    }))

    console.log('🚀 Calling API with:', {
      userId: addModal.value.selectedUser.id,
      featureIds,
      count: featureIds.length
    })

    await permissionStore.assignPermissions(addModal.value.selectedUser.id, featureIds)

    closeAddModal()
    await refreshUsers()
    alert.success('ເພີ່ມສິດທິສຳເລັດ!')

  } catch (error) {
    console.error('Error adding permissions:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການເພີ່ມສິດທິ')
  } finally {
    addModal.value.loading = false
  }
}

// Edit Modal methods
const openEditPermissionModal = (userPermission: UserWithPermissions) => {
  showEditModal.value = true
  editModal.value.user = userPermission.user
  // editModal.selectedPermissions = userPermission.permissions.map(p => p.feature_id)
  // ✅ ดึง feature_id จาก permissions
  editModal.value.selectedPermissions = userPermission.permissions
    .map((p: any) => p.feature_id)
    .filter((id: number) => id !== undefined)
}

const closeEditModal = () => {
  showEditModal.value = false
}

const toggleEditPermission = (featureId: number) => {
  console.log('━━━ Toggle Edit Permission ━━━')
  console.log('Feature ID:', featureId)
  console.log('Before:', JSON.stringify(editModal.value.selectedPermissions))

  // ✅ สร้าง array ใหม่ทุกครั้ง
  const currentPermissions = [...editModal.value.selectedPermissions]
  const index = currentPermissions.indexOf(featureId)

  if (index > -1) {
    console.log('Action: REMOVE')
    currentPermissions.splice(index, 1)
  } else {
    console.log('Action: ADD')
    currentPermissions.push(featureId)
  }

  // ✅ Assign array ใหม่
  editModal.value.selectedPermissions = currentPermissions

  console.log('After:', JSON.stringify(editModal.value.selectedPermissions))
  console.log('Feature:', allFeatures.value.find(f => f.id === featureId)?.feature_name)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// ✅ เพิ่ม watcher เพื่อ debug
watch(
  () => addModal.value.selectedPermissions,
  (newValue) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🟢 [ADD MODAL] Permissions Changed:')
    console.log('  Count:', newValue.length)
    console.log('  IDs:', JSON.stringify(newValue))
    console.log('  Features:', newValue.map(id => {
      const feature = allFeatures.value.find(f => f.id === id)
      return feature ? `${feature.feature_name} (${id})` : `Unknown (${id})`
    }))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  },
  { deep: true }
)

watch(
  () => editModal.value.selectedPermissions,
  (newValue) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 [EDIT MODAL] Permissions Changed:')
    console.log('  Count:', newValue.length)
    console.log('  IDs:', JSON.stringify(newValue))
    console.log('  Features:', newValue.map(id => {
      const feature = allFeatures.value.find(f => f.id === id)
      return feature ? `${feature.feature_name} (${id})` : `Unknown (${id})`
    }))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  },
  { deep: true }
)

const saveEditPermissions = async () => {
  if (!editModal.value.user) return

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💾 [SAVE EDIT] Starting save process...')
  console.log('User:', {
    id: editModal.value.user.id,
    username: editModal.value.user.username
  })
  console.log('Selected Permissions:', JSON.stringify(editModal.value.selectedPermissions))


  editModal.value.loading = true
  try {
    // const permissionsData = editModal.selectedPermissions.map(featureId => ({
    //   user_id: editModal.user!.id,
    //   feature_id: featureId,
    //   can_access: 1
    // }))
    // ✅ ตรวจสอบค่าที่จะส่ง
    // ✅ ใช้ selectedPermissions โดยตรง (ไม่ต้อง map)
    const featureIds = [...new Set(editModal.value.selectedPermissions)].sort((a, b) => a - b)

    console.log('Feature IDs (cleaned):', featureIds)
    console.log('Feature Details:', featureIds.map(id => {
      const feature = allFeatures.value.find(f => f.id === id)
      return {
        id,
        name: feature?.feature_name || 'Unknown'
      }
    }))

    console.log('🚀 Calling API with:', {
      userId: editModal.value.user.id,
      featureIds,
      count: featureIds.length
    })

    await permissionStore.assignPermissions(editModal.value.user.id, featureIds)

    closeEditModal()
    await refreshUsers()
    alert.success('ແກ້ໄຂສິດທິສຳເລັດ!')

  } catch (error) {
    console.error('Error updating permissions:', error)
    alert.error('ເກີດຂໍ້ຜິດພາດການແກ້ໄຂສິດທິ')
  } finally {
    editModal.value.loading = false
  }
}

// Delete all permissions
const deleteAllPermissions = async (userId: number) => {
  if (await alert.confirm('ຕ້ອງການລຶບສິດທິທັງໝົດຂອງຜູ້ໃຊ້ນີ້ບໍ?')) {
    try {
      await permissionStore.deleteAllUserPermissions(userId)
      await refreshUsers()
      alert.success('ລຶບສິດທິສຳເລັດ!')
    } catch (error) {
      console.error('Error deleting permissions:', error)
      alert.error('ເກີດຂໍ້ຜິດພາດການລຶບສິດທິ')
    }
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const comboBox = document.querySelector('[data-combo-box]')
  if (comboBox && !comboBox.contains(event.target as Node)) {
    addModal.value.showDropdown = false
  }
}

watch(() => addModal.value.showDropdown, (newVal) => {
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

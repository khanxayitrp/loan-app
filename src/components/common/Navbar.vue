<template>
  <div>
    <nav class="navbar bg-base-100 rounded-box shadow-base-300/20 shadow-sm">
      <div class="flex flex-1 items-center">
      </div>
      <div class="navbar-end flex items-center gap-4">

        <!-- 🔔 Notification Dropdown -->
        <!-- 🔔 Notification Dropdown -->
        <div class="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
          <button id="dropdown-scrollable" type="button"
            class="dropdown-toggle btn btn-text btn-circle dropdown-open:bg-base-content/10 size-10"
            aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown" @click="openNotifications">
            <div class="indicator">

              <!-- 🟢 แก้ไข: เปลี่ยนเป็น Badge แสดงจำนวน และดักเคสถ้าเกิน 99 ให้แสดงเป็น 99+ -->
              <span v-if="notificationStore.unreadCount > 0"
                class="indicator-item badge badge-error badge-sm text-white font-bold px-1.5">
                {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
              </span>

              <span class="icon-[tabler--bell] text-base-content size-5.5"></span>
            </div>
          </button>

          <div class="dropdown-menu dropdown-open:opacity-100 hidden w-72 md:w-96" role="menu"
            aria-orientation="vertical" aria-labelledby="dropdown-scrollable">
            <div class="dropdown-header flex justify-between items-center">
              <h6 class="text-base-content text-base font-bold">ການແຈ້ງເຕືອນ</h6>
              <span class="badge badge-primary badge-sm" v-if="notificationStore.unreadCount > 0">
                {{ notificationStore.unreadCount }} ໃໝ່
              </span>
            </div>

            <div class="overflow-y-auto overflow-x-hidden text-base-content/80 max-h-72">
              <!-- Loading State -->
              <div v-if="notificationStore.isLoading" class="p-4 text-center text-sm text-gray-500">
                <span class="loading loading-spinner loading-sm"></span> ກຳລັງໂຫຼດ...
              </div>

              <!-- Empty State (ກໍລະນີບໍ່ມີຂໍ້ມູນເລີຍ) -->
              <div v-else-if="notificationStore.notifications.length === 0"
                class="p-4 text-center text-sm text-gray-500">
                ບໍ່ມີການແຈ້ງເຕືອນ
              </div>

              <!-- Empty State (ກໍລະນີອ່ານໝົດແລ້ວ) -->
              <div v-else-if="unreadNotifications.length === 0" class="p-4 text-center text-sm text-gray-500">
                ບໍ່ມີການແຈ້ງເຕືອນໃໝ່
              </div>

              <!-- Data State (ສະແດງສະເພາະທີ່ຍັງບໍ່ໄດ້ອ່ານ) -->
              <div v-else>
                <div v-for="notif in unreadNotifications" :key="notif.id"
                  class="dropdown-item flex flex-col items-start gap-1 cursor-pointer border-b border-base-200 last:border-0 p-3 transition-colors hover:bg-base-200 whitespace-normal bg-primary/5"
                  @click="handleNotificationClick(notif)">
                  <div class="flex items-start justify-between w-full gap-2">
                    <!-- ບັງຄັບໃຊ້ສີ text-gray-800 ແລະ ປ້ອງກັນຄ່າ null -->
                    <h6 class="text-sm font-semibold pr-2 text-gray-800 dark:text-gray-200">
                      {{ notif.title || 'ບໍ່ມີຫົວຂໍ້ແຈ້ງເຕືອນ' }}
                    </h6>
                    <div class="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0"></div>
                  </div>
                  <!-- ບັງຄັບໃຊ້ສີ text-gray-600 -->
                  <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 w-full">
                    {{ notif.body || 'ບໍ່ມີລາຍລະອຽດ...' }}
                  </p>
                  <span class="text-[10px] text-gray-400 mt-1">{{ formatTime(notif.created_at) }}</span>
                </div>
              </div>
            </div>

            <router-link to="/notifications" class="dropdown-footer justify-center gap-1">
              <span class="icon-[tabler--eye] size-4"></span>
              ເບິ່ງທັງໝົດ
            </router-link>
          </div>
        </div>

        <!-- 👤 User Dropdown -->
        <div class="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
          <button id="dropdown-avatar" type="button" class="dropdown-toggle flex items-center" aria-haspopup="menu"
            aria-expanded="false" aria-label="Dropdown">
            <div class="avatar">
              <div class="size-9.5 rounded-full bg-base-300">
                <img :src="authStore.user?.avatar || 'https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png'"
                  alt="avatar" />
              </div>
            </div>
          </button>

          <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-60" role="menu" aria-orientation="vertical"
            aria-labelledby="dropdown-avatar">

            <li class="dropdown-header gap-2">
              <div class="avatar">
                <div class="w-10 rounded-full bg-base-300">
                  <img :src="authStore.user?.avatar || 'https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png'"
                    alt="avatar" />
                </div>
              </div>
              <div>
                <h6 class="text-base-content text-base font-semibold">
                  {{ authStore.user?.full_name || 'Loading...' }}
                </h6>
                <small class="text-base-content/50 capitalize">
                  {{ authStore.user?.role || 'User' }}
                </small>
              </div>
            </li>

            <li>
              <button class="dropdown-item" @click="isAvatarModalOpen = true">
                <span class="icon-[tabler--user-circle]"></span>
                ປ່ຽນຮູບໂປຣໄຟລ໌
              </button>
            </li>

            <li>
              <router-link class="dropdown-item" to="/changeMyPassword">
                <span class="icon-[tabler--password-user]"></span>
                ປ່ຽນລະຫັດຜ່ານ
              </router-link>
            </li>

            <li class="dropdown-footer gap-2">
              <button class="btn btn-error btn-soft btn-block" @click="handleLogout">
                <span class="icon-[tabler--logout]"></span>
                ອອກຈາກລະບົບ
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <!-- 🟢 Modal สำหรับเลือก Avatar -->
    <div v-if="isAvatarModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-base-100 rounded-box w-full max-w-md p-6 shadow-lg">
        <h3 class="text-lg font-bold mb-4 text-center">ເລືອກຮູບໂປຣໄຟລ໌ຂອງທ່ານ</h3>

        <div class="grid grid-cols-5 gap-4 mb-6">
          <div v-for="(avatar, index) in availableAvatars" :key="index"
            class="avatar cursor-pointer transition-transform hover:scale-110" @click="selectAvatar(avatar)">
            <div class="w-14 rounded-full ring-offset-2 ring-offset-base-100"
              :class="authStore.user?.avatar === avatar ? 'ring ring-primary' : 'bg-base-300 hover:ring hover:ring-base-content/30'">
              <img :src="avatar" alt="avatar option" />
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn btn-ghost" @click="isAvatarModalOpen = false">ຍົກເລີກ</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// ==========================================
// 🔔 ລະບົບການແຈ້ງເຕືອນ (Notifications)
// ==========================================

// ກັ່ນຕອງເອົາສະເພາະລາຍການທີ່ຍັງບໍ່ໄດ້ອ່ານ (read_at ເປັນ null)
const unreadNotifications = computed(() => {
  // 1. ດຶງຄ່າມາໃສ່ຕົວແປ ຖ້າມັນເປັນ undefined ໃຫ້ເປັນ Array ວ່າງ []
  const list = notificationStore.notifications || []

  // 2. ກວດສອບໃຫ້ແນ່ໃຈວ່າມັນເປັນ Array ແທ້ໆ ຈຶ່ງໃຊ້ .filter()
  if (!Array.isArray(list)) {
    console.error('notifications is not an array:', list)
    return []
  }

  return list.filter(notif => !notif.read_at)
})

let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  // ດຶງຈຳນວນແຈ້ງເຕືອນທັນທີທີ່ໂຫຼດໜ້າ
  notificationStore.fetchUnreadCount()

  // ອັບເດດຈຳນວນແຈ້ງເຕືອນທຸກໆ 1 ນາທີ
  intervalId = setInterval(() => {
    notificationStore.fetchUnreadCount()
  }, 900000)
})

onUnmounted(() => {
  clearInterval(intervalId) // ທຳລາຍ interval ເມື່ອປ່ຽນໜ້າ
})

// ເມື່ອກົດເປີດ Dropdown ແຈ້ງເຕືອນ ໃຫ້ດຶງຂໍ້ມູນໃໝ່
const openNotifications = () => {
  notificationStore.fetchNotifications()
}

// ເມື່ອກົດທີ່ລາຍການແຈ້ງເຕືອນ
// เມື່ອກົດທີ່ລາຍການແຈ້ງເຕືອນ
// const handleNotificationClick = async (notif: Notification) => {
//   // 1. อัปเดตสถานะให้เป็น "อ่านแล้ว"
//   if (!notif.read_at) {
//     await notificationStore.markAsRead(notif.id)
//   }

//   // 2. ตรวจสอบประเภทและส่งไปหน้าที่ถูกต้อง พร้อมแนบคำสั่งเปิด Modal
//   // 🌟 (จาก Log ที่คุณเคยส่งมา reference_type ของคุณคือ "loan_applications" ตัวพิมพ์เล็กมี s)
//   if (notif.reference_type === 'loan_applications' && notif.reference_id) {
//     router.push({
//       name: 'PendingLoans', // ⚠️ ต้องมั่นใจว่าชื่อ Route นี้ตรงกับใน router/index.ts
//       query: { openModal: notif.reference_id.toString() } // 🌟 แนบคำสั่งนี้ไปที่ URL
//     })
//   }

//   // (Optional) เผื่ออนาคตมีแจ้งเตือนประเภทอื่น สามารถเพิ่ม else if ตรงนี้ได้เลย
//   // else if (notif.reference_type === 'other_type') { ... }
// }

// ใน Navbar.vue ค้นหาฟังก์ชัน handleNotificationClick

const handleNotificationClick = async (notif: Notification) => {
  if (!notif.read_at) {
    await notificationStore.markAsRead(notif.id)
  }

  if (notif.reference_type === 'loan_applications' && notif.reference_id) {
    router.push({
      name: 'PendingLoans',
      query: { filterId: notif.reference_id.toString() } // 🌟 เปลี่ยนจาก openModal เป็น filterId
    })
  }
}

// Format ເວລາໃຫ້ອ່ານງ່າຍ
const formatTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) return 'ດຽວນີ້'
  if (diffInMinutes < 60) return `${diffInMinutes} ນາທີກ່ອນ`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} ຊົ່ວໂມງກ່ອນ`

  return date.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ==========================================
// 👤 ລະບົບ Avatar ແລະ Logout
// ==========================================
const isAvatarModalOpen = ref(false)

const availableAvatars = ref([
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-2.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-3.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-4.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-5.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-6.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-7.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-8.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-9.png',
  'https://cdn.flyonui.com/fy-assets/avatar/avatar-10.png',
  'https://t3.ftcdn.net/jpg/06/17/13/26/360_F_617132669_YptvM7fIuczaUbYYpMe3VTLimwZwzlWf.jpg',
  'https://img.magnific.com/premium-vector/smiling-woman-avatar_937492-6135.jpg?semt=ais_hybrid&w=740&q=80',
  'https://img.magnific.com/premium-vector/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.jpg?semt=ais_rp_50_assets&w=740&q=80',
  'https://png.pngtree.com/png-clipart/20250116/original/pngtree-smiling-professional-avatar-png-image_20142973.png',
  'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png',
  'https://img.favpng.com/3/11/24/3d-woman-avatar-stylized-cartoon-woman-avatar-with-glasses-g0FutwYY_t.jpg',
  'https://img.freepik.com/premium-psd/3d-render-young-businesswoman-with-long-brown-hair-wearing-light-blue-blazer-white-shirt-she-looks-friendly-approachable-perfect-avatar-professional-woman_632498-32059.jpg',
  'https://thumbnail.imgbin.com/22/4/22/business-woman-cartoon-cartoon-female-avatar-in-office-attire-zTRU4w6s_t.jpg',
  'https://thumbnail.imgbin.com/18/17/25/3d-male-avatar-cartoon-man-with-glasses-Cm2rGYWL_t.jpg',
])

const selectAvatar = async (selectedAvatar: string) => {
  if (authStore.user) {
    authStore.user.avatar = selectedAvatar
  }
  isAvatarModalOpen.value = false

  try {
    // await authStore.updateAvatar(selectedAvatar)
    console.log('Avatar updated to:', selectedAvatar)
  } catch (error) {
    console.error('Failed to update avatar:', error)
  }
}

const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <div>
    <nav class="navbar bg-base-100 rounded-box shadow-base-300/20 shadow-sm">
      <div class="flex flex-1 items-center">
      </div>
      <div class="navbar-end flex items-center gap-4">

        <!-- Notification Dropdown (คงไว้เหมือนเดิม) -->
        <div class="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
          <button id="dropdown-scrollable" type="button"
            class="dropdown-toggle btn btn-text btn-circle dropdown-open:bg-base-content/10 size-10"
            aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
            <div class="indicator">
              <span class="indicator-item bg-error size-2 rounded-full"></span>
              <span class="icon-[tabler--bell] text-base-content size-5.5"></span>
            </div>
          </button>
          <div class="dropdown-menu dropdown-open:opacity-100 hidden" role="menu" aria-orientation="vertical"
            aria-labelledby="dropdown-scrollable">
            <div class="dropdown-header justify-center">
              <h6 class="text-base-content text-base">Notifications</h6>
            </div>
            <div class="overflow-auto text-base-content/80 max-h-56 max-md:max-w-60">
              <div class="dropdown-item">
                <div class="w-60">
                  <h6 class="truncate text-base">No new notifications</h6>
                </div>
              </div>
            </div>
            <a href="#" class="dropdown-footer justify-center gap-1">
              <span class="icon-[tabler--eye] size-4"></span>
              View all
            </a>
          </div>
        </div>

        <!-- User Dropdown -->
        <div class="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
          <button id="dropdown-avatar" type="button" class="dropdown-toggle flex items-center" aria-haspopup="menu"
            aria-expanded="false" aria-label="Dropdown">
            <div class="avatar">
              <div class="size-9.5 rounded-full bg-base-300">
                <img :src="authStore.user?.avatar || 'https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png'" alt="avatar" />
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

            <!-- 🟢 เพิ่มปุ่มเลือก Avatar ตรงนี้ -->
            <li>
              <button class="dropdown-item" @click="isAvatarModalOpen = true">
                <span class="icon-[tabler--user-circle]"></span>
                Change Avatar
              </button>
            </li>

            <li>
              <router-link class="dropdown-item" to="/changeMyPassword">
                <span class="icon-[tabler--password-user]"></span>
                Change My Password
              </router-link>
            </li>

            <li class="dropdown-footer gap-2">
              <button class="btn btn-error btn-soft btn-block" @click="handleLogout">
                <span class="icon-[tabler--logout]"></span>
                Sign out
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <!-- 🟢 Modal สำหรับเลือก Avatar -->
    <div v-if="isAvatarModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-base-100 rounded-box w-full max-w-md p-6 shadow-lg">
        <h3 class="text-lg font-bold mb-4 text-center">Select your Avatar</h3>
        
        <!-- Grid แสดงรูป 10 รูป -->
        <div class="grid grid-cols-5 gap-4 mb-6">
          <div 
            v-for="(avatar, index) in availableAvatars" 
            :key="index"
            class="avatar cursor-pointer transition-transform hover:scale-110"
            @click="selectAvatar(avatar)"
          >
            <!-- ใส่กรอบสีให้รูปที่กำลังเลือกอยู่ปัจจุบัน -->
            <div class="w-14 rounded-full ring-offset-2 ring-offset-base-100" 
                 :class="authStore.user?.avatar === avatar ? 'ring ring-primary' : 'bg-base-300 hover:ring hover:ring-base-content/30'">
              <img :src="avatar" alt="avatar option" />
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn btn-ghost" @click="isAvatarModalOpen = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue' // 🟢 นำเข้า ref
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 🟢 กำหนดสถานะการเปิด/ปิด Modal
const isAvatarModalOpen = ref(false)

// 🟢 ใส่ Path รูป Avatar ทั้ง 10 รูปของคุณที่นี่
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
  // สามารถเปลี่ยนเป็น '/image/avatars/1.png' ตามที่เก็บไฟล์ของคุณได้เลย
])

// 🟢 ຟັງຊັນສຳລັບເລືອກ Avatar
const selectAvatar = async (selectedAvatar: string) => {
  if (authStore.user) {
    // 1. อัปเดต UI ทันทีเพื่อให้ผู้ใช้เห็นว่าเปลี่ยนแล้ว
    authStore.user.avatar = selectedAvatar
  }
  
  // 2. ปิด Modal
  isAvatarModalOpen.value = false

  try {
    // 3. ⚠️ ส่งค่าไปอัปเดตที่ Backend (คุณต้องไปสร้างฟังก์ชัน updateAvatar ใน Store เพื่อยิง API)
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
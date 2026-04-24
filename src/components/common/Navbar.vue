<template>
  <div>
    <nav class="navbar bg-base-100 rounded-box shadow-base-300/20 shadow-sm">
      <div class="flex flex-1 items-center">
      </div>
      <div class="navbar-end flex items-center gap-4">

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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// ⚠️ ປ່ຽນ Path ນີ້ໃຫ້ກົງກັບທີ່ຢູ່ Store ຈິງຂອງທ່ານ
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ຟັງຊັນສຳລັບການ Sign out
const handleLogout = async () => {
  try {
    // ເອີ້ນໃຊ້ Action ຈາກ Store ເພື່ອລຶບ Token ຫຼື State
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}


</script>

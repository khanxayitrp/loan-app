<template>
  <div>
    <!-- Mobile menu button (always visible on mobile) -->
    <button
      type="button"
      class="btn btn-text btn-square sm:hidden fixed top-4 left-4 z-30"
      @click="toggleMobile"
    >
      <span class="icon-[tabler--menu-2] size-6"></span>
    </button>

    <!-- Backdrop (only on mobile when open) -->
    <transition name="fade">
      <div
        v-if="isMobileOpen"
        class="fixed inset-0 bg-black/50 z-40 sm:hidden"
        @click="closeMobile"
      ></div>
    </transition>

    <!-- Sidebar -->
    <aside
      id="collapsible-mini-sidebar"
      :class="[
        'bg-base-100 border-e border-base-content/20 flex flex-col transition-all duration-300',
        // Desktop: always visible, controlled width
        'sm:relative sm:z-0 sm:translate-x-0',
        isMinified ? 'sm:w-20 overlay-minified' : 'sm:w-66',
        // Mobile: fixed slide-in
        'fixed top-0 left-0 z-50 h-full w-66',
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        'sm:translate-x-0 sm:shadow-none' // desktop override
      ]"
    >
      <!-- Header -->
      <div
        class="drawer-header py-4 flex items-center justify-between border-b border-base-content/10"
        :class="{ 'px-4': isMinified && !isMobileOpen, 'px-6': !isMinified || isMobileOpen }"
      >
        <h3
          class="text-xl font-bold transition-all"
          :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }"
        >
          ອິນຊີ Loan
        </h3>

        <div class="flex items-center gap-2">
          <!-- Mobile close -->
          <button
            type="button"
            class="btn btn-circle btn-text sm:hidden"
            @click="closeMobile"
          >
            <span class="icon-[tabler--x] size-5"></span>
          </button>

          <!-- Desktop minify toggle -->
          <button
            type="button"
            class="btn btn-circle btn-text hidden sm:flex"
            aria-label="Minify navigation"
            @click="toggleMinified"
          >
            <span class="icon-[tabler--menu-2] size-5"></span>
          </button>
        </div>
      </div>

      <!-- Menu body -->
      <div class="flex-grow overflow-y-auto px-2 pt-4">
        <ul class="menu p-0 gap-1">
          <template v-for="item in menuItems" :key="item.label">
            <template v-if="!item.permission || can(item.permission)">
              <!-- Normal menu item (no children) -->
              <li v-if="!item.children">
                <router-link
                  :to="item.to"
                  @click="closeMobileIfOpen"
                  class="flex items-center gap-4 p-3 rounded-lg"
                  :class="{
                    'bg-primary/10 text-primary font-semibold': isActive(item.to),
                    'hover:bg-base-200': !isActive(item.to)
                  }"
                >
                  <span :class="[item.icon, 'size-6 shrink-0']"></span>
                  <span
                    class="whitespace-nowrap transition-all"
                    :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }"
                  >
                    {{ item.label }}
                  </span>
                </router-link>
              </li>

              <!-- Dropdown menu item (with children) -->
              <li
                v-else
                class="dropdown relative [--adaptive:none] [--strategy:static] overlay-minified:[--adaptive:adaptive] overlay-minified:[--strategy:fixed] overlay-minified:[--offset:8] overlay-minified:[--trigger:hover] overlay-minified:[--placement:right-start]"
              >
                <button
                  type="button"
                  class="dropdown-toggle w-full flex items-center gap-4 p-3 rounded-lg"
                  :class="{
                    'bg-primary/10 text-primary': isSubmenuActive(item),
                    'hover:bg-base-200': !isSubmenuActive(item)
                  }"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <span :class="[item.icon, 'size-6 shrink-0']"></span>
                  <span
                    class="whitespace-nowrap transition-all flex-grow text-left overlay-minified:hidden"
                  >
                    {{ item.label }}
                  </span>
                  <span
                    class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform dropdown-open:rotate-180 overlay-minified:hidden"
                  ></span>
                </button>

                <ul
                  class="dropdown-menu mt-0 shadow-none overlay-minified:shadow-md overlay-minified:shadow-base-300/20 dropdown-open:opacity-100 hidden min-w-60 overlay-minified:before:absolute overlay-minified:before:-start-4 overlay-minified:before:top-0 overlay-minified:before:h-full overlay-minified:before:w-4 before:bg-transparent"
                  role="menu"
                >
                  <template v-for="child in item.children" :key="child.label">
                    <li v-if="!child.permission || can(child.permission)">
                      <router-link
                        :to="child.to"
                        @click="closeMobileIfOpen"
                        class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200"
                        :class="{ 'bg-primary/10 text-primary font-medium': isActive(child.to) }"
                      >
                        <span :class="[child.icon, 'size-5']"></span>
                        {{ child.label }}
                      </router-link>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </template>

          <!-- Apps Dropdown (example) -->
          <li
            v-if="can('view_apps')"
            class="dropdown relative [--adaptive:none] [--strategy:static] overlay-minified:[--adaptive:adaptive] overlay-minified:[--strategy:fixed] overlay-minified:[--offset:15] overlay-minified:[--trigger:hover] overlay-minified:[--placement:right-start]"
          >
            <button
              type="button"
              class="dropdown-toggle w-full flex items-center gap-4 p-3 rounded-lg hover:bg-base-200"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <span class="icon-[tabler--apps] size-6 shrink-0"></span>
              <span class="whitespace-nowrap transition-all flex-grow text-left overlay-minified:hidden">
                Apps
              </span>
              <span class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform dropdown-open:rotate-180 overlay-minified:hidden"></span>
            </button>

            <ul
              class="dropdown-menu mt-0 shadow-none overlay-minified:shadow-md overlay-minified:shadow-base-300/20 dropdown-open:opacity-100 hidden min-w-60 overlay-minified:before:absolute overlay-minified:before:-start-4 overlay-minified:before:top-0 overlay-minified:before:h-full overlay-minified:before:w-4 before:bg-transparent"
              role="menu"
            >
              <li>
                <a href="#" @click.prevent="closeMobileIfOpen" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200">
                  <span class="icon-[tabler--mail] size-5"></span>
                  Email
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="closeMobileIfOpen" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200">
                  <span class="icon-[tabler--calendar] size-5"></span>
                  Calendar
                </a>
              </li>
            </ul>
          </li>

          <!-- Sign Out -->
          <li>
            <a
              href="#"
              @click.prevent="handleSignOut"
              class="flex items-center gap-4 p-3 text-error hover:bg-error/10 rounded-lg"
            >
              <span class="icon-[tabler--logout-2] size-6 shrink-0"></span>
              <span :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
                Sign Out
              </span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { can } = usePermission()

const isMinified = ref(false)
const isMobileOpen = ref(false)

const menuItems = [
  {
    label: 'Home',
    icon: 'icon-[tabler--home]',
    to: '/users',
    permission: 'user_manage'
  },
  {
    label: 'Account',
    icon: 'icon-[tabler--user]',
    permission: 'user_manage',
    children: [
      {
        label: 'Manage User',
        icon: 'icon-[tabler--users]',
        to: '/users',
        permission: 'user_manage'
      },
      {
        label: 'Change Password',
        icon: 'icon-[tabler--key]',
        to: '/changePassword',
        permission: 'user_manage'
      },
      {
        label: 'Manage Permission',
        icon: 'icon-[tabler--shield]',
        to: '/PermissionManagement',
        permission: 'permission_manage'
      }
    ]
  },
  {
    label: 'Loans',
    icon: 'icon-[tabler--report-money]',
    permission: 'loan_view_all',
    children: [
      {
        label: 'All Loans',
        icon: 'icon-[tabler--list]',
        to: '/loans',
        permission: 'loan_view_all'
      },
      {
        label: 'Pending',
        icon: 'icon-[tabler--clock]',
        to: '/pendingLoans',
        permission: 'loan_view_assigned'
      },
      {
        label: 'Approved',
        icon: 'icon-[tabler--check]',
        to: '/approvedLoans',
        permission: 'loan_approve'
      },
      {
        label: 'Create Draft',
        icon: 'icon-[tabler--clipboard-plus]',
        to: '/createDraftLoan',
        permission: 'loan_create'
      },
      {
        label: 'List Drafts',
        icon: 'icon-[tabler--checkup-list]',
        to: '/listDraftsloan',
        permission: 'loan_view_assigned'
      },
      {
        label: 'List Loans',
        icon: 'icon-[tabler--list-check]',
        to: '/listLoans',
        permission: 'loan_view_assigned'
      }
    ]
  },
  {
    label: 'Product',
    icon: 'icon-[tabler--shopping-bag]',
    // to: '/products',
    permission: 'partner_manage',
    children: [
      {
        label: 'Products',
        icon: 'icon-[tabler--box]',
        to: '/products',
        permission: 'partner_manage'
      },
      {
        label: 'Categories',
        icon: 'icon-[tabler--category]',
        to: '/productTypes',
        permission: 'partner_manage'
      }
    ]
  },
  {
    label: 'Store',
    icon: 'icon-[tabler--building-store]',
    to: '/stores',
    permission: 'partner_manage'
  }
]

const isActive = (path?: string) => {
  if (!path) return false
  return route.path.startsWith(path)
}

const isSubmenuActive = (item: any) => {
  if (!item.children) return false
  return item.children.some((child: any) => isActive(child.to))
}

const emit = defineEmits<{
  minifiedChange: [boolean]
}>()

const toggleMinified = () => {
  isMinified.value = !isMinified.value
  localStorage.setItem('sidebar-minified', isMinified.value.toString())
  emit('minifiedChange', isMinified.value)
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
  document.body.style.overflow = isMobileOpen.value ? 'hidden' : ''
}

const closeMobile = () => {
  isMobileOpen.value = false
  document.body.style.overflow = ''
}

const closeMobileIfOpen = () => {
  if (isMobileOpen.value) closeMobile()
}

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/login')
}

const handleResize = () => {
  if (window.innerWidth < 640) {
    isMinified.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('sidebar-minified')
  if (saved !== null && window.innerWidth >= 640) {
    isMinified.value = saved === 'true'
  }

  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Fade transition for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Smooth width & text transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

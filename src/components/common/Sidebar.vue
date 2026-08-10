<template>
  <div>
    <button type="button" class="btn btn-text btn-square sm:hidden fixed top-4 left-4 z-30" @click="toggleMobile">
      <span class="icon-[tabler--menu-2] size-6"></span>
    </button>

    <transition name="fade">
      <div v-if="isMobileOpen" class="fixed inset-0 bg-black/50 z-40 sm:hidden" @click="closeMobile"></div>
    </transition>

    <aside id="collapsible-mini-sidebar" :class="[
      'bg-base-100 border-e border-base-content/20 flex flex-col transition-all duration-300',
      'sm:relative sm:z-0 sm:translate-x-0',
      isMinified ? 'sm:w-20 overlay-minified' : 'sm:w-66',
      'fixed top-0 left-0 z-50 h-full w-66',
      isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      'sm:translate-x-0 sm:shadow-none'
    ]">
      <div class="drawer-header py-4 flex items-center justify-between border-b border-base-content/10"
        :class="{ 'px-4': isMinified && !isMobileOpen, 'px-6': !isMinified || isMobileOpen }">
        <h3 class="text-xl font-bold transition-all text-primary"
          :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
          INSEE LOAN
        </h3>

        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-circle btn-text sm:hidden" @click="closeMobile">
            <span class="icon-[tabler--x] size-5"></span>
          </button>

          <button type="button" class="btn btn-circle btn-text hidden sm:flex" aria-label="Minify navigation"
            @click="toggleMinified">
            <span class="icon-[tabler--menu-2] size-5"></span>
          </button>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto px-2 pt-4">
        <ul class="menu p-0 gap-1">
          <template v-for="item in menuItems" :key="item.label">

            <template v-if="!item.permissions || canAny(item.permissions)">
              <li v-if="!item.children">
                <router-link :to="item.to" @click="closeMobileIfOpen" class="flex items-center gap-4 p-3 rounded-lg"
                  :class="{
                    'bg-primary/10 text-primary font-semibold': isActive(item.to),
                    'hover:bg-base-200': !isActive(item.to)
                  }">
                  <span :class="[item.icon, 'size-6 shrink-0']"></span>
                  <span class="whitespace-nowrap transition-all"
                    :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
                    {{ item.label }}
                  </span>
                </router-link>
              </li>

              <li v-else
                class="dropdown relative [--adaptive:none] [--strategy:static] overlay-minified:[--adaptive:adaptive] overlay-minified:[--strategy:fixed] overlay-minified:[--offset:8] overlay-minified:[--trigger:hover] overlay-minified:[--placement:right-start]">
                <button type="button" class="dropdown-toggle w-full flex items-center gap-4 p-3 rounded-lg" :class="{
                  'bg-primary/10 text-primary': isSubmenuActive(item),
                  'hover:bg-base-200': !isSubmenuActive(item)
                }" aria-haspopup="menu" aria-expanded="false">
                  <span :class="[item.icon, 'size-6 shrink-0']"></span>
                  <span class="whitespace-nowrap transition-all flex-grow text-left overlay-minified:hidden">
                    {{ item.label }}
                  </span>
                  <span
                    class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform dropdown-open:rotate-180 overlay-minified:hidden"></span>
                </button>

                <ul
                  class="dropdown-menu mt-0 shadow-none overlay-minified:shadow-md overlay-minified:shadow-base-300/20 dropdown-open:opacity-100 hidden min-w-60 overlay-minified:before:absolute overlay-minified:before:-start-4 overlay-minified:before:top-0 overlay-minified:before:h-full overlay-minified:before:w-4 before:bg-transparent"
                  role="menu">
                  <template v-for="child in item.children" :key="child.label">

                    <li v-if="!child.permissions || canAny(child.permissions)">
                      <router-link :to="child.to" @click="closeMobileIfOpen"
                        class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200"
                        :class="{ 'bg-primary/10 text-primary font-medium': isActive(child.to) }">
                        <span :class="[child.icon, 'size-5']"></span>
                        {{ child.label }}
                      </router-link>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </template>

          <div class="divider my-2"></div>

          <li>
            <a href="#" @click.prevent="handleSignOut"
              class="flex items-center gap-4 p-3 text-error hover:bg-error/10 rounded-lg">
              <span class="icon-[tabler--logout-2] size-6 shrink-0"></span>
              <span :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
                ອອກຈາກລະບົບ
              </span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { can } = usePermission()

// 🌟 ເພີ່ມຟັງຊັນສຳລັບເຊັກ Array ຂອງ Permissions 🌟
const canAny = (permissions: string | string[]) => {
  if (!permissions) return true;
  if (typeof permissions === 'string') return can(permissions);
  return permissions.some(p => can(p));
}

const isMinified = ref(false)
const isMobileOpen = ref(false)

// 🟢 ອັບເດດ Menu Items
const menuItems = [
  {
    label: 'Dashboard',
    icon: 'icon-[tabler--layout-dashboard]',
    to: '/dashboard',
    permissions: ['view_admin_dashboard']
  },
  {
    label: 'ຮ້ານຄ້າ Dashboard',
    icon: 'icon-[tabler--device-analytics]',
    to: '/partner-dashboard',
    permissions: ['view_partner_dashboard']
  },
  {
    label: 'ຈັດການຜູ້ໃຊ້ (Account)',
    icon: 'icon-[tabler--user]',
    permissions: ['user_manage', 'user_view'],
    children: [
      {
        label: 'ການຈັດການຜູ້ໃຊ້ (Manage User)',
        icon: 'icon-[tabler--users]',
        to: '/users',
        permissions: ['user_view', 'user_manage']
      },
      {
        label: 'ການປ່ຽນPassword (Change Password)',
        icon: 'icon-[tabler--key]',
        to: '/changePassword',
        permissions: ['user_manage']
      },
      {
        label: 'ການຈັດການສິດ (Manage Permission)',
        icon: 'icon-[tabler--shield]',
        to: '/PermissionManagement',
        permissions: ['permission_manage']
      }
    ]
  },
  {
    label: 'ຄຳຂໍສິນເຊື່ອ (Loans)',
    icon: 'icon-[tabler--report-money]',
    permissions: ['loan_view_all', 'loan_view_assigned'],
    children: [
      {
        label: 'ຄຳຂໍສິນເຊື່ອທັງໝົດ (All Loans)',
        icon: 'icon-[tabler--list]',
        to: '/loans',
        permissions: ['loan_view_all']
      },
      {
        label: 'ລໍຖ້າການອະນຸມັດ (Pending)',
        icon: 'icon-[tabler--clock]',
        to: '/pendingLoans',
        permissions: ['loan_view_assigned', 'loan_view_all']
      },
      {
        label: 'ອະນຸມັດ (Approved)',
        icon: 'icon-[tabler--check]',
        to: '/approvedLoans',
        permissions: ['loan_view_assigned', 'loan_view_all']
      },
      {
        label: 'ຕິດຕາມສິນເຊື່ອເງື່ອນໄຂ (Condition)',
        icon: 'icon-[tabler--shield-check]',
        to: '/conditionalLoans',
        permissions: ['loan_view_assigned', 'loan_view_all']
      },
      {
        label: 'ການຈັດການການຈ່າຍ (Repayment)',
        icon: 'icon-[material-symbols--paid-outline]',
        to: '/repaymentLoans',
        permissions: ['loan_view_assigned', 'loan_view_all']
      },
    ]
  },
  {
    label: 'ຮ່າງສິນເຊື່ອ (Draft Loans)',
    icon: 'icon-[tabler--apps-filled]',
    permissions: ['loan_view_all', 'loan_view_assigned', 'loan_create'],
    children: [
      {
        label: 'ສ້າງຮ່າງຂໍສິນເຊື່ອ (Create Draft)',
        icon: 'icon-[tabler--clipboard-plus]',
        to: '/createDraftLoan',
        permissions: ['loan_create']
      },
      {
        label: 'ລາຍການຮ່າງຂໍສິນເຊື່ອ (List Drafts)',
        icon: 'icon-[tabler--checkup-list]',
        to: '/listDraftsloan',
        permissions: ['loan_view_assigned', 'loan_view_all', 'loan_create']
      },
      {
        label: 'ລາຍການສິນເຊື່ອ (List Loans)',
        icon: 'icon-[tabler--list-check]',
        to: '/listLoans',
        permissions: ['loan_view_assigned', 'loan_view_all']
      }
    ]
  },
  {
    label: 'ຈັດການສິນຄ້າ (Product)',
    icon: 'icon-[tabler--shopping-bag]',
    permissions: ['partner_manage'],
    children: [
      {
        label: 'ສິນຄ້າ (Products)',
        icon: 'icon-[tabler--box]',
        to: '/products',
        permissions: ['partner_manage']
      },
      {
        label: 'ປະເພດສິນຄ້າ (Categories)',
        icon: 'icon-[tabler--category]',
        to: '/productTypes',
        permissions: ['partner_manage']
      }
    ]
  },
  {
    label: 'ຈັດການຮ້ານ (Store)',
    icon: 'icon-[tabler--building-store]',
    to: '/stores',
    permissions: ['partner_manage']
  },
  // 🌟 ເພີ່ມເມນູໃໝ່ສຳລັບ Super Admin (Override) 🌟
  {
    label: 'ແກ້ໄຂສິນເຊື່ອສຸກເສີນ (Override)',
    icon: 'icon-[tabler--adjustments-alt]', // ສາມາດປ່ຽນ Icon ໄດ້ຕາມຄວາມເໝາະສົມ
    to: '/admin/loan-override',
    permissions: ['loan_override']
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

<template>
  <div>
    <!-- Mobile menu button (always visible on mobile) -->
    <button type="button" class="btn btn-text btn-square sm:hidden fixed top-4 left-4 z-30" @click="toggleMobile">
      <span class="icon-[tabler--menu-2] size-6"></span>
    </button>

    <!-- Backdrop (only on mobile when open) -->
    <transition name="fade">
      <div v-if="isMobileOpen" class="fixed inset-0 bg-black/50 z-40 sm:hidden" @click="closeMobile"></div>
    </transition>

    <!-- Sidebar -->
    <aside id="collapsible-mini-sidebar" :class="[
      'bg-base-100 border-e border-base-content/20 flex flex-col transition-all duration-300',
      // Desktop: always visible, controlled width
      'sm:relative sm:z-0 sm:translate-x-0',
      isMinified ? 'sm:w-20' : 'sm:w-66',
      // Mobile: fixed slide-in
      'fixed top-0 left-0 z-50 h-full w-66',
      isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      'sm:translate-x-0 sm:shadow-none' // desktop override
    ]">
      <!-- Header -->
      <div class="drawer-header py-4 flex items-center justify-between border-b border-base-content/10"
        :class="{ 'px-4': isMinified && !isMobileOpen, 'px-6': !isMinified || isMobileOpen }">
        <h3 class="text-xl font-bold transition-all" :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
          ອິນຊີ HUB
        </h3>

        <div class="flex items-center gap-2">
          <!-- Mobile close -->
          <button type="button" class="btn btn-circle btn-text sm:hidden" @click="closeMobile">
            <span class="icon-[tabler--x] size-5"></span>
          </button>

          <!-- Desktop minify toggle -->
          <button type="button" class="btn btn-circle btn-text hidden sm:flex" aria-label="Minify navigation"
            @click="toggleMinified">
            <span class="icon-[tabler--menu-2] size-5"></span>
          </button>
        </div>
      </div>

      <!-- Menu body -->
      <div class="flex-grow overflow-y-auto px-2 pt-4">
        <ul class="menu p-0 gap-1">
          <template v-for="item in menuItems" :key="item.label">
            <!-- Normal menu item -->
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

            <!-- Dropdown menu item -->
            <li v-else class="dropdown relative" :class="{
              // Only use hover trigger when minified on desktop
              '[--placement:right-start] [--offset:15] [--trigger:hover]': isMinified && !isMobileOpen,
              // Use dropdown-open class for click behavior (expanded or mobile)
              'dropdown-open': openSubmenu === item.label && (!isMinified || isMobileOpen)
            }">
              <button type="button"
                class="w-full flex items-center gap-4 p-3 rounded-lg"
                :class="{
                  'bg-primary/10 text-primary': openSubmenu === item.label,
                  'hover:bg-base-200': openSubmenu !== item.label,
                  'dropdown-toggle': isMinified && !isMobileOpen // Only add dropdown-toggle for hover behavior
                }"
                @click="toggleSubmenu(item.label)">
                <span :class="[item.icon, 'size-6 shrink-0']"></span>
                <span class="whitespace-nowrap transition-all flex-grow text-left"
                  :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
                  {{ item.label }}
                </span>
                <span class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform"
                  :class="{
                    'rotate-180': openSubmenu === item.label,
                    'hidden': isMinified && !isMobileOpen
                  }"></span>
              </button>

              <ul class="dropdown-menu mt-0 shadow-none dropdown-open:opacity-100 hidden min-w-60"
                :class="{ 'shadow-md shadow-base-300/20': isMinified && !isMobileOpen }"
                role="menu">
                <li v-for="child in item.children" :key="child.label">
                  <router-link :to="child.to"
                    @click="handleSubmenuClick"
                    class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200"
                    :class="{ 'bg-primary/10 text-primary font-medium': isActive(child.to) }">
                    <span :class="[child.icon, 'size-5']"></span>
                    {{ child.label }}
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- <li v-else class="relative" :class="{
  // ໃຊ້ dropdown class ສະເພາະຕອນທີ່ Sidebar ຫຍໍ້ເທົ່ານັ້ນ (ເພື່ອໃຫ້ມັນລອຍອອກມາທາງຂ້າງ)
  'dropdown [--placement:right-start] [--offset:15] [--trigger:hover]': isMinified && !isMobileOpen
}">
  <button type="button"
    class="w-full flex items-center gap-4 p-3 rounded-lg transition-colors"
    :class="{
      'bg-primary/10 text-primary': openSubmenu === item.label,
      'hover:bg-base-200': openSubmenu !== item.label,
      // ໃສ່ dropdown-toggle ສະເພາະຕອນ Minified
      'dropdown-toggle': isMinified && !isMobileOpen
    }"
    @click="toggleSubmenu(item.label)">

    <span :class="[item.icon, 'size-6 shrink-0']"></span>

    <span class="whitespace-nowrap transition-all flex-grow text-left"
      :class="{ 'opacity-0 w-0 overflow-hidden': isMinified && !isMobileOpen }">
      {{ item.label }}
    </span>

    <span class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform"
      :class="{
        'rotate-180': openSubmenu === item.label,
        'hidden': isMinified && !isMobileOpen
      }"></span>
  </button>

  <ul :class="[
      // ຖ້າ Minified ໃຫ້ເປັນ dropdown-menu (ລອຍ), ຖ້າບໍ່ແມ່ນໃຫ້ເປັນ static list
      isMinified && !isMobileOpen ? 'dropdown-menu hidden min-w-60 shadow-md bg-base-100' : 'static px-2',
      // ຄວບຄຸມການສະແດງຜົນດ້ວຍ Logic ຂອງ Vue ໂດຍກົງ
      openSubmenu === item.label ? 'block' : 'hidden'
    ]"
    role="menu">
    <li v-for="child in item.children" :key="child.label" class="mt-1">
      <router-link :to="child.to"
        @click="handleSubmenuClick"
        class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200 transition-colors"
        :class="{ 'bg-primary/10 text-primary font-medium': isActive(child.to) }">
        <span :class="[child.icon, 'size-5']"></span>
        <span v-if="!isMinified || isMobileOpen">{{ child.label }}</span>
      </router-link>
    </li>
  </ul>
</li> -->
          </template>

          <!-- Dropdown example (Apps) -->
          <li class="dropdown relative" :class="{
            '[--placement:right-start] [--offset:15] [--trigger:hover]': isMinified && !isMobileOpen,
            'dropdown-open': openSubmenu === 'Apps' && (!isMinified || isMobileOpen)
          }">
            <button type="button"
              class="w-full flex items-center gap-4 p-3 rounded-lg"
              :class="{
                'bg-primary/10 text-primary': openSubmenu === 'Apps',
                'hover:bg-base-200': openSubmenu !== 'Apps',
                'dropdown-toggle': isMinified && !isMobileOpen
              }"
              @click="toggleSubmenu('Apps')">
              <span class="icon-[tabler--apps] size-6 shrink-0"></span>
              <span class="whitespace-nowrap transition-all flex-grow text-left"
                :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }">
                Apps
              </span>
              <span class="icon-[tabler--chevron-down] size-4 ml-auto transition-transform"
                :class="{
                  'rotate-180': openSubmenu === 'Apps',
                  'hidden': isMinified && !isMobileOpen
                }"></span>
            </button>
            <ul class="dropdown-menu mt-0 shadow-none dropdown-open:opacity-100 hidden min-w-60" :class="{
              'shadow-md shadow-base-300/20': isMinified && !isMobileOpen
            }" role="menu">
              <li>
                <a href="#" @click="handleSubmenuClick" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200">
                  <span class="icon-[tabler--mail] size-5"></span>
                  Email
                </a>
              </li>
              <li>
                <a href="#" @click="handleSubmenuClick" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200">
                  <span class="icon-[tabler--calendar] size-5"></span>
                  Calendar
                </a>
              </li>
            </ul>
          </li>

          <!-- Sign Out -->
          <li>
            <a href="#" @click="closeMobileIfOpen"
              class="flex items-center gap-4 p-3 text-error hover:bg-error/10 rounded-lg">
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const openSubmenu = ref<string | null>(null)
const isHovering = reactive<Record<string, boolean>>({})

const toggleSubmenu = (label: string) => {
  // Toggle the submenu (works for both expanded and mobile)
  openSubmenu.value = openSubmenu.value === label ? null : label
}

const handleSubmenuClick = () => {
  // Close submenu and mobile menu when clicking a submenu item
  openSubmenu.value = null
  closeMobileIfOpen()
}

const onHover = (label: string, value: boolean) => {
  if (window.innerWidth >= 640) {
    isHovering[label] = value
  }
}

const isMinified = ref(false)
const isMobileOpen = ref(false)

const menuItems = [
  { label: 'Home', icon: 'icon-[tabler--home]', to: '/users' },
  {
    label: 'Account',
    icon: 'icon-[tabler--user]',
    children: [
      { label: 'Manage User', icon: 'icon-[tabler--users]', to: '/users' },
      { label: 'Change Password', icon: 'icon-[tabler--key]', to: '/changePassword' },
      { label: 'Manage Permission', icon: 'icon-[tabler--shield]', to: '/PermissionManagement' }
    ]
  },
  { label: 'Notifications', icon: 'icon-[tabler--message]', to: '/notifications' },
  { label: 'Product', icon: 'icon-[tabler--shopping-bag]', to: '/products' },
  { label: 'Store', icon: 'icon-[tabler--building-store]', to: '/stores' }
]

const isActive = (path?: string) => {
  if (!path) return false
  return route.path.startsWith(path)
}

const emit = defineEmits<{
  minifiedChange: [boolean]
}>()

const toggleMinified = () => {
  isMinified.value = !isMinified.value
  localStorage.setItem('sidebar-minified', isMinified.value.toString())
  emit('minifiedChange', isMinified.value)
  // Close all submenus when minifying
  openSubmenu.value = null
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
  document.body.style.overflow = isMobileOpen.value ? 'hidden' : ''
}

const closeMobile = () => {
  isMobileOpen.value = false
  document.body.style.overflow = ''
  openSubmenu.value = null
}

const closeMobileIfOpen = () => {
  if (isMobileOpen.value) closeMobile()
}

watch(
  () => route.path,
  () => {
    const parent = menuItems.find(item =>
      item.children?.some(child => route.path.startsWith(child.to))
    )
    // Only auto-open if not minified or on mobile
    if (!isMinified.value || isMobileOpen.value) {
      openSubmenu.value = parent ? parent.label : null
    }
  },
  { immediate: true }
)

// Reset minified state when screen becomes mobile
const handleResize = () => {
  if (window.innerWidth < 640) {
    isMinified.value = false // always show text on mobile
  }
}

onMounted(() => {
  // Load saved minified state (desktop only)
  const saved = localStorage.getItem('sidebar-minified')
  if (saved !== null && window.innerWidth >= 640) {
    isMinified.value = saved === 'true'
  }

  window.addEventListener('resize', handleResize)
  handleResize() // run once on mount
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

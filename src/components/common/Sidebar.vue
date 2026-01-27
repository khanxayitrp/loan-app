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
        isMinified ? 'sm:w-20' : 'sm:w-66',
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
          ອິນຊີ HUB
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
          <li v-for="item in menuItems" :key="item.label">
            <a
              href="#"
              @click="closeMobileIfOpen"
              class="flex items-center gap-4 p-3 hover:bg-base-200 rounded-lg"
            >
              <span :class="[item.icon, 'size-6 shrink-0']"></span>
              <span
                class="whitespace-nowrap transition-all"
                :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }"
              >
                {{ item.label }}
              </span>
            </a>
          </li>

          <!-- Dropdown example -->
          <li
            class="dropdown relative"
            :class="{
              '[--placement:right-start] [--offset:15] [--trigger:hover]': isMinified && !isMobileOpen
            }"
          >
            <button
              type="button"
              class="dropdown-toggle w-full flex items-center gap-4 p-3 hover:bg-base-200 rounded-lg"
            >
              <span class="icon-[tabler--apps] size-6 shrink-0"></span>
              <span
                class="whitespace-nowrap transition-all flex-grow text-left"
                :class="{ 'opacity-0 w-0': isMinified && !isMobileOpen }"
              >
                Apps
              </span>
              <span
                class="icon-[tabler--chevron-down] size-4 ml-auto"
                :class="{ 'hidden': isMinified && !isMobileOpen }"
              ></span>
            </button>
            <ul
              class="dropdown-menu mt-0 shadow-none dropdown-open:opacity-100 hidden min-w-60"
              :class="{
                'shadow-md shadow-base-300/20': isMinified && !isMobileOpen
              }"
              role="menu"
            >
              <li>
                <a href="#" @click="closeMobileIfOpen">
                  <span class="icon-[tabler--mail] size-5"></span>
                  Email
                </a>
              </li>
              <li>
                <a href="#" @click="closeMobileIfOpen">
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
              @click="closeMobileIfOpen"
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
import { ref, onMounted, onUnmounted } from 'vue'

const isMinified = ref(false)
const isMobileOpen = ref(false)

const menuItems = [
  { label: 'Home', icon: 'icon-[tabler--home]' },
  { label: 'Account', icon: 'icon-[tabler--user]' },
  { label: 'Notifications', icon: 'icon-[tabler--message]' },
  { label: 'Product', icon: 'icon-[tabler--shopping-bag]' },
  { label: 'Sign In', icon: 'icon-[tabler--login]' }
]

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

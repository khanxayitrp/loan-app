
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import DefaultLayout from '@/layouts/DefaultLayout.vue' // path ไป layout ของคุณ

const routes: RouteRecordRaw[] = [
  // Public routes (ไม่ต้อง login)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },

  // Protected routes (ต้อง login + layout)
  {
    path: '/',
    component: DefaultLayout, // ใช้ layout หลักสำหรับทุก protected route
    meta: { requiresAuth: true }, // default เป็นต้อง login
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/users/UserManagement.vue'),
        meta: {
          requiresAuth: false,           // ต้อง login
          bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
          permission: 'manage_users'
        }
      },
      {
        path: 'changePassword',
        name: 'ChangePassword',
        component: () => import('@/views/auth/ChangePassword.vue'),
        meta: {
          requiresAuth: false,           // ต้อง login
          bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
          permission: 'manage_users'
        }
      },
      {
        path: 'PermissionManagement',
        name: 'PermissionManagement',
        component: () => import('@/views/auth/PermissionManagement.vue'),
        meta: {
          requiresAuth: false,           // ต้อง login
          bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
          permission: 'manage_users'
        }
      },
      {
        path: 'loans',
        name: 'LoanList',
        component: () => import('@/views/loans/LoanList.vue'),
        meta: { requiresAuth: true, permission: 'view_loans' }
      },
      {
        path: 'stores',
        name: 'Stores',
        component: () => import('@/views/shops/ShopManagement.vue'),
         meta: {
          requiresAuth: false,           // ต้อง login
          bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
          permission: 'partner_manage'
        }
      },
      // เพิ่ม route อื่น ๆ ที่ต้องการ layout และ auth ที่นี่
      {
        path: '',
        redirect: '/users' // หรือหน้า default หลัง login
      }
    ]
  },

  // Error pages (public)
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/Unauthorized.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global Navigation Guard: Auth + Permission Check
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. ข้ามการเช็ค auth ถ้า route นี้ bypassAuth = true
  if (to.meta.bypassAuth) {
    next()
    return
  }

  // 2. เช็คว่าต้อง login ก่อนไหม
  if (to.meta.requiresAuth) {
    // ถ้ายังไม่ login → redirect ไป login
    if (!authStore.isAuthenticated) {
      // เก็บ URL เดิมเพื่อ redirect กลับหลัง login
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // ถ้า login แล้ว แต่มี permission → เช็คสิทธิ์
    if (to.meta.permission) {
      const permissionStore = usePermissionStore()
      const required = to.meta.permission as string

      if (!permissionStore.hasPermission(required)) {
        next('/unauthorized')
        return
      }
    }
  }

  // ถ้าผ่านทุกอย่าง → ไปต่อ
  next()
})

// Optional: Re-init FlyonUI JS components after route change (ถ้ายังใช้)
router.afterEach(() => {
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit()
    }
  }, 100)
})

export default router





// // src/router/index.ts
// import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
// import type { NavigationGuard } from 'vue-router'

// // 1. กำหนด Route ทั้งหมด
// const routes: Array<RouteRecordRaw> = [
//   // Auth Routes
//   {
//     path: '/login',
//     name: 'Login',
//     component: () => import('@/views/auth/Login.vue'),
//     meta: { skipAuth: true }
//   },
//   {
//     path: '/register',
//     name: 'Register',
//     component: () => import('@/views/auth/Register.vue'),
//     meta: { skipAuth: true, requiresRegistrationToken: true }
//   },

//   // Public Routes
//   {
//     path: '/',
//     name: 'Home',
//     redirect: '/dashboard'
//   },
//   {
//     path: '/about',
//     name: 'About',
//     component: () => import('@/views/About.vue'),
//     meta: { skipAuth: true }
//   },

//   // Protected Routes (ต้องล็อกอิน)
//   {
//     path: '/dashboard',
//     name: 'Dashboard',
//     component: () => import('@/layouts/DefaultLayout.vue'),
//     meta: { requiresAuth: true },
//     children: [
//       {
//         path: '',
//         name: 'DashboardHome',
//         component: () => import('@/views/dashboard/Index.vue')
//       },
//       {
//         path: 'loans',
//         name: 'LoanList',
//         component: () => import('@/views/loans/List.vue'),
//         meta: { permission: 'view_loans' }
//       },
//       {
//         path: 'loans/create',
//         name: 'LoanCreate',
//         component: () => import('@/views/loans/Create.vue'),
//         meta: { permission: 'create_loan' }
//       },
//       {
//         path: 'users',
//         name: 'UserManagement',
//         component: () => import('@/views/users/Index.vue'),
//         meta: { permission: 'manage_users' }
//       }
//     ]
//   },

//   // Error Pages
//   {
//     path: '/unauthorized',
//     name: 'Unauthorized',
//     component: () => import('@/views/errors/Unauthorized.vue'),
//     meta: { skipAuth: true }
//   },
//   {
//     path: '/:pathMatch(.*)*',
//     name: 'NotFound',
//     component: () => import('@/views/errors/NotFound.vue'),
//     meta: { skipAuth: true }
//   }
// ]

// // 2. สร้าง Router Instance
// const router = createRouter({
//   history: createWebHistory(),
//   routes,
//   scrollBehavior(to, from, savedPosition) {
//     if (savedPosition) {
//       return savedPosition
//     } else {
//       return { top: 0 }
//     }
//   }
// })

// // 3. Route Guards
// const authGuard: NavigationGuard = async (to, from, next) => {
//   const authStore = useAuthStore()
//   const isAuthenticated = await authStore.checkAuth()

//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next({ name: 'Login', query: { redirect: to.fullPath } })
//   } else if (to.meta.skipAuth && isAuthenticated) {
//     next({ name: 'DashboardHome' })
//   } else {
//     next()
//   }
// }

// const permissionGuard: NavigationGuard = (to, from, next) => {
//   if (to.meta.permission) {
//     const permissionStore = usePermissionStore()
//     const requiredPermission = to.meta.permission as string

//     if (permissionStore.hasPermission(requiredPermission)) {
//       next()
//     } else {
//       next({ name: 'Unauthorized' })
//     }
//   } else {
//     next()
//   }
// }

// const registrationTokenGuard: NavigationGuard = (to, from, next) => {
//   if (to.meta.requiresRegistrationToken) {
//     const token = to.query.token as string | undefined
//     const productId = to.query.productId as string | undefined

//     if (!token || !productId) {
//       next({ name: 'Login' })
//       return
//     }

//     // ใน production ควรตรวจสอบ token กับ backend
//     next()
//   } else {
//     next()
//   }
// }

// // 4. ใช้งาน Guards
// router.beforeEach(authGuard)
// router.beforeEach(permissionGuard)
// router.beforeEach(registrationTokenGuard)

// export default router



// import { createRouter, createWebHistory } from 'vue-router'
// import type { RouteRecordRaw } from 'vue-router'

// const routes: RouteRecordRaw[] = [
//   // เปลี่ยน redirect
//   {
//     path: '/',
//     redirect: '/login'
//   },
//   {
//     path: '/login',
//     name: 'Login',
//     component: () => import('../views/login.vue')
//   },
//   // {
//   //   path: '/about',
//   //   name: 'about',
//   //   component: () => import('../views/AboutView.vue')
//   // }
// ]

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes
// })

// // router.afterEach((to, from, failure) => {
// //   if (!failure) {
// //     setTimeout(() => window.HSStaticMethods.autoInit(), 100);  // Reinit FlyonUI JS หลังเปลี่ยนหน้า
// //   }
// // });
// export default router

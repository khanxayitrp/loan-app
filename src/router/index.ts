
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'


const routes: RouteRecordRaw[] = [
  // Public routes (ไม่ต้อง login)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, layout: 'blank' } // 👈 เพิ่ม meta นี้
  },
   // Error pages (public)
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/Unauthorized.vue'),
    meta: {
      requiresAuth: false,
      layout: 'blank' // 👈 เพิ่ม meta นี้
     }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: {
      requiresAuth: false,
      layout: 'blank' // 👈 เพิ่ม meta นี้
     }
  },

  // ==========================================
  // Protected routes (Dashboard)
  // ==========================================
  {
    path: '/dashboard',
    name: 'DashboardHome',
    component: () => import('@/views/dashboard/AdminDashboard.vue'),
    meta: {
      requiresAuth: true,
      permission: 'view_admin_dashboard' // 🟢 ໃຊ້ສິດໃໝ່ທີ່ເພີ່ມໃນ DB
    }
  },
  {
    path: '/partner-dashboard',
    name: 'PartnerDashboard',
    component: () => import('@/views/dashboard/PartnerDashboard.vue'),
    meta: {
      requiresAuth: true,
      permission: 'view_partner_dashboard' // 🟢 ໃຊ້ສິດໃໝ່ທີ່ເພີ່ມໃນ DB
    }
  },

  // ==========================================
  // Protected routes (ອື່ນໆ)
  // ==========================================
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/users/UserManagement.vue'),
    meta: {
      requiresAuth: true,           // ต้อง login
      // bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'user_manage'
    }
  },
  {
    path: '/changePassword',
    name: 'ChangePassword',
    component: () => import('@/views/auth/ChangePassword.vue'),
    meta: {
      requiresAuth: true,           // ต้อง login
      // bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'user_manage'
    }
  },
  {
    path: '/changeMyPassword',
    name: 'ChangeMyPassword',
    component: () => import('@/views/auth/ChangeMyPass.vue'),
    meta: {
      requiresAuth: true,           // ต้อง login
      // bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'user_changepass'
    }
  },
  {
    path: '/PermissionManagement',
    name: 'PermissionManagement',
    component: () => import('@/views/auth/PermissionManagement.vue'),
    meta: {
      requiresAuth: true,           // ต้อง login
      // bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'permission_manage'
    }
  },
  {
    path: '/createLoan',
    name: 'CreateLoan',
    component: () => import('@/views/loans/LoanView.vue'),
    meta: {
      requiresAuth: false,           // ต้อง login
      bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'loan_create'
    }
  },
  {
    path: '/loans',
    name: 'LoanList',
    component: () => import('@/views/loans/LoanList.vue'),
    meta: {
      requiresAuth: true,           // ต้อง login
      // bypassAuth: true,
      // permission: 'loan_view_all' // ลบออกเพื่อไม่ให้ block ทุก route ลูก
    },
    children: [
      {
        path: '',                    // /loans
        name: 'LoanListAll',
        component: () => import('@/components/loans/status/AllLoanStatusList.vue'),
        props: { loanStatus: 'all' },   // ส่ง props ไปบอกว่าแสดงทั้งหมด
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_all'
        }
      },
      {
        path: '/pendingLoans',        // /loans/pendingLoans
        name: 'PendingLoans',
        component: () => import('@/components/loans/status/PendingLoanList.vue'), // ใช้ component เดียวกัน
        props: { loanStatus: 'pending' }, // ส่ง props ไปบอกว่า filter pending
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_assigned'
        }
      },
      {
        path: '/approvedLoans',        // /loans/approvedLoans
        name: 'ApprovedLoans',
        component: () => import('@/components/loans/status/ApprovedLoanList.vue'), // ใช้ component เดียวกัน
        props: { loanStatus: 'approved' }, // ส่ง props ไปบอกว่า filter approved
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_assigned'
        }
      },
      {
        path: '/repaymentLoans',        // /loans/repaymentLoans
        name: 'RepaymentLoans',
        component: () => import('@/components/loans/status/RepaymentLoanList.vue'),
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_assigned'
        }
      },
      {
        path: '/createDraftLoan',        // /loans/createDraftLoan
        name: 'CreateDraftLoan',
        component: () => import('@/components/loans/form/CreateDraftLoan.vue'),
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_create'
        }
      },
      {
        path: '/listDraftsloan',        // /loans/listDrafts
        name: 'ListDraftLoans',
        component: () => import('@/components/loans/form/ListDraftLoan.vue'),
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_assigned'
        }
      },
      {
        path: '/listLoans',        // /loans/listLoans
        name: 'ListLoans',
        component: () => import('@/components/loans/form/ListLoan.vue'),
        meta: {
          requiresAuth: true,
          // bypassAuth: true,
          permission: 'loan_view_assigned'
        }
      },

    ]
  },
  {
    path: '/stores',
    name: 'Stores',
    component: () => import('@/views/shops/ShopManagement.vue'),
    meta: {
      requiresAuth: false,           // ต้อง login
      bypassAuth: true,            // ถ้าต้องการ bypass ให้เปลี่ยนเป็น true
      permission: 'partner_manage'
    }
  },
  // เปลี่ยนเป็น 2 routes แยกกัน
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/ProductManagement.vue'),
    meta: {
      requiresAuth: true,
      // bypassAuth: true,
      permission: 'partner_manage',
      pageType: 'products' // 👈 เพิ่ม meta data
    }
  },
  {
    path: '/productTypes',
    name: 'ProductTypes',
    component: () => import('@/views/products/ProductManagement.vue'),
    meta: {
      requiresAuth: false,
      bypassAuth: true,
      permission: 'partner_manage',
      pageType: 'types' // 👈 เพิ่ม meta data
    }
  },
  // เพิ่ม route อื่น ๆ ที่ต้องการ layout และ auth ที่นี่
  {
    path: '/',
    redirect: (to) => {
      // 🟢 Redirect logic for the base URL '/'
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        const role = authStore.currentUser?.role?.toLowerCase();
        if (role === 'admin') return { name: 'DashboardHome' };
        if (role === 'partner') return { name: 'PartnerDashboard' };
        if (role === 'staff') {
          const permissionStore = usePermissionStore();
          // ເຊັກວ່າ Staff ມີສິດເບິ່ງ Dashboard ບໍ່ ຖ້າບໍ່ມີໃຫ້ໄປໜ້າສິນເຊື່ອ
          if (permissionStore.hasPermission('view_admin_dashboard')) return { name: 'DashboardHome' };
          if (permissionStore.hasPermission('loan_view_all')) return { name: 'LoanListAll' };
          return { name: 'PendingLoans' };
        }
      }
      return { name: 'Login' };
    }
  },



]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ປັບປຸງສ່ວນ router.beforeEach ໃນ src/router/index.ts

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  // 1. 🛡️ ໂຫຼດສະຖານະ Auth ຖ້າຍັງບໍ່ມີ (ກໍລະນີ Refresh ໜ້າຈໍ)
  if (authStore.isAuthenticated && authStore.isTokenExpired) {
    await authStore.checkAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  // 2. 🚫 ຖ້າ Login ແລ້ວ ແຕ່ພະຍາຍາມຈະເຂົ້າໜ້າ Login (ຫຼື ກົດ Back ກັບມາ)
  if (to.path === '/login' && isAuthenticated) {
    const user = authStore.currentUser
    const role = user?.role?.toLowerCase()

    // ບັງຄັບ Redirect ໄປໜ້າທີ່ຄວນຈະຢູ່ຕາມ Role (ໃຊ້ return ເພື່ອຢຸດການເຮັດວຽກ)
    if (role === 'admin') return next({ name: 'DashboardHome' }) // 👈 Changed this line to point Admin to DashboardHome
    if (role === 'partner') return next({ name: 'PartnerDashboard' })
    if (role === 'staff') {
      if (permissionStore.hasPermission('loan_view_all')) return next({ name: 'LoanListAll' })
      if (permissionStore.hasPermission('loan_view_assigned')) return next({ name: 'ListLoans' })
      return next({ name: 'DashboardHome' })
    }
    // if (role === 'partner') return next({ name: 'Stores' })

    return next({ name: 'PendingLoans' })
  }

  // 3. ✅ ອະນຸຍາດ Public Pages
  if (to.meta.layout === 'blank' || to.meta.bypassAuth) {
    return next()
  }

  // 4. 🔐 ເຊັກ Requires Auth
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // ຖ້າຍັງບໍ່ລັອກອິນ ສົ່ງໄປໜ້າ Login
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // ເຊັກ Permission
    if (to.meta.permission) {
      const required = to.meta.permission as string
      if (!permissionStore.hasPermission(required)) {
        return next('/unauthorized')
      }
    }
  }

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




// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

const routes: RouteRecordRaw[] = [
  // ==========================================
  // Public routes (ບໍ່ຕ້ອງ Login)
  // ==========================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/Unauthorized.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
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
      permissions: ['view_admin_dashboard'] // 🌟 ໃຊ້ Array
    }
  },
  {
    path: '/partner-dashboard',
    name: 'PartnerDashboard',
    component: () => import('@/views/dashboard/PartnerDashboard.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['view_partner_dashboard']
    }
  },

  // ==========================================
  // Protected routes (ຈັດການລະບົບ)
  // ==========================================
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/users/UserManagement.vue'),
    meta: {
      requiresAuth: true,
      // 🌟 ຄົນທີ່ຈັດການໄດ້ ຫຼື ເບິ່ງໄດ້ ສາມາດເຂົ້າໜ້ານີ້ໄດ້ (ແລ້ວຄ່ອຍໄປເຊື່ອງປຸ່ມແກ້ໄຂເອົາ)
      permissions: ['user_manage', 'user_view']
    }
  },
  {
    path: '/changePassword',
    name: 'ChangePassword',
    component: () => import('@/views/auth/ChangePassword.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['user_manage']
    }
  },
  {
    path: '/changeMyPassword',
    name: 'ChangeMyPassword',
    component: () => import('@/views/auth/ChangeMyPass.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['user_changepass']
    }
  },
  {
    path: '/PermissionManagement',
    name: 'PermissionManagement',
    component: () => import('@/views/auth/PermissionManagement.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['permission_manage']
    }
  },
  // ==========================================
  // Protected routes (ຈັດການສະມາຊິກ - Membership)
  // ==========================================
  {
    path: '/membership',
    name: 'Membership',
    component: () => import('@/components/membership/MemberShipList.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['user_view', 'user_manage']
    }
  },
  {
    path: '/membership/create',
    name: 'CreateMembership',
    component: () => import('@/components/membership/CreateMemberShip.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['user_manage']
    }
  },

  // ==========================================
  // Protected routes (ຈັດການສິນເຊື່ອ - Loans)
  // ==========================================
  {
    path: '/loans',
    name: 'LoanList',
    component: () => import('@/views/loans/LoanList.vue'),
    meta: { requiresAuth: true }, // ປ່ອຍໃຫ້ Children ເຊັກສິດເອງ
    children: [
      {
        path: '',
        name: 'LoanListAll',
        component: () => import('@/components/loans/status/AllLoanStatusList.vue'),
        props: { loanStatus: 'all' },
        meta: {
          requiresAuth: true,
          permissions: ['loan_view_all']
        }
      },
      {
        path: '/pendingLoans',
        name: 'PendingLoans',
        component: () => import('@/components/loans/status/PendingLoanList.vue'),
        props: { loanStatus: 'pending' },
        meta: {
          requiresAuth: true,
          // 🌟 ໃຫ້ທັງຄົນເບິ່ງລວມ ແລະ ຄົນເບິ່ງສະເພາະຂອງຕົນເອງ ເຂົ້າໄດ້
          permissions: ['loan_view_assigned', 'loan_view_all']
        }
      },
      {
        path: '/approvedLoans',
        name: 'ApprovedLoans',
        component: () => import('@/components/loans/status/ApprovedLoanList.vue'),
        props: { loanStatus: 'approved' },
        meta: {
          requiresAuth: true,
          permissions: ['loan_view_assigned', 'loan_view_all']
        }
      },
      {
        path: '/conditionalLoans',
        name: 'ConditionalLoans',
        component: () => import('@/components/monitor/loans/Conditional_Loan.vue'),
        meta: {
          requiresAuth: true,
          permissions: ['loan_view_assigned', 'loan_view_all']
        }
      },
      {
        path: '/repaymentLoans',
        name: 'RepaymentLoans',
        component: () => import('@/components/loans/status/RepaymentLoanList.vue'),
        meta: {
          requiresAuth: true,
          permissions: ['loan_view_assigned', 'loan_view_all']
        }
      },
      {
        path: '/createDraftLoan',
        name: 'CreateDraftLoan',
        component: () => import('@/components/loans/form/CreateDraftLoan.vue'),
        meta: {
          requiresAuth: true,
          permissions: ['loan_create']
        }
      },
      {
        path: '/listDraftsloan',
        name: 'ListDraftLoans',
        component: () => import('@/components/loans/form/ListDraftLoan.vue'),
        meta: {
          requiresAuth: true,
          // 🌟 ຄົນສ້າງ ຫຼື ຄົນເບິ່ງ ສາມາດເຂົ້າເບິ່ງ Draft ໄດ້
          permissions: ['loan_view_assigned', 'loan_view_all', 'loan_create']
        }
      },
      {
        path: '/listLoans',
        name: 'ListLoans',
        component: () => import('@/components/loans/form/ListLoan.vue'),
        meta: {
          requiresAuth: true,
          permissions: ['loan_view_assigned', 'loan_view_all']
        }
      },
    ]
  },

  // ==========================================
  // Protected routes (ຮ້ານຄ້າ ແລະ ສິນຄ້າ)
  // ==========================================
  {
    path: '/stores',
    name: 'Stores',
    component: () => import('@/views/shops/ShopManagement.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['partner_manage'] // 🌟 ໃຊ້ Array
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/ProductManagement.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['partner_manage'],
      pageType: 'products'
    }
  },
  {
    path: '/productTypes',
    name: 'ProductTypes',
    component: () => import('@/views/products/ProductManagement.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['partner_manage'],
      pageType: 'types'
    }
  },

  // ==========================================
  // Protected routes (ລາຍງານ - Reports)
  // ==========================================
  {
    // 🌟 ເພີ່ມ Route ສຳລັບໜ້າລາຍງານການປ່ອຍສິນເຊື່ອ 🌟
    path: '/reports/disbursed-loans',
    name: 'ReportDisbursedLoans',
    component: () => import('@/components/report/DisbursedLoanDetail.vue'), // ກະລຸນາກວດສອບ Path ໃຫ້ກົງກັບທີ່ທ່ານສ້າງແທ້
    meta: {
      requiresAuth: true,
      permissions: ['loan_view_all']
    }
  },

  // ==========================================
  // Protected routes (ຈັດການລະບົບ / Super Admin)
  // ==========================================
  {
    path: '/admin/loan-override',
    name: 'AdminLoanOverride',
    component: () => import('@/views/admin/LoanOverrideView.vue'),
    meta: {
      requiresAuth: true,
      // 🌟 ใช้สิทธิ์ใหม่ที่เพิ่มลงใน DB
      permissions: ['loan_override']
    }
  },

  // ==========================================
  // Redirect Root ('/')
  // ==========================================
  {
    path: '/',
    redirect: (to) => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        const role = authStore.currentUser?.role?.toLowerCase();

        if (role === 'admin') return { name: 'DashboardHome' };
        if (role === 'partner') return { name: 'PartnerDashboard' };
        if (role === 'auditor') return { name: 'DashboardHome' }; // ຖ້າມີ Role ກວດສອບ

        if (role === 'staff') {
          const permissionStore = usePermissionStore();
          // ເຊັກສິດແລ້ວ Redirect ຕາມລຳດັບຄວາມສຳຄັນ
          if (permissionStore.hasPermission('view_admin_dashboard')) return { name: 'DashboardHome' };
          if (permissionStore.hasPermission('loan_view_all')) return { name: 'LoanListAll' };
          if (permissionStore.hasPermission('loan_view_assigned')) return { name: 'PendingLoans' };
          return { name: 'NotFound' }; // ຖ້າບໍ່ມີສິດຫຍັງເລີຍ
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

// ==========================================
// 🛡️ Global Route Guard (ກວດສອບກ່ອນເຂົ້າໜ້າ)
// ==========================================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  // 1. ໂຫຼດສະຖານະ Auth ຖ້າຍັງບໍ່ມີ (ກໍລະນີ Refresh ໜ້າຈໍ)
  if (authStore.isAuthenticated && authStore.isTokenExpired) {
    await authStore.checkAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  // 2. 🚫 ປ້ອງກັນເຂົ້າໜ້າ Login ຖ້າ Login ຢູ່ແລ້ວ
  if (to.path === '/login' && isAuthenticated) {
    const user = authStore.currentUser
    const role = user?.role?.toLowerCase()

    if (role === 'admin') return next({ name: 'DashboardHome' })
    if (role === 'partner') return next({ name: 'PartnerDashboard' })
    if (role === 'auditor') return next({ name: 'DashboardHome' })

    if (role === 'staff') {
      if (permissionStore.hasPermission('view_admin_dashboard')) return next({ name: 'DashboardHome' })
      if (permissionStore.hasPermission('loan_view_all')) return next({ name: 'LoanListAll' })
      if (permissionStore.hasPermission('loan_view_assigned')) return next({ name: 'PendingLoans' })
    }

    return next('/')
  }

  // 3. ✅ ອະນຸຍາດ Public Pages ໃຫ້ຜ່ານເລີຍ
  if (to.meta.layout === 'blank' || to.meta.bypassAuth) {
    return next()
  }

  // 4. 🔐 ເຊັກ Requires Auth ແລະ Permissions ຫຼັກ
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 🌟 ກວດສອບ Permission ຈາກ Array (ຢ່າງໜ້ອຍ 1 ສິດກໍໃຫ້ຜ່ານ) 🌟
    if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
      const requiredPermissions = to.meta.permissions as string[];

      const hasAccess = requiredPermissions.some(permission =>
        permissionStore.hasPermission(permission)
      );

      if (!hasAccess) {
        return next('/unauthorized'); // ຖ້າບໍ່ມີຈັກສິດໃນ Array ໃຫ້ໄປໜ້າ 403
      }
    }
  }

  next()
})

// ==========================================
// 🔄 Re-init UI Plugins ຫຼັງຈາກປ່ຽນໜ້າ
// ==========================================
router.afterEach(() => {
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit()
    }
  }, 100)
})

export default router

// src/stores/auth.ts
import { defineStore } from 'pinia'
import { usePermissionStore } from './permission'
import {
  signIn as apiSignIn,
  signOut as apiSignOut,
  registerUser as apiCreateUser,
  getCurrentUser
} from '@/api/auth'
import { getAllUsers as apiAllUsers, updateUser, updateUserStatus } from '@/api/user'
import type { SignInRequest, SignInResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  // 📦 STATE: ไม่เก็บ token แล้ว (อยู่ใน httpOnly cookies)
  state: () => ({
    users: [] as SignInResponse['user'][],
    user: null as SignInResponse['user'] | null,
    permissions: [] as string[],
    loading: false,
    expiresAt: null as number | null
  }),

  // 👁️ GETTERS
  getters: {
    isAuthenticated: (state) => !!state.user,
    allUsers: (state) => state.users,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isTokenExpired: (state) => {
      if (!state.expiresAt) return true
      return Date.now() >= state.expiresAt * 1000
    }
  },

  // ⚡ ACTIONS
  actions: {
    /**
     * เข้าสู่ระบบผู้ใช้
     */
    async signIn(credentials: SignInRequest): Promise<boolean> {
      this.loading = true

      try {
        const response: SignInResponse = await apiSignIn(credentials)
        console.log('การเข้าสู่ระบบสำเร็จ:', response)

        // 🔥 ไม่เก็บ token แล้ว - เก็บแค่ user data
        this.user = response.user
        this.permissions = response.permissions
        this.expiresAt = response.expiresAt || null

        // ส่ง permissions ไปยัง permission store
        const permissionStore = usePermissionStore()
        permissionStore.setPermissions(response.permissions)
        console.log('ตั้งค่า permissions ใน store:', permissionStore.userPermissions)

        return true
      } catch (error) {
        console.error('การเข้าสู่ระบบล้มเหลว:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * ออกจากระบบ
     */
    async signOut(): Promise<void> {
      try {
        // เรียก API logout เพื่อ revoke token และลบ cookies
        await apiSignOut()
      } catch (error) {
        console.warn('Logout API error (continuing with local logout):', error)
      } finally {
        // ล้างข้อมูลทั้งหมด
        this.user = null
        this.permissions = []
        this.expiresAt = null

        const permissionStore = usePermissionStore()
        permissionStore.clearPermissions()
      }
    },

    async fetchAllUsers(): Promise<void> {
      try {
        const response = await apiAllUsers()
        this.users = response.users
      } catch (error) {
        console.error('Error fetching all users:', error)
      }
    },
    // src/stores/auth.ts
// src/stores/auth.ts
async createUser(userData: {
  username: string
  password: string
  role: 'admin' | 'staff' | 'partner' | 'customer'
  full_name: string
  staff_level?: 'requester' | 'approver' | 'none'
  is_active?: number
}): Promise<void> {
  try {
    console.log('[AUTH STORE] Creating user with data:', userData)

    const response = await apiCreateUser(userData)

    console.log('[AUTH STORE] User created:', response)

    // ✅ ไม่ต้อง push เข้า users array ที่นี่
    // จะ refresh ทั้งหมดจาก fetchUsers() แทน
  } catch (error: any) {
    console.error('[AUTH STORE] Error creating user:', error)
    throw error
  }
},

async updateUser(userId: number, userData: {
  username?: string
  role?: 'admin' | 'staff' | 'partner' | 'customer'
  full_name?: string
  staff_level?: 'requester' | 'approver' | 'none'
  is_active?: number
  password?: string
}): Promise<void> {
  try {
    console.log('[AUTH STORE] Updating user:', userId, userData)

    // ✅ ลบ password ออกถ้าเป็นค่าว่าง
    const cleanData = { ...userData }
    if (!cleanData.password) {
      delete cleanData.password
    }

    const response = await updateUser(userId, cleanData)

    console.log('[AUTH STORE] User updated:', response)

    // ✅ ไม่ต้องอัปเดต users array ที่นี่
    // จะ refresh ทั้งหมดจาก fetchUsers() แทน
  } catch (error: any) {
    console.error('[AUTH STORE] Error updating user:', error)
    throw error
  }
},

    async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
      try {
        const response = await updateUserStatus(userId, isActive)
        // อัปเดตสถานะผู้ใช้ใน state.users
        const index = this.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.users[index] = response.user
        }
      } catch (error) {
        console.error('Error updating user status:', error)
      }
    },
    /**
     * ตรวจสอบว่าผู้ใช้ยังล็อกอินอยู่หรือไม่
     * เรียก API /auth/me เพื่อดึงข้อมูลจาก token ใน cookies
     */
    async checkAuth(): Promise<boolean> {
      try {
        const response = await getCurrentUser()

        this.user = response.user
        this.permissions = response.permissions
        this.expiresAt = response.expiresAt || null

        const permissionStore = usePermissionStore()
        permissionStore.setPermissions(response.permissions)

        return true
      } catch (error) {
        // ถ้า error แสดงว่า token หมดอายุหรือไม่ valid
        this.signOut()
        return false
      }
    }
  }
})

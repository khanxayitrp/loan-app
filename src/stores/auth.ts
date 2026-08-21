// src/stores/auth.ts
import { defineStore } from 'pinia'
import { usePermissionStore } from './permission'
import apiClient from '@/api/apiclient'
import {
  signIn as apiSignIn,
  signOut as apiSignOut,
  registerUser as apiCreateUser,
  getCurrentUser
} from '@/api/auth'
import { getAllUsers as apiAllUsers, updateUser, updateUserStatus, deleteUser as apiDeleteUser } from '@/api/user'
import type { SignInRequest, SignInResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  // 📦 STATE: ไม่เก็บ token แล้ว (อยู่ใน httpOnly cookies)
  state: () => ({
    users: [] as SignInResponse['user'][],
    user: null as SignInResponse['user'] | null,
    permissions: [] as string[],
    loading: false,
    expiresAt: null as number | null,
    isLoggingOut: false
  }),

  // 👁️ GETTERS
  getters: {
    isAuthenticated: (state) => !!state.user,
    allUsers: (state) => state.users,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isTokenExpired: (state) => {
      // 🌟 ປ່ຽນເປັນ return false ໄວ້ກ່ອນຖ້າບໍ່ມີ expiresAt
      // ເພື່ອປ້ອງກັນບໍ່ໃຫ້ Router Guard ໄປ Loop ຍິງ API checkAuth ຕະຫຼອດເວລາ
      if (!state.expiresAt) return false
      return Date.now() >= state.expiresAt * 1000
    },
    token: (state) => {
      // This is a placeholder as token is in httpOnly cookie
      return null
    }
  },

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
        this.user = { ...response.user, role: response.user.role?.toLowerCase() as any }
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
      if (this.isLoggingOut) return
      this.isLoggingOut = true

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
        this.isLoggingOut = false

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
      staff_level?: 'assistant_director' | 'sales' | 'credit_officer' | 'credit_manager' | 'deputy_director' | 'director' | 'auditor' | 'none'
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
      staff_level?: 'assistant_director' | 'sales' | 'credit_officer' | 'credit_manager' | 'deputy_director' | 'director' | 'auditor' | 'none'
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
    // ==========================================
    // 🟢 Action สำหรับลบผู้ใช้งาน (Soft Delete)
    // ==========================================
    async deleteUser(userId: number): Promise<void> {
      try {
        console.log('[AUTH STORE] Deleting user ID:', userId)

        // เรียก API ไปลบผู้ใช้งาน
        await apiDeleteUser(userId)

        // อัปเดต state ทันทีเพื่อความรวดเร็ว (เอาตัวที่ถูกลบออกจาก Array)
        this.users = this.users.filter((u) => u.id !== userId)

      } catch (error: any) {
        console.error('[AUTH STORE] Error deleting user:', error)
        throw error // โยน Error กลับไปให้ ListUsers.vue จัดการแจ้งเตือน
      }
    },
    // 🟢 เพิ่ม Action ใหม่สำหรับเช็คจำนวนการเข้าสู่ระบบ
    async checkFirstLogin(): Promise<number> {
      try {
        const response = await apiClient.get<{ count: number }>('/auth/checkLogin')
        console.log('Login count response:', response.data)
        return (response.data as any).data
      } catch (error: any) {
        console.error('Error fetching login count:', error)
        return -1 // ส่งค่าติดลบกลับไปเพื่อบอกว่า Error จะได้ข้ามเงื่อนไขไปก่อน
      }
    },
    /**
     * ตรวจสอบว่าผู้ใช้ยังล็อกอินอยู่หรือไม่
     * เรียก API /auth/me เพื่อดึงข้อมูลจาก token ใน cookies
     */
    async checkAuth(): Promise<boolean> {
      try {
        const response = await getCurrentUser()

        this.user = { ...response.user, role: response.user.role?.toLowerCase() as any }
        this.permissions = response.permissions
        this.expiresAt = response.expiresAt || null

        const permissionStore = usePermissionStore()
        permissionStore.setPermissions(response.permissions)

        return true
      } catch (error: any) {
        // ถ้า error แสดงว่า token หมดอายุหรือไม่ valid
        this.signOut()
        return false
      }
    }
  }
})

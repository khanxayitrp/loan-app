// src/stores/auth.ts
import { defineStore } from 'pinia'
import { usePermissionStore } from './permission'
import { signIn as apiSignIn, signOut as apiSignOut } from '@/api/auth'
import type { SignInRequest, SignInResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  // 📦 STATE: เก็บข้อมูลหลักของ store
  state: () => ({
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null, // 👈 เพิ่ม refresh token
    user: null as SignInResponse['user'] | null,
    loading: false // 👈 เพิ่มสถานะ loading
  }),

  // 👁️ GETTERS: ฟังก์ชันสำหรับอ่านค่าแบบ computed
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    // 👈 เพิ่ม getter สำหรับตรวจสอบ role
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff'
  },

  // ⚡ ACTIONS: ฟังก์ชันสำหรับเปลี่ยนแปลง state หรือเรียก API
  actions: {
    /**
     * เข้าสู่ระบบผู้ใช้
     */
    async signIn(credentials: SignInRequest): Promise<boolean> {
      this.loading = true // 👈 เริ่ม loading

      try {
        const response: SignInResponse = await apiSignIn(credentials)

        // 👇 บันทึกทั้ง access token และ refresh token
        this.token = response.tokens.access.token
        this.refreshToken = response.tokens.refresh.token
        this.user = response.user

        // 👇 บันทึกใน localStorage (สำหรับรักษา session)
        localStorage.setItem('token', response.tokens.access.token)
        localStorage.setItem('refreshToken', response.tokens.refresh.token)

        // 👇 ส่ง permissions ไปยัง permission store
        const permissionStore = usePermissionStore()
        permissionStore.setPermissions(response.permissions)

        return true
      } catch (error) {
        console.error('การเข้าสู่ระบบล้มเหลว:', error)
        return false
      } finally {
        this.loading = false // 👈 หยุด loading ไม่ว่าจะสำเร็จหรือไม่
      }
    },

    /**
     * ออกจากระบบ
     */
    async signOut(): Promise<void> {
      try {
        // 👇 เรียก API logout เพื่อinvalidate refresh token บน server
        if (this.refreshToken) {
          await apiSignOut()
        }
      } catch (error) {
        console.warn('Logout API error (continuing with local logout):', error)
      } finally {
        // 👇 ล้างข้อมูลทั้งหมดทั้งใน store และ localStorage
        this.token = null
        this.refreshToken = null
        this.user = null

        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')

        const permissionStore = usePermissionStore()
        permissionStore.clearPermissions()
      }
    },

    /**
     * ตรวจสอบว่าผู้ใช้ยังล็อกอินอยู่หรือไม่ (เช่น เมื่อรีเฟรชหน้า)
     */
    async checkAuth(): Promise<boolean> {
      const token = localStorage.getItem('token')

      if (!token) {
        return false
      }

      try {
        // 👇 ใน production ควรเรียก API /auth/me เพื่อตรวจสอบ token
        // แต่ตอนนี้เราแค่ตรวจสอบว่ามี token อยู่
        this.token = token
        // 👇 หากต้องการโหลด user data ใหม่ ให้เรียก API ที่นี่
        return true
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        this.signOut() // 👈 หากตรวจสอบแล้วไม่ valid ให้ออกจากระบบ
        return false
      }
    }
  }
})

// src/stores/permission.ts
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    // เก็บรายการ permission ที่ผู้ใช้มีสิทธิ์
    userPermissions: [] as string[]
  }),

  actions: {
    /**
     * ตั้งค่า permissions หลัง login
     */
    setPermissions(permissions: string[]) {
      this.userPermissions = permissions
    },

    /**
     * ตรวจสอบว่าผู้ใช้มีสิทธิ์นี้หรือไม่
     */
    hasPermission(permission: string): boolean {
      return this.userPermissions.includes(permission)
    },

    /**
     * ล้างข้อมูลเมื่อ logout
     */
    clearPermissions() {
      this.userPermissions = []
    }
  }
})

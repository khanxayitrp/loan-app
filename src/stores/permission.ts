// src/stores/permission.ts
import { defineStore } from 'pinia'
import {
  getAllFeatures,
  getUserPermissions,
  assignUserPermissions,
  updateBulkPermissions,
  deleteAllUserPermissions
} from '@/api/permission'
import type { Feature, UserWithPermissions, PermissionAssignment } from '@/types/permission'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    // เก็บรายการ permission ที่ผู้ใช้มีสิทธิ์
    userPermissions: [] as string[],
    features: [] as Feature[],
    isLoading: false
  }),

  actions: {
    /**
     * โหลดรายการ features ทั้งหมด
     */
    async fetchFeatures() {
      this.isLoading = true
      try {
        this.features = await getAllFeatures()
      } catch (error) {
        console.error('Failed to fetch features:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    /**
     * ตั้งค่า permissions หลัง login
     */
    setPermissions(permissions: any[]) {
      if (!permissions || !Array.isArray(permissions)) {
        this.userPermissions = []
        return
      }
      
      // แปลงให้อยู่ในรูปแบบ string เสมอ
      this.userPermissions = permissions.map(p => {
        if (typeof p === 'string') return p
        if (p && p.feature_name) return p.feature_name
        if (p && p.feature && p.feature.feature_name) return p.feature.feature_name
        return String(p)
      })
    },

    /**
     * ตรวจสอบว่าผู้ใช้มีสิทธิ์นี้หรือไม่
     */
    hasPermission(permission: string): boolean {
      if (!this.userPermissions || !Array.isArray(this.userPermissions)) return false
      
      return this.userPermissions.some((p: any) => {
        if (typeof p === 'string') return p === permission
        if (p && p.feature_name) return p.feature_name === permission
        if (p && p.feature && p.feature.feature_name) return p.feature.feature_name === permission
        return false
      })
    },
    /**
     * ดึงสิทธิ์ของผู้ใช้เฉพาะคน
     */
    async fetchUserPermissions(userId: number): Promise<UserWithPermissions> {
      return await getUserPermissions(userId)
    },
      /**
     * ลบสิทธิ์ทั้งหมดของผู้ใช้
     */
    async deleteAllUserPermissions(userId: number): Promise<void> {
      await deleteAllUserPermissions(userId)
    },

    /**
     * กำหนดสิทธิ์ให้ผู้ใช้
     */
    async assignPermissions(userId: number, featureIds: number[]): Promise<void> {
      await assignUserPermissions(userId, featureIds)
    },

    /**
     * อัปเดตสิทธิ์แบบกลุ่ม
     */
    async updateUserPermissions(userId: number, featureIds: number[]): Promise<void> {
      const payload: PermissionAssignment[] = [{
        user_id: userId,
        feature_ids: featureIds
      }]
      await updateBulkPermissions(payload)
    },

    /**
     * ล้างข้อมูลเมื่อ logout
     */
    clearPermissions() {
      this.userPermissions = []
      this.features = []
    }
  }
})

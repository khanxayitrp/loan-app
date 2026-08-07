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
    // 🌟 1. ໃຊ້ Set ເພື່ອປະສິດທິພາບຄວາມໄວສູງສຸດ O(1)
    userPermissions: new Set<string>(),
    features: [] as Feature[],
    isLoading: false
  }),

  // 🌟 2. ເພີ່ມ Getters ເພື່ອໃຫ້ສະດວກຕອນຢາກດຶງຄ່າໄປໃຊ້ແບບ Array
  getters: {
    // ແປງ Set ກັບໄປເປັນ Array (ຖ້າມີບ່ອນໃດໃນລະບົບຕ້ອງການໃຊ້ Array)
    permissionsArray: (state): string[] => Array.from(state.userPermissions)
  },

  actions: {
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

    setPermissions(permissions: any[]) {
      // 🌟 3. ຖ້າບໍ່ມີຂໍ້ມູນ ໃຫ້ໃຊ້ຄຳສັ່ງ .clear() ຂອງ Set ແທນການກຳນົດຄ່າ = []
      if (!permissions || !Array.isArray(permissions)) {
        this.userPermissions.clear()
        return
      }

      const permStrings = permissions.map(p => {
        if (typeof p === 'string') return p
        if (p && p.feature_name) return p.feature_name
        if (p && p.feature && p.feature.feature_name) return p.feature.feature_name
        return String(p)
      })

      // 🌟 4. ສ້າງ Set ໃໝ່ຂຶ້ນມາປ່ຽນແທນຂອງເກົ່າ
      this.userPermissions = new Set<string>(permStrings)
    },

    hasPermission(permission: string): boolean {
      // 🌟 5. ໃຊ້ .has() ຂອງ Set ເຊິ່ງໄວຫຼາຍ
      return this.userPermissions.has(permission)
    },

    async fetchUserPermissions(userId: number): Promise<UserWithPermissions> {
      return await getUserPermissions(userId)
    },

    async deleteAllUserPermissions(userId: number): Promise<void> {
      await deleteAllUserPermissions(userId)
    },

    async assignPermissions(userId: number, featureIds: number[]): Promise<void> {
      await assignUserPermissions(userId, featureIds)
    },

    async updateUserPermissions(userId: number, featureIds: number[]): Promise<void> {
      const payload: PermissionAssignment[] = [{
        user_id: userId,
        feature_ids: featureIds
      }]
      await updateBulkPermissions(payload)
    },

    /**
     * 🌟 6. ແກ້ໄຂ Error ຢູ່ຈຸດນີ້: ລ້າງຂໍ້ມູນເມື່ອ Logout
     */
    clearPermissions() {
      // ❌ ຜິດ: this.userPermissions = []
      // ✅ ຖືກຕ້ອງ: ໃຊ້ .clear() ສຳລັບ Set
      this.userPermissions.clear()
      this.features = []
    }
  }
})

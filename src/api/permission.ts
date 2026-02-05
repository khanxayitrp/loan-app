// src/api/permission.ts
import apiClient from '@/api/apiclient'
import type {
  Feature,
  UserWithPermissions,
  PermissionAssignment
} from '@/types/permission'

/**
 * ดึงรายการ Features ทั้งหมดในระบบ
 */
export const getAllFeatures = async (): Promise<Feature[]> => {
  const response = await apiClient.get('/permissions/features')
  return response.data
}

/**
 * ดึงสิทธิ์ของผู้ใช้หลายคน (สำหรับ UI Checkbox indeterminate)
 */
export const getCombinedPermissions = async (userIds: number[]): Promise<{
  totalUsers: number
  featureCounts: Record<number, number>
  details: Record<number, number[]>
}> => {
  const response = await apiClient.post('/permissions/combined', { userIds })
  return response.data
}

/**
 * อัปเดตสิทธิ์แบบกลุ่ม (Overwrite Mode)
 */
export const updateBulkPermissions = async (payload: PermissionAssignment[]): Promise<boolean> => {
  const response = await apiClient.put('/permissions/bulk', { users: payload })
  return response.data.success
}

/**
 * ดึงสิทธิ์ของผู้ใช้เฉพาะคน
 */
export const getUserPermissions = async (userId: number): Promise<UserWithPermissions> => {
  const response = await apiClient.get(`/permissions/user/${userId}`)
  return response.data
}

/**
 * กำหนดสิทธิ์ให้ผู้ใช้
 */
export const assignUserPermissions = async (userId: number, featureIds: number[]): Promise<boolean> => {
  const response = await apiClient.post(`/permissions/user/${userId}`, { feature_ids: featureIds })
  return response.data.success
}

/**
 * ลบสิทธิ์ทั้งหมดของผู้ใช้
 */
export const deleteAllUserPermissions = async (userId: number): Promise<boolean> => {
  const response = await apiClient.delete(`/permissions/user/${userId}`)
  return response.data.success
}

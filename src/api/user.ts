// src/api/auth.ts
import apiClient from '@/api/apiclient'
import type {

  User,
} from '@/types/auth'

export const updateUser = async (userId: number, userData: {
  username?: string
  // email?: string
  role?: 'admin' | 'staff' | 'partner' | 'customer'
  full_name?: string
  staff_level?: 'requester' | 'approver' | 'none'
}): Promise<{ message: string; user: User }> => {
  const response = await apiClient.put<{ message: string; user: User }>(`/users/${userId}`, userData)
  return response.data
}

export const getAllUsers = async (): Promise<{ users: User[] }> => {
  const response = await apiClient.get<{ users: User[] }>('/users')
  return response.data
}

export const updateUserStatus = async (userId: number, isActive: boolean): Promise<{ message: string; user: User }> => {
  const response = await apiClient.patch<{ message: string; user: User }>(`/users/${userId}`, {
    is_active: isActive ? 1 : 0
  })
  return response.data
}

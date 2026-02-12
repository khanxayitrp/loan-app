// src/api/shop.ts
import apiClient from '@/api/apiclient'
import type { shopType, shopTypeForm } from '@/types/shop'

/**
 * ดึงข้อมูลร้านค้าปัจจุบัน
 */
export const getCurrentShop = async (): Promise<shopType | null> => {
  try {
    const response = await apiClient.get(`/shops/current`)
    // return response.data as shopType
    // ตรวจสอบโครงสร้างข้อมูล
    if (response.data?.shop) {
      return response.data.shop
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
  } catch (error: any) {
    // ✅ จัดการกรณี 404 (ไม่มีร้านค้า)
    if (error.response?.status === 404) {
      return null
    }
    // ✅ จัดการกรณีอื่นๆ
    throw error
  }
}

export const getAllShop = async (): Promise<shopType[] | null> => {
  try {
    const response = await apiClient.get(`/shops/all`)
    // return response.data as shopType
    // ตรวจสอบโครงสร้างข้อมูล
    if (response.data?.shop) {
      return response.data.shop
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
  } catch (error: any) {
    // ✅ จัดการกรณี 404 (ไม่มีร้านค้า)
    if (error.response?.status === 404) {
      return null
    }
    // ✅ จัดการกรณีอื่นๆ
    throw error
  }
}

/**
 * อัปเดตข้อมูลร้านค้า
 */
export const updateShop = async (id: number, data: Partial<shopTypeForm>): Promise<shopType> => {
try {
  console.log('get this id:', id)
  const response = await apiClient.put(`/shops/${id}`, data)
   console.log('[API] Shop updated:', response.data)

    if (response.data?.shop) {
      return response.data.shop
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
     } catch (error: any) {
    console.error('[API] Error updating shop:', error)
    throw error
  }
}

export const createShop = async (shopData: shopTypeForm): Promise<shopType> => {
  try {
    console.log('REGISTER -> Sending Request with Data', shopData)
    const response = await apiClient.post('/shops', shopData)


     console.log('[API] Shop created:', response.data)
    // ✅ ตรวจสอบโครงสร้าง response และ extract ข้อมูลที่ถูกต้อง

     if (response.data?.shop) {
      return response.data.shop
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
  } catch (error: any) {
    console.error('REGISTER -> error caught', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    })

    // ✅ แสดง error message จาก backend
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຮ້ານຄ້າ'

    throw new Error(errorMessage)
  }
}

export const changeStatus = async (partnerId: number, isActive: boolean): Promise<{ message: string; shop: shopType }> => {
  try {
  const response = await apiClient.put<{ message: string; shop: shopType }>(`/shops/status/${partnerId}`, {
    is_active: isActive ? 1 : 0
  })
  console.log('[API] Shop status changed:', response.data)
    return response.data
  } catch (error: any) {
    console.error('[API] Error changing shop status:', error)
    throw error
  }
}

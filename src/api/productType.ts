
// src/api/productType.ts
import apiClient from '@/api/apiclient'
import type { ProductType, ProductTypeForm } from '@/types/productType'

/**
 * ดึงรายการประเภทสินค้าทั้งหมด
 */
export const fetchProductTypes = async (params?: {
  page?: number
  limit?: number
}): Promise<{ data: ProductType[]; total: number }> => {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())

  const response = await apiClient.get(`/productTypes?${searchParams}`)
  return response.data
}

/**
 * สร้างประเภทสินค้าใหม่
 */
export const createProductType = async (data: ProductTypeForm): Promise<ProductType> => {
  const response = await apiClient.post('/productTypes', data)
  return response.data
}

/**
 * อัปเดตประเภทสินค้า
 */
export const updateProductType = async (id: number, data: ProductTypeForm): Promise<ProductType> => {
  const response = await apiClient.put(`/productTypes/${id}`, data)
  return response.data
}

/**
 * ลบประเภทสินค้า
 */
export const deleteProductType = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete(`/productTypes/${id}`)
  return response.data
}

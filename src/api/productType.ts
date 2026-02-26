
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
  try {
    const response = await apiClient.get(`/productTypes?${searchParams}`)

    // ✅ ตรวจสอบโครงสร้าง response ทุกกรณี
    console.log('API Response:', response.data)
    // ✅ โครงสร้าง response จริง: { productTypes: { data: [...], total: 1, ... } }
    const productTypesData = response.data.productTypes

    return productTypesData
  } catch (error) {
    console.error('API Error in fetchProductTypes:', error)
    throw error
  }

}

export const getProductTypesByID = async (id: number): Promise<ProductType> => {

  try {
    const response = await apiClient.get(`/productTypes/${id}`)

    // ✅ ตรวจสอบโครงสร้าง response ทุกกรณี
    console.log('API Response:', response.data)
    // ✅ โครงสร้าง response จริง: { productTypes: { data: [...], total: 1, ... } }
    const productTypesData = response.data.productTypes

    return productTypesData
  } catch (error) {
    console.error('API Error in fetchProductTypes:', error)
    throw error
  }

}

/**
 * สร้างประเภทสินค้าใหม่
 */
export const createProductType = async (data: ProductTypeForm): Promise<ProductType> => {
  const response = await apiClient.post('/productTypes', data)
  console.log('after save is ', response.data)
  return response.data.data
}

/**
 * อัปเดตประเภทสินค้า
 */
export const updateProductType = async (id: number, data: ProductTypeForm): Promise<ProductType> => {
  const response = await apiClient.put(`/productTypes/${id}`, data)
  console.log('after save is ', response.data)
  return response.data.data
}

/**
 * ลบประเภทสินค้า
 */
export const deleteProductType = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete(`/productTypes/${id}`)
  return response.data
}

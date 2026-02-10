// src/api/product.ts
import apiClient from '@/api/apiclient'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  GetProductsParams,
  ProductType
} from '@/types/product'

/**
 * ดึงรายการสินค้าทั้งหมด
 */
export const getProducts = async (params?: GetProductsParams) => {
  try {
    const response = await apiClient.get('/products', { params })
    console.log('getProducts is ', response.data)
    // ✅ ตรวจสอบโครงสร้าง response
    if (response.data.products) {
      return {
        products: response.data.products.data || [],
        total: response.data.products.total || 0
      }
    }
    return {
      products: response.data.data || [],
      total: response.data.total || 0
    }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * ดึงข้อมูลสินค้าเฉพาะ
 */
export const getProductById = async (id: number) => {
  try {
    const response = await apiClient.get(`/products/${id}`)
    console.log('getProductById is ', response)
    return response.data.product || response.data
  } catch (error: any) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

/**
 * สร้างสินค้าใหม่
 */
export const createProduct = async (data: CreateProductDto) => {
  try {
    const response = await apiClient.post('/products', data)

    console.log('createProduct is ', response)

    return response.data.product || response.data
  } catch (error: any) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * อัปเดตสินค้า
 */
export const updateProduct = async (id: number, data: UpdateProductDto) => {
  try {
    const response = await apiClient.put(`/products/${id}`, data)

    console.log('updateProduct is ', response)

    return response.data.product || response.data
  } catch (error: any) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

/**
 * อัปโหลดรูปภาพหลัก
 */
export const uploadProductImage = async (productId: number, file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(
      `/upload/product/${productId}/image`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data
  } catch (error: any) {
    console.error(`Error uploading product image:`, error)
    throw error
  }
}

/**
 * อัปโหลดรูปแกลเลอรี่
 */
export const uploadProductGallery = async (productId: number, files: File[]) => {
  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await apiClient.post(
      `/upload/product/${productId}/gallery`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data
  } catch (error: any) {
    console.error(`Error uploading product gallery:`, error)
    throw error
  }
}
/**
 * Sync ຂໍ້ມູນ Gallery (ບັນທຶກ URL ລົງຖານຂໍ້ມູນ)
 * @param productId ໄອດີສິນຄ້າ
 * @param images ລາຍການ Object ຂອງ URL { file_url: string }
 */
export const saveProductGallery = async (productId: number, images: { file_url: string }[]) => {
  try {
    // ອ້າງອີງຕາມ Route Backend: router.post('/:productId/gallery', product_galleryController.saveImageToGallery)
    // ໝາຍເຫດ: ຕ້ອງກວດສອບວ່າ Base path ຂອງ Router ແມ່ນຫຍັງ (ສົມມຸດວ່າແມ່ນ /products)
    const response = await apiClient.post(`/images/${productId}/gallery`, {
      uploaded: images
    })

    return response.data
  } catch (error: any) {
    console.error(`Error syncing product gallery:`, error)
    throw error
  }
}
/**
 * ດຶງຂໍ້ມູນ Gallery ຂອງສິນຄ້າຕາມ ID
 */
export const getProductGallery = async (productId: number) => {
  try {
    const response = await apiClient.get(`/images/${productId}/gallery`);
    // ສົມມຸດວ່າ Backend ສົ່ງມາເປັນ { success: true, data: [...] }
    return response.data.data || [];
  } catch (error: any) {
    console.error(`Error fetching gallery for product ${productId}:`, error);
    throw error;
  }
};
// export const saveImageGallery = async (productId: number, )
/**
 * เปลี่ยนสถานะสินค้า
 */
export const toggleProductStatus = async (id: number, isActive: boolean) => {
  try {
    const response = await apiClient.put(`/products/${id}/status`, {
      is_active: isActive ? 1 : 0
    })
    return response.data.product || response.data
  } catch (error: any) {
    console.error(`Error toggling product status ${id}:`, error)
    throw error
  }
}

/**
 * ดึงประเภทสินค้าทั้งหมด
 */
export const getProductTypes = async () => {
  try {
    const response = await apiClient.get('/productTypes')
    console.log('getProductTypes is ', response.data)
    return response.data.productTypes || response.data || []
  } catch (error: any) {
    console.error('Error fetching product types:', error)
    throw error
  }
}

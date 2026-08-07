// src/api/product.ts
import apiClient from './apiclient'
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
    const resData = response.data;

    // Backend ส่งมาเป็น: { success: true, data: { data: [...], total: X, page: Y, limit: Z } }
    const payload = resData.data || resData;

    // ดึง Array และ Total ออกมาให้ตรงชั้น
    const productsArray = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
    const totalCount = payload.total !== undefined ? payload.total : productsArray.length;

    return {
      products: productsArray,
      total: totalCount,
      page: payload.page || 1,
      totalPages: payload.totalPages || 1
    }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * 🟢 ดึงข้อมูลสินค้าเฉพาะ
 */
export const getProductById = async (id: number) => {
  try {
    const response = await apiClient.get(`/products/${id}`)
    console.log('[API] Product by ID response:', response.data)

    // Backend ส่งมาเป็น: { success: true, data: { ... } }
    return response.data.data || response.data.product || response.data
  } catch (error: any) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

/**
 * 🟢 ดึงข้อมูลสินค้าย่อย (Variants) ตาม ID สินค้าหลัก
 */
export const getProductVariants = async (productId: number) => {
  try {
    const response = await apiClient.get(`/products/${productId}/variants`)
    // Backend ส่งมาเป็น: { success: true, data: [...] }
    return response.data.data || response.data
  } catch (error: any) {
    console.error(`Error fetching variants for product ${productId}:`, error)
    throw error
  }
}

/**
 * สร้างสินค้าใหม่
 */
export const createProduct = async (data: CreateProductDto) => {
  try {
    const response = await apiClient.post('/products', data)

    // Backend ส่งมาเป็น: { success: true, message: '...', data: { ... } }
    const productData = response.data.data || response.data.product || response.data

    if (!productData?.id) {
      throw new Error('ไม่พบ ID สินค้าในข้อมูลที่ได้รับจากเซิร์ฟเวอร์')
    }

    return productData
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

    // Backend ส่งมาเป็น: { success: true, message: '...', data: { ... } }
    return response.data.data || response.data.product || response.data
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
    if (error.response?.data instanceof Blob) {
      const contentType = error.response.headers['content-type']
      if (contentType?.includes('text/html')) {
        throw new Error('เซิร์ฟเวอร์คืนค่า HTML Error Page แทน JSON')
      }
    }
    throw error
  }
}

/**
 * อัปโหลดรูปแกลเลอรี่
 */
export const uploadProductGallery = async (productId: number, files: File[]) => {
  try {
    const formData = new FormData()
    files.forEach((file) => {
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
    if (error.response?.data instanceof Blob) {
      const contentType = error.response.headers['content-type']
      if (contentType?.includes('text/html')) {
        throw new Error('เซิร์ฟเวอร์คืนค่า HTML Error Page แทน JSON')
      }
    }
    throw error
  }
}

/**
 * Sync ຂໍ້ມູນ Gallery
 */
export const saveProductGallery = async (productId: number, images: { file_url: string }[]) => {
  try {
    const response = await apiClient.post(`/images/${productId}/gallery`, {
      uploadResult: {
        success: true,
        data: {
          uploaded: images,
          failed: []
        }
      }
    })
    return response.data
  } catch (error: any) {
    console.error(`❌ [API] Error syncing product gallery:`, error)
    throw error
  }
}

/**
 * ດຶງຂໍ້ມູນ Gallery ຂອງສິນຄ້າຕາມ ID
 */
export const getProductGallery = async (productId: number) => {
  try {
    const response = await apiClient.get(`/images/${productId}/gallery`);
    return response.data.data || [];
  } catch (error: any) {
    console.error(`Error fetching gallery for product ${productId}:`, error);
    throw error;
  }
};

/**
 * เปลี่ยนสถานะสินค้า
 */
export const toggleProductStatus = async (id: number, targetStatus: boolean | number) => {
  try {
    // 🟢 เช็คแค่ true กับ 1 ก็พอครับ
    const finalStatus = (targetStatus === true || targetStatus === 1) ? 1 : 0;

    const response = await apiClient.patch(`/products/${id}`, {
      is_active: finalStatus
    });

    const resData = response.data;
    return {
      success: resData.success ?? true,
      message: resData.message ?? (finalStatus === 1 ? 'ເປີດໃຊ້ງານສຳເລັດ' : 'ປີດໃຊ້ງານສຳເລັດ'),
      product: resData.data || { id, is_active: finalStatus }
    };
  } catch (error: any) {
    const errMsg = error.response?.data?.message || 'ປ່ຽນສະຖານະມີບັນຫາ';
    throw new Error(errMsg);
  }
};

/**
 * 🟢 ປ່ຽນສະຖານະສິນຄ້າແບບຫຼາຍລາຍການພ້ອມກັນ (Bulk Toggle)
 */
export const toggleMultipleProductStatus = async (productIds: number[], isActive: boolean) => {
  try {
    const response = await apiClient.patch('/products/bulk-status', {
      productIds: productIds,
      is_active: isActive ? 1 : 0
    });

    const resData = response.data;
    return {
      success: resData.success ?? true,
      message: resData.message ?? `ອັບເດດສະຖານະສຳເລັດ`,
      // Backend ส่งมาเป็น data: { updatedCount: X }
      updatedCount: resData.data?.updatedCount || resData.updatedCount || 0
    };
  } catch (error: any) {
    const errMsg = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະຫຼາຍລາຍການ';
    throw new Error(errMsg);
  }
};

/**
 * ดึงประเภทสินค้าทั้งหมด
 */
export const getProductTypes = async () => {
  try {
    const response = await apiClient.get('/productTypes')
    // Backend ส่งมาเป็น { success: true, data: [...] }
    return response.data.data || response.data.productTypes || response.data
  } catch (error: any) {
    console.error('Error fetching product types:', error)
    throw error
  }
}

/**
 * 🟢 นำเข้าข้อมูลสินค้าจากไฟล์ Excel (Smart Bulk Import)
 * @param file - ไฟล์ Excel (.xlsx, .xls, .csv)
 * @param shopId - รหัสร้านค้า (Partner ID)
 */
export const importProductsFromExcel = async (file: File, shopId: number) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shop_id', shopId.toString()); // เผื่อ Backend ต้องใช้เช็คสิทธิ์หรืออ้างอิง

    // ยิง API ไปที่ Endpoint /products/import (หรือ /import ขึ้นอยู่กับการตั้งค่า Base URL ของ Router)
    const response = await apiClient.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('[API] Import Excel Response:', response.data);

    // Backend ส่งมาเป็น: { success: true, message: '...', importedCount: X }
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Error importing products from Excel:', error);

    // ดักจับ Error Message จาก Backend เพื่อส่งไปแสดงที่หน้า UI
    const errMsg = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າຂໍ້ມູນສິນຄ້າ';
    throw new Error(errMsg);
  }
};

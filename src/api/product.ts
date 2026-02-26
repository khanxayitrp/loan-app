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
    console.log('[API] Product by ID response:', response.data)

    if (response.data?.product) {
      return response.data.product
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
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
    console.log('[API] Product created:', response.data)

    // ✅ ตรวจสอบโครงสร้างและส่งคืนในรูปแบบมาตรฐาน { id: number, ... }
    let productData = null

    // กรณี 1: มี .product wrapper
    if (response.data?.product) {
      productData = response.data.product
    }
    // กรณี 2: มี .data wrapper
    else if (response.data?.data) {
      productData = response.data.data
    }
    // กรณี 3: ส่งคืนตรงๆ
    else {
      productData = response.data
    }

    // ✅ ตรวจสอบว่ามี id
    if (!productData?.id) {
      console.warn('⚠️ Product ID not found in response. Full response:', response.data)
      throw new Error('ไม่พบ ID สินค้าในข้อมูลที่ได้รับจากเซิร์ฟเวอร์')
    }

    console.log('✅ Created product:', productData)
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

    console.log('[API] Product updated:', response.data)

    if (response.data?.product) {
      return response.data.product
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
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
     console.error('❌ Upload product image error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      // ✅ ตรวจสอบว่าเป็น HTML Error
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
    files.forEach((file, index) => {
        formData.append('files', file)
        console.log(`📤 Adding file ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        })
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
    console.error('❌ Upload gallery error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      // ✅ ตรวจสอบว่าเป็น HTML Error
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
 * Sync ຂໍ້ມູນ Gallery (ບັນທຶກ URL ລົງຖານຂໍ້ມູນ)
 * @param productId ໄອດີສິນຄ້າ
 * @param images ລາຍການ Object ຂອງ URL { file_url: string }
 */
export const saveProductGallery = async (productId: number, images: { file_url: string }[]) => {
  try {
    // ອ້າງອີງຕາມ Route Backend: router.post('/:productId/gallery', product_galleryController.saveImageToGallery)
    // ໝາຍເຫດ: ຕ້ອງກວດສອບວ່າ Base path ຂອງ Router ແມ່ນຫຍັງ (ສົມມຸດວ່າແມ່ນ /products)
    const response = await apiClient.post(`/images/${productId}/gallery`, {
      uploadResult: {
        success: true,
        data: {
          uploaded: images,
          failed: []
        }
      }
    })

    console.log('📥 [API] Save gallery response:', response.data)
    return response.data
  } catch (error: any) {
    console.error(`❌ [API] Error syncing product gallery:`, error)
    console.error('Error details:', error.response?.data)
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
    console.log('🔄 Toggling product status:', { id, isActive });

    // ✅ แก้ไข: ใช้ () แทน template literal ``
    const response = await apiClient.patch(`/products/${id}`, {
      is_active: isActive ? 1 : 0
    });

    console.log('✅ Toggle response:', response.data);

    // ✅ ตรวจสอบโครงสร้าง response ให้ชัดเจน
    if (response.data.product) {
      return {
        success: response.data.success ?? true,
        message: response.data.message ?? (isActive ? 'ເປີດໃຊ້ງານສຳເລັດ' : 'ປີດໃຊ້ງານສຳເລັດ'),
        product: response.data.product
      }
    }

    return {
      success: response.data.success ?? true,
      message: response.data.message ?? (isActive ? 'ເປີດໃຊ້ງານສຳເລັດ' : 'ປີດໃຊ້ງານສຳເລັດ'),
      product: response.data.product || response.data
    };
  } catch (error: any) {
    const errMsg = error.response?.data?.message || 'ປ່ຽນສະຖານະມີບັນຫາ';
    console.error(`❌ Toggle product ${id} failed:`, errMsg, error);
    throw new Error(errMsg);
  }
};


/**
 * ดึงประเภทสินค้าทั้งหมด
 */
export const getProductTypes = async () => {
  try {
    const response = await apiClient.get('/productTypes')
    console.log('[API] Product types response:', response.data)

    if (response.data?.productTypes) {
      return response.data.productTypes
    }
    if (response.data?.data) {
      return response.data.data
    }
    return response.data
  } catch (error: any) {
    console.error('Error fetching product types:', error)
    throw error
  }
}

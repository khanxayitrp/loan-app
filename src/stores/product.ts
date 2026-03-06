// src/stores/product.ts
import { defineStore } from 'pinia'
import { getFullImageUrl } from '@/utils/url'
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  toggleMultipleProductStatus,
  getProductTypes,
  uploadProductImage,
  uploadProductGallery,
  saveProductGallery,
  getProductGallery
} from '@/api/product'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  GetProductsParams,
  ProductType
} from '@/types/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    productTypes: [] as ProductType[],
    isLoading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    error: null as string | null,
    currentShopId: null as number | null // ✅ เพิ่ม: เก็บ shop_id ปัจจุบัน
  }),

  getters: {
    displayedProducts: (state) => {
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return state.products.slice(start, end)
    },
    // ✅ เพิ่ม: แปลงรูปภาพเป็นลิงก์เต็มสำหรับสินค้าที่แสดง
    displayedProductsWithFullUrls: (state) => {
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      const products = state.products.slice(start, end)

      return products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url),
        gallery: Array.isArray(product.gallery)
          ? product.gallery.map(url => getFullImageUrl(url))
          : []
      }))
    },
    productTypeMap: (state) => {
      return state.productTypes.reduce((map, type) => {
        map[type.id] = type.type_name;
        return map;
      }, {} as Record<number, string>);
    },

    // ✅ เพิ่ม: แปลงรูปภาพเป็นลิงก์เต็มสำหรับสินค้าทั้งหมด
    productsWithFullUrls: (state) => {
      return state.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url),
        gallery: Array.isArray(product.gallery)
          ? product.gallery.map(url => getFullImageUrl(url))
          : []
      }))
    },

    totalPages: (state) => Math.ceil(state.total / state.pageSize),
    hasPreviousPage: (state) => state.currentPage > 1,
    hasNextPage: (state) => state.currentPage < Math.ceil(state.total / state.pageSize),
    startIndex: (state) => (state.currentPage - 1) * state.pageSize + 1,
    endIndex: (state) => Math.min(state.currentPage * state.pageSize, state.total)
  },

  actions: {
    /**
     * โหลดรายการสินค้า
     */
    async fetchProducts(params: GetProductsParams = {}) {
      this.isLoading = true
      this.error = null

      try {
        const page = params.page || this.currentPage
        const limit = params.limit || this.pageSize
        const shopId = params.shop_id

        this.currentPage = page
        this.pageSize = limit

        // ✅ ถ้าเปลี่ยนร้าน → Clear products เก่า
        if (shopId !== undefined && shopId !== this.currentShopId) {
          console.log('🔄 [ProductStore] Shop changed, clearing old products')
          console.log('  Old shop:', this.currentShopId)
          console.log('  New shop:', shopId)

          this.products = []
          this.total = 0
          this.currentShopId = shopId
        }

        console.log('📡 [ProductStore] Fetching products:', {
          shop_id: shopId,
          page,
          limit
        })

        const response = await getProducts({
          ...params,
          page,
          limit
        })

        console.log('📥 [ProductStore] API response:', response)

        // ✅ API มี normalize แล้ว ใช้ตรง ๆ
        const productsArray = Array.isArray(response.products)
          ? response.products
          : []

        const totalCount = response.total || productsArray.length

        console.log('📦 [ProductStore] Loaded products:', {
          count: productsArray.length,
          total: totalCount,
          shop_id: shopId
        })

        // ✅ ตรวจสอบว่ามี productType_id
        if (productsArray.length > 0) {
          const sample = productsArray[0]
          console.log('🔍 [ProductStore] First product:', {
            id: sample.id,
            name: sample.product_name,
            has_productType_id: 'productType_id' in sample,
            productType_id: sample.productType_id,
            keys: Object.keys(sample)
          })
        }

        // ✅ อัปเดต state
        this.products = productsArray
        this.total = totalCount

        console.log('✅ [ProductStore] Products updated:', {
          count: this.products.length,
          total: this.total
        })

      } catch (error: any) {
        console.error('❌ [ProductStore] Failed to fetch products:', error)
        this.error = error.message || 'Failed to fetch products'
        this.products = []
        this.total = 0
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ✅ เพิ่ม action สำหรับ clear products
     */
    clearProducts() {
      console.log('🗑️ [ProductStore] Clearing products')
      this.products = []
      this.total = 0
      this.currentShopId = null
    },

    /**
     * โหลดประเภทสินค้า
     */
    async fetchProductTypes() {
      try {
        const response = await getProductTypes()
        console.log('📦 [ProductStore] Product types:', response.data)
        this.productTypes = response.data
      } catch (error: any) {
        console.error('❌ [ProductStore] Failed to fetch product types:', error)
        throw error
      }
    },

    /**
     * สร้างสินค้าใหม่
     */
    async createProduct(data: CreateProductDto) {
      try {
        const newProduct = await createProduct(data)
        this.products.unshift(newProduct)
        this.total += 1
        return newProduct
      } catch (error) {
        console.error('Failed to create product:', error)
        throw error
      }
    },

    /**
     * อัปเดตสินค้า
     */
    async updateProduct(id: number, data: UpdateProductDto) {
      try {
        const updatedProduct = await updateProduct(id, data)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          // this.products[index] = updatedProduct
          // ใช้ spread operator เพื่ออัปเดตข้อมูลทั้งหมด
          this.products[index] = { ...this.products[index], ...updatedProduct }
        }
        return updatedProduct
      } catch (error) {
        console.error('Failed to update product:', error)
        throw error
      }
    },

    /**
     * เปลี่ยนสถานะสินค้า
     */
    async toggleProductStatus(id: number, isActive: boolean) {
      try {
        const updatedProduct = await toggleProductStatus(id, isActive)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          // this.products[index] = updatedProduct
          // ใช้ spread operator เพื่ออัปเดตข้อมูลทั้งหมด
          this.products[index] = { ...this.products[index], ...updatedProduct.product }
        }
        return updatedProduct
      } catch (error) {
        console.error('Failed to toggle product status:', error)
        throw error
      }
    },

    // ໃນສ່ວນ actions ຂອງ defineStore
    async toggleMultipleStatus(productIds: number[], isActive: boolean) {
      this.isLoading = true
      this.error = null
      try {
        const result = await toggleMultipleProductStatus(productIds, isActive)
        return result
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * อัปโหลดรูปภาพหลัก
     */
    async uploadProductImage(productId: number, file: File) {
      try {

        console.log('📤 Uploading product image:', {
          productId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
        const response = await uploadProductImage(productId, file)
        // อัปเดตรูปภาพใน store
        const index = this.products.findIndex(p => p.id === productId)
        if (index !== -1) {
          this.products[index].image_url = response.file_url
        }
        return response
      } catch (error) {
        console.error('Failed to upload product image:', error)
        throw error
      }
    },


    /**
     * Upload multiple gallery images
     */
    async uploadProductGallery(productId: number, files: File[]) {
      try {
        console.log('📤 [Store] Uploading gallery images for product:', productId)
        console.log('📤 [Store] Files count:', files.length)
        console.log('📤 [Store] Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

        console.log('📤 Uploading gallery:', {
          productId,
          fileCount: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        })
        // Validate files
        if (!files || files.length === 0) {
          throw new Error('ບໍ່ມີໄຟລ໌ທີ່ຈະອັບໂຫຼດ')
        }

        // Call upload service
        const response = await uploadProductGallery(productId, files)

        console.log('📥 [Store] Raw response:', response)

        // ✅ Validate response structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from server')
        }

        // ✅ Extract data based on actual backend response format
        const success = response.success ?? false
        const message = response.message || 'Upload completed'

        // Get uploaded and failed arrays
        const uploadedArray = response.data?.uploaded || []
        const failedArray = response.data?.failed || []

        console.log('📥 [Store] Parsed response:', {
          success,
          message,
          uploaded: uploadedArray.length,
          failed: failedArray.length
        })

        // ✅ Return in standardized format
        return {
          success: success,
          message: message,
          data: {
            uploaded: uploadedArray,  // Array of { file_url, file_name }
            failed: failedArray        // Array of error strings
          }
        }

      } catch (error: any) {
        console.error('❌ [Store] Error uploading gallery images:', error)
        console.error('❌ [Store] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        throw error
      }
    },

    /**
     * Sync product gallery - replace all gallery images with new list
     */
    async addProductGallery(productId: number, images: Array<{ file_url: string }>) {
      try {
        console.log('🔄 [Store] Syncing gallery for product:', productId)
        console.log('🔄 [Store] Images count:', images.length)
        console.log('🔄 [Store] Images:', images)

        // Validate images
        if (!Array.isArray(images)) {
          throw new Error('Images must be an array')
        }

        // Call sync service
        const response = await saveProductGallery(productId, images)

        console.log('✅ [Store] Sync response:', response)

        // ✅ Validate response
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from server')
        }

        // ✅ Return standardized format
        return {
          success: response.success ?? true,
          message: response.message || 'Sync successful',
          data: response.data || { synced_count: images.length }
        }

      } catch (error: any) {
        console.error('❌ [Store] Error syncing gallery:', error)
        throw error
      }
    },
    /**
     * ໂຫລດຂໍ້ມູນ Gallery ມາໄວ້ໃນ Store
     */
    async fetchProductGallery(productId: number) {
      try {
        const gallery = await getProductGallery(productId);

        // ອັບເດດຂໍ້ມູນ gallery ເຂົ້າໄປໃນ Object ຂອງສິນຄ້ານັ້ນໆໃນ store
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          // ເກັບເປັນ Array ຂອງ String (URL) ເພື່ອໃຫ້ງ່າຍຕໍ່ການໃຊ້ໃນ v-for
          this.products[index].gallery = gallery.map((item: any) => item.image_url);
        }
        return gallery;
      } catch (error) {
        console.error('Failed to fetch product gallery:', error);
        throw error;
      }
    },

    // /**
    //  * เปลี่ยนหน้า
    //  */
    // async changePage(page: number) {
    //   await this.fetchProducts({ page, limit: this.pageSize })
    // },

    // /**
    //  * เปลี่ยนขนาดหน้า
    //  */
    // async changePageSize(size: number) {
    //   await this.fetchProducts({ page: 1, limit: size })
    // }

    // ✅ แบบใหม่ที่ถูกต้อง (แค่เปลี่ยนค่า State พอ ไม่ต้องยิง API)
    changePage(page: number) {
      this.currentPage = page;
    },
    changePageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
    },
  }
})

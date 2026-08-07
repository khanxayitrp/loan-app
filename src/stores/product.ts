// src/stores/product.ts
import { defineStore } from 'pinia'
import { getFullImageUrl } from '@/utils/url'
import {
  getProducts,
  getProductById,
  getProductVariants, // 🟢 ເພີ່ມ Import ໃໝ່
  createProduct,
  updateProduct,
  toggleProductStatus as toggleProductStatusApi,
  toggleMultipleProductStatus,
  getProductTypes,
  uploadProductImage,
  uploadProductGallery,
  saveProductGallery,
  getProductGallery
} from '@/api/product'
import type { Product, CreateProductDto, UpdateProductDto, GetProductsParams, ProductType } from '@/types/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    productTypes: [] as ProductType[],
    isLoading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    error: null as string | null,
    currentShopId: null as number | null
  }),

  getters: {
    // 🟢 แก้ไข: ดึง products ไปแสดงตรงๆ ไม่ต้อง .slice ซ้ำ เพราะ Backend ตัดหน้ามาให้แล้ว
    displayedProducts: (state) => {
      return state.products
    },

    // 🟢 แก้ไข: ลบ .slice ออก เพื่อให้ข้อมูลหน้า 2,3,4 ยอมแสดงผลบนหน้าตาราง Vue
    displayedProductsWithFullUrls: (state) => {
      return state.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url),
        gallery: Array.isArray(product.gallery)
          ? product.gallery.map(img => getFullImageUrl(img.image_url))
          : []
      }))
    },

    productTypeMap: (state) => {
      return state.productTypes.reduce((map, type) => {
        map[type.id] = type.type_name;
        return map;
      }, {} as Record<number, string>);
    },

    productsWithFullUrls: (state) => {
      return state.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url),
        gallery: Array.isArray(product.gallery)
          ? product.gallery.map(img => getFullImageUrl(img.image_url))
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
     * โหลดรายการสินค้าจาก Server
     */
    async fetchProducts(params: GetProductsParams = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        const page = params.page || this.currentPage;
        const limit = params.limit || this.pageSize;
        const shopId = params.shop_id;

        this.currentPage = page;
        this.pageSize = limit;

        // เคลียร์ข้อมูลเดิมทิ้งหากมีการเปลี่ยนร้านค้า
        if (shopId !== undefined && shopId !== this.currentShopId) {
          this.products = [];
          this.total = 0;
          this.currentShopId = shopId;
        }

        // ยิง API ดึงข้อมูลตามเลขหน้าปัจจุบัน
        const response = await getProducts({
          ...params,
          page,
          limit
        });

        this.products = response.products || [];
        this.total = response.total || 0;

        console.log('✅ [ProductStore] Products loaded successfully:', this.products.length);

      } catch (error: any) {
        console.error('❌ [ProductStore] Failed to fetch products:', error);
        this.error = error.message || 'Failed to fetch products';
        this.products = [];
        this.total = 0;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearProducts() {
      console.log('🗑️ [ProductStore] Clearing products')
      this.products = []
      this.total = 0
      this.currentShopId = null
    },

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

    async fetchProductById(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const product = await getProductById(id);

        const productWithUrls = {
          ...product,
          image_url: getFullImageUrl(product.image_url),
          gallery: Array.isArray(product.gallery)
            ? product.gallery.map((img: any) => getFullImageUrl(img.image_url || img))
            : []
        };

        return productWithUrls;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch product';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 🟢 ດຶງຂໍ້ມູນສິນຄ້າຍ່ອຍ (Variants) ຕາມ ID ຂອງສິນຄ້າຫຼັກ
     */
    async fetchVariantsByProductId(productId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const variants = await getProductVariants(productId);
        return variants;
      } catch (error: any) {
        console.error(`❌ [ProductStore] Failed to fetch variants for product ${productId}:`, error);
        this.error = error.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍການຍ່ອຍໄດ້';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

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

    async updateProduct(id: number, data: UpdateProductDto) {
      try {
        const updatedProduct = await updateProduct(id, data)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedProduct }
        }
        return updatedProduct
      } catch (error) {
        console.error('Failed to update product:', error)
        throw error
      }
    },

    async toggleProductStatus(id: number, isActive: boolean) {
      try {
        const updatedProduct = await toggleProductStatusApi(id, isActive)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedProduct.product }
        }
        return updatedProduct
      } catch (error) {
        console.error('Failed to toggle product status:', error)
        throw error
      }
    },

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

    async uploadProductImage(productId: number, file: File) {
      try {
        console.log('📤 Uploading product image:', {
          productId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
        const response = await uploadProductImage(productId, file)
        const index = this.products.findIndex(p => p.id === productId)
        if (index !== -1) {
          this.products[index]!.image_url = response.file_url
        }
        return response
      } catch (error) {
        console.error('Failed to upload product image:', error)
        throw error
      }
    },

    async uploadProductGallery(productId: number, files: File[]) {
      try {
        if (!files || files.length === 0) {
          throw new Error('ບໍ່ມີໄຟລ໌ທີ່ຈະອັບໂຫຼດ')
        }
        const response = await uploadProductGallery(productId, files)
        const success = response.success ?? false
        const message = response.message || 'Upload completed'
        const uploadedArray = response.data?.uploaded || []
        const failedArray = response.data?.failed || []

        return {
          success,
          message,
          data: { uploaded: uploadedArray, failed: failedArray }
        }
      } catch (error: any) {
        console.error('❌ [Store] Error uploading gallery images:', error)
        throw error
      }
    },

    async addProductGallery(productId: number, images: Array<{ file_url: string }>) {
      try {
        if (!Array.isArray(images)) {
          throw new Error('Images must be an array')
        }
        const response = await saveProductGallery(productId, images)
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

    async fetchProductGallery(productId: number) {
      try {
        const gallery = await getProductGallery(productId);
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index]!.gallery = gallery.map((item: any) => item.image_url);
        }
        return gallery;
      } catch (error) {
        console.error('Failed to fetch product gallery:', error);
        throw error;
      }
    },

    // 🟢 แก้ไข: แค่เปลี่ยนค่าใน State เท่านั้น (ส่วนหน้าที่ยิง API ให้ปล่อยเป็นหน้าที่ของไฟล์ Vue)
    changePage(page: number) {
      this.currentPage = page;
    },
    changePageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
    },
  }
})

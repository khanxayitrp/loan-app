// src/stores/productType.ts
import { defineStore } from 'pinia'
import {
  fetchProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  getProductTypesByID
} from '@/api/productType'
import type { ProductType, ProductTypeForm } from '@/types/productType'

export const useProductTypeStore = defineStore('productType', {
  state: () => ({
    productTypes: [] as ProductType[],
    productType: null as ProductType | null,
    isLoading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    error: null as string | null
  }),

  getters: {
    displayedProductTypes: (state) => {
      const data = Array.isArray(state.productTypes) ? state.productTypes : []
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return data.slice(start, end)
    },

    totalPages: (state) => Math.ceil(state.total / state.pageSize),
    hasPreviousPage: (state) => state.currentPage > 1,
    hasNextPage: (state) => state.currentPage < Math.ceil(state.total / state.pageSize),
    startIndex: (state) => (state.currentPage - 1) * state.pageSize + 1,
    endIndex: (state) => Math.min(state.currentPage * state.pageSize, state.total)
  },

  actions: {
    /**
     * โหลดรายการประเภทสินค้า
     */
    async fetchProductTypes(page: number = 1, limit: number = 10) {
      this.isLoading = true
      this.error = null
      try {
        this.currentPage = page
        this.pageSize = limit

        const response = await fetchProductTypes({ page, limit })
        console.log('get all productType', response)
        // ✅ ตรวจสอบว่าเป็น array
        this.productTypes = Array.isArray(response.data) ? response.data : []
        this.total = response.total || response.data.length || 0

      } catch (error: any) {
        console.error('Failed to fetch product types:', error)
        // ✅ ตั้งค่า default เมื่อ error
        this.error = error.message || 'Failed to fetch product types'
        this.productTypes = []
        this.total = 0
        throw error

      } finally {
        this.isLoading = false
      }
    },
     /**
     * โหลดรายการประเภทสินค้า
     */
    async fetchProductTypeById(productTypeId: number) {
      this.isLoading = true
      this.error = null
      try {


        const response = await getProductTypesByID(productTypeId)
        console.log('get all productType', response)
        // ✅ ตรวจสอบว่าเป็น array
        this.productType = response.data || response


      } catch (error: any) {
        console.error('Failed to fetch product types:', error)
        // ✅ ตั้งค่า default เมื่อ error
        this.error = error.message || 'Failed to fetch product types'
        this.productType = null
        throw error

      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้างประเภทสินค้าใหม่
     */
    async createProductType(data: ProductTypeForm) {
      try {
        const newProductType = await createProductType(data)
        this.productTypes.unshift(newProductType)
        this.total += 1
        return newProductType
      } catch (error) {
        console.error('Failed to create product type:', error)
        throw error
      }
    },

    /**
     * อัปเดตประเภทสินค้า
     */
    async updateProductType(id: number, data: ProductTypeForm) {
      try {
        const updatedProductType = await updateProductType(id, data)
        const index = this.productTypes.findIndex(pt => pt.id === id)
        if (index !== -1) {
          this.productTypes[index] = updatedProductType
        }
        return updatedProductType
      } catch (error) {
        console.error('Failed to update product type:', error)
        throw error
      }
    },

    /**
     * ลบประเภทสินค้า
     */
    async deleteProductType(id: number) {
      try {
        await deleteProductType(id)
        this.productTypes = this.productTypes.filter(pt => pt.id !== id)
        this.total -= 1
      } catch (error) {
        console.error('Failed to delete product type:', error)
        throw error
      }
    },

    /**
     * เปลี่ยนหน้า
     */
    async changePage(page: number) {
      await this.fetchProductTypes(page, this.pageSize)
    },

    /**
     * เปลี่ยนขนาดหน้า
     */
    async changePageSize(size: number) {
      await this.fetchProductTypes(1, size)
    }
  }
})

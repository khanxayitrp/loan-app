// src/stores/shop.ts
import { defineStore } from 'pinia'
import { getFullImageUrl } from '@/utils/url'
import { getCurrentShop, updateShop, createShop, changeStatus, getAllShop } from '@/api/shop'
import type { shopType, shopTypeForm } from '@/types/shop'

// export interface Shop {
//   id: number
//   shop_name: string
//   shop_code: string
//   owner_name: string
//   phone: string
//   address: string
//   province: string
//   district: string
//   village: string
//   business_type: string
//   is_active: number
//   logo?: string
//   created_at: string
// }

export const useShopStore = defineStore('shop', {
  state: () => ({
    shops: [] as shopType[],
    currentShop: null as shopType | null,
    isLoading: false,
    isCreating: false, // ✅ เพิ่ม state สำหรับโหมดสร้างใหม่
    isEditing: false,
    error: null as string | null
  }),

  getters: {
    getShopById: (state) => (shopId: number) => {
      return state.shops.find(shop => shop.id === shopId)
    },

    getShopsByName: (state) => (searchQuery: string) => {
      const query = searchQuery.toLowerCase()
      return state.shops.filter(shop =>
        shop.shop_name?.toLowerCase().includes(query) ||
        shop.shop_owner?.toLowerCase().includes(query)
      )
    },
    hasShop: (state) => state.currentShop !== null,
    currentShopWithFullUrls: (state) => {
      if (!state.currentShop) return null

      return {
        ...state.currentShop,
        shop_logo_url: getFullImageUrl(state.currentShop.shop_logo_url)
      }
    }
  },

  actions: {
    /**
     * โหลดข้อมูลร้านค้าปัจจุบัน
     */
    async fetchAllShop() {

      // ✅ ป้องกัน double fetch และไม่โหลดซ้ำถ้ามีข้อมูลอยู่แล้ว
      if (this.isLoading) {
        console.log('[ShopStore] Already fetching or shop data exists, skipping...')
        return
      }
      this.isLoading = true
      this.error = null
      try {
        // จำลอง API call
        console.log('[ShopStore] Fetching current shop...')
        const response = await getAllShop()

        console.log('[ShopStore] Raw API Response:', response)
        console.log('[ShopStore] Response type:', typeof response)
        console.log('[ShopStore] Response keys:', Object.keys(response || {}))

        // ✅ Normalize response structure
        let shopData = null

        // ✅ จัดการกรณีไม่มีร้านค้า
        if (response === null) {
          this.shops = null
        } else {
          // ✅ extract ข้อมูลให้ถูกต้อง
          shopData = response

          this.shops = { ...shopData }
        }

        // รีเซ็ตโหมด
        this.isEditing = false
        this.isCreating = false


      } catch (error: any) {
        console.error('Failed to fetch shop:', error)
        this.error = error.message || 'Failed to fetch shop data'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCurrentShop() {

      // ✅ ป้องกัน double fetch และไม่โหลดซ้ำถ้ามีข้อมูลอยู่แล้ว
      if (this.isLoading) {
        console.log('[ShopStore] Already fetching or shop data exists, skipping...')
        return
      }
      this.isLoading = true
      this.error = null
      try {
        // จำลอง API call
        console.log('[ShopStore] Fetching current shop...')
        const response = await getCurrentShop()

        console.log('[ShopStore] Raw API Response:', response)
        console.log('[ShopStore] Response type:', typeof response)
        console.log('[ShopStore] Response keys:', Object.keys(response || {}))

        // ✅ Normalize response structure
        let shopData = null

        // ✅ จัดการกรณีไม่มีร้านค้า
        if (response === null) {
          this.currentShop = null
        } else {
          // ✅ extract ข้อมูลให้ถูกต้อง
          shopData = response

          this.currentShop = { ...shopData }
        }

        // รีเซ็ตโหมด
        this.isEditing = false
        this.isCreating = false


      } catch (error: any) {
        console.error('Failed to fetch shop:', error)
        this.error = error.message || 'Failed to fetch shop data'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    /**
     * อัปเดตข้อมูลร้านค้า
     */
    // async updateShop(userId: number, shopData: Partial<shopTypeForm>) {
    //   if (!this.currentShop) {
    //     throw new Error('No current shop to update')
    //   }

    //   this.isLoading = true
    //   this.error = null

    //   try {
    //     const response = await updateShop(userId, shopData)
    //     this.currentShop = response
    //     this.isEditing = false
    //     return response
    //   } catch (error: any) {
    //     console.error('Failed to update shop:', error)
    //     this.error = error.message || 'Failed to update shop'
    //     throw error
    //   } finally {
    //     this.isLoading = false
    //   }
    // },
    async updateShop(shopId: number, shopData: any) {
      console.log('[ShopStore] Updating shop:', shopId, shopData)

      try {
        const response = await updateShop(shopId, shopData)
        console.log('[ShopStore] Shop updated raw response:', response)

        let ShopResult = null
        if (response?.shop) {
          ShopResult = response.shop
        } else if (response?.data) {
          ShopResult = response.data
        } else if (response) {
          ShopResult = response
        }

        if (ShopResult && typeof ShopResult === 'object') {
          // ✅ อัปเดต currentShop ถ้า ID ตรงกัน
          if (this.currentShop && this.currentShop.id === ShopResult.id) {
            this.currentShop = { ...this.currentShop, ...ShopResult }
            console.log('[ShopStore] currentShop updated (merge):', this.currentShop)
          } else {
            // ✅ ถ้ายังไม่มี currentShop หรือ ID ไม่ตรง → set ใหม่
            this.currentShop = ShopResult
            console.log('[ShopStore] currentShop set from update:', this.currentShop)
          }
          this.isEditing = false
          return this.currentShop
        } else {
          throw new Error('Invalid or empty shop data in response from updateShop')
        }
      } catch (error: any) {
        console.error('[ShopStore] Error updating shop:', error)
        throw error
      }
    },

    // ✅ อัปเดต saveShop ให้ return promise
    async saveShop(shopData: shopTypeForm) {
      this.isLoading = true
      try {
        // if (this.currentShop) {
        //   // Edit mode - อัปเดตข้อมูล
        //   throw new Error('Exists Shop!!')
        // }
        const response = await createShop(shopData)
        console.log('Response from createShop:', response)
        console.log('Response type:', typeof response)

        // ✅ ตรวจสอบว่า response เป็น object และ extract ข้อมูลที่ถูกต้อง
        let ShopResult = null
        if (response?.shop) {
          ShopResult = response.shop
        } else if (response?.data) {
          ShopResult = response.data
        } else if (response) {
          ShopResult = response
        }

        if (ShopResult && typeof ShopResult === 'object') {
          this.currentShop = ShopResult
          this.isCreating = false
        } else {
          throw new Error('Invalid or empty shop data in response from createShop')
        }

        return response

      } catch (error: any) {
        console.error('Failed to save shop:', error)
        throw error // ส่ง error กลับไปยัง component
      } finally {
        this.isLoading = false
      }
    },

    async updateStatus(shopId: number, isActive: boolean) {
      this.isLoading = true
      try {
        const response = await changeStatus(shopId, isActive)

        return response
      } catch (error: any) {
        console.error('Failed to updateStatus shop:', error)
        throw error // ส่ง error กลับไปยัง component
      } finally {
        this.isLoading = false
      }
    },

    // ✅ เพิ่ม actions สำหรับโหมดสร้างใหม่
    startCreating() {
      this.isCreating = true
      this.isEditing = false
    },

    cancelCreating() {
      this.isCreating = false
    },

    startEditing() {
      this.isEditing = true
      this.isCreating = false
    },

    cancelEditing() {
      this.isEditing = false
    }
  }

})

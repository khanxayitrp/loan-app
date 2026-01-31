// src/stores/shop.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Shop {
  id: number
  shop_name: string
  shop_code: string
  owner_name: string
  phone: string
  address: string
  province: string
  district: string
  village: string
  business_type: string
  is_active: number
  logo?: string
  created_at: string
}

export const useShopStore = defineStore('shop', () => {
  const bypassCreate = ref(import.meta.env.VITE_BYPASS_CREATE_SHOP === 'true')
  const currentShop = ref<Shop | null>(null)
  const isLoading = ref(false)
  const isEditing = ref(false)


  const fetchShop = async () => {
    isLoading.value = true
    try {
      // จำลอง API call
      await new Promise(resolve => setTimeout(resolve, 800))

      // ใน production ให้เรียก API จริง:
      // const response = await fetch('/api/shop')
      // currentShop.value = await response.json()

      // Mock data
      currentShop.value = {
        id: 1,
        shop_name: 'ຮ້ານເຂົ້າໜົມສົມພອນ',
        shop_code: 'SHOP001',
        owner_name: 'ສົມຊາຍ ພົນສຸກ',
        phone: '020 5555 1234',
        address: 'ວຽງຈັນ, ບ້ານໂພນພ່າວ',
        province: 'Vientiane',
        district: 'ໄຊເຊດຖາ',
        village: 'ນາມວົງ',
        business_type: 'retail',
        is_active: 1,
        logo: '',
        created_at: '2024-01-15'
      }
    } catch (error) {
      console.error('Failed to fetch shop:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ✅ อัปเดต saveShop ให้ return promise
  const saveShop = async (shopData: Partial<Shop>) => {
    isLoading.value = true
    try {
      if (currentShop.value) {
        // Edit mode - อัปเดตข้อมูล
        currentShop.value = { ...currentShop.value, ...shopData } as Shop
      } else {
        // Create mode - สร้างข้อมูลใหม่
        currentShop.value = {
          id: Date.now(),
          ...shopData,
          is_active: 1,
          created_at: new Date().toISOString().split('T')[0]
        } as Shop
      }
      // ไม่ต้องปิดโหมดแก้ไขที่นี่ เพราะ parent จะจัดการ
    } catch (error) {
      console.error('Failed to save shop:', error)
      throw error // ส่ง error กลับไปยัง component
    } finally {
      isLoading.value = false
    }
  }

  const startEditing = () => {
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
  }

  return {
    currentShop,
    isLoading,
    isEditing,
    fetchShop,
    saveShop,
    startEditing,
    cancelEditing,
    bypassCreate
  }
})

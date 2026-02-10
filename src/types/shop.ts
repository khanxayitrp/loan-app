// src/types/shop.ts
export interface shopType {
  id: number
  user_id: number
  shop_id: string
  shop_name: string
  shop_owner: string | null
  contact_number: string | null
  shop_logo_url: string | null
  address: string | null
  business_type: string
  is_active: number

}

export interface shopType1 {
  id: number
  user_id: number
  shop_id: string
  shop_name: string
}

export type shopTypeForm = Omit<shopType, 'shop_id'>



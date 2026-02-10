// src/types/productType.ts
export interface ProductType {
  id: number
  partner_id: number
  type_name: string
  description: string | null
  is_active: boolean // 👈 ใช้ boolean แทน number
  created_at: string
}

export interface ProductTypeForm {
  type_name: string
  description: string | null
  is_active: number
}

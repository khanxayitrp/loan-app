// src/types/productType.ts
export interface ProductType {
  id: number
  type_name: string
  description: string | null
  is_active: number
  created_at: string
}

export interface ProductTypeForm {
  type_name: string
  description: string | null
  is_active: number
}

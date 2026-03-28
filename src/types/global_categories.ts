// src/types/global_categories.ts

export interface GlobalCategory {
  id: number;
  category_name: string;
  prefix_code: string;
  description?: string;
  is_active?: number | boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ข้อมูลสำหรับตอนสร้างหมวดหมู่ใหม่ (ไม่ต้องส่ง id, createdAt, updatedAt)
export interface CreateGlobalCategoryDto {
  category_name: string;
  prefix_code: string;
  description?: string;
  is_active?: number | boolean;
}

// ข้อมูลสำหรับตอนแก้ไขหมวดหมู่ (ส่งแค่บางฟิลด์ที่ต้องการแก้ได้)
export type UpdateGlobalCategoryDto = Partial<CreateGlobalCategoryDto>;

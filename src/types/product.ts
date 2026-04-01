// src/types/product.ts
export interface ProductType {
  id: number
  type_name: string
}

export interface ProductGallery {
  id: number
  product_id: number
  image_url: string
}

export interface Product {
  id: number
  productType_id: number
  product_name: string
  brand: string // เพิ่ม
  model: string // เพิ่ม
  price: number | string // ບາງເທື່ອ Decimal ຈາກ DB ມາເປັນ string
  interest_rate: number | string
  image_url: string | null
  gallery?: ProductGallery[] | null // ຮອງຮັບການ Join ຈາກ backend
  is_active: number
  created_at: string | Date
  updated_at: string | Date | null
  type_name?: string
  term?: number
  partner_id?: number
  shop_id?: number
  description?: string | null;
  interest_type?: 'flat_rate' | 'effective_rate';
  interest_rate_type?: 'monthly' | 'yearly';
  merchant_sku?: string | null;
  system_sku?: string | null;
  stock_quantity?: number;
}

export interface CreateProductDto {
  product_name: string
  brand: string // เพิ่ม
  model: string // เพิ่ม
  productType_id: number
  price: number
  interest_rate: number
  is_active: number
  // 🟢 ເພີ່ມ 2 ບັນທັດນີ້ເຂົ້າໄປ
  description?: string | null;
  interest_rate_type?: 'monthly' | 'yearly';
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id?: number
  image_url?: string | null; // ເພີ່ມໂຕນີ້ເພື່ອຮອງຮັບການ update Path ຮູບຫຼັກ
}

export interface GetProductsParams {
  shop_id?: number
  search?: string
  status?: string
  type?: string
  page?: number
  limit?: number
}


// ເພີ່ມ Interface ສຳລັບ Response ຈາກ API Upload (ທີ່ເຈົ້າເຄີຍໂຊໃຫ້ເບິ່ງ)
export interface UploadImageResponse {
  success: boolean
  message: string
  data: {
    file_url: string
    file_name: string
    file_path: string
  }
}

export interface UploadGalleryResponse {
  success: boolean
  message: string
  data: {
    uploaded: Array<{
      file_url: string
      file_name: string
    }>
    failed: string[]
  }
}

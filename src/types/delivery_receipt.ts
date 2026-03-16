export type DeliveryReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface DeliveryReceipt {
  id: number;
  application_id: number;
  receipts_id: string;
  delivery_date: string; // ISO String ຈາກ Backend
  receiver_name: string;
  receipt_image_url?: string | null;
  status: DeliveryReceiptStatus;
  remark?: string | null;
  approver_id?: number | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeliveryReceiptDto {
  application_id: number;
  delivery_date: string;
  receiver_name: string;
  receipt_image_url?: string | null;
  status?: DeliveryReceiptStatus;
  remark?: string | null;
}

export interface UpdateDeliveryReceiptDto {
  delivery_date?: string;
  receiver_name?: string;
  receipt_image_url?: string | null;
  status?: DeliveryReceiptStatus;
  remark?: string | null;
}

// Response Types ຈາກ Backend
export interface DeliveryReceiptResponse {
  success: boolean;
  message: string;
  data: DeliveryReceipt;
}

export interface DeliveryReceiptArrayResponse {
  success: boolean;
  message: string;
  data: DeliveryReceipt[]; // ເພາະ Backend ໃຊ້ findAll ຈຶ່ງສົົ່ງມາເປັນ Array
}

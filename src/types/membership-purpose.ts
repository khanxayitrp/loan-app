export interface CreditPurpose {
  id: number;
  purpose_code: string;
  purpose_name: string;
  description?: string;
  is_active?: number | boolean;
  sort_order?: number;
}

export interface CreditPurposeResponse {
  success: boolean;
  data: CreditPurpose[];
}
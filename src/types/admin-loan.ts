export interface OverrideAudit {
  reference_doc: string;
  reason: string;
}

export interface OverrideData {
  status: string;
  partner_id: number | null;
  product_id: number | null;
  variant_id: number | null;
  total_amount: number;
  down_payment: number;
  loan_period: number;
  interest_rate: number;
  monthly_pay: number;
}

export interface OverridePayload {
  action: 'FULL_OVERRIDE';
  data: OverrideData;
  audit: OverrideAudit;
}

export interface AdminLoanSnapshot {
  id: number;
  loan_id: string;
  status: string;
  partner_name: string; // Map มาจาก Backend แล้ว
  product_id: number | null;
  variant_id: number | null;
  total_amount: number;
  down_payment: number;
  loan_period: number;
  interest_rate_at_apply: number;
  monthly_pay: number;
  product?: {
    product_name: string;
    partner_id: number;
  };
  variant?: {
    color: string;
    system_sku: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

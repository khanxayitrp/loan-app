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

  // 🌟 ເພີ່ມ Field ໃໝ່ທີ່ກ່ຽວຂ້ອງກັບຟອມ
  interest_type: string;
  first_installment_date?: string;
  replacement_loan_id_str?: string;
}

export interface OverridePayload {
  // 🌟 ປ່ຽນເປັນ string ເພື່ອໃຫ້ຮອງຮັບ Action ຫຼາຍປະເພດ
  action: string;
  data: OverrideData;
  audit: OverrideAudit;
}

export interface AdminLoanSnapshot {
  id: number;
  loan_id: string;
  status: string;
  partner_name: string;
  product_id: number | null;
  variant_id: number | null;
  total_amount: number;
  down_payment: number;
  loan_period: number;
  interest_rate_at_apply: number;
  interest_type?: string;
  monthly_pay: number;

  // 🌟 ເພີ່ມ 2 Field ນີ້ເຂົ້າໄປເພື່ອບອກ TypeScript ວ່າຈະມີ Array ຂອງຕາຕະລາງສົ່ງມາ
  repayments?: any[];
  repayment_schedules?: any[];

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

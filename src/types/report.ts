
// src/types/report.ts

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  page?: number;
  [key: string]: any;
}

export interface ReportResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: any;
}

export interface DisbursedLoanReportRow {
  id: number;
  loan_id: string;
  total_amount: number | string;
  down_payment: number | string;
  interest_rate_at_apply: number | string;
  loan_period: number;
  fee: number | string;
  approved_at: string;
  createdAt: string;
  payment_day: string | number;
  first_installment_date?: string;
  customer?: {
    id?: number;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    age: number;
    address: string;
    date_of_birth?: string;
    customer_work_infos?: Array<{
      salary: number | string;
      duration_years: number;
    }>;
  };
  product?: {
    id?: number;
    productType_id?: number;
    product_name: string;
    brand?: string;
    model?: string;
    system_sku?: string;
    // 🟢 ເພີ່ມຮອງຮັບຊື່ຮ້ານຄ້າທີ່ Join ມາຈາກຕາຕະລາງ Partners
    partner?: {
      shop_name?: string;
    };
  };
  // 🟢 ເພີ່ມຮອງຮັບ Product Variants ສຳລັບລະບົບ E-commerce/BNPL Cart
  product_variant?: {
    id?: number;
    system_sku?: string;
    color?: string;
    size_or_capacity?: string;
    weight_gram?: number;
    price?: number | string;
  };
  requester?: { id?: number; username: string; full_name: string };
  assessor?: { id?: number; username: string; full_name: string };
  approver?: { id?: number; username: string; full_name: string };
  repayments?: Array<{
    installment_no: number;
    due_date: string;
  }>;
  loan_contracts?: Array<{
    loan_contract_number: string;
    cus_sex: string;
  }>;
  // 🟢 ເພີ່ມຮອງຮັບການດຶງຂໍ້ມູນພະນັກງານປະເມີນ ຈາກ Approval Logs
  loan_approval_logs?: Array<{
    action: string;
    performed_at: string;
    performed_by_user?: {
      id?: number;
      username: string;
      full_name: string;
    };
  }>;
  [key: string]: any;
}


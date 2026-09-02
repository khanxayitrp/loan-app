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
  total_amount: number;
  down_payment: number;
  interest_rate_at_apply: number;
  loan_period: number;
  fee: number;
  approved_at: string;
  createdAt: string;
  payment_day: string;
  first_installment_date?: string;
  customer?: {
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    age: number;
    address: string;
    date_of_birth?: string;
    customer_work_infos?: Array<{
      salary: number;
      duration_years: number;
    }>;
  };
  product?: {
    productType_id?: number; // 🟢 ເພີ່ມໂຕນີ້
    product_name: string;
  };
  requester?: { username: string; full_name: string };
  assessor?: { username: string; full_name: string };
  approver?: { username: string; full_name: string };
  repayments?: Array<{
    installment_no: number;
    due_date: string;
  }>;
  loan_contracts?: Array<{
    loan_contract_number: string;
    cus_sex: string;
  }>;
  [key: string]: any;
}

import type { Product } from './product';

/**
 * สถานะของคำขอสินเชื่อ (ตาม Backend)
 */
export enum LoanApplicationStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  CLOSED_EARLY = 'closed_early',
  DISBURSED = 'disbursed',
  CLOSED = 'closed'
}
/**
 * Document Model
 */
export interface Document {
  id: number
  application_id: number
  doc_type: string
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_at: string
  uploaded_by?: number
}

import type { CustomerLocation } from './customer';
export type { CustomerLocation };

/**
 * Customer Model (พร้อม Documents และ Locations)
 */
export interface CustomerLoan {
  id: number
  phone: string
  identity_number: string
  first_name: string
  last_name: string
  address: string
  date_of_birth?: string;
  age?: number;
  census_number?: string;
  unit?: string;
  issue_place?: string;
  issue_date?: string;
  occupation: string
  income_per_month: number
  other_debts?: number
  work_info?: WorkInfo[] // ຂໍ້ມູນວຽກປັດຈຸບັນ
  locations?: CustomerLocation[]
}

export interface WorkInfo {
  id: number
  company_name: string
  address: string
  phone: string
  business_type: string
  business_detail: string
  duration_years: number
  duration_months: number
  department: string
  position: string
  salary: number
  created_at?: string
}

export interface Guarantor {
  id: number
  name: string
  identity_number: string
  phone: string
  address: string
  occupation: string
  relationship: string
  work_company_name: string
  work_position: string
  work_salary: number
  date_of_birth?: string
  work_phone?: string
  work_address?: string
}

/**
 * Loan Application Model (ตรงกับ Database Table)
 */
export interface LoanApplication {
  id: number
  customer_id: number
  product_id: number
  loan_id: string
  total_amount: number | string
  down_payment?: number | string
  loan_period: number
  interest_rate_at_apply: number
  monthly_pay: number
  is_confirmed: number
  status: LoanApplicationStatus
  requester_id?: number
  approver_id?: number
  partner_id?: number
  shop_id?: number
  applied_at?: string
  approved_at?: string
  credit_score?: number
  remarks?: string
  created_at?: string
  updated_at?: string
  fee?: number
  first_installment_amount?: number
  payment_day?: number
  borrower_signature_date?: string
  guarantor_signature_date?: string
  staff_signature_date?: string
  loan_guarantors?: Guarantor[]

  // Relations (ถ้า backend ส่งมา)
  customer?: CustomerLoan
  product?: Product
  guarantor?: Guarantor;
  requester?: { id: number; name: string }
  approver?: { id: number; full_name: string; username: string; }
  documents?: Document[]
}

// ==========================================
// 🟢 CHECKLIST TYPES (เพิ่มใหม่)
// ==========================================
export interface BasicVerification {
  id?: number;
  application_id?: number;
  cus_contact_method: string;
  verified_first_name: string;
  verified_last_name: string;
  verified_dob: string;
  verified_address: string;
  verified_product_type: string;
  verified_price: number;
  verified_down_payment: number;
  verified_monthly_pay: number;
  has_id_card: boolean;
  has_census_book: boolean;
  has_income_doc: boolean;
  has_other_doc: boolean;
  other_doc_detail: string;
  cus_credibility_assessment: string;
  work_company_name: string;
  work_position: string;
  work_salary: number;
  work_years: number;
  workplace_assessment: string;
  status: string;
}

export interface CallRecord {
  id?: number;
  application_id?: number;
  call_target: string;
  contact_name: string;
  contact_phone: string;
  relationship: string;
  is_info_matching: boolean;
  call_status: string;
  remark: string;
}

export interface CIBCheck {
  id?: number;
  application_id?: number;
  good_history_count: number;
  good_history_institutions: string;
  bad_history_count: number;
  bad_history_institutions: string;
  is_existing_customer: boolean;
  existing_customer_status: string;
  remark: string;
}

export interface FieldVisitRecord {
  id?: number;
  application_id?: number;
  visit_type: string;
  visit_date: string;
  living_condition: string;
  is_address_correct: boolean;
  remarks: string;
  latitude: number | null;
  longitude: number | null;
  photo_url_1?: string | null;
  photo_url_2?: string | null;
  photo_1_file?: File | null;
  photo_1_preview?: string | null;
  photo_2_file?: File | null;
  photo_2_preview?: string | null;
}

export interface IncomeAssessment {
  id?: number;
  application_id?: number;
  average_monthly_income: number;
  other_verified_income: number;
  estimated_living_expenses: number;
  existing_debt_payments: number;
  proposed_installment: number;
  max_approved_amount: number;
  dsr_percentage?: number;
  total_verified_income?: number;
}

export interface ChecklistSummary {
  basic_verification: BasicVerification | null;
  call_verifications: CallRecord[];
  cib_check: CIBCheck | null;
  field_visits: FieldVisitRecord[];
  income_assessment: IncomeAssessment | null;
}
// ==========================================


// ==========================================
// 🟢 DTOs & FILTERS
// ==========================================
export interface CreateLoanApplicationDto {
  customer_id: number
  product_id: number
  loan_id?: string
  total_amount: number
  interest_rate_at_apply: number
  loan_period: number
  monthly_pay: number
  is_confirmed?: number
  status?: string
  credit_score?: number
  remarks?: string
}

export interface CreateWithCustomerDto {
  phone: string
  otp: string
  identity_number: string
  first_name: string
  last_name: string
  address: string
  occupation: string
  income_per_month: number
  product_id: number
  quantity?: number
  total_amount: number
  loan_period: number
  interest_rate_at_apply?: number
  monthly_pay?: number
  existing_customer_id?: number
}

export interface UpdateLoanApplicationDto {
  customer_id?: number
  product_id?: number
  total_amount?: number
  interest_rate_at_apply?: number
  loan_period?: number
  monthly_pay?: number
  is_confirmed?: number
  status?: string
  credit_score?: number
  remarks?: string
  approver_id?: number
}

export interface ChangeStatusDto {
  status: LoanApplicationStatus
  remarks?: string
}

export interface ConfirmDraftDto {
  phone: string,
  otp: string
  is_confirmed?: number
}

/**
 * Filters สำหรับดึงรายการ (รองรับ Pagination)
 */
export interface LoanApplicationFilters {
  CustomerId?: number
  requesterId?: number
  productId?: number
  status?: LoanApplicationStatus
  min?: number
  max?: number
  is_confirmed?: number
  page?: number  // ✅ เพิ่ม
  limit?: number // ✅ เพิ่ม
}


// ==========================================
// 🟢 RESPONSES
// ==========================================
export interface CreateWithCustomerResponse {
  success: boolean
  message: string
  data: any
}

/**
 * Pagination Meta Data
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Response จาก GET /loan-application (รองรับ Pagination)
 */
export interface GetAllLoanResponse {
  success: boolean
  message: string
  data: LoanApplication[]
  pagination?: PaginationMeta // ✅ เพิ่มเพื่อให้สอดคล้องกับ API ใหม่
}

export interface GetLoanByIdResponse {
  success: boolean
  message: string
  data: LoanApplication
}

// สร้าง Type ใหม่ที่บังคับว่าต้องมี customer แน่นอน
export type LoanCustomer = NonNullable<LoanApplication['customer']>


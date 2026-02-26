// src/types/loanApplication.ts

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
  CLOSED_EARLY = 'closed_early'
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

/**
 * Customer Location Model
 */
export interface CustomerLocation {
  id: number
  customer_id: number
  location_type: 'home' | 'work' | 'other'
  address: string
  map_url: string
  latitude?: number
  longitude?: number
  is_primary: number
}

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
  work_info: WorkInfo; // ຂໍ້ມູນວຽກປັດຈຸບັນ
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
}

/**
 * Loan Application Model (ตรงกับ Database Table)
 */
export interface LoanApplication {
  id: number
  customer_id: number
  product_id: number
  loan_id: string                    // ✅ เพิ่ม (มีใน DB)
  total_amount: number
  loan_period: number
  interest_rate_at_apply: number
  monthly_pay: number
  is_confirmed: number               // 0 or 1
  status: LoanApplicationStatus
  requester_id?: number
  approver_id?: number               // ✅ เพิ่ม
  applied_at?: string                // ✅ เพิ่ม
  approved_at?: string               // ✅ เพิ่ม
  credit_score?: number              // ✅ เพิ่ม
  remarks?: string                   // ✅ เพิ่ม
  created_at?: string
  updated_at?: string

  // Relations (ถ้า backend ส่งมา)
  customer?: CustomerLoan

  product?: {
    id: number
    partner_id: number
    productType_id: number
    product_name: string
    brand: string
    model: string
    price: number
    interest_rate: number
  }
  guarantor?: Guarantor;

  requester?: {
    id: number
    name: string
  }

  approver?: {
    id: number
    name: string
  }
  // ✅ Relations
  documents?: Document[]
}

/**
 * Form data สำหรับสร้าง Loan Application (POST /loan-application)
 */
export interface CreateLoanApplicationDto {
  customer_id: number
  product_id: number
  loan_id?: string                   // ✅ เพิ่ม (optional - backend อาจ generate)
  total_amount: number
  interest_rate_at_apply: number
  loan_period: number
  monthly_pay: number
  is_confirmed?: number
  status?: string
  credit_score?: number              // ✅ เพิ่ม
  remarks?: string                   // ✅ เพิ่ม
}

/**
 * Form data สำหรับสร้าง Loan พร้อมลูกค้าใหม่ (POST /create-with-customer)
 * ✅ ต้องตรงกับ Backend Controller
 */
export interface CreateWithCustomerDto {
  // Customer info
  phone: string
  otp: string
  identity_number: string
  first_name: string
  last_name: string
  address: string
  occupation: string
  income_per_month: number

  // Loan info
  product_id: number
  quantity?: number
  total_amount: number
  loan_period: number
  interest_rate_at_apply?: number    // ✅ เพิ่ม (backend รับค่านี้)
  monthly_pay?: number               // ✅ เพิ่ม (backend รับค่านี้)

  // Optional: สำหรับ staff
  existing_customer_id?: number
}

/**
 * Response จาก create-with-customer
 */
export interface CreateWithCustomerResponse {
  success: boolean
  message: string
  data: {
    customer_id: number
    application_id: number
    product_name: string
    is_staff_mode: boolean
  }
}

/**
 * Form data สำหรับอัปเดต Loan Application
 */
export interface UpdateLoanApplicationDto {
  customer_id?: number
  product_id?: number
  total_amount?: number
  interest_rate_at_apply?: number
  loan_period?: number
  monthly_pay?: number
  is_confirmed?: number
  status?: string
  credit_score?: number              // ✅ เพิ่ม
  remarks?: string                   // ✅ เพิ่ม
  approver_id?: number               // ✅ เพิ่ม
}

/**
 * Form data สำหรับเปลี่ยนสถานะ
 */
export interface ChangeStatusDto {
  status: LoanApplicationStatus
  remarks?: string                   // ✅ เพิ่ม (สำหรับบันทึกเหตุผล)
}

export interface ConfirmDraftDto {
  phone: string,
  otp: string
  is_confirmed?: number
}

/**
 * Filters สำหรับดึงรายการ (ใช้ body)
 */
export interface LoanApplicationFilters {
  CustomerId?: number
  requesterId?: number
  productId?: number
  status?: LoanApplicationStatus
  min?: number
  max?: number
}

/**
 * Response จาก GET /loan-application
 */
export interface GetAllLoanResponse {
  success: boolean
  message: string
  data: LoanApplication[]
}

/**
 * Response จาก GET /loan-application/:id
 */
export interface GetLoanByIdResponse {
  success: boolean
  message: string
  data: LoanApplication
}

// ສ້າງ Type ໃໝ່ທີ່ບັງຄັບວ່າຕ້ອງມີ customer ແນ່ນອນ
export type LoanCustomer = NonNullable<LoanApplication['customer']>



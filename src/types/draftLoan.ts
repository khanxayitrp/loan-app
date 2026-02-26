// src/types/draftLoan.ts

/**
 * ข้อมูลลูกค้าใน Draft
 */
export interface DraftCustomer {
  full_name: string
  phone: string
  id_card: string
  age: number
  address: string
  monthly_income: number
  other_debts?: number
}

/**
 * ข้อมูลสินเชื่อใน Draft
 */
export interface DraftLoanDetails {
  product_id: number
  product_name?: string
  product_type?: string
  total_amount: number
  down_payment: number
  loan_amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  total_payment: number
  total_interest: number
}

/**
 * Draft Loan (ร่างคำขอสินเชื่อ)
 */
export interface DraftLoan {
  id?: number

  // ข้อมูลลูกค้า
    phone: string
  otp: string
  customer_name: string
  identity_number: string
  first_name: string
  last_name: string
  address: string
  occupation: string
  income_per_month: number

  // ข้อมูลสินค้า/สินเชื่อ
  shop_id: number
  shop_name?: string
  product_id: number
  product_name: string
  product_type?: string

  // ข้อมูลการผ่อนชำระ
  total_amount: number
  down_payment: number
  loan_amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number

  // ข้อมูลพนักงาน
  staff_id?: number
  staff_name?: string

  // Timestamps
  created_at?: string
  updated_at?: string
}

/**
 * Form data สำหรับสร้าง Draft Loan
 */
export interface CreateDraftLoanDto {
  // Customer
  customer_name: string
  customer_phone: string
  customer_id_card: string
  customer_age: number
  customer_address: string
  monthly_income: number
  other_debts?: number

  // Shop & Product
  shop_id: number
  product_id: number

  // Loan Details
  total_amount: number
  down_payment: number
  interest_rate: number
  term_months: number
  monthly_payment: number
}

/**
 * Form data สำหรับอัปเดต Draft Loan
 */
export interface UpdateDraftLoanDto extends Partial<CreateDraftLoanDto> {
  id: number
}

/**
 * Filters สำหรับดึงรายการ Draft Loans
 */
export interface DraftLoanFilters {
  page?: number
  limit?: number
  search?: string
  staff_id?: number
  date_from?: string
  date_to?: string
}

/**
 * Response จาก API (pagination)
 */
export interface DraftLoanResponse {
  data: DraftLoan[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}

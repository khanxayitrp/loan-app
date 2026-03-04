export interface BasicVerification {
  id?: number;
  application_id: number;
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
  call_target: string;
  contact_name: string;
  contact_phone: string;
  relationship: string;
  is_info_matching: boolean;
  call_status: string;
  remark: string;
}

export interface CIBCheck {
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
  average_monthly_income: number;
  other_verified_income: number;
  estimated_living_expenses: number;
  existing_debt_payments: number;
  proposed_installment: number;
  max_approved_amount: number;
}

export interface ChecklistSummary {
  basic_verification: BasicVerification | null;
  call_verifications: CallRecord[];
  cib_check: CIBCheck | null;
  field_visits: FieldVisitRecord[];
  income_assessment: IncomeAssessment | null;
}

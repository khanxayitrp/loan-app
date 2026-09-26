// src/types/loanFormSections.ts

export interface SectionAddressData {
  village: string;
  district_id: string | number;
  district?: string;
  province_id: string | number;
  province?: string;
}

export interface CustomerFormData {
  fullname: string;
  dob?: string | null;
  age?: number | null;
  phone: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  idCard: string;
  idCardIssueDate?: string | null;
  idCardExpiryDate?: string | null;
  censusBook: string;
  censusBookIssueDate?: string | null;
  censusAuthorizeBy: string;
  houseNumber: string;
  unit: string;
  residenceYears?: number | null;
  liveWith: string;
  residenceStatus: string;
  address: SectionAddressData;
}

export interface WorkFormData {
  companyName: string;
  businessType: string;
  address: SectionAddressData;
  companyAddress?: SectionAddressData;
  workYears?: number | null;
  workMonths?: number | null;
  position: string;
  salary?: number | null;
  payday?: string | null;
  employeeCount?: number | null;
  otherIncome?: number | null;
  otherIncomeSource: string;
}

export interface GuarantorFormData {
  fullname: string;
  dob?: string | null;
  age?: number | null;
  phone: string;
  gender: string;
  maritalStatus: string;
  idCard: string;
  idCardIssueDate?: string | null;
  idCardExpiryDate?: string | null;
  censusBook: string;
  censusBookIssueDate?: string | null;
  censusAuthorizeBy: string;
  houseNumber: string;
  unit: string;
  residenceYears?: number | null;
  liveWith: string;
  residenceStatus: string;
  occupation: string;
  relationship: string;
  address: SectionAddressData;
}

export interface GuarantorWorkFormData {
  companyName: string;
  businessType: string;
  address: SectionAddressData;
  companyAddress?: SectionAddressData;
  workYears?: number | null;
  workMonths?: number | null;
  position: string;
  salary?: number | null;
  payday?: string | null;
  employeeCount?: number | null;
  otherIncome?: number | null;
  otherIncomeSource: string;
}

export interface ProductFormData {
  productType?: string | number | null;
  brand: string;
  model: string;
  price?: number | null;
  downPayment?: number | null;
  totalAmount?: number | null;
  interestRate?: number | null;
  period?: number | null;
  totalInterest?: number | null;
  fee?: number | null;
  monthlyPay?: number | null;
  firstInstallmentAmount?: number | null;
  paymentDay?: number | null;
  motorId?: string;
  motorColor?: string;
  tankNumber?: string;
  motorWarranty?: number | null;
  id?: number | null;
  variantId?: number | null;
}

export interface ShopFormData {
  id?: number | string | null;
  branch: string;
  partnerId?: number | string | null;
}

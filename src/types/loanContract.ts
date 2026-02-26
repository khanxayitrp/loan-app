
// src/types/loanContract.ts

/**
 * Represents the structure of the loan_contract table.
 * This interface is generated based on the SQL schema.
 */
export interface LoanContract {
  id?: number;
  loanId: number;
  cusFullName: string;
  cusSex: string;
  cusDateOfBirth?: string | null;
  cusPhone: string;
  cusMaritalStatus: string;
  cusIdPassNumber: string;
  cusIdPassDate?: string | null;
  cusCensusNumber?: string | null;
  cusCensusCreated?: string | null;
  cusCensusAuthorizeBy: string;
  cusHouseNumber: string;
  cusUnit: number;
  cusAddress: string;
  cusLivedYear: number;
  cusLivedWith: string;
  cusLivedSituation: string;
  cusCompanyName: string;
  cusCompanyBusinessType: string;
  cusCompanyLocation: string;
  cusCompanyWorkYear: number;
  cusPosition: string;
  cusIncome?: number | null;
  cusPayrollDate?: string | null;
  cusCompanyEmpNumber: number;
  cusIncomeOther?: number | null;
  cusIncomeOtherSource: string;
  productDetail: string;
  producttypeId?: number | null;
  productBrand: string;
  productModel: string;
  productPrice?: number | null;
  productDownPayment?: number | null;
  totalAmount?: number | null;
  interestRateAtApply: number;
  loanPeriod: number;
  totalInterest?: number;
  fee?: number;
  monthlyPay: number;
  firstInstallmentAmount?: number | null;
  paymentDay?: number;
  motorId: string;
  motorColor: string;
  tankNumber: string;
  motorWarranty?: number;
  partnerId?: number | null;
  shopBranch: string;
  shopId: string;
  refName: string;
  refDateOfBirth?: string | null;
  refPhone: string;
  refSex: string;
  refMaritalStatus: string;
  refIdPassNumber: string;
  refIdPassDate?: string | null;
  refCensusNumber?: string | null;
  refCensusCreated?: string | null;
  refCensusAuthorizeBy: string;
  refHouseNumber: string;
  refUnit: number;
  refAddress: string;
  refLivedYear: number;
  refLivedWith: string;
  refLivedSituation: string;
  refOccupation?: string | null;
  refRelationship?: string | null;
  refCompanyName?: string | null;
  refCompanyBusinessType: string;
  refCompanyLocation: string;
  refCompanyWorkYear: number;
  refPosition: string;
  refIncome?: number | null;
  refPayrollDate?: string | null;
  refCompanyEmpNumber: number;
  refIncomeOther?: number | null;
  refIncomeOtherSource: string;
  isConfirmed?: boolean | number;
  createdAt?: string;
  updatedAt?: string;
}

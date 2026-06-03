import apiClient from './apiclient'
import type { LoanContract, CreateLoanContractRequest } from '@/types/loanContract'

export const getLoanContract = async (loanId: number): Promise<LoanContract> => {
  try {
    const response = await apiClient.get(`/loan-contract/${loanId}`)
    console.log('this GetLoanContract ', response.data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 400) {
      return null as any
    }
    // ✅ จัดการกรณีอื่นๆ
    throw error
  }
}

/**
 * Fetch a list of loan contracts based on filters.
 */
export const getLoanContracts = async (filters: { status?: string } = {}): Promise<LoanContract[]> => {
  try {
    const response = await apiClient.get('/loan-contract', { params: filters });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching loan contracts:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch loan contracts');
  }
}

export const saveLoanContract = async (loanId: number, data: CreateLoanContractRequest): Promise<LoanContract> => {
  try {
    const response = await apiClient.post(`/loan-contract/${loanId}/created`, data)
    console.log('this SaveLoanContract ', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Error saving loan contract:', error)
    throw new Error(error.response?.data?.message || 'Failed to save loan contract')
  }
}

// เปลี่ยนจาก: data: CreateLoanContractRequest
// เป็น: data: Partial<CreateLoanContractRequest>

export const updateLoanContract = async (loanId: number, data: Partial<CreateLoanContractRequest>): Promise<LoanContract> => {
  try {
    const response = await apiClient.put(`/loan-contract/${loanId}/updated`, data)
    console.log('this UpdateLoanContract ', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Error updating loan contract:', error)
    throw new Error(error.response?.data?.message || 'Failed to update loan contract')
  }
}
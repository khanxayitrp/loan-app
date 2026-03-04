import apiClient from '@/api/apiclient'
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

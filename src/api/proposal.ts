import apiClient from '@/api/apiclient'
import type { WorkInfo, Guarantor } from '@/types/loanApplication'


export const getCustProposal = async (loan_id: number, customerId: number) => {
  try {
    const response = await apiClient.get(`/proposal/${customerId}/get/${loan_id}`)

    console.log('this GetCustProposal ', response.data)

    return response.data
  } catch (error: any) {
    if (error.response?.status === 400) {
      return null
    }
    // ✅ จัดการกรณีอื่นๆ
    throw error
  }
}

export const saveCustProposal = async (customerId: number, loan_id: number, data: {
                company_name: string
                address: string
                phone?: string
                business_type?: string
                business_details?: string
                duration_years?: number | null
                duration_months?: number | null
                department?: string
                position?: string
                salary: number | null
                name: string
                identity_number: string
                formatPhoneNumber?: string
                Guarantoraddress?: string
                occupation?: string
                relationship?: string
                work_company_name?: string
                work_position?: string
                work_salary: string
}) => {
  try {
  const response = await apiClient.post(
      `/proposal/${customerId}/new`,
      {
        loan_id: loan_id,
        data: data
      }
    );
    return response.data;
    } catch (error: any) {
    console.error('❌ Error creating proposal:', error);
    throw new Error(error.response?.data?.message || 'Failed to create proposal');
  }
}

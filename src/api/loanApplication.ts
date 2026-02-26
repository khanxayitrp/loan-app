// src/api/loanApplication.ts

import apiClient from '@/api/apiClient'
import type {
  LoanApplication,
  CreateLoanApplicationDto,
  CreateWithCustomerDto,
  CreateWithCustomerResponse,
  UpdateLoanApplicationDto,
  ChangeStatusDto,
  ConfirmDraftDto,
  LoanApplicationFilters,
  GetAllLoanResponse,
  GetLoanByIdResponse
} from '@/types/loanApplication'

/**
 * ดึงรายการ Loan Applications (ใช้ POST แทน GET เพราะ backend ใช้ body)
 */
export const fetchLoanApplications = async (
  filters: LoanApplicationFilters = {}
): Promise<LoanApplication[]> => {
  try {
    console.log('[LoanApplication API] Fetching with filters:', filters)

    // ✅ Backend ใช้ GET แต่รับ filters ผ่าน body (แปลก แต่ต้องทำตาม)
    const response = await apiClient.get<GetAllLoanResponse>('/loan-application', { params: filters})

    console.log('[LoanApplication API] Fetch response:', response.data)

    if (response.data.success && response.data.data) {
      // แปลง Object → Array ถ้าจำเป็น
      let loans = response.data.data
      if (loans && typeof loans === 'object' && !Array.isArray(loans)) {
        loans = Object.values(loans) as LoanApplication[]
      }
      return Array.isArray(loans) ? loans : []
    }

    return []

  } catch (error: any) {
    console.error('[LoanApplication API] Fetch failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch loan applications')
  }
}

/**
 * ดึง Loan Application ตาม ID
 */
export const fetchLoanApplicationById = async (id: number): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Fetching by ID:', id)

    const response = await apiClient.get<GetLoanByIdResponse>(`/loan-application/${id}`)

    console.log('[LoanApplication API] Fetch by ID response:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Loan application not found')

  } catch (error: any) {
    console.error('[LoanApplication API] Fetch by ID failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch loan application')
  }
}

/**
 * ดึง Loan Application ตาม Loan ID
 */
export const fetchLoanApplicationByLoanId = async (loanId: string): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Fetching by Loan ID:', loanId)

    const response = await apiClient.post<GetLoanByIdResponse>('/loan-application/loanID', {
      LoanId: loanId
    })

    console.log('[LoanApplication API] Fetch by Loan ID response:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Loan application not found')

  } catch (error: any) {
    console.error('[LoanApplication API] Fetch by Loan ID failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch loan application')
  }
}

/**
 * สร้าง Loan Application
 */
export const createLoanApplication = async (
  data: CreateLoanApplicationDto
): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Creating:', data)

    const response = await apiClient.post('/loan-application', data)

    console.log('[LoanApplication API] Created:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Failed to create loan application')

  } catch (error: any) {
    console.error('[LoanApplication API] Create failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to create loan application')
  }
}

/**
 * สร้าง Loan Application พร้อมลูกค้าใหม่ (มี OTP)
 */
export const createLoanApplicationWithCustomer = async (
  data: CreateWithCustomerDto
): Promise<CreateWithCustomerResponse> => {
  try {
    console.log('[LoanApplication API] Creating with customer:', {
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      product_id: data.product_id,
      total_amount: data.total_amount,
      otp: '******' // ซ่อน OTP ใน log
    })

    const response = await apiClient.post<CreateWithCustomerResponse>(
      '/loan-application/create-with-customer',
      data
    )

    console.log('[LoanApplication API] Created with customer:', response.data)

    return response.data

  } catch (error: any) {
    console.error('[LoanApplication API] Create with customer failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to create loan application with customer')
  }
}

/**
 * อัปเดต Loan Application
 */
export const updateLoanApplication = async (
  id: number,
  data: UpdateLoanApplicationDto
): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Updating:', id, data)

    const response = await apiClient.put(`/loan-application/${id}`, data)

    console.log('[LoanApplication API] Updated:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Failed to update loan application')

  } catch (error: any) {
    console.error('[LoanApplication API] Update failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to update loan application')
  }
}


/**
 * อัปเดต Draft Loan Application
 */
export const updateDraftLoanApplication = async (
  id: number,
  data: UpdateLoanApplicationDto
): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Draft Updating:', id, data)

    const response = await apiClient.put(`/loan-application/draft/${id}`, data)

    console.log('[LoanApplication API] Draft Updated:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Failed to update loan application')

  } catch (error: any) {
    console.error('[LoanApplication API] Draft Update failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to update Draft loan application')
  }
}

/**
 * เปลี่ยนสถานะ Loan Application
 */
export const changeApplicationStatus = async (
  id: number,
  data: ChangeStatusDto
): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] Changing status:', id, data)

    const response = await apiClient.patch(`/loan-application/${id}/status`, data)

    console.log('[LoanApplication API] Status changed:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Failed to change status')

  } catch (error: any) {
    console.error('[LoanApplication API] Change status failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to change application status')
  }
}

/**
 * เปลี่ยนสถานะ Loan Application
 */
export const sentDraftApply = async (
  id: number,
  data: ConfirmDraftDto
): Promise<LoanApplication> => {
  try {
    console.log('[LoanApplication API] sending To Apply :', id, data)

    const response = await apiClient.patch(`/loan-application/${id}/apply`, data)

    console.log('[LoanApplication API] Applied changed:', response.data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error('Failed to Apply Draft')

  } catch (error: any) {
    console.error('[LoanApplication API] Apply Draft failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to Apply Draft Loan Application')
  }
}

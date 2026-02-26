// src/stores/loanApplication.ts

import { defineStore } from 'pinia';
import {
  fetchLoanApplications,
  fetchLoanApplicationById,
  fetchLoanApplicationByLoanId,
  createLoanApplication,
  createLoanApplicationWithCustomer,
  updateLoanApplication,
  changeApplicationStatus,
  sentDraftApply,
  updateDraftLoanApplication
} from '@/api/loanApplication';
import { searchCustomerByFullname, searchCustomerByPhone } from '@/api/customer';
import {
  uploadApplicationDocument,
  uploadMultipleApplicationDocuments,
  getApplicationDocuments,
  deleteDocument,
  replaceDocument
} from '@/api/upload';
import type {
  LoanApplication,
  CreateLoanApplicationDto,
  CreateWithCustomerDto,
  UpdateLoanApplicationDto,
  ChangeStatusDto,
  ConfirmDraftDto,
  LoanApplicationStatus,
  LoanApplicationFilters,
  LoanCustomer
} from '@/types/loanApplication';

export const useLoanApplicationStore = defineStore('loanApplication', {
  state: () => ({
    // รายการ Loan Applications
    loanApplications: [] as LoanApplication[],

    // Loan Application ปัจจุบัน
    currentLoanApplication: null as LoanApplication | null,

    // Loading states
    isLoading: false,
    isSaving: false,

    // Filters (สำหรับใช้กับ backend)
    filters: {
      CustomerId: undefined as number | undefined,
      requesterId: undefined as number | undefined,
      productId: undefined as number | undefined,
      status: undefined as LoanApplicationStatus | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined
    } as LoanApplicationFilters,
        // ✅ เพิ่มสถานะสำหรับเอกสาร
    currentDocuments: [] as any[], // เอกสารของ Loan Application ปัจจุบัน
    isUploadingDocuments: false,
    documentError: null as string | null,
    customer: null as LoanCustomer | null,

    // Error
    error: null as string | null
  }),

  getters: {
    /**
     * รายการที่แสดงผล
     */
    displayedLoanApplications: (state) => state.loanApplications,

    /**
     * จำนวนทั้งหมด
     */
    totalApplications: (state) => state.loanApplications.length,

    /**
     * มีข้อมูลหรือไม่
     */
    hasData: (state) => state.loanApplications.length > 0,

    /**
     * Loan Applications แยกตามสถานะ
     */
    pendingApplications: (state) =>
      state.loanApplications.filter(app => app.status === 'pending'),

    verifyingApplications: (state) =>
      state.loanApplications.filter(app => app.status === 'verifying'),

    approvedApplications: (state) =>
      state.loanApplications.filter(app => app.status === 'approved'),

    rejectedApplications: (state) =>
      state.loanApplications.filter(app => app.status === 'rejected'),

    completedApplications: (state) =>
      state.loanApplications.filter(app => app.status === 'completed')
  },

  actions: {
    /**
     * ดึงรายการ Loan Applications
     */
    async fetchLoanApplications(filters: LoanApplicationFilters = {}) {
      this.isLoading = true
      this.error = null

      try {
        // ✅ ใช้ filters ที่ส่งเข้ามา หรือใช้จาก state
        const params = {
          ...this.filters,
          ...filters
        }

        console.log('[LoanApplicationStore] Fetching with params:', params)

        const applications = await fetchLoanApplications(params)

        console.log('[LoanApplicationStore] Fetched:', applications.length)

        this.loanApplications = applications

      } catch (error: any) {
        console.error('[LoanApplicationStore] Fetch failed:', error)
        this.error = error.message || 'Failed to fetch loan applications'
        this.loanApplications = []
        throw error

      } finally {
        this.isLoading = false
      }
    },

    /**
     * ดึง Loan Application ตาม ID
     */
    async fetchLoanApplicationById(id: number) {
      this.isLoading = true
      this.error = null

      try {
        const loanApplication = await fetchLoanApplicationById(id)

        console.log('[LoanApplicationStore] Fetched by ID:', loanApplication)

        this.currentLoanApplication = loanApplication
        return loanApplication

      } catch (error: any) {
        console.error('[LoanApplicationStore] Fetch by ID failed:', error)
        this.error = error.message || 'Failed to fetch loan application'
        this.currentLoanApplication = null
        throw error

      } finally {
        this.isLoading = false
      }
    },

    /**
     * ดึง Loan Application ตาม Loan ID
     */
    async fetchLoanApplicationByLoanId(loanId: string) {
      this.isLoading = true
      this.error = null

      try {
        const loanApplication = await fetchLoanApplicationByLoanId(loanId)

        console.log('[LoanApplicationStore] Fetched by Loan ID:', loanApplication)

        this.currentLoanApplication = loanApplication
        return loanApplication

      } catch (error: any) {
        console.error('[LoanApplicationStore] Fetch by Loan ID failed:', error)
        this.error = error.message || 'Failed to fetch loan application'
        this.currentLoanApplication = null
        throw error

      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้าง Loan Application
     */
    async createLoanApplication(data: CreateLoanApplicationDto) {
      this.isSaving = true
      this.error = null

      try {
        const newApplication = await createLoanApplication(data)

        console.log('[LoanApplicationStore] Created:', newApplication)

        // เพิ่มเข้าไปใน list
        this.loanApplications.unshift(newApplication)

        return newApplication

      } catch (error: any) {
        console.error('[LoanApplicationStore] Create failed:', error)
        this.error = error.message || 'Failed to create loan application'
        throw error

      } finally {
        this.isSaving = false
      }
    },

    /**
     * สร้าง Loan Application พร้อมลูกค้าใหม่ (มี OTP)
     */
    async createWithCustomer(data: CreateWithCustomerDto) {
      this.isSaving = true
      this.error = null

      try {
        const result = await createLoanApplicationWithCustomer(data)

        console.log('[LoanApplicationStore] Created with customer:', result)

        // ✅ ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!result.data || !result.data.application_id) {
      console.error('❌ Invalid response structure:', result)
      throw new Error('ไม่พบข้อมูล application ในการตอบกลับจาก server')
    }

    // ✅ Map ข้อมูลจาก response ให้ตรงกับ LoanApplication Type
    const mappedApplication: LoanApplication = {
      id: result.data.application_id,                    // ✅ map application_id → id
      customer_id: result.data.customer_id,
      product_id: result.data.product_id,
      loan_id: result.data.loan_id,
      total_amount: result.data.total_amount,
      loan_period: result.data.loan_period,
      interest_rate_at_apply: result.data.interest_rate_at_apply,
      monthly_pay: result.data.monthly_pay,
      is_confirmed: result.data.is_confirmed,
      status: result.data.status as LoanApplicationStatus,
      requester_id: result.data.requester_id || undefined,
      approver_id: result.data.approver_id || undefined,
      applied_at: result.data.applied_at || undefined,
      approved_at: result.data.approved_at || undefined,
      credit_score: result.data.credit_score || undefined,
      remarks: result.data.remarks || undefined,
      created_at: result.data.created_at || undefined,
      updated_at: result.data.updated_at || undefined,

      // ✅ Relations
      customer: result.data.customer ? {
        id: result.data.customer.id,
        phone: result.data.customer.phone,
        identity_number: result.data.customer.identity_number,
        first_name: result.data.customer.first_name,
        last_name: result.data.customer.last_name,
        address: result.data.customer.address,
        occupation: result.data.customer.occupation,
        income_per_month: result.data.customer.income_per_month
      } : undefined,

      product: result.data.product ? {
        id: result.data.product.id,
        product_name: result.data.product.product_name,
        price: result.data.product.price,
        interest_rate: result.data.product.interest_rate
      } : undefined,

      requester: result.data.requester?.id ? {
        id: result.data.requester.id,
        name: result.data.requester.name || ''
      } : undefined,

      approver: result.data.approver?.id ? {
        id: result.data.approver.id,
        name: result.data.approver.name || ''
      } : undefined
    }

    console.log('✅ [LoanApplicationStore] Mapped application:', mappedApplication)

    // ✅ ตั้งค่า currentLoanApplication
    this.currentLoanApplication = mappedApplication

    // ✅ เพิ่มเข้า list
    this.loanApplications.unshift(mappedApplication)

    console.log('✅ [LoanApplicationStore] Current loan application set:', {
      id: this.currentLoanApplication.id,
      loan_id: this.currentLoanApplication.loan_id,
      customer_id: this.currentLoanApplication.customer_id
    })

    return {
      ...result,
      application: mappedApplication // ✅ ส่ง mapped application กลับไปด้วย
    }

      } catch (error: any) {
        console.error('[LoanApplicationStore] Create with customer failed:', error)
        this.error = error.message || 'Failed to create loan application with customer'
        throw error

      } finally {
        this.isSaving = false
      }
    },

    /**
     * อัปเดต Loan Application
     */
    async updateLoanApplication(id: number, data: UpdateLoanApplicationDto) {
      this.isSaving = true
      this.error = null

      try {
        const updated = await updateLoanApplication(id, data)

        console.log('[LoanApplicationStore] Updated:', updated)

        // อัปเดตใน list
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }

        // อัปเดต current ถ้าเป็นตัวเดียวกัน
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }

        return updated

      } catch (error: any) {
        console.error('[LoanApplicationStore] Update failed:', error)
        this.error = error.message || 'Failed to update loan application'
        throw error

      } finally {
        this.isSaving = false
      }
    },

    /**
     * อัปเดต Draft Loan Application
     */
    async updateDraftLoanApplication(id: number, data: UpdateLoanApplicationDto) {
      this.isSaving = true
      this.error = null

      try {
        const updated = await updateDraftLoanApplication(id, data)

        console.log('[LoanApplicationStore] Draft Updated:', updated)

        // อัปเดตใน list
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }

        // อัปเดต current ถ้าเป็นตัวเดียวกัน
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }

        return updated

      } catch (error: any) {
        console.error('[LoanApplicationStore] Draft Update failed:', error)
        this.error = error.message || 'Failed to update Draft loan application'
        throw error

      } finally {
        this.isSaving = false
      }
    },

    /**
     * เปลี่ยนสถานะ Loan Application
     */
    async changeStatus(id: number, data: ChangeStatusDto) {
      this.isSaving = true
      this.error = null

      try {
        const updated = await changeApplicationStatus(id, data)

        console.log('[LoanApplicationStore] Status changed:', updated)

        // อัปเดตใน list
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }

        // อัปเดต current ถ้าเป็นตัวเดียวกัน
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }

        return updated

      } catch (error: any) {
        console.error('[LoanApplicationStore] Change status failed:', error)
        this.error = error.message || 'Failed to change status'
        throw error

      } finally {
        this.isSaving = false
      }
    },
    /**
     * เปลี่ยนสถานะ Loan Application
     */
    async ApplyDraft(id: number, data: ConfirmDraftDto) {
      this.isSaving = true
      this.error = null

      try {
        const updated = await sentDraftApply(id, data)

        console.log('[LoanApplicationStore] Apply Draft:', updated)

        // อัปเดตใน list
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }

        // อัปเดต current ถ้าเป็นตัวเดียวกัน
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }

        return updated

      } catch (error: any) {
        console.error('[LoanApplicationStore] Apply failed:', error)
        this.error = error.message || 'Failed to Apply Draft'
        throw error

      } finally {
        this.isSaving = false
      }
    },

    /**
     * กรองตามสถานะ
     */
    async filterByStatus(status: LoanApplicationStatus | undefined) {
      this.filters.status = status
      await this.fetchLoanApplications()
    },

    /**
     * กรองตาม Customer ID
     */
    async filterByCustomer(customerId: number | undefined) {
      this.filters.CustomerId = customerId
      await this.fetchLoanApplications()
    },

    /**
     * กรองตาม Product ID
     */
    async filterByProduct(productId: number | undefined) {
      this.filters.productId = productId
      await this.fetchLoanApplications()
    },

    /**
     * กรองตาม Amount Range
     */
    async filterByAmountRange(min: number | undefined, max: number | undefined) {
      this.filters.min = min
      this.filters.max = max
      await this.fetchLoanApplications()
    },

    /**
     * ล้าง Filters
     */
    async resetFilters() {
      this.filters = {
        CustomerId: undefined,
        requesterId: undefined,
        productId: undefined,
        status: undefined,
        min: undefined,
        max: undefined
      }
      await this.fetchLoanApplications()
    },

     /**
     * อัปโหลดเอกสารเดี่ยวสำหรับ Loan Application
     */
    async uploadDocument(applicationId: number, file: File, docType: string) {
      this.isUploadingDocuments = true
      this.documentError = null

      try {
        const result = await uploadApplicationDocument(applicationId, file, docType)

        // อัปเดตเอกสารใน currentDocuments
        if (this.currentLoanApplication?.id === applicationId) {
          this.currentDocuments.push(result.document)
        }

        console.log('[Store] Document uploaded:', result)
        return result
      } catch (error: any) {
        console.error('[Store] Upload document failed:', error)
        this.documentError = error.message
        throw error
      } finally {
        this.isUploadingDocuments = false
      }
    },

    /**
     * อัปโหลดเอกสารหลายไฟล์พร้อมกัน
     */
    async uploadMultipleDocuments(
      applicationId: number,
      files: File[],
      docTypes: string[]
    ) {
      this.isUploadingDocuments = true
      this.documentError = null

      try {
        const result = await uploadMultipleApplicationDocuments(
          applicationId,
          files,
          docTypes
        )

        // อัปเดตเอกสารใน currentDocuments
        if (this.currentLoanApplication?.id === applicationId) {
          this.currentDocuments = [
            ...this.currentDocuments,
            ...result.documents.map((d: any) => d.document)
          ]
        }

        console.log('[Store] Multiple documents uploaded:', result)
        return result
      } catch (error: any) {
        console.error('[Store] Upload multiple documents failed:', error)
        this.documentError = error.message
        throw error
      } finally {
        this.isUploadingDocuments = false
      }
    },

    /**
     * ดึงรายการเอกสารทั้งหมดของ Loan Application
     */
    async fetchDocuments(applicationId: number) {
      this.isLoading = true
      this.documentError = null

      try {
        const documents = await getApplicationDocuments(applicationId)

        // ตั้งค่าเอกสารปัจจุบัน
        this.currentDocuments = documents.data || documents

        // อัปเดต currentLoanApplication ด้วยข้อมูลเอกสาร
        if (this.currentLoanApplication?.id === applicationId) {
          this.currentLoanApplication = {
            ...this.currentLoanApplication,
            documents: this.currentDocuments
          }
        }

        console.log('[Store] Documents fetched:', this.currentDocuments.length)
        return this.currentDocuments
      } catch (error: any) {
        console.error('[Store] Fetch documents failed:', error)
        this.documentError = error.message
        this.currentDocuments = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ลบเอกสาร
     */
    async removeDocument(documentId: number) {
      this.isSaving = true
      this.documentError = null

      try {
        await deleteDocument(documentId)

        // ลบเอกสารออกจาก currentDocuments
        this.currentDocuments = this.currentDocuments.filter(
          doc => doc.id !== documentId
        )

        // อัปเดต currentLoanApplication
        if (this.currentLoanApplication) {
          this.currentLoanApplication = {
            ...this.currentLoanApplication,
            documents: this.currentDocuments
          }
        }

        console.log('[Store] Document deleted:', documentId)
      } catch (error: any) {
        console.error('[Store] Delete document failed:', error)
        this.documentError = error.message
        throw error
      } finally {
        this.isSaving = false
      }
    },

    /**
     * แทนที่เอกสาร
     */
    async replaceDocument(documentId: number, file: File) {
      this.isUploadingDocuments = true
      this.documentError = null

      try {
        const result = await replaceDocument(documentId, file)

        // อัปเดตเอกสารใน currentDocuments
        const index = this.currentDocuments.findIndex(doc => doc.id === documentId)
        if (index !== -1) {
          this.currentDocuments[index] = result.document
        }

        console.log('[Store] Document replaced:', documentId)
        return result
      } catch (error: any) {
        console.error('[Store] Replace document failed:', error)
        this.documentError = error.message
        throw error
      } finally {
        this.isUploadingDocuments = false
      }
    },
    /**
     * ดึง Loan Application ตาม ID
     */
    async fetchCustomerByPhone(phone: string) {
      this.isLoading = true
      this.error = null

      try {
        const customer = await searchCustomerByPhone(phone)

        console.log('[LoanApplicationStore] Fetched customer by Phone:', customer)

        this.customer = customer
        return customer

      } catch (error: any) {
        console.error('[LoanApplicationStore] Fetch by ID failed:', error)
        this.error = error.message || 'Failed to fetch loan application'
        this.currentLoanApplication = null
        throw error

      } finally {
        this.isLoading = false
      }
    },

    /**
     * Refresh ข้อมูล
     */
    async refresh() {
      await this.fetchLoanApplications()
    }
  }
})

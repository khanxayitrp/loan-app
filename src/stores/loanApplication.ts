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
  updateDraftLoanApplication,
  createRepaymentSchedule,
  fetchRepaymentSchedule,
  fetchApprovalLogs as fetchApprovalLogsApi
} from '@/api/loanApplication';
import { searchCustomerByPhone } from '@/api/customer';
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
    loanApplications: [] as LoanApplication[],

    // 🟢 Cursor Pagination State
    nextCursor: null as number | null,
    totalRecords: 0,
    hasMoreData: true, // เอาไว้บอก UI ว่าปุ่ม Load More ควรกดได้ไหม

    currentLoanApplication: null as LoanApplication | null,
    isLoading: false,
    isSaving: false,
    isLoadingMore: false, // เอาไว้แสดง Spinner ตรงปุ่ม Load More

    filters: {
      CustomerId: undefined as number | undefined,
      requesterId: undefined as number | undefined,
      productId: undefined as number | undefined,
      status: undefined as LoanApplicationStatus | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      minScore: undefined as number | undefined,
      maxScore: undefined as number | undefined,
      limit: 10,
      cursor: undefined as number | undefined, // 👈 เพิ่ม cursor
      page: 1 as number | undefined
    } as LoanApplicationFilters,

    currentDocuments: [] as any[],
    isUploadingDocuments: false,
    documentError: null as string | null,
    customer: null as LoanCustomer | null,
    error: null as string | null
  }),

  getters: {
    displayedLoanApplications: (state) => state.loanApplications,
    totalApplications: (state) => state.loanApplications.length,
    hasData: (state) => state.loanApplications.length > 0,
    canLoadMore: (state) => state.hasMoreData && state.nextCursor !== null, // 👈 Getter เช็คว่าโหลดเพิ่มได้ไหม

    pendingApplications: (state) => state.loanApplications.filter(app => app.status === 'pending'),
    verifyingApplications: (state) => state.loanApplications.filter(app => app.status === 'verifying'),
    approvedApplications: (state) => state.loanApplications.filter(app => app.status === 'approved'),
    rejectedApplications: (state) => state.loanApplications.filter(app => app.status === 'rejected'),
    completedApplications: (state) => state.loanApplications.filter(app => app.status === 'completed')
  },

  actions: {
    /**
     * 🟢 ดึงข้อมูลครั้งแรก (หรือหลังจากเปลี่ยน Filter)
     * ข้อมูลที่ได้จะเขียนทับ (Replace) ของเดิม
     */
    async fetchLoanApplications(customFilters: Partial<LoanApplicationFilters> = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        // 🟢 ຖ້າມີການຄົ້ນຫາໃໝ່ ໃຫ້ Reset ກັບໄປໜ້າ 1
        if (!customFilters.page && !customFilters.cursor) {
          this.filters.page = 1;
          this.filters.cursor = undefined;
        }

        const params = {
          ...this.filters,
          ...customFilters
        };
        this.filters = params;

        const result = await fetchLoanApplications(params);

        this.loanApplications = result.loans;

        // ຮັບຄ່າໜ້າຖັດໄປ (ຫຼື Cursor ຖັດໄປ)
        this.nextCursor = result.nextCursor ?? null;
        this.totalRecords = result.pagination?.total || 0;

        // ເປີດປຸ່ມ Load More ຖ້າຍັງມີໜ້າຖັດໄປ
        this.hasMoreData = this.nextCursor !== null;

      } catch (error: any) {
        this.error = error.message || 'Failed to fetch loan applications';
        this.loanApplications = [];
        this.hasMoreData = false;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 🟢 โหลดข้อมูลหน้าถัดไป (Load More)
     * ข้อมูลที่ได้จะนำไปต่อท้าย (Append) Array เดิม
     */
    async loadMoreLoanApplications() {
      if (!this.canLoadMore || this.isLoadingMore) return;

      this.isLoadingMore = true;
      try {
        const params: LoanApplicationFilters = {
          ...this.filters,
          page: this.nextCursor ?? undefined,   // 🟢 ປ່ຽນ null ໃຫ້ເປັນ undefined
          cursor: this.nextCursor ?? undefined  // 🟢 ປ່ຽນ null ໃຫ້ເປັນ undefined
        };

        const result = await fetchLoanApplications(params);

        if (result.loans.length > 0) {
          this.loanApplications = [...this.loanApplications, ...result.loans];
        }

        this.nextCursor = result.nextCursor ?? null;
        this.hasMoreData = this.nextCursor !== null;

      } catch (error: any) {
        this.error = error.message || 'Failed to load more loan applications';
        throw error;
      } finally {
        this.isLoadingMore = false;
      }
    },

    /**
     * เปลี่ยนจำนวนรายการต่อหน้า (Limit)
     */
    async changeLimit(limit: number) {
      await this.fetchLoanApplications({ limit, cursor: undefined }); // รีเซ็ต cursor กลับเป็น undefined
    },

    /**
     * ดึง Loan Application ตาม ID
     */
    async fetchLoanApplicationById(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const loanApplication = await fetchLoanApplicationById(id)
        this.currentLoanApplication = loanApplication
        return loanApplication
      } catch (error: any) {
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
        this.currentLoanApplication = loanApplication
        return loanApplication
      } catch (error: any) {
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
        this.loanApplications.unshift(newApplication)
        return newApplication
      } catch (error: any) {
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
        if (!result.data || !result.data.application_id) {
          throw new Error('ไม่พบข้อมูล application ในการตอบกลับจาก server')
        }

        const mappedApplication: LoanApplication = {
          id: result.data.application_id,
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
          customer: result.data.customer,
          product: result.data.product,
          requester: result.data.requester,
          approver: result.data.approver
        }

        this.currentLoanApplication = mappedApplication
        this.loanApplications.unshift(mappedApplication)

        return {
          ...result,
          application: mappedApplication
        }
      } catch (error: any) {
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
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }
        return updated
      } catch (error: any) {
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
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }
        return updated
      } catch (error: any) {
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
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }
        return updated
      } catch (error: any) {
        this.error = error.message || 'Failed to change status'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async ApplyDraft(id: number, data: ConfirmDraftDto) {
      this.isSaving = true
      this.error = null
      try {
        const updated = await sentDraftApply(id, data)
        const index = this.loanApplications.findIndex(app => app.id === id)
        if (index !== -1) {
          this.loanApplications[index] = updated
        }
        if (this.currentLoanApplication?.id === id) {
          this.currentLoanApplication = updated
        }
        return updated
      } catch (error: any) {
        this.error = error.message || 'Failed to Apply Draft'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    /**
     * 🟢 บันทึกตารางการผ่อนชำระ (Repayment Schedule)
     */
    async saveRepaymentSchedule(applicationId: number, scheduleData: any[]) {
      this.isSaving = true;
      this.error = null;
      try {
        const result = await createRepaymentSchedule(applicationId, scheduleData);
        return result;
      } catch (error: any) {
        this.error = error.message || 'Failed to save repayment schedule';
        throw error;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * 🟢 ดึงตารางการผ่อนชำระ (Repayment Schedule)
     */
    async fetchRepaymentSchedule(applicationId: number) {
      this.isSaving = true;
      this.error = null;
      try {
        const result = await fetchRepaymentSchedule(applicationId as number);
        return result;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch repayment schedule';
        throw error;
      } finally {
        this.isSaving = false;
      }
    },

    // ===============================================
    // 🟢 Filter Methods (แก้ไขลบ page ออก ใช้ cursor แทน)
    // ===============================================
    async filterByStatus(status: LoanApplicationStatus | undefined) {
      await this.fetchLoanApplications({ status, cursor: undefined })
    },

    async filterByCustomer(customerId: number | undefined) {
      await this.fetchLoanApplications({ CustomerId: customerId, cursor: undefined })
    },

    async filterByProduct(productId: number | undefined) {
      await this.fetchLoanApplications({ productId, cursor: undefined })
    },

    async filterByAmountRange(min: number | undefined, max: number | undefined) {
      await this.fetchLoanApplications({ min, max, cursor: undefined })
    },

    async resetFilters() {
      this.filters = {
        CustomerId: undefined,
        requesterId: undefined,
        productId: undefined,
        status: undefined,
        min: undefined,
        max: undefined,
        minScore: undefined,
        maxScore: undefined,
        limit: 10,
        cursor: undefined
      }
    },

    // ===============================================
    // Document Upload Methods
    // ===============================================
    async uploadDocument(customerId: number, file: File, docType: string) {
      this.isUploadingDocuments = true
      this.documentError = null
      try {
        const result = await uploadApplicationDocument(customerId, file, docType)
        if (this.currentLoanApplication?.customer_id === customerId) {
          this.currentDocuments.push(result.document)
        }
        return result
      } catch (error: any) {
        this.documentError = error.message
        throw error
      } finally {
        this.isUploadingDocuments = false
      }
    },

    async uploadMultipleDocuments(
      customerId: number,
      applicationId: number,
      files: File[],
      docTypes: string[]
    ) {
      this.isUploadingDocuments = true;
      this.documentError = null;
      try {
        const result = await uploadMultipleApplicationDocuments(
          customerId,
          files,
          docTypes
        );
        if (this.currentLoanApplication?.id === applicationId) {
          await this.fetchDocuments(customerId);
        }
        return result;
      } catch (error: any) {
        this.documentError = error.message;
        throw error;
      } finally {
        this.isUploadingDocuments = false;
      }
    },

    async fetchDocuments(customerId: number) {
      this.isLoading = true
      this.documentError = null
      try {
        const documents = await getApplicationDocuments(customerId)
        this.currentDocuments = documents.data || documents
        if (this.currentLoanApplication && this.currentLoanApplication.customer_id === customerId) {
          this.currentLoanApplication = {
            ...this.currentLoanApplication,
            documents: this.currentDocuments
          }
        }
        return this.currentDocuments
      } catch (error: any) {
        this.documentError = error.message
        this.currentDocuments = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async removeDocument(documentId: number) {
      this.isSaving = true
      this.documentError = null
      try {
        await deleteDocument(documentId)
        this.currentDocuments = this.currentDocuments.filter(
          doc => doc.id !== documentId
        )
        if (this.currentLoanApplication) {
          this.currentLoanApplication = {
            ...this.currentLoanApplication,
            documents: this.currentDocuments
          }
        }
      } catch (error: any) {
        this.documentError = error.message
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async replaceDocument(documentId: number, file: File) {
      this.isUploadingDocuments = true
      this.documentError = null
      try {
        const result = await replaceDocument(documentId, file)
        const index = this.currentDocuments.findIndex(doc => doc.id === documentId)
        if (index !== -1) {
          this.currentDocuments[index] = result.document
        }
        return result
      } catch (error: any) {
        this.documentError = error.message
        throw error
      } finally {
        this.isUploadingDocuments = false
      }
    },

    async fetchCustomerByPhone(phone: string) {
      this.isLoading = true
      this.error = null
      try {
        const customer = await searchCustomerByPhone(phone)
        this.customer = customer
        return customer
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch loan application'
        this.currentLoanApplication = null
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async refresh() {
      // เรียกใช้โดยรีเซ็ต cursor ไว้โหลดใหม่
      await this.fetchLoanApplications({ cursor: undefined })
    },

    async fetchApprovalLogs(loanId: number) {
      this.isLoading = true
      this.error = null
      try {
        const logs = await fetchApprovalLogsApi(loanId)
        return logs
      } catch (error: any) {
        this.error = error.message || 'ບໍ່ສາມາດດຶງປະຫວັດການອະນຸມັດໄດ້'
        return []
      } finally {
        this.isLoading = false
      }
    }
  }
})

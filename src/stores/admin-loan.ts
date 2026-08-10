import { defineStore } from 'pinia';
import { adminLoanApi } from '@/api/admin-loan';
import type { AdminLoanSnapshot } from '@/types/admin-loan';

interface AdminLoanState {
  loanSnapshot: AdminLoanSnapshot | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export const useAdminLoanStore = defineStore('adminLoan', {
  state: (): AdminLoanState => ({
    loanSnapshot: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
  }),

  actions: {
    async fetchLoanDetails(loanIdStr: string) {
      this.isLoading = true;
      this.error = null;
      this.loanSnapshot = null;
      try {
        const response = await adminLoanApi.getLoanDetails(loanIdStr);
        this.loanSnapshot = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນສິນເຊື່ອໄດ້';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 🌟 FIX: Change payload type to FormData
    async executeLoanOverride(loanId: number, formData: FormData) {
      this.isSubmitting = true;
      this.error = null;
      try {
        await adminLoanApi.executeOverride(loanId, formData);

        if (this.loanSnapshot && this.loanSnapshot.loan_id) {
          await this.fetchLoanDetails(this.loanSnapshot.loan_id);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'ການຂຽນທັບລະບົບລົ້ມເຫຼວ';
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    clearState() {
      this.loanSnapshot = null;
      this.error = null;
    }
  }
});

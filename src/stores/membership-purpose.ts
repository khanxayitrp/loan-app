import { defineStore } from 'pinia';
import { membershipPurposeApi } from '@/api/membership-purpose';
import type { CreditPurpose } from '@/types/membership-purpose';

export const useMembershipCreditStore = defineStore('membershipPurpose', {
  state: () => ({
    purposes: [] as CreditPurpose[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPurposes() {
      if (this.purposes.length > 0) return; // ถ้างดึงมาแล้วไม่ต้องดึงซ้ำ
      
      this.isLoading = true;
      this.error = null;
      try {
        const res = await membershipPurposeApi.getPurposes();
        if (res.success) {
          this.purposes = res.data;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch credit purposes';
        console.error('Fetch Purposes Error:', err);
      } finally {
        this.isLoading = false;
      }
    }
  }
});
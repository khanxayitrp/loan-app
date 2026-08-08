import { defineStore } from 'pinia';
import { dashboardApi } from '@/api/dashboard';
import type { PartnerOverview, PartnerTopProduct } from '@/types/dashboard';

export const usePartnerDashboardStore = defineStore('dashboardPartner', {
  state: () => ({
    overview: {
      totalProducts: 0, activeProducts: 0, inactiveProducts: 0
    } as PartnerOverview,

    topMonthly: [] as PartnerTopProduct[],
    topOverall: [] as PartnerTopProduct[],

    isLoading: false,
    error: null as string | null,
    lastFetched: 0 // Cache timestamp
  }),

  getters: {
    // สามารถเพิ่มคำนวณ % การเติบโต หรือ % สินค้าพร้อมขายได้ที่นี่
  },

  actions: {
    async fetchSummary(forceRefresh = false) {
      const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 นาที
      const now = Date.now();

      // ✅ Frontend Cache Logic
      if (!forceRefresh && this.lastFetched > 0 && (now - this.lastFetched < CACHE_DURATION_MS)) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        if (forceRefresh) await dashboardApi.refreshCache(); // บังคับล้าง Backend Cache

        const response = await dashboardApi.fetchPartnerSummary();
        const data = response.data;

        this.overview = data.overview;
        this.topMonthly = data.topMonthly;
        this.topOverall = data.topOverall;

        this.lastFetched = Date.now();
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Partner Dashboard ໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    clearData() {
      this.lastFetched = 0;
    }
  }
});

import { defineStore } from 'pinia';
import { dashboardApi } from '@/api/dashboard';
import type { AdminMetrics, AdminCharts, TopCustomer } from '@/types/dashboard';

export const useAdminDashboardStore = defineStore('dashboardAdmin', {
  state: () => ({
    metrics: {
      totalShops: 0, totalProducts: 0, activeProducts: 0,
      totalRequests: 0, pendingRequests: 0, completedLoans: 0
    } as AdminMetrics,

    charts: {
      topProductsMonth: [], topProductsOverall: [], demographics: { new: 0, repeat: 0 }
    } as AdminCharts,

    topCustomers: [] as TopCustomer[],

    isLoading: false,
    error: null as string | null,
    lastFetched: 0 // Cache timestamp
  }),

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
        if (forceRefresh) await dashboardApi.refreshCache(); // ล้าง Backend Cache ก่อนถ้าโดนบังคับ

        const response = await dashboardApi.fetchAdminSummary();
        const data = response.data;

        this.metrics = data.metrics;
        this.charts = data.charts;
        this.topCustomers = data.topCustomers;

        this.lastFetched = Date.now();
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Admin Dashboard ໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    clearData() {
      this.lastFetched = 0;
    }
  }
});

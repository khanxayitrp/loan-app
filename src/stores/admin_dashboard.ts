import { defineStore } from 'pinia';
import { dashboardApi } from '@/api/dashboard';
// 🌟 1. ອັບເດດ Import ໂດຍເພີ່ມ MonthlyComparison ເຂົ້າມາຈາກໄຟລ໌ types
import type { AdminMetrics, AdminCharts, TopCustomer, MonthlyComparison } from '@/types/dashboard';

// ❌ 2. ລຶບ export interface MonthlyComparison ທີ່ເຄີຍຂຽນໄວ້ຕົ້ນໄຟລ໌ອອກໄປເລີຍ

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
    
    // 🌟 3. ໃຊ້ Type ທີ່ Import ມາໄດ້ເລີຍ
    monthlyComparison: [] as MonthlyComparison[], 

    isLoading: false,
    error: null as string | null,
    lastFetched: 0 // Cache timestamp
  }),

  getters: {
    summary(state) {
      return {
        metrics: state.metrics,
        charts: state.charts,
        topCustomers: state.topCustomers,
        monthlyComparison: state.monthlyComparison
      };
    }
  },

  actions: {
    async fetchSummary(forceRefresh = false) {
      const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 ນາທີ
      const now = Date.now();

      if (!forceRefresh && this.lastFetched > 0 && (now - this.lastFetched < CACHE_DURATION_MS)) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        if (forceRefresh) await dashboardApi.refreshCache();

        const response = await dashboardApi.fetchAdminSummary();
        const data = response.data;

        this.metrics = data.metrics;
        this.charts = data.charts;
        this.topCustomers = data.topCustomers;
        this.monthlyComparison = data.monthlyComparison || [];

        this.lastFetched = Date.now();
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Admin Dashboard ໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    clearData() {
      this.lastFetched = 0;
      this.monthlyComparison = []; 
    }
  }
});
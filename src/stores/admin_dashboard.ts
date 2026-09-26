import { defineStore } from 'pinia';
import { dashboardApi } from '@/api/dashboard';
// เพิ่ม Type (ถ้าสร้างไว้) หรือใช้ any ไปก่อน
import type { AdminMetrics, AdminCharts, TopCustomer, MonthlyComparison, FinancialMetrics } from '@/types/dashboard';

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
    monthlyComparison: [] as MonthlyComparison[], 
    financials: null as FinancialMetrics | any | null, 

    // 🌟 1. เพิ่ม State มารองรับ
    approvalFunnel: null as any | null,
    portfolioHealth: null as any | null,

    isLoading: false,
    error: null as string | null,
    lastFetched: 0 
  }),

  getters: {
    summary(state) {
      return {
        metrics: state.metrics,
        charts: state.charts,
        topCustomers: state.topCustomers,
        monthlyComparison: state.monthlyComparison,
        financials: state.financials,
        approvalFunnel: state.approvalFunnel,     // 🌟 2. เพิ่มใน Getter
        portfolioHealth: state.portfolioHealth    // 🌟 3. เพิ่มใน Getter
      };
    }
  },

  actions: {
    async fetchSummary(forceRefresh = false) {
      const CACHE_DURATION_MS = 5 * 60 * 1000; 
      const now = Date.now();

      if (!forceRefresh && this.lastFetched > 0 && (now - this.lastFetched < CACHE_DURATION_MS)) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        if (forceRefresh) await dashboardApi.refreshCache();

        const response = await dashboardApi.fetchAdminSummary();
        
        // 🌟 ແກ້ໄຂ Error TS2339 ຢູ່ຈຸດນີ້ 🌟
        // ໃຊ້ (response.data as any) ເພື່ອບອກ TypeScript ບໍ່ໃຫ້ກວດສອບຊັ້ນນີ້ຊົ່ວຄາວ 
        // ປ້ອງກັນ Error ເວລາກວດຫາ .data ຊ້ອນກັນ
        const rawData = response.data as any;
        const data = rawData.data ? rawData.data : rawData; 

        this.metrics = data.metrics;
        this.charts = data.charts;
        this.topCustomers = data.topCustomers;
        this.monthlyComparison = data.monthlyComparison || [];
        
        // ດຶງຂໍ້ມູນການເງິນຈາກ API ມາໃສ່ State
        this.financials = data.financials || null; 

        // ດຶງຂໍ້ມູນ Funnel ແລະ Portfolio ຈາກ API ມາໃສ່ State
        this.approvalFunnel = data.approvalFunnel || null;
        this.portfolioHealth = data.portfolioHealth || null;

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
      this.financials = null; 
      // 🌟 5. เคลียร์ข้อมูล
      this.approvalFunnel = null;
      this.portfolioHealth = null;
    }
  }
});
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { reportApi } from '@/api/report';
import type { ReportFilters, DisbursedLoanReportRow, PortfolioHealthReportRow } from '@/types/report';

export const useReportStore = defineStore('report', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 🟢 States ສຳລັບ Report ຕ່າງໆ (ແຍກກັນຊັດເຈນ)
  const disbursedLoans = ref<DisbursedLoanReportRow[]>([]);

  // 🌟 States ສຳລັບ Portfolio Health
  const portfolioHealthRecords = ref<PortfolioHealthReportRow[]>([]);
  const portfolioTotalRecords = ref<number>(0);

  // 🟢 Actions
  const fetchDisbursedLoans = async (filters?: ReportFilters) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await reportApi.getDisbursedLoans(filters);
      disbursedLoans.value = response.data || [];
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍງານ';
      disbursedLoans.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 🌟 Action ສຳລັບ Portfolio Health
  const fetchPortfolioHealthDetails = async (filters?: ReportFilters) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await reportApi.getPortfolioHealthDetails(filters);
      portfolioHealthRecords.value = response.data || [];
      portfolioTotalRecords.value = response.meta?.total || 0; // ຮັບຄ່າ Total ສຳລັບ Pagination
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍລະອຽດໜີ້';
      portfolioHealthRecords.value = [];
      portfolioTotalRecords.value = 0;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    disbursedLoans,
    portfolioHealthRecords,
    portfolioTotalRecords,
    fetchDisbursedLoans,
    fetchPortfolioHealthDetails
  };
});

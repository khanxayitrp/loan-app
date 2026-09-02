// src/stores/report.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { reportApi } from '@/api/report';
import type { ReportFilters, DisbursedLoanReportRow } from '@/types/report';

export const useReportStore = defineStore('report', () => {
  // 🟢 Global States ສຳລັບ Report
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 🟢 Specific Data States ສຳລັບແຕ່ລະ Report
  const disbursedLoans = ref<DisbursedLoanReportRow[]>([]);
  // const collectionData = ref([]); // ສຳລັບ report ອື່ນ

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

  return {
    isLoading,
    error,
    disbursedLoans,
    fetchDisbursedLoans
  };
});

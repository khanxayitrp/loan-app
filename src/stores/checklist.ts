import { defineStore } from 'pinia';
import { ref } from 'vue';
import { checklistApi } from '@/api/checklist';
import type { ChecklistSummary } from '@/types/checklist';

export const useChecklistStore = defineStore('checklist', () => {
  const summaryData = ref<ChecklistSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchSummary = async (loanId: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await checklistApi.getSummary(loanId);
      // คาดหวังว่า Backend จะส่งกลับมาใน format: { success: true, data: { basic_verification: {...}, ... } }
      summaryData.value = response.data?.data || null;
    } catch (err: any) {
      console.error('Error fetching checklist summary:', err);
      error.value = err.response?.data?.message || err.message;
      summaryData.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearData = () => {
    summaryData.value = null;
  };

  return { summaryData, isLoading, error, fetchSummary, clearData };
});


// ไฟล์: src/stores/checklist.ts
import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { checklistApi } from '@/api/checklist';
import type { ChecklistSummary } from '@/types/checklist';

export const useChecklistStore = defineStore('checklist', () => {
  // ==========================================
  // 1. State: ข้อมูลสรุป Checklist (ดึงจาก API)
  // ==========================================
  const summaryData = ref<ChecklistSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ==========================================
  // 2. State: ข้อมูลสำหรับการคำนวณ DSR (Single Source of Truth)
  // ==========================================
  const incomeData = reactive({
    work_salary: 0, // เงินเดือนหลัก (เชื่อมกับ Tab 1)
    other_verified_income: 0,
    estimated_living_expenses: 0,
    existing_debt_payments: 0,
    internal_active_installments: 0,
    proposed_installment: 0,
    max_approved_amount: 0
  });

  // ==========================================
  // 3. Getters (Computed): คำนวณ DSR และรายรับอัตโนมัติ
  // ==========================================
  const totalVerifiedIncome = computed(() => {
    return Number(incomeData.work_salary) + Number(incomeData.other_verified_income);
  });

  const totalDebtBurden = computed(() => {
    return Number(incomeData.existing_debt_payments) + 
           Number(incomeData.internal_active_installments) + 
           Number(incomeData.proposed_installment);
  });

  const dsrPercentage = computed(() => {
    const income = totalVerifiedIncome.value;
    return income > 0 ? (totalDebtBurden.value / income) * 100 : 0;
  });

  // ==========================================
  // 4. Actions: ฟังก์ชันจัดการข้อมูล
  // ==========================================
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

  const updateIncomeData = (data: Partial<typeof incomeData>) => {
    // ป้องกันไม่ให้ค่า internal_active_installments ถูกเขียนทับโดยบังเอิญ หากไม่ใช่การตั้งใจ
    if (data.internal_active_installments !== undefined) {
       incomeData.internal_active_installments = data.internal_active_installments;
    }
    Object.assign(incomeData, data);
  };

  const resetIncomeData = () => {
    Object.assign(incomeData, {
      work_salary: 0,
      other_verified_income: 0,
      estimated_living_expenses: 0,
      existing_debt_payments: 0,
      internal_active_installments: 0,
      proposed_installment: 0,
      max_approved_amount: 0
    });
  };

  const clearData = () => {
    summaryData.value = null;
    resetIncomeData(); // 🟢 ล้างข้อมูลคำนวณ DSR ด้วยเมื่อเคลียร์ Data
  };

  // ==========================================
  // 5. ส่งออก (Return) ตัวแปรและฟังก์ชันทั้งหมดไปให้ Component ใช้งาน
  // ==========================================
  return { 
    // State 
    summaryData, isLoading, error, incomeData, 
    // Computed (Getters)
    totalVerifiedIncome, totalDebtBurden, dsrPercentage, 
    // Actions
    fetchSummary, updateIncomeData, resetIncomeData, clearData 
  };
});

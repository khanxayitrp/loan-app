import apiClient from './apiclient';
import type { AdminLoanSnapshot } from '../types/admin-loan';

export const adminLoanApi = {
  async getLoanDetails(loanIdStr: string) {
    const response = await apiClient.get<{ success: boolean; data: AdminLoanSnapshot }>(
      `/admin/loan-override/${loanIdStr}`
    );
    return response.data;
  },

  // 🌟 FIX 1: เปลี่ยน Type เป็น FormData
  async executeOverride(loanId: number, formData: FormData) {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/admin/loan-override/${loanId}`,
      formData,
      {
        // 🌟 KEY FIX: บังคับเคลียร์ Content-Type เพื่อให้ Browser เป็นคนสร้าง Boundary อัตโนมัติ
        headers: {
          'Content-Type': undefined
        }
      }
    );
    return response.data;
  }
};

import apiClient from './apiclient';
import type { AdminDashboardResponse, PartnerDashboardResponse } from '@/types/dashboard';

export const dashboardApi = {
  /** ดึงข้อมูลสำหรับ Admin / Staff */
  fetchAdminSummary: async (): Promise<AdminDashboardResponse> => {
    const response = await apiClient.get<AdminDashboardResponse>('/dashboard/summary');
    return response.data;
  },

  /** ดึงข้อมูลสำหรับ Partner (ร้านค้า) */
  fetchPartnerSummary: async (): Promise<PartnerDashboardResponse> => {
    const response = await apiClient.get<PartnerDashboardResponse>('/dashboard/partner/summary');
    return response.data;
  },

  /** บังคับล้าง Cache ที่ฝั่ง Backend */
  refreshCache: async (): Promise<void> => {
    await apiClient.post('/dashboard/refresh');
  }
};


import apiClient from './apiclient';
import type { CreditPurposeResponse } from '../types/membership-purpose';

export const membershipPurposeApi = {
  // ดึงข้อมูล Master Data สำหรับจุดประสงค์การขอสินเชื่อ
  getPurposes: async (): Promise<CreditPurposeResponse> => {
    const response = await apiClient.get('/membership-purposes');
    return response.data;
  }
};

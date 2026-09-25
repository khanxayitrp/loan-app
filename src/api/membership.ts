
import apiClient from './apiclient';
import type { FetchApplicationsParams, FetchApplicationsResponse } from '@/types/membership';

export const fetchApplicationsAPI = async (params: FetchApplicationsParams): Promise<FetchApplicationsResponse> => {
  const response = await apiClient.get('/membership/applications', { params });
  return response.data;
};

// ສຳລັບອັບເດດສະຖານະ KYC ຫຼາຍລາຍການພ້ອມກັນ (ຖ້າ Backend ຮອງຮັບ)
export const updateKycStatusBulkAPI = async (ids: number[], status: string) => {
  const response = await apiClient.patch('/customer/kyc/status', { ids, status });
  return response.data;
};

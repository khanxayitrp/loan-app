import apiClient from './apiclient';

export const addressApi = {
  // GET /provinces
  getProvinces: () => apiClient.get('/address/provinces'),
  
  // GET /provinces/:provinceId/districts
  getDistricts: (provinceId: string) => apiClient.get(`/address/provinces/${provinceId}/districts`)
};
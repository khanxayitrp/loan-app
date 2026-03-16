import apiClient from './apiclient'

export const checklistApi = {
  getSummary(loanId: number) {
    return apiClient.get(`/checklist/summary/${loanId}`);
  },
  saveBasic(loanId: number, data: any) {
    return apiClient.post(`/checklist/basic/${loanId}`, data);
  },
  saveCalls(loanId: number, data: any) {
    return apiClient.post(`/checklist/call/${loanId}`, data);
  },
  saveCIB(loanId: number, data: any) {
    return apiClient.post(`/checklist/cib/${loanId}`, data);
  },
  saveFieldVisits(loanId: number, data: any) {
    return apiClient.post(`/checklist/field/${loanId}`, data);
  },
  saveIncome(loanId: number, data: any) {
    return apiClient.post(`/checklist/income-assessment/${loanId}`, data);
  }
};


// src/api/report.ts
import apiClient from './apiclient';
import type { ReportFilters, ReportResponse, DisbursedLoanReportRow, PortfolioHealthReportRow } from '@/types/report';

export const reportApi = {
  // 1. ລາຍງານການປ່ອຍສິນເຊື່ອ
  getDisbursedLoans(params?: ReportFilters): Promise<ReportResponse<DisbursedLoanReportRow>> {
    return apiClient.get('/reports/disbursed-loans', { params }).then(res => res.data);
  },

  // 🌟 2. ລາຍງານຄຸນນະພາບພອດສິນເຊື່ອ (Pagination Supported)
  getPortfolioHealthDetails(params?: ReportFilters): Promise<ReportResponse<PortfolioHealthReportRow>> {
    return apiClient.get('/reports/portfolio-health-details', { params }).then(res => res.data);
  }
  // getCollectionReport(params?: ReportFilters): Promise<ReportResponse<any>> {
  //   return apiClient.get('/reports/collections', { params }).then(res => res.data);
  // }
};


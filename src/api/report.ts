// src/api/report.ts
import apiClient from './apiclient';
import type { ReportFilters, ReportResponse, DisbursedLoanReportRow } from '@/types/report';

export const reportApi = {
  // 1. ລາຍງານການປ່ອຍສິນເຊື່ອ
  getDisbursedLoans(params?: ReportFilters): Promise<ReportResponse<DisbursedLoanReportRow>> {
    return apiClient.get('/reports/disbursed-loans', { params }).then(res => res.data);
  },

  // 2. ລາຍງານອື່ນໆໃນອະນາຄົດ ສາມາດເພີ່ມຕໍ່ລົງມາໄດ້ເລີຍ ເຊັ່ນ:
  // getCollectionReport(params?: ReportFilters): Promise<ReportResponse<any>> {
  //   return apiClient.get('/reports/collections', { params }).then(res => res.data);
  // }
};

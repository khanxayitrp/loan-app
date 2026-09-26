// ==========================================
// 🛡️ Admin Dashboard Interfaces
// ==========================================
export interface AdminMetrics {
  totalShops: number;
  totalProducts: number;
  activeProducts: number;
  totalRequests: number;
  pendingRequests: number;
  completedLoans: number;
}

export interface AdminCharts {
  topProductsMonth: { name: string; count: number }[];
  topProductsOverall: { name: string; count: number }[];
  demographics: { new: number; repeat: number };
}

export interface TopCustomer {
  name: string;
  contracts: number;
  total: string; // e.g., "120M LAK"
}

export interface MonthlyComparison {
  month: string;       // e.g., "2026-08"
  requests: number;    // จำนวนคำขอทั้งหมด
  disbursed: number;   // จำนวนที่ปล่อยสำเร็จ
}

// 🌟 1. ສ້າງ Interface ໃໝ່ສຳລັບຂໍ້ມູນການເງິນ
export interface FinancialMetrics {
  totalDisbursed: number;
  totalRepayment: number;
  totalOutstanding: number;
  totalOverdue: number;
  nplRatio: string | number; // ຮອງຮັບທັງ String ("0.00") ແລະ Number
}

// ເພີ່ມເຂົ້າໄປໃນໄຟລ໌ types ຂອງທ່ານ
export interface PortfolioHealth {
  current: number;
  overdue1to30: number;
  overdue31to90: number;
  npl: number;
}

export interface ApprovalFunnel {
  totalApplied: number;
  preApproved: number;
  approved: number;
  disbursed: number;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  charts: AdminCharts;
  topCustomers: TopCustomer[];
  monthlyComparison: MonthlyComparison[];
  financials: FinancialMetrics; // 🌟 2. ເພີ່ມ Property ນີ້ເຂົ້າໄປໃນ Payload ຫຼັກ
  portfolioHealth: PortfolioHealth;
  approvalFunnel: ApprovalFunnel;
}

export interface AdminDashboardResponse {
  success: boolean;
  source: string;
  data: AdminDashboardData;
}

// ==========================================
// 🛡️ Partner Dashboard Interfaces
// ==========================================
export interface PartnerOverview {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

export interface PartnerTopProduct {
  name: string;
  brand?: string;
  status?: string;
  count: number;
}

export interface PartnerDashboardData {
  overview: PartnerOverview;
  topMonthly: PartnerTopProduct[];
  topOverall: PartnerTopProduct[];
}

export interface PartnerDashboardResponse {
  success: boolean;
  source: string;
  data: PartnerDashboardData;
}
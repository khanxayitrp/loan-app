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

// 🌟 เพิ่ม Interface สำหรับตารางเปรียบเทียบรายเดือน
export interface MonthlyComparison {
  month: string;       // e.g., "2026-08"
  requests: number;    // จำนวนคำขอทั้งหมด
  disbursed: number;   // จำนวนที่ปล่อยสำเร็จ
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  charts: AdminCharts;
  topCustomers: TopCustomer[];
  monthlyComparison: MonthlyComparison[]; // 🌟 เพิ่มตัวแปรนี้เข้าไปใน Payload หลัก
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
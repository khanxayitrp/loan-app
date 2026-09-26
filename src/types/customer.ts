
export interface CustomerLocation {
  id: number;
  customer_id: number;
  location_type: 'home' | 'work' | 'other';
  address: string;
  map_url: string;
  latitude?: number;
  longitude?: number;
  is_primary: number;
}

export interface CustomerQueryParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  cursor?: number;
  limit?: number;
}

// 🟢 เพิ่ม Interface สำหรับ DTO บัตรสมาชิก
export interface MemberCardDTO {
  id: number;
  member_code: string;
  first_name: string;
  last_name?: string;
  gender?: 'Female' | 'Male';
  date_of_birth?: string;
  profile_image_url?: string;
  card_issue_at?: string;
  card_expire_at?: string;
  membership_tier?: {
    tier_name: string;
  };
  customer_credit?: {
    credit_limit: number | string;
  };
}


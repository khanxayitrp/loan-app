
export interface MembershipApplication {
  id: number;
  application_no: string;
  customer_id: number;
  requested_credit_limit: number;
  purpose_id?: number;
  usage_goal?: string;
  requested_product_type?: string;
  remarks?: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    identity_number?: string;
    kyc_status: string;
    profile_image_url?: string;
  };
  purpose?: {
    purpose_name: string;
  };
}

export interface FetchApplicationsParams {
  search?: string;
  status?: string;
  cursor?: number | null;
  limit?: number;
}

export interface FetchApplicationsResponse {
  success: boolean;
  message: string;
  data: MembershipApplication[];
  meta: {
    total: number;
    limit: number;
    nextCursor: number | null;
    hasNextPage: boolean;
  };
}

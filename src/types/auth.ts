// src/types/auth.ts
export interface User {
  id: number
  username: string
  full_name: string
  role: 'admin' | 'staff' | 'partner' | 'customer'
  staff_level?: 'requester' | 'approver' | 'none'
  is_active?: number
  created_at?: string
  updated_at?: string
}


/**
 * Token สำหรับการ authenticate
 */
export interface Tokens {
  access: {
    token: string
    expires: string // ISO string
  }
  refresh: {
    token: string
    expires: string
  }
}

/**
 * Response ตอน login สำเร็จ
 */
export interface SignInResponse {
  user: User
  tokens: Tokens
  permissions: string[] // เช่น ['view_dashboard', 'create_loan', ...]
}


export interface SignInRequest {
  username: string
  password: string
}

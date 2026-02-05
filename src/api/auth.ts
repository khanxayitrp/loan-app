// src/api/auth.ts
import apiClient from '@/api/apiclient'
import type {
  SignInRequest,
  SignInResponse,
  User,
  CurrentUserResponse
} from '@/types/auth'

/**
 * Login user and get authentication tokens with permissions
 * @param credentials - Username and password
 * @returns User data, tokens, and permissions array
 */
export const signIn = async (credentials: SignInRequest): Promise<SignInResponse> => {
  const response = await apiClient.post<SignInResponse>('/auth/login', credentials)
  return response.data
}

/**
 * Get current user info (ใช้ token จาก cookies)
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await apiClient.get<CurrentUserResponse>('/auth/me')
  return response.data
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token to exchange for new tokens
 * @returns New access and refresh tokens
 */
// export const refreshTokens = async (refreshToken: string): Promise<Tokens> => {
//   const response = await apiClient.post<{ tokens: Tokens }>('/auth/refresh', {
//     refreshToken
//   })
//   return response.data.tokens
// }

/**
 * Logout user (invalidate refresh token on server)
 * @returns Success message
 */
export const signOut = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/logout')
  return response.data
}

/**
 * Customer signup (public endpoint - no authentication required)
 * @param userData - Customer registration data
 * @returns Success message and optional user data
 */
export const signUp = async (userData: {
  username: string
  password: string
  email: string
  // Add other customer fields as needed based on your backend
}): Promise<{ message: string; user?: User }> => {
  const response = await apiClient.post<{ message: string; user?: User }>('/auth/signup', userData)
  return response.data
}

/**
 * Register new user (admin/staff only - requires authentication)
 * @param userData - New user registration data with role
 * @returns Success message and created user data
 */
// export const registerUser = async (userData: {
//   username: string
//   password: string
//   role: 'admin' | 'staff' | 'partner'
//   full_name: string
//   staff_level?: 'requester' | 'approver' | 'none'
//   // Add other required fields based on your backend
// }): Promise<{ message: string; user: User }> => {
//   const response = await apiClient.post<{ message: string; user: User }>('/auth/register', userData)
//   return response.data
// }
// src/api/auth.ts
export const registerUser = async (userData: {
  username: string
  password: string
  role: 'admin' | 'staff' | 'partner' | 'customer'
  full_name: string
  staff_level?: 'requester' | 'approver' | 'none'
}): Promise<{ message: string; user: User }> => {
  try {
    console.log('REGISTER → Sending request with data:', userData)

    const response = await apiClient.post<{ message: string; user: User }>('/auth/register', userData)

    console.log('REGISTER → Response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('REGISTER → error caught', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    })

    // ✅ แสดง error message จาก backend
    const errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        'เกิดข้อผิดพลาดในการสร้างผู้ใช้'

    throw new Error(errorMessage)
  }
}

/**
 * Change current user's password
 * @param passwordData - Old and new password
 * @returns Success message
 */
export const changePassword = async (passwordData: {
  oldPassword: string
  newPassword: string
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/change-password', passwordData)
  return response.data
}

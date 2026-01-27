// src/api/auth.ts
import apiClient from '@/api/apiclient'
import type {
  SignInRequest,
  SignInResponse,
  User,
  Tokens
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
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token to exchange for new tokens
 * @returns New access and refresh tokens
 */
export const refreshTokens = async (refreshToken: string): Promise<Tokens> => {
  const response = await apiClient.post<{ tokens: Tokens }>('/auth/refresh', {
    refreshToken
  })
  return response.data.tokens
}

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
export const registerUser = async (userData: {
  username: string
  password: string
  role: 'admin' | 'staff' | 'partner'
  full_name: string
  // Add other required fields based on your backend
}): Promise<{ message: string; user: User }> => {
  const response = await apiClient.post<{ message: string; user: User }>('/auth/register', userData)
  return response.data
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

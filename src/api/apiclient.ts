// src/api/client.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:15520/api',
  timeout: 10000,
   withCredentials: true, // ⭐ สำคัญมาก! ส่ง cookies ไปทุก request
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: เพิ่ม token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: จัดการ 401, 403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุ → logout
      const authStore = useAuthStore()
      authStore.signOut()
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      // ไม่มีสิทธิ์ → redirect ไป unauthorized
      window.location.href = '/unauthorized'
    }
    return Promise.reject(error)
  }
)

export default apiClient

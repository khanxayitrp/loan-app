// src/api/client.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true, // ⭐ สำคัญมาก! ส่ง cookies ไปทุก request
  headers: {
    'Content-Type': 'application/json'
  }
})

// ==========================================
// 🟢 Variables สำหรับจัดการ Token Refresh Queue
// ==========================================
let isRefreshing = false;
let failedQueue: any[] = [];

// ฟังก์ชันสำหรับเคลียร์คิวที่รออยู่
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// 🟢 Request Interceptor
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error) => Promise.reject(error)
)

// ==========================================
// 🟢 Response Interceptor
// ==========================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // จัดการกรณี 401 Unauthorized (Access Token หมดอายุ หรือ ไม่มีสิทธิ์)
    if (error.response?.status === 401 && !originalRequest._retry) {

      // 🌟 1. ด่านสกัดกั้น (ตัวแก้ปัญหาหน้า Refresh!):
      // ถ้ายิง API เข้าสู่ระบบ (login/signin) แล้วรหัสผิด ให้โยน Error กลับไปโชว์ที่หน้าเว็บเลย
      const url = originalRequest.url?.toLowerCase() || '';
      if (url.includes('/login') || url.includes('/signin')) {
        return Promise.reject(error);
      }

      // ❌ 2. หลีกเลี่ยง Loop อนันต์: ถ้าเรียก Logout หรือ Refresh แล้วยังได้ 401 ให้เตะออกเลย
      if (url.includes('/auth/logout') || url.includes('/auth/refresh')) {
        const authStore = useAuthStore()
        authStore.signOut()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // 🟡 3. ถ้ามี API อื่นกำลัง Refresh Token อยู่ ให้ API เส้นนี้ "หยุดรอ" (เข้าคิว)
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // พอมัน Refresh เสร็จ ก็ให้ยิง Request เดิมที่พังไปเมื่อกี้ใหม่อีกครั้ง
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // 🟢 4. ถ้ายังไม่มีใคร Refresh ให้ API เส้นนี้เป็น "ตัวเปิด"
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🚀 ยิง API ไปขอ Token ใหม่
        // (ใช้ axios เปล่าๆ ไม่ใช้ apiClient เพื่อไม่ให้มันมาเข้า interceptor นี้ซ้ำ)
        await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {}, {
          withCredentials: true
        });

        // ✅ Refresh สำเร็จ!
        isRefreshing = false;

        // ปล่อยคิว API อื่นๆ ที่รออยู่ให้ทำงานต่อ
        processQueue(null);

        // ยิง Request ของตัวมันเองซ้ำอีกครั้ง
        return apiClient(originalRequest);

      } catch (refreshError) {
        // 🔴 Refresh ไม่สำเร็จ (แปลว่า Refresh Token ก็หมดอายุ หรือโดนเตะจริง)
        isRefreshing = false;
        processQueue(refreshError);

        // บังคับ Logout ของจริง
        const authStore = useAuthStore();
        authStore.signOut();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // จัดการกรณี 403 Forbidden (มี Token แต่สิทธิ์ไม่ถึง)
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Utility function to handle API errors in components
export const handleApiError = (error: any, fallbackMessage = 'ເກີດຂໍ້ຜິດພາດ') => {
  if (error?.message) {
    return error.message
  }

  if (error?.errors) {
    const firstError = Object.values(error.errors)[0]
    return Array.isArray(firstError) ? firstError[0] : firstError
  }

  return fallbackMessage
}
